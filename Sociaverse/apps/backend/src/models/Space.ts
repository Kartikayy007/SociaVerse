import mongoose, { Schema, Document } from 'mongoose';
// import { customAlphabet } from 'nanoid';
import { handlePreSave, handlePreDelete, isUserOnline } from '../middleware/spaceMiddleware';

// const generateInviteCode = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export enum SpaceType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted'
}

export enum MemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

interface SpaceMember {
  userId: mongoose.Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
}

export interface ISpace extends Document {
  name: string;
  description: string;
  type: SpaceType;
  inviteCode: string;
  members: SpaceMember[];
  onlineMembers: mongoose.Types.ObjectId[];
  ownerId: mongoose.Types.ObjectId;
  lastActivity: Date;
  maxMembers: number;
  memberCount: number;
}

const SpaceMemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: Object.values(MemberRole),
    default: MemberRole.MEMBER
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const SpaceSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: Object.values(SpaceType),
    default: SpaceType.PRIVATE
  },
  inviteCode: { 
    type: String,
    unique: true,
  },
  members: [SpaceMemberSchema],
  onlineMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  maxMembers: {
    type: Number,
    default: 100,
    min: 1,
    max: 1000
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes
// SpaceSchema.index({ name: 1 });
// SpaceSchema.index({ inviteCode: 1 }, { unique: true });
// SpaceSchema.index({ 'members.userId': 1 });

// // Virtuals
// SpaceSchema.virtual('memberCount').get(function() {
//   return this.members.length;
// });

// SpaceSchema.virtual('owner', {
//   ref: 'User',
//   localField: 'ownerId',
//   foreignField: '_id',
//   justOne: true
// });

// Middleware
SpaceSchema.pre('save', handlePreSave);

SpaceSchema.pre('deleteOne', { document: true, query: false }, handlePreDelete);

// Add method to check if user is online
SpaceSchema.methods.isUserOnline = isUserOnline;

export const Space = mongoose.model<ISpace>('Space', SpaceSchema);