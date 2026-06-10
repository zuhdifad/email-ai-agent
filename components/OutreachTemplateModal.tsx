'use client'

import { useState, useEffect } from 'react'
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
  FileText,
  Plus,
  Bot,
  Bookmark,
} from 'lucide-react'
import {
  GeneratedTemplate,
  extractNameFromEmail,
  getAlibabaDefaultTemplate,
} from '@/lib/templates'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  source: 'ai' | 'default' | 'custom'
}

interface OutreachTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
  initialTemplate?: GeneratedTemplate | null
  onUseTemplate?: (subject: string, body: string) => void
}

type TabMode = 'ai' | 'default' | 'custom'

export default function OutreachTemplateModal({
  isOpen,
  onClose,
  email,
  initialTemplate,
  onUseTemplate,
}: OutreachTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('default')
  const [template, setTemplate] = useState<GeneratedTemplate | null>(
    initialTemplate || null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedSubject, setEditedSubject] = useState('')
  const [editedBody, setEditedBody] = useState('')

  // Custom templates state (persisted in localStorage)
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateSubject, setNewTemplateSubject] = useState('')
  const [newTemplateBody, setNewTemplateBody] = useState('')

  // Selected default/custom template for preview
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(
    null
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('customTemplates')
      if (saved) {
        try {
          setCustomTemplates(JSON.parse(saved))
        } catch {
          setCustomTemplates([])
        }
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && email) {
      setActiveTab('default')
      setSelectedTemplate(null)
      setTemplate(null)
      setError(null)
      setIsEditing(false)
      // Auto-generate default template
      const defaultTmpl = getAlibabaDefaultTemplate(email)
      setSelectedTemplate(defaultTmpl)
    }
  }, [isOpen, email])

  const saveCustomTemplates = (templates: EmailTemplate[]) => {
    setCustomTemplates(templates)
    if (typeof window !== 'undefined') {
      localStorage.setItem('customTemplates', JSON.stringify(templates))
    }
  }

  const handleAddCustomTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateSubject.trim() || !newTemplateBody.trim()) {
      alert('Please fill in all fields')
      return
    }
    const newTemplate: EmailTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName.trim(),
      subject: newTemplateSubject.trim(),
      body: newTemplateBody.trim(),
      source: 'custom',
    }
    const updated = [...customTemplates, newTemplate]
    saveCustomTemplates(updated)
    setShowAddForm(false)
    setNewTemplateName('')
    setNewTemplateSubject('')
    setNewTemplateBody('')
    setSelectedTemplate(newTemplate)
  }

  const handleDeleteCustomTemplate = (id: string) => {
    if (!confirm('Delete this template?')) return
    const updated = customTemplates.filter((t) => t.id !== id)
    saveCustomTemplates(updated)
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null)
    }
  }

  const generateTemplate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const name = extractNameFromEmail(email)
      const company = email.split('@')[1]?.replace(/\..+$/, '')

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
    let textToCopy = ''
    if (activeTab === 'ai' && template) {
      textToCopy = `Subject: ${isEditing ? editedSubject : template.subject_line}\n\n${isEditing ? editedBody : template.template}`
    } else if (selectedTemplate) {
      textToCopy = `Subject: ${selectedTemplate.subject}\n\n${selectedTemplate.body}`
    }

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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
    if (activeTab === 'ai' && template) {
      const subject = isEditing ? editedSubject : template.subject_line
      const body = isEditing ? editedBody : template.template
      onUseTemplate?.(subject, body)
    } else if (selectedTemplate) {
      onUseTemplate?.(selectedTemplate.subject, selectedTemplate.body)
    }
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

  const selectDefaultTemplate = () => {
    const defaultTmpl = getAlibabaDefaultTemplate(email)
    setSelectedTemplate(defaultTmpl)
  }

  if (!isOpen) return null

  const tabs = [
    { key: 'default' as TabMode, label: 'Default Template', icon: Bookmark },
    { key: 'ai' as TabMode, label: 'AI Generate', icon: Bot },
    { key: 'custom' as TabMode, label: 'My Templates', icon: FileText },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Choose Outreach Template
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

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key)
                  setError(null)
                }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors flex-1 justify-center border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-700 bg-primary-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Default Template Tab */}
          {activeTab === 'default' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <strong>Default Intro Template</strong> — Personalized automatically
                for each recipient.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Subject Line
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium">
                    {getAlibabaDefaultTemplate(email).subject}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Email Body
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {getAlibabaDefaultTemplate(email).body}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Generate Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {!template && !isLoading && !error && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-7 h-7 text-primary-500" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    Generate with AI
                  </p>
                  <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
                    Our AI will analyze the email and create a personalized cold
                    outreach template.
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
          )}

          {/* Custom Templates Tab */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Template
                </button>
              )}

              {showAddForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-800 text-sm">
                    Add New Template
                  </h4>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Template name (e.g. 'Follow-up')"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={newTemplateSubject}
                    onChange={(e) => setNewTemplateSubject(e.target.value)}
                    placeholder="Subject line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                  />
                  <textarea
                    value={newTemplateBody}
                    onChange={(e) => setNewTemplateBody(e.target.value)}
                    placeholder="Email body..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCustomTemplate}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                    >
                      Save Template
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Saved custom templates list */}
              {customTemplates.length === 0 && !showAddForm && (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No custom templates yet.</p>
                  <p className="text-xs mt-1">
                    Add your first template above.
                  </p>
                </div>
              )}

              {customTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`cursor-pointer border rounded-lg p-3 transition-colors ${
                    selectedTemplate?.id === tmpl.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {tmpl.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {tmpl.subject}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCustomTemplate(tmpl.id)
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors ml-2 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Preview selected custom template */}
              {selectedTemplate && selectedTemplate.source === 'custom' && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Subject Line
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium">
                      {selectedTemplate.subject}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Email Body
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {selectedTemplate.body}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
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

            {activeTab === 'ai' && template && (
              <>
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
              </>
            )}
          </div>

          <button
            onClick={handleUseTemplate}
            disabled={
              (activeTab === 'ai' && !template) ||
              (activeTab !== 'ai' && !selectedTemplate)
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-3.5 h-3.5" />
            Use This Template
          </button>
        </div>
      </div>
    </div>
  )
}
