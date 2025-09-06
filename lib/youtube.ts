import 'server-only'
import { VideoItem } from '@/types/video'

const API = 'https://www.googleapis.com/youtube/v3/playlistItems'

type FetchOptions = {
  max?: number
}

export async function getPlaylistVideos(opts: FetchOptions = {}): Promise<VideoItem[]> {
  const key = process.env.YOUTUBE_API_KEY
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID
  const maxOverall = Number(process.env.MAX_VIDEOS ?? opts.max ?? 100)

  if (!key) throw new Error('Missing YOUTUBE_API_KEY')
  if (!playlistId) throw new Error('Missing YOUTUBE_PLAYLIST_ID')

  const results: VideoItem[] = []
  let pageToken: string | undefined = undefined

  while (results.length < maxOverall) {
    const params = new URLSearchParams({
      key,
      playlistId,
      part: 'snippet,contentDetails',
      maxResults: '50',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const res = await fetch(`${API}?${params.toString()}`, { cache: 'force-cache' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`YouTube API error: ${res.status} ${res.statusText} ${text}`)
    }
    const data = await res.json()

    const items = (data.items ?? []) as any[]
    for (const it of items) {
      const vid = it.contentDetails?.videoId || it.snippet?.resourceId?.videoId
      const title = it.snippet?.title || ''
      const published = it.contentDetails?.videoPublishedAt || it.snippet?.publishedAt
      const thumb =
        it.snippet?.thumbnails?.maxres?.url ||
        it.snippet?.thumbnails?.high?.url ||
        it.snippet?.thumbnails?.medium?.url ||
        it.snippet?.thumbnails?.default?.url ||
        ''

      if (!vid) continue
      results.push({
        id: vid,
        title,
        publishedAt: published,
        thumbnailUrl: thumb,
        url: `https://www.youtube.com/watch?v=${vid}`,
      })
      if (results.length >= maxOverall) break
    }

    pageToken = data.nextPageToken
    if (!pageToken) break
  }

  // Preserve YouTube playlist order (no additional sorting)
  return results
}
