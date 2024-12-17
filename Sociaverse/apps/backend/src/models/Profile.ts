import mongoose, { Document, Schema } from 'mongoose';

export enum Avatar {
  CASUAL = '1',
  PROFESSIONAL = '2',
  CREATIVE = '3'
}

export const VALID_AVATARS = Object.values(Avatar);

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  avatar: string;
  bio?: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema: Schema<IProfile> = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      unique: true 
    },
    avatar: { 
      type: String, 
      enum: VALID_AVATARS,
      default: Avatar.CASUAL,
      required: true
    },
    bio: { 
      type: String, 
      maxLength: 500 
    },
    username: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);