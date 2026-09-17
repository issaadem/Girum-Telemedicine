import { supabase } from "@/lib/supabase"

interface ProcessPaymentParams {
  appointmentId: string
  patientId: string
  amount: number
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
}

export async function processPayment({ appointmentId, patientId, amount }: ProcessPaymentParams): Promise<PaymentResult> {
  // SIMULATED: no real Telebirr merchant account yet.
  // Replace this function's body with a real Telebirr API call once credentials exist.
  // Everything calling processPayment() stays the same either way.

  const { data, error } = await supabase
    .from("payments")
    .insert({
      appointment_id: appointmentId,
      patient_id: patientId,
      amount,
      currency: "ETB",
      provider: "telebirr",
      status: "paid",
    })
    .select("id")
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, paymentId: data.id }
}