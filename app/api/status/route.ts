import { NextRequest, NextResponse } from 'next/server'
import { getAllJobs, clearJobs, deleteJob } from '@/lib/store'

export async function GET() {
  try {
    const jobs = getAllJobs()
    return NextResponse.json({ success: true, jobs })
  } catch (error) {
    console.error('Status fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email status' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      deleteJob(id)
      return NextResponse.json({ success: true, message: 'Job deleted' })
    } else {
      clearJobs()
      return NextResponse.json({ success: true, message: 'All jobs cleared' })
    }
  } catch (error) {
    console.error('Status delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete jobs' },
      { status: 500 }
    )
  }
}
