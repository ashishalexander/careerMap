import { Schema, model, Types, Document } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  mobile: string;
  password: string;
  profile: {
    profilePicture?: string;
    bannerImage?: string;
    about?: string;
    headline?: string;
    location?: string;
    company?: string;
    website?: string;
    connections?: number;
    Education?: [{
      school: string;
      degree: string;
      startDate: Date;
      endDate: Date;
      skills: [string];
    }];
    Experience?: [{
      _id:string;
      title: string;
      employmentType: string;
      company: string;
      startDate: Date;
      endDate: Date;
      location: string;
      description: string;
    }];
    Projects?: [{
      title?: string;
      description?: string;
      startDate?: Date | null;
      endDate?: Date | null;
      url?: string;
      skills?: string[];
    }];
  };
  isblocked: boolean;
}


export interface IUserCreate {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;        
  mobile?: string;
  password?: string;
  profilePicture?:string;
 
}

const userSchema = new Schema<IUser>({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  mobile: { type: String },
  password: { type: String },
  profile: {
    profilePicture: { type: String},
    bannerImage: { type: String},
    about: { type: String},
    headline: { type: String},
    location: { type: String},
    company: { type: String},
    website: { type: String},
    connections: { type: Number, default: 0 },
    Education: [{
      school: { type: String},
      degree: { type: String},
      startDate: { type: Date},
      endDate: { type: Date },
      skills: [String]
    }],
    Experience: [{
      title: { type: String },
      employmentType: { type: String },
      company: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      location: { type: String },
      description: { type: String }
    }],
    Projects: [{
      title: { type: String },
      description: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      url: { type: String },
      skills: [String]
    }]
  },
  isblocked: { type: Boolean, default: false },
});
export const UserModel = model<IUser>('User', userSchema);
