import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { v4 as uuidv4 } from 'uuid'
import { addJob, updateJob } from '@/lib/store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      recipients,
      subject,
      body: emailBody,
      smtpConfig,
    } = body as {
      recipients: string[]
      subject: string
      body: string
      smtpConfig: {
        host: string
        port: number
        secure: boolean
        user: string
        pass: string
      }
    }

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 })
    }

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      )
    }

    if (!smtpConfig || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      return NextResponse.json(
        { error: 'SMTP configuration is incomplete' },
        { status: 400 }
      )
    }

    const port = smtpConfig.port || 587
    // Port 465 uses SSL/TLS directly (secure: true)
    // Port 587 uses STARTTLS (secure: false, TLS is negotiated after connection)
    const isSecurePort = port === 465 || smtpConfig.secure === true

    const transportConfig: any = {
      host: smtpConfig.host,
      port,
      secure: isSecurePort,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      pool: true,
      maxConnections: 5,
    }

    if (!isSecurePort) {
      transportConfig.tls = {
        rejectUnauthorized: false,
      }
    }

    const transporter = nodemailer.createTransport(transportConfig)

    // Verify connection before sending
    try {
      await transporter.verify()
    } catch (verifyErr: any) {
      console.error('SMTP verification failed:', verifyErr)
      return NextResponse.json(
        {
          error:
            'SMTP authentication failed. Please check: 1) Email/password are correct, 2) You are using an App Password (not your regular login password), 3) Your email provider allows SMTP access.',
          detail: verifyErr.message || 'Unknown error',
        },
        { status: 401 }
      )
    }

    const results = []

    for (const recipient of recipients) {
      const jobId = uuidv4()
      const cleanRecipient = recipient.trim()

      addJob({
        id: jobId,
        to: cleanRecipient,
        subject,
        body: emailBody,
        status: 'sending',
      })

      try {
        await transporter.sendMail({
          from: smtpConfig.user,
          to: cleanRecipient,
          subject,
          text: emailBody,
          html: emailBody.replace(/\n/g, '<br/>'),
        })

        updateJob(jobId, {
          status: 'delivered',
          sentAt: new Date().toISOString(),
        })

        results.push({
          recipient: cleanRecipient,
          status: 'delivered',
          jobId,
        })
      } catch (err: any) {
        updateJob(jobId, {
          status: 'failed',
          error: err.message || 'Unknown error',
        })

        results.push({
          recipient: cleanRecipient,
          status: 'failed',
          jobId,
          error: err.message || 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      total: recipients.length,
      delivered: results.filter(r => r.status === 'delivered').length,
      failed: results.filter(r => r.status === 'failed').length,
    })
  } catch (error: any) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send emails' },
      { status: 500 }
    )
  }
}
