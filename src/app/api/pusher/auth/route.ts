import { NextRequest, NextResponse } from 'next/server';
import { pusherServer, CHANNELS } from '@/lib/pusher';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await getAuthUser(request);
  if ('error' in auth) return auth.error;

  const formData = await request.formData();
  const socketId = formData.get('socket_id') as string;
  const channel = formData.get('channel_name') as string;

  const userId = auth.user._id!.toString();
  const isOwnChannel = channel === CHANNELS.user(userId);
  const isAdminChannel = channel === CHANNELS.admin && auth.user.role === 'admin';

  if (!isOwnChannel && !isAdminChannel) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channel);
  return NextResponse.json(authResponse);
}