import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await connectDB();
  const auth = await getAuthUser(request);
  if ('error' in auth) return auth.error;

  const { user } = auth;

  return NextResponse.json(
    {
      message: 'You are authenticated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 }
  );
}
