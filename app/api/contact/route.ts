import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Configure the email transport using SMTP (e.g., Gmail)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Email to be sent to the club (fcaigamedevclub@gmail.com)
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`, // Use your authenticated email as 'from' to avoid spam filtering
      replyTo: email,
      to: 'fcaigamedevclub@gmail.com',
      subject: `New Contact Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ff5303;">New Message via FCAI CUGD Club Website</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3 style="color: #333;">Message:</h3>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; color: #555; white-space: pre-wrap;">${message}</p>
          <br />
          <p style="font-size: 12px; color: #999;">This email was automatically generated from your website's contact form.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { message: `Failed to send email: ${errMsg}` },
      { status: 500 }
    );
  }
}
