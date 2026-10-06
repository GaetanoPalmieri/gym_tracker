// RecompApp — notifiche push "Peso di oggi" e "Recupero terminato" (Supabase Edge Function).
//
// v1.19.0 — Recupero terminato a telefono bloccato: con lo schermo spento iOS ferma la web app,
// quindi il timer non può far partire l'avviso da solo. L'app scrive l'ora di fine nella tabella
// rest_timers; un cron ogni 5 secondi (solo SQL, gratis) chiama questa funzione con
// {"mode":"rest"} SOLO quando un recupero è scaduto, e qui parte la notifica.
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

// Notifica schematica: ultimo peso registrato e andamento degli ultimi 7 giorni
// (letti dai dati sincronizzati di RecompApp, tabella app_data, app "recomp").
async function loadData(userId: string) {
  try {
    const { data } = await admin.from("app_data").select("data").eq("app", "recomp").eq("user_id", userId).maybeSingle();
    return data?.data ?? null;
  } catch { return null; }
}
function message(data: any = null, today = "") {
  const lb = data?.settings?.weightUnit === "lb";
  const unit = lb ? "lb" : "kg";
  const num = (kg: number) => (Math.round((lb ? kg * 2.2046226218 : kg) * 10) / 10).toLocaleString("it-IT", { maximumFractionDigits: 1 });
  const list = (Array.isArray(data?.bodyWeights) ? data.bodyWeights : [])
    .filter((w: any) => w && w.date && Number(w.kg) > 0)
    .map((w: any) => ({ day: String(w.date).slice(0, 10), kg: Number(w.kg) }))
    .sort((a: any, b: any) => a.day.localeCompare(b.day));
  const lines: string[] = [];
  const last = list[list.length - 1];
  if (last) {
    const days = today ? Math.round((Date.parse(today) - Date.parse(last.day)) / 86400000) : NaN;
    const when = days === 0 ? "oggi" : days === 1 ? "ieri" : days > 1 ? `${days} giorni fa` : last.day;
    lines.push(`🕒 Ultimo ${num(last.kg)} ${unit} · ${when}`);
    const ref = Date.parse(last.day) - 7 * 86400000;
    const before = [...list].reverse().find((w: any) => Date.parse(w.day) <= ref);
    if (before) {
      const d = (lb ? 2.2046226218 : 1) * (last.kg - before.kg);
      const r = Math.round(d * 10) / 10;
      lines.push(r === 0 ? "➖ Stabile in 7 giorni" : `${r < 0 ? "📉 −" : "📈 +"}${Math.abs(r).toLocaleString("it-IT")} ${unit} in 7 giorni`);
    }
  }
  lines.push("👉 Tocca per registrarlo");
  return { title: "⚖️ Peso di oggi", body: lines.join("\n"), tag: "peso-reminder", url: "./" };
}

async function send(sub: any, payload: unknown, opts: { TTL: number; urgency: string } = { TTL: 60 * 60 * 12, urgency: "normal" }) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      opts,
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
    const d0 = await loadData(u.user.id);
    for (const s of subs) results.push(await send(s, message(d0, localNow(s.tz).today)));
    return json({ sent: results.filter((r) => r === "ok").length, results });
  }

  /* ---- Giro orario dal cron ---- */
  if (!env("GYM_CRON_SECRET") || cron !== env("GYM_CRON_SECRET")) return json({ error: "Segreto non valido" }, 401);
  const reqBody: any = await req.json().catch(() => ({}));

  /* ---- Recupero terminato (cron ogni 5 secondi, solo quando c'è un recupero scaduto) ---- */
  if (reqBody?.mode === "rest") {
    const limit = new Date(Date.now() + 2000).toISOString();
    // "Prendo" i recuperi scaduti segnandoli come inviati: così due giri ravvicinati non li mandano due volte.
    const { data: due, error: e1 } = await admin.from("rest_timers").update({ sent: true }).eq("sent", false).lte("fire_at", limit).select("*");
    if (e1) return json({ error: e1.message }, 500);
    let sent = 0;
    for (const t of due || []) {
      const { data: subs } = await admin.from("push_subscriptions").select("*").eq("app", APP).eq("endpoint", t.endpoint).eq("enabled", true);
      const sub = subs?.[0];
      if (!sub) continue;
      const r = await send(sub, { title: "⏱️ Recupero terminato", body: t.body || "▶️ Si riparte", tag: "rest-timer", url: "./" }, { TTL: 120, urgency: "high" });
      if (r === "ok") sent++;
    }
    // pulizia: recuperi già inviati da più di un'ora
    await admin.from("rest_timers").delete().eq("sent", true).lt("fire_at", new Date(Date.now() - 3600000).toISOString());
    return json({ rest: sent, due: due?.length || 0 });
  }
  const { data: subs, error } = await admin.from("push_subscriptions").select("*").eq("app", APP).eq("enabled", true);
  if (error) return json({ error: error.message }, 500);

  let sent = 0, skipped = 0;
  for (const s of subs || []) {
    const { today, hour } = localNow(s.tz);
    if (hour < NOTIFY_HOUR || s.last_sent_day === today) { skipped++; continue; }
    const r = await send(s, message(await loadData(s.user_id), today));
    if (r === "ok") sent++;
    // Segna il giorno solo se è andata: se l'invio fallisce si riprova all'ora successiva.
    if (r === "ok") await admin.from("push_subscriptions").update({ last_sent_day: today }).eq("id", s.id);
  }
  return json({ sent, skipped, total: subs?.length || 0 });
});
