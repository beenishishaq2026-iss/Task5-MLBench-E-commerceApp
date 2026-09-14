import { pusherServer, CHANNELS, EVENTS } from '@/lib/pusher';
import Notification from '@/models/Notification';
import Admin from '@/models/Admin';
import User from '@/models/User';
import { sendPushToTokens } from '@/utils/sendPushNotification';
import { Types } from 'mongoose';

export async function notifyUser(
  userId: string | Types.ObjectId,
  data: { type: 'order-status' | 'promo' | 'review-reply'; title: string; message: string; link?: string }
) {
  const notification = await Notification.create({
    recipient: userId,
    recipientModel: 'User',
    ...data,
  });
  await pusherServer.trigger(CHANNELS.user(userId.toString()), EVENTS.NEW_NOTIFICATION, notification);
  return notification;
}

export async function notifyAdmins(data: { type: 'new-order' | 'new-review'; title: string; message: string; link?: string }) {
  // Persist a notification for every admin account so it still shows up
  // after a page refresh, then broadcast each one on the shared admin
  // channel so every connected admin dashboard updates live.
  const admins = await Admin.find({}, '_id');

  const notifications = await Promise.all(
    admins.map((admin) =>
      Notification.create({
        recipient: admin._id,
        recipientModel: 'Admin',
        ...data,
      })
    )
  );

  await Promise.all(
    notifications.map((notification) =>
      pusherServer.trigger(CHANNELS.admin, EVENTS.NEW_NOTIFICATION, notification)
    )
  );

  return notifications;
}

// Broadcast a sale / general announcement to every registered user at once —
// used by the admin "Announcements" tool. Persists one notification per user
// (so it still shows up after a refresh), pushes it live over each user's
// channel, and also fans it out as a native push notification to anyone who
// has enabled push on this device.
export async function notifyAllUsers(data: {
  type: 'sale' | 'announcement' | 'promo';
  title: string;
  message: string;
  link?: string;
}) {
  const users = await User.find({}, '_id fcmTokens');

  const notifications = await Promise.all(
    users.map((u) =>
      Notification.create({
        recipient: u._id,
        recipientModel: 'User',
        ...data,
      })
    )
  );

  await Promise.all(
    notifications.map((notification) =>
      pusherServer.trigger(CHANNELS.user(notification.recipient.toString()), EVENTS.NEW_NOTIFICATION, notification)
    )
  );

  const tokens = users.flatMap((u) => u.fcmTokens || []);
  if (tokens.length > 0) {
    try {
      await sendPushToTokens(tokens, data.title, data.message);
    } catch (err) {
      // Push delivery is best-effort — the in-app notification already landed.
      console.log('could not send push notifications', err);
    }
  }

  return notifications;
}