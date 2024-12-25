import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MessageSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  spaceId: {
    type: Schema.Types.ObjectId,
    ref: 'Space',
    required: true,
  }
}, {
  timestamps: true
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);