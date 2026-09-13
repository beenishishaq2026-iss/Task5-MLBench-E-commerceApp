import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher';
import Notification from '@/models/Notification';
import { Types } from 'mongoose';

export async function notifyUser(
  userId: string | Types.ObjectId,
  data: { type: 'order-status' | 'promo'; title: string; message: string; link?: string }
) {
  const notification = await Notification.create({
    recipient: userId,
    recipientModel: 'User',
    ...data,
  });
  await pusherServer.trigger(CHANNELS.user(userId.toString()), EVENTS.NEW_NOTIFICATION, notification);
  return notification;
}

export async function notifyAdmins(data: { type: 'new-order'; title: string; message: string; link?: string }) {
  // recipient set to a placeholder here; adjust if you support multiple admin accounts
  await pusherServer.trigger(CHANNELS.admin, EVENTS.NEW_ORDER, data);
}