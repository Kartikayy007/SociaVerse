import mongoose, { Schema, Document } from 'mongoose';
import { customAlphabet } from 'nanoid';
// import { OnlineMember } from '../types/socket';

const generateInviteCode = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export interface ISpace extends Document {
  name: string;
  description: string;
  isPublic: boolean;
  inviteCode: string;
  members: mongoose.Types.ObjectId[];
  onlineMembers: mongoose.Types.ObjectId[];
  ownerId: mongoose.Types.ObjectId;
}

const SpaceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  inviteCode: { 
    type: String,
    unique: true,
    default: () => generateInviteCode()
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  onlineMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

export const Space = mongoose.model<ISpace>('Space', SpaceSchema);