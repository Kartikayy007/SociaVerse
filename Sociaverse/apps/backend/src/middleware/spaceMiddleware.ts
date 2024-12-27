import mongoose from 'mongoose';
import { ISpace } from '../models/Space';

export const handlePreSave = function(this: ISpace, next: mongoose.CallbackWithoutResultAndOptionalError) {
  // Check member limit
  if (this.members.length > this.maxMembers) {
    const error = new Error('Space has reached maximum member capacity');
    error.name = 'MaxCapacityError';
    return next(error);
  }

  // Update lastActivity
  this.lastActivity = new Date();

  // Ensure unique members
  const uniqueMemberIds = [...new Set(this.members.map(member => member.userId.toString()))];
  const filteredMembers = this.members.filter(member => 
    uniqueMemberIds.indexOf(member.userId.toString()) === uniqueMemberIds.lastIndexOf(member.userId.toString())
  );
  this.members = filteredMembers;

  next();
};

export const handlePreDelete = async function(this: ISpace, next: mongoose.CallbackWithoutResultAndOptionalError) {
  try {
    await mongoose.model('Message').deleteMany({ spaceId: this._id });
    await mongoose.model('SpaceActivity').deleteMany({ spaceId: this._id });
    next();
  } catch (error: any) {
    next(error);
  }
};

export const isUserOnline = function(this: ISpace, userId: string): boolean {
  return this.onlineMembers.some(member => member.toString() === userId);
};