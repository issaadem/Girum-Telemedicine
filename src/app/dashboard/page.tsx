"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Appointment {
  id: string
  scheduled_at: string
  status: string
  patient_id: string
  profiles: { full_name: string } | null
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadAppointments() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in as a doctor to view this page.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        scheduled_at,
        status,
        patient_id,
        profiles ( full_name )
      `)
      .eq("doctor_id", user.id)
      .order("scheduled_at", { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setAppointments((data as unknown as Appointment[]) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  async function updateStatus(appointmentId: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", appointmentId)
    loadAppointments()
  }

  if (loading) return <p className="p-8">Loading...</p>
  if (error) return <p className="p-8 text-red-600">{error}</p>

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Your Appointments</h1>
      <div className="space-y-4">
        {appointments.map((appt) => (
          <div key={appt.id} className="border rounded p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{appt.profiles?.full_name}</p>
              <p className="text-sm text-gray-500">
                {new Date(appt.scheduled_at).toLocaleString()} — {appt.status}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {appt.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(appt.id, "confirmed")}
                    className="bg-green-600 text-white px-3 py-2 rounded text-sm"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateStatus(appt.id, "cancelled")}
                    className="bg-red-600 text-white px-3 py-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
              {appt.status === "confirmed" && (
                <Link
                  href={`/prescribe/${appt.id}?patientId=${appt.patient_id}`}
                  className="bg-purple-600 text-white px-3 py-2 rounded text-sm"
                >
                  Prescribe
                </Link>
              )}
              <Link href={`/call/${appt.id}`} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                Join Call
              </Link>
            </div>
          </div>
        ))}
        {appointments.length === 0 && <p>No appointments scheduled.</p>}
      </div>
    </div>
  )
}
