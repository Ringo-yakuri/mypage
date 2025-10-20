const playlistId = process.env.YOUTUBE_PLAYLIST_ID
const playlistUrl = playlistId
  ? `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`
  : 'https://www.youtube.com'

export const dynamic = 'force-static'

export default function PlaylistRedirectPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#2C3A45] to-[#3E4E5A] px-4 text-center text-[#C7CCCF]">
      <h1 className="text-2xl font-semibold text-[#CEA17A]">Redirecting…</h1>
      <p>
        You should be redirected automatically. If not,{' '}
        <a className="underline hover:text-[#CEA17A]" href={playlistUrl}>
          click here to open the playlist.
        </a>
      </p>
    </div>
  )
}
