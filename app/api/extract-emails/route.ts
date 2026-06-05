import { NextRequest, NextResponse } from 'next/server'
import { createWorker } from 'tesseract.js'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const fileName = `${uuidv4()}-${file.name}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, buffer)

    const worker = await createWorker('eng')
    const ret = await worker.recognize(filePath)
    const text = ret.data.text
    await worker.terminate()

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const extractedEmails = text.match(emailRegex) || []
    const uniqueEmails = Array.from(new Set(extractedEmails))

    fs.unlinkSync(filePath)

    return NextResponse.json({
      success: true,
      emails: uniqueEmails,
      rawText: text,
    })
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract emails from image' },
      { status: 500 }
    )
  }
}
