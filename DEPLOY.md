# Deploy to Vercel (Step-by-Step Guide)

This guide will walk you through deploying the AI Email Agent to Vercel so you and your teammates can access it from any web browser (Chrome, Safari, etc.) without installing Node.js locally.

---

## Step 1: Push to GitHub

### Option A: Using Git Command Line

1. Open terminal / Git Bash in the `ai-email-agent` folder.
2. Create a new repository on GitHub (via https://github.com/new).
   - Name it `ai-email-agent`
   - Make it Public (so teammates can see it) or Private
   - Do NOT initialize with README (we already have one)
3. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/ai-email-agent.git`)
4. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-email-agent.git
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Web UI (No Terminal)

1. Go to https://github.com/new
2. Repository name: `ai-email-agent`
3. Click **Create repository**
4. On the next page, find the section **"…or push an existing repository from the command line"** — follow those commands in your terminal.

---

## Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Sign in with your **GitHub** account.
3. Find and select the `ai-email-agent` repository.
4. Vercel will auto-detect it as a Next.js project.
5. Click **Deploy**.
6. Wait ~1-2 minutes. You will get a live URL like:
   ```
   https://ai-email-agent.vercel.app
   ```

---

## Step 3: Share with Teammates

- Copy the Vercel URL and send it to your teammates.
- They can open it directly in Chrome and use it immediately.
- No installation or setup required on their end.

---

## Step 4: (Optional) Custom Domain

If you want a professional URL:
1. In Vercel Dashboard, go to your project → **Settings** → **Domains**
2. Add your custom domain and follow the DNS instructions.

---

## Important Notes for Serverless

- This app uses **in-memory storage** for email status logs.
- On Vercel (serverless), the memory resets on cold starts. This means:
  - **Email sending still works perfectly**.
  - The Monitoring tab may clear if the server goes idle (after ~15 min of no traffic).
- If you need persistent logs, consider adding **Vercel KV** (Redis) or **Supabase** later.

---

## Troubleshooting

### OCR / Tesseract Issues on Vercel
If email extraction fails after deployment, it may be due to serverless file size limits. You can:
- Use the **manual email input** feature as a fallback.
- Or reduce the image size before uploading.

### SMTP Connection Issues
Some email providers (like Gmail) block SMTP from serverless IPs. Solutions:
- Use an **App Password** instead of your regular password.
- Enable "Less secure app access" (for non-Gmail Workspace accounts).
- For Alibaba Mail, ensure your account has SMTP access enabled.
