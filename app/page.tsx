'use client'

import { useState } from 'react'
import { Mail, Upload, Settings, FileText, Activity, Bot } from 'lucide-react'
import EmailUploader from '@/components/EmailUploader'
import EmailConfig, { SmtpConfig } from '@/components/EmailConfig'
import EmailComposer from '@/components/EmailComposer'
import StatusMonitor from '@/components/StatusMonitor'

type Tab = 'upload' | 'config' | 'compose' | 'status'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [emails, setEmails] = useState<string[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: '',
    port: 587,
    secure: false,
    user: 'zuhdifadh@alibaba-inc.com',
    pass: '',
  })

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'upload', label: 'Upload & Extract', icon: <Upload className="w-4 h-4" /> },
    { key: 'config', label: 'Email Config', icon: <Settings className="w-4 h-4" /> },
    { key: 'compose', label: 'Compose & Send', icon: <FileText className="w-4 h-4" /> },
    { key: 'status', label: 'Monitoring', icon: <Activity className="w-4 h-4" /> },
  ]

  const handleEmailsExtracted = (extracted: string[]) => {
    setEmails(extracted)
  }

  const handleSendComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
    setActiveTab('status')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Email Agent</h1>
              <p className="text-sm text-gray-500">
                Automate customer outreach with AI-powered email extraction and delivery
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <nav className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {activeTab === 'upload' && (
            <div className="space-y-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upload Screenshot & Extract Emails
                </h2>
                <p className="text-sm text-gray-500">
                  Upload a screenshot containing email addresses. Our AI will automatically detect and extract them for you.
                </p>
              </div>
              <EmailUploader
                onEmailsExtracted={handleEmailsExtracted}
                emails={emails}
                onEmailsChange={setEmails}
              />
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Email Account Configuration
                </h2>
                <p className="text-sm text-gray-500">
                  Connect your email account to enable sending. Each agent can use their own credentials here.
                </p>
              </div>
              <EmailConfig config={smtpConfig} onConfigChange={setSmtpConfig} />
            </div>
          )}

          {activeTab === 'compose' && (
            <div className="space-y-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Compose & Send Emails
                </h2>
                <p className="text-sm text-gray-500">
                  Write your message and send it to all extracted recipients in one click.
                </p>
              </div>
              <EmailComposer
                emails={emails}
                smtpConfig={smtpConfig}
                onSendComplete={handleSendComplete}
              />
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Delivery Monitoring
                </h2>
                <p className="text-sm text-gray-500">
                  Track the status of every email sent. See which emails were delivered successfully and which failed.
                </p>
              </div>
              <StatusMonitor refreshTrigger={refreshTrigger} />
            </div>
          )}
        </div>

        <footer className="mt-8 text-center text-xs text-gray-400 pb-6">
          <p>AI Email Agent — Built for automated customer outreach</p>
        </footer>
      </div>
    </main>
  )
}
