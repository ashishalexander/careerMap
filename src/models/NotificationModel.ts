import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  link?: string;
  createdAt: Date;
  status: 'SENT' | 'FAILED';
}
    
const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' }
},
{ timestamps: true } 
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
