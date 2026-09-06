export const dynamic = "force-dynamic"

import { supabase } from "@/lib/supabase"

interface Doctor {
  id: string
  bio: string | null
  profiles: { full_name: string } | null
  specialties: { name: string } | null
}

export default async function DoctorsPage() {
  const { data, error } = await supabase
    .from("doctors")
    .select(`
      id,
      bio,
      specialties ( name ),
      profiles ( full_name )
    `)

  const doctors = data as unknown as Doctor[] | null

  if (error) {
    return <p className="p-8 text-red-600">Error loading doctors: {error.message}</p>
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Our Doctors</h1>
      <div className="space-y-4">
        {doctors?.map((doctor) => (
          <div key={doctor.id} className="border rounded p-4">
            <h2 className="text-lg font-semibold">{doctor.profiles?.full_name}</h2>
            <p className="text-sm text-gray-500">{doctor.specialties?.name}</p>
            <p className="mt-2 text-sm">{doctor.bio}</p>
          </div>
        ))}
        {doctors?.length === 0 && <p>No doctors found.</p>}
      </div>
    </div>
  )
}
