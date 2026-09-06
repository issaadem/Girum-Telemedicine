create policy "Anyone can view doctor profiles"
  on profiles for select
  using (role = 'doctor');
