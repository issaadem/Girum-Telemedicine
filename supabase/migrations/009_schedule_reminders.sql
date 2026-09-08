create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'send-appointment-reminders-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://bfhezxklcixioiyayake.supabase.co/functions/v1/clever-action',
    headers := jsonb_build_object(
      'Authorization', 'Bearer sb_publishable_hqrrqw8LLgOCGh04_AQfcw_RYxpN6_1',
      'Content-Type', 'application/json'
    )
  );
  $$
);
