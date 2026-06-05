'use client'

import { useState } from 'react'
import { Settings, Eye, EyeOff, Server, User, Lock, Globe } from 'lucide-react'

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}

interface EmailConfigProps {
  config: SmtpConfig
  onConfigChange: (config: SmtpConfig) => void
}

const PRESETS: Record<string, SmtpConfig> = {
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
  },
  outlook: {
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
  },
  alibaba: {
    host: 'smtp.qiye.aliyun.com',
    port: 465,
    secure: true,
    user: '',
    pass: '',
  },
}

export default function EmailConfig({ config, onConfigChange }: EmailConfigProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState('custom')

  const applyPreset = (key: string) => {
    setSelectedPreset(key)
    if (key !== 'custom' && PRESETS[key]) {
      onConfigChange({
        ...PRESETS[key],
        user: config.user,
        pass: config.pass,
      })
    }
  }

  const updateField = (field: keyof SmtpConfig, value: string | number | boolean) => {
    onConfigChange({ ...config, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Preset
        </label>
        <div className="flex gap-2">
          {[
            { key: 'gmail', label: 'Gmail' },
            { key: 'outlook', label: 'Outlook' },
            { key: 'alibaba', label: 'Alibaba' },
            { key: 'custom', label: 'Custom' },
          ].map((preset) => (
            <button
              key={preset.key}
              onClick={() => applyPreset(preset.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                selectedPreset === preset.key
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            SMTP Host
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={config.host}
              onChange={(e) => updateField('host', e.target.value)}
              placeholder="e.g. smtp.gmail.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Port
          </label>
          <div className="relative">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={config.port}
              onChange={(e) => updateField('port', parseInt(e.target.value) || 0)}
              placeholder="587"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email Address (Username)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={config.user}
              onChange={(e) => updateField('user', e.target.value)}
              placeholder="zuhdifadh@alibaba-inc.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password / App Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={config.pass}
              onChange={(e) => updateField('pass', e.target.value)}
              placeholder="Your app password"
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="secure"
          checked={config.secure}
          onChange={(e) => updateField('secure', e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="secure" className="text-sm text-gray-700">
          Use SSL/TLS (secure connection)
        </label>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <strong>Security Tip:</strong> We recommend using an App Password instead of your main account password. This configuration is stored only in memory during your session.
      </div>
    </div>
  )
}
