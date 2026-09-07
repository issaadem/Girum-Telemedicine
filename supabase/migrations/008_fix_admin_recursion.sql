drop policy "Admins can view all profiles" on profiles;
drop policy "Admins can view all appointments" on appointments;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Admins can view all profiles"
  on profiles for select
  using (is_admin());

create policy "Admins can view all appointments"
  on appointments for select
  using (is_admin());
