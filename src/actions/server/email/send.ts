'use server'

import nodemailer, { TransportOptions, SentMessageInfo } from 'nodemailer'
import generateVerificationCode from '../auth/verification/generateCode'
import { set } from 'goobs-cache'
import loadAuthConfig from '../auth/configLoader'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Load the auth configuration
    const config = await loadAuthConfig()

    // Generate verification code
    const verificationCode = await generateVerificationCode()

    // Store the verification code in the client-side cache
    await set(
      `email_verification_${options.to}`,
      { type: 'string', value: verificationCode },
      new Date(Date.now() + 10 * 60 * 1000),
      'client'
    ) // 10 minutes expiration

    // SMTP setup using config
    const { host, port, secure, auth, from } = config.smtp
    if (!host || !port || !auth.user || !auth.pass) {
      throw new Error('SMTP configuration is not properly set in .auth.json')
    }

    // Create a transporter using SMTP transport
    const transportOptions: TransportOptions = {
      host,
      port,
      secure,
      auth: {
        user: auth.user,
        pass: auth.pass,
      },
    } as TransportOptions
    const transporter = nodemailer.createTransport(transportOptions)

    // Compose the email message
    const message: nodemailer.SendMailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      html: `${options.html}<br><br>Your verification code is: ${verificationCode}`,
    }

    // Send the email
    const info: SentMessageInfo = await transporter.sendMail(message)
    console.log('Email sent:', info.messageId)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export default sendEmail
