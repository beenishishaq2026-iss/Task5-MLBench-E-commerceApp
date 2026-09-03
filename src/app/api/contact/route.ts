import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';
import { validateEmail } from '@/utils/validators';
import { getAuthUser, forbidden } from '@/lib/auth';
import sendEmail from '@/utils/sendEmail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }
    if (!validateEmail(email)) {
      return NextResponse.json({ message: 'Please provide a valid email address' }, { status: 400 });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    
    if (process.env.SUPPORT_EMAIL) {
      sendEmail({
        to: process.env.SUPPORT_EMAIL,
        subject: `New contact message: ${contact.subject}`,
        html: `<p><strong>From:</strong> ${contact.name} (${contact.email})</p><p>${contact.message}</p>`,
      }).catch((err) => console.error('Contact notification email failed:', err.message));
    }

    sendEmail({
      to: contact.email,
      subject: "We've received your message",
      html: `<p>Hi ${contact.name},</p><p>Thanks for reaching out to Auric. Our team will get back to you within 1-2 business days.</p>`,
    }).catch((err) => console.error('Contact confirmation email failed:', err.message));

    return NextResponse.json(
      { message: "Message sent! We'll get back to you within 1-2 business days.", contact },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('CONTACT SUBMIT ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await getAuthUser(request);
    if ('error' in auth) return auth.error;
    if (auth.user.role !== 'admin') return forbidden();

    const messages = await Contact.find().sort({ createdAt: -1 });

    return NextResponse.json({ count: messages.length, messages }, { status: 200 });
  } catch (error: any) {
    console.error('CONTACT LIST ERROR:', error);
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}