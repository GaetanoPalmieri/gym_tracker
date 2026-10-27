/* ===== ex shared.js (unito qui in v1.18.0) ===== */
const U = {
  cleanText: (s, max = 4000) =>
    String(s ?? '')
      .normalize('NFC')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .slice(0, max),
  esc: (s) =>
    String(s ?? '').replace(
      /[&<>"']/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    ),
  uid: () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
  clone: (v) => JSON.parse(JSON.stringify(v)),
  round: (n) => Math.round((n + Number.EPSILON) * 100) / 100,
  money: (n) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n || 0),
  local: (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
  date: (s) =>
    s
      ? new Date(s).toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Data non disponibile',
  finite: (n) => typeof n === 'number' && Number.isFinite(n),
  validDate: (s) => typeof s === 'string' && Number.isFinite(Date.parse(s)),
  duration: (ms) => {
    const n = Math.max(0, Math.floor(ms / 1000));
    return [Math.floor(n / 3600), Math.floor(n / 60) % 60, n % 60]
      .map((x) => String(x).padStart(2, '0'))
      .join(':');
  },
  download: (name, obj) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },
  toast: (text, undo) => {
    document.querySelector('.app-toast')?.remove();
    const div = document.createElement('div');
    div.className = 'app-toast';
    div.textContent = text;
    if (undo) {
      const b = document.createElement('button');
      b.textContent = 'Annulla';
      b.onclick = () => {
        undo();
        div.remove();
      };
      div.append(b);
    }
    document.body.append(div);
    setTimeout(() => div.remove(), undo ? 12000 : 3500);
  },
  modal: (body) => {
    let d = document.getElementById('editor');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'editor';
      document.body.append(d);
    }
    if (d.open) d.close();
    d.innerHTML = body;
    d.showModal();
    d.querySelector('[data-close]')?.addEventListener('click', () => d.close());
    return d;
  },
  ask: (msg, { ok = 'Conferma', cancel = 'Annulla', danger = null } = {}) =>
    new Promise((res) => {
      const isDanger = danger ?? /elimin|azzera|reset|non è annullabile/i.test(msg);
      let d = document.getElementById('ask-dialog');
      if (!d) {
        d = document.createElement('dialog');
        d.id = 'ask-dialog';
        d.className = 'ask-dialog';
        document.body.append(d);
      }
      if (d.open) d.close();
      d.innerHTML = `<p class="ask-msg">${U.esc(msg)}</p><div class="ask-actions"><button type="button" class="ask-cancel">${U.esc(cancel)}</button><button type="button" class="ask-ok ${isDanger ? 'danger' : ''}">${U.esc(ok)}</button></div>`;
      let settled = false;
      const done = (v) => {
        if (settled) return;
        settled = true;
        d.close();
        res(v);
      };
      d.querySelector('.ask-ok').onclick = () => done(true);
      d.querySelector('.ask-cancel').onclick = () => done(false);
      d.oncancel = (e) => {
        e.preventDefault();
        done(false);
      };
      d.onclick = (e) => {
        if (e.target === d) done(false);
      };
      d.showModal();
      d.querySelector('.ask-cancel').focus();
    }),
  head: (title) =>
    `<div class="row editor-head"><h2>${U.esc(title)}</h2><button type="button" data-close aria-label="Chiudi">✕</button></div>`,
  bounds: (period, day, from, to) => {
    const n = new Date();
    let a = null,
      b = null;
    if (period === 'month') {
      a = new Date(n.getFullYear(), n.getMonth(), 1);
      b = new Date(n.getFullYear(), n.getMonth() + 1, 1);
    }
    if (period === 'week') {
      a = new Date(n.getFullYear(), n.getMonth(), n.getDate());
      a.setDate(a.getDate() - ((a.getDay() + 6) % 7));
      b = new Date(a);
      b.setDate(b.getDate() + 7);
    }
    if (period === 'year') {
      a = new Date(n.getFullYear(), 0, 1);
      b = new Date(n.getFullYear() + 1, 0, 1);
    }
    if (period === 'day' && day) {
      a = new Date(day + 'T00:00');
      b = new Date(a);
      b.setDate(b.getDate() + 1);
    }
    if (period === 'custom') {
      if (from) a = new Date(from + 'T00:00');
      if (to) {
        b = new Date(to + 'T00:00');
        b.setDate(b.getDate() + 1);
      }
    }
    return [a, b];
  },
  inRange: (s, bounds) => {
    if (!U.validDate(s)) return false;
    const t = new Date(s);
    return (!bounds[0] || t >= bounds[0]) && (!bounds[1] || t < bounds[1]);
  },
  calendar: (month, selected, summary) => {
    const d = new Date(month + '-01T12:00'),
      y = d.getFullYear(),
      m = d.getMonth(),
      offset = (d.getDay() + 6) % 7,
      count = new Date(y, m + 1, 0).getDate();
    return `<div class="calendar"><div class="row"><button data-month="-1" aria-label="Mese precedente">‹</button><b>${d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</b><button data-month="1" aria-label="Mese successivo">›</button></div><div class="calendar-grid">${['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((x) => `<small>${x}</small>`).join('')}${'<span></span>'.repeat(offset)}${Array.from(
      { length: count },
      (_, i) => {
        const key = `${month}-${String(i + 1).padStart(2, '0')}`,
          v = summary(key);
        return `<button class="${key === selected ? 'chosen' : ''}" data-day="${key}"><b>${i + 1}</b>${v ? `<small>${U.esc(v)}</small>` : ''}</button>`;
      },
    ).join('')}</div></div>`;
  },
  shiftMonth: (month, delta) => {
    const d = new Date(month + '-01T12:00');
    d.setMonth(d.getMonth() + delta);
    return U.local(d).slice(0, 7);
  },
  /* v1.30.0 — Grafico dei progressi: scala sui valori veri (non più da 0, che appiattiva i
     progressi), massimo e minimo con la virgola, ultimo valore in evidenza, date brevi. */
  chart: (points, label) => {
    if (!points.length) return '<div class="empty">Nessun dato disponibile per il periodo selezionato.</div>';
    const values = points.map((p) => p.value),
      vMin = Math.min(...values),
      vMax = Math.max(...values),
      spanV = Math.max(vMax - vMin, Math.max(Math.abs(vMax) * 0.05, 1)),
      lo = Math.max(0, vMin - spanV * 0.25),
      hi = vMax + spanV * 0.25,
      first = Date.parse(points[0].date),
      last = Date.parse(points.at(-1).date),
      yOf = (v) => 150 - ((v - lo) / (hi - lo || 1)) * 120,
      n = (v) => String(Math.round(v * 10) / 10).replace('.', ','),
      dd = (iso) => new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
      pos = points.map((p, i) => ({
        x: last === first ? 190 : 48 + ((Date.parse(p.date) - first) / (last - first)) * 290,
        y: yOf(p.value),
      })),
      lp = pos.at(-1),
      axis = vMax === vMin
        ? `<text x="0" y="${yOf(vMax) + 4}">${n(vMax)}</text>`
        : `<text x="0" y="${yOf(vMax) + 4}">${n(vMax)}</text><text x="0" y="${yOf(vMin) + 4}">${n(vMin)}</text><path d="M44 ${yOf(vMax)}H350M44 ${yOf(vMin)}H350" stroke="#52616c" stroke-opacity=".25" stroke-dasharray="3 4"/>`;
    return `<svg class="touch-chart" viewBox="0 0 380 190" role="img" aria-label="${U.esc(label)}"><path d="M48 20V150H350" fill="none" stroke="#52616c"/>${axis}<text class="trend-last" x="${Math.min(lp.x, 336)}" y="${Math.max(14, lp.y - 11)}" text-anchor="middle">${n(values.at(-1))}</text><polyline points="${pos.map((p) => p.x + ',' + p.y).join(' ')}" fill="none" stroke="#55c3a7" stroke-width="3"/>${pos.map((p, i) => `<g class="chart-point" tabindex="0" role="button" aria-label="${U.esc(points[i].detail)}" data-chart-point="${i}"><circle cx="${p.x}" cy="${p.y}" r="18" fill="transparent"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="#e8a33d"/></g>`).join('')}<text x="48" y="180">${dd(points[0].date)}</text><text x="350" y="180" text-anchor="end">${dd(points.at(-1).date)}</text></svg><p class="chart-detail muted" aria-live="polite">Tocca un punto per vedere il dettaglio.</p>`;
  },
  bindChart: (root, points) =>
    root.querySelectorAll('[data-chart-point]').forEach((b) => {
      const action = () => {
        root.querySelector('.chart-detail').textContent = points[Number(b.dataset.chartPoint)].detail;
      };
      b.onclick = action;
      b.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          action();
        }
      };
    }),
};

/* ===================== DATI PROGRAMMA ===================== */
const COMMON_FINISH = [
  {name:"Tapis roulant — camminata in pendenza", sets:1, reps:"20-25 min", rest:0, move:"cardio",
    note:"Cardio a ritmo moderato (zona 2: un po' affannoso ma riesci a parlare). Aiuta il deficit calorico; gli addominali rinforzano il core ma non esiste il dimagrimento localizzato."},
  {name:"Esercizi di Kegel (pavimento pelvico)", sets:3, reps:"10 contrazioni (5\" tieni + 5\" rilascia)", rest:15, move:"kegel",
    note:"Contrai i muscoli del pavimento pelvico, tieni 5 secondi e rilascia 5 secondi. Evita di trattenere il respiro."},
];

const ABS_ROUTINE = {
  d1:[
    {name:"Crunch ai cavi in ginocchio", sets:3, reps:"12-15", rest:30, move:"core",
      note:"Fletti il busto portando le costole verso il bacino. Non tirare con le braccia e mantieni il bacino stabile."},
    {name:"Pallof press ai cavi", sets:3, reps:"12 per lato", rest:30, move:"core",
      note:"Anti-rotazione: spingi le mani davanti al petto senza lasciare ruotare il busto. Core e glutei attivi."},
  ],
  d2:[
    {name:"Knee raise alla captain chair", sets:3, reps:"10-15", rest:45, move:"core",
      note:"Porta le ginocchia verso il petto con controllo e chiudi leggermente il bacino in alto. Evita slanci."},
    {name:"Dead bug controllato", sets:3, reps:"10 per lato", rest:30, move:"core",
      note:"Zona lombare aderente al pavimento. Allunga lentamente braccio e gamba opposti senza perdere la posizione."},
  ],
  d3:[],
  d4:[
    {name:"Ab wheel rollout", sets:3, reps:"8-12", rest:45, move:"core",
      note:"Parti in ginocchio, glutei e addome contratti. Allunga solo fin dove riesci a mantenere la zona lombare neutra."},
    {name:"Side plank", sets:3, reps:"30-45 sec per lato", rest:30, move:"core",
      note:"Corpo in linea, bacino alto e addome attivo. Mantieni senza ruotare il tronco."},
  ],
};

/* 1.12.0 — Scheda FULL BODY: 3 giorni completi + 1 giorno di richiamo/aerobico opzionale.
   Ordine fisso in ogni giorno: cardio (riscaldamento) → Kegel → addominali → esercizi con i pesi.
   Blocco di 8 settimane (2 mesi): a fine blocco serve il check fisico per generare i 2 mesi successivi. */
const CARDIO_START = (reps) => ({name:"Tapis roulant — camminata in pendenza", sets:1, reps, rest:0, move:"cardio",
  note:"Cardio a ritmo moderato (zona 2: un po' affannoso ma riesci a parlare). Aiuta il deficit calorico; gli addominali rinforzano il core ma non esiste il dimagrimento localizzato."});
const KEGEL_START = {name:"Esercizi di Kegel (pavimento pelvico)", sets:3, reps:"10 contrazioni (5\" tieni + 5\" rilascia)", rest:15, move:"kegel",
  note:"Contrai i muscoli del pavimento pelvico, tieni 5 secondi e rilascia 5 secondi. Evita di trattenere il respiro."};

/* 1.27.0 — Scheda per la MASSA su 3 giorni, 2 gruppi muscolari per giorno + giorno 4 facoltativo
   (punti deboli: deltoidi e braccia, addome, cardio). Stessi nomi = stessi esercizi: lo storico dei carichi resta collegato. */
const DAYS = [
  {
    "key": "d1",
    "name": "Petto e tricipiti",
    "short": "G1 · Petto + Tricipiti",
    "exercises": [
      {
        "name": "Tapis roulant — camminata in pendenza",
        "sets": 1,
        "reps": "8-10 min",
        "rest": 0,
        "move": "cardio",
        "note": "Solo riscaldamento: ritmo tranquillo. In fase di massa il cardio lungo si fa nel giorno 4."
      },
      {
        "name": "Esercizi di Kegel (pavimento pelvico)",
        "sets": 3,
        "reps": "10 contrazioni (5\" tieni + 5\" rilascia)",
        "rest": 15,
        "move": "kegel",
        "note": "Contrai i muscoli del pavimento pelvico, tieni 5 secondi e rilascia 5 secondi. Evita di trattenere il respiro."
      },
      {
        "name": "Crunch ai cavi in ginocchio",
        "sets": 3,
        "reps": "12-15",
        "rest": 45,
        "move": "core",
        "note": "Fletti il busto portando le costole verso il bacino. Non tirare con le braccia e mantieni il bacino stabile."
      },
      {
        "name": "Panca piana con bilanciere",
        "sets": 4,
        "reps": "6-8",
        "rest": 90,
        "compound": true,
        "move": "vertical_press",
        "note": "Esercizio principale del giorno. Ultimo dato: 30 kg × 8/7/7/6: resta a 30 kg finché non chiudi 4×8, poi +2,5 kg. Scapole retratte, discesa in 2-3 secondi, barra a metà petto."
      },
      {
        "name": "Panca inclinata con manubri (30°)",
        "sets": 3,
        "reps": "8-10",
        "rest": 90,
        "move": "vertical_press",
        "note": "Petto alto. Ultimo dato 12 kg per manubrio: quando chiudi 3×10 passa a 14 kg."
      },
      {
        "name": "Croci ai cavi (cable fly)",
        "sets": 3,
        "reps": "12-15",
        "rest": 60,
        "move": "fly",
        "note": "Tensione continua su tutto il movimento, breve pausa in massima contrazione al centro."
      },
      {
        "name": "Push down tricipiti ai cavi",
        "sets": 3,
        "reps": "10-12",
        "rest": 60,
        "move": "vertical_press",
        "note": "Gomiti fissi lungo il fianco: si muove solo l'avambraccio. Estensione completa in basso."
      },
      {
        "name": "French press con manubrio",
        "sets": 3,
        "reps": "10-12",
        "rest": 60,
        "move": "vertical_press",
        "note": "Gomiti stretti e fermi, scendi dietro la testa senza aprire i gomiti verso l'esterno."
      }
    ]
  },
  {
    "key": "d2",
    "name": "Dorso e bicipiti",
    "short": "G2 · Dorso + Bicipiti",
    "exercises": [
      {
        "name": "Tapis roulant — camminata in pendenza",
        "sets": 1,
        "reps": "8-10 min",
        "rest": 0,
        "move": "cardio",
        "note": "Solo riscaldamento: ritmo tranquillo. In fase di massa il cardio lungo si fa nel giorno 4."
      },
      {
        "name": "Esercizi di Kegel (pavimento pelvico)",
        "sets": 3,
        "reps": "10 contrazioni (5\" tieni + 5\" rilascia)",
        "rest": 15,
        "move": "kegel",
        "note": "Contrai i muscoli del pavimento pelvico, tieni 5 secondi e rilascia 5 secondi. Evita di trattenere il respiro."
      },
      {
        "name": "Knee raise alla captain chair",
        "sets": 3,
        "reps": "10-15",
        "rest": 45,
        "move": "core",
        "note": "Porta le ginocchia verso il petto con controllo e chiudi leggermente il bacino in alto. Evita slanci."
      },
      {
        "name": "Lat machine presa larga",
        "sets": 4,
        "reps": "8-10",
        "rest": 90,
        "move": "vertical_pull",
        "note": "Esercizio principale del giorno. Ultimo dato 30 kg: quando chiudi 4×10 aumenta di 5 kg. Tira verso il petto, niente slancio con il busto.",
        "compound": true
      },
      {
        "name": "Rematore con manubrio monolaterale",
        "sets": 3,
        "reps": "8-10",
        "rest": 75,
        "move": "horizontal_pull",
        "note": "Ultimo dato 10 kg: è leggero per te, prova 14-16 kg mantenendo la tecnica. Gomito verso l'anca.",
        "compound": true
      },
      {
        "name": "Pulley basso (seated row)",
        "sets": 3,
        "reps": "10-12",
        "rest": 75,
        "move": "horizontal_pull",
        "note": "Petto alto, tira verso l'ombelico, controlla sempre il ritorno senza far \"cadere\" il peso."
      },
      {
        "name": "Face pull ai cavi",
        "sets": 3,
        "reps": "12-15",
        "rest": 45,
        "move": "lateral_raise",
        "note": "Punto debole - deltoide posteriore: tira verso il viso con i gomiti alti. Ottimo anche per la postura delle spalle."
      },
      {
        "name": "Curl bicipiti con bilanciere",
        "sets": 3,
        "reps": "8-10",
        "rest": 60,
        "move": "curl",
        "note": "Punto debole - braccia: gomiti fermi, niente slancio. Quando chiudi 3×10 aggiungi 2,5 kg."
      },
      {
        "name": "Curl a martello con manubri",
        "sets": 3,
        "reps": "10-12",
        "rest": 60,
        "move": "curl",
        "note": "Presa neutra (palmi rivolti verso il corpo): lavora anche il brachiale, utile per braccia più \"piene\"."
      }
    ]
  },
  {
    "key": "d3",
    "name": "Gambe e spalle",
    "short": "G3 · Gambe + Spalle",
    "exercises": [
      {
        "name": "Tapis roulant — camminata in pendenza",
        "sets": 1,
        "reps": "8-10 min",
        "rest": 0,
        "move": "cardio",
        "note": "Solo riscaldamento: scalda bene le ginocchia prima della leg press."
      },
      {
        "name": "Esercizi di Kegel (pavimento pelvico)",
        "sets": 3,
        "reps": "10 contrazioni (5\" tieni + 5\" rilascia)",
        "rest": 15,
        "move": "kegel",
        "note": "Contrai i muscoli del pavimento pelvico, tieni 5 secondi e rilascia 5 secondi. Evita di trattenere il respiro."
      },
      {
        "name": "Ab wheel rollout",
        "sets": 3,
        "reps": "8-12",
        "rest": 45,
        "move": "core",
        "note": "Parti in ginocchio, glutei e addome contratti. Allunga solo fin dove riesci a mantenere la zona lombare neutra."
      },
      {
        "name": "Leg press 45°",
        "sets": 4,
        "reps": "8-10",
        "rest": 90,
        "compound": true,
        "move": "leg_press",
        "note": "ATTENZIONE GINOCCHIO: piedi larghezza spalle, scendi solo fino a dove NON senti fastidio (circa 90° di flessione), non bloccare le ginocchia in estensione completa in alto."
      },
      {
        "name": "Stacco rumeno con bilanciere",
        "sets": 3,
        "reps": "8-10",
        "rest": 90,
        "compound": true,
        "move": "hinge",
        "note": "Ultimo dato 10 kg × 12: troppo leggero, passa a 20-25 kg e fai 8-10 ripetizioni. Schiena neutra, bilanciere vicino alle gambe."
      },
      {
        "name": "Leg curl sdraiato/seduto",
        "sets": 3,
        "reps": "10-12",
        "rest": 60,
        "move": "leg_press",
        "note": "Contrazione piena dei femorali in ogni ripetizione, evita strappi con inerzia."
      },
      {
        "name": "Leg extension",
        "sets": 3,
        "reps": "12-15",
        "rest": 60,
        "move": "leg_press",
        "note": "Carico moderato e movimento lento: rinforza il ginocchio senza lo stress da carico assiale dello squat pesante."
      },
      {
        "name": "Lento avanti con manubri, seduto",
        "sets": 3,
        "reps": "8-10",
        "rest": 90,
        "move": "vertical_press",
        "note": "Ultimo dato 10 kg per manubrio. Core stabile, non inarcare la schiena.",
        "compound": true
      },
      {
        "name": "Alzate laterali con manubri",
        "sets": 4,
        "reps": "12-15",
        "rest": 45,
        "move": "lateral_raise",
        "note": "Punto debole - deltoidi: gomito leggermente flesso, salita fino all'altezza della spalla, nessuno slancio con il busto. Se serve, riduci il peso per fare tutte le ripetizioni in modo pulito."
      },
      {
        "name": "Calf raise in piedi",
        "sets": 3,
        "reps": "12-15",
        "rest": 45,
        "move": "leg_press",
        "note": "Range di movimento completo, pausa di 1 secondo in massima estensione."
      }
    ]
  },
  {
    "key": "d4",
    "name": "Punti deboli · Addome e cardio",
    "short": "G4 · Punti deboli",
    "optional": true,
    "exercises": [
      {
        "name": "Esercizi di Kegel (pavimento pelvico)",
        "sets": 3,
        "reps": "10 contrazioni (5\" tieni + 5\" rilascia)",
        "rest": 15,
        "move": "kegel",
        "note": "Contrai i muscoli del pavimento pelvico, tieni 5 secondi e rilascia 5 secondi. Evita di trattenere il respiro."
      },
      {
        "name": "Plank frontale",
        "sets": 3,
        "reps": "30-45 sec",
        "rest": 30,
        "move": "core",
        "note": "Gomiti sotto le spalle, corpo in linea da testa a talloni. Glutei e addome contratti, respira senza far cedere la zona lombare."
      },
      {
        "name": "Crunch inverso su panca",
        "sets": 3,
        "reps": "12-15",
        "rest": 30,
        "move": "core",
        "note": "Arrotola il bacino verso il petto senza slancio e scendi lentamente. Il lavoro è dell'addome, non delle gambe."
      },
      {
        "name": "Side plank",
        "sets": 2,
        "reps": "30-45 sec per lato",
        "rest": 30,
        "move": "core",
        "note": "Corpo in linea, bacino alto e addome attivo. Mantieni senza ruotare il tronco."
      },
      {
        "name": "Arnold press con manubri",
        "sets": 3,
        "reps": "10-12",
        "rest": 75,
        "move": "vertical_press",
        "note": "Punto debole - deltoidi: rotazione fluida del polso, deltoide anteriore e laterale insieme. Carico più leggero del lento avanti."
      },
      {
        "name": "Alzate laterali ai cavi (unilaterale)",
        "sets": 3,
        "reps": "12-15 per lato",
        "rest": 30,
        "move": "lateral_raise",
        "note": "Punto debole - deltoidi: il cavo mantiene tensione costante anche in basso, più efficace del manubrio su questo esercizio."
      },
      {
        "name": "Alzate posteriori (rear delt fly) su panca inclinata",
        "sets": 3,
        "reps": "15-20",
        "rest": 30,
        "move": "lateral_raise",
        "note": "Punto debole - deltoide posteriore: busto appoggiato alla panca, peso leggero e movimento controllato, niente slancio."
      },
      {
        "name": "Curl 21 (bicipiti, manubri leggeri)",
        "sets": 2,
        "reps": "21 (7+7+7)",
        "rest": 60,
        "move": "curl",
        "note": "Punto debole - braccia: 7 ripetizioni nella metà bassa del movimento + 7 nella metà alta + 7 complete. Usa un peso leggero: brucia molto ma dà grande volume alle braccia."
      },
      {
        "name": "Push down tricipiti ai cavi",
        "sets": 3,
        "reps": "15-20",
        "rest": 45,
        "move": "vertical_press",
        "note": "Punto debole - braccia: carico leggero, ripetizioni alte, estensione completa. Fai curl 21 e push down uno dopo l'altro (superserie) per risparmiare tempo."
      },
      {
        "name": "Tapis roulant — camminata in pendenza",
        "sets": 1,
        "reps": "20-25 min",
        "rest": 0,
        "move": "cardio",
        "note": "Cardio in zona 2 alla fine: fa bene al cuore e al recupero. In massa non serve di più: non trasformarlo in corsa."
      }
    ]
  }
];

/* Blocco di 8 settimane per un livello intermedio: si parte subito con carichi di lavoro reali,
   progressione per 7 settimane e un solo scarico nella settimana 8 (insieme al check fisico).
   Doppia progressione: prima si sale di ripetizioni fino al massimo del range, poi si aumenta il carico. */
const BLOCK_WEEKS = 4;
const PROGRESSION_TEXT = {
  1: "Settimana 1 — partenza: usa i carichi delle ultime sessioni e lascia 2 ripetizioni in riserva. Su stacco rumeno e rematore i pesi erano troppo leggeri: alzali subito (vedi nota dell'esercizio).",
  2: "Settimana 2 — doppia progressione: aggiungi ripetizioni fino al massimo del range; quando ci arrivi in tutte le serie aumenta il carico (+2,5 kg sui multiarticolari, +1-2 kg sui complementari). 1 ripetizione in riserva.",
  3: "Settimana 3 — la più dura: multiarticolari a 1 ripetizione in riserva, ultima serie dei complementari vicina al cedimento tecnico. Prova a battere i numeri della settimana 1.",
  4: "Settimana 4 — consolidamento e CHECK: stessi carichi della settimana 3 con una serie in meno sui multiarticolari. A fine settimana pesati e fai il check fisico (Altro → Check fisico) per le prossime 4 settimane.",
};
/* Schema delle ripetizioni dei blocchi successivi (generati dopo il check fisico):
   i blocchi pari spostano i multiarticolari verso la forza, quelli dispari tornano all'ipertrofia. */
const BLOCK_REP_SCHEMES = {
  strength: { compound: "5-7", accessory: "8-10" },
  hypertrophy: null,
};

const ANIM_SVG = {
  vertical_press: `<svg viewBox="0 0 200 130"><line x1="30" y1="105" x2="170" y2="105" stroke="#3a4a56" stroke-width="4"/>
    <g><rect x="70" y="35" width="60" height="10" rx="4" fill="#2f9e8f"/><circle cx="70" cy="40" r="13" fill="#e8a33d"/><circle cx="130" cy="40" r="13" fill="#e8a33d"/>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 32;0 0" dur="1.5s" repeatCount="indefinite"/></g></svg>`,
  vertical_pull: `<svg viewBox="0 0 200 130"><rect x="80" y="92" width="40" height="28" rx="6" fill="#3a4a56"/>
    <g><rect x="55" y="14" width="90" height="9" rx="4" fill="#2f9e8f"/><circle cx="60" cy="18" r="10" fill="#e8a33d"/><circle cx="140" cy="18" r="10" fill="#e8a33d"/>
    <animateTransform attributeName="transform" type="translate" values="0 0;0 48;0 0" dur="1.5s" repeatCount="indefinite"/></g></svg>`,
  horizontal_pull: `<svg viewBox="0 0 200 130"><rect x="15" y="58" width="32" height="32" rx="6" fill="#3a4a56"/>
    <g><rect x="115" y="66" width="55" height="9" rx="4" fill="#2f9e8f"/><circle cx="170" cy="70" r="11" fill="#e8a33d"/>
    <animateTransform attributeName="transform" type="translate" values="0 0;-65 0;0 0" dur="1.5s" repeatCount="indefinite"/></g></svg>`,
  hinge: `<svg viewBox="0 0 200 130"><circle cx="100" cy="28" r="10" fill="#e8a33d"/>
    <line x1="100" y1="72" x2="90" y2="118" stroke="#3a4a56" stroke-width="6"/><line x1="100" y1="72" x2="110" y2="118" stroke="#3a4a56" stroke-width="6"/>
    <g><line x1="100" y1="38" x2="100" y2="72" stroke="#2f9e8f" stroke-width="6"/>
    <animateTransform attributeName="transform" type="rotate" values="0 100 72;35 100 72;0 100 72" dur="1.7s" repeatCount="indefinite"/></g></svg>`,
  leg_press: `<svg viewBox="0 0 200 130"><circle cx="55" cy="35" r="8" fill="#e8a33d"/><line x1="55" y1="35" x2="120" y2="70" stroke="#3a4a56" stroke-width="6"/>
    <g><line x1="120" y1="70" x2="150" y2="30" stroke="#2f9e8f" stroke-width="6"/>
    <animateTransform attributeName="transform" type="rotate" values="0 120 70;-38 120 70;0 120 70" dur="1.5s" repeatCount="indefinite"/></g></svg>`,
  lateral_raise: `<svg viewBox="0 0 200 130"><circle cx="100" cy="28" r="10" fill="#e8a33d"/><line x1="100" y1="45" x2="100" y2="95" stroke="#3a4a56" stroke-width="6"/>
    <g><line x1="100" y1="45" x2="100" y2="90" stroke="#2f9e8f" stroke-width="6"/><animateTransform attributeName="transform" type="rotate" values="0 100 45;-82 100 45;0 100 45" dur="1.5s" repeatCount="indefinite"/></g>
    <g><line x1="100" y1="45" x2="100" y2="90" stroke="#2f9e8f" stroke-width="6"/><animateTransform attributeName="transform" type="rotate" values="0 100 45;82 100 45;0 100 45" dur="1.5s" repeatCount="indefinite"/></g></svg>`,
  curl: `<svg viewBox="0 0 200 130"><line x1="90" y1="25" x2="90" y2="78" stroke="#3a4a56" stroke-width="6"/>
    <g><line x1="90" y1="78" x2="90" y2="122" stroke="#2f9e8f" stroke-width="6"/><circle cx="90" cy="122" r="8" fill="#e8a33d"/>
    <animateTransform attributeName="transform" type="rotate" values="0 90 78;-112 90 78;0 90 78" dur="1.5s" repeatCount="indefinite"/></g></svg>`,
  fly: `<svg viewBox="0 0 200 130"><circle cx="100" cy="28" r="10" fill="#e8a33d"/><line x1="100" y1="45" x2="100" y2="102" stroke="#3a4a56" stroke-width="6"/>
    <g><line x1="100" y1="55" x2="100" y2="100" stroke="#2f9e8f" stroke-width="6"/><animateTransform attributeName="transform" type="rotate" values="-70 100 55;0 100 55;-70 100 55" dur="1.6s" repeatCount="indefinite"/></g>
    <g><line x1="100" y1="55" x2="100" y2="100" stroke="#2f9e8f" stroke-width="6"/><animateTransform attributeName="transform" type="rotate" values="70 100 55;0 100 55;70 100 55" dur="1.6s" repeatCount="indefinite"/></g></svg>`,
  core: `<svg viewBox="0 0 200 130"><line x1="55" y1="100" x2="145" y2="100" stroke="#3a4a56" stroke-width="4"/><circle cx="130" cy="80" r="8" fill="#3a4a56"/>
    <g><line x1="70" y1="95" x2="120" y2="80" stroke="#2f9e8f" stroke-width="6"/><circle cx="70" cy="95" r="9" fill="#e8a33d"/>
    <animateTransform attributeName="transform" type="rotate" values="0 120 80;22 120 80;0 120 80" dur="1.5s" repeatCount="indefinite"/></g></svg>`,
  cardio: `<svg viewBox="0 0 200 130"><circle cx="100" cy="22" r="10" fill="#e8a33d"/><line x1="100" y1="32" x2="100" y2="72" stroke="#3a4a56" stroke-width="6"/>
    <g><line x1="100" y1="72" x2="130" y2="115" stroke="#2f9e8f" stroke-width="6"/><animateTransform attributeName="transform" type="rotate" values="0 100 72;-32 100 72;0 100 72" dur="0.8s" repeatCount="indefinite"/></g>
    <g><line x1="100" y1="72" x2="70" y2="115" stroke="#2f9e8f" stroke-width="6"/><animateTransform attributeName="transform" type="rotate" values="0 100 72;32 100 72;0 100 72" dur="0.8s" repeatCount="indefinite"/></g></svg>`,
  kegel: `<svg viewBox="0 0 200 130"><circle cx="100" cy="55" r="30" fill="none" stroke="#2f9e8f" stroke-width="6">
    <animate attributeName="r" values="30;16;30" dur="2.2s" repeatCount="indefinite"/><animate attributeName="stroke" values="#2f9e8f;#e8a33d;#2f9e8f" dur="2.2s" repeatCount="indefinite"/></circle>
    <text x="100" y="105" text-anchor="middle" font-size="13" fill="#9fb0ab">contrai / rilascia</text></svg>`,
};

const MEALS = {
  "d1": {
    "label": "Giorno 1 · Petto e tricipiti — Allenamento",
    "kcal": "≈ 3315 kcal",
    "macros": "~195g proteine · 432g carbo · 88g grassi",
    "items": [
      {
        "t": "08:00 · Colazione",
        "icon": "🥣",
        "txt": "100g fiocchi d'avena; 250g yogurt greco 0%; 120g banana; 20g burro d'arachidi.",
        "m": "746 kcal · P45 · C99 · G18"
      },
      {
        "t": "11:30 · Spuntino",
        "icon": "🥜",
        "txt": "80g pane integrale; 20g mandorle; 150g mela.",
        "m": "400 kcal · P12 · C57 · G14"
      },
      {
        "t": "13:00 · Pranzo",
        "icon": "🍗",
        "txt": "200g petto di pollo; 130g riso basmati (a crudo); 200g verdure; 10g olio EVO.",
        "m": "823 kcal · P59 · C109 · G15"
      },
      {
        "t": "16:30 · Spuntino (pre allenamento)",
        "icon": "🍌",
        "txt": "120g banana; 50g gallette di riso; 20g miele.",
        "m": "361 kcal · P5 · C84 · G2"
      },
      {
        "t": "21:00 · Cena",
        "icon": "🍽️",
        "txt": "200g manzo magro 5%; 400g patate; 200g verdure; 15g olio EVO.",
        "m": "767 kcal · P53 · C76 · G26"
      },
      {
        "t": "23:00 · Pre nanna",
        "icon": "🌙",
        "txt": "150g fiocchi di latte magri; 15g noci.",
        "m": "218 kcal · P20 · C7 · G13"
      }
    ]
  },
  "d2": {
    "label": "Giorno 2 · Dorso e bicipiti — Allenamento",
    "kcal": "≈ 3240 kcal",
    "macros": "~196g proteine · 406g carbo · 88g grassi",
    "items": [
      {
        "t": "08:00 · Colazione",
        "icon": "🥣",
        "txt": "100g fiocchi d'avena; 250g yogurt greco 0%; 100g mirtilli; 20g burro d'arachidi.",
        "m": "696 kcal · P45 · C86 · G18"
      },
      {
        "t": "11:30 · Spuntino",
        "icon": "🥜",
        "txt": "80g pane integrale; 25g marmellata; 15g mandorle.",
        "m": "352 kcal · P10 · C50 · G11"
      },
      {
        "t": "13:00 · Pranzo",
        "icon": "🍗",
        "txt": "200g petto di tacchino; 140g pasta integrale (a crudo); 200g verdure; 10g olio EVO.",
        "m": "844 kcal · P69 · C102 · G16"
      },
      {
        "t": "16:30 · Spuntino (pre allenamento)",
        "icon": "🍌",
        "txt": "120g banana; 50g gallette di riso; 20g miele.",
        "m": "361 kcal · P5 · C84 · G2"
      },
      {
        "t": "21:00 · Cena",
        "icon": "🍽️",
        "txt": "180g salmone; 400g patate; 200g verdure; 5g olio EVO.",
        "m": "777 kcal · P47 · C76 · G29"
      },
      {
        "t": "23:00 · Pre nanna",
        "icon": "🌙",
        "txt": "150g fiocchi di latte magri; 15g cioccolato fondente 85%.",
        "m": "210 kcal · P20 · C7 · G11"
      }
    ]
  },
  "d3": {
    "label": "Giorno 3 · Gambe e spalle — Allenamento",
    "kcal": "≈ 3161 kcal",
    "macros": "~185g proteine · 417g carbo · 83g grassi",
    "items": [
      {
        "t": "08:00 · Colazione",
        "icon": "🥣",
        "txt": "100g pane integrale; 25g burro d'arachidi; 25g marmellata; 250g yogurt greco 0%.",
        "m": "610 kcal · P41 · C70 · G18"
      },
      {
        "t": "11:30 · Spuntino",
        "icon": "🥜",
        "txt": "50g fiocchi d'avena; 120g banana; 15g mandorle.",
        "m": "383 kcal · P11 · C58 · G12"
      },
      {
        "t": "13:00 · Pranzo",
        "icon": "🍗",
        "txt": "200g petto di pollo; 130g riso basmati (a crudo); 200g verdure; 10g olio EVO.",
        "m": "823 kcal · P59 · C109 · G15"
      },
      {
        "t": "16:30 · Spuntino (pre allenamento)",
        "icon": "🍌",
        "txt": "120g banana; 50g gallette di riso; 20g miele.",
        "m": "361 kcal · P5 · C84 · G2"
      },
      {
        "t": "21:00 · Cena",
        "icon": "🍽️",
        "txt": "120g uova intere (2 uova ≈ 120g); 100g petto di pollo; 400g patate dolci; 200g verdure; 10g olio EVO.",
        "m": "766 kcal · P48 · C89 · G24"
      },
      {
        "t": "23:00 · Pre nanna",
        "icon": "🌙",
        "txt": "150g fiocchi di latte magri; 15g noci.",
        "m": "218 kcal · P20 · C7 · G13"
      }
    ]
  },
  "d4": {
    "label": "Giorno 4 · Punti deboli, addome e cardio",
    "kcal": "≈ 3091 kcal",
    "macros": "~182g proteine · 381g carbo · 91g grassi",
    "items": [
      {
        "t": "08:00 · Colazione",
        "icon": "🥣",
        "txt": "90g fiocchi d'avena; 250g yogurt greco 0%; 120g banana; 15g burro d'arachidi.",
        "m": "679 kcal · P43 · C92 · G15"
      },
      {
        "t": "11:30 · Spuntino",
        "icon": "🥜",
        "txt": "70g pane integrale; 20g mandorle; 150g mela.",
        "m": "375 kcal · P11 · C52 · G14"
      },
      {
        "t": "13:00 · Pranzo",
        "icon": "🍗",
        "txt": "180g manzo magro 5%; 110g couscous integrale (a crudo); 200g verdure; 10g olio EVO.",
        "m": "772 kcal · P54 · C85 · G22"
      },
      {
        "t": "16:30 · Spuntino (pre allenamento)",
        "icon": "🍌",
        "txt": "40g gallette di riso; 20g miele; 120g banana.",
        "m": "322 kcal · P5 · C76 · G2"
      },
      {
        "t": "21:00 · Cena",
        "icon": "🍽️",
        "txt": "170g salmone; 350g patate; 200g verdure; 5g olio EVO.",
        "m": "718 kcal · P44 · C68 · G28"
      },
      {
        "t": "23:00 · Pre nanna",
        "icon": "🌙",
        "txt": "200g fiocchi di latte magri; 10g noci.",
        "m": "225 kcal · P26 · C7 · G10"
      }
    ]
  },
  "r1": {
    "label": "Riposo A",
    "kcal": "≈ 2634 kcal",
    "macros": "~172g proteine · 305g carbo · 80g grassi",
    "items": [
      {
        "t": "08:00 · Colazione",
        "icon": "🥣",
        "txt": "80g fiocchi d'avena; 250g yogurt greco 0%; 20g burro d'arachidi; 100g mirtilli.",
        "m": "622 kcal · P42 · C74 · G17"
      },
      {
        "t": "11:30 · Spuntino",
        "icon": "🥜",
        "txt": "20g mandorle; 150g mela.",
        "m": "200 kcal · P5 · C22 · G11"
      },
      {
        "t": "13:00 · Pranzo",
        "icon": "🍗",
        "txt": "180g petto di tacchino; 120g riso basmati (a crudo); 200g verdure; 10g olio EVO.",
        "m": "760 kcal · P56 · C102 · G14"
      },
      {
        "t": "16:30 · Spuntino",
        "icon": "🍌",
        "txt": "170g yogurt greco 0%; 15g noci; 10g miele.",
        "m": "229 kcal · P20 · C16 · G10"
      },
      {
        "t": "21:00 · Cena",
        "icon": "🍽️",
        "txt": "200g merluzzo; 400g patate; 200g verdure; 15g olio EVO.",
        "m": "657 kcal · P47 · C76 · G17"
      },
      {
        "t": "23:00 · Pre nanna",
        "icon": "🌙",
        "txt": "20g cioccolato fondente 85%; 75g kiwi.",
        "m": "166 kcal · P3 · C15 · G11"
      }
    ]
  },
  "r2": {
    "label": "Riposo B",
    "kcal": "≈ 2723 kcal",
    "macros": "~186g proteine · 314g carbo · 79g grassi",
    "items": [
      {
        "t": "08:00 · Colazione",
        "icon": "🥣",
        "txt": "90g pane integrale; 25g burro d'arachidi; 250g yogurt greco 0%.",
        "m": "525 kcal · P40 · C51 · G17"
      },
      {
        "t": "11:30 · Spuntino",
        "icon": "🥜",
        "txt": "150g fiocchi di latte magri; 150g mela.",
        "m": "198 kcal · P18 · C26 · G3"
      },
      {
        "t": "13:00 · Pranzo",
        "icon": "🍗",
        "txt": "200g ceci cotti; 90g riso basmati (a crudo); 80g tonno al naturale; 200g verdure; 10g olio EVO.",
        "m": "881 kcal · P49 · C132 · G18"
      },
      {
        "t": "16:30 · Spuntino",
        "icon": "🍌",
        "txt": "20g mandorle; 75g kiwi; 20g gallette di riso.",
        "m": "245 kcal · P7 · C29 · G12"
      },
      {
        "t": "21:00 · Cena",
        "icon": "🍽️",
        "txt": "200g manzo magro 5%; 350g patate; 200g verdure; 10g olio EVO.",
        "m": "684 kcal · P52 · C68 · G21"
      },
      {
        "t": "23:00 · Pre nanna",
        "icon": "🌙",
        "txt": "170g yogurt greco 0%; 15g cioccolato fondente 85%.",
        "m": "190 kcal · P19 · C9 · G8"
      }
    ]
  },
  "r3": {
    "label": "Riposo C",
    "kcal": "≈ 2692 kcal",
    "macros": "~170g proteine · 299g carbo · 88g grassi",
    "items": [
      {
        "t": "08:00 · Colazione",
        "icon": "🥣",
        "txt": "80g fiocchi d'avena; 250g yogurt greco 0%; 20g burro d'arachidi; 120g banana.",
        "m": "672 kcal · P43 · C87 · G17"
      },
      {
        "t": "11:30 · Spuntino",
        "icon": "🥜",
        "txt": "150g arancia; 30g gallette di riso; 10g miele.",
        "m": "217 kcal · P4 · C50 · G1"
      },
      {
        "t": "13:00 · Pranzo",
        "icon": "🍗",
        "txt": "150g salmone; 100g quinoa (a crudo); 200g verdure.",
        "m": "730 kcal · P47 · C72 · G26"
      },
      {
        "t": "16:30 · Spuntino",
        "icon": "🍌",
        "txt": "150g mela; 20g mandorle.",
        "m": "200 kcal · P5 · C22 · G11"
      },
      {
        "t": "21:00 · Cena",
        "icon": "🍽️",
        "txt": "120g uova intere (2 uova ≈ 120g); 100g petto di pollo; 300g patate; 200g verdure; 10g olio EVO.",
        "m": "653 kcal · P47 · C60 · G24"
      },
      {
        "t": "23:00 · Pre nanna",
        "icon": "🌙",
        "txt": "200g fiocchi di latte magri; 10g cioccolato fondente 85%.",
        "m": "220 kcal · P25 · C8 · G9"
      }
    ]
  }
};

const FOOD_TABS = [
  {key:"d1", short:"G1 Petto"},
  {key:"d2", short:"G2 Dorso"},
  {key:"d3", short:"G3 Gambe"},
  {key:"d4", short:"G4 Deboli"},
  {key:"r1", short:"Riposo A"},
  {key:"r2", short:"Riposo B"},
  {key:"r3", short:"Riposo C"},
];

const SUPPLEMENTS = [
  {icon:"⚡", title:"Creatina monoidrato", txt:"5 g a colazione ogni giorno, inclusi i giorni di riposo. Non serve una fase di carico."},
  {icon:"💊", title:"BCAA", txt:"Inseriti nel pre workout nei giorni di allenamento. Con un apporto proteico già elevato restano opzionali."},
  {icon:"🥤", title:"Maltodestrine", txt:"Inserite nel post workout nei giorni di allenamento. La quantità va definita in base al fabbisogno di carboidrati e alle calorie complessive."},
  {icon:"🐟", title:"Omega-3", txt:"Inseriti nel pre nanna. La dose va letta in termini di EPA + DHA e adattata anche al consumo di pesce della dieta."},
];


/* 1.12.0 — Come si esegue ogni esercizio (mostrato in "info" sotto l'animazione).
   p = posizione di partenza · s = esecuzione passo per passo · r = respirazione · e = errori da evitare */
const HOWTO = {
  "Tapis roulant — camminata in pendenza": {
    p:["Sali sul nastro fermo, piedi ai lati. Avvia a 3-4 km/h e sali sul nastro.","Imposta la pendenza gradualmente (7-10%) e poi la velocità (4,5-5,5 km/h)."],
    s:["Primi 3 minuti tranquilli per scaldarti, poi porta il ritmo in zona 2 (respiro accelerato ma riesci a parlare).","Busto dritto, passo naturale, braccia che oscillano libere.","Negli ultimi 2 minuti abbassa pendenza e velocità per tornare calmo.","Nei giorni A-B-C è il riscaldamento prima dei pesi: non arrivare stanco agli esercizi."],
    r:"Respiro regolare dal naso e dalla bocca, mai in affanno.",
    e:["Tenerti ai corrimano: riduce il lavoro e scarica la schiena in modo scorretto.","Pendenza troppo alta con passo corto sulle punte: affatica polpacci e ginocchia."]},
  "Esercizi di Kegel (pavimento pelvico)": {
    p:["Seduto o sdraiato, glutei, addome e cosce rilassati."],
    s:["Contrai i muscoli che useresti per trattenere la pipì, come a sollevarli verso l'interno.","Tieni la contrazione 5 secondi.","Rilascia completamente per 5 secondi: il rilascio conta quanto la contrazione.","Ripeti 10 volte per serie."],
    r:"Respira normalmente durante la contrazione, non trattenere il fiato.",
    e:["Stringere glutei, addome o cosce al posto del pavimento pelvico.","Spingere verso il basso invece di sollevare."]},
  "Crunch ai cavi in ginocchio": {
    p:["Cavo alto con la corda. Inginocchiati a circa mezzo metro dalla macchina.","Tieni la corda ai lati della testa, fianchi fermi sopra le ginocchia."],
    s:["Arrotola il busto verso il basso portando le costole verso il bacino.","Scendi finché i gomiti arrivano vicino alle cosce, pausa di 1 secondo.","Risali lentamente fino ad allungare l'addome, senza far tornare su il peso di colpo."],
    r:"Espira mentre scendi e contrai, inspira risalendo.",
    e:["Sederti sui talloni muovendo le anche: il movimento deve partire dal busto.","Tirare con le braccia invece che con l'addome."]},
  "Dead bug controllato": {
    p:["Sdraiato sulla schiena, braccia tese verso il soffitto, anche e ginocchia a 90°.","Schiaccia la zona lombare contro il pavimento."],
    s:["Allunga lentamente il braccio destro dietro la testa e la gamba sinistra in avanti, vicino al pavimento.","Torna al centro senza perdere il contatto della schiena con il pavimento.","Ripeti dall'altro lato: una ripetizione per lato."],
    r:"Espira lungo mentre allunghi braccio e gamba, inspira tornando.",
    e:["Inarcare la schiena quando la gamba scende: accorcia il movimento.","Andare veloce: l'esercizio funziona solo lento."]},
  "Leg press 45°": {
    p:["Schiena e glutei ben appoggiati allo schienale, piedi a metà pedana alla larghezza delle spalle, punte leggermente aperte.","Togli le sicure tenendo le gambe quasi tese ma non bloccate."],
    s:["Scendi lentamente (2-3 secondi) piegando le ginocchia verso il petto, ginocchia nella direzione delle punte.","Fermati intorno ai 90° o prima se senti fastidio al ginocchio.","Spingi con tutta la pianta, soprattutto con i talloni, fino quasi a distendere le gambe."],
    r:"Inspira scendendo, espira spingendo.",
    e:["Staccare il bacino dallo schienale in basso: scendi meno.","Bloccare le ginocchia in alto o farle cedere verso l'interno."]},
  "Panca piana con bilanciere": {
    p:["Sdraiato con gli occhi sotto il bilanciere, piedi piantati a terra.","Scapole strette e abbassate, leggero arco naturale della schiena, glutei sulla panca.","Presa poco più larga delle spalle, polsi dritti."],
    s:["Stacca il bilanciere e portalo sopra le spalle a braccia tese.","Scendi in 2-3 secondi fino a sfiorare il petto a metà sterno, gomiti a circa 45° dal busto.","Spingi in alto e leggermente indietro fino a braccia tese, senza perdere le scapole strette."],
    r:"Inspira prima di scendere e tieni l'aria in basso, espira nella spinta.",
    e:["Rimbalzare sul petto o staccare i glutei.","Gomiti aperti a 90°: stressano le spalle.","Allenarti pesante senza qualcuno che ti assista."]},
  "Rematore con manubrio monolaterale": {
    p:["Mano e ginocchio dello stesso lato sulla panca, l'altro piede a terra.","Schiena piatta quasi parallela al pavimento, manubrio a braccio teso sotto la spalla."],
    s:["Tira il manubrio verso l'anca portando il gomito indietro e vicino al fianco.","Stringi la scapola in alto per 1 secondo.","Scendi lentamente fino a braccio teso, lasciando allungare la schiena.","Completa tutte le ripetizioni con un braccio, poi cambia."],
    r:"Espira tirando, inspira scendendo.",
    e:["Ruotare il busto per sollevare più peso.","Tirare verso il petto con il gomito largo: lavora meno il dorsale."]},
  "Lento avanti con manubri, seduto": {
    p:["Panca con schienale quasi verticale, schiena e testa appoggiate.","Manubri all'altezza delle spalle, palmi in avanti, gomiti leggermente davanti al busto."],
    s:["Spingi i manubri verso l'alto fino a braccia quasi tese, avvicinandoli sopra la testa.","Scendi in 2 secondi fino all'altezza delle orecchie o del mento."],
    r:"Espira spingendo, inspira scendendo.",
    e:["Inarcare la zona lombare staccandola dallo schienale.","Far sbattere i manubri in alto o scendere troppo in basso con i gomiti dietro."]},
  "Leg curl sdraiato/seduto": {
    p:["Regola la macchina: ginocchio allineato al perno, rullo appena sopra il tallone.","Da sdraiato: bacino schiacciato sul cuscino. Da seduto: cosce bloccate dal rullo superiore."],
    s:["Piega le ginocchia portando i talloni verso i glutei.","Stringi i femorali 1 secondo in contrazione.","Torna lentamente in 2-3 secondi senza far sbattere il peso."],
    r:"Espira piegando, inspira tornando.",
    e:["Sollevare il bacino (sdraiato) per aiutarti.","Usare lo slancio e lasciare cadere il peso."]},
  "Alzate laterali con manubri": {
    p:["In piedi, piedi alla larghezza dei fianchi, busto appena inclinato in avanti.","Manubri ai lati delle cosce, gomiti leggermente piegati."],
    s:["Solleva le braccia di lato portando i gomiti verso l'alto, come a spingere le mani lontano.","Fermati all'altezza delle spalle, mignolo e pollice alla stessa altezza.","Scendi in 2-3 secondi senza appoggiare i manubri alle gambe."],
    r:"Espira salendo, inspira scendendo.",
    e:["Slanciare con il busto o alzare le spalle verso le orecchie.","Salire oltre le spalle con peso eccessivo."]},
  "Push down tricipiti ai cavi": {
    p:["Cavo alto con la corda, in piedi vicino alla macchina, busto leggermente in avanti.","Gomiti attaccati ai fianchi, avambracci paralleli al pavimento."],
    s:["Spingi la corda verso il basso fino a distendere completamente le braccia.","In fondo apri leggermente le estremità della corda e stringi i tricipiti.","Risali fino a 90° senza muovere i gomiti."],
    r:"Espira spingendo, inspira risalendo.",
    e:["Muovere i gomiti avanti e indietro.","Caricare con il peso del corpo piegandoti sopra la corda."]},
  "Knee raise alla captain chair": {
    p:["Avambracci sui cuscinetti, schiena appoggiata allo schienale, gambe a penzoloni."],
    s:["Porta le ginocchia verso il petto con controllo.","In alto arrotola leggermente il bacino verso di te: è qui che lavora l'addome.","Scendi lentamente senza far oscillare le gambe."],
    r:"Espira salendo, inspira scendendo.",
    e:["Slanciare le gambe e dondolare.","Fermarti a ginocchia a 90° senza chiudere il bacino."]},
  "Pallof press ai cavi": {
    p:["Cavo all'altezza del petto, mettiti di lato alla macchina a un passo di distanza.","Impugna la maniglia con due mani al centro del petto, piedi alla larghezza delle spalle, ginocchia morbide."],
    s:["Spingi le mani dritte davanti a te resistendo al cavo che vuole ruotarti.","Tieni 2 secondi a braccia tese senza far ruotare busto e bacino.","Riporta le mani al petto. Fai tutte le ripetizioni e poi cambia lato."],
    r:"Espira spingendo, respira normalmente nella tenuta.",
    e:["Lasciare ruotare il busto verso la macchina.","Stare troppo vicino: senza tensione l'esercizio non serve."]},
  "Stacco rumeno con bilanciere": {
    p:["In piedi, piedi alla larghezza dei fianchi, bilanciere in mano davanti alle cosce, presa poco più larga dei fianchi.","Ginocchia leggermente piegate, scapole indietro, schiena neutra."],
    s:["Spingi i glutei indietro come a chiudere una porta con il sedere.","Il bilanciere scende strisciando sulle cosce, fino a sotto le ginocchia o a metà tibia.","Fermati quando senti tirare i femorali, senza arrotondare la schiena.","Torna su spingendo il bacino in avanti e stringendo i glutei."],
    r:"Inspira e contrai l'addome prima di scendere, espira tornando su.",
    e:["Arrotondare la schiena per scendere di più.","Trasformarlo in uno squat piegando troppo le ginocchia.","Allontanare il bilanciere dalle gambe."]},
  "Lat machine presa larga": {
    p:["Regola il cuscinetto per bloccare le cosce, impugna la barra larga circa una volta e mezza le spalle.","Busto leggermente inclinato indietro, petto in fuori."],
    s:["Abbassa le scapole, poi tira la barra verso la parte alta del petto portando i gomiti verso i fianchi.","Pausa di 1 secondo con il petto verso la barra.","Risali lentamente fino a braccia quasi tese, sentendo allungare i dorsali."],
    r:"Espira tirando, inspira risalendo.",
    e:["Tirare dietro la nuca.","Dondolare con il busto per far scendere il peso."]},
  "Panca inclinata con manubri (30°)": {
    p:["Panca inclinata a 30°, schiena appoggiata, scapole strette e abbassate.","Manubri sopra il petto alto, palmi in avanti."],
    s:["Scendi in 2-3 secondi aprendo i gomiti a circa 45°, fino a sentire allungare il petto.","Spingi verso l'alto avvicinando i manubri sopra il petto, senza farli toccare."],
    r:"Inspira scendendo, espira spingendo.",
    e:["Inclinazione troppo alta: lavora soprattutto la spalla.","Scendere senza controllo o staccare le scapole dalla panca."]},
  "Affondi bulgari con manubri": {
    p:["Di spalle a una panca, appoggia il collo del piede posteriore sulla panca.","Piede anteriore abbastanza avanti da far scendere il ginocchio senza superare troppo la punta. Manubri lungo i fianchi."],
    s:["Scendi in verticale piegando il ginocchio anteriore, busto leggermente in avanti.","Fermati quando la coscia anteriore è quasi parallela o prima se senti fastidio al ginocchio.","Risali spingendo con il tallone della gamba davanti.","Completa le ripetizioni e poi cambia gamba."],
    r:"Inspira scendendo, espira risalendo.",
    e:["Ginocchio che cade verso l'interno.","Spingere con la gamba dietro: deve lavorare quella davanti.","Usare peso alto prima di avere equilibrio stabile."]},
  "Face pull ai cavi": {
    p:["Cavo all'altezza del viso con la corda, presa con i pollici verso di te.","Un passo indietro, braccia tese, petto alto."],
    s:["Tira la corda verso il viso aprendo le estremità ai lati delle orecchie.","Gomiti alti, all'altezza delle spalle o sopra. Stringi le scapole 1 secondo.","Torna lentamente a braccia tese."],
    r:"Espira tirando, inspira tornando.",
    e:["Gomiti bassi: diventa un rematore.","Inclinarti indietro per usare il peso del corpo."]},
  "Curl bicipiti con bilanciere": {
    p:["In piedi, presa alla larghezza delle spalle con i palmi in avanti.","Gomiti lungo i fianchi, ginocchia morbide, addome contratto."],
    s:["Piega i gomiti portando il bilanciere verso le spalle.","Contrai i bicipiti in alto 1 secondo.","Scendi in 2-3 secondi fino a braccia quasi tese."],
    r:"Espira salendo, inspira scendendo.",
    e:["Slanciare con la schiena o le anche.","Portare i gomiti in avanti durante la salita."]},
  "French press con manubrio": {
    p:["Seduto su panca con schienale, un manubrio tenuto con due mani sopra la testa.","Gomiti stretti e rivolti in avanti."],
    s:["Piega i gomiti facendo scendere il manubrio dietro la testa finché senti allungare i tricipiti.","Distendi le braccia tornando sopra la testa, muovendo solo gli avambracci."],
    r:"Inspira scendendo, espira distendendo.",
    e:["Aprire i gomiti verso l'esterno.","Inarcare la zona lombare: tieni l'addome contratto."]},
  "Ab wheel rollout": {
    p:["In ginocchio su un tappetino, ruota sotto le spalle, braccia tese.","Glutei e addome contratti, bacino leggermente chiuso."],
    s:["Fai rotolare la ruota in avanti allungando il corpo lentamente.","Vai avanti solo finché la zona lombare resta neutra.","Torna indietro tirando con l'addome, non con le braccia."],
    r:"Inspira andando avanti, espira tornando.",
    e:["Lasciare cedere la schiena verso il basso.","Andare troppo lontano le prime volte: aumenta l'ampiezza nelle settimane."]},
  "Side plank": {
    p:["Su un fianco, gomito sotto la spalla, gambe tese una sopra l'altra (o ginocchia piegate per una versione più facile)."],
    s:["Solleva il bacino finché il corpo è in linea dalla testa ai piedi.","Tieni la posizione per il tempo indicato senza far scendere il bacino.","Cambia lato."],
    r:"Respira regolarmente per tutta la tenuta.",
    e:["Bacino che scende o va indietro.","Spalla schiacciata verso l'orecchio: spingi il pavimento con l'avambraccio."]},
  "Hip thrust con bilanciere": {
    p:["Schiena alta appoggiata al bordo della panca (sotto le scapole), bilanciere imbottito sulle anche.","Piedi alla larghezza dei fianchi, ginocchia a 90° quando sei in alto."],
    s:["Spingi con i talloni sollevando il bacino fino a busto e cosce in linea.","Mento verso il petto, stringi i glutei 1 secondo in alto.","Scendi in 2 secondi senza appoggiare il bilanciere."],
    r:"Inspira in basso, espira spingendo.",
    e:["Inarcare la zona lombare in alto invece di chiudere con i glutei.","Piedi troppo vicini o lontani: lavora la coscia invece del gluteo."]},
  "Pulley basso (seated row)": {
    p:["Seduto, piedi sulla pedana, ginocchia leggermente piegate.","Impugna il triangolo, schiena dritta, busto verticale."],
    s:["Tira il triangolo verso l'ombelico portando i gomiti indietro vicino al corpo.","Stringi le scapole 1 secondo con il petto alto.","Torna lentamente allungando le braccia, senza far piegare la schiena in avanti."],
    r:"Espira tirando, inspira tornando.",
    e:["Dondolare con il busto avanti e indietro.","Alzare le spalle verso le orecchie."]},
  "Arnold press con manubri": {
    p:["Seduto con schienale quasi verticale, manubri davanti alle spalle, palmi verso di te come alla fine di un curl."],
    s:["Spingi verso l'alto ruotando i polsi: i palmi finiscono in avanti a braccia tese.","Scendi facendo la rotazione al contrario, fino a tornare con i palmi verso di te."],
    r:"Espira salendo, inspira scendendo.",
    e:["Ruotare tutto in fondo o tutto in cima: la rotazione deve essere continua.","Peso troppo alto che fa inarcare la schiena."]},
  "Croci ai cavi (cable fly)": {
    p:["Due cavi all'altezza delle spalle o poco sopra, una maniglia per mano.","Un passo avanti, busto leggermente inclinato, gomiti un po' piegati e fermi."],
    s:["Porta le mani davanti al petto in un ampio arco, come ad abbracciare un albero.","Pausa di 1 secondo con le mani unite e il petto contratto.","Torna aprendo lentamente fino a sentire allungare il petto, senza andare oltre la linea delle spalle."],
    r:"Espira chiudendo, inspira aprendo.",
    e:["Piegare e distendere i gomiti: diventa una spinta.","Aprire troppo indietro con peso alto: stressa la spalla."]},
  "Leg extension": {
    p:["Schiena appoggiata, ginocchio allineato al perno della macchina, rullo appena sopra le caviglie.","Impugna le maniglie laterali."],
    s:["Distendi le gambe in 1-2 secondi fino a quasi tese.","Stringi i quadricipiti 1 secondo in alto.","Scendi lentamente in 2-3 secondi senza far sbattere il peso."],
    r:"Espira distendendo, inspira scendendo.",
    e:["Carichi alti e movimento veloce: per il ginocchio conta il controllo.","Sollevare il bacino dal sedile."]},
  "Alzate laterali ai cavi (unilaterale)": {
    p:["Cavo basso con maniglia singola, mettiti di lato alla macchina e prendi la maniglia con la mano più lontana.","L'altra mano si tiene alla macchina, busto leggermente inclinato."],
    s:["Solleva il braccio di lato fino all'altezza della spalla, gomito leggermente piegato.","Pausa di 1 secondo in alto.","Scendi lentamente fino davanti al bacino mantenendo la tensione del cavo.","Completa le ripetizioni e cambia lato."],
    r:"Espira salendo, inspira scendendo.",
    e:["Inclinarti per aiutarti con il corpo.","Alzare la spalla verso l'orecchio."]},
  "Curl a martello con manubri": {
    p:["In piedi, manubri lungo i fianchi con i palmi rivolti verso il corpo, gomiti fermi."],
    s:["Piega i gomiti portando i manubri verso le spalle senza ruotare i polsi.","Contrai 1 secondo in alto.","Scendi lentamente fino a braccia quasi tese. Puoi alternare le braccia o farle insieme."],
    r:"Espira salendo, inspira scendendo.",
    e:["Slancio con il busto.","Gomiti che si spostano in avanti."]},
  "Calf raise in piedi": {
    p:["Avampiedi sul bordo della pedana, talloni liberi, spalle sotto i cuscinetti (o manubrio in mano tenendoti a un appoggio).","Gambe tese ma ginocchia non bloccate."],
    s:["Scendi con i talloni sotto il livello della pedana per allungare i polpacci.","Sali sulle punte il più in alto possibile e tieni 1 secondo.","Ritorna giù lentamente."],
    r:"Espira salendo, inspira scendendo.",
    e:["Rimbalzare in basso.","Movimento corto a metà: usa tutta l'ampiezza."]},
  "Plank frontale": {
    p:["A terra sugli avambracci, gomiti sotto le spalle, gambe tese sulle punte dei piedi."],
    s:["Solleva il corpo creando una linea dritta da testa a talloni.","Contrai glutei e addome come se volessi avvicinare gomiti e piedi.","Tieni la posizione per il tempo indicato."],
    r:"Respira regolarmente, senza trattenere il fiato.",
    e:["Bacino troppo basso (schiena che cede) o troppo alto.","Guardare avanti alzando la testa: lo sguardo va verso il pavimento."]},
  "Crunch inverso su panca": {
    p:["Sdraiato sulla panca piana, mani dietro la testa a tenere il bordo.","Anche e ginocchia piegate a 90°."],
    s:["Arrotola il bacino portando le ginocchia verso il petto e staccando il sedere dalla panca.","Contrai 1 secondo.","Torna giù lentamente fino a 90°, senza appoggiare i piedi."],
    r:"Espira salendo, inspira scendendo.",
    e:["Slanciare le gambe.","Usare le braccia per tirarti su."]},
  "Alzate posteriori (rear delt fly) su panca inclinata": {
    p:["Petto appoggiato a una panca inclinata a 30-45°, manubri leggeri che pendono sotto le spalle.","Gomiti leggermente piegati."],
    s:["Apri le braccia di lato portandole all'altezza delle spalle.","Pausa di 1 secondo, senza stringere troppo le scapole: deve lavorare la spalla posteriore.","Scendi lentamente."],
    r:"Espira aprendo, inspira scendendo.",
    e:["Peso troppo alto con slancio.","Alzare la testa e staccare il petto dalla panca."]},
  "Curl 21 (bicipiti, manubri leggeri)": {
    p:["In piedi con due manubri leggeri, palmi in avanti, gomiti lungo i fianchi."],
    s:["7 ripetizioni dalla posizione bassa fino a metà (gomiti a 90°).","7 ripetizioni dalla metà fino in alto.","7 ripetizioni complete dal basso all'alto.","Le 21 ripetizioni sono una serie unica senza pausa."],
    r:"Espira salendo, inspira scendendo.",
    e:["Peso troppo alto: l'ultima parte diventa slancio.","Fermarsi tra un blocco e l'altro."]},
};
