import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IContentMod extends Document {
  postId: Types.ObjectId;
  reportedBy: Types.ObjectId;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'ignored' | 'action_taken';
  timestamp: Date;
  reviewedAt?: Date;
  adminResponse?: string;
}
const ContentModSchema = new Schema<IContentMod>({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  details: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'ignored', 'action_taken'],
    default: 'pending'
  },
  timestamp: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  adminResponse: { type: String }
});

// Create compound index to prevent duplicate reports
ContentModSchema.index({ postId: 1, reportedBy: 1 }, { unique: true });

export default mongoose.model<IContentMod>('ContentMod', ContentModSchema);
