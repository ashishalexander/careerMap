import { IConnectionRequest, IUserNetworkRepository } from '../repositories/interfaces/IUserNetworkRepository';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';
import { IUserNetworkService } from './interfaces/IUserNetworkService';

export class UserNetworkService implements IUserNetworkService {
  constructor(private userNetworkRepository: IUserNetworkRepository) {}

  /**
   * Fetch pending connection requests for a user.
   *
   * @param userId - The user ID whose pending requests are to be fetched.
   * @returns A Promise that resolves to an array of connection requests.
   */
  async getPendingRequests(userId: string): Promise<IConnectionRequest[]> {
    try {
      return await this.userNetworkRepository.getPendingRequests(userId);
    } catch (error) {
      console.error('Error in UserNetworkService while fetching pending requests:', error);
      throw new CustomError('Failed to fetch pending requests', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async getSuggestions(userId: string, page: number, search: string): Promise<any> {
    try {
      const suggestions = await this.userNetworkRepository.getSuggestions(userId, page, search);
      return suggestions;
    } catch (error) {
      console.error("Error in UserNetworkService while fetching suggestions:", error);
      throw new CustomError("Failed to fetch suggestions", HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
   // Connect to another user
   async connect(userId: string, RequserId: string): Promise<any> {
    try {
      // Fetch both users to check if they exist
      const user = await this.userNetworkRepository.findById(userId);
      const requestedUser = await this.userNetworkRepository.findById(RequserId);

      if (!user || !requestedUser) {
        throw new CustomError("User(s) not found", HttpStatusCodes.NOT_FOUND);
      }

      // Check if the users are already connected
      const isAlreadyConnected = user.Network.connections.some(
        connection => connection?.userId?.toString() === RequserId
      );

      if (isAlreadyConnected) {
        throw new CustomError("Users are already connected", HttpStatusCodes.BAD_REQUEST);
      }

      // Check if the user is blocked
      if (user.isblocked || requestedUser.isblocked) {
        throw new CustomError("Cannot connect with a blocked user", HttpStatusCodes.FORBIDDEN);
      }

      // Add the connection request
      const response = await this.userNetworkRepository.addPendingRequest(userId, RequserId);

      return response;
    } catch (error) {
      console.error('Error in UserNetworkService while connecting:', error);
      throw new CustomError('Failed to send connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }


// Accept a connection request
async acceptRequest(userId: string, requestId: string): Promise<any> {
  try {
    // Fetch the connection request to ensure it exists and is pending
    const request = await this.userNetworkRepository.getRequestById(requestId, userId);
    
    if (!request) {
      throw new CustomError('Request not found or already handled', HttpStatusCodes.NOT_FOUND);
    }

    // Get the requesterId from the request (i.e., the user who sent the request)
    const requesterId = request.userId;

    // Remove the request from both pendingRequestsSent and pendingRequestsReceived
    await this.userNetworkRepository.removePendingRequest(userId, requestId);
    await this.userNetworkRepository.removePendingRequest(requesterId, requestId);
    
    // Add the connection to both users' networks
    await this.userNetworkRepository.addConnection(userId, requesterId);
    await this.userNetworkRepository.addConnection(requesterId, userId);  // Add the current user to the requester's connections

    return { message: 'Connection request accepted successfully' };
  } catch (error) {
    console.error('Error in UserNetworkService while accepting request:', error);
    throw new CustomError('Failed to accept connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

  
  // Reject a connection request
async rejectRequest(userId: string, requestId: string): Promise<any> {
  try {
    // Fetch the connection request to ensure it exists
    const request = await this.userNetworkRepository.getRequestById(requestId, userId);

    if (!request) {
      throw new CustomError('Request not found or already handled', HttpStatusCodes.NOT_FOUND);
    }

    const requesterId = request.userId;

    // Remove the request from the user's pendingRequestsReceived array
    await this.userNetworkRepository.removePendingRequest(userId, requestId);
    await this.userNetworkRepository.removePendingRequest(requesterId, requestId);

    return { message: 'Connection request rejected successfully' };
  } catch (error) {
    console.error('Error in UserNetworkService while rejecting request:', error);
    throw new CustomError('Failed to reject connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

  
}
