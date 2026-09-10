import { NextRequest, NextResponse, after } from 'next/server';
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
      after(() =>
        sendEmail({
          to: process.env.SUPPORT_EMAIL as string,
          subject: `New contact form submission: ${contact.subject}`,
          html: `
            <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #2b2420;">
              <div style="border-bottom: 2px solid #b5502f; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 20px;">New Contact Form Submission</h2>
                <p style="margin: 4px 0 0; font-size: 13px; color: #8a7f74;">Auric &middot; Customer Support</p>
              </div>

              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; width: 110px; color: #8a7f74;">Name</td>
                  <td style="padding: 6px 0; font-weight: 600;">${contact.name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8a7f74;">Email</td>
                  <td style="padding: 6px 0;"><a href="mailto:${contact.email}" style="color: #b5502f; text-decoration: none;">${contact.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8a7f74;">Subject</td>
                  <td style="padding: 6px 0; font-weight: 600;">${contact.subject}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #8a7f74; vertical-align: top;">Received</td>
                  <td style="padding: 6px 0;">${new Date(contact.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}</td>
                </tr>
              </table>

              <div style="background: #f7f3ee; border-radius: 10px; padding: 16px 18px;">
                <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #8a7f74;">Message</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
              </div>

              <p style="margin-top: 24px; font-size: 12px; color: #8a7f74;">
                Reply directly to this email to respond to ${contact.name.split(' ')[0]}, or reply to
                <a href="mailto:${contact.email}" style="color: #b5502f;">${contact.email}</a>.
              </p>
            </div>
          `,
        }).catch((err) => console.error('Contact notification email failed:', err.message))
      );
    }

    after(() =>
      sendEmail({
        to: contact.email,
        subject: "We've received your message - Auric Support",
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; color: #2b2420;">
            <h2 style="margin-bottom: 4px;">Thanks for reaching out, ${contact.name.split(' ')[0]}</h2>
            <p>We've received your message and a member of our team will get back to you within 1-2 business days.</p>

            <div style="background: #f7f3ee; border-radius: 10px; padding: 16px 18px; margin: 20px 0;">
              <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #8a7f74;">Your message</p>
              <p style="margin: 0 0 10px; font-size: 14px;"><strong>Subject:</strong> ${contact.subject}</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${contact.message}</p>
            </div>

            <p style="margin-bottom: 4px;">If you need to add anything else, just reply to this email.</p>
            <p style="margin-top: 32px; color: #8a7f74; font-size: 12px;">Auric Customer Support</p>
          </div>
        `,
      }).catch((err) => console.error('Contact confirmation email failed:', err.message))
    );

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
 } catch (error) {
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ message: "Server error", error: message }, { status: 500 });
}
}