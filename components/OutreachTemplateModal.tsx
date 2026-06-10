'use client'

import { useState } from 'react'
import {
  X,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Loader2,
  Edit3,
  Save,
  Mail,
} from 'lucide-react'

export interface GeneratedTemplate {
  subject_line: string
  template: string
  tone: string
}

interface OutreachTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  initialTemplate?: GeneratedTemplate | null
  onUseTemplate?: (subject: string, body: string) => void
}

export default function OutreachTemplateModal({
  isOpen,
  onClose,
  email,
  initialTemplate,
  onUseTemplate,
}: OutreachTemplateModalProps) {
  const [template, setTemplate] = useState<GeneratedTemplate | null>(
    initialTemplate || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')

  const extractNameFromEmail = (emailStr: string): string | undefined => {
    const local = emailStr.split('@')[0]
    if (!local) return undefined
    // Convert john.doe or john_doe to "John Doe"
    const cleaned = local.replace(/[._0-9]+$/, '').replace(/[._]/g, ' ')
    if (cleaned.length < 2) return undefined
    return cleaned
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  const extractCompanyFromEmail = (emailStr: string): string | undefined => {
    const domain = emailStr.split('@')[1]
    if (!domain) return undefined
    return domain.replace(/\..+$/, '').replace(/-/g, ' ')
  }

  const generateTemplate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const name = extractNameFromEmail(email)
      const company = extractCompanyFromEmail(email)

      const res = await fetch('/api/generate-outreach-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company }),
      })

      const data = await res.json()

      if (data.success) {
        setTemplate({
          subject_line: data.subject_line,
          template: data.template,
          tone: data.tone,
        })
        setEditedSubject(data.subject_line)
        setEditedBody(data.template)
        setIsEditing(false)
      } else {
        setError(data.error || 'Failed to generate template')
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    const textToCopy = isEditing
      ? `Subject: ${editedSubject}\n\n${editedBody}`
      : `Subject: ${template?.subject_line}\n\n${template?.template}`

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = textToCopy
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUseTemplate = () => {
    if (!template) return
    const subject = isEditing ? editedSubject : template.subject_line
    const body = isEditing ? editedBody : template.template
    onUseTemplate?.(subject, body)
    onClose()
  }

  const startEditing = () => {
    if (!template) return
    setEditedSubject(template.subject_line)
    setEditedBody(template.template)
    setIsEditing(true)
  }

  const saveEditing = () => {
    if (!template) return
    setTemplate({
      ...template,
      subject_line: editedSubject,
      template: editedBody,
    })
    setIsEditing(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                AI Outreach Template
              </h3>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!template && !isLoading && !error && (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-primary-500" />
              </div>
              <p className="text-gray-700 font-medium mb-1">
                Generate a personalized outreach template
              </p>
              <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
                Our AI will analyze the email domain and create a contextual cold
                outreach template for this recipient.
              </p>
              <button
                onClick={generateTemplate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Generate Template
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                AI is crafting your personalized template...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Analyzing domain &amp; generating outreach copy
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm text-red-700 font-medium">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  We&apos;ll use a fallback template instead.
                </p>
              </div>
              <button
                onClick={generateTemplate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {template && !isLoading && (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Subject Line
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium">
                    {template.subject_line}
                  </div>
                )}
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email Body
                </label>
                {isEditing ? (
                  <textarea
                    value={editedBody}
                    onChange={(e) => setEditedBody(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-y"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {template.template}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                  {template.tone}
                </span>
                <span className="text-xs text-gray-400">
                  ~{template.template.split(/\s+/).length} words
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {template && !isLoading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>

              {isEditing ? (
                <button
                  onClick={saveEditing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              ) : (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}

              <button
                onClick={generateTemplate}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
            </div>

            <button
              onClick={handleUseTemplate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Use This Template
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
