import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from './db';
import User, { IUser } from '@/models/User';

interface JwtPayload {
  id: string;
  role: string;
}

type AuthResult = { user: IUser } | { error: NextResponse };

// Replaces the old Express `protect` middleware. Route Handlers don't have
// middleware chains the way Express routers do, so every protected route
// calls this directly and returns `auth.error` early when it's present -
// same three failure cases and messages as before.
export async function getAuthUser(request: NextRequest): Promise<AuthResult> {
  try {
    let token: string | undefined;

    const cookieToken = request.cookies.get('token')?.value;
    const authHeader = request.headers.get('authorization');

    if (cookieToken) {
      token = cookieToken;
    } else if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return { error: NextResponse.json({ message: 'Not authorized, no token provided' }, { status: 401 }) };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user) {
      return { error: NextResponse.json({ message: 'Not authorized, user not found' }, { status: 401 }) };
    }

    return { user };
  } catch {
    return { error: NextResponse.json({ message: 'Not authorized, token invalid or expired' }, { status: 401 }) };
  }
}

// Replaces the old Express `authorize(...roles)` middleware.
export function forbidden() {
  return NextResponse.json({ message: 'Forbidden: insufficient permissions' }, { status: 403 });
}
