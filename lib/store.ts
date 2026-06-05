export type EmailStatus = 'pending' | 'sending' | 'delivered' | 'failed'

export interface EmailJob {
  id: string
  to: string
  subject: string
  body: string
  status: EmailStatus
  sentAt?: string
  error?: string
}

const jobs: EmailJob[] = []

export function getAllJobs(): EmailJob[] {
  return jobs
}

export function addJob(job: EmailJob) {
  jobs.push(job)
}

export function updateJob(id: string, updates: Partial<EmailJob>) {
  const idx = jobs.findIndex(j => j.id === id)
  if (idx !== -1) {
    jobs[idx] = { ...jobs[idx], ...updates }
  }
}

export function deleteJob(id: string) {
  const idx = jobs.findIndex(j => j.id === id)
  if (idx !== -1) {
    jobs.splice(idx, 1)
  }
}

export function clearJobs() {
  jobs.length = 0
}
