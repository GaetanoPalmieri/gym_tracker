-- Da eseguire DOPO aver pubblicato la funzione notify-pesoreminder (passo 4 della guida).
-- Sostituisci INCOLLA_QUI_GYM_CRON_SECRET con il valore di GYM_CRON_SECRET.
-- Gira ogni ora al minuto 5: la funzione decide da sola a chi tocca (quando per il telefono sono le 8:00 locali).

select cron.unschedule('gym-pesoreminder')
where exists (select 1 from cron.job where jobname = 'gym-pesoreminder');

select cron.schedule(
  'gym-pesoreminder',
  '5 * * * *',
  $$
  select net.http_post(
    url     := 'https://thdlzqhqdktbkpnplxdm.supabase.co/functions/v1/notify-pesoreminder',
    headers := '{"Content-Type":"application/json","x-cron-secret":"INCOLLA_QUI_GYM_CRON_SECRET"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);

-- Per controllare che giri: select * from cron.job_run_details order by start_time desc limit 5;
-- Per vedere le risposte della funzione: select * from net._http_response order by created desc limit 5;
