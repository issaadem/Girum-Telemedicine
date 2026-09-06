"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "patient" }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white rounded p-2">
          Sign Up
        </button>
      </form>
    </div>
  )
}
