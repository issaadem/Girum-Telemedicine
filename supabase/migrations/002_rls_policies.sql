-- PROFILES: users can view and update only their own profile, and create it on signup
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- SPECIALTIES: publicly readable by anyone (patients need to browse departments)
alter table specialties enable row level security;

create policy "Anyone can view specialties"
  on specialties for select
  using (true);

-- DOCTORS: publicly readable (patients browse doctors), but only the doctor can update their own row
alter table doctors enable row level security;

create policy "Anyone can view doctors"
  on doctors for select
  using (true);

create policy "Doctors can update own record"
  on doctors for update
  using (auth.uid() = id);

-- APPOINTMENTS: a patient sees their own appointments; a doctor sees appointments booked with them
alter table appointments enable row level security;

create policy "Patients can view own appointments"
  on appointments for select
  using (auth.uid() = patient_id);

create policy "Doctors can view their appointments"
  on appointments for select
  using (auth.uid() = doctor_id);

create policy "Patients can create appointments"
  on appointments for insert
  with check (auth.uid() = patient_id);

create policy "Patients and doctors can update their appointments"
  on appointments for update
  using (auth.uid() = patient_id or auth.uid() = doctor_id);
