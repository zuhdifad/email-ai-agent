import { NextRequest, NextResponse } from 'next/server'
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
});

function buildPrompt(email: string, name?: string, company?: string): string {
  let context = `Email: ${email}`
  if (name) context += `\nName: ${name}`
  if (company) context += `\nCompany/Domain: ${company}`

  return `You are an expert sales outreach specialist. Write a personalized cold outreach email template based on the recipient info below.

${context}

Requirements:
- Subject line: catchy but professional (max 10 words)
- Opening: personalized using the recipient's name or company if available; otherwise use a friendly professional opening
- Value proposition: concise and adaptable to any industry
- Call-to-action: clear and low-pressure
- Sign-off: professional
- Total length: 100-150 words max
- Tone: professional, friendly, consultative (not pushy or salesy)
- Language: English

Return ONLY a valid JSON object with this exact structure:
{
  "subject_line": "...",
  "template": "...",
  "tone": "professional-friendly"
}`
}

function getFallbackTemplate(email: string, name?: string, company?: string) {
  const recipientName = name || company || 'there'
  const companyName = company || 'your company'

  return {
    subject_line: `Quick question for ${companyName}`,
    template: `Hi ${recipientName},\n\nI hope this message finds you well. I came across ${companyName} and was impressed by the work you're doing in your space.\n\nI wanted to reach out because I believe our solution could help streamline your operations and drive meaningful growth for your team. We've worked with similar companies and seen great results.\n\nWould you be open to a brief 10-minute call next week to explore if this could be a fit? No pressure at all — just happy to share how we can help.\n\nLooking forward to hearing from you.\n\nBest regards,`,
    tone: 'professional-friendly',
  }
}

async function tryGenerate(
  email: string,
  name?: string,
  company?: string,
  retries = 2
): Promise<{ subject_line: string; template: string; tone: string }> {
  let lastError: any

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You generate high-converting, personalized cold outreach email templates. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: buildPrompt(email, name, company),
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content)

      if (!parsed.template || !parsed.subject_line) {
        throw new Error('Invalid AI response structure')
      }

      return {
        subject_line: parsed.subject_line,
        template: parsed.template,
        tone: parsed.tone || 'professional-friendly',
      }
    } catch (err) {
      lastError = err
      console.error(`Qwen attempt ${attempt + 1} failed:`, err)
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  console.error('All Qwen retries exhausted. Using fallback template.')
  return getFallbackTemplate(email, name, company)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, company } = body as {
      email: string
      name?: string
      company?: string
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    if (!process.env.DASHSCOPE_API_KEY) {
      return NextResponse.json(
        { error: 'DashScope API key is not configured' },
        { status: 500 }
      )
    }

    const result = await tryGenerate(email, name, company)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Generate template error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate template' },
      { status: 500 }
    )
  }
}
