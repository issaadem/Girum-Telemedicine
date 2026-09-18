update profiles set full_name = 'Adem Omer'
where full_name = 'Adem';

update profiles set full_name = 'Omer Adem'
where full_name = 'Unnamed';

with new_appt as (
  insert into appointments (patient_id, doctor_id, scheduled_at, status)
  select
    (select id from auth.users where email = 'adem@test.com'),
    (select p.id from profiles p join auth.users u on u.id = p.id where u.email = 'dr.hanna@girumhospital.com.et'),
    now() + interval '2 days',
    'confirmed'
  returning id, patient_id
)
insert into payments (appointment_id, patient_id, amount, status)
select id, patient_id, 500, 'paid' from new_appt;

with new_appt as (
  insert into appointments (patient_id, doctor_id, scheduled_at, status)
  select
    (select id from auth.users where email = 'adem@test.com'),
    (select p.id from profiles p join auth.users u on u.id = p.id where u.email = 'dr.ahmed@girumhospital.com.et'),
    now() - interval '3 days',
    'completed'
  returning id, patient_id, doctor_id
),
new_pay as (
  insert into payments (appointment_id, patient_id, amount, status)
  select id, patient_id, 500, 'paid' from new_appt returning appointment_id
)
insert into prescriptions (appointment_id, patient_id, doctor_id, medication, dosage, instructions)
select a.id, a.patient_id, a.doctor_id, 'Amoxicillin', '500mg three times daily', 'Take with food for 7 days.'
from new_appt a;

insert into appointments (patient_id, doctor_id, scheduled_at, status)
select
  (select id from auth.users where email = 'aadamomar88@gmail.com'),
  (select p.id from profiles p join auth.users u on u.id = p.id where u.email = 'dr.meron@girumhospital.com.et'),
  now() + interval '5 days',
  'pending';

with new_appt as (
  insert into appointments (patient_id, doctor_id, scheduled_at, status)
  select
    (select id from auth.users where email = 'aadamomar88@gmail.com'),
    (select p.id from profiles p join auth.users u on u.id = p.id where u.email = 'dr.selam@girumhospital.com.et'),
    now() + interval '1 days',
    'confirmed'
  returning id, patient_id
)
insert into payments (appointment_id, patient_id, amount, status)
select id, patient_id, 500, 'paid' from new_appt;

with new_appt as (
  insert into appointments (patient_id, doctor_id, scheduled_at, status)
  select
    (select id from auth.users where email = 'adem@test.com'),
    (select p.id from profiles p join auth.users u on u.id = p.id where u.email = 'dr.kedir@girumhospital.com.et'),
    now() - interval '10 days',
    'completed'
  returning id, patient_id
)
insert into payments (appointment_id, patient_id, amount, status)
select id, patient_id, 500, 'paid' from new_appt;