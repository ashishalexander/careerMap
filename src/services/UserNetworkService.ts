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

//   /**
//    * Accept a connection request.
//    *
//    * @param userId - The ID of the user accepting the request.
//    * @param requestId - The ID of the connection request being accepted.
//    * @returns A Promise that resolves when the request is accepted.
//    */
//   async acceptRequest(userId: string, requestId: string): Promise<void> {
//     try {
//       const success = await this.userNetworkRepository.acceptRequest(userId, requestId);

//       if (!success) {
//         throw new CustomError('Request not found or already handled', HttpStatusCodes.NOT_FOUND);
//       }
//     } catch (error) {
//       console.error('Error in UserNetworkService while accepting request:', error);
//       throw new CustomError('Failed to accept connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
//     }
//   }

//   /**
//    * Reject a connection request.
//    *
//    * @param userId - The ID of the user rejecting the request.
//    * @param requestId - The ID of the connection request being rejected.
//    * @returns A Promise that resolves when the request is rejected.
//    */
//   async rejectRequest(userId: string, requestId: string): Promise<void> {
//     try {
//       const success = await this.userNetworkRepository.rejectRequest(userId, requestId);

//       if (!success) {
//         throw new CustomError('Request not found or already handled', HttpStatusCodes.NOT_FOUND);
//       }
//     } catch (error) {
//       console.error('Error in UserNetworkService while rejecting request:', error);
//       throw new CustomError('Failed to reject connection request', HttpStatusCodes.INTERNAL_SERVER_ERROR);
//     }
//   }

  
}
