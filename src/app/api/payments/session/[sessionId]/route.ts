import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { getSessionStatus } from '@/lib/payments';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;

    const { sessionId } = await params;

    const result = await getSessionStatus(sessionId, auth.user._id.toString());

    return NextResponse.json(result.body, { status: result.status });
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}