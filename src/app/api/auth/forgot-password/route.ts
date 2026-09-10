import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import sendEmail from '@/utils/sendEmail';
import { validateEmail, generateOtp } from '@/utils/validators';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ message: 'Please provide your email address' }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ message: 'Please provide a valid email address' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    const genericResponse = {
      message: "If an account exists for that email, we've sent a password reset code to it.",
    };

    if (!user) {
      return NextResponse.json(genericResponse, { status: 200 });
    }

    const otp = generateOtp();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your Auric password',
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #2b2420;">
            <h2 style="margin-bottom: 4px;">Reset your password</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset the password for your Auric account. Use the code below to continue. This code expires in 10 minutes.</p>
            <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; margin: 24px 0; color: #b5502f;">${otp}</p>
            <p>If you didn't request a password reset, you can safely ignore this email - your password will remain unchanged.</p>
            <p style="margin-top: 32px; color: #8a7f74; font-size: 12px;">Auric</p>
          </div>
        `,
      });
    } catch (emailError) {
      const message = emailError instanceof Error ? emailError.message : 'Server error';
      console.error('Password reset OTP email failed:', message);
      return NextResponse.json(
        { message: 'Could not send the reset code. Please try again in a moment.' },
        { status: 500 }
      );
    }

    return NextResponse.json(genericResponse, { status: 200 });
 } catch (error) {
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ message: "Server error", error: message }, { status: 500 });
}
}