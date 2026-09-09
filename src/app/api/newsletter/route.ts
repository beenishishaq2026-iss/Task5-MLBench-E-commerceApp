import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Newsletter from '@/models/Newsletter';
import { validateEmail } from '@/utils/validators';
import { getAuthUser, forbidden } from '@/lib/auth';
import sendEmail from '@/utils/sendEmail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ message: 'Please provide a valid email address' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await Newsletter.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ message: "You're already subscribed to our newsletter" }, { status: 409 });
      }
      existing.isActive = true;
      existing.subscribedAt = new Date();
      await existing.save();
      return NextResponse.json({ message: 'Welcome back! You have been resubscribed.' }, { status: 200 });
    }

    await Newsletter.create({ email: normalizedEmail });

    sendEmail({
      to: normalizedEmail,
      subject: 'Welcome to the Auric Collective',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #2b2420;">
          <h2 style="margin-bottom: 4px;">Welcome to the Auric Collective</h2>
          <p>Thanks for subscribing! You'll be the first to hear about new arrivals, seasonal curations, and exclusive discounts.</p>
          <div style="background: #f7f3ee; border-radius: 10px; padding: 16px 18px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6;">
              We'll only email you when it's worth your time — new drops, seasonal edits, and members-only offers.
            </p>
          </div>
          <p style="margin-top: 32px; color: #8a7f74; font-size: 12px;">Auric</p>
        </div>
      `,
    }).catch((err) => console.error('Newsletter welcome email failed:', err.message));

    return NextResponse.json({ message: 'Subscribed successfully. Welcome to the collective!' }, { status: 201 });
  } catch (error: any) {
    console.error('NEWSLETTER SUBSCRIBE ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });

    return NextResponse.json({ count: subscribers.length, subscribers }, { status: 200 });
  } catch (error: any) {
    console.error('NEWSLETTER LIST ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}