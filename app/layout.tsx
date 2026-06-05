import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Email Agent',
  description: 'Automate your customer emails with AI-powered extraction and sending.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
