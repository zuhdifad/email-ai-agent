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

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port || 587,
      secure: smtpConfig.secure || false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

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
