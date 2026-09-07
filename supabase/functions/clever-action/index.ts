import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: appointments, error } = await supabaseAdmin
    .from("appointments")
    .select(`
      id,
      scheduled_at,
      patient:profiles!appointments_patient_id_fkey ( full_name ),
      patientAuth:patient_id
    `)
    .eq("status", "confirmed")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", in24h.toISOString());

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results = [];
  for (const appt of appointments ?? []) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(appt.patientAuth);
    const email = userData?.user?.email;
    if (!email) continue;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Appointment Reminder - Girum Hospital",
        html: `<p>Hi ${appt.patient?.full_name ?? "there"}, this is a reminder about your appointment on ${new Date(appt.scheduled_at).toLocaleString()}.</p>`,
      }),
    });

    const responseBody = await res.text();
    results.push({ appointmentId: appt.id, sent: res.ok, status: res.status, response: responseBody, sentTo: email });
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
