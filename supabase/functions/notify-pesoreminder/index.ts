// RecompApp — notifica push "Peso di oggi" (Supabase Edge Function).
//
// Chi la chiama:
//  - il cron di Supabase ogni ora (intestazione x-cron-secret): per ogni telefono iscritto (app='gym'),
//    se nel suo fuso orario sono le 8 e oggi non ha già ricevuto l'avviso, manda il promemoria;
//  - l'app, con il pulsante "Invia una prova" (token dell'utente collegato): invia subito l'anteprima
//    ai telefoni di quell'utente.
//
// Segreti da impostare in Supabase (Edge Functions › Secrets) — nomi con prefisso GYM_ perché il
// progetto è condiviso con Bilancio e Noi Due, che usano altri nomi:
//   GYM_VAPID_PUBLIC_KEY, GYM_VAPID_PRIVATE_KEY, GYM_VAPID_SUBJECT (mailto:tua@email), GYM_CRON_SECRET
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili (condivisi dal progetto).
// In Supabase la funzione va pubblicata con "Verify JWT" disattivato: i controlli sono qui sotto.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const APP = "gym";
const NOTIFY_HOUR = 8; // fisso: promemoria peso alle 8:00 locali
const env = (k: string) => Deno.env.get(k) ?? "";
const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});
webpush.setVapidDetails(
  env("GYM_VAPID_SUBJECT") || "mailto:recompapp@example.com",
  env("GYM_VAPID_PUBLIC_KEY"),
  env("GYM_VAPID_PRIVATE_KEY"),
);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Data e ora locali nel fuso del telefono (gestisce l'ora legale da sola, come Bilancio/Noi Due).
function localNow(tz: string) {
  let zone = tz || "Europe/Rome";
  try { new Intl.DateTimeFormat("en-CA", { timeZone: zone }); } catch { zone = "Europe/Rome"; }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return { today: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

function message() {
  return {
    title: "Peso di oggi",
    body: "Buongiorno! Ricordati di registrare il peso corporeo di oggi in RecompApp.",
    tag: "peso-reminder",
    url: "./",
  };
}

async function send(sub: any, payload: unknown) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 12, urgency: "normal" },
    );
    return "ok";
  } catch (e: any) {
    // 404/410: il telefono ha tolto il permesso o l'app: l'iscrizione non serve più.
    if (e?.statusCode === 404 || e?.statusCode === 410) {
      await admin.from("push_subscriptions").delete().eq("id", sub.id);
      return "gone";
    }
    console.error("push", e?.statusCode, e?.body || e?.message);
    return "error";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Usa POST" }, 405);

  const cron = req.headers.get("x-cron-secret");
  const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");

  /* ---- Prova dall'app ---- */
  if (!cron) {
    const { data: u, error } = await admin.auth.getUser(bearer);
    if (error || !u?.user) return json({ error: "Accesso non valido: rifai l'accesso alla sincronizzazione." }, 401);
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("app", APP)
      .eq("user_id", u.user.id)
      .eq("enabled", true);
    if (!subs?.length) return json({ error: "Nessun telefono iscritto: attiva prima le notifiche." }, 404);
    const results: string[] = [];
    for (const s of subs) results.push(await send(s, message()));
    return json({ sent: results.filter((r) => r === "ok").length, results });
  }

  /* ---- Giro orario dal cron ---- */
  if (!env("GYM_CRON_SECRET") || cron !== env("GYM_CRON_SECRET")) return json({ error: "Segreto non valido" }, 401);
  const { data: subs, error } = await admin.from("push_subscriptions").select("*").eq("app", APP).eq("enabled", true);
  if (error) return json({ error: error.message }, 500);

  let sent = 0, skipped = 0;
  for (const s of subs || []) {
    const { today, hour } = localNow(s.tz);
    if (hour < NOTIFY_HOUR || s.last_sent_day === today) { skipped++; continue; }
    const r = await send(s, message());
    if (r === "ok") sent++;
    // Segna il giorno solo se è andata: se l'invio fallisce si riprova all'ora successiva.
    if (r === "ok") await admin.from("push_subscriptions").update({ last_sent_day: today }).eq("id", s.id);
  }
  return json({ sent, skipped, total: subs?.length || 0 });
});
