import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { handleStripeWebhookEvent } from '@/lib/payments';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ message: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    await connectDB();
    const event = await handleStripeWebhookEvent(rawBody, signature);
    return NextResponse.json({ received: true, type: event.type }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: `Webhook Error: ${error.message}` }, { status: 400 });
  }
}