import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import sendEmail from '@/utils/sendEmail';
import { generateOtp } from '@/utils/validators';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ message: 'No account found with this email' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email is already verified. You can log in.' }, { status: 200 });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Your new verification code',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #2b2420;">
          <h2 style="margin-bottom: 4px;">Hi ${user.name},</h2>
          <p>Here's your new verification code. This code expires in 10 minutes.</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; margin: 24px 0; color: #b5502f;">${otp}</p>
          <p style="margin-top: 32px; color: #8a7f74; font-size: 12px;">Auric</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'A new verification code has been sent to your email.' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}