"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function NavBar() {
  const [role, setRole] = useState<"patient" | "doctor" | "admin" | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      setRole((profile?.role as "patient" | "doctor" | "admin") || null)
      setLoading(false)
    }
    loadRole()
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) return null

  return (
    <header className="border-b">
      <nav className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-bold">Girum Telemedicine</Link>
        <div className="flex items-center gap-4 text-sm">
          {!role && (
            <>
              <Link href="/login">Log In</Link>
              <Link href="/signup">Sign Up</Link>
            </>
          )}
          {role === "patient" && (
            <>
              <Link href="/doctors">Doctors</Link>
              <Link href="/book">Book</Link>
              <Link href="/records">My Records</Link>
              <Link href="/symptom-check">Symptom Checker</Link>
              <Link href="/voice-check">Voice Checker</Link>
            </>
          )}
          {role === "doctor" && <Link href="/dashboard">Dashboard</Link>}
          {role === "admin" && <Link href="/admin">Admin</Link>}
          {role && <button onClick={handleLogout}>Log Out</button>}
        </div>
      </nav>
    </header>
  )
}