import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface ISpace extends Document {
  name: string;
  description: string,
  isPrivate: boolean,
  members: number,
  lastVisited: Date,
  isOwner: boolean,
  owerId: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
}

const SpaceSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  members: {
    type: Number,
    default: 1,
  },
  lastVisited: {
    type: Date,
    default: Date.now,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
})

export const Space = mongoose.model<ISpace>('Space', SpaceSchema);