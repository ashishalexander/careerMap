import { IUser, UserModel } from '../models/userModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IUserNetworkRepository,IConnectionRequest, ISuggestionsData } from './interfaces/IUserNetworkRepository'; // Define this interface if not already present
import mongoose, { now, Types } from 'mongoose';
import { BaseRepository } from './baseRepository';
import { connected } from 'process';
export class UserNetworkRepository extends BaseRepository<IUser> implements IUserNetworkRepository {

    
        constructor() {
          super(UserModel); // Pass the UserModel to the BaseRepository
        }

    /**
 * Fetches the pending connection requests for a user.
 * 
 * @param userId - The ID of the user whose pending requests are to be fetched.
 * @returns A Promise that resolves to an array of connection requests with user details.
 */
    async getPendingRequests(userId: string): Promise<any> {
      try {
        // Convert userId to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
    
        // Use aggregation to fetch pending requests
        const pendingRequests = await UserModel.aggregate([
          // Match the specific user
          { $match: { _id: userObjectId } },
          
          // Unwind the pendingRequestsReceived array
          { $unwind: '$Network.pendingRequestsReceived' },
          
          // Lookup to join with the User collection
          {
            $lookup: {
              from: 'users', // Typically the collection name is lowercase and pluralized
              localField: 'Network.pendingRequestsReceived.userId',
              foreignField: '_id',
              as: 'requestUserDetails'
            }
          },
          
          // Unwind the looked up user details
          { $unwind: '$requestUserDetails' },
          
          // Project (reshape) the results
          {
            $project: {
              _id: '$Network.pendingRequestsReceived._id',
              userId: '$requestUserDetails._id',
              firstName: '$requestUserDetails.firstName',
              lastName: '$requestUserDetails.lastName',
              profilePicture: '$requestUserDetails.profile.profilePicture',
              headline: '$requestUserDetails.profile.headline',
              location: '$requestUserDetails.profile.location',
              company: '$requestUserDetails.profile.company',
              sentAt: '$Network.pendingRequestsReceived.sentAt'
            }
          }
        ]);
    
       return {requests:pendingRequests}
      } catch (error) {
        console.error('Error fetching pending requests in UserNetworkRepository:', error);
        throw new CustomError('Failed to fetch pending connection requests', HttpStatusCodes.INTERNAL_SERVER_ERROR);
      }
    }
      async getSuggestions(userId: string, page: number, search: string): Promise<ISuggestionsData> {
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
    
        try {
            const user = await UserModel.findById(userId).exec();
            if (!user) {
                throw new Error("User not found");
            }
            const excludeIds = [
                ...user.Network.connections.map((conn) => conn.userId?.toString()),
                ...user.Network.pendingRequestsReceived.map((req) => req.userId?.toString()),
                ...user.Network.pendingRequestsSent.map((req) => req.userId?.toString()),
                
                userId,
            ];
    
            const searchCriteria: any[] = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { 'profile.headline': { $regex: search, $options: "i" } },
                { 'profile.company': { $regex: search, $options: "i" } },
                { 'profile.location': { $regex: search, $options: "i" } }
            ];
    
            const suggestions = await UserModel.aggregate([
                {
                    $match: {
                        _id: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) },
                        $or: search 
                            ? searchCriteria 
                            : [{ _id: { $exists: true } }]
                    }
                },
                {
                    $project: {
                        _id: 1,
                        firstName: '$firstName',
                        lastName: '$lastName',
                        'profile.headline': 1,
                        'profile.profilePicture': 1,
                        'profile.bannerImage': 1,
                        'profile.location': 1,
                        'profile.company': 1,
                        matchScore: {
                            $add: [
                                // Headline match (highest priority)
                                search ? {
                                    $cond: [
                                        { $regexMatch: { 
                                            input: '$profile.headline', 
                                            regex: new RegExp(search, 'i') 
                                        }},
                                        20, 
                                        0
                                    ]
                                } : 0,
                                
                                // Name match
                                search ? {
                                    $add: [
                                        { $cond: [
                                            { $regexMatch: { 
                                                input: '$firstName', 
                                                regex: new RegExp(search, 'i') 
                                            }},
                                            10, 
                                            0
                                        ]},
                                        { $cond: [
                                            { $regexMatch: { 
                                                input: '$lastName', 
                                                regex: new RegExp(search, 'i') 
                                            }},
                                            10, 
                                            0
                                        ]}
                                    ]
                                } : 0,
    
                                // Company match
                                search ? {
                                    $cond: [
                                        { $regexMatch: { 
                                            input: '$profile.company', 
                                            regex: new RegExp(search, 'i') 
                                        }},
                                        15, 
                                        0
                                    ]
                                } : 0,
    
                                // Location match
                                search ? {
                                    $cond: [
                                        { $regexMatch: { 
                                            input: '$profile.location', 
                                            regex: new RegExp(search, 'i') 
                                        }},
                                        15, 
                                        0
                                    ]
                                } : 0
                            ]
                        }
                    }
                },
                { $sort: { matchScore: -1 } },
                { $skip: skip },
                { $limit: pageSize }
            ]).exec();
    
            const totalSuggestions = await UserModel.countDocuments({
                _id: { $nin: excludeIds.map(id => new mongoose.Types.ObjectId(id)) },
                $or: search 
                    ? searchCriteria 
                    : [{ _id: { $exists: true } }]
            }).exec();
    
            return {
                suggestions: suggestions.map(suggestion => ({
                    _id:suggestion._id,
                    firstName: suggestion.firstName,
                    lastName: suggestion.lastName,
                    profile: {
                        headline: suggestion.profile.headline,
                        profilePicture: suggestion.profile.profilePicture,
                        bannerImage: suggestion.profile.bannerImage,
                        location: suggestion.profile.location,
                        company: suggestion.profile.company,
                    }
                })),
                nextPage: totalSuggestions > page * pageSize ? page + 1 : null,
                total: totalSuggestions
            };
        } catch (error) {
            console.error("Error in UserNetworkRepository while fetching suggestions:", error);
            throw new Error("Failed to fetch suggestions");
        }
    }

     // Update the status of a request (accept/reject)
  async updateRequestStatus(requestId: string, status: string): Promise<any> {
    try {
      const result = await UserModel.updateOne(
        { 'Network.pendingRequestsReceived._id': new mongoose.Types.ObjectId(requestId) },
        { $set: { 'Network.pendingRequestsReceived.$.status': status } }
      );
      
      if (result.modifiedCount === 0) {
        throw new CustomError('Request status update failed', HttpStatusCodes.INTERNAL_SERVER_ERROR);
      }

      return result;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw new CustomError('Error updating request status', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


     // Add a pending connection request
     async addPendingRequest(userId: string, requestedUserId: string): Promise<{ success: boolean; message: string }> {
        try {
          // Add the request to the sender's pendingRequestsSent array
          const senderUpdateResult = await this.model.updateOne(
            { _id: userId },
            { $push: { 'Network.pendingRequestsSent': { userId: requestedUserId, sentAt: new Date() } } }
          );
      
          // Add the request to the receiver's pendingRequestsReceived array
          const receiverUpdateResult = await this.model.updateOne(
            { _id: requestedUserId },
            { $push: { 'Network.pendingRequestsReceived': { userId: userId, sentAt: new Date() } } }
          );
      
          // Check if both updates were successful
          if (senderUpdateResult.modifiedCount > 0 && receiverUpdateResult.modifiedCount > 0) {
            return { success: true, message: 'Pending request added successfully' };
          } else {
            throw new Error('Failed to update one or both user network records');
          }
        } catch (error:any) {
          throw new CustomError(
            `Error adding pending request: ${error.message || error}`,
            HttpStatusCodes.INTERNAL_SERVER_ERROR
          );
        }
      }

      async getRequestById(requestId: string, userId: string): Promise<any | null> {
        try {
          // Find the user by userId (who received the request)
          const user = await UserModel.findOne({
            _id: new mongoose.Types.ObjectId(userId),
          }).select('Network.pendingRequestsReceived');
      
          if (!user) {
            return null;
          }
      
          // Look for the request in the received requests (this is the user's received request)
          const receivedRequest = user.Network.pendingRequestsReceived.find(
            (req: any) => req._id.toString() === requestId
          );
      
          // If the request is not found, return null
          return receivedRequest || null;
        } catch (error) {
          console.error('Error fetching connection request by ID and user ID:', error);
          throw new CustomError('Error fetching connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
      }


      // Repository method to remove the request from pending lists
async removePendingRequest(userId: string, requestId: string): Promise<void> {
    try {
      // Update the user document to remove the request from both sent and received lists
      await UserModel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        {
          $pull: {
            'Network.pendingRequestsSent': { _id: new mongoose.Types.ObjectId(requestId) },
            'Network.pendingRequestsReceived': { _id: new mongoose.Types.ObjectId(requestId) }
          }
        }
      );
    } catch (error) {
      console.error('Error removing pending request:', error);
      throw new CustomError('Failed to remove pending request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async addConnection(userId: string, connectionId: string): Promise<void> {
    try {
      // Add the connectionId to the user's connections array
      await UserModel.updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        {
          $addToSet: {
            'Network.connections':{
              userId: new mongoose.Types.ObjectId(connectionId),
              connectedAt: new Date()
            } 
          },
        }
      );
    } catch (error) {
      console.error('Error adding connection:', error);
      throw new CustomError('Failed to add connection', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
    

}
