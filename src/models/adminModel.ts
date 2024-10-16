import { Schema, model,Types,Document  } from 'mongoose';
import { IAdmin } from '../interfaces/adminModel'; 

export interface AdminDocument extends IAdmin,Document {
    _id: Types.ObjectId;  
}
const AdminSchema = new Schema<AdminDocument>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:{type:String, default:'admin'}
}, { timestamps: true });

const AdminModel = model<AdminDocument>('Admins', AdminSchema);

export default AdminModel;
