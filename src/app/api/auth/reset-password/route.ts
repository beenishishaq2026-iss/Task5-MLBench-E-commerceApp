import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { validatePassword } from '@/utils/validators';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, otp, password } = await request.json();

    if (!email?.trim() || !otp?.trim() || !password) {
      return NextResponse.json(
        { message: 'Email, code, and new password are required' },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+resetPasswordOtp +resetPasswordOtpExpires'
    );

    if (!user) {
      return NextResponse.json({ message: 'No account found with this email' }, { status: 404 });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return NextResponse.json(
        { message: 'No reset code found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.resetPasswordOtpExpires.getTime() < Date.now()) {
      return NextResponse.json(
        { message: 'This code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (user.resetPasswordOtp !== otp) {
      return NextResponse.json({ message: 'Incorrect reset code' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'Password reset successfully. You can now log in.' },
      { status: 200 }
    );
  } catch (error) {
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ message: "Server error", error: message }, { status: 500 });
}
}