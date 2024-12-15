import mongoose, { Document, Schema } from 'mongoose';

export enum Avatar {
  CASUAL = '/avatars/casual.png',
  PROFESSIONAL = '/avatars/professional.png',
  CREATIVE = '/avatars/creative.png',
  GAMING = '/avatars/gaming.png',
  TECH = '/avatars/tech.png'
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