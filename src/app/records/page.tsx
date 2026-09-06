"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Appointment {
  id: string
  scheduled_at: string
  status: string
  doctors: { profiles: { full_name: string } | null; specialties: { name: string } | null } | null
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  instructions: string | null
  created_at: string
}

export default function PatientRecordsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadRecords() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to view your records.")
        setLoading(false)
        return
      }

      const { data: apptData, error: apptError } = await supabase
        .from("appointments")
        .select(`
          id,
          scheduled_at,
          status,
          doctors ( profiles ( full_name ), specialties ( name ) )
        `)
        .eq("patient_id", user.id)
        .order("scheduled_at", { ascending: false })

      const { data: presData, error: presError } = await supabase
        .from("prescriptions")
        .select("id, medication, dosage, instructions, created_at")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false })

      if (apptError || presError) {
        setError(apptError?.message || presError?.message || "Something went wrong.")
      } else {
        setAppointments((apptData as unknown as Appointment[]) || [])
        setPrescriptions((presData as Prescription[]) || [])
      }
      setLoading(false)
    }
    loadRecords()
  }, [])

  if (loading) return <p className="p-8">Loading...</p>
  if (error) return <p className="p-8 text-red-600">{error}</p>

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-6">Your Appointment History</h1>
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="border rounded p-4">
              <p className="font-semibold">{appt.doctors?.profiles?.full_name}</p>
              <p className="text-sm text-gray-500">{appt.doctors?.specialties?.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(appt.scheduled_at).toLocaleString()} — {appt.status}
              </p>
            </div>
          ))}
          {appointments.length === 0 && <p>No appointments yet.</p>}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Your Prescriptions</h2>
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="border rounded p-4">
              <p className="font-semibold">{p.medication} — {p.dosage}</p>
              {p.instructions && <p className="text-sm text-gray-600 mt-1">{p.instructions}</p>}
              <p className="text-sm text-gray-400 mt-1">{new Date(p.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {prescriptions.length === 0 && <p>No prescriptions yet.</p>}
        </div>
      </div>
    </div>
  )
}
