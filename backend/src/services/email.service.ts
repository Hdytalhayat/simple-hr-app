// src/services/email.service.ts

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configure Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // SMTP host (e.g., smtp.gmail.com)
  port: parseInt(process.env.EMAIL_PORT || '587'), // SMTP port (465 for SSL, 587 for TLS)
  secure: process.env.EMAIL_SECURE === 'true', // true for 465 (SSL), false for other ports
  auth: {
    user: process.env.EMAIL_USER, // Sender email address
    pass: process.env.EMAIL_PASS, // Application-specific password or SMTP password
  },
});

// Type definition for email options
interface MailOptions {
  to: string; // Recipient email address
  subject: string; // Email subject
  html: string; // HTML content of the email
}

// 2. Main function to send an email notification
export const sendEmail = async (options: MailOptions) => {
  try {
    const mailOptions = {
      from: `"HR Simple App" <${process.env.EMAIL_USER}>`, // Display name + sender email
      to: options.to, // Recipient
      subject: options.subject, // Email subject
      html: options.html, // HTML body content
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    // Log success message
    console.log('Email sent successfully: %s', info.messageId);

    return info;
  } catch (error) {
    // Log and throw error if sending fails
    console.error('Error while sending email:', error);
    throw new Error('Failed to send email notification.');
  }
};
