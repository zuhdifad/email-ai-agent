'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Upload,
  Loader2,
  ImageIcon,
  X,
  Mail,
  Clipboard,
  Sparkles,
} from 'lucide-react'
import OutreachTemplateModal, {
  GeneratedTemplate,
} from '@/components/OutreachTemplateModal'

interface EmailUploaderProps {
  onEmailsExtracted: (emails: string[]) => void
  emails: string[]
  onEmailsChange: (emails: string[]) => void
  onUseTemplate?: (subject: string, body: string) => void
}

export default function EmailUploader({
  onEmailsExtracted,
  emails,
  onEmailsChange,
  onUseTemplate,
}: EmailUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [manualEmail, setManualEmail] = useState('')
  const [pasteHint, setPasteHint] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState('')
  const [emailTemplates, setEmailTemplates] = useState<
    Record<string, GeneratedTemplate>
  >({})

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const extractEmailsFromText = (text: string): string[] => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const extractedEmails = text.match(emailRegex) || []
    return Array.from(new Set(extractedEmails))
  }

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG)')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setIsExtracting(true)
    setExtractedText(null)

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: () => {},
        errorHandler: () => {},
      })
      const ret = await worker.recognize(file)
      const text = ret.data.text
      await worker.terminate()

      const uniqueEmails = extractEmailsFromText(text)

      onEmailsExtracted(uniqueEmails)
      setExtractedText(text)
    } catch (err: any) {
      console.error('OCR error:', err)
      alert(
        'Failed to extract emails from image. ' +
          (err?.message || 'Please try a clearer screenshot or add emails manually.')
      )
    } finally {
      setIsExtracting(false)
    }
  }, [onEmailsExtracted])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (!e.clipboardData || !e.clipboardData.items) return

      const items = Array.from(e.clipboardData.items)
      const imageItem = items.find((item) => item.type.startsWith('image/'))

      if (imageItem) {
        e.preventDefault()
        const file = imageItem.getAsFile()
        if (file) {
          await processFile(file)
        }
      }
    },
    [processFile]
  )

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  useEffect(() => {
    const timer = setTimeout(() => setPasteHint(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const addManualEmail = () => {
    const trimmed = manualEmail.trim()
    if (trimmed && !emails.includes(trimmed)) {
      onEmailsChange([...emails, trimmed])
      setManualEmail('')
    }
  }

  const removeEmail = (email: string) => {
    onEmailsChange(emails.filter((e) => e !== email))
  }

  const openTemplateModal = (email: string) => {
    setSelectedEmail(email)
    setModalOpen(true)
  }

  const closeTemplateModal = () => {
    setModalOpen(false)
    setSelectedEmail('')
  }

  const handleTemplateGenerated = (
    email: string,
    template: GeneratedTemplate
  ) => {
    setEmailTemplates((prev) => ({ ...prev, [email]: template }))
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="screenshot-upload"
        />
        <label htmlFor="screenshot-upload" className="cursor-pointer block">
          {isExtracting ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-gray-600 font-medium">Extracting emails with AI...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Uploaded screenshot"
                    className="max-h-48 rounded-lg shadow-md mx-auto"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setPreviewUrl(null)
                      setExtractedText(null)
                      onEmailsChange([])
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <ImageIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium">
                      Drag & drop your screenshot here
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      or click to browse (PNG, JPG)
                    </p>
                    {pasteHint && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200 animate-in fade-in duration-500">
                        <Clipboard className="w-3 h-3" />
                        You can also paste screenshot with Ctrl+V
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </label>
      </div>

      {extractedText && (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 border border-gray-200">
          <p className="font-semibold mb-1">Raw extracted text preview:</p>
          <p className="line-clamp-3">{extractedText}</p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addManualEmail()}
            placeholder="Add email manually"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <button
          onClick={addManualEmail}
          disabled={!manualEmail.trim()}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Add
        </button>
      </div>

      {emails.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h4 className="font-semibold text-gray-800 text-sm">
              Recipients ({emails.length})
            </h4>
            <button
              onClick={() => onEmailsChange([])}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {emails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {email}
                    </p>
                    {emailTemplates[email] && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Template ready
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => openTemplateModal(email)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md border border-primary-200 transition-colors"
                    title="Generate AI outreach template"
                  >
                    <Sparkles className="w-3 h-3" />
                    {emailTemplates[email] ? 'View' : 'Generate'}
                  </button>
                  <button
                    onClick={() => removeEmail(email)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove email"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <OutreachTemplateModal
        isOpen={modalOpen}
        onClose={closeTemplateModal}
        email={selectedEmail}
        initialTemplate={selectedEmail ? emailTemplates[selectedEmail] || null : null}
        onUseTemplate={onUseTemplate}
      />
    </div>
  )
}
