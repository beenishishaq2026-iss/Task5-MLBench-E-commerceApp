import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    await connectDB();
    const { token } = await params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired verification link' }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return NextResponse.json({ message: 'Email verified successfully. You can now log in.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
