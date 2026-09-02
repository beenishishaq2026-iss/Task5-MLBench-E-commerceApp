import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and code are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+otp +otpExpires');
    if (!user) {
      return NextResponse.json({ message: 'No account found with this email' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email is already verified. You can log in.' }, { status: 200 });
    }

    if (!user.otp || !user.otpExpires) {
      return NextResponse.json({ message: 'No verification code found. Please request a new one.' }, { status: 400 });
    }

    if (user.otpExpires.getTime() < Date.now()) {
      return NextResponse.json({ message: 'This code has expired. Please request a new one.' }, { status: 400 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: 'Incorrect verification code' }, { status: 400 });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return NextResponse.json({ message: 'Email verified successfully. You can now log in.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}