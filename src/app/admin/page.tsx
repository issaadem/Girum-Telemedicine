"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Appointment {
  id: string
  scheduled_at: string
  status: string
  patient: { full_name: string } | null
  doctor: { full_name: string } | null
}

export default function AdminDashboard() {
  const [doctorCount, setDoctorCount] = useState(0)
  const [patientCount, setPatientCount] = useState(0)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadAdminData() {
      const { count: doctors } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "doctor")

      const { count: patients } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "patient")

      const { data: appts, error: apptError } = await supabase
        .from("appointments")
        .select("id, scheduled_at, status, patient_id, doctor_id")
        .order("scheduled_at", { ascending: false })

      if (apptError) {
        setError(apptError.message)
        setLoading(false)
        return
      }

      const patientIds = [...new Set(appts?.map((a) => a.patient_id))]
      const doctorIds = [...new Set(appts?.map((a) => a.doctor_id))]

      const { data: patientProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", patientIds)

      const { data: doctorProfiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", doctorIds)

      const enriched = (appts || []).map((a) => ({
        id: a.id,
        scheduled_at: a.scheduled_at,
        status: a.status,
        patient: patientProfiles?.find((p) => p.id === a.patient_id) || null,
        doctor: doctorProfiles?.find((p) => p.id === a.doctor_id) || null,
      }))

      setDoctorCount(doctors || 0)
      setPatientCount(patients || 0)
      setAppointments(enriched)
      setLoading(false)
    }
    loadAdminData()
  }, [])

  if (loading) return <p className="p-8">Loading...</p>
  if (error) return <p className="p-8 text-red-600">{error}</p>

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded p-4 text-center">
          <p className="text-3xl font-bold">{doctorCount}</p>
          <p className="text-sm text-gray-500">Doctors</p>
        </div>
        <div className="border rounded p-4 text-center">
          <p className="text-3xl font-bold">{patientCount}</p>
          <p className="text-sm text-gray-500">Patients</p>
        </div>
        <div className="border rounded p-4 text-center">
          <p className="text-3xl font-bold">{appointments.length}</p>
          <p className="text-sm text-gray-500">Appointments</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">All Appointments</h2>
      <div className="space-y-3">
        {appointments.map((appt) => (
          <div key={appt.id} className="border rounded p-4">
            <p className="font-semibold">{appt.patient?.full_name} with {appt.doctor?.full_name}</p>
            <p className="text-sm text-gray-500">
              {new Date(appt.scheduled_at).toLocaleString()} — {appt.status}
            </p>
          </div>
        ))}
        {appointments.length === 0 && <p>No appointments yet.</p>}
      </div>
    </div>
  )
}
