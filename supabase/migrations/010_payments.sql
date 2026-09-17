create table payments (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references appointments(id) not null,
  patient_id uuid references profiles(id) not null,
  amount numeric not null,
  currency text not null default 'ETB',
  provider text not null default 'telebirr',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamp with time zone default now()
);

alter table payments enable row level security;

create policy "Patients can view own payments"
  on payments for select
  using (auth.uid() = patient_id);

create policy "Patients can create own payments"
  on payments for insert
  with check (auth.uid() = patient_id);

create policy "Admins can view all payments"
  on payments for select
  using (is_admin());