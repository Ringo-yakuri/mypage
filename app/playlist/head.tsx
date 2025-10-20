const playlistId = process.env.YOUTUBE_PLAYLIST_ID
const playlistUrl = playlistId
  ? `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`
  : 'https://www.youtube.com'

export default function Head() {
  return (
    <>
      <title>Redirecting…</title>
      <meta httpEquiv="refresh" content={`0;url=${playlistUrl}`} />
    </>
  )
}
