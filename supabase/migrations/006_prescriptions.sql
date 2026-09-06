create table prescriptions (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references appointments(id) not null,
  patient_id uuid references profiles(id) not null,
  doctor_id uuid references doctors(id) not null,
  medication text not null,
  dosage text not null,
  instructions text,
  created_at timestamp with time zone default now()
);

alter table prescriptions enable row level security;

create policy "Patients can view own prescriptions"
  on prescriptions for select
  using (auth.uid() = patient_id);

create policy "Doctors can view prescriptions they wrote"
  on prescriptions for select
  using (auth.uid() = doctor_id);

create policy "Doctors can create prescriptions"
  on prescriptions for insert
  with check (auth.uid() = doctor_id);
