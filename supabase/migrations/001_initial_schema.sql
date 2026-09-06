-- Profiles: extends Supabase auth users with role and basic info
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  role text not null check (role in ('patient', 'doctor', 'admin')),
  created_at timestamp with time zone default now()
);

-- Specialties: hospital departments (cardiology, oncology, etc.)
create table specialties (
  id uuid default gen_random_uuid() primary key,
  name text not null unique
);

-- Doctors: links a profile to a specialty
create table doctors (
  id uuid references profiles(id) on delete cascade primary key,
  specialty_id uuid references specialties(id) not null,
  bio text
);

-- Appointments: connects a patient and a doctor at a scheduled time
create table appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references profiles(id) not null,
  doctor_id uuid references doctors(id) not null,
  scheduled_at timestamp with time zone not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default now()
);
