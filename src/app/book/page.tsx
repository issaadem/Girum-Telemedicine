"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { processPayment } from "@/lib/payments"

interface Doctor {
  id: string
  profiles: { full_name: string } | null
  specialties: { name: string } | null
}

const CONSULTATION_FEE = 500

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"form" | "paying" | "done">("form")

  useEffect(() => {
    async function loadDoctors() {
      const { data } = await supabase
        .from("doctors")
        .select(`id, profiles ( full_name ), specialties ( name )`)
      setDoctors((data as unknown as Doctor[]) || [])
    }
    loadDoctors()
  }, [])

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be logged in to book an appointment.")
      return
    }

    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .insert({
        patient_id: user.id,
        doctor_id: doctorId,
        scheduled_at: scheduledAt,
        status: "pending"
      })
      .select("id")
      .single()

    if (apptError || !appointment) {
      setError(apptError?.message || "Could not create appointment.")
      return
    }

    setStep("paying")

    const result = await processPayment({
      appointmentId: appointment.id,
      patientId: user.id,
      amount: CONSULTATION_FEE,
    })

    if (!result.success) {
      setError(result.error || "Payment failed.")
      setStep("form")
      return
    }

    setStep("done")
  }

  if (step === "done") {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Appointment booked and paid!</h1>
        <p>We&apos;ll notify you once the doctor confirms.</p>
      </div>
    )
  }

  if (step === "paying") {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <p>Processing payment...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Book an Appointment</h1>
      <p className="text-gray-500 mb-6">Consultation fee: {CONSULTATION_FEE} ETB</p>
      <form onSubmit={handleBooking} className="space-y-4">
        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Select a doctor</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.profiles?.full_name}  {doc.specialties?.name}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white rounded p-2">
          Book &amp; Pay {CONSULTATION_FEE} ETB
        </button>
      </form>
    </div>
  )
}