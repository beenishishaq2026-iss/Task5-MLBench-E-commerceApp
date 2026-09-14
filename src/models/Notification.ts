import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  recipientModel: 'User' | 'Admin';
  type: 'order-status' | 'new-order' | 'promo' | 'new-review' | 'review-reply' | 'sale' | 'announcement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, required: true, refPath: 'recipientModel' },
    recipientModel: { type: String, enum: ['User', 'Admin'], required: true },
    type: {
      type: String,
      enum: ['order-status', 'new-order', 'promo', 'new-review', 'review-reply', 'sale', 'announcement'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;