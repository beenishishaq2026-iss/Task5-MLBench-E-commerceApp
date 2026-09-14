import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser, forbidden } from '@/lib/auth';
import { notifyAllUsers } from '@/utils/notify';

const ALLOWED_TYPES = ['sale', 'announcement'];

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const body = await request.json();
    const { type, title, message, link } = body as {
      type?: string;
      title?: string;
      message?: string;
      link?: string;
    };

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ message: 'Title and message are required' }, { status: 400 });
    }
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ message: 'Type must be "sale" or "announcement"' }, { status: 400 });
    }

    const notifications = await notifyAllUsers({
      type: type as 'sale' | 'announcement',
      title: title.trim(),
      message: message.trim(),
      link: link?.trim() || undefined,
    });

    return NextResponse.json(
      { message: 'Announcement sent', recipients: notifications.length },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ message: 'Server error', error: message }, { status: 500 });
  }
}