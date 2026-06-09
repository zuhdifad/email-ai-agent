'use client'

import { useState } from 'react'
import { Send, Loader2, FileText } from 'lucide-react'

interface EmailComposerProps {
  emails: string[]
  smtpConfig: {
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
  }
  onSendComplete: () => void
}

export default function EmailComposer({
  emails,
  smtpConfig,
  onSendComplete,
}: EmailComposerProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<{
    total: number
    delivered: number
    failed: number
  } | null>(null)

  const handleSend = async () => {
    if (emails.length === 0) {
      alert('Please add at least one recipient')
      return
    }
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in both subject and body')
      return
    }
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      alert('Please complete your SMTP configuration')
      return
    }

    setIsSending(true)
    setSendResult(null)

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: emails,
          subject,
          body,
          smtpConfig,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSendResult({
          total: data.total,
          delivered: data.delivered,
          failed: data.failed,
        })
        setSubject('')
        setBody('')
        onSendComplete()
      } else {
        const detail = data.detail ? `\n\nDetail: ${data.detail}` : ''
        alert((data.error || 'Failed to send emails') + detail)
      }
    } catch (err) {
      console.error(err)
      alert('An error occurred while sending emails')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Subject
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email Body
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email content here..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {emails.length > 0 ? (
            <span>
              Sending to <strong>{emails.length}</strong> recipient
              {emails.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-amber-600">No recipients selected</span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={isSending || emails.length === 0}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Emails
            </>
          )}
        </button>
      </div>

      {sendResult && (
        <div
          className={`rounded-lg p-4 border ${
            sendResult.failed === 0
              ? 'bg-green-50 border-green-200 text-green-800'
              : sendResult.delivered > 0
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <p className="font-semibold mb-1">Send Complete</p>
          <p className="text-sm">
            {sendResult.delivered} delivered, {sendResult.failed} failed out of{' '}
            {sendResult.total} total.
          </p>
        </div>
      )}
    </div>
  )
}
