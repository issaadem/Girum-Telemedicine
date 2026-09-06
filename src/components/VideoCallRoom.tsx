"use client"
import { useEffect, useRef } from "react"

interface VideoCallRoomProps {
  roomId: string
  displayName: string
}

interface JitsiMeetAPI {
  dispose: () => void
}

interface JitsiMeetExternalAPIConstructor {
  new (domain: string, options: Record<string, unknown>): JitsiMeetAPI
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiMeetExternalAPIConstructor
  }
}

export default function VideoCallRoom({ roomId, displayName }: VideoCallRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<JitsiMeetAPI | null>(null)

  useEffect(() => {
    let cancelled = false

    function initJitsi() {
      if (cancelled || apiRef.current || !containerRef.current) return
      const JitsiMeetExternalAPI = window.JitsiMeetExternalAPI
      if (!JitsiMeetExternalAPI) return

      apiRef.current = new JitsiMeetExternalAPI("meet.jit.si", {
        roomName: `girum-appointment-${roomId}`,
        parentNode: containerRef.current,
        userInfo: { displayName },
        width: "100%",
        height: "100%",
      })
    }

    const existingScript = document.querySelector('script[src="https://meet.jit.si/external_api.js"]')

    if (window.JitsiMeetExternalAPI) {
      initJitsi()
    } else if (existingScript) {
      existingScript.addEventListener("load", initJitsi)
    } else {
      const script = document.createElement("script")
      script.src = "https://meet.jit.si/external_api.js"
      script.async = true
      script.onload = initJitsi
      document.body.appendChild(script)
    }

    return () => {
      cancelled = true
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [roomId, displayName])

  return <div ref={containerRef} style={{ width: "100%", height: "600px" }} />
}
