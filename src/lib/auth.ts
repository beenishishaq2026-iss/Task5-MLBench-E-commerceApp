import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from './db';
import User, { IUser } from '@/models/User';
import Admin, { IAdmin } from '@/models/Admin';

interface JwtPayload {
  id: string;
  role: string;
}

type AuthResult = { user: IUser | IAdmin } | { error: NextResponse };

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
    
    const user =
      decoded.role === 'admin'
        ? await Admin.findById(decoded.id)
        : await User.findById(decoded.id);

    if (!user) {
      return { error: NextResponse.json({ message: 'Not authorized, user not found' }, { status: 401 }) };
    }

    return { user };
  } catch {
    return { error: NextResponse.json({ message: 'Not authorized, token invalid or expired' }, { status: 401 }) };
  }
}

export function forbidden() {
  return NextResponse.json({ message: 'Forbidden: insufficient permissions' }, { status: 403 });
}