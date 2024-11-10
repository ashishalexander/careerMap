import {Types} from 'mongoose'
export interface IForgetPasswordService{
    sendResetEmail(email:string): Promise<void>
    resetPassword(token:string,newPassword:string): Promise<void>
    verifyResetToken(token:string): Promise<{userId:Types.ObjectId,email:string}>
}