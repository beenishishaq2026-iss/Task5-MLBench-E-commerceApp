import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'MLBench Ecommerce <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Error sending email:', error);
    throw new Error(error.message || 'Email could not be sent');
  }

  console.log('Email sent:', data?.id);
  return data;
};

export default sendEmail;