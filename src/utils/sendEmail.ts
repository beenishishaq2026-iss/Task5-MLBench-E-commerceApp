import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  try {
    await transporter.sendMail({
      from: '"MLBench Ecommerce" <no-reply@mlbench.com>',
      to,
      subject,
      html,
    });
  } catch (error: any) {
    console.error('Error sending email:', error.message);
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;
