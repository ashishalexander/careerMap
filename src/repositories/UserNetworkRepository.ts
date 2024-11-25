import { IUser, UserModel } from '../models/userModel';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IUserNetworkRepository,IConnectionRequest } from './interfaces/IUserNetworkRepository'; // Define this interface if not already present
import { Types } from 'mongoose';

export class UserNetworkRepository implements IUserNetworkRepository {

    /**
 * Fetches the pending connection requests for a user.
 * 
 * @param userId - The ID of the user whose pending requests are to be fetched.
 * @returns A Promise that resolves to an array of connection requests with user details.
 */
    async getPendingRequests(userId: string): Promise<any> {
        try {
          // Find the user by ID and populate the requestsReceived array with user details
          const user = await UserModel.findById(userId)
            .populate({
              path: 'Network.pendingRequestsReceived', // Path to the requestsReceived array
              select: 'userId sentAt', // Only select the necessary fields for the request
              populate: {
                path: 'userId',  // Populating the userId reference to get user data
                select: 'firstName lastName profile.profilePicture profile.location profile.company profile.headline'  // Fields to include from the user model
              }
            })
            .exec();
      
          if (!user) {
            throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
          }
      
          // Directly return the populated array
          return user.Network.pendingRequestsReceived;
        } catch (error) {
          console.error('Error fetching pending requests in UserNetworkRepository:', error);
          throw new CustomError('Failed to fetch pending connection requests', HttpStatusCodes.INTERNAL_SERVER_ERROR);
        }
      }
//   /**
//    * Sends a connection request from one user to another.
//    * 
//    * @param fromUserId - The ID of the user sending the request.
//    * @param toUserId - The ID of the user receiving the request.
//    */
//   async sendConnectionRequest(fromUserId: string, toUserId: string): Promise<void> {
//     try {
//       const toUser = await UserModel.findById(toUserId).exec();
//       const fromUser = await UserModel.findById(fromUserId).exec();

//       if (!toUser || !fromUser) {
//         throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
//       }

//       // Check if a connection request already exists or users are already connected
//       if (
//         toUser.network.requestsReceived.includes(fromUserId) ||
//         toUser.network.connections.includes(fromUserId)
//       ) {
//         throw new CustomError('Connection request already exists or users are already connected', HttpStatusCodes.CONFLICT);
//       }

//       toUser.network.requestsReceived.push(new Types.ObjectId(fromUserId));
//       fromUser.network.requestsSent.push(new Types.ObjectId(toUserId));

//       await Promise.all([toUser.save(), fromUser.save()]);
//     } catch (error) {
//       console.error('Error sending connection request:', error);
//       throw new CustomError('Failed to send connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
//     }
//   }

//   /**
//    * Accepts a connection request.
//    * 
//    * @param userId - The ID of the user accepting the request.
//    * @param requesterId - The ID of the user who sent the request.
//    */
//   async acceptConnectionRequest(userId: string, requesterId: string): Promise<void> {
//     try {
//       const user = await UserModel.findById(userId).exec();
//       const requester = await UserModel.findById(requesterId).exec();

//       if (!user || !requester) {
//         throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
//       }

//       // Ensure the request exists
//       if (!user.network.requestsReceived.includes(requesterId)) {
//         throw new CustomError('Connection request not found', HttpStatusCodes.BAD_REQUEST);
//       }

//       // Update connections
//       user.network.requestsReceived = user.network.requestsReceived.filter(
//         (id) => id.toString() !== requesterId
//       );
//       requester.network.requestsSent = requester.network.requestsSent.filter(
//         (id) => id.toString() !== userId
//       );

//       user.network.connections.push(new Types.ObjectId(requesterId));
//       requester.network.connections.push(new Types.ObjectId(userId));

//       await Promise.all([user.save(), requester.save()]);
//     } catch (error) {
//       console.error('Error accepting connection request:', error);
//       throw new CustomError('Failed to accept connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
//     }
//   }

//   /**
//    * Rejects a connection request.
//    * 
//    * @param userId - The ID of the user rejecting the request.
//    * @param requesterId - The ID of the user who sent the request.
//    */
//   async rejectConnectionRequest(userId: string, requesterId: string): Promise<void> {
//     try {
//       const user = await UserModel.findById(userId).exec();
//       const requester = await UserModel.findById(requesterId).exec();

//       if (!user || !requester) {
//         throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
//       }

//       // Remove the request
//       user.network.requestsReceived = user.network.requestsReceived.filter(
//         (id) => id.toString() !== requesterId
//       );
//       requester.network.requestsSent = requester.network.requestsSent.filter(
//         (id) => id.toString() !== userId
//       );

//       await Promise.all([user.save(), requester.save()]);
//     } catch (error) {
//       console.error('Error rejecting connection request:', error);
//       throw new CustomError('Failed to reject connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
//     }
//   }

//   /**
//    * Removes a connection.
//    * 
//    * @param userId - The ID of the user removing the connection.
//    * @param connectionId - The ID of the user being removed.
//    */
//   async removeConnection(userId: string, connectionId: string): Promise<void> {
//     try {
//       const user = await UserModel.findById(userId).exec();
//       const connection = await UserModel.findById(connectionId).exec();

//       if (!user || !connection) {
//         throw new CustomError('User not found', HttpStatusCodes.NOT_FOUND);
//       }

//       // Remove the connection from both users
//       user.network.connections = user.network.connections.filter(
//         (id) => id.toString() !== connectionId
//       );
//       connection.network.connections = connection.network.connections.filter(
//         (id) => id.toString() !== userId
//       );

//       await Promise.all([user.save(), connection.save()]);
//     } catch (error) {
//       console.error('Error removing connection:', error);
//       throw new CustomError('Failed to remove connection', HttpStatusCodes.INTERNAL_SERVER_ERROR);
//     }
//   }
}
