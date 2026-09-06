"use client"
import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function PrescribePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const appointmentId = params.appointmentId as string
  const patientId = searchParams.get("patientId") || ""

  const [medication, setMedication] = useState("")
  const [dosage, setDosage] = useState("")
  const [instructions, setInstructions] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in as a doctor.")
      return
    }

    const { error } = await supabase.from("prescriptions").insert({
      appointment_id: appointmentId,
      patient_id: patientId,
      doctor_id: user.id,
      medication,
      dosage,
      instructions,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push("/dashboard"), 1500)
    }
  }

  if (success) {
    return <p className="p-8 text-green-600">Prescription saved. Redirecting...</p>
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Write Prescription</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Medication name"
          value={medication}
          onChange={(e) => setMedication(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Dosage (e.g. 500mg twice daily)"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <textarea
          placeholder="Additional instructions (optional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white rounded p-2">
          Save Prescription
        </button>
      </form>
    </div>
  )
}
