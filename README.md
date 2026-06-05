# AI Email Agent

A full-stack Next.js web application that automates customer email outreach using AI-powered screenshot extraction and SMTP delivery monitoring.

## Features

- **AI Email Extraction**: Upload a screenshot containing email addresses, and the app uses OCR (Tesseract.js) to automatically extract them.
- **Manual Email Management**: Add, remove, or clear recipient emails manually alongside extracted ones.
- **SMTP Configuration**: Connect any email provider (Gmail, Outlook, Alibaba Mail, etc.) with a quick preset or custom configuration. Each agent can use their own credentials.
- **Email Composer**: Write subject and body, then send to all recipients in one click.
- **Delivery Monitoring**: Real-time status tracking showing pending, sending, delivered, and failed emails with timestamps.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide React icons
- **Backend**: Next.js App Router with API Routes
- **Email**: Nodemailer (SMTP)
- **OCR**: Tesseract.js
- **Storage**: In-memory store for delivery logs (serverless-friendly)

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

## Usage Guide

### 1. Upload & Extract
- Go to the **Upload & Extract** tab.
- Drag and drop or click to upload a screenshot containing email addresses.
- The AI will automatically extract emails and display them.
- You can also manually add emails using the input box.

### 2. Email Config
- Go to the **Email Config** tab.
- Select a preset (Gmail, Outlook, Alibaba) or use Custom.
- Enter your SMTP host, port, email address, and app password.
- Toggle SSL/TLS if required by your provider.

**Example for Alibaba Mail**:
- Host: `smtp.qiye.aliyun.com`
- Port: `465`
- Secure: `Yes (checked)`
- User: `zuhdifadh@alibaba-inc.com`
- Pass: Your app password

### 3. Compose & Send
- Go to the **Compose & Send** tab.
- Write your email subject and body.
- Click **Send Emails** to deliver to all recipients.
- Results will show how many were delivered or failed.

### 4. Monitoring
- Go to the **Monitoring** tab.
- View real-time stats and a detailed activity log.
- Refresh to update the status.
- Clear history when needed.

## Project Structure

```
ai-email-agent/
├── app/
│   ├── api/
│   │   ├── extract-emails/     # OCR API route
│   │   ├── send-email/         # SMTP sending API route
│   │   └── status/             # Status monitoring API route
│   ├── layout.tsx
│   ├── page.tsx                # Main dashboard
│   └── globals.css
├── components/
│   ├── EmailUploader.tsx       # Screenshot upload & email extraction UI
│   ├── EmailConfig.tsx         # SMTP configuration UI
│   ├── EmailComposer.tsx       # Email composition & sending UI
│   └── StatusMonitor.tsx       # Delivery monitoring UI
├── lib/
│   └── store.ts                # File-based JSON store for email jobs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Security Notes

- SMTP credentials are stored **only in memory** during your session (React state). They are never persisted to disk.
- Email delivery logs are stored in server memory. They may reset when the server restarts (cold start).
- It is strongly recommended to use an **App Password** rather than your main account password.

## Deploy to Production

See [DEPLOY.md](./DEPLOY.md) for a complete guide to deploying this app to **Vercel** so you and your teammates can use it directly from Chrome without any local installation.

## Customization

- To change the default email address shown in the config, edit the `user` field in `app/page.tsx`.
- To add more SMTP presets, extend the `PRESETS` object in `components/EmailConfig.tsx`.

## License

MIT
