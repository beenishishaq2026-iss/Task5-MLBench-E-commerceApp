import Pusher from 'pusher';

export { CHANNELS, EVENTS } from './pusherChannels';

if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_SECRET) {
  throw new Error('Pusher env vars are not set');
}

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});