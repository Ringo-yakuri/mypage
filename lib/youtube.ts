import 'server-only'
import { VideoItem } from '@/types/video'

const PLAYLIST_ITEMS_API = 'https://www.googleapis.com/youtube/v3/playlistItems'
const VIDEOS_API = 'https://www.googleapis.com/youtube/v3/videos'

type FetchOptions = {
  max?: number
}

type YTThumbnail = { url?: string }
type YTThumbnails = {
  default?: YTThumbnail
  medium?: YTThumbnail
  high?: YTThumbnail
  maxres?: YTThumbnail
}
type YTSnippet = {
  title?: string
  publishedAt?: string
  resourceId?: { videoId?: string }
  thumbnails?: YTThumbnails
}
type YTContentDetails = {
  videoId?: string
  videoPublishedAt?: string
}
type YTPlaylistItem = {
  snippet?: YTSnippet
  contentDetails?: YTContentDetails
}
type YTPlaylistItemsResponse = {
  items?: YTPlaylistItem[]
  nextPageToken?: string
}

type YTVideoStats = {
  id?: string
  statistics?: {
    viewCount?: string
  }
}

type YTVideosResponse = {
  items?: YTVideoStats[]
}

export type PlaylistFetchResult = {
  videos: VideoItem[]
  totalViews: number
}

async function fetchViewCounts(videoIds: string[], key: string): Promise<Map<string, number>> {
  const viewCounts = new Map<string, number>()
  if (videoIds.length === 0) return viewCounts

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const params = new URLSearchParams({
      key,
      part: 'statistics',
      id: batch.join(','),
    })

    let res: Response
    try {
      res = await fetch(`${VIDEOS_API}?${params.toString()}`, { cache: 'no-store' })
    } catch (error) {
      console.error('YouTube API (videos.list) request failed', error)
      break
    }
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`YouTube API (videos.list) error: ${res.status} ${res.statusText} ${text}`)
    }

    const data: YTVideosResponse = await res.json()
    for (const item of data.items ?? []) {
      const vid = item.id
      if (!vid) continue
      const count = Number(item.statistics?.viewCount ?? 0)
      viewCounts.set(vid, Number.isNaN(count) ? 0 : count)
    }
  }

  return viewCounts
}

export async function getPlaylistVideos(opts: FetchOptions = {}): Promise<PlaylistFetchResult> {
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

    let res: Response
    try {
      res = await fetch(`${PLAYLIST_ITEMS_API}?${params.toString()}`, { cache: 'no-store' })
    } catch (error) {
      console.error('YouTube API request failed', error)
      break
    }
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`YouTube API error: ${res.status} ${res.statusText} ${text}`)
    }
    const data: YTPlaylistItemsResponse = await res.json()

    const items = data.items ?? []
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
        publishedAt: published ?? '',
        thumbnailUrl: thumb,
        url: `https://www.youtube.com/watch?v=${vid}`,
      })
      if (results.length >= maxOverall) break
    }

    pageToken = data.nextPageToken
    if (!pageToken) break
  }

  // Preserve YouTube playlist order, but pin the latest 2 by publishedAt to the front
  const toTime = (s: string) => {
    const t = Date.parse(s)
    return Number.isNaN(t) ? -Infinity : t
  }
  const latestFirst = [...results].sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt))
  const pinned = latestFirst.slice(0, 2)
  const pinnedIds = new Set(pinned.map((v) => v.id))
  const merged: VideoItem[] = []
  for (const v of pinned) merged.push(v)
  for (const v of results) {
    if (!pinnedIds.has(v.id)) merged.push(v)
  }

  const uniqueIds = Array.from(new Set(merged.map((v) => v.id)))
  const viewCounts = await fetchViewCounts(uniqueIds, key)
  const totalViews = Array.from(viewCounts.values()).reduce((sum, count) => sum + count, 0)
  const withViews = merged.map((video) => ({
    ...video,
    viewCount: viewCounts.get(video.id),
  }))

  return { videos: withViews, totalViews }
}
