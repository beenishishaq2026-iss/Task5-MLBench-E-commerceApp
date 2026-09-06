import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import User from '@/models/User';
import sendEmail from '@/utils/sendEmail';
import { validateEmail, validatePassword, generateOtp } from '@/utils/validators';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ message: 'Please provide name, email, and password' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: 'Please provide a valid email address' }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      otp,
      otpExpires,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email - OTP Code',
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #2b2420;">
            <h2 style="margin-bottom: 4px;">Welcome, ${user.name}!</h2>
            <p>Thanks for creating an Auric account. Use the code below to verify your email. This code expires in 10 minutes.</p>
            <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; margin: 24px 0; color: #b5502f;">${otp}</p>
            <p>If you didn't create this account, you can safely ignore this email.</p>
            <p style="margin-top: 32px; color: #8a7f74; font-size: 12px;">Auric</p>
          </div>
        `,
      });
    } catch (emailError: any) {
      console.error('Signup succeeded but OTP email failed:', emailError.message);
    }

    return NextResponse.json(
      {
        message: 'Account created. Please check your email for the verification code.',
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}