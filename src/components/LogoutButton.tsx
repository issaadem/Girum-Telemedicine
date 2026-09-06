"use client"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <button onClick={handleLogout} className="text-sm underline">
      Log Out
    </button>
  )
}
