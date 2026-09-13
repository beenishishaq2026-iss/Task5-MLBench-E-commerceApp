import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  await connectDB();
  const auth = await getAuthUser(request);
  if ('error' in auth) return auth.error;

  const { token } = await request.json();
  if (!token) return NextResponse.json({ message: 'token required' }, { status: 400 });

  await User.findByIdAndUpdate(auth.user._id, { $addToSet: { fcmTokens: token } });
  return NextResponse.json({ message: 'Token saved' });
}