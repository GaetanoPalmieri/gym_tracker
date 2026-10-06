-- RecompApp — notifica push "Peso di oggi" (promemoria giornaliero alle 8:00)
-- Da incollare in Supabase › il tuo progetto › SQL Editor › New query › Run (una volta sola).
-- La tabella push_subscriptions è condivisa con Bilancio e Noi Due: qui si aggiunge/riusa solo
-- con app = 'gym'. Se la tabella esiste già (per le altre app) questo script non la ricrea,
-- aggiunge solo le colonne che potrebbero mancare.

create table if not exists public.push_subscriptions (
  id            bigserial primary key,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  app           text not null default 'gym',
  endpoint      text not null unique,
  p256dh        text not null,
  auth          text not null,
  tz            text not null default 'Europe/Rome',
  notify_hour   int  not null default 8 check (notify_hour between 0 and 23),
  show_amounts  boolean not null default false,
  enabled       boolean not null default true,
  last_sent_day date,
  device        text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Se la tabella esisteva già creata da Bilancio/Noi Due, assicura che tutte le colonne usate
-- da RecompApp siano presenti (no-op se già ci sono).
alter table public.push_subscriptions add column if not exists notify_hour int not null default 8 check (notify_hour between 0 and 23);
alter table public.push_subscriptions add column if not exists last_sent_day date;
alter table public.push_subscriptions add column if not exists tz text not null default 'Europe/Rome';

alter table public.push_subscriptions enable row level security;

drop policy if exists "push: solo le mie" on public.push_subscriptions;
create policy "push: solo le mie" on public.push_subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Estensioni per il giro orario (no-op se già installate per le altre app).
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
