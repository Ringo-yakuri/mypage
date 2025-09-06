import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const id = process.env.YOUTUBE_PLAYLIST_ID
  const url = id
    ? `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`
    : 'https://www.youtube.com'
  return NextResponse.redirect(url, 308)
}

