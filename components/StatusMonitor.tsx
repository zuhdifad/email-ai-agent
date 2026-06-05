'use client'

import { useState, useEffect } from 'react'
import {
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Trash2,
  Activity,
} from 'lucide-react'

interface EmailJob {
  id: string
  to: string
  subject: string
  body: string
  status: 'pending' | 'sending' | 'delivered' | 'failed'
  sentAt?: string
  error?: string
}

interface StatusMonitorProps {
  refreshTrigger: number
}

export default function StatusMonitor({ refreshTrigger }: StatusMonitorProps) {
  const [jobs, setJobs] = useState<EmailJob[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchStatus = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/status')
      const data = await res.json()
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (err) {
      console.error('Failed to fetch status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all history?')) return
    try {
      await fetch('/api/status', { method: 'DELETE' })
      setJobs([])
    } catch (err) {
      console.error('Failed to clear:', err)
    }
  }

  const deleteJob = async (id: string) => {
    try {
      await fetch(`/api/status?id=${id}`, { method: 'DELETE' })
      setJobs(jobs.filter((j) => j.id !== id))
    } catch (err) {
      console.error('Failed to delete job:', err)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [refreshTrigger])

  const statusCounts = {
    pending: jobs.filter((j) => j.status === 'pending').length,
    sending: jobs.filter((j) => j.status === 'sending').length,
    delivered: jobs.filter((j) => j.status === 'delivered').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  }

  const getStatusIcon = (status: EmailJob['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'sending':
        return <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: EmailJob['status']) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700 border-gray-200',
      sending: 'bg-primary-50 text-primary-700 border-primary-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
    }
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending', count: statusCounts.pending, color: 'text-gray-600' },
          { label: 'Sending', count: statusCounts.sending, color: 'text-primary-600' },
          { label: 'Delivered', count: statusCounts.delivered, color: 'text-green-600' },
          { label: 'Failed', count: statusCounts.failed, color: 'text-red-600' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-gray-200 rounded-lg p-3 text-center"
          >
            <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-500" />
          <h4 className="font-semibold text-gray-800">
            Activity Log ({jobs.length})
          </h4>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {jobs.length > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white border border-gray-200 rounded-lg">
          <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No emails sent yet.</p>
          <p className="text-xs mt-1">Send your first batch to see activity here.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                    Recipient
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                    Subject
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-600">
                    Time
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs
                  .slice()
                  .reverse()
                  .map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {job.to}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {job.subject}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(job.status)}
                        {job.error && (
                          <p className="text-xs text-red-500 mt-1">{job.error}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {job.sentAt
                          ? new Date(job.sentAt).toLocaleString()
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
