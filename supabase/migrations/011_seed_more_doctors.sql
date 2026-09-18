update profiles set full_name = 'Dr. Hanna Girma', role = 'doctor'
where id = (select id from auth.users where email = 'dr.hanna@girumhospital.com.et');
update profiles set full_name = 'Dr. Ahmed Nur', role = 'doctor'
where id = (select id from auth.users where email = 'dr.ahmed@girumhospital.com.et');
update profiles set full_name = 'Dr. Meron Alemu', role = 'doctor'
where id = (select id from auth.users where email = 'dr.meron@girumhospital.com.et');
update profiles set full_name = 'Dr. Yusuf Ibrahim', role = 'doctor'
where id = (select id from auth.users where email = 'dr.yusuf@girumhospital.com.et');
update profiles set full_name = 'Dr. Selam Worku', role = 'doctor'
where id = (select id from auth.users where email = 'dr.selam@girumhospital.com.et');
update profiles set full_name = 'Dr. Fatuma Aliyi', role = 'doctor'
where id = (select id from auth.users where email = 'dr.fatuma@girumhospital.com.et');
update profiles set full_name = 'Dr. Kedir Mohammed', role = 'doctor'
where id = (select id from auth.users where email = 'dr.kedir@girumhospital.com.et');

insert into doctors (id, specialty_id, bio)
select p.id, (select id from specialties where name = 'Neurology'), 'Specialist in neurological disorders at Girum Hospital.'
from profiles p join auth.users u on u.id = p.id where u.email = 'dr.hanna@girumhospital.com.et';

insert into doctors (id, specialty_id, bio)
select p.id, (select id from specialties where name = 'Pediatrics'), 'Dedicated pediatrician caring for children at Girum Hospital.'
from profiles p join auth.users u on u.id = p.id where u.email = 'dr.ahmed@girumhospital.com.et';

insert into doctors (id, specialty_id, bio)
select p.id, (select id from specialties where name = 'Dermatology'), 'Skin health specialist at Girum Hospital.'
from profiles p join auth.users u on u.id = p.id where u.email = 'dr.meron@girumhospital.com.et';

insert into doctors (id, specialty_id, bio)
select p.id, (select id from specialties where name = 'Orthopedics'), 'Bone and joint specialist at Girum Hospital.'
from profiles p join auth.users u on u.id = p.id where u.email = 'dr.yusuf@girumhospital.com.et';

insert into doctors (id, specialty_id, bio)
select p.id, (select id from specialties where name = 'Gynecology & Obstetrics'), 'Women''s health and maternity specialist at Girum Hospital.'
from profiles p join auth.users u on u.id = p.id where u.email = 'dr.selam@girumhospital.com.et';

insert into doctors (id, specialty_id, bio)
select p.id, (select id from specialties where name = 'Oncology'), 'Cancer care specialist at Girum Hospital.'
from profiles p join auth.users u on u.id = p.id where u.email = 'dr.fatuma@girumhospital.com.et';

insert into doctors (id, specialty_id, bio)
select p.id, (select id from specialties where name = 'Psychiatry'), 'Mental health specialist at Girum Hospital.'
from profiles p join auth.users u on u.id = p.id where u.email = 'dr.kedir@girumhospital.com.et';