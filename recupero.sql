-- RecompApp 1.19.0 — "Recupero terminato" anche a telefono bloccato.
-- Da incollare in Supabase › SQL Editor › New query › Run (una volta sola),
-- DOPO aver aggiornato la funzione notify-pesoreminder (passo B della guida).
-- Non serve incollare nessuna password: la prende dal cron del promemoria peso già installato.

-- 1) Recupero in corso per ogni telefono (una riga per telefono, la scrive l'app)
create table if not exists public.rest_timers (
  endpoint    text primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  fire_at     timestamptz not null,
  body        text,
  sent        boolean not null default false,
  updated_at  timestamptz not null default now()
);
alter table public.rest_timers enable row level security;
drop policy if exists "recupero: solo i miei" on public.rest_timers;
create policy "recupero: solo i miei" on public.rest_timers
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2) Controllo ogni 5 secondi. È solo una query nel database: la funzione viene chiamata
--    SOLO quando un recupero è scaduto, quindi non consuma nulla quando non ti alleni.
do $$
declare segreto text;
begin
  select substring(command from '"x-cron-secret":"([^"]+)"') into segreto
  from cron.job where jobname = 'gym-pesoreminder';
  if segreto is null or segreto like 'INCOLLA%' then
    raise exception 'Non trovo il segreto: il promemoria peso di RecompApp non è installato (passo 5 della guida)';
  end if;

  perform cron.unschedule('gym-recupero')
  where exists (select 1 from cron.job where jobname = 'gym-recupero');

  perform cron.schedule('gym-recupero', '5 seconds', format(
    $f$ select net.http_post(
          url     := 'https://thdlzqhqdktbkpnplxdm.supabase.co/functions/v1/notify-pesoreminder',
          headers := %L::jsonb,
          body    := '{"mode":"rest"}'::jsonb)
        where exists (select 1 from public.rest_timers where not sent and fire_at <= now() + interval '2 seconds'); $f$,
    json_build_object('Content-Type','application/json','x-cron-secret',segreto)::text));

  -- Il controllo ogni 5 secondi lascia molte righe nello storico dei cron: lo pulisco ogni notte.
  perform cron.unschedule('pulizia-storico-cron')
  where exists (select 1 from cron.job where jobname = 'pulizia-storico-cron');
  perform cron.schedule('pulizia-storico-cron', '30 3 * * *',
    $q$ delete from cron.job_run_details where end_time < now() - interval '3 days' $q$);
end $$;

-- Per controllare: select jobname, schedule from cron.job where jobname like 'gym-%';
