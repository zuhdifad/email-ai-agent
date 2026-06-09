import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'OCR has been moved to the browser for better reliability. Please use the upload area on the page to extract emails from images.',
    },
    { status: 410 }
  )
}
