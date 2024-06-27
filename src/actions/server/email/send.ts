'use server'

import nodemailer, { TransportOptions, SentMessageInfo } from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Create a transporter using SMTP transport
    const transportOptions: TransportOptions = {
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: 'support@technologiesunlimited.net',
        pass: process.env.EMAIL_PASSWORD,
      },
    } as TransportOptions

    const transporter = nodemailer.createTransport(transportOptions)

    // Compose the email message
    const message: nodemailer.SendMailOptions = {
      from: 'Your Name <support@technologiesunlimited.net>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    }

    // Send the email
    const info: SentMessageInfo = await transporter.sendMail(message)
    console.log('Email sent:', info.messageId)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}
