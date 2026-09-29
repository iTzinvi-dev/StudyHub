import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"

/**
 * Fullscreen, looping background video.
 *
 * Sits at z-0 behind the glass UI and supplies all of the page's visual depth.
 * `muted` + `playsInline` are what make autoplay legal on iOS/Safari; the ref
 * effect re-asserts them and retries play() for browsers that swallow the
 * first attempt.
 *
 * The clip is ~14 MB with no poster frame, so `.video-loading` paints a slow
 * drifting gradient in the base navy until the first frame is decodable, then
 * pauses itself and fades out.
 */
export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.playsInline = true

    const attemptPlay = () => {
      void video.play().catch(() => {
        /* Autoplay blocked — the loading surface stays up instead. */
      })
    }

    attemptPlay()

    // HAVE_FUTURE_DATA or better: the first frame can already be painted.
    if (video.readyState >= 3) setReady(true)

    video.addEventListener("loadeddata", attemptPlay)
    return () => video.removeEventListener("loadeddata", attemptPlay)
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "video-loading absolute inset-0 z-0 transition-opacity duration-700",
          ready && "is-ready"
        )}
      />
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0"
        )}
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        onError={() => setReady(false)}
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  )
}
