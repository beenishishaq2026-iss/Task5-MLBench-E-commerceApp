import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Please provide email and password' }, { status: 400 });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    const account = admin ?? (await User.findOne({ email }).select('+password'));

    if (!account) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    if (!admin && 'isVerified' in account && !account.isVerified) {
      return NextResponse.json(
        {
          message: 'Please verify your email before logging in',
          email: account.email,
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    const role = admin ? 'admin' : 'user';

    const token = jwt.sign(
      { id: account._id, role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: account._id,
          name: account.name,
          email: account.email,
          role,
        },
        token,
      },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
 } catch (error) {
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ message: "Server error", error: message }, { status: 500 });
}
}