import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    await Notification.updateMany(
      { recipient: auth.user._id, read: false },
      { read: true }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}