/* ===================== DATI PROGRAMMA ===================== */
const COMMON_CLOSING = [
  {name:"Crunch a terra (o ai cavi)", sets:3, reps:"20", rest:45, move:"core",
    note:"Addominali: contrai bene in alto, non tirare il collo con le mani, movimento lento e controllato."},
  {name:"Sollevamento gambe da sdraiato (leg raise)", sets:3, reps:"15", rest:45, move:"core",
    note:"Addominali bassi: schiena aderente al pavimento, gambe quasi tese, scendi senza toccare terra."},
  {name:"Tapis roulant — camminata in pendenza", sets:1, reps:"20-25 min", rest:0, move:"cardio",
    note:"Cardio a ritmo moderato (zona 2: un po' affannoso ma riesci a parlare). Aiuta il deficit calorico per far uscire gli addominali — ricorda che il grasso sulla pancia si riduce con le calorie, gli addominali servono a rinforzare e definire, non esiste il dimagrimento localizzato."},
  {name:"Esercizi di Kegel (pavimento pelvico)", sets:3, reps:"10 contrazioni (5\" tieni + 5\" rilascia)", rest:30, move:"kegel",
    note:"Contrai i muscoli che usi per fermare il flusso di urina, tieni 5 secondi, rilascia 5 secondi. Rinforzano il controllo del pavimento pelvico e nel tempo possono aiutare a ritardare l'eiaculazione."},
];

const DAYS = [
  { key:"d1", name:"Push", short:"G1 · Push",
    exercises:[
      {name:"Panca piana con bilanciere", sets:4, reps:"8", rest:120, compound:true, move:"vertical_press",
        note:"Scapole retratte e addotte, piedi ben piantati. Discesa controllata in 2-3 secondi, barra a metà petto, spinta esplosiva in alto senza staccare i glutei dalla panca."},
      {name:"Panca inclinata con manubri (30°)", sets:3, reps:"10", rest:90, move:"vertical_press",
        note:"Range di movimento completo. Evita di far \"sbattere\" i manubri in alto: mantieni un minimo di tensione e controllo in ogni ripetizione."},
      {name:"Lento avanti con manubri, seduto", sets:4, reps:"10", rest:90, move:"vertical_press",
        note:"Core stabile, non iperestendere la zona lombare. I manubri partono all'altezza delle spalle e salgono fino quasi a toccarsi in alto."},
      {name:"Alzate laterali con manubri", sets:4, reps:"15", rest:60, move:"lateral_raise",
        note:"Punto debole - deltoidi: gomito leggermente flesso, salita fino all'altezza della spalla, nessuno slancio con il busto. Se serve, riduci il peso per fare tutte le ripetizioni in modo pulito."},
      {name:"Croci ai cavi (cable fly)", sets:3, reps:"12", rest:60, move:"fly",
        note:"Tensione continua su tutto il movimento, breve pausa in massima contrazione al centro."},
      {name:"Push down tricipiti ai cavi", sets:3, reps:"12", rest:60, move:"vertical_press",
        note:"Gomiti fissi lungo il fianco: si muove solo l'avambraccio. Estensione completa in basso."},
      {name:"French press con manubrio", sets:3, reps:"10", rest:60, move:"vertical_press",
        note:"Gomiti stretti e fermi, scendi dietro la testa senza aprire i gomiti verso l'esterno."},
      ...COMMON_CLOSING,
    ]},
  { key:"d2", name:"Pull", short:"G2 · Pull",
    exercises:[
      {name:"Stacco rumeno con bilanciere", sets:4, reps:"8", rest:120, compound:true, move:"hinge",
        note:"Schiena neutra per tutto il movimento, bilanciere vicino alle gambe, spinta finale con i glutei. Fermati quando senti un buon allungamento dei femorali."},
      {name:"Lat machine presa larga", sets:4, reps:"10", rest:90, move:"vertical_pull",
        note:"Tira verso i capezzoli, petto in fuori, nessuno slancio con il busto. Controlla anche la fase di risalita."},
      {name:"Rematore con manubrio monolaterale", sets:3, reps:"10", rest:90, move:"horizontal_pull",
        note:"Un braccio per volta, busto quasi parallelo al pavimento, il gomito va verso l'anca, non verso l'alto."},
      {name:"Pulley basso (seated row)", sets:3, reps:"12", rest:90, move:"horizontal_pull",
        note:"Petto alto, tira verso l'ombelico, controlla sempre il ritorno senza far \"cadere\" il peso."},
      {name:"Face pull ai cavi", sets:3, reps:"15", rest:60, move:"lateral_raise",
        note:"Punto debole - deltoide posteriore: tira verso il viso con i gomiti alti. Ottimo anche per la postura delle spalle."},
      {name:"Curl bicipiti con bilanciere", sets:4, reps:"10", rest:60, move:"curl",
        note:"Gomiti fermi lungo il fianco, nessuno slancio con la schiena. Contrai bene in alto."},
      {name:"Curl a martello con manubri", sets:3, reps:"12", rest:60, move:"curl",
        note:"Presa neutra (palmi rivolti verso il corpo): lavora anche il brachiale, utile per braccia più \"piene\"."},
      ...COMMON_CLOSING,
    ]},
  { key:"d3", name:"Legs", short:"G3 · Legs",
    exercises:[
      {name:"Leg press 45°", sets:4, reps:"10", rest:120, compound:true, move:"leg_press",
        note:"ATTENZIONE GINOCCHIO: piedi larghezza spalle, scendi solo fino a dove NON senti fastidio (circa 90° di flessione), non bloccare le ginocchia in estensione completa in alto."},
      {name:"Affondi bulgari con manubri", sets:3, reps:"10 per gamba", rest:90, move:"leg_press",
        note:"Passo corto e controllato, il ginocchio della gamba anteriore non deve superare troppo la punta del piede. Fermati se senti fastidio articolare."},
      {name:"Leg extension", sets:3, reps:"12", rest:60, move:"leg_press",
        note:"Carico moderato e movimento lento: rinforza il ginocchio senza lo stress da carico assiale dello squat pesante."},
      {name:"Leg curl sdraiato/seduto", sets:3, reps:"12", rest:60, move:"leg_press",
        note:"Contrazione piena dei femorali in ogni ripetizione, evita strappi con inerzia."},
      {name:"Hip thrust con bilanciere", sets:3, reps:"12", rest:90, move:"hinge",
        note:"Mento verso il petto, spinta con i glutei, blocco di 1 secondo in massima contrazione in alto."},
      {name:"Calf raise in piedi", sets:4, reps:"15", rest:45, move:"leg_press",
        note:"Range di movimento completo, pausa di 1 secondo in massima estensione."},
      ...COMMON_CLOSING,
    ]},
  { key:"d4", name:"Extra: Spalle & Braccia", short:"G4 · Extra",
    exercises:[
      {name:"Military press con bilanciere in piedi", sets:4, reps:"8", rest:120, compound:true, move:"vertical_press",
        note:"Compound principale spalle: core attivo, spinta verticale, evita di inarcare troppo la zona lombare."},
      {name:"Trazioni alla sbarra (o lat machine presa neutra)", sets:3, reps:"8", rest:90, move:"vertical_pull",
        note:"Se non riesci a corpo libero, usa la trazione assistita o la lat machine mantenendo lo stesso schema di serie/ripetizioni."},
      {name:"Arnold press con manubri", sets:3, reps:"10", rest:90, move:"vertical_press",
        note:"Punto debole - deltoidi: rotazione fluida del polso durante la salita, ottimo per deltoide anteriore e laterale insieme."},
      {name:"Alzate laterali ai cavi (unilaterale)", sets:4, reps:"15 per lato", rest:45, move:"lateral_raise",
        note:"Punto debole - deltoidi: il cavo mantiene tensione costante anche in basso, più efficace del manubrio su questo esercizio."},
      {name:"Alzate posteriori (rear delt fly) su panca inclinata", sets:3, reps:"15", rest:45, move:"lateral_raise",
        note:"Punto debole - deltoide posteriore: busto appoggiato alla panca, peso leggero e movimento controllato, niente slancio."},
      {name:"Dip alle parallele (busto verticale)", sets:3, reps:"10", rest:90, move:"vertical_press",
        note:"Busto verticale per enfatizzare i tricipiti. Se senti fastidio alle spalle, riduci l'ampiezza del movimento."},
      {name:"Curl bicipiti ai cavi con bilanciere EZ", sets:3, reps:"12", rest:60, move:"curl",
        note:"Punto debole - braccia: tensione continua per tutto il movimento, nessuno slancio con la schiena."},
      {name:"Curl 21 (bicipiti, manubri leggeri)", sets:2, reps:"21 (7+7+7)", rest:60, move:"curl",
        note:"Punto debole - braccia: 7 ripetizioni nella metà bassa del movimento + 7 nella metà alta + 7 complete. Usa un peso leggero: brucia molto ma dà grande volume alle braccia."},
      ...COMMON_CLOSING,
    ]},
];

const PROGRESSION_TEXT = {
  1: "Settimana 1: pesi di partenza. Lascia 2 ripetizioni in riserva, focus sulla tecnica.",
  2: "Settimana 2: stesse ripetizioni target. Aumenta il carico del 2,5-5% dove hai completato tutto con margine.",
  3: "Settimana 3: nuovo aumento di carico 2,5-5%. Lascia solo 1 ripetizione in riserva sui compound.",
  4: "Settimana 4 — DELOAD (fine Blocco A): carico -10% rispetto alla settimana 3 e una serie in meno sugli esercizi compound. Serve a far recuperare le articolazioni.",
  5: "Settimana 5 (Blocco B): riparti dal carico della settimana 3 o poco superiore, stesse ripetizioni. Il deload ha lasciato margine per spingere di più.",
  6: "Settimana 6: aumenta ancora il carico del 2,5-5% dove hai margine.",
  7: "Settimana 7: nuovo aumento di carico. Lascia solo 1 ripetizione in riserva sui compound.",
  8: "Settimana 8 — DELOAD FINALE: -10% carico, -1 serie sui compound. Fine dei 2 mesi: fai un check (peso, foto, misure) prima di ripartire con un nuovo ciclo.",
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
    "label": "Giorno 1 · Push — Allenamento",
    "kcal": "≈ 2899 kcal",
    "macros": "~205g proteine · 327g carbo · 82g grassi",
    "items": [
      {
        "t": "7:00",
        "icon": "🥣",
        "txt": "250g yogurt greco 0% + 80g fiocchi d'avena + 200ml latte parzialmente scremato; 1 banana (circa 120g) + 15g burro d'arachidi. Mescola a freddo, senza cottura.",
        "m": "734 kcal · P48 · C96 · G18"
      },
      {
        "t": "10:30",
        "icon": "🥜",
        "txt": "30g mandorle + 1 mela",
        "m": "265 kcal · P6 · C31 · G15"
      },
      {
        "t": "13:00",
        "icon": "🍗",
        "txt": "200g petto di pollo alla griglia; 90g riso basmati (a crudo); verdure con 10g olio EVO",
        "m": "740 kcal · P68 · C70 · G17"
      },
      {
        "t": "16:30 (pre-workout)",
        "icon": "🍌",
        "txt": "1 banana + 40g gallette di riso con miele",
        "m": "250 kcal · P3 · C55 · G1"
      },
      {
        "t": "19:30 (post-workout)",
        "icon": "🥩",
        "txt": "220g manzo magro (5%) alla piastra; 300g patate dolci al forno; insalata con 10g olio EVO",
        "m": "650 kcal · P55 · C60 · G22"
      },
      {
        "t": "21:30",
        "icon": "🥣",
        "txt": "250g yogurt greco 0%; 20g cioccolato fondente 85%",
        "m": "260 kcal · P25 · C15 · G9"
      }
    ]
  },
  "d2": {
    "label": "Giorno 2 · Pull — Allenamento",
    "kcal": "≈ 2715 kcal",
    "macros": "~189g proteine · 272g carbo · 91g grassi",
    "items": [
      {
        "t": "7:00",
        "icon": "🥣",
        "txt": "250g yogurt greco 0% + 70g fiocchi d'avena + 100g mirtilli + 15g burro d'arachidi. Tutto in una ciotola, senza cottura.",
        "m": "555 kcal · P39 · C67 · G14"
      },
      {
        "t": "10:30",
        "icon": "🍎",
        "txt": "1 mela + 20g burro di arachidi",
        "m": "250 kcal · P7 · C25 · G16"
      },
      {
        "t": "13:00",
        "icon": "🦃",
        "txt": "220g petto di tacchino alla griglia; 90g pasta integrale (a crudo); verdure con 10g olio EVO",
        "m": "760 kcal · P66 · C72 · G18"
      },
      {
        "t": "16:30 (pre-workout)",
        "icon": "🍌",
        "txt": "1 banana + 30g gallette di riso con 15g miele",
        "m": "230 kcal · P3 · C50 · G1"
      },
      {
        "t": "19:30 (post-workout)",
        "icon": "🐟",
        "txt": "200g salmone al forno; 250g patate; insalata con 10g olio EVO",
        "m": "640 kcal · P46 · C48 · G28"
      },
      {
        "t": "21:30",
        "icon": "🥣",
        "txt": "200g fiocchi di latte magri (cottage) + 20g mandorle",
        "m": "280 kcal · P28 · C10 · G14"
      }
    ]
  },
  "d3": {
    "label": "Giorno 3 · Legs — Allenamento",
    "kcal": "≈ 2910 kcal",
    "macros": "~216g proteine · 311g carbo · 80g grassi",
    "items": [
      {
        "t": "7:00",
        "icon": "🥛",
        "txt": "250ml latte parzialmente scremato + 100g fiocchi d'avena; 250g yogurt greco 0% + 15g burro d'arachidi. Avena a freddo o lasciata in ammollo in frigorifero dalla sera prima.",
        "m": "724 kcal · P51 · C83 · G20"
      },
      {
        "t": "10:30",
        "icon": "🥣",
        "txt": "200g yogurt greco 0% in vasetto + 1 banana (circa 120g) + 10g mandorle. Pronti da consumare; tieni lo yogurt al fresco.",
        "m": "286 kcal · P24 · C35 · G7"
      },
      {
        "t": "13:00",
        "icon": "🍗",
        "txt": "200g petto di pollo; 90g riso basmati (a crudo); verdure con 10g olio EVO",
        "m": "740 kcal · P68 · C70 · G17"
      },
      {
        "t": "16:30 (pre-workout)",
        "icon": "🍯",
        "txt": "1 banana + 30g miele su 40g gallette di riso",
        "m": "280 kcal · P3 · C60 · G1"
      },
      {
        "t": "19:30 (post-workout)",
        "icon": "🐟",
        "txt": "200g salmone al forno; 250g patate dolci; insalata con 10g olio EVO",
        "m": "620 kcal · P45 · C48 · G26"
      },
      {
        "t": "21:30",
        "icon": "🍫",
        "txt": "250g yogurt greco 0% + 20g cioccolato fondente 85%",
        "m": "260 kcal · P25 · C15 · G9"
      }
    ]
  },
  "d4": {
    "label": "Giorno 4 · Extra — Allenamento",
    "kcal": "≈ 2780 kcal",
    "macros": "~198g proteine · 312g carbo · 77g grassi",
    "items": [
      {
        "t": "7:00",
        "icon": "🍞",
        "txt": "100g pane integrale con 25g burro d'arachidi e 20g marmellata; 250g yogurt greco 0%. Pane pronto, senza tostatura.",
        "m": "598 kcal · P41 · C67 · G18"
      },
      {
        "t": "10:30",
        "icon": "🥣",
        "txt": "200g yogurt greco 0% in vasetto + 1 banana (circa 120g) + 10g mandorle. Nessun frullatore; tieni lo yogurt al fresco.",
        "m": "286 kcal · P24 · C35 · G7"
      },
      {
        "t": "13:00",
        "icon": "🥩",
        "txt": "200g manzo magro (5%) macinato; 90g couscous integrale (a crudo); verdure con 10g olio EVO",
        "m": "730 kcal · P56 · C75 · G20"
      },
      {
        "t": "16:30 (pre-workout)",
        "icon": "🍎",
        "txt": "40g gallette di riso con 20g miele + 1 mela",
        "m": "260 kcal · P3 · C60 · G1"
      },
      {
        "t": "19:30 (post-workout)",
        "icon": "🍳",
        "txt": "2 uova intere ben cotte + 120g petto di pollo alla piastra; 300g patate al forno; 200g insalata con 10g olio EVO. Le uova sostituiscono parte del pollo.",
        "m": "646 kcal · P49 · C60 · G22"
      },
      {
        "t": "21:30",
        "icon": "🍫",
        "txt": "250g yogurt greco 0% + 20g cioccolato fondente 85%",
        "m": "260 kcal · P25 · C15 · G9"
      }
    ]
  },
  "r1": {
    "label": "Riposo A",
    "kcal": "≈ 2314 kcal",
    "macros": "~181g proteine · 206g carbo · 83g grassi",
    "items": [
      {
        "t": "7:30",
        "icon": "🥣",
        "txt": "250g yogurt greco 0% + 60g fiocchi d'avena + 200ml latte parzialmente scremato + 20g burro d'arachidi. Mescola a freddo o prepara la sera prima e conserva in frigorifero.",
        "m": "584 kcal · P46 · C57 · G18"
      },
      {
        "t": "10:30",
        "icon": "🥜",
        "txt": "20g mandorle + 1 mela",
        "m": "200 kcal · P4 · C27 · G10"
      },
      {
        "t": "13:00",
        "icon": "🦃",
        "txt": "200g petto di tacchino alla griglia; 70g riso basmati (a crudo); verdure con 10g olio EVO",
        "m": "650 kcal · P62 · C55 · G17"
      },
      {
        "t": "16:30",
        "icon": "🥣",
        "txt": "200g yogurt greco 0% + 15g noci",
        "m": "250 kcal · P23 · C8 · G13"
      },
      {
        "t": "19:30",
        "icon": "🐟",
        "txt": "200g merluzzo o platessa al forno; 200g patate al forno; insalata con 10g olio EVO",
        "m": "480 kcal · P44 · C45 · G16"
      },
      {
        "t": "21:30",
        "icon": "🍫",
        "txt": "20g cioccolato fondente 85% + 1 kiwi",
        "m": "150 kcal · P2 · C14 · G9"
      }
    ]
  },
  "r2": {
    "label": "Riposo B",
    "kcal": "≈ 2304 kcal",
    "macros": "~168g proteine · 251g carbo · 69g grassi",
    "items": [
      {
        "t": "7:30",
        "icon": "🥣",
        "txt": "250g yogurt greco 0% + 60g fiocchi d'avena + 200ml latte parzialmente scremato + 20g burro d'arachidi. Mescola a freddo o prepara la sera prima e conserva in frigorifero.",
        "m": "584 kcal · P46 · C57 · G18"
      },
      {
        "t": "10:30",
        "icon": "🧀",
        "txt": "150g fiocchi di latte magri (cottage) + 1 mela",
        "m": "230 kcal · P24 · C25 · G3"
      },
      {
        "t": "13:00",
        "icon": "🧆",
        "txt": "220g ceci cotti (scolati); 60g riso basmati (a crudo); verdure con 10g olio EVO",
        "m": "600 kcal · P26 · C90 · G14"
      },
      {
        "t": "16:30",
        "icon": "🥝",
        "txt": "20g mandorle + 1 kiwi",
        "m": "200 kcal · P4 · C22 · G11"
      },
      {
        "t": "19:30",
        "icon": "🐟",
        "txt": "200g tonno al naturale (o pesce spada); 200g patate al forno; insalata con 10g olio EVO",
        "m": "460 kcal · P46 · C42 · G14"
      },
      {
        "t": "21:30",
        "icon": "🍫",
        "txt": "200g yogurt greco 0% + 20g cioccolato fondente 85%",
        "m": "230 kcal · P22 · C15 · G9"
      }
    ]
  },
  "r3": {
    "label": "Riposo C",
    "kcal": "≈ 2342 kcal",
    "macros": "~164g proteine · 206g carbo · 96g grassi",
    "items": [
      {
        "t": "7:30",
        "icon": "🍞",
        "txt": "80g pane integrale con 20g burro d'arachidi; 250g yogurt greco 0% + 150ml latte parzialmente scremato. Tutto pronto, senza cottura.",
        "m": "538 kcal · P43 · C53 · G17"
      },
      {
        "t": "10:30",
        "icon": "🍊",
        "txt": "1 arancia + 15g noci",
        "m": "170 kcal · P3 · C20 · G10"
      },
      {
        "t": "13:00",
        "icon": "🐟",
        "txt": "200g salmone al forno; 70g quinoa (a crudo); verdure con 10g olio EVO",
        "m": "640 kcal · P44 · C55 · G28"
      },
      {
        "t": "16:30",
        "icon": "🍏",
        "txt": "1 mela + 20g mandorle",
        "m": "215 kcal · P5 · C25 · G12"
      },
      {
        "t": "19:30",
        "icon": "🍳",
        "txt": "2 uova intere ben cotte + 120g petto di pollo alla piastra; 200g patate al forno; 200g insalata con 10g olio EVO. Le uova sostituiscono parte del pollo.",
        "m": "569 kcal · P47 · C43 · G22"
      },
      {
        "t": "21:30",
        "icon": "🥣",
        "txt": "200g yogurt greco 0% + 10g cioccolato fondente 85%",
        "m": "210 kcal · P22 · C10 · G7"
      }
    ]
  }
};

const FOOD_TABS = [
  {key:"d1", short:"G1 Push"},
  {key:"d2", short:"G2 Pull"},
  {key:"d3", short:"G3 Legs"},
  {key:"d4", short:"G4 Extra"},
  {key:"r1", short:"Riposo A"},
  {key:"r2", short:"Riposo B"},
  {key:"r3", short:"Riposo C"},
];

const SUPPLEMENTS = [
  {icon:"⚡", title:"Creatina monoidrato", txt:"5 g al giorno, tutti i giorni (anche nei giorni di riposo), a qualsiasi orario. Non serve fase di carico. È l'integratore con più evidenze scientifiche per forza e massa muscolare."},
  {icon:"🥤", title:"Proteine in polvere (whey o vegetali)", txt:"Utili per raggiungere più comodamente i ~190 g/die di proteine, soprattutto negli spuntini. Non sono obbligatorie se riesci a raggiungere la quota con il cibo."},
  {icon:"💊", title:"Aminoacidi essenziali (EAA)", txt:"Opzionali: possono essere utili se ti alleni a digiuno o hai pasti molto distanziati dall'allenamento. Non indispensabili se la dieta è già ricca di proteine."},
  {icon:"🐟", title:"Omega-3 e multivitaminico", txt:"Opzionali, di supporto generale alla salute (soprattutto in deficit/mantenimento calorico prolungato)."},
];

