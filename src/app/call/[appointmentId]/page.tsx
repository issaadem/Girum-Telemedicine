"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import VideoCallRoom from "@/components/VideoCallRoom"

export default function CallPage() {
  const params = useParams()
  const appointmentId = params.appointmentId as string
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to join this call.")
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      setDisplayName(profile?.full_name || "Guest")
      setLoading(false)
    }
    loadUser()
  }, [])

  if (loading) return <p className="p-8">Loading call...</p>
  if (error) return <p className="p-8 text-red-600">{error}</p>

  return (
    <div className="w-full h-screen p-4">
      <h1 className="text-xl font-bold mb-2">Video Consultation</h1>
      <VideoCallRoom roomId={appointmentId} displayName={displayName} />
    </div>
  )
}
