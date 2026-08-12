/* ═══════════════════════════════════════════════════════════════
   Strong Partners – Gesundheitstag-Konfigurator (gtk.js) · v1.0.0
   Einzige Quelle der Wahrheit für Logik UND Markup-Shell.
   Einbindung: <div id="gtk-root"></div> + dieses Script (defer),
   Details im Launch-README.
   Versand-Reihenfolge: 1) Webflow-Formular [data-gtk-form]
   2) n8n-Webhook (WEBHOOK_URL) 3) Demo-Modus.
   ═══════════════════════════════════════════════════════════════ */

/* ═════════════════════════════════════════════════════════════════
   KONFIGURATION — alles, was Strong Partners später pflegt,
   steht hier oben. Logik-Änderungen sind dafür nicht nötig.
   ═════════════════════════════════════════════════════════════════ */

/* Anfrage-Ziel. Im Livebetrieb: n8n-Webhook-URL eintragen.
   Solange der Platzhalter "REPLACE_ME" enthalten ist, wird der
   Versand nur simuliert (Demo-Modus). */
var WEBHOOK_URL='https://stratego-ms.app.n8n.cloud/webhook/REPLACE_ME';
var MAILTO='info@strong-partners.de'; /* Fallback-Adresse anpassen */

var PRICING={
  preis:'Gesundheitstage gibt es ab 600 € für einen halben Tag.',
  foerderung:'Dank §20 SGB V bezuschussen gesetzliche Krankenkassen zertifizierte Maßnahmen – in vielen Fällen zu einem erheblichen Anteil.'
};

/* Kompetenzfelder: Zuordnung Themen → Personal. Eine Spalte im
   Tagesplan = eine Person = ein Kompetenzfeld. Bei Bedarf von
   Strong Partners anpassbar (z. B. Team/Soziales umhängen). */
var KOMPETENZFELDER={
  bewegung:{label:'Bewegung & Ergonomie',themen:['bewegung','herz']},
  mental:{label:'Mental & Soziale Gesundheit',themen:['mental','schlaf','digital','team']},
  ernaehrung:{label:'Ernährung',themen:['ernaehrung']},
  checks:{label:'Gesundheitschecks',themen:['checks']}
};
var FELD_ORDER=['bewegung','mental','ernaehrung','checks'];

/* Kapazitätsregeln.
   maxTracks = Obergrenze paralleler Spalten je Unternehmensgröße
   (mind. 4, damit jedes belegte Kompetenzfeld eine eigene Person
   bekommen kann – Personal-Regel).
   SIZE_TARGET = Ziel-Spaltenzahl je Größe: sind weniger Felder
   gewählt, bekommen nachfragestarke Felder Zusatzspalten (I/II). */
var RULES={
  maxTracks:{s:4,m:4,l:5,xl:6},
  slots:{halb:2,ganz:4,mehr:4,unklar:4},
  dauer:{keynoteAuftakt:45,keynoteMittag:30,station:45,schnupperkurs:60},
  schnupperkurse:{halb:0,ganz:2,mehr:2,unklar:2}
};
var SIZE_TARGET={s:1,m:2,l:3,xl:4};

var THEME_LABELS={bewegung:'Bewegung & Ergonomie',ernaehrung:'Ernährung & gesunder Alltag',
  mental:'Mentale Gesundheit & Stressmanagement',schlaf:'Schlaf & Regeneration',team:'Resilienz & Teamstärke',
  herz:'Herz-Kreislauf-Gesundheit',checks:'Gesundheitschecks',digital:'Digitale Gesundheit',
  frauen:'Frauengesundheit',schnupper:'Schnupperkurse'};

/* Icon-Bibliothek im Phosphor-Bold-Stil (inline SVG, keine externe Abhängigkeit) */
var ICONS={
 user:'<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
 users:'<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M15.5 5.9a3 3 0 0 1 0 5.2"/><path d="M17.5 14.6a5.5 5.5 0 0 1 3 4.9"/>',
 users3:'<circle cx="12" cy="7.2" r="2.7"/><circle cx="5.3" cy="9.3" r="2.2"/><circle cx="18.7" cy="9.3" r="2.2"/><path d="M7.6 19.5a4.6 4.6 0 0 1 8.8 0"/><path d="M2 16.2a4.3 4.3 0 0 1 3-3.2"/><path d="M22 16.2a4.3 4.3 0 0 0-3-3.2"/>',
 building:'<rect x="5" y="3.5" width="14" height="17" rx="1"/><path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M9 15.5h2M13 15.5h2"/><path d="M3.5 20.5h17"/>',
 buildings:'<path d="M3 20.5h18"/><path d="M4.5 20.5V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v11.5"/><path d="M11.5 20.5V4.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16"/><path d="M7 11.5h2M7 15h2M15 7.5h1.8M15 11.5h1.8M15 15h1.8"/>',
 gradcap:'<path d="M2.5 9.5 12 5l9.5 4.5L12 14 2.5 9.5z"/><path d="M6.5 11.6v4.4c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.4"/><path d="M21.5 9.5v5"/>',
 briefcase:'<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"/><path d="M3.5 12.5h17"/>',
 hardhat:'<path d="M5 15.5a7 7 0 0 1 14 0"/><path d="M2.5 18.5h19"/><path d="M2.5 15.5h19"/><path d="M10 8.8V6.5a2 2 0 0 1 4 0v2.3"/>',
 laptop:'<rect x="4.5" y="5" width="15" height="10" rx="1.5"/><path d="M2.5 19h19"/>',
 flag:'<path d="M5.5 21V3.5"/><path d="M5.5 5h12.5l-3 4.5 3 4.5H5.5"/>',
 pluscircle:'<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>',
 target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.7"/>',
 heart:'<path d="M12 20.5s-8-4.7-8-10A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.5c0 5.3-8 10-8 10z"/>',
 star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
 barbell:'<path d="M7.5 12h9"/><rect x="4" y="7.5" width="2.6" height="9" rx="0.8"/><rect x="17.4" y="7.5" width="2.6" height="9" rx="0.8"/><path d="M1.8 10v4M22.2 10v4"/>',
 apple:'<path d="M12 7.6c-1-1.7-3-2.5-4.8-1.6C4.6 7.3 4 10.6 5.4 13.8c1.2 2.8 3.3 5.3 5.1 5.3.6 0 1-.3 1.5-.3s.9.3 1.5.3c1.8 0 3.9-2.5 5.1-5.3 1.4-3.2.8-6.5-1.8-7.8-1.8-.9-3.8-.1-4.8 1.6z"/><path d="M12 7.6c0-2 1.2-3.6 3-4.1"/>',
 smiley:'<circle cx="12" cy="12" r="8.5"/><path d="M8.7 14.2a4.6 4.6 0 0 0 6.6 0"/><path d="M9 9.4v.2M15 9.4v.2"/>',
 moon:'<path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.8 6.8 0 0 0 9.7 9.7z"/>',
 pulse:'<path d="M2.5 12h4l2.5-6.5 4.5 13 2.5-6.5h5.5"/>',
 clipboard:'<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5v-.7A1.3 1.3 0 0 1 10.3 2.5h3.4A1.3 1.3 0 0 1 15 3.8v.7"/><path d="M9 13.2l2 2 4-4.5"/>',
 phone:'<rect x="7" y="2.8" width="10" height="18.4" rx="2.2"/><path d="M11 18.2h2"/>',
 lightning:'<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8z"/>',
 bulb:'<path d="M12 3a6.2 6.2 0 0 0-4.1 10.8c.7.6 1.1 1.4 1.1 2.2h6c0-.8.4-1.6 1.1-2.2A6.2 6.2 0 0 0 12 3z"/><path d="M9.5 19h5M10.5 21.5h3"/>',
 swap:'<path d="M16 3.5l4 4-4 4"/><path d="M20 7.5H4.5"/><path d="M8 20.5l-4-4 4-4"/><path d="M4 16.5h15.5"/>',
 compass:'<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
 calendar:'<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 2.8v4M16 2.8v4"/>',
 question:'<circle cx="12" cy="12" r="8.5"/><path d="M9.4 9.3a2.7 2.7 0 1 1 3.9 2.5c-.8.4-1.3 1-1.3 1.8v.4"/><path d="M12 17v.2"/>',
 mappin:'<path d="M12 21.5s-7-6-7-11.3A7 7 0 0 1 19 10.2c0 5.3-7 11.3-7 11.3z"/><circle cx="12" cy="10" r="2.6"/>',
 globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5a13.5 13.5 0 0 1 0 17"/><path d="M12 3.5a13.5 13.5 0 0 0 0 17"/>',
 play:'<circle cx="12" cy="12" r="8.5"/><path d="M10.2 8.8l5 3.2-5 3.2z"/>',
 venus:'<circle cx="12" cy="9" r="5.2"/><path d="M12 14.2V21M8.5 18h7"/>'
};
function icon(name){
  return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[name]||ICONS.star)+'</svg>';
}

var QUESTIONS=[
 {key:'size',label:'Unternehmensgröße',title:'Wie groß ist euer Unternehmen?',multi:false,options:[
   {id:'s',icon:'user',title:'Bis 50 Mitarbeitende',desc:'Kompakter Gesundheitstag mit persönlicher Atmosphäre'},
   {id:'m',icon:'users',title:'50 bis 250 Mitarbeitende',desc:'Mehrere parallele Stationen, flexible Teilnahme'},
   {id:'l',icon:'building',title:'250 bis 750 Mitarbeitende',desc:'Große Modul- und Themenauswahl parallel, mehrere Durchläufe'},
   {id:'xl',icon:'buildings',title:'Über 750 Mitarbeitende',desc:'Mehrtägig oder standortweise, ggf. Gesundheitswoche'}]},
 {key:'standorte',label:'Standorte',title:'An wie vielen Standorten soll der Gesundheitstag stattfinden?',multi:false,options:[
   {id:'eins',icon:'mappin',title:'1 Standort',desc:'Ein gemeinsamer Tag an einem Ort'},
   {id:'zweidrei',icon:'buildings',title:'2 bis 3 Standorte',desc:'Gleiches Konzept, mehrfach ausgerollt'},
   {id:'vierplus',icon:'globe',title:'4 oder mehr Standorte',desc:'Roadshow oder Gesundheitswoche über alle Standorte'},
   {id:'standort_offen',icon:'question',title:'Noch offen',desc:'Wir beraten euch zur passenden Aufteilung'}]},
 {key:'audience',label:'Zielgruppe',title:'Wer soll am Gesundheitstag teilnehmen?',multi:false,options:[
   {id:'alle',icon:'users3',title:'Alle Mitarbeitenden',desc:'Breites Programm, für jeden etwas dabei'},
   {id:'azubis',icon:'gradcap',title:'Azubis & Nachwuchskräfte',desc:'Aktiv, spielerisch, auf junge Zielgruppen zugeschnitten'},
   {id:'fk',icon:'briefcase',title:'Führungskräfte',desc:'z. B. gesunde Führung, Stresskompetenz, Vorbildfunktion'},
   {id:'gewerblich',icon:'hardhat',title:'Gewerbliche Teams / Schichtbetrieb',desc:'z. B. körperliche Belastung, Schlaf & Schichtarbeit, Rücken'},
   {id:'remote',icon:'laptop',title:'Büro- / Hybrid-Teams',desc:'z. B. Ergonomie, Bewegungsmangel, digitale Formate'}]},
 {key:'occasion',label:'Anlass',title:'Was ist der Anlass für euren Gesundheitstag?',multi:true,
  hint:'Mehrfachauswahl möglich.',options:[
   {id:'einstieg',icon:'flag',title:'Einstieg ins BGM',desc:'Gesundheitsförderung zum ersten Mal sichtbar machen'},
   {id:'ergaenzung',icon:'pluscircle',title:'Bestehendes BGM ergänzen',desc:'Es gibt schon Maßnahmen, der Tag setzt einen Impuls obendrauf'},
   {id:'konkret',icon:'target',title:'Konkretes Thema angehen',desc:'Z. B. hohe Fehlzeiten, Stressbelastung, Rückenprobleme'},
   {id:'branding',icon:'heart',title:'Mitarbeiterbindung & Employer Branding',desc:'Wertschätzung zeigen, Arbeitgebermarke stärken, gemeinsame Zeit am Standort'},
   {id:'jubilaeum',icon:'star',title:'Jubiläum / besonderes Event',desc:'Gesundheitstag als Highlight einer Feier'}]},
 {key:'topics',label:'Schwerpunkte',title:'Welche Themen sollen im Mittelpunkt stehen?',multi:true,
  hint:'Mehrfachauswahl möglich. Wähle Schwerpunktthemen für ein fokussiertes Programm. Du kannst zum Ende der Abfrage natürlich noch Wunschmodule ergänzen oder vorgeschlagene Themen ersetzen.',options:[
   {id:'bewegung',icon:'barbell',title:'Bewegung & Ergonomie',desc:'z. B. Rückengesundheit, aktive Pausen, ergonomisches Arbeiten'},
   {id:'ernaehrung',icon:'apple',title:'Ernährung & gesunder Alltag',desc:'z. B. Snacks, Zuckermythen, Leistungsfähigkeit'},
   {id:'mental',icon:'smiley',title:'Mentale Gesundheit & Stress',desc:'z. B. Stressbewältigung, Achtsamkeit, Resilienz'},
   {id:'schlaf',icon:'moon',title:'Schlaf & Regeneration',desc:'z. B. Schlafhygiene, Entspannungstechniken'},
   {id:'team',icon:'users3',title:'Resilienz & Teamstärke',desc:'z. B. Gruppendynamik, soziale Gesundheit, Zusammenhalt'},
   {id:'herz',icon:'pulse',title:'Herz-Kreislauf-Gesundheit',desc:'z. B. Training, Blutdruck, Alltagsbewegung'},
   {id:'checks',icon:'clipboard',title:'Gesundheitschecks',desc:'z. B. HRV-Messung, Physiocheck, BIA-Waage, Wirbelsäulenvermessung'},
   {id:'digital',icon:'phone',title:'Digitale Gesundheit',desc:'z. B. ständige Erreichbarkeit, Bildschirmzeit, gesunde Routinen'},
   {id:'frauen',icon:'venus',title:'Frauengesundheit',desc:'z. B. Zyklus, Wechseljahre, Gender Medicine – schaltet themenspezifische Module frei'},
   {id:'schnupper',icon:'play',title:'Schnupperkurse',desc:'z. B. Yoga, Pilates, Functional Fitness als gemeinsamer Abschluss'}]},
 {key:'format',label:'Format',title:'Wie soll sich der Tag anfühlen?',multi:false,options:[
   {id:'aktiv',icon:'lightning',title:'Aktiv & mitmachen',desc:'z. B. Workshops, Bewegungseinheiten, Mitmachstationen'},
   {id:'wissen',icon:'bulb',title:'Wissen & Impulse',desc:'z. B. Vorträge, Keynotes, kompakte Inputs'},
   {id:'mix',icon:'swap',title:'Mix aus beidem',desc:'Impulse plus Praxis, die bewährte Kombination'},
   {id:'offen',icon:'compass',title:'Offen für eure Empfehlung',desc:'Wir stellen das ideale Format für euch zusammen'}]},
 {key:'duration',label:'Zeitrahmen',title:'Wie viel Zeit habt ihr eingeplant?',multi:false,options:[
   {id:'halb',icon:'clock',title:'Halber Tag',desc:'Ca. 4 Stunden, kompakt und fokussiert'},
   {id:'ganz',icon:'sun',title:'Ganzer Tag',desc:'Ca. 8 Stunden, das volle Programm mit Stationen'},
   {id:'mehr',icon:'calendar',title:'Mehrere Tage',desc:'Gesundheitswoche oder standortweise Durchführung'},
   {id:'unklar',icon:'question',title:'Noch offen',desc:'Wir beraten euch zur passenden Dauer'}]}
];

/* Modulpool. Neues Modul = neues Objekt hier, fertig.
   typ: keynote | station | aktiv | schnupperkurs | baustein
   kat: Gruppierung im Modul-Pool ("Weitere Module entdecken"),
        je Pool-Gruppe genau eine Plan-Spalte (Stationen) bzw. die
        Auftakt-/Mittags-/Abschlusszeilen (Keynotes, Schnupperkurse)
   themen: Tags, themen[0] = Primärthema (bestimmt Zell-Tag + Kompetenzfeld/Spalte).
           'frauen' läuft immer nur als Zweit-Tag – es hat KEIN eigenes
           Kompetenzfeld, die Module liegen über ihr echtes Spaltenthema.
   fit: Zielgruppen mit besonders gutem Fit (weiche Empfehlungs-Gewichtung)
   slots: belegte Programm-Slots im Tagesplan (Default 1)
   only: hartes Sichtbarkeits-Gate (siehe passesGate):
         'remote' | 'azubis' | 'fk' | 'gewerblich' → Zielgruppe (Frage 3),
         'frauen' → Themenwahl Frauengesundheit (Frage 5).
         Ohne only ist ein Modul immer sichtbar.
   poolOnly: true = nie automatisch empfohlen, nur im Pool auffindbar
             (branchen-/kantinenspezifisch, ohne eigenes Abfragefeld) */
var MODULES=[
 /* ═══════════ Spalte BEWEGUNG & ERGONOMIE (25) ═══════════ */
 /* — Keynotes — */
 {id:'kn_stark',name:'Stark im Arbeitsalltag',typ:'keynote',kat:'Keynotes & Impulse',themen:['bewegung','mental','ernaehrung'],fit:[],dauer:45,
  desc:'Was bedeutet ganzheitliche Gesundheit? Gemeinsamer Auftakt mit Gesundheitsmythen, alltagsnahen Beispielen und der Vorstellung aller Stationen des Tages.'},
 {id:'kn_online',name:'Online-Keynote (digitales Format)',typ:'keynote',kat:'Keynotes & Impulse',themen:['bewegung','mental','ernaehrung','schlaf','digital'],fit:['remote'],dauer:45,only:'remote',
  desc:'Digitaler Impulsvortrag zu eurem Wunschthema, ideal für Remote- und Hybrid-Teams an verteilten Standorten.'},
 {id:'kn_mobil',name:'Mobil, aufrecht und schmerzfrei durch den Arbeitsalltag',typ:'keynote',kat:'Keynotes & Impulse',themen:['bewegung'],fit:[],dauer:45,
  desc:'[ENTWURF] Beweglich und aufrecht durch den Arbeitstag: wie Haltung, Mobilität und kleine Bewegungsroutinen Verspannungen und Schmerzen vorbeugen – mit einfachen Impulsen für Büro und unterwegs.'},
 {id:'kn_anatomie',name:'Anatomie Basics: Was unser Körper wirklich kann',typ:'keynote',kat:'Keynotes & Impulse',themen:['bewegung'],fit:[],dauer:45,
  desc:'Eine interaktive Reise durch den eigenen Körper: Faszien, Wirbelsäule, Hüfte und Muskelketten verständlich erklärt – mit kleinen Mitmachimpulsen für alle, die ihren Körper besser verstehen und im Alltag gesünder nutzen wollen.'},
 {id:'kn_stayactive',name:'Stay Active Impuls: Aktive Pause',typ:'keynote',kat:'Keynotes & Impulse',themen:['bewegung'],fit:[],dauer:45,
  desc:'Rücken, Kopf, Müdigkeit? Schon ein paar Minuten Bewegung am Tag helfen. Einfache Routinen ohne Equipment und ohne viel Zeit, die Spaß machen und sich sofort umsetzen lassen.'},
 {id:'kn_homeoffice',name:'Benefit & Challenge - Herausforderungen im Home Office',typ:'keynote',kat:'Keynotes & Impulse',themen:['bewegung','mental'],fit:['remote'],dauer:45,only:'remote',
  desc:'[ENTWURF] Home Office bringt Freiheit und Tücken zugleich: Bewegungsmangel, Abgrenzung, Ergonomie. Wie sich die Vorteile nutzen und die typischen Fallen im hybriden Alltag vermeiden lassen.'},
 {id:'kn_azubi_stark',name:'Stark durch den Ausbildungsalltag: Mit Power ins Berufsleben!',typ:'keynote',kat:'Keynotes & Impulse',themen:['bewegung','mental','ernaehrung'],fit:['azubis'],dauer:45,only:'azubis',
  desc:'[ENTWURF] Fit und motiviert durch die Ausbildung: Bewegung, Ernährung und mentale Stärke als Basis für einen guten Start ins Berufsleben – aktiv und nah an der jungen Zielgruppe.'},
 /* — Stationen & Aktiv-Einheiten — */
 {id:'st_ergonomie',name:'Ergonomie am Arbeitsplatz',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung'],fit:['remote','alle'],dauer:45,
  desc:'Ein ergonomisches Büro ist nur ergonomisch, wenn man es richtig nutzt. Tricks für Rücken, Nacken und Hüfte, im Office und im Home-Office.'},
 {id:'st_aktivpause',name:'Aktive Pause, Faszientraining & Rücken-Fit',typ:'aktiv',kat:'Bewegung & Ergonomie',themen:['bewegung'],fit:['alle','gewerblich'],dauer:45,
  desc:'Kleine Bewegungs- und Lockerungseinheiten für den Arbeitsalltag plus Erste-Hilfe-Übungen bei Verspannungen. Ohne Schwitzen, ohne Sportkleidung.'},
 {id:'st_hk_training',name:'Effektives Herz-Kreislauf-Training - fit fürs Herz, stark im Alltag',typ:'station',kat:'Bewegung & Ergonomie',themen:['herz','bewegung'],fit:[],dauer:45,
  desc:'Cardio, Intervalltraining und die richtige Intensität: wie effektives Training die Herzgesundheit langfristig verbessert.'},
 {id:'st_walkfit',name:'Walk & Fit: dein aktiver Spaziergang',typ:'aktiv',kat:'Bewegung & Ergonomie',themen:['herz','bewegung'],fit:['alle'],dauer:45,
  desc:'Strammer Spaziergang mit Stationen: kleine Challenges, Workouts und Dehnübungen an der frischen Luft.'},
 {id:'st_hiit',name:'HIIT für die Herzaktivierung',typ:'aktiv',kat:'Bewegung & Ergonomie',themen:['herz','bewegung'],fit:['azubis'],dauer:45,
  desc:'Grundlagen des hochintensiven Intervalltrainings und passende Übungen. Sportkleidung von Vorteil.'},
 {id:'st_ergo_industrie',name:'Ergonomie in der Industrie',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung'],fit:['gewerblich'],dauer:45,only:'gewerblich',
  desc:'[ENTWURF] Ergonomie für körperlich fordernde und schichtbetriebene Arbeitsplätze: rückenschonendes Heben, Haltung an der Maschine und Ausgleichsübungen gegen einseitige Belastung.'},
 {id:'st_faszien_ball',name:'Faszienorientiertes Training mit dem Tennisball',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung'],fit:[],dauer:45,
  desc:'[ENTWURF] Faszien lösen mit einfachstem Equipment: mit dem Tennisball Verklebungen und Verspannungen selbst bearbeiten – eine Technik zum sofortigen Mitnehmen in den Alltag.'},
 {id:'st_mythen',name:'Lüge oder Wahrheit - Fitness & Ernährungsmythen auf der Spur',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung','ernaehrung'],fit:['azubis','alle'],dauer:45,
  desc:'[ENTWURF] Detox-Tees, Sixpack über Nacht, „no pain no gain"? Im interaktiven Quiz nehmen wir gängige Fitness- und Ernährungsmythen auseinander und trennen Fakten von Halbwissen.'},
 {id:'st_energybike',name:'Bewegung, Ernährung & Klimaschutz – aktiv mit dem Energy Bike',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung','ernaehrung'],fit:['alle','azubis'],dauer:45,
  desc:'Bewegung, klimafreundliche Ernährung und Spaß vereint: am Energy Bike wird der Smoothie selbst erstrampelt. Rund ums Mixen geht es um saisonale Zutaten, CO₂-Fußabdruck und Nachhaltigkeit zum Anfassen. Nutzt dasselbe Gerät wie das Smoothie Bike.'},
 {id:'st_kraft',name:'Krafttraining für mehr Beweglichkeit: stark, stabil, flexibel',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung'],fit:[],dauer:45,
  desc:'[ENTWURF] Kraft und Beweglichkeit gehören zusammen: funktionelle Übungen, die stark, stabil und flexibel machen – für einen belastbaren Körper im Alltag.'},
 {id:'st_ruecken_bs',name:'Rücken im Gleichgewicht: Verstehen, Vorbeugen und Bewegen bei Bandscheibenvorfällen',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung'],fit:[],dauer:45,
  desc:'[ENTWURF] Verstehen, vorbeugen, bewegen: wie die Wirbelsäule funktioniert, was bei Bandscheibenbeschwerden hilft und welche Übungen den Rücken sicher stärken.'},
 {id:'st_sos_ruecken',name:'SOS Übungen bei Rückenschmerzen & Bürotaugliche Dehnungen',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung'],fit:[],dauer:45,
  desc:'[ENTWURF] Erste Hilfe bei akuten Rückenschmerzen plus bürotaugliche Dehnungen, die sich zwischendurch am Arbeitsplatz umsetzen lassen – für schnelle Entlastung.'},
 {id:'st_augen',name:'Augengesundheit am Bildschirm – entspannt sehen trotz digitalem Alltag',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung','digital'],fit:['remote'],dauer:45,
  desc:'[ENTWURF] Trockene, müde Augen nach dem Bildschirmtag? Einfache Übungen und Routinen, die die Augen entspannen und entlasten – für angenehmes Sehen trotz digitalem Alltag.'},
 {id:'st_feuerwehr',name:'Training & Leistungsfähigkeit im Feuerwehrdienst',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung'],fit:['gewerblich'],dauer:45,poolOnly:true,
  desc:'[ENTWURF] Zielgerichtetes Training für die besonderen körperlichen Anforderungen im Feuerwehrdienst: Kraft, Ausdauer und Belastbarkeit für den Einsatz. Branchenspezifisches Modul.'},
 {id:'st_wechsel_bewegung',name:'Körper im Wandel: Bewegung in den Wechseljahren gezielt nutzen',typ:'station',kat:'Bewegung & Ergonomie',themen:['bewegung','frauen'],fit:[],dauer:45,only:'frauen',
  desc:'[ENTWURF] Der Körper verändert sich in den Wechseljahren – Bewegung hilft gezielt gegen typische Beschwerden. Welches Training Knochen, Muskeln und Wohlbefinden in dieser Phase unterstützt.'},
 /* — Schnupperkurse — */
 {id:'sk_functional',name:'Schnupperkurs Functional Fitness',typ:'schnupperkurs',kat:'Schnupperkurse & Abschluss',themen:['bewegung','herz'],fit:['azubis'],dauer:60,
  desc:'Energiegeladener Abschluss zum Mitmachen: funktionelles Ganzkörpertraining mit unseren Coaches.'},
 {id:'sk_mobility',name:'Schnupperkurs Mobility & Stretching',typ:'schnupperkurs',kat:'Schnupperkurse & Abschluss',themen:['bewegung'],fit:['gewerblich'],dauer:60,
  desc:'Beweglichkeit verbessern, Verspannungen lösen: der sanfte, aktive Tagesabschluss.'},
 {id:'sk_ruecken',name:'Schnupperkurs Rücken-Fit',typ:'schnupperkurs',kat:'Schnupperkurse & Abschluss',themen:['bewegung'],fit:['gewerblich','alle'],dauer:60,
  desc:'[ENTWURF] Ein aktiver Abschluss rund um den Rücken: Kräftigung, Mobilisation und Entlastung – angeleitet von unseren Coaches, für jedes Level.'},

 /* ═══════════ Spalte MENTAL & SOZIALE GESUNDHEIT (33) ═══════════ */
 /* — Keynotes — */
 {id:'kn_stress',name:'Keynote „Stressmanagement und Achtsamkeit im Arbeitsalltag“',typ:'keynote',kat:'Keynotes & Impulse',themen:['mental'],fit:['fk'],dauer:60,
  desc:'Unsere Psychologin zeigt, wie ihr Stressoren erkennt, Achtsamkeit im Alltag fördert und mit praktischen Methoden euer Stresslevel senkt. Mit interaktiven Elementen.'},
 {id:'kn_digital',name:'Keynote „Digitale Gesundheit – Effizienz vs. Erschöpfung“',typ:'keynote',kat:'Keynotes & Impulse',themen:['digital','mental'],fit:['remote','fk'],dauer:45,
  desc:'Push-Nachrichten, ständige Erreichbarkeit, Bildschirmzeit: konkrete Strategien gegen mentale Erschöpfung und für gesunde digitale Routinen.'},
 {id:'kn_immun',name:'Immunbooster Soziales Umfeld: Beziehungen für Körper & Geist',typ:'keynote',kat:'Keynotes & Impulse',themen:['mental','team'],fit:[],dauer:45,
  desc:'Ein starkes soziales Umfeld wirkt stressreduzierend und stärkt die Abwehrkraft. Wie sich positive Beziehungen bewusst in den Alltag holen lassen – als natürlicher Immunbooster für Körper und Geist.'},
 {id:'kn_leistungsdruck',name:'Leistungsdruck - Was wir uns vom Leistungssport abschauen können!',typ:'keynote',kat:'Keynotes & Impulse',themen:['mental'],fit:['fk'],dauer:45,
  desc:'Coach Thomas Reuter (2. Bundesliga Basketball) und unsere Psychologin ziehen Parallelen zum Leistungssport: wie man Druck, Stress und Nervosität mental standhält und im Arbeitsalltag mentale Stärke aufbaut.'},
 {id:'kn_pospsych',name:'Positive Psychologie for the Win! Deine Superkraft in der Prüfungszeit',typ:'keynote',kat:'Keynotes & Impulse',themen:['mental'],fit:['azubis'],dauer:45,only:'azubis',
  desc:'Die Prüfungszeit als Chance: wie die Prinzipien der Positiven Psychologie in der Ausbildung eine kraftvolle, positive Haltung fördern – für mehr Balance und frische Energie in der Zwischenprüfung.'},
 {id:'kn_levelup',name:'Level Up! Selbstbewusstsein für die Zielgerade',typ:'keynote',kat:'Keynotes & Impulse',themen:['mental'],fit:['azubis'],dauer:45,only:'azubis',
  desc:'Rückenwind für die Zielgerade der Ausbildung. „Ich bin ja nur Azubi!" gilt nicht mehr – dieser Impuls macht Mut, die eigene Entwicklung klar zu sehen und selbstbewusst in den Berufseinstieg zu starten.'},
 {id:'kn_ownday',name:'Own Your Day! Zeit- & Selbstmanagement im Ausbildungsalltag',typ:'keynote',kat:'Keynotes & Impulse',themen:['mental'],fit:['azubis'],dauer:45,only:'azubis',
  desc:'[ENTWURF] Zeit- und Selbstmanagement im Ausbildungsalltag: Prioritäten setzen, den Tag strukturieren und Aufgaben souverän steuern – für mehr Überblick und weniger Stress.'},
 {id:'kn_zyklus',name:'Frauengesundheit & Zykluswissen: Den natürlichen Rhythmus nutzen',typ:'keynote',kat:'Keynotes & Impulse',themen:['mental','frauen'],fit:[],dauer:45,only:'frauen',
  desc:'Der weibliche Zyklus beeinflusst Energie, Konzentration und Stimmung stärker, als vielen bewusst ist. Ein alltagsnaher Blick auf die Zyklusphasen und wie sich ihr natürlicher Rhythmus bewusst als Ressource nutzen lässt.'},
 /* — Stationen & Aktiv-Einheiten — */
 {id:'st_schlaf',name:'Schlaf & Schlafhygiene',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['schlaf','mental'],fit:['gewerblich'],dauer:45,
  desc:'Was passiert im Körper, wenn wir schlafen, und wie verbessern wir unsere Schlafqualität? Inklusive Entspannungstechniken zum Mitnehmen.'},
 {id:'st_resilienz',name:'Resilienz & Abgrenzung - Stärke für den (Arbeits-)Alltag',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','team'],fit:['fk'],dauer:45,
  desc:'Mentale Widerstandskraft und gesunde Abgrenzung gezielt stärken, für mehr Gelassenheit im Joballtag.'},
 {id:'st_konflikt',name:'Konfliktmanagement & Umgang mit unangenehmen Emotionen',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','team'],fit:['fk'],dauer:45,
  desc:'Konflikte souverän lösen und mit negativen Emotionen umgehen, besonders wertvoll für Führungsrollen.'},
 {id:'st_zirkel',name:'Zirkeltraining Stressmanagement (3 Stationen)',typ:'aktiv',kat:'Mentale Gesundheit & Regeneration',themen:['mental','bewegung'],fit:[],dauer:105,slots:2,
  desc:'Drei Stationen à 30 Minuten: Atemtechniken & Meditation, Mindset & Stressbewältigung mit unserer Psychologin, Faszientraining & bewegte Pause. Belegt zwei Programm-Slots.'},
 {id:'st_officeparcours',name:'Officeparcours: Gruppendynamik & soziale Gesundheit',typ:'aktiv',kat:'Mentale Gesundheit & Regeneration',themen:['team','bewegung'],fit:['alle','azubis'],dauer:45,
  desc:'Minispiele, die den Ernst des Alltags vergessen lassen: lockern die Atmosphäre und stärken Kooperation und Kommunikation im Team.'},
 {id:'st_boxit',name:'BOX IT OUT! Stark im Umgang mit Stress im (Arbeits-)Alltag',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','bewegung'],fit:['alle','azubis'],dauer:45,
  desc:'Erst Stressbewältigung mit Tools & Techniken, dann körperlicher Ausgleich beim gemeinsamen Boxen: Grundtechniken, Partnerübungen und eine Gruppen-Challenge. Wir boxen miteinander, nicht gegeneinander. Braucht Box-Equipment.'},
 {id:'st_innere_stimme',name:'Die innere kritische Stimme - eher Freund:in oder Feind:in?',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental'],fit:[],dauer:45,
  desc:'Antreiber, Zweifel, Wünsche und Ängste – im Kopf tobt ein ständiges Team-Meeting. Wir tauchen ins Konzept des inneren Teams ein und drehen den inneren Cheerleader lauter, um fokussiert und in Balance zu bleiben.'},
 {id:'st_mindset_matters',name:'Mindset Matters - Denkmuster & Glaubenssätze unter der Lupe',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental'],fit:[],dauer:45,
  desc:'Glaubenssätze wie „Ich muss perfekt sein" bremsen uns aus. Wir erkennen eigene Denkmuster und lenken sie Schritt für Schritt in eine gesündere, motivierende Richtung – für mehr Klarheit und mentale Stärke.'},
 {id:'st_mentalload',name:'Mental Load & Hamsterrad - Strategien für mehr Klarheit',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental'],fit:[],dauer:45,
  desc:'Planen, koordinieren, im Kopf behalten: Mental Load bleibt oft unsichtbar. Wir klären, wie er entsteht, und entwickeln realistische Strategien, um ihn zu verringern und klar zu kommunizieren.'},
 {id:'st_entspannung',name:'Entspannungsmanagement',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','schlaf'],fit:[],dauer:45,
  desc:'Verschiedene Entspannungstechniken – Atemübungen, progressive Muskelrelaxation und Meditation – die überall in den Alltag passen. Mit Workbook für alle Anleitungen zum Mitnehmen.'},
 {id:'st_regeneration',name:'Regeneration & Erholung',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['schlaf','mental'],fit:[],dauer:45,
  desc:'Unser Akku braucht regelmäßig neue Energie. Wir reflektieren individuelle Tagesabläufe und entwickeln Strategien, um nach vollen Tagen wieder in eine gesunde Balance zu finden – für mehr Fokus und Erholung.'},
 {id:'st_digitaldetox',name:'Digital Detox & Healthy Habits',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['digital','mental'],fit:[],dauer:45,
  desc:'[ENTWURF] Ständige Erreichbarkeit und Dauer-Scrollen kosten Energie. Wie bewusste digitale Routinen und kleine Healthy Habits helfen, den Kopf frei und die Aufmerksamkeit gesund zu halten.'},
 {id:'st_multitasking',name:'Multitasking, Erschöpfung & Fokus',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['digital','mental'],fit:['remote'],dauer:45,only:'remote',
  desc:'[ENTWURF] Multitasking ist ein Mythos, der erschöpft. Wie sich Aufmerksamkeit bündeln, Fokuszeiten schaffen und digitale Ablenkung reduzieren lässt – für konzentriertes Arbeiten.'},
 {id:'st_underpressure',name:'Under Pressure - Entscheidungsfindung unter Stress',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','team'],fit:['fk'],dauer:45,only:'fk',
  desc:'Handlungssicher bleiben in Stress- und Ausnahmesituationen: Leitsätze aus dem Crew-Ressource-Management, der Faktor Mensch und Case-Studies in Kleingruppen – Tipps aus der Praxis für die Praxis.'},
 {id:'st_failforward',name:'Fail Forward - Resilienz als Erfolgsfaktor für Studium & Beruf',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','team'],fit:['azubis'],dauer:45,only:'azubis',
  desc:'Scheitern als Sprungbrett: wer scheitert, lernt und wächst. Anhand der sieben Säulen der Resilienz bauen wir gezielt Widerstandskraft auf – für Studium, Karriere und dich selbst.'},
 {id:'st_klarimkopf',name:'Klar im Kopf: Gelassenheit & Balance für deine Prüfungsvorbereitung',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental'],fit:['azubis'],dauer:45,only:'azubis',
  desc:'Prüfungsstress, kreisende Gedanken, Blackout? Wie ein starkes Mindset, Ansätze der Positiven Psychologie und kurze Bewegungsimpulse helfen, gelassen in Prüfungen zu gehen und das eigene Potenzial abzurufen.'},
 {id:'st_nextchapter',name:'Next Chapter! Mut & Stärke für den nächsten Schritt',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','team'],fit:['azubis'],dauer:45,only:'azubis',
  desc:'Der Übergang von der Ausbildung ins Team bringt neue Rollen und Verantwortung. Tools & Techniken für Vorstellungsgespräche und gezielt gestärkte Entscheidungskompetenz – für einen starken nächsten Schritt.'},
 {id:'st_wechsel_mental',name:'Frauengesundheit & Wechseljahre: Den eigenen Körper besser verstehen',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','frauen'],fit:[],dauer:45,only:'frauen',
  desc:'[ENTWURF] Die Wechseljahre bringen körperliche und emotionale Veränderungen. Verständliches Grundwissen zu hormonellen Prozessen und Impulse, um diese Phase bewusst und gelassen zu gestalten.'},
 {id:'st_menopause',name:'Menopause im Arbeitsalltag: verstehen, sensibilisieren & begleiten',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','frauen'],fit:[],dauer:45,only:'frauen',
  desc:'[ENTWURF] Menopause sichtbar und besprechbar machen: wie Teams und Führungskräfte für das Thema sensibilisiert und betroffene Kolleginnen im Arbeitsalltag gut begleitet werden. Auch für gemischte Gruppen geeignet.'},
 {id:'st_selbstbewusst_frau',name:'Selbstbewusstsein als Frau: Die eigene innere Stärke entdecken',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','frauen'],fit:[],dauer:45,only:'frauen',
  desc:'Selbstbewusstsein darf wachsen. Ein geschützter Raum, um innere Zweifel zu erkennen und ihnen mit Klarheit und Selbstvertrauen zu begegnen – für mehr innere Stabilität und ein sicheres Auftreten. Rahmen bitte gemeinsam abstimmen.'},
 {id:'st_wechsel_schlaf',name:'Wechseljahre & Schlaf: Warum er sich verändert & was hilft',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['schlaf','frauen'],fit:[],dauer:45,only:'frauen',
  desc:'[ENTWURF] Warum sich der Schlaf in den Wechseljahren verändert und was wirklich hilft: hormonelle Zusammenhänge verständlich erklärt, mit konkreten Strategien für erholsame Nächte.'},
 {id:'st_gender_med',name:'Gender Medicine: Warum Gesundheit nicht für alle gleich funktioniert',typ:'station',kat:'Mentale Gesundheit & Regeneration',themen:['mental','frauen'],fit:[],dauer:45,only:'frauen',
  desc:'Herzinfarkte, Medikamente, Symptome – Gesundheit funktioniert nicht für alle gleich. Ein verständlicher Blick auf geschlechtersensible Prävention, mit vielen Aha-Effekten für informierte Entscheidungen.'},
 /* — Schnupperkurse & Abschluss — */
 {id:'sk_yoga',name:'Schnupperkurs Yoga',typ:'schnupperkurs',kat:'Schnupperkurse & Abschluss',themen:['mental','schlaf'],fit:[],dauer:60,
  desc:'Runterkommen und Kopf freikriegen: gemeinsamer Yoga-Abschluss für alle Level.'},
 {id:'sk_pilates',name:'Schnupperkurs Pilates',typ:'schnupperkurs',kat:'Schnupperkurse & Abschluss',themen:['mental','bewegung'],fit:[],dauer:60,
  desc:'Körperlicher Ausgleich mit Fokus auf Tiefenmuskulatur und Haltung, angeleitet von unseren Coaches.'},
 {id:'bs_ausklang',name:'Gemeinsamer Tagesausklang mit Feedback & Reflexion',typ:'baustein',kat:'Schnupperkurse & Abschluss',themen:['team'],fit:[],dauer:30,
  desc:'Gemeinsamer Abschluss: Erfahrungen teilen, Transfer in den Alltag sichern, Gruppenzusammenhalt feiern.'},

 /* ═══════════ Spalte ERNÄHRUNG (17) ═══════════ */
 /* — Keynotes — */
 {id:'kn_ernaehrung',name:'Jobfood: Gesunde Ernährung im (Arbeits-)Alltag',typ:'keynote',kat:'Keynotes & Impulse',themen:['ernaehrung'],fit:[],dauer:45,
  desc:'Ernährungsbasics kompakt: was der Körper an Nährstoffen und Flüssigkeit braucht und wie gesunde Ernährung auch an stressigen Tagen gelingt. Ideal vor der Mittagspause.'},
 {id:'kn_fruehstueck',name:'Frühstücksfest: So gelingt ein gesunder Start in den Arbeitstag',typ:'keynote',kat:'Keynotes & Impulse',themen:['ernaehrung'],fit:[],dauer:45,
  desc:'Ein ausgewogenes Frühstück trägt Energie und Konzentration durch den Tag. Nährstoffreiche Ideen, die Heißhunger vorbeugen – von schnellen Lösungen für hektische Tage bis zu reichhaltigen Optionen, die lange satt machen.'},
 {id:'kn_kantine',name:'How to Kantine & Buffet: Smarte Entscheidungen treffen',typ:'keynote',kat:'Keynotes & Impulse',themen:['ernaehrung'],fit:[],dauer:45,poolOnly:true,
  desc:'Gesund essen scheitert oft an der Orientierung, nicht am Wollen. Einfache Faustregeln und smarte Lebensmittelkombinationen, um bei großer Auswahl ohne Verbote die klügere Entscheidung zu treffen.'},
 /* — Stationen & Aktiv-Einheiten — */
 {id:'st_zucker',name:'Ernährungsbasics, Zuckermythen & Zuckerpuzzeln',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:[],dauer:45,
  desc:'Wie viel Zucker steckt wirklich in Lebensmitteln? Ernährungsbasics, Zuckermythen und das beliebte Zuckerpuzzeln mit unserer Ernährungsberaterin.'},
 {id:'st_schlafern',name:'Iss klug, Schlaf gut: Wie Ernährung deinen Schlaf beeinflusst',typ:'station',kat:'Ernährung',themen:['ernaehrung','schlaf'],fit:['gewerblich'],dauer:45,
  desc:'Welche Lebensmittel fördern guten Schlaf, wie wirkt Koffein im Körper und wann sollte die letzte Mahlzeit sein?'},
 {id:'st_stressessen',name:'Stressessen: Tipps & Tricks gegen emotionales Essen',typ:'station',kat:'Ernährung',themen:['ernaehrung','mental'],fit:[],dauer:45,
  desc:'Stressessen erkennen, Muster durchbrechen und gesunde Alternativen für anspruchsvolle Tage etablieren.'},
 {id:'st_smoothie',name:'Smoothie Bike + Ernährungsstation',typ:'station',kat:'Ernährung',themen:['ernaehrung','team'],fit:['alle','azubis'],dauer:45,
  desc:'Offene Ganztagsstation mit unserer Ernährungsberaterin: Smoothies selbst erstrampeln, Snack-Tipps und offene Ernährungsberatung. Ein echter Erlebnis-Baustein. Nutzt dasselbe Gerät wie das Energy Bike.'},
 {id:'st_kochen',name:'Online-Kochworkshop',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:['remote'],dauer:60,only:'remote',
  desc:'Mit Einkaufsliste oder Kochbox vorab: gemeinsam online leckere, alltagstaugliche Gerichte kochen. Ideal für verteilte Teams.'},
 {id:'st_bowl',name:'Ernährungsbasics & How to Bowl',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:['alle'],dauer:45,
  desc:'Start mit einem Quiz, dann die Basics gesunder Ernährung – und direkt angewendet an der „How to Bowl"-Station: frische, saisonale Zutaten am Buffet, zusammengestellt mit unserer Oecotrophologin.'},
 {id:'st_trends',name:'Ernährungstrends unter der Lupe',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:[],dauer:45,
  desc:'[ENTWURF] Intervallfasten, Superfoods, Low Carb & Co.: wir ordnen aktuelle Ernährungstrends wissenschaftlich ein und schauen, was im Alltag wirklich trägt und was nur Hype ist.'},
 {id:'st_gewicht',name:'Gewichtsreduktion & Gewichtskontrolle: Die Basics verstehen',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:[],dauer:45,
  desc:'[ENTWURF] Die Basics eines gesunden Gewichts verstehen: Energiebilanz, Sättigung und realistische Gewohnheiten – ohne Crash-Diät, dafür alltagstauglich und nachhaltig.'},
 {id:'st_diabetes',name:'Diabetes: verstehen, vorbeugen & Zuckerfallen erkennen',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:[],dauer:45,
  desc:'[ENTWURF] Diabetes verstehen und vorbeugen: wie Blutzucker funktioniert, wo versteckte Zuckerfallen lauern und welche Ernährungs- und Bewegungsgewohnheiten das Risiko senken.'},
 {id:'st_moodfood',name:'Mood Food: Essen, das gute Laune macht',typ:'station',kat:'Ernährung',themen:['ernaehrung','mental'],fit:[],dauer:45,
  desc:'Essen wirkt auf die Stimmung: wie Nährstoffe wie Tryptophan, Omega-3 und B-Vitamine die Bildung von Glückshormonen fördern. Mit Snackplaner, Rezeptideen und Impulsen für die mentale Balance – ganz ohne Diätdenken.'},
 {id:'st_mealprep',name:'Mealprep: Gut vorbereitet durch die Woche',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:[],dauer:45,
  desc:'[ENTWURF] Gut vorbereitet durch die Woche: wie sich mit cleverem Vorkochen und Lagern gesunde Mahlzeiten planen lassen – spart Zeit, Geld und den täglichen „Was koche ich?"-Stress.'},
 {id:'st_energydrinks',name:'Energy Boost oder Risiko: Energydrinks & Vapes im Alltag',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:['azubis'],dauer:45,only:'azubis',
  desc:'Was passiert im Körper bei Energydrinks und Vapes? Ein ehrlicher Blick auf Wirkung, Schlaf und Konzentration – und alltagstaugliche Wege zu echter, nachhaltiger Energie. Ohne Verbote.'},
 {id:'st_essen_tour',name:'Essen on Tour: Gesunde Ernährung für den mobilen Alltag',typ:'station',kat:'Ernährung',themen:['ernaehrung'],fit:['gewerblich'],dauer:45,only:'gewerblich',
  desc:'[ENTWURF] Gesunde Ernährung unterwegs und im Schichtbetrieb: praktische Lösungen für Mahlzeiten ohne feste Küche – was in die Tasche passt und trotzdem Energie liefert.'},
 {id:'st_wechsel_ernaehrung',name:'Fit durch die Wechseljahre: Ernährung für Frauen ab 40',typ:'station',kat:'Ernährung',themen:['ernaehrung','frauen'],fit:[],dauer:45,only:'frauen',
  desc:'[ENTWURF] Der Stoffwechsel verändert sich ab 40: welche Ernährung Frauen in den Wechseljahren unterstützt, Knochen und Muskeln stärkt und das Wohlbefinden fördert.'},

 /* ═══════════ Spalte GESUNDHEITSCHECKS (4) ═══════════ */
 {id:'st_check_hrv',name:'HRV-Messung – Stressbelastung objektiv sichtbar machen',typ:'station',kat:'Gesundheitschecks',themen:['checks','mental'],fit:['fk'],dauer:45,
  desc:'Misst die Herzratenvariabilität mit dem Qiu+ Ball – als Marker für die Balance zwischen Anspannung und Erholung. Mit verständlicher Einordnung und 1–2 praktischen Empfehlungen zu Regeneration und Stressmanagement.'},
 {id:'st_check_physio',name:'Physiocheck – funktionelles Bewegungsscreening',typ:'station',kat:'Gesundheitschecks',themen:['checks','bewegung'],fit:['gewerblich','alle'],dauer:45,
  desc:'Functional Movement Screening: prüft Beweglichkeit, Stabilität, muskuläre Balance und Belastbarkeit und macht Dysbalancen sichtbar, bevor Beschwerden entstehen – inklusive alltagstauglicher Übungsempfehlungen.'},
 {id:'st_check_bia',name:'Körpermessung mit der BIA-Waage',typ:'station',kat:'Gesundheitschecks',themen:['checks','ernaehrung'],fit:['alle'],dauer:45,
  desc:'Bioelektrische Impedanzanalyse: misst Körperfett, Muskelmasse und Körperwasser statt nur Kilos – eine Standortbestimmung ohne Zahlenfixierung, mit konkreten Ernährungs- und Bewegungsimpulsen.'},
 {id:'st_check_wirbel',name:'Wirbelsäulenvermessung mit dem TRICURO go',typ:'station',kat:'Gesundheitschecks',themen:['checks','bewegung'],fit:['remote','gewerblich'],dauer:45,
  desc:'Erfasst Haltung, Beweglichkeit und Stabilität der Wirbelsäule – nahezu strahlungsfrei, verständlich visualisiert, mit 1–2 konkreten Empfehlungen für Ergonomie und Rückengesundheit.'}
];

/* Empfehlungskarten: maximal eine wird angezeigt (kleinste prio
   gewinnt). Neue Motto-Tage von Strong Partners = neues Objekt
   mit eigener wenn()-Bedingung anhängen, fertig. */
var RECOS=[
 {id:'woche',prio:1,overline:'Unsere Empfehlung für euch',title:'Gesundheitswoche statt Gesundheitstag',
  desc:'Bei eurer Größenordnung oder mehreren Standorten entfaltet ein mehrtägiges bzw. standortweises Programm die maximale Wirkung: Workshops, Vorträge und Aktivstationen über mehrere Tage oder Standorte verteilt. Wir nehmen das gern mit in eure Anfrage auf.',
  wenn:function(a){return a.size==='xl'||a.duration==='mehr'||a.standorte==='zweidrei'||a.standorte==='vierplus'}}
];

/* Geräte-Ausschluss: Modul-Paare, die dasselbe Gerät brauchen und nie
   parallel im Plan stehen dürfen – gilt für Auto-Empfehlung wie manuelles
   Hinzufügen. Paarweise, in beide Richtungen wirksam. */
var EXCLUSIONS=[['st_smoothie','st_energybike']];

/* ═════════ STATE ═════════ */
var answers={size:null,standorte:null,audience:null,occasion:[],topics:[],format:null,duration:null};
var cart=[];           /* Modul-IDs des Pakets */
var recoInterest=null; /* null | Empfehlungskarten-ID (für die Anfrage) */
var currentSlide=0,slideHistory=[0];
var TOTAL_STEPS=QUESTIONS.length;
var RESULT_SLIDE=TOTAL_STEPS+1,FORM_SLIDE=TOTAL_STEPS+2;
var focusIdx=-1;
var ROOT=null; /* Mount-Element (#gtk-root), gesetzt in boot() */
var plan=null;                    /* materialisierter Tagesplan (positionsfest) */
var planHistory=[],planFuture=[]; /* Undo/Redo-Schnappschüsse */
var lastAddedId=null,scrollPlanAfterRender=false,addFailMsg=null;

/* ═════════ HELPERS ═════════ */
function byId(id){for(var i=0;i<MODULES.length;i++)if(MODULES[i].id===id)return MODULES[i];return null}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function escAttr(s){return esc(s).replace(/"/g,'&quot;')}
function slotCount(){return RULES.slots[answers.duration||'ganz']||4}
function hasOcc(a,x){return (a.occasion||[]).indexOf(x)>=0}
function hasTopic(a,t){return (a.topics||[]).indexOf(t)>=0}
function optOf(q,id){for(var i=0;i<q.options.length;i++)if(q.options[i].id===id)return q.options[i];return null}
function recoById(id){for(var i=0;i<RECOS.length;i++)if(RECOS[i].id===id)return RECOS[i];return null}

/* Kompetenzfeld eines Moduls: das Primärthema (themen[0]) entscheidet */
function feldOf(m){
  var t=m.themen[0];
  for(var i=0;i<FELD_ORDER.length;i++){
    if(KOMPETENZFELDER[FELD_ORDER[i]].themen.indexOf(t)>=0)return FELD_ORDER[i];
  }
  return 'mental';
}
/* Belegte Kompetenzfelder aus gewählten Themen ('schnupper' zählt nicht) */
function felderAusThemen(topics){
  return FELD_ORDER.filter(function(f){
    return KOMPETENZFELDER[f].themen.some(function(t){return topics.indexOf(t)>=0});
  });
}

/* Sichtbarkeits-Gate eines Moduls. Verallgemeinert das frühere
   only==='remote': je nach Gate wird das passende Antwortfeld geprüft.
   remote/azubis/fk/gewerblich → Zielgruppe (Frage 3),
   frauen → Themenwahl Frauengesundheit (Frage 5).
   Ohne only ist ein Modul immer sichtbar. */
function passesGate(m,a){
  if(!m.only)return true;
  if(m.only==='frauen')return (a.topics||[]).indexOf('frauen')>=0;
  return a.audience===m.only;
}
/* Geräte-Ausschluss-Partner eines Moduls (oder null). */
function excludedPartner(id){
  for(var i=0;i<EXCLUSIONS.length;i++){
    if(EXCLUSIONS[i][0]===id)return EXCLUSIONS[i][1];
    if(EXCLUSIONS[i][1]===id)return EXCLUSIONS[i][0];
  }
  return null;
}

/* ═════════ EMPFEHLUNGSLOGIK ═════════ */
function scoreModule(m,a){
  var topics=a.topics||[],format=a.format||'mix',s=0;
  m.themen.forEach(function(t){if(topics.indexOf(t)>=0)s+=10});
  if(s===0){if(m.typ==='schnupperkurs')s=1;else return 0}
  if(format==='aktiv'){if(m.typ==='aktiv')s+=6;if(m.typ==='keynote')s-=8}
  if(format==='wissen'){if(m.typ==='keynote')s+=8;if(m.typ==='aktiv')s-=6}
  if((format==='mix'||format==='offen')&&m.typ==='keynote')s-=3;
  if(a.audience&&m.fit&&m.fit.indexOf(a.audience)>=0)s+=5;
  if(a.audience==='gewerblich'&&m.id==='st_ergonomie')s-=6;
  if(a.audience==='remote'&&(m.id==='st_kochen'||m.id==='kn_online'))s+=6;
  if((hasOcc(a,'branding')||hasOcc(a,'jubilaeum'))&&
     ['st_officeparcours','st_smoothie','st_energybike'].indexOf(m.id)>=0)s+=6;
  return s;
}

function recommend(a){
  var topics=a.topics||[],format=a.format||'mix',duration=a.duration||'ganz',size=a.size||'m';
  /* Vor der Themen-Frage bleibt das Paket bewusst leer – Module
     erscheinen erst, wenn es thematische Eingaben gibt. */
  if(topics.length===0)return [];
  var ids=[];
  var themedTopics=topics.filter(function(t){return t!=='schnupper'});
  var opener='kn_stark';
  if(format==='aktiv'&&themedTopics.length===1)opener=null;
  if(opener)ids.push(opener);
  /* Mittags-Keynote Ernährung (nur ganztags) */
  if(topics.indexOf('ernaehrung')>=0&&duration!=='halb')ids.push('kn_ernaehrung');
  /* Kapazität: eine Spalte je belegtem Kompetenzfeld; große Firmen
     bekommen Zusatzspalten bis zur Ziel-Spaltenzahl (SIZE_TARGET) */
  var felder=felderAusThemen(topics);
  var capTracks=Math.min(RULES.maxTracks[size]||4,Math.max(felder.length||1,SIZE_TARGET[size]||2));
  var cap=capTracks*(RULES.slots[duration]||4);
  /* Spalten-Budget je Kompetenzfeld: jedes belegte Feld 1 Spalte,
     Zusatzspalten (große Firmen) reihum. Module aus nicht belegten
     Feldern werden nicht empfohlen – sie bräuchten extra Personal.
     Manuell hinzufügen geht weiterhin (dann +1 Spalte im Plan). */
  var colsBudget={},extra=capTracks-felder.length,ri=0;
  felder.forEach(function(f){colsBudget[f]=1});
  while(extra>0&&felder.length){colsBudget[felder[ri%felder.length]]++;extra--;ri++}
  var capPerFeld={},usedPerFeld={};
  felder.forEach(function(f){capPerFeld[f]=colsBudget[f]*(RULES.slots[duration]||4)});
  var cands=[];
  MODULES.forEach(function(m){
    if(m.typ==='schnupperkurs'||m.typ==='baustein')return;
    if(m.poolOnly)return;
    if(ids.indexOf(m.id)>=0||m.id==='kn_stark'||m.id==='kn_ernaehrung')return;
    if(!passesGate(m,a))return;
    var s=scoreModule(m,a);
    if(s>0)cands.push({m:m,s:s});
  });
  cands.sort(function(x,y){return y.s-x.s});
  var used=0,picked=[],exclBlocked={};
  function tryPick(c){
    var sl=c.m.slots||1,f=feldOf(c.m);
    if(capPerFeld[f]===undefined)return false;
    if(exclBlocked[c.m.id])return false;
    if((usedPerFeld[f]||0)+sl>capPerFeld[f])return false;
    if(picked.indexOf(c.m.id)>=0||used+sl>cap)return false;
    picked.push(c.m.id);used+=sl;usedPerFeld[f]=(usedPerFeld[f]||0)+sl;
    var pn=excludedPartner(c.m.id);if(pn)exclBlocked[pn]=true;
    return true;
  }
  /* Breite zuerst (je Thema das beste Modul), außer „Konkretes Thema“ ist gewählt → Tiefe */
  if(!hasOcc(a,'konkret')){
    themedTopics.forEach(function(t){
      for(var i=0;i<cands.length;i++){
        if(cands[i].m.themen.indexOf(t)>=0&&picked.indexOf(cands[i].m.id)<0){if(tryPick(cands[i]))break}
      }
    });
  }
  for(var i=0;i<cands.length&&used<cap;i++)tryPick(cands[i]);
  ids=ids.concat(picked);
  /* Schnupperkurse zum Abschluss; Schnupper-Kachel garantiert mind. 1 (auch beim Halbtag) */
  var nSk=RULES.schnupperkurse[duration]||0;
  if(hasTopic(a,'schnupper'))nSk=Math.max(nSk,1);
  if(nSk>0){
    var sks=[];
    MODULES.forEach(function(m){if(m.typ==='schnupperkurs')sks.push({m:m,s:scoreModule(m,a)})});
    sks.sort(function(x,y){return y.s-x.s});
    for(var k=0;k<Math.min(nSk,sks.length);k++)ids.push(sks[k].m.id);
  }
  /* Tagesausklang */
  if(duration!=='halb'&&['branding','jubilaeum','einstieg'].some(function(o){return hasOcc(a,o)}))ids.push('bs_ausklang');
  return ids;
}

function activeReco(){
  var hits=RECOS.filter(function(r){return r.wenn(answers)});
  hits.sort(function(a,b){return a.prio-b.prio});
  return hits[0]||null;
}

/* ═════════ WARENKORB ═════════ */
function refreshCart(animate){
  var rec=recommend(answers);
  var added=rec.filter(function(id){return cart.indexOf(id)<0});
  cart=rec;
  var cnt=document.getElementById('cartCount');
  cnt.textContent=cart.length;
  if(animate&&added.length){
    cnt.classList.remove('pulse');void cnt.offsetWidth;cnt.classList.add('pulse');
    spawnChips(added);
  }
  renderCartPanel();
}
function spawnChips(ids){
  var max=3;
  ids.slice(0,max).forEach(function(id,i){
    var m=byId(id);if(!m)return;
    setTimeout(function(){
      var c=document.createElement('div');c.className='chip';
      c.style.bottom=(5.4+i*0.4)+'rem';
      c.textContent='+ '+m.name;
      if(ROOT)ROOT.appendChild(c);
      setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},1050);
    },i*220);
  });
  if(ids.length>max){
    setTimeout(function(){
      var c=document.createElement('div');c.className='chip';c.style.bottom='5.4rem';
      c.textContent='+ '+(ids.length-max)+' weitere Module';
      if(ROOT)ROOT.appendChild(c);
      setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},1050);
    },max*220+150);
  }
}
function toggleCartPanel(){
  document.getElementById('cartPanel').classList.toggle('open');
}
function renderCartPanel(){
  var p=document.getElementById('cartPanel');
  var h='<h4>Dein Paket ('+cart.length+' Module)</h4>';
  if(!cart.length)h+='<div class="cart-panel-item">Beantworte die Fragen, dann füllt sich dein Paket.</div>';
  cart.forEach(function(id){var m=byId(id);if(m)h+='<div class="cart-panel-item">'+esc(m.name)+'</div>'});
  p.innerHTML=h;
}
function updateCartVisibility(){
  var w=document.getElementById('cartWidget');
  var show=currentSlide>=2&&currentSlide<=TOTAL_STEPS;
  w.className='cart-widget'+(show?' visible':'');
  if(!show)document.getElementById('cartPanel').classList.remove('open');
  var f=document.getElementById('floatCta');
  if(f)f.className='float-cta'+(currentSlide===RESULT_SLIDE?' visible':'');
}

/* ═════════ NAV / CHROME ═════════ */
function initPips(){
  var c=document.getElementById('stepIndicator');c.innerHTML='';
  for(var i=0;i<TOTAL_STEPS;i++){var p=document.createElement('div');p.className='pip';c.appendChild(p)}
}
function answeredCount(){
  var n=0;QUESTIONS.forEach(function(q,i){
    var v=answers[q.key];
    if(q.multi?(v&&v.length&&currentSlide>i+1):v)n++;
  });return n;
}
function updateChrome(){
  var showUI=currentSlide>0;
  document.getElementById('stepIndicator').className='step-indicator'+(showUI&&currentSlide<=TOTAL_STEPS?' visible':'');
  document.getElementById('backBtn').className='back-btn'+(showUI?' visible':'');
  var pips=document.querySelectorAll('.pip'),ac=answeredCount();
  pips.forEach(function(p,i){p.className='pip';if(i<ac)p.classList.add('done');if(i===ac)p.classList.add('active')});
  var pct=currentSlide===0?0:currentSlide>TOTAL_STEPS?100:Math.round((ac/TOTAL_STEPS)*100);
  document.getElementById('progressFill').style.width=pct+'%';
  updateCartVisibility();
}
function goToSlide(n){
  var prev=document.getElementById('slide-'+currentSlide);
  prev.classList.remove('active');prev.classList.add('exit-up');
  currentSlide=n;
  var next=document.getElementById('slide-'+n);
  setTimeout(function(){prev.classList.remove('exit-up');next.classList.add('active');updateChrome()},120);
  slideHistory.push(n);
  focusIdx=-1;
}
function goBack(){
  if(slideHistory.length<2)return;
  slideHistory.pop();
  var target=slideHistory[slideHistory.length-1];
  /* Antworten ab Ziel-Frage zurücksetzen */
  QUESTIONS.forEach(function(q,i){
    if(i>=target)answers[q.key]=q.multi?[]:null;
  });
  if(target===0){QUESTIONS.forEach(function(q){answers[q.key]=q.multi?[]:null})}
  var prev=document.getElementById('slide-'+currentSlide);
  prev.classList.remove('active');
  currentSlide=target;
  document.getElementById('slide-'+target).classList.add('active');
  /* Plan nur verwerfen, wenn wirklich in den Funnel zurückgegangen wird.
     Beim Schritt Formular -> Ergebnis muss die Konfiguration erhalten bleiben,
     sonst zeigt das Formular danach "0 Module" (Fehler 27.07.). */
  if(target<RESULT_SLIDE){
    resultCelebrated=false;
    plan=null;planHistory=[];planFuture=[];lastAddedId=null;addFailMsg=null;
  }
  refreshCart(false);
  updateChrome();
  focusIdx=-1;
}
function resetFunnel(){
  QUESTIONS.forEach(function(q){answers[q.key]=q.multi?[]:null});
  cart=[];recoInterest=null;slideHistory=[0];openPools={};resultCelebrated=false;extraFelder=[];addColOpen=false;plan=null;planHistory=[];planFuture=[];lastAddedId=null;addFailMsg=null;
  document.querySelectorAll('.slide').forEach(function(s){s.classList.remove('active','exit-up')});
  currentSlide=0;
  document.getElementById('slide-0').classList.add('active');
  refreshCart(false);updateChrome();
}
function startFunnel(){buildQuestion(1);goToSlide(1)}

/* ═════════ FRAGEN BAUEN ═════════ */
function buildQuestion(step){
  var q=QUESTIONS[step-1];
  var inner=document.getElementById('qInner'+step);
  var h='<p class="q-overline">Frage '+step+' von '+TOTAL_STEPS+' · '+esc(q.label)+'</p>';
  h+='<h2 class="q-title">'+esc(q.title)+'</h2>';
  if(q.hint)h+='<p class="q-hint">'+esc(q.hint)+'</p>';
  h+='<div class="q-grid">';
  q.options.forEach(function(o){
    var sel=q.multi&&(answers[q.key]||[]).indexOf(o.id)>=0?' selected':'';
    h+='<div class="q-card'+sel+'" data-step="'+step+'" data-id="'+o.id+'" onclick="selectAnswer(this)">';
    h+='<div class="q-card-head"><span class="q-icon">'+icon(o.icon)+'</span>';
    h+='<div class="q-card-title">'+esc(o.title)+'</div></div>';
    if(o.desc)h+='<div class="q-card-desc">'+esc(o.desc)+'</div>';
    h+='</div>';
  });
  h+='</div>';
  if(q.multi){
    h+='<button class="q-weiter" id="weiterBtn'+step+'" disabled onclick="advance('+step+')">Weiter ';
    h+='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>';
  }
  h+='<div class="q-shortcut"><span class="key-hint">↑</span><span class="key-hint">↓</span> navigieren · <span class="key-hint">↵</span> bestätigen</div>';
  inner.innerHTML=h;
}
function selectAnswer(el){
  var step=parseInt(el.getAttribute('data-step'),10);
  var q=QUESTIONS[step-1];
  var val=el.getAttribute('data-id');
  if(q.multi){
    var arr=answers[q.key]||[];
    var ix=arr.indexOf(val);
    if(ix>=0){arr.splice(ix,1);el.classList.remove('selected')}
    else{arr.push(val);el.classList.add('selected')}
    answers[q.key]=arr;
    var btn=document.getElementById('weiterBtn'+step);
    if(btn)btn.disabled=arr.length===0;
  }else{
    answers[q.key]=val;
    el.parentNode.querySelectorAll('.q-card').forEach(function(c){c.classList.remove('selected')});
    el.classList.add('selected');
    setTimeout(function(){advance(step)},380);
  }
}
function advance(step){
  refreshCart(true);
  if(step<TOTAL_STEPS){buildQuestion(step+1);goToSlide(step+1)}
  else{recoInterest=null;extraFelder=[];addColOpen=false;plan=packPlan(recommend(answers));planHistory=[];planFuture=[];lastAddedId=null;addFailMsg=null;showResults()}
}

/* ═════════ ERGEBNIS ═════════ */
var openPools={};
var resultCelebrated=false;
var extraFelder=[];   /* manuell ergänzte Plan-Spalten (Kompetenzfelder) */
var addColOpen=false; /* Auswahlmenü "+ Spalte hinzufügen" sichtbar? */

function sublineText(){
  var parts=[];
  var sizeOpt=optOf(QUESTIONS[0],answers.size);
  var audOpt=optOf(QUESTIONS[2],answers.audience);
  if(sizeOpt)parts.push('für euer Unternehmen ('+sizeOpt.title.toLowerCase()+')');
  if(audOpt&&answers.audience!=='alle')parts.push('mit Fokus auf '+audOpt.title);
  var t=(answers.topics||[]).map(function(id){return THEME_LABELS[id]||id});
  if(t.length)parts.push('Schwerpunkte: '+t.join(', '));
  return 'Zusammengestellt '+(parts.length?parts.join(' · '):'auf Basis eurer Angaben')+'. Entferne Module direkt im Plan oder ergänze unten neue – deine Agenda aktualisiert sich live.';
}
function showResults(){
  var inner=document.getElementById('resultInner');
  var total=planIds().length;
  /* Schnupper-Wunsch: Pool-Gruppe beim ersten Ankommen geöffnet */
  if(hasTopic(answers,'schnupper')&&openPools['Schnupperkurse & Abschluss']===undefined){
    openPools['Schnupperkurse & Abschluss']=true;
  }
  var h='<div class="done-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Geschafft – euer Tagespaket steht</div>';
  h+='<h2 class="r-title">Dein Gesundheitstag: <span id="countNum">'+total+'</span> Module</h2>';
  h+='<p class="r-sub">'+esc(sublineText())+'</p>';

  /* 1) Interaktive Tagesplan-Vorschau (das Herzstück) */
  h+='<div class="r-group-label">Eure Tagesplan-Vorschau – klick sie dir zurecht</div>';
  var vorhandeneFelder=buildPlanData().felder;
  var fehlendeFelder=FELD_ORDER.filter(function(f){return vorhandeneFelder.indexOf(f)<0});
  h+='<div class="plan-card"><div class="plan-scroll">'+buildPlanHTML()+'</div>';
  if(fehlendeFelder.length){
    h+='<button class="add-col-fab" title="Spalte (Kompetenzfeld) hinzufügen" onclick="toggleAddCol()">+</button>';
    if(addColOpen){
      h+='<div class="add-col-menu"><div class="add-col-menu-label">Kompetenzfeld ergänzen</div>';
      fehlendeFelder.forEach(function(f){
        h+='<button class="add-col-chip" onclick="addFeldColumn(\''+f+'\')">+ '+esc(KOMPETENZFELDER[f].label)+'</button>';
      });
      h+='</div>';
    }
  }
  h+='</div>';
  var hintTxt=planHintText();
  if(addFailMsg){hintTxt+=' '+addFailMsg;addFailMsg=null}
  h+='<p class="plan-hint">'+esc(hintTxt)+'</p>';
  if(planHistory.length||planFuture.length){
    h+='<div class="plan-undo-row">';
    h+='<button class="undo-btn"'+(planHistory.length?'':' disabled')+' onclick="undoPlan()">↶ Rückgängig</button>';
    h+='<button class="undo-btn"'+(planFuture.length?'':' disabled')+' onclick="redoPlan()">↷ Wiederholen</button>';
    h+='</div>';
  }

  /* Preis & Förderung */
  h+='<div class="price-box"><div class="price-line">'+esc(PRICING.preis)+'</div>';
  h+='<div class="price-foerder">'+esc(PRICING.foerderung)+'</div></div>';

  /* Empfehlungskarte */
  var reco=activeReco();
  if(reco){
    h+='<div class="reco-card"><div class="reco-body">';
    h+='<div class="reco-overline">'+esc(reco.overline)+'</div>';
    h+='<div class="reco-title">'+esc(reco.title)+'</div>';
    h+='<div class="reco-desc">'+esc(reco.desc)+'</div></div>';
    h+='<button class="reco-toggle'+(recoInterest===reco.id?' on':'')+'" onclick="toggleReco(\''+reco.id+'\')">';
    h+=(recoInterest===reco.id?'✓ In Anfrage aufgenommen':'In Anfrage aufnehmen')+'</button></div>';
  }

  /* Conversion-Zone direkt nach dem Plan */
  h+='<div class="r-actions">';
  h+='<button class="btn-primary" onclick="showForm()">Diesen Gesundheitstag unverbindlich anfragen ';
  h+='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>';
  h+='<button class="btn-ghost" onclick="downloadPDF()">Tagesplan als PDF speichern</button>';
  h+='<button class="btn-ghost" onclick="resetFunnel()">Neu starten</button></div>';

  /* 2) Modulpool */
  var inPlan=planIds();
  h+='<div class="pool" id="poolSection"><div class="r-group-label">Weitere Module entdecken</div>';
  h+='<p class="r-sub" style="font-size:.88rem;margin-bottom:1rem">Bastel gern weiter: Ergänze Module, tausche Vorschläge aus oder kombiniere Themen neu – dein Tagesplan oben passt sich sofort an.</p>';
  var kats=[];MODULES.forEach(function(m){if(kats.indexOf(m.kat)<0)kats.push(m.kat)});
  kats.forEach(function(kat){
    var items=MODULES.filter(function(m){
      return m.kat===kat&&inPlan.indexOf(m.id)<0&&passesGate(m,answers);
    });
    if(!items.length)return;
    h+='<div class="pool-group'+(openPools[kat]?' open':'')+'" data-kat="'+escAttr(kat)+'">';
    h+='<button class="pool-head" onclick="togglePoolEl(this)">'+esc(kat);
    h+='<span style="display:flex;align-items:center;gap:.6rem"><span class="pool-count">'+items.length+' Module</span>';
    h+='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span></button>';
    h+='<div class="pool-body">';
    items.forEach(function(m){
      h+='<div class="pool-item"><div class="pool-item-body">';
      h+='<div class="pool-item-name">'+esc(m.name)+'</div>';
      h+='<div class="pool-item-desc">'+esc(m.desc)+'</div></div>';
      h+='<button class="pool-add" title="Zum Tagesplan hinzufügen" onclick="addModule(\''+m.id+'\')">+</button></div>';
    });
    h+='</div></div>';
  });
  h+='</div>';

  /* Abschluss-CTA */
  h+='<div class="r-actions">';
  h+='<button class="btn-primary" onclick="showForm()">Unverbindlich anfragen ';
  h+='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button></div>';

  inner.innerHTML=h;
  if(scrollPlanAfterRender){
    scrollPlanAfterRender=false;
    var pc=inner.querySelector('.plan-card');
    if(pc&&pc.scrollIntoView)pc.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(function(){lastAddedId=null},1600);
  }
  renderCartPanel();
  document.getElementById('cartCount').textContent=total;
  if(currentSlide!==RESULT_SLIDE)goToSlide(RESULT_SLIDE);
  if(!resultCelebrated){resultCelebrated=true;celebrate(total)}
}
function togglePoolEl(btn){
  var g=btn.parentNode;g.classList.toggle('open');
  openPools[g.getAttribute('data-kat')]=g.classList.contains('open');
}
var FELD_POOLKAT={bewegung:'Bewegung & Ergonomie',mental:'Mentale Gesundheit & Regeneration',
  ernaehrung:'Ernährung',checks:'Gesundheitschecks'};
function openPoolAndScroll(feld){
  openPoolKat(feld&&FELD_POOLKAT[feld]?FELD_POOLKAT[feld]:null);
}
/* Direkt eine Pool-Kategorie ansteuern (Keynotes, Schnupperkurse …) */
function openPoolKat(kat){
  var sec=document.getElementById('poolSection');if(!sec)return;
  var target=null;
  if(kat){
    var groups=sec.querySelectorAll('.pool-group');
    for(var i=0;i<groups.length;i++){
      if(groups[i].getAttribute('data-kat')===kat){target=groups[i];break}
    }
  }
  if(!target)target=sec.querySelector('.pool-group');
  if(target){
    target.classList.remove('pool-flash');
    void (target.offsetWidth||0);
    target.classList.add('pool-flash');
    setTimeout(function(){if(target)target.classList.remove('pool-flash')},1700);
  }
  if(target&&!target.classList.contains('open')){
    target.classList.add('open');
    openPools[target.getAttribute('data-kat')]=true;
  }
  (target||sec).scrollIntoView({behavior:'smooth',block:'start'});
}
function toggleAddCol(){addColOpen=!addColOpen;showResults()}

/* ═════════ PLAN-STATE (positionsfest, mit Undo/Redo) ═════════
   Der Plan wird nach dem Funnel EINMAL gepackt (packPlan) und ist danach ein
   fester Stundenplan: Entfernen hinterlässt eine Lücke, Hinzufügen nimmt den
   ersten freien Slot, Verschieben tauscht Slots – nichts "rutscht nach". */
function planIds(){
  if(!plan)return [];
  var ids=[];
  if(plan.opener)ids.push(plan.opener);
  if(plan.mittag)ids.push(plan.mittag);
  plan.tracks.forEach(function(t){t.grid.forEach(function(c){if(c&&!c.cont)ids.push(c.id)})});
  plan.sks.forEach(function(id){ids.push(id)});
  if(plan.ausklang)ids.push(plan.ausklang);
  return ids;
}
function pushState(){
  planHistory.push(JSON.stringify(plan));
  if(planHistory.length>40)planHistory.shift();
  planFuture=[];
}
function undoPlan(){
  if(!planHistory.length)return;
  planFuture.push(JSON.stringify(plan));
  plan=JSON.parse(planHistory.pop());
  showResults();
}
function redoPlan(){
  if(!planFuture.length)return;
  planHistory.push(JSON.stringify(plan));
  plan=JSON.parse(planFuture.pop());
  showResults();
}
function trackOrderPos(f){var i=FELD_ORDER.indexOf(f);return i<0?99:i}
function addFeldColumn(f){
  if(!plan)return;
  pushState();
  var nt={feld:f,grid:[]};for(var k=0;k<plan.slots;k++)nt.grid.push(null);
  var at=plan.tracks.length;
  for(var i=0;i<plan.tracks.length;i++){
    if(trackOrderPos(plan.tracks[i].feld)>trackOrderPos(f)){at=i;break}
  }
  plan.tracks.splice(at,0,nt);
  addColOpen=false;showResults();
}
function removeTrack(i){
  if(!plan||!plan.tracks[i])return;
  pushState();
  plan.tracks.splice(i,1);
  showResults();
}
/* Klick außerhalb schließt das Spalten-Menü */
document.addEventListener('click',function(e){
  if(!addColOpen)return;
  var t=e.target;
  if(t&&t.closest&&t.closest('.add-col-menu,.add-col-fab'))return;
  addColOpen=false;showResults();
});
function toggleReco(key){recoInterest=recoInterest===key?null:key;showResults()}
function removeModule(id){
  if(!plan)return;
  pushState();
  if(plan.opener===id)plan.opener=null;
  else if(plan.mittag===id)plan.mittag=null;
  else if(plan.ausklang===id)plan.ausklang=null;
  else if(plan.sks.indexOf(id)>=0)plan.sks=plan.sks.filter(function(x){return x!==id});
  else plan.tracks.forEach(function(t){
    t.grid=t.grid.map(function(c){return c&&c.id===id?null:c});
  });
  showResults();
}
/* Wohin gehört ein Modul im Tagesablauf?
   Entscheidend ist der TYP, nicht die einzelne ID. Vorher waren nur
   kn_stark/kn_online als Auftakt und kn_ernaehrung als Mittagsimpuls
   verdrahtet – alle übrigen Keynotes landeten dadurch als parallele
   Station im Zeitraster, obwohl der Auftakt-Platz frei war (Fehler 24.07.).
   p ist der Plan-Zustand (oder ein Zwischenstand beim Packen). */
function slotForModule(m,p){
  if(m.typ==='schnupperkurs')return 'sks';
  if(m.typ==='baustein')return 'ausklang';
  if(m.typ==='keynote'){
    var mittagFrei=!p.halb&&!p.mittag;
    /* Die Ernährungs-Keynote ist als Impuls vor der Pause konzipiert */
    if(m.id==='kn_ernaehrung')return mittagFrei?'mittag':(!p.opener?'opener':'station');
    if(!p.opener)return 'opener';
    if(mittagFrei)return 'mittag';
    return 'station';
  }
  return 'station';
}
function addModule(id){
  if(!plan||planIds().indexOf(id)>=0)return;
  var m=byId(id);if(!m)return;
  var pn=excludedPartner(id);
  if(pn&&planIds().indexOf(pn)>=0){
    var pm=byId(pn);
    addFailMsg='„'+m.name+'“ und „'+(pm?pm.name:pn)+'“ brauchen dasselbe Gerät und können nicht parallel laufen – entferne zuerst das andere Modul.';
    showResults();return;
  }
  pushState();
  var placed=true;
  switch(slotForModule(m,plan)){
    case 'opener':   plan.opener=id; break;
    case 'mittag':   plan.mittag=id; break;
    case 'sks':      plan.sks.push(id); break;
    case 'ausklang': plan.ausklang=id; break;
    default:         placed=placeStation(m);
  }
  if(!placed){
    planHistory.pop();
    addFailMsg='Für \u201e'+m.name+'\u201c ist gerade kein Slot frei \u2013 entferne ein Modul oder eine Spalte, dann klappt es.';
    showResults();return;
  }
  lastAddedId=id;scrollPlanAfterRender=true;
  showResults();
}
/* Station in den ersten freien Slot ihres Kompetenzfelds setzen;
   ist das Feld voll, entsteht eine neue Spalte (bis zum Spalten-Deckel). */
function placeStation(m){
  var f=feldOf(m),need=m.slots||1;
  var ftracks=plan.tracks.filter(function(t){return t.feld===f});
  for(var ti=0;ti<ftracks.length;ti++){
    var g=ftracks[ti].grid;
    for(var s=0;s+need<=plan.slots;s++){
      var frei=true;
      for(var k=0;k<need;k++)if(g[s+k])frei=false;
      if(frei){
        g[s]={id:m.id};
        if(need===2)g[s+1]={id:m.id,cont:true};
        return true;
      }
    }
  }
  var maxT=RULES.maxTracks[answers.size||'m']||4;
  if(plan.tracks.length>=maxT)return false;
  var nt={feld:f,grid:[]};for(var k2=0;k2<plan.slots;k2++)nt.grid.push(null);
  nt.grid[0]={id:m.id};if(need===2)nt.grid[1]={id:m.id,cont:true};
  var at=plan.tracks.length;
  for(var i=0;i<plan.tracks.length;i++){
    if(trackOrderPos(plan.tracks[i].feld)>trackOrderPos(f)){at=i;break}
  }
  plan.tracks.splice(at,0,nt);
  return true;
}
/* Slot-Tausch innerhalb einer Spalte (nur Einzel-Slot-Module) */
function moveCell(ti,si,dir){
  swapCells(ti,si,si+dir);
}
/* Prüft, ob zwei Slots derselben Spalte tauschbar sind (2-Slot-Module blockieren) */
function canSwap(ti,a,b){
  if(!plan||!plan.tracks[ti])return false;
  var g=plan.tracks[ti].grid;
  if(a<0||b<0||a>=g.length||b>=g.length||a===b)return false;
  var ca=g[a],cb=g[b];
  if(ca&&ca.cont)return false;
  if(cb&&cb.cont)return false;
  if(ca){var ma=byId(ca.id);if(ma&&(ma.slots||1)===2)return false}
  if(cb){var mb=byId(cb.id);if(mb&&(mb.slots||1)===2)return false}
  return true;
}
function swapCells(ti,a,b){
  if(!canSwap(ti,a,b))return;
  pushState();
  var g=plan.tracks[ti].grid,tmp=g[a];
  g[a]=g[b];g[b]=tmp;
  lastAddedId=null;
  showResults();
}
/* ── Drag & Drop (Zeiger/Maus). Auf Touch greifen die Pfeile. ── */
var dragFrom=null;
function cellDragStart(e,ti,si){
  dragFrom={ti:ti,si:si};
  if(e.dataTransfer){e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',ti+':'+si)}catch(err){}}
  if(e.target&&e.target.classList)e.target.classList.add('cell-dragging');
}
function cellDragEnd(e){
  dragFrom=null;
  var els=document.querySelectorAll('.cell-dragging,.cell-dropzone');
  for(var i=0;i<els.length;i++)els[i].classList.remove('cell-dragging','cell-dropzone');
}
function cellDragOver(e,ti,si){
  if(!dragFrom||dragFrom.ti!==ti||!canSwap(ti,dragFrom.si,si))return;
  e.preventDefault();
  if(e.dataTransfer)e.dataTransfer.dropEffect='move';
  if(e.currentTarget&&e.currentTarget.classList)e.currentTarget.classList.add('cell-dropzone');
}
function cellDragLeave(e){
  if(e.currentTarget&&e.currentTarget.classList)e.currentTarget.classList.remove('cell-dropzone');
}
function cellDrop(e,ti,si){
  e.preventDefault();
  if(!dragFrom||dragFrom.ti!==ti)return cellDragEnd(e);
  var from=dragFrom.si;dragFrom=null;
  swapCells(ti,from,si);
}

/* Dopamin-Moment beim Ankommen: Zähler hochzählen + Konfetti in Markenfarben */
function celebrate(total){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var el=document.getElementById('countNum');
  if(el&&!reduce){
    var start=null,dur=650;
    var step=function(ts){
      if(!start)start=ts;
      var p=Math.min(1,(ts-start)/dur);
      el.textContent=Math.round(total*(1-Math.pow(1-p,3)));
      if(p<1)requestAnimationFrame(step);
    };
    el.textContent='0';requestAnimationFrame(step);
  }
  if(reduce)return;
  var colors=['#006e1d','#38ba47','#8fdd9b','#1a1c1a','#cdeed3'];
  var c=document.createElement('div');c.className='confetti';
  for(var i=0;i<16;i++){
    var sp=document.createElement('span');
    sp.style.left=(4+Math.random()*92)+'%';
    sp.style.background=colors[i%colors.length];
    sp.style.animationDuration=(0.9+Math.random()*0.8)+'s';
    sp.style.animationDelay=(Math.random()*0.3)+'s';
    sp.style.transform='rotate('+(Math.random()*180)+'deg)';
    c.appendChild(sp);
  }
  if(ROOT)ROOT.appendChild(c);
  setTimeout(function(){if(c.parentNode)c.parentNode.removeChild(c)},2200);
}

/* ═════════ TAGESPLAN ═════════ */
function xBtn(id){return '<button class="cell-x" title="Aus dem Plan entfernen" onclick="removeModule(\''+id+'\')">✕</button>'}

/* Empfehlungs-Auswahl einmalig in einen festen Plan packen */
function packPlan(ids){
  var opener=null,mittag=null,stations=[],sks=[],ausklang=null;
  var halbtag=answers.duration==='halb';
  ids.forEach(function(id){
    var m=byId(id);if(!m)return;
    switch(slotForModule(m,{opener:opener,mittag:mittag,halb:halbtag})){
      case 'opener':   opener=id; break;
      case 'mittag':   mittag=id; break;
      case 'sks':      sks.push(id); break;
      case 'ausklang': ausklang=id; break;
      default:         stations.push(m);
    }
  });
  var slots=slotCount();
  var maxT=RULES.maxTracks[answers.size||'m']||4;
  var byFeld={};
  stations.forEach(function(m){var ff=feldOf(m);(byFeld[ff]=byFeld[ff]||[]).push(m)});
  var felder=FELD_ORDER.filter(function(ff){return byFeld[ff]});
  var needs={},cols={};
  felder.forEach(function(ff){
    needs[ff]=(byFeld[ff]||[]).reduce(function(s,m){return s+(m.slots||1)},0);
    cols[ff]=Math.max(1,Math.ceil(needs[ff]/slots));
  });
  var total=felder.reduce(function(s,ff){return s+cols[ff]},0);
  while(total>maxT){
    var cand=null;
    felder.forEach(function(ff){
      if(cols[ff]>1&&(cand===null||needs[ff]<needs[cand]))cand=ff;
    });
    if(cand===null)break;
    cols[cand]--;total--;
  }
  var tracks=[];
  felder.forEach(function(ff){
    var ftracks=[];
    for(var i=0;i<cols[ff];i++)ftracks.push({feld:ff,used:0,mods:[]});
    var mods=(byFeld[ff]||[]).slice().sort(function(a,b){return (b.slots||1)-(a.slots||1)});
    mods.forEach(function(m){
      var need=m.slots||1,best=null,bestFree=-1;
      ftracks.forEach(function(tr){
        var free=slots-tr.used;
        if(free>=need&&free>bestFree){bestFree=free;best=tr}
      });
      if(best){best.mods.push(m);best.used+=need}
    });
    ftracks.forEach(function(tr){
      var grid=[];
      tr.mods.forEach(function(m){grid.push({id:m.id});if((m.slots||1)===2)grid.push({id:m.id,cont:true})});
      while(grid.length<slots)grid.push(null);
      tracks.push({feld:ff,grid:grid});
    });
  });
  return{opener:opener,mittag:mittag,sks:sks,ausklang:ausklang,slots:slots,
    halb:answers.duration==='halb',tracks:tracks};
}

/* Sicht auf den Plan-State für Rendering, Zusammenfassung und PDF */
function buildPlanData(){
  var slots=plan?plan.slots:slotCount();
  function leer(){var g=[];for(var k=0;k<slots;k++)g.push(null);return g}
  if(!plan){
    return{opener:null,mittag:null,tracks:[{feld:'mental',label:'Stationen',items:[],grid:leer()}],
      sks:[],ausklang:null,felder:[],slots:slots,halb:answers.duration==='halb'};
  }
  var roman=['I','II','III','IV','V'];
  var counts={};plan.tracks.forEach(function(t){counts[t.feld]=(counts[t.feld]||0)+1});
  var seen={};
  var tracks=plan.tracks.map(function(t){
    seen[t.feld]=(seen[t.feld]||0)+1;
    var label=KOMPETENZFELDER[t.feld]?KOMPETENZFELDER[t.feld].label:'Stationen';
    if(counts[t.feld]>1)label+=' '+roman[seen[t.feld]-1];
    var grid=t.grid.map(function(c){
      if(!c)return null;
      var m=byId(c.id);return m?{m:m,cont:!!c.cont}:null;
    });
    var items=[];grid.forEach(function(e){if(e&&!e.cont)items.push(e.m)});
    return{feld:t.feld,label:label,items:items,grid:grid};
  });
  if(!tracks.length)tracks=[{feld:'mental',label:'Stationen',items:[],grid:leer()}];
  var felder=[];tracks.forEach(function(t){if(felder.indexOf(t.feld)<0)felder.push(t.feld)});
  return{opener:plan.opener?byId(plan.opener):null,mittag:plan.mittag?byId(plan.mittag):null,
    tracks:tracks,sks:plan.sks.map(byId).filter(Boolean),ausklang:plan.ausklang?byId(plan.ausklang):null,
    felder:felder,slots:slots,halb:plan.halb};
}

function planCellHTML(entry,feld,ti,si,slotsTotal){
  var dnd=(typeof ti==='number')
    ?' ondragover="cellDragOver(event,'+ti+','+si+')" ondragleave="cellDragLeave(event)" ondrop="cellDrop(event,'+ti+','+si+')"'
    :'';
  if(!entry)return '<div class="plan-cell empty"'+dnd+'><button class="cell-add" onclick="openPoolAndScroll(\''+(feld||'')+'\')">+ Modul wählen</button></div>';
  /* Zell-Tag = Primärthema des Moduls (nicht das Spalten-Label) */
  var tag=THEME_LABELS[entry.m.themen[0]]||'Modul';
  var flash=(!entry.cont&&lastAddedId===entry.m.id)?' cell-flash':'';
  var ziehbar=(!entry.cont&&(entry.m.slots||1)===1&&typeof ti==='number');
  var h='<div class="plan-cell'+(entry.cont?'':' has-x')+flash+(ziehbar?' cell-draggable':'')+'"'+dnd+
    (ziehbar?' draggable="true" ondragstart="cellDragStart(event,'+ti+','+si+')" ondragend="cellDragEnd(event)"':'')+
    ' title="'+escAttr(entry.m.desc)+'">';
  if(!entry.cont)h+=xBtn(entry.m.id);
  h+='<span class="cell-track">'+esc(tag)+'</span>'+esc(entry.m.name);
  h+=entry.cont?'<span class="cell-note">Fortsetzung (Teil 2)</span>':'<span class="cell-note">'+entry.m.dauer+' Min'+(entry.m.hinweis?' · '+esc(entry.m.hinweis):'')+'</span>';
  /* Zeitliches Verschieben innerhalb der Spalte (nur Einzel-Slot-Module) */
  if(!entry.cont&&(entry.m.slots||1)===1&&typeof ti==='number'){
    var mv='';
    if(si>0)mv+='<button class="cell-move" title="Früher einplanen" onclick="moveCell('+ti+','+si+',-1)">↑</button>';
    if(si<slotsTotal-1)mv+='<button class="cell-move" title="Später einplanen" onclick="moveCell('+ti+','+si+',1)">↓</button>';
    if(mv)h+='<span class="cell-move-row">'+mv+'</span>';
  }
  h+='</div>';
  return h;
}
function buildPlanHTML(){
  var d=buildPlanData();
  var n=d.tracks.length||1;
  var colStyle='grid-template-columns:repeat('+n+',minmax('+(n>2?'150px':'170px')+',1fr))';
  var h='';
  function fullRow(time,contentHTML,note,removeId){
    h+='<div class="plan-row"><div class="plan-time">'+time+'</div>';
    h+='<div class="plan-cells full-row" style="grid-template-columns:1fr"><div class="plan-cell full'+(removeId?' has-x':'')+'">';
    if(removeId)h+=xBtn(removeId);
    h+=contentHTML;
    if(note)h+='<span class="cell-note">'+esc(note)+'</span>';
    h+='</div></div></div>';
  }
  /* Freier Platz in einer Vollzeile: bleibt sichtbar und ist direkt neu befüllbar */
  function fullSlot(time,label,kat){
    h+='<div class="plan-row"><div class="plan-time">'+time+'</div>';
    h+='<div class="plan-cells full-row" style="grid-template-columns:1fr"><div class="plan-cell full empty">';
    h+='<button class="cell-add" onclick="openPoolKat(\''+escAttr(kat)+'\')">+ '+esc(label)+'</button>';
    h+='</div></div></div>';
  }
  /* Kopfzeile mit Kompetenzfeld-Spalten */
  if(d.tracks.length>1){
    h+='<div class="plan-row plan-header-row"><div class="plan-time"></div><div class="plan-cells" style="'+colStyle+'">';
    d.tracks.forEach(function(t,i){
      h+='<div class="plan-cell">'+esc(t.label)+'<button class="th-x" title="Spalte samt Modulen entfernen" onclick="removeTrack('+i+')">✕</button></div>';
    });
    h+='</div></div>';
  }
  if(d.opener)fullRow('09:00 – 09:45',esc(d.opener.name),'Gemeinsamer Auftakt · '+d.opener.dauer+' Min',d.opener.id);
  else fullSlot('09:00 – 09:45','Auftakt-Keynote wählen','Keynotes & Impulse');
  var slotTimes=d.halb
    ?['10:00 – 10:45','11:00 – 11:45']
    :['10:00 – 10:45','11:00 – 11:45','13:00 – 13:45','14:00 – 14:45'];
  for(var s=0;s<d.slots;s++){
    if(!d.halb&&s===2){
      if(d.mittag)fullRow('12:00 – 12:30',esc(d.mittag.name),'Impuls vor der Pause',d.mittag.id);
      fullRow(d.mittag?'12:30 – 13:00':'12:00 – 13:00','Mittagspause');
    }
    var parallel=0;
    d.tracks.forEach(function(t){var e=t.grid?t.grid[s]:null;if(e&&!e.cont)parallel++});
    h+='<div class="plan-row"><div class="plan-time">'+slotTimes[s]+(s===0?'<span class="cell-note" style="display:block;font-weight:400">+ 15 Min für eure Fragen</span>':'');
    if(parallel>1)h+='<span class="plan-parallel">'+parallel+' Module parallel</span>';
    h+='</div>';
    h+='<div class="plan-cells" style="'+colStyle+'">';
    d.tracks.forEach(function(t,ti){h+=planCellHTML(t.grid?t.grid[s]:null,t.feld,ti,s,d.slots)});
    h+='</div></div>';
  }
  var skTime=d.halb?'12:00 – 13:00':'15:00 – 16:00';
  if(d.sks.length){
    var sk=d.sks.map(function(m){return '<span class="cell-chip'+(m.id===lastAddedId?' cell-flash':'')+'">'+esc(m.name)+xBtn(m.id)+'</span>'}).join('');
    /* Immer eine offene Kachel zum Ergänzen weiterer Schnupperkurse */
    sk+='<button class="cell-chip chip-add" onclick="openPoolKat(\'Schnupperkurse &amp; Abschluss\')">+ Schnupperkurs</button>';
    fullRow(skTime,sk,'Zum Mitmachen, parallel zur Auswahl');
  }else fullSlot(skTime,'Schnupperkurs wählen (optional)','Schnupperkurse & Abschluss');
  if(d.ausklang)fullRow('im Anschluss',esc(d.ausklang.name),d.ausklang.dauer+' Min',d.ausklang.id);
  else fullSlot('im Anschluss','Tagesausklang wählen (optional)','Schnupperkurse & Abschluss');
  return '<div class="plan-tbl tracks-'+d.tracks.length+'">'+h+'</div>';
}
function planHintText(){
  var d=buildPlanData();
  var felderTxt=d.felder.map(function(f){return KOMPETENZFELDER[f].label}).join(', ');
  var base='Beispielhafter Ablauf mit '+(d.tracks.length===1?'einer Spalte':d.tracks.length+' parallelen Spalten')+
    (d.felder.length?' – eine Fachkraft je Kompetenzfeld ('+felderTxt+')':'')+
    (d.halb?' (Halbtag)':' (Ganztag, 09:00 – 17:00 Uhr)')+'. Den finalen Plan stimmen wir gemeinsam ab.';
  if(answers.duration==='unklar')base='Vorschau auf Basis eines ganztägigen Programms – zur passenden Dauer beraten wir euch gern. '+base;
  if(answers.duration==='mehr')base='Vorschau für einen Beispieltag – bei mehrtägigen Formaten wiederholen und vertiefen sich die Module. '+base;
  if(answers.standorte==='zweidrei'||answers.standorte==='vierplus'){
    base+=' Der Plan gilt je Standort – die Durchführung über eure Standorte takten wir gemeinsam.';
  }
  return base;
}

/* ═════════ ANFRAGE ═════════ */
function showForm(){
  var inner=document.getElementById('formInner');
  var h='<p class="r-overline">Fast geschafft</p>';
  h+='<h2 class="r-title">Euren Gesundheitstag unverbindlich anfragen</h2>';
  h+='<p class="r-sub">Wir melden uns persönlich bei dir, besprechen Details und erstellen euch ein konkretes Angebot.</p>';
  h+='<div class="f-grid">';
  h+='<div class="f-field"><label class="f-label" for="fName">Name <em>*</em></label><input class="f-input" id="fName" type="text" autocomplete="name"></div>';
  h+='<div class="f-field"><label class="f-label" for="fFirma">Firma <em>*</em></label><input class="f-input" id="fFirma" type="text" autocomplete="organization"></div>';
  h+='<div class="f-field"><label class="f-label" for="fMail">E-Mail <em>*</em></label><input class="f-input" id="fMail" type="email" autocomplete="email"></div>';
  h+='<div class="f-field"><label class="f-label" for="fTel">Telefon</label><input class="f-input" id="fTel" type="tel" autocomplete="tel"></div>';
  h+='<div class="f-field wide"><label class="f-label" for="fTermin">Wunschtermin / Zeitraum</label><input class="f-input" id="fTermin" type="text" placeholder="z. B. September 2026 oder noch offen"></div>';
  h+='<div class="f-field wide"><label class="f-label" for="fMsg">Nachricht (optional)</label><textarea class="f-area" id="fMsg" placeholder="Gibt es etwas, das wir vorab wissen sollten?"></textarea></div>';
  h+='</div>';
  h+='<div class="f-summary"><strong>Eure Konfiguration:</strong> '+planIds().length+' Module';
  if(recoInterest&&recoById(recoInterest))h+=' · zusätzliches Interesse: '+esc(recoById(recoInterest).title);
  h+='<br>'+planIds().map(function(id){var m=byId(id);return m?esc(m.name):''}).filter(Boolean).join(' · ')+'</div>';
  h+='<p class="f-error" id="fError">Bitte fülle Name, Firma und eine gültige E-Mail-Adresse aus.</p>';
  h+='<div class="r-actions">';
  h+='<button class="btn-primary" id="submitBtn" onclick="submitRequest()">Anfrage senden ';
  h+='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>';
  h+='<a class="btn-ghost" href="'+mailtoHref()+'">Lieber per E-Mail senden</a>';
  h+='</div>';
  inner.innerHTML=h;
  goToSlide(FORM_SLIDE);
}
/* Der Tagesplan als lesbarer Text: Uhrzeit, Spalte und Modul – damit im
   Posteingang nachvollziehbar ist, WANN welches Modul laufen soll. */
function buildPlanLines(){
  var d=buildPlanData(),out=[];
  function zeile(zeit,text){out.push(zeit+'  |  '+text)}
  if(d.opener)zeile('09:00 - 09:45','Gemeinsamer Auftakt: '+d.opener.name);
  var slotTimes=d.halb
    ?['10:00 - 10:45','11:00 - 11:45']
    :['10:00 - 10:45','11:00 - 11:45','13:00 - 13:45','14:00 - 14:45'];
  for(var s=0;s<d.slots;s++){
    if(!d.halb&&s===2){
      if(d.mittag)zeile('12:00 - 12:30','Impuls vor der Pause: '+d.mittag.name);
      zeile(d.mittag?'12:30 - 13:00':'12:00 - 13:00','Mittagspause');
    }
    var belegt=[];
    d.tracks.forEach(function(t){
      var e=t.grid?t.grid[s]:null;
      if(e&&!e.cont)belegt.push(t.label+': '+e.m.name+' ('+e.m.dauer+' Min)');
      else if(e&&e.cont)belegt.push(t.label+': '+e.m.name+' (Fortsetzung)');
    });
    if(belegt.length)zeile(slotTimes[s],belegt.join('  ||  '));
    else zeile(slotTimes[s],'frei');
  }
  if(d.sks.length)zeile(d.halb?'12:00 - 13:00':'15:00 - 16:00',
    'Schnupperkurse parallel: '+d.sks.map(function(m){return m.name}).join(', '));
  if(d.ausklang)zeile('im Anschluss','Tagesausklang: '+d.ausklang.name+' ('+d.ausklang.dauer+' Min)');
  return out;
}
function buildSummaryText(){
  var lines=['Anfrage Gesundheitstag über den Konfigurator','','Antworten:'];
  QUESTIONS.forEach(function(q){
    var v=answers[q.key],txt;
    if(q.multi){
      txt=(v||[]).map(function(id){var o=optOf(q,id);return o?o.title:id}).join(', ')||'-';
    }else{
      var o=optOf(q,v);txt=o?o.title:'-';
    }
    lines.push('- '+q.label+': '+txt);
  });
  lines.push('','TAGESPLAN (vom Kunden so zusammengestellt):');
  buildPlanLines().forEach(function(l){lines.push(l)});
  if(recoInterest&&recoById(recoInterest))lines.push('','Zusätzliches Interesse: '+recoById(recoInterest).title);
  return lines.join('\n');
}
function mailtoHref(){
  return 'mailto:'+MAILTO+'?subject='+encodeURIComponent('Anfrage Gesundheitstag (Konfigurator)')+
    '&body='+encodeURIComponent(buildSummaryText());
}
function buildPayload(){
  var d=buildPlanData();
  return{
    kontakt:{
      name:document.getElementById('fName').value.trim(),
      firma:document.getElementById('fFirma').value.trim(),
      email:document.getElementById('fMail').value.trim(),
      telefon:document.getElementById('fTel').value.trim(),
      wunschtermin:document.getElementById('fTermin').value.trim(),
      nachricht:document.getElementById('fMsg').value.trim()
    },
    antworten:{size:answers.size,standorte:answers.standorte,audience:answers.audience,
      occasion:answers.occasion,topics:answers.topics,format:answers.format,duration:answers.duration},
    module:planIds(),
    schnupperWunsch:hasTopic(answers,'schnupper'),
    empfehlungskarte:recoInterest,
    tagesplanTracks:d.tracks.map(function(t){return{track:t.label,kompetenzfeld:t.feld,
      module:t.grid.filter(Boolean).filter(function(e){return !e.cont}).map(function(e){return e.m.id})}}),
    zusammenfassung:buildSummaryText(),
    timestamp:new Date().toISOString(),
    quelle:'gesundheitstag-konfigurator-v3'
  };
}
/* ═════════ VERSAND: WEBFLOW-NATIVES FORMULAR ═════════
   Auf der Webflow-Seite liegt ein unsichtbares natives Formular,
   dessen Form-Block das Attribut data-gtk-form trägt. Feldnamen:
   name, firma, email, telefon, wunschtermin, nachricht,
   zusammenfassung, quelle. Fehlt das Formular, greift der
   n8n-Webhook, danach der Demo-Modus. */
function findWebflowForm(){
  var el=document.querySelector('[data-gtk-form]');
  if(!el)return null;
  return el.tagName==='FORM'?el:el.querySelector('form');
}
function setWfField(form,name,val){
  var f=form.querySelector('[name="'+name+'"]');
  if(f)f.value=val==null?'':String(val);
}
function submitViaWebflow(form,payload,onDone,onFail){
  setWfField(form,'name',payload.kontakt.name);
  setWfField(form,'firma',payload.kontakt.firma);
  setWfField(form,'email',payload.kontakt.email);
  setWfField(form,'telefon',payload.kontakt.telefon);
  setWfField(form,'wunschtermin',payload.kontakt.wunschtermin);
  setWfField(form,'nachricht',payload.kontakt.nachricht);
  setWfField(form,'zusammenfassung',payload.zusammenfassung);
  setWfField(form,'quelle',payload.quelle);
  var wrap=(form.closest?form.closest('.w-form'):null)||form.parentNode;
  /* Submit so auslösen, dass Webflows eigener AJAX-Handler greift */
  if(typeof form.requestSubmit==='function'){form.requestSubmit()}
  else{
    var b=form.querySelector('input[type="submit"],button[type="submit"]');
    if(b)b.click();else if(form.submit)form.submit();
  }
  /* Erfolg/Fehler an Webflows Statusblöcken ablesen */
  var t0=Date.now();
  function shown(el){return !!(el&&el.style&&el.style.display&&el.style.display!=='none')}
  (function poll(){
    var done=wrap&&wrap.querySelector?wrap.querySelector('.w-form-done'):null;
    var failEl=wrap&&wrap.querySelector?wrap.querySelector('.w-form-fail'):null;
    if(shown(done))return onDone();
    if(shown(failEl))return onFail();
    if(Date.now()-t0>12000)return onFail();
    setTimeout(poll,250);
  })();
}

function submitRequest(){
  var name=document.getElementById('fName').value.trim();
  var firma=document.getElementById('fFirma').value.trim();
  var mail=document.getElementById('fMail').value.trim();
  var err=document.getElementById('fError');
  if(!name||!firma||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)){err.classList.add('show');return}
  err.classList.remove('show');
  var btn=document.getElementById('submitBtn');
  btn.disabled=true;btn.textContent='Wird gesendet …';
  var payload=buildPayload();
  function fail(){
    btn.disabled=false;btn.textContent='Erneut versuchen';
    err.textContent='Das hat leider nicht geklappt. Versuch es erneut oder nutze den E-Mail-Weg darunter.';
    err.classList.add('show');
  }
  /* 1) Webflow-natives Formular auf der Seite (Launch-Standard) */
  var wfForm=findWebflowForm();
  if(wfForm){submitViaWebflow(wfForm,payload,showSuccess,fail);return}
  /* 2) n8n-Webhook (optionale Ausbaustufe) */
  if(WEBHOOK_URL.indexOf('REPLACE_ME')<0){
    fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(function(res){if(!res.ok)throw new Error('HTTP '+res.status);showSuccess()})
      .catch(fail);
    return;
  }
  /* 3) DEMO-MODUS: weder Formular noch Webhook vorhanden → simulieren */
  try{console.log('Konfigurator-Payload (Demo):',payload)}catch(e){}
  setTimeout(showSuccess,800);
}
function showSuccess(){
  var inner=document.getElementById('formInner');
  var h='<div class="success-icon"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>';
  h+='<h2 class="r-title">Danke für eure Anfrage!</h2>';
  h+='<p class="r-sub">Wir haben eure Konfiguration erhalten und melden uns persönlich bei dir, in der Regel innerhalb von ein bis zwei Werktagen.</p>';
  h+='<div class="r-actions"><button class="btn-ghost" onclick="downloadPDF()">Tagesplan als PDF speichern</button><button class="btn-ghost" onclick="resetFunnel()">Neuen Gesundheitstag konfigurieren</button></div>';
  inner.innerHTML=h;
}

/* ═════════ PDF-EXPORT (Druckdokument in neuem Fenster) ═════════ */
function downloadPDF(){
  var win=window.open('','_blank');
  if(!win){
    alert('Bitte erlaube Pop-ups für diese Seite, um das PDF zu erstellen.');
    return;
  }
  win.document.open();
  win.document.write(buildPrintHTML());
  win.document.close();
  var fired=false;
  function go(){if(fired)return;fired=true;setTimeout(function(){try{win.focus();win.print()}catch(e){}},400)}
  if(win.document.readyState==='complete')go();else win.onload=go;
}
function buildPrintHTML(){
  var d=buildPlanData();
  var quer=d.tracks.length>3;
  var datum=new Date().toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
  var h='<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">';
  h+='<title>Gesundheitstag – Tagesplan | Strong Partners</title><style>';
  h+='@page{size:A4 '+(quer?'landscape':'portrait')+';margin:14mm}';
  h+='*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}';
  h+='body{font-family:"Cera Pro",system-ui,-apple-system,Arial,sans-serif;color:#1a1c1a;font-size:10.5pt;line-height:1.45;padding:4mm}';
  h+='.kopf{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #006e1d;padding-bottom:4mm;margin-bottom:5mm}';
  h+='.kopf h1{font-size:16pt;color:#006e1d}.kopf .sub{font-size:9pt;color:#5c6660;margin-top:1mm}';
  h+='.logo{height:9mm}';
  h+='.antworten{display:flex;flex-wrap:wrap;gap:1.5mm 8mm;font-size:9pt;margin-bottom:5mm}';
  h+='.antworten b{color:#006e1d}';
  h+='.tblwrap{border:1px solid #d8d5d0;border-radius:3mm;overflow:hidden;margin-bottom:5mm}';
  h+='table{width:100%;border-collapse:collapse}';
  h+='th{background:#006e1d;color:#fff;font-size:8.5pt;text-transform:uppercase;letter-spacing:.04em;padding:2.2mm 2.5mm;text-align:left}';
  h+='td{border-top:1px solid #d8d5d0;border-left:1px solid #d8d5d0;padding:2.2mm 2.5mm;vertical-align:top;font-size:9.5pt}';
  h+='td:first-child{border-left:0}';
  h+='th+th{border-left:1px solid rgba(255,255,255,.28)}';
  h+='td.zeit{white-space:nowrap;font-weight:700;color:#006e1d;width:24mm}';
  h+='td.voll{background:#eef7f0}';
  h+='.mod b{display:block}.mod span{color:#5c6660;font-size:8.5pt}';
  h+='.leer{color:#b9b5af;font-style:italic;font-size:8.5pt}';
  h+='.preis{background:#eef7f0;border-left:3px solid #38ba47;border-radius:2mm;padding:2.5mm 4mm;font-size:9.5pt;margin-bottom:3mm}';
  h+='.fuss{border-top:1px solid #d8d5d0;padding-top:2.5mm;font-size:8.5pt;color:#5c6660;display:flex;justify-content:space-between;gap:6mm}';
  h+='</style></head><body>';
  h+='<div class="kopf"><div><h1>Euer Gesundheitstag – Tagesplan</h1>';
  h+='<div class="sub">Unverbindliche Vorschau aus dem Konfigurator · Stand '+datum+'</div></div>';
  h+='<img class="logo" alt="Strong Partners" src="https://cdn.prod.website-files.com/69970053c4693c62ff0f6079/699703a5c2f4d20de88da1c6_Logo.svg"></div>';
  h+='<div class="antworten">';
  QUESTIONS.forEach(function(q){
    var v=answers[q.key],txt;
    if(q.multi){txt=(v||[]).map(function(id){var o=optOf(q,id);return o?o.title:id}).join(', ')||'–'}
    else{var o=optOf(q,v);txt=o?o.title:'–'}
    h+='<div><b>'+esc(q.label)+':</b> '+esc(txt)+'</div>';
  });
  h+='</div>';
  var cols=d.tracks.length||1;
  h+='<div class="tblwrap"><table><thead><tr><th>Uhrzeit</th>';
  if(cols>1){d.tracks.forEach(function(t){h+='<th>'+esc(t.label)+'</th>'})}
  else{h+='<th>Programm</th>'}
  h+='</tr></thead><tbody>';
  function voll(zeit,inhalt){h+='<tr><td class="zeit">'+zeit+'</td><td class="voll" colspan="'+cols+'">'+inhalt+'</td></tr>'}
  function modZelle(entry){
    if(!entry)return '<td><span class="leer">frei / nach Absprache</span></td>';
    if(entry.cont)return '<td><div class="mod"><span>Fortsetzung: '+esc(entry.m.name)+'</span></div></td>';
    return '<td><div class="mod"><b>'+esc(entry.m.name)+'</b><span>'+esc(THEME_LABELS[entry.m.themen[0]]||'')+' · '+entry.m.dauer+' Min</span></div></td>';
  }
  if(d.opener)voll('09:00 – 09:45','<div class="mod"><b>'+esc(d.opener.name)+'</b><span>Gemeinsamer Auftakt · '+d.opener.dauer+' Min</span></div>');
  var zeiten=d.halb?['10:00 – 10:45','11:00 – 11:45']:['10:00 – 10:45','11:00 – 11:45','13:00 – 13:45','14:00 – 14:45'];
  for(var s=0;s<d.slots;s++){
    if(!d.halb&&s===2){
      if(d.mittag)voll('12:00 – 12:30','<div class="mod"><b>'+esc(d.mittag.name)+'</b><span>Impuls vor der Pause</span></div>');
      voll(d.mittag?'12:30 – 13:00':'12:00 – 13:00','Mittagspause');
    }
    h+='<tr><td class="zeit">'+zeiten[s]+'</td>';
    d.tracks.forEach(function(t){h+=modZelle(t.grid?t.grid[s]:null)});
    h+='</tr>';
  }
  if(d.sks.length)voll(d.halb?'12:00 – 13:00':'15:00 – 16:00',d.sks.map(function(m){return '<b>'+esc(m.name)+'</b>'}).join(' · ')+'<br><span style="color:#5c6660;font-size:8.5pt">Zum Mitmachen, parallel zur Auswahl</span>');
  if(d.ausklang)voll('im Anschluss','<div class="mod"><b>'+esc(d.ausklang.name)+'</b><span>'+d.ausklang.dauer+' Min</span></div>');
  h+='</tbody></table></div>';
  var reco=recoInterest?recoById(recoInterest):null;
  if(reco)h+='<div class="preis"><b>Zusätzliches Interesse:</b> '+esc(reco.title)+'</div>';
  h+='<div class="preis">'+esc(PRICING.preis)+' '+esc(PRICING.foerderung)+'</div>';
  h+='<div class="fuss"><div>Den finalen Ablauf stimmen wir gemeinsam ab – Anfrage direkt über den Konfigurator oder per Mail an '+esc(MAILTO)+'</div><div>strong-partners.de</div></div>';
  h+='</body></html>';
  return h;
}

/* ═════════ KEYBOARD ═════════ */
document.addEventListener('keydown',function(e){
  if(currentSlide===0){if(e.key==='Enter')startFunnel();return}
  if(currentSlide>TOTAL_STEPS){
    if(e.key==='Escape'&&currentSlide===FORM_SLIDE)goBack();
    return;
  }
  var cards=document.querySelectorAll('#slide-'+currentSlide+' .q-card');
  if(!cards.length)return;
  var q=QUESTIONS[currentSlide-1];
  if(e.key==='ArrowDown'||e.key==='ArrowRight'){
    e.preventDefault();focusIdx=Math.min(focusIdx+1,cards.length-1);
    cards.forEach(function(c,i){if(!q.multi)c.classList.remove('selected')});
    if(!q.multi)cards[focusIdx].classList.add('selected');
    cards[focusIdx].scrollIntoView({block:'nearest'});
  }else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){
    e.preventDefault();focusIdx=Math.max(focusIdx-1,0);
    cards.forEach(function(c,i){if(!q.multi)c.classList.remove('selected')});
    if(!q.multi)cards[focusIdx].classList.add('selected');
    cards[focusIdx].scrollIntoView({block:'nearest'});
  }else if(e.key==='Enter'){
    e.preventDefault();
    if(focusIdx>=0){cards[focusIdx].click();if(!q.multi)focusIdx=-1}
    else if(q.multi&&(answers[q.key]||[]).length)advance(currentSlide);
  }else if(e.key==='Backspace'||e.key==='Escape'){
    e.preventDefault();goBack();
  }
});

/* ═════════ BOOT: Shell in #gtk-root injizieren ═════════ */
var SHELL="<div class=\"progress-bar\"><div class=\"progress-fill\" id=\"progressFill\"></div></div>\n<div class=\"step-indicator\" id=\"stepIndicator\"></div>\n<button class=\"back-btn\" id=\"backBtn\" onclick=\"goBack()\">\n  <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"19\" y1=\"12\" x2=\"5\" y2=\"12\"/><polyline points=\"12 19 5 12 12 5\"/></svg>\n  Zurück\n</button>\n\n<!-- Warenkorb -->\n<button class=\"cart-widget\" id=\"cartWidget\" onclick=\"toggleCartPanel()\" aria-label=\"Dein Gesundheitstag-Paket\">\n  <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#006e1d\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/></svg>\n  <span class=\"cart-label\">Dein Paket</span>\n  <span class=\"cart-count\" id=\"cartCount\">0</span>\n</button>\n<div class=\"cart-panel\" id=\"cartPanel\"></div>\n<button class=\"float-cta\" id=\"floatCta\" onclick=\"showForm()\">Unverbindlich anfragen\n  <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/><polyline points=\"12 5 19 12 12 19\"/></svg>\n</button>\n\n<div class=\"viewport\" id=\"viewport\">\n\n  <!-- SLIDE 0: HERO -->\n  <div class=\"slide slide-hero active\" id=\"slide-0\">\n    <div class=\"hero-content\">\n      <p class=\"hero-overline\">Gesundheitstag-Konfigurator</p>\n      <h1 class=\"hero-h1\">Stell dir deinen <em>Gesundheitstag</em> zusammen.</h1>\n      <p class=\"hero-sub\">Jeder Gesundheitstag ist so individuell wie euer Unternehmen. Beantworte sieben kurze Fragen und wir stellen dir live die passenden Module zu eurem Tagesablauf zusammen.</p>\n      <button class=\"hero-cta\" onclick=\"startFunnel()\">\n        Los geht's\n        <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/><polyline points=\"12 5 19 12 12 19\"/></svg>\n      </button>\n      <div class=\"hero-stats\">\n        <div><div class=\"stat-num\">75+</div><div class=\"stat-label\">Module zur Auswahl</div></div>\n        <div><div class=\"stat-num\" id=\"statSteps\">7</div><div class=\"stat-label\">Fragen bis zum Konzept</div></div>\n        <div><div class=\"stat-num\">1</div><div class=\"stat-label\">individueller Tagesplan</div></div>\n      </div>\n    </div>\n  </div>\n\n  <!-- SLIDES 1–7: FRAGEN (dynamisch) -->\n  <div class=\"slide slide-question\" id=\"slide-1\"><div class=\"q-inner\" id=\"qInner1\"></div></div>\n  <div class=\"slide slide-question\" id=\"slide-2\"><div class=\"q-inner\" id=\"qInner2\"></div></div>\n  <div class=\"slide slide-question\" id=\"slide-3\"><div class=\"q-inner\" id=\"qInner3\"></div></div>\n  <div class=\"slide slide-question\" id=\"slide-4\"><div class=\"q-inner\" id=\"qInner4\"></div></div>\n  <div class=\"slide slide-question\" id=\"slide-5\"><div class=\"q-inner\" id=\"qInner5\"></div></div>\n  <div class=\"slide slide-question\" id=\"slide-6\"><div class=\"q-inner\" id=\"qInner6\"></div></div>\n  <div class=\"slide slide-question\" id=\"slide-7\"><div class=\"q-inner\" id=\"qInner7\"></div></div>\n\n  <!-- SLIDE 8: ERGEBNIS -->\n  <div class=\"slide slide-result\" id=\"slide-8\"><div class=\"r-inner\" id=\"resultInner\"></div></div>\n\n  <!-- SLIDE 9: ANFRAGE -->\n  <div class=\"slide slide-form\" id=\"slide-9\"><div class=\"f-inner\" id=\"formInner\"></div></div>\n</div>";
function boot(){
  var root=document.getElementById('gtk-root');
  if(!root||root.getAttribute('data-gtk-ready'))return;
  root.setAttribute('data-gtk-ready','1');
  root.innerHTML=SHELL;
  ROOT=root;
  initPips();updateChrome();renderCartPanel();
  var statEl=document.getElementById('statSteps');
  if(statEl)statEl.textContent=TOTAL_STEPS;
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot)}
else{boot()}
