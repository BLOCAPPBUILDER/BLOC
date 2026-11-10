"use strict";
/* ============ Selbsttest „Wie fit bin ich?“ (Wissensaustausch › Selbsttest) ============
   Sechs Tests nacheinander mit Pausen: Standweitsprung, Klimmzüge, Liegestütze, Chair-Stand (60 s), einbeiniger Wadenhebetest (links, rechts) und Unterarmstütz.
   Jeder Test zeigt die bewegte BLOC-Figur (illuHTML), eine kurze Anleitung und je nach Test einen Zähler, einen 60-Sekunden-Countdown oder eine Stoppuhr; zwischen den
   Tests läuft eine Pausenuhr. Am Ende steht eine Einordnung in vier Stufen, wo es einen Vergleich gibt (Chair-Stand und Wadenhebe: Vergleichswert nach Alter aus den Studien in
   faq.js › testQuellen; Liegestütze und Unterarmstütz: grobe Bereiche, nicht validiert); Standweitsprung und Klimmzüge zeigen nur den Startwert und die Veränderung zum letzten Test.
   Gespeichert (nur lokal): settings.selbsttest = [{ at, alter, sex, w:{ jump (cm), pull, push, chair, calfL, calfR, plank (s) } }], höchstens 20.
   Alter und Geschlecht liegen wie bei den Körperdaten in settings.koerper (alter, sex "m"/"w").
   Die Texte der Tests sind eigene Formulierungen; die Auswahl der Tests wurde von FITBOOK angeregt (Quelle 3 in faq.js, nur verlinkt, nichts übernommen). */
var ST_TXT = {
  de: {
    tabFragen:"Fragen", tabTest:"Selbsttest", tabAria:"Bereich wählen",
    titel:"Wie fit bin ich?", sub:"Sechs kurze Tests nacheinander, mit Pausen dazwischen. Dauer etwa 25 Minuten.",
    vorTitel:"Das brauchst du", vor:["Einen stabilen Stuhl ohne Rollen und eine freie Wand", "Eine Klimmzugstange (ohne Stange überspringst du den Test)", "Ein Maßband und eine Linie auf dem Boden für den Sprung", "Etwas Platz und einen rutschfesten Boden", "Fünf Minuten leichtes Aufwärmen vorher"],
    sicher:"Mach die Tests nur, wenn du dich gesund und fit genug fühlst. Bei Schmerzen, Schwindel, Atemnot, Herz-Kreislauf-Beschwerden, Verletzungen oder Sturzrisiko (etwa beim Sprung) lass es oder sprich vorher mit einer Ärztin oder einem Arzt. Es geht um saubere Ausführung, nicht um Wettkampf. Der Test ist eine Orientierung, keine Diagnose.",
    profilTitel:"Für den Vergleich", alter:"Alter", sexW:"Weiblich", sexM:"Männlich", sexKeine:"Keine Angabe", profilHint:"Nur für den Vergleichswert bei Chair-Stand und Wadenhebe. Bleibt auf deinem Gerät.",
    start:"Test starten", letzter:"Letzter Test: {d}", letzterOeffnen:"Letztes Ergebnis ansehen", testsTitel:"Die sechs Tests",
    testVon:"Test {n} von {m}", ueberspringen:"Überspringen", abbrechen:"Abbrechen", abbrFrage:"Selbsttest abbrechen?", abbrText:"Deine bisherigen Ergebnisse gehen verloren.", abbrOk:"Abbrechen", weiterMachen:"Weitermachen",
    seiteL:"linkes Bein", seiteR:"rechtes Bein",
    bereit:"Bereit?", start60:"60 Sekunden starten", startStopp:"Start", los:"Los!", stopp:"Stopp", fertig:"Fertig", weiter:"Weiter", nochmal:"Nochmal", ergebnisZeigen:"Ergebnis zeigen",
    tapHint:"Tippe bei jeder sauberen Wiederholung", zeit:"Zeit", wdh:"Wiederholungen", wdhLabel:"Wiederholungen: {n}", haltezeit:"Haltezeit", zeitRest:"Verbleibende Zeit",
    sprungLabel:"Bester Sprung in cm", sprungHint:"Drei Versuche, der weiteste zählt.", sprungFehlt:"Trage die Weite in cm ein oder überspringe den Test.",
    pauseTitel:"Pause", pauseText:"Atme durch und trink einen Schluck. Als Nächstes: {n}.", pauseWeiter:"Weiter ohne Pause",
    ergTitel:"Dein Ergebnis", ergLeer:"Du hast alle Tests übersprungen. Starte noch einmal, wenn du bereit bist.",
    stufe1:"Ausbaufähig", stufe2:"Solide", stufe3:"Gut", stufe4:"Sehr gut", stufeVon:"Stufe {s} von 4",
    vergleich:"Vergleichswert für dein Alter: etwa {n}", ohneAlter:"Trage dein Alter ein, dann gibt es einen Vergleichswert.", richtwert:"Grobe Orientierung von BLOC, nicht wissenschaftlich validiert.",
    startwert:"Startwert: Beim nächsten Test siehst du, wie du dich verändert hast.", nichtGemacht:"Übersprungen",
    delta:"{d} zum letzten Test", gleich:"Unverändert zum letzten Test",
    seitenDiff:"Die Seiten unterscheiden sich um mehr als 20 %. Trainiere das schwächere Bein gezielt mit.",
    wiederholen:"Wiederhole den Test in 6 bis 8 Wochen unter gleichen Bedingungen (gleicher Stuhl, gleiche Tageszeit). So siehst du deinen Fortschritt.",
    neuTest:"Neuer Test", zurueck:"Zurück", cm:"cm", sek:"Sek.",
    quellenTitel:"Quellen und Hinweise",
    quellenText:"Vergleichswerte für Chair-Stand und Wadenhebe stammen aus den Studien unten; zwischen den Altersgruppen rechnet BLOC grob dazwischen. Bereiche bei Liegestützen und Unterarmstütz sind eine grobe Orientierung. Für Standweitsprung und Klimmzüge gibt es hier keine verlässliche Tabelle, deshalb zeigt BLOC nur deinen Verlauf. Die Auswahl der Tests wurde von einem FITBOOK-Artikel angeregt; dessen Texte und Tabellen sind urheberrechtlich geschützt und nicht übernommen.",
    tests: {
      jump:{ name:"Standweitsprung", was:"Misst die Schnellkraft deiner Beine.", steps:["Stell dich mit den Zehen hinter eine Linie, die Füße etwa hüftbreit.", "Hole mit den Armen Schwung, geh in die Knie und spring so weit wie möglich nach vorn.", "Miss von der Linie bis zur Ferse, die der Linie am nächsten landet. Drei Versuche, der weiteste zählt."], warn:"Bei Gelenkbeschwerden, Gleichgewichtsproblemen oder Sturzrisiko lieber überspringen." },
      pull:{ name:"Klimmzüge", was:"Misst die Zugkraft von Rücken und Armen.", steps:["Greif die Stange im Obergriff etwa schulterbreit und häng mit gestreckten Armen.", "Zieh dich hoch, bis das Kinn über der Stange ist, und senke dich wieder ganz ab.", "Zähle nur saubere Wiederholungen ohne Schwung. Ohne Stange: überspringen."] },
      push:{ name:"Liegestütze", was:"Misst die Kraftausdauer von Brust, Schultern und Armen.", steps:["Stütz dich auf Hände und Zehen, der Körper bildet eine gerade Linie.", "Beuge die Arme, bis die Brust knapp über dem Boden ist, und drück dich wieder hoch.", "So viele saubere Wiederholungen wie möglich ohne Pause. Hör auf, wenn die Haltung nicht mehr sauber ist."] },
      chair:{ name:"Chair-Stand (60 Sekunden)", was:"Misst die Kraftausdauer deiner Beine im Alltag (Aufstehen).", steps:["Setz dich auf einen stabilen Stuhl, die Arme vor der Brust verschränkt, die Füße flach am Boden.", "Steh ganz auf und setz dich wieder hin, so oft wie möglich in 60 Sekunden.", "Tippe das große Feld bei jedem vollständigen Aufstehen."] },
      calf:{ name:"Wadenheben auf einem Bein", was:"Misst die Kraftausdauer deiner Waden, getrennt für links und rechts.", steps:["Steh auf einem Bein und stütz dich nur leicht mit den Fingern an der Wand ab.", "Heb die Ferse so hoch wie möglich und senke sie kontrolliert, immer in gleichem Tempo und gleicher Höhe.", "Zähle saubere Wiederholungen bis du nicht mehr sauber hoch kommst. Erst ein Bein, dann das andere."] },
      plank:{ name:"Unterarmstütz (Plank)", was:"Misst, wie lange dein Rumpf die Haltung stabil hält.", steps:["Stütz dich auf Unterarme und Zehen, die Ellbogen unter den Schultern.", "Halte Becken und Rücken in einer Linie, nicht durchhängen und nicht hochschieben.", "Stopp, sobald du die Haltung nicht mehr sauber halten kannst."] }
    }
  },
  en: {
    tabFragen:"Questions", tabTest:"Self-test", tabAria:"Choose section",
    titel:"How fit am I?", sub:"Six short tests one after another with breaks in between. About 25 minutes.",
    vorTitel:"What you need", vor:["A sturdy chair without wheels and a free wall", "A pull-up bar (without one you skip that test)", "A tape measure and a line on the floor for the jump", "Some space and a non-slip floor", "Five minutes of light warm-up beforehand"],
    sicher:"Only do the tests if you feel healthy and fit enough. With pain, dizziness, shortness of breath, heart or circulation problems, injuries or a risk of falling (e.g. in the jump), skip them or talk to a doctor first. It is about clean form, not competition. The test is a guide, not a diagnosis.",
    profilTitel:"For the comparison", alter:"Age", sexW:"Female", sexM:"Male", sexKeine:"No answer", profilHint:"Only used for the reference value in the chair stand and heel raise. Stays on your device.",
    start:"Start test", letzter:"Last test: {d}", letzterOeffnen:"View last result", testsTitel:"The six tests",
    testVon:"Test {n} of {m}", ueberspringen:"Skip", abbrechen:"Cancel", abbrFrage:"Cancel the self-test?", abbrText:"Your results so far will be lost.", abbrOk:"Cancel test", weiterMachen:"Keep going",
    seiteL:"left leg", seiteR:"right leg",
    bereit:"Ready?", start60:"Start 60 seconds", startStopp:"Start", los:"Go!", stopp:"Stop", fertig:"Done", weiter:"Next", nochmal:"Again", ergebnisZeigen:"Show result",
    tapHint:"Tap for every clean repetition", zeit:"Time", wdh:"Repetitions", wdhLabel:"Repetitions: {n}", haltezeit:"Hold time", zeitRest:"Time left",
    sprungLabel:"Best jump in cm", sprungHint:"Three attempts, the longest counts.", sprungFehlt:"Enter the distance in cm or skip the test.",
    pauseTitel:"Break", pauseText:"Breathe and have a sip. Next: {n}.", pauseWeiter:"Continue without break",
    ergTitel:"Your result", ergLeer:"You skipped all tests. Start again when you are ready.",
    stufe1:"Room to grow", stufe2:"Solid", stufe3:"Good", stufe4:"Very good", stufeVon:"Level {s} of 4",
    vergleich:"Reference value for your age: about {n}", ohneAlter:"Enter your age to get a reference value.", richtwert:"Rough guide by BLOC, not scientifically validated.",
    startwert:"Starting value: next time you will see how you changed.", nichtGemacht:"Skipped",
    delta:"{d} vs last test", gleich:"Unchanged since last test",
    seitenDiff:"The sides differ by more than 20%. Train the weaker leg specifically.",
    wiederholen:"Repeat the test in 6 to 8 weeks under the same conditions (same chair, same time of day). That shows your progress.",
    neuTest:"New test", zurueck:"Back", cm:"cm", sek:"s",
    quellenTitel:"Sources and notes",
    quellenText:"Reference values for the chair stand and heel raise come from the studies below; BLOC interpolates roughly between age groups. The ranges for push-ups and forearm plank are a rough guide. For the standing long jump and pull-ups there is no reliable table here, so BLOC only shows your progress. The choice of tests was inspired by a FITBOOK article; its texts and tables are protected by copyright and were not copied.",
    tests: {
      jump:{ name:"Standing long jump", was:"Measures the explosive power of your legs.", steps:["Stand with your toes behind a line, feet about hip-width apart.", "Swing your arms, bend your knees and jump as far forward as you can.", "Measure from the line to the heel that lands closest to it. Three attempts, the longest counts."], warn:"With joint problems, balance problems or a risk of falling, better skip it." },
      pull:{ name:"Pull-ups", was:"Measures the pulling strength of your back and arms.", steps:["Grip the bar overhand, about shoulder-width, and hang with straight arms.", "Pull up until your chin is over the bar and lower all the way down.", "Count only clean repetitions without swinging. No bar: skip."] },
      push:{ name:"Push-ups", was:"Measures the muscular endurance of chest, shoulders and arms.", steps:["Support yourself on hands and toes, body in a straight line.", "Bend your arms until your chest is just above the floor and push back up.", "As many clean repetitions as possible without a break. Stop when your form is no longer clean."] },
      chair:{ name:"Chair stand (60 seconds)", was:"Measures the muscular endurance of your legs for everyday standing up.", steps:["Sit on a sturdy chair, arms crossed over your chest, feet flat on the floor.", "Stand up fully and sit back down, as often as possible in 60 seconds.", "Tap the big area for every full stand-up."] },
      calf:{ name:"Single-leg heel raise", was:"Measures the muscular endurance of your calves, left and right separately.", steps:["Stand on one leg and touch the wall lightly with your fingers for balance.", "Raise the heel as high as you can and lower it under control, always at the same pace and height.", "Count clean repetitions until you can no longer rise cleanly. One leg first, then the other."] },
      plank:{ name:"Forearm plank", was:"Measures how long your core holds a stable position.", steps:["Support yourself on forearms and toes, elbows under your shoulders.", "Keep hips and back in one line, no sagging and no piking up.", "Stop as soon as you can no longer hold the position cleanly."] }
    }
  }
};
function stSp(){ return currentLang() === "en" ? "en" : "de"; }
function stT(k, v){
  var s = ST_TXT[stSp()][k]; if(s == null) s = ST_TXT.de[k]; if(s == null) return k;
  if(v) Object.keys(v).forEach(function(n){ s = String(s).split("{"+n+"}").join(v[n]); });
  return s;
}
function stTest(id){ return ST_TXT[stSp()].tests[id]; }
/* Reihenfolge: erst Schnellkraft, dann Kraftausdauer, zuletzt die Haltezeit; pause = Sekunden danach */
var ST_TESTS = [
  { id:"jump", fig:"broad-jump", art:"zahl", pause:90 },
  { id:"pull", fig:"pull-ups", art:"zaehler", pause:120 },
  { id:"push", fig:"push-ups", art:"zaehler", band:[10, 20, 40], pause:90 },
  { id:"chair", fig:"chair-squat", art:"zaehler", limit:60, pause:90 },
  { id:"calf", fig:"single-leg-calf-raise", art:"zaehler", seiten:2, pause:60 },
  { id:"plank", fig:"plank", art:"stopp", band:[30, 60, 120], pause:0 }
];
var faqModus = "fragen", selbst = null, stTimer = null;
function stReset(){ stClear(); selbst = { schritt:"intro", i:0, seite:0, w:{}, phase:"bereit", zaehl:0, ergIndex:-1 }; }
function stUhrStop(){ if(stTimer){ clearInterval(stTimer); stTimer = null; } }
function stClear(){ stUhrStop(); try{ releaseWakeLock(); }catch(e){} }   // Uhr anhalten und Bildschirm wieder freigeben
stReset();

/* ---------- Vergleichswerte und Stufen ---------- */
function stLerp(a, y1, b, y2, x){ x = Math.max(a, Math.min(b, x)); return y1 + (y2 - y1)*(x - a)/(b - a); }
/* Chair-Stand in 60 s: Vergleichswerte aus Strassmann 2013 (40–44 Jahre: Männer 45, Frauen 41; 60–64 Jahre: Männer 37, Frauen 34), dazwischen grob gerechnet, außerhalb der nächstliegende Wert */
function stRefChair(alter, sex){ var m = stLerp(42, 45, 62, 37, alter), w = stLerp(42, 41, 62, 34, alter); return Math.round(sex === "m" ? m : sex === "w" ? w : (m + w)/2); }
/* Einbeiniges Wadenheben: Mittelwerte aus Bohannon 2022 (unter 40 Jahre etwa 29, über 60 etwa 12), dazwischen grob gerechnet */
function stRefWade(alter){ return Math.round(stLerp(40, 29, 60, 12, alter)); }
function stStufeBand(v, b){ return v < b[0] ? 1 : v < b[1] ? 2 : v < b[2] ? 3 : 4; }
function stStufeRef(v, ref){ var r = v/ref; return r < .75 ? 1 : r < 1 ? 2 : r < 1.25 ? 3 : 4; }
function stListe(){ var s = state.db.settings; if(!Array.isArray(s.selbsttest)) s.selbsttest = []; return s.selbsttest; }
function stProfil(){ var k = state.db.settings.koerper || {}; return { alter:+k.alter || 0, sex:k.sex === "m" || k.sex === "w" ? k.sex : "" }; }
function stDatum(ms){ return new Date(ms).toLocaleDateString(currentLang() === "en" ? "en-GB" : "de-DE", { day:"numeric", month:"short", year:"numeric" }); }
function stBeep(kind){ try{ if(state.db.settings.sound !== false) phaseBeep(kind); }catch(e){} try{ vibrate(kind === "tick" ? 30 : [80, 40, 120]); }catch(e){} }

/* ---------- Ansicht ---------- */
function stBuehne(fig, klasse){ return '<div class="st-buehne">'+illuHTML(fig, klasse || "st-illu")+'</div>'; }
function stSchrittName(T, seite){ var tx = stTest(T.id); return tx.name+(T.seiten ? " – "+stT(seite ? "seiteR" : "seiteL") : ""); }
function stIntroHTML(){
  var p = stProfil(), liste = stListe(), letzter = liste[liste.length - 1];
  return '<div class="card st-karte"><h2 class="st-titel">'+esc(stT("titel"))+'</h2><p class="st-sub">'+esc(stT("sub"))+'</p>'+
    '<div class="st-uebersicht" aria-label="'+esc(stT("testsTitel"))+'">'+ST_TESTS.map(function(T, i){
      return '<div class="st-ue"><span class="st-thumb">'+illuHTML(T.fig, "st-thumb-illu")+'</span><b>'+(i + 1)+'. '+esc(stTest(T.id).name)+'</b></div>'; }).join("")+'</div></div>'+
    '<div class="card st-karte"><h3 class="st-h">'+esc(stT("vorTitel"))+'</h3><ul class="st-liste">'+stT("vor").map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul>'+
      '<p class="st-warnung" role="note">'+esc(stT("sicher"))+'</p></div>'+
    '<div class="card st-karte"><h3 class="st-h">'+esc(stT("profilTitel"))+'</h3>'+
      '<div class="st-feld"><label for="st-alter">'+esc(stT("alter"))+'</label><input type="number" id="st-alter" inputmode="numeric" min="14" max="100" value="'+(p.alter ? p.alter : "")+'"></div>'+
      '<div class="theme-pick wahl-pick st-sex" role="group" aria-label="'+esc(stT("sexKeine"))+'">'+
        [["w", "sexW"], ["m", "sexM"], ["", "sexKeine"]].map(function(x){ return '<button type="button" data-stsex="'+x[0]+'" class="'+(p.sex === x[0] ? "active" : "")+'">'+esc(stT(x[1]))+'</button>'; }).join("")+'</div>'+
      '<div class="tm-hint">'+esc(stT("profilHint"))+'</div></div>'+
    '<button type="button" class="btn btn-primary st-startbtn" data-ststart>'+esc(stT("start"))+'</button>'+
    (letzter ? '<button type="button" class="btn btn-secondary" data-stletzter>'+esc(stT("letzterOeffnen"))+' ('+esc(stDatum(letzter.at))+')</button>' : '')+
    stQuellenHTML();
}
function stQuellenHTML(){
  var F = window.BLOC_FAQ, q = F && F.testQuellen;
  return '<details class="faq-q st-quellen"><summary><span class="faq-t">'+esc(stT("quellenTitel"))+'</span></summary><div class="faq-a"><p>'+esc(stT("quellenText"))+'</p>'+
    (q ? '<ol class="faq-refs">'+Object.keys(q).map(function(n){ return '<li value="'+n+'">'+q[n][stSp()]+'</li>'; }).join("")+'</ol>' : '')+'</div></details>';
}
function stKopfHTML(T){
  var nr = selbst.i + 1, gesamt = ST_TESTS.length;
  return '<div class="st-fortschritt"><span>'+esc(stT("testVon", { n:nr, m:gesamt }))+'</span><i style="--p:'+Math.round(100*(nr - 1 + (T.seiten ? selbst.seite/2 : 0))/gesamt)+'%"></i></div>';
}
function stTestHTML(){
  var T = ST_TESTS[selbst.i], tx = stTest(T.id), ph = selbst.phase, h, name = stSchrittName(T, selbst.seite);
  var ende = '</div><button type="button" class="st-abbruch" data-stabbruch>'+esc(stT("abbrechen"))+'</button>';
  if(T.art === "zahl"){
    return stKopfHTML(T)+'<div class="card st-karte st-test"><h2 class="st-titel">'+esc(name)+'</h2><p class="st-sub">'+esc(tx.was)+'</p>'+stBuehne(T.fig)+stSchritteHTML(tx)+
      '<div class="st-feld st-gross-feld"><label for="st-wert">'+esc(stT("sprungLabel"))+'</label><input type="number" id="st-wert" inputmode="numeric" min="30" max="400" step="1" value="'+(selbst.zahl || "")+'"></div><div class="tm-hint">'+esc(stT("sprungHint"))+'</div>'+
      '<div class="btn-row"><button type="button" class="btn btn-secondary" data-stskip>'+esc(stT("ueberspringen"))+'</button><button type="button" class="btn btn-primary" data-stweiter>'+esc(stT("weiter"))+'</button></div>'+ende;
  }
  var weiterText = stT(stLetzter() ? "ergebnisZeigen" : "weiter");
  if(ph === "bereit"){   // Anleitung lesen, dann los: bei allen Tests mit Vorlauf 3-2-1
    return stKopfHTML(T)+'<div class="card st-karte st-test"><h2 class="st-titel">'+esc(name)+'</h2><p class="st-sub">'+esc(tx.was)+'</p>'+stBuehne(T.fig)+stSchritteHTML(tx)+
      '<button type="button" class="btn btn-primary st-startbtn" data-stlos>'+esc(stT(T.limit ? "start60" : "startStopp"))+'</button>'+stSkipHTML()+ende;
  }
  // ab hier ist die Ansicht kurz gehalten (kleine Figur, Zeit, Zähler), damit alles ohne Scrollen auf den Bildschirm passt
  h = stKopfHTML(T)+'<div class="card st-karte st-test st-kompakt"><h2 class="st-titel">'+esc(name)+'</h2>'+stBuehne(T.fig, "st-illu st-klein");
  if(ph === "vorlauf") h += '<div class="st-gross" id="st-gross" role="timer" aria-live="off">3</div><div class="st-hint">'+esc(stT("bereit"))+'</div>';
  else if(ph === "laeuft"){
    h += '<div class="st-label">'+esc(stT(T.limit ? "zeitRest" : T.art === "stopp" ? "haltezeit" : "zeit"))+'</div><div class="st-gross" id="st-gross" role="timer" aria-live="off">'+(T.limit ? "1:00" : "0:00")+'</div>';
    if(T.art === "stopp") h += '<button type="button" class="btn btn-primary st-startbtn" data-ststopp>'+esc(stT("stopp"))+'</button>';
    else h += stTapHTML()+(T.limit ? "" : '<button type="button" class="btn btn-primary st-startbtn" data-stweiter>'+esc(stT("fertig"))+'</button>');
  } else if(T.art === "stopp"){
    h += '<div class="st-label">'+esc(stT("haltezeit"))+'</div><div class="st-gross">'+esc(fmtUhr(selbst.dauer*1000))+'</div><div class="btn-row"><button type="button" class="btn btn-secondary" data-stnochmal>'+esc(stT("nochmal"))+'</button><button type="button" class="btn btn-primary" data-stweiter>'+esc(weiterText)+'</button></div>';
  } else h += stZaehlerAbschluss();
  return h+ende;
}
function stSchritteHTML(tx){ return '<ol class="st-schritte">'+tx.steps.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ol>'+(tx.warn ? '<p class="st-warnung" role="note">'+esc(tx.warn)+'</p>' : ''); }
function stSkipHTML(){ return '<button type="button" class="btn btn-secondary st-skip" data-stskip>'+esc(stT("ueberspringen"))+'</button>'; }
function stTapHTML(){
  return '<button type="button" class="st-tap" data-sttap aria-label="'+esc(stT("tapHint"))+'"><b id="st-zahl">'+selbst.zaehl+'</b><small>'+esc(stT("tapHint"))+'</small></button>'+
    '<div class="st-korr"><button type="button" class="btn btn-secondary" data-stminus aria-label="−1">&minus;1</button><span class="st-wdh">'+esc(stT("wdh"))+'</span></div>';
}
function stZaehlerAbschluss(){
  return '<div class="st-label">'+esc(stT("wdh"))+'</div><div class="st-gross" id="st-zahl">'+selbst.zaehl+'</div><div class="st-korr"><button type="button" class="btn btn-secondary" data-stminus aria-label="−1">&minus;1</button><button type="button" class="btn btn-secondary" data-stplus aria-label="+1">+1</button></div>'+
    '<div class="btn-row"><button type="button" class="btn btn-secondary" data-stnochmal>'+esc(stT("nochmal"))+'</button><button type="button" class="btn btn-primary" data-stweiter>'+esc(stT(stLetzter() ? "ergebnisZeigen" : "weiter"))+'</button></div>';
}
function stLetzter(){ var T = ST_TESTS[selbst.i]; return selbst.i === ST_TESTS.length - 1 && (!T.seiten || selbst.seite === 1); }
function stPauseHTML(){
  var n = selbst.next, T = ST_TESTS[n.i];
  return '<div class="card st-karte st-pause"><h2 class="st-titel">'+esc(stT("pauseTitel"))+'</h2><div class="st-gross" id="st-gross" role="timer" aria-live="off">'+esc(fmtUhr(Math.max(0, selbst.pauseEnde - Date.now())))+'</div>'+
    '<p class="st-sub">'+esc(stT("pauseText", { n:stSchrittName(T, n.seite) }))+'</p>'+stBuehne(T.fig, "st-illu st-klein")+
    '<button type="button" class="btn btn-primary st-startbtn" data-stpauseweiter>'+esc(stT("pauseWeiter"))+'</button></div><button type="button" class="st-abbruch" data-stabbruch>'+esc(stT("abbrechen"))+'</button>';
}
/* Ergebnis: je Test Wert, Stufe (vier Balken plus Wort, nicht nur Farbe) oder Startwert, Vergleichswert und Veränderung zum vorigen Test */
function stErgebnisHTML(){
  var liste = stListe(), e = liste[selbst.ergIndex] || { w:selbst.w, alter:stProfil().alter, sex:stProfil().sex }, w = e.w || {}, prev = selbst.ergIndex > 0 ? liste[selbst.ergIndex - 1] : null, pw = prev ? prev.w || {} : {};
  var alter = e.alter || 0, sex = e.sex || "", n = 0;
  function delta(neu, alt, fmt){ if(neu == null || alt == null) return ""; var d = neu - alt; return '<small class="st-delta">'+esc(d === 0 ? stT("gleich") : stT("delta", { d:(d > 0 ? "+" : "−")+fmt(Math.abs(d)) }))+'</small>'; }
  function zeile(T, wertText, stufe, vergleich, extra){
    n++;
    return '<div class="st-zeile"><span class="st-thumb">'+illuHTML(T.fig, "st-thumb-illu")+'</span><div class="st-info"><b>'+esc(stTest(T.id).name)+'</b><span class="st-wert">'+wertText+'</span>'+
      (stufe ? '<div class="st-meter" role="img" aria-label="'+esc(stT("stufe"+stufe)+", "+stT("stufeVon", { s:stufe }))+'">'+[1, 2, 3, 4].map(function(i){ return '<i class="'+(i <= stufe ? "an" : "")+'"></i>'; }).join("")+'</div><small><b>'+esc(stT("stufe"+stufe))+'</b> · '+esc(stT("stufeVon", { s:stufe }))+'</small>' : '<small>'+esc(stT("startwert"))+'</small>')+
      (vergleich ? '<small>'+esc(vergleich)+'</small>' : '')+(extra || '')+'</div></div>';
  }
  var h = '<div class="card st-karte"><h2 class="st-titel">'+esc(stT("ergTitel"))+'</h2><p class="st-sub">'+esc(stDatum(e.at || Date.now()))+'</p>';
  ST_TESTS.forEach(function(T){
    if(T.id === "jump" && w.jump != null) h += zeile(T, '<b>'+w.jump+'</b> '+esc(stT("cm")), 0, "", delta(w.jump, pw.jump, String));
    else if(T.id === "pull" && w.pull != null) h += zeile(T, '<b>'+w.pull+'</b>', 0, "", delta(w.pull, pw.pull, String));
    else if(T.id === "push" && w.push != null) h += zeile(T, '<b>'+w.push+'</b>', stStufeBand(w.push, T.band), stT("richtwert"), delta(w.push, pw.push, String));
    else if(T.id === "chair" && w.chair != null){
      var rc = alter >= 14 ? stRefChair(alter, sex) : 0;
      h += zeile(T, '<b>'+w.chair+'</b>', rc ? stStufeRef(w.chair, rc) : 0, rc ? stT("vergleich", { n:rc }) : stT("ohneAlter"), delta(w.chair, pw.chair, String));
    } else if(T.id === "calf" && (w.calfL != null || w.calfR != null)){
      var l = w.calfL, r = w.calfR, werte = [l, r].filter(function(x){ return x != null; }), mittel = werte.reduce(function(a, b){ return a + b; }, 0)/werte.length, rw = alter >= 14 ? stRefWade(alter) : 0;
      var diff = l != null && r != null && Math.max(l, r) > 0 && Math.min(l, r)/Math.max(l, r) < .8 ? '<small class="st-seitendiff">'+esc(stT("seitenDiff"))+'</small>' : "";
      h += zeile(T, (l != null ? esc(stT("seiteL").charAt(0).toUpperCase())+' <b>'+l+'</b>' : "")+(l != null && r != null ? ' · ' : "")+(r != null ? esc(stT("seiteR").charAt(0).toUpperCase())+' <b>'+r+'</b>' : ""), rw ? stStufeRef(mittel, rw) : 0, rw ? stT("vergleich", { n:rw }) : stT("ohneAlter"), diff+delta(mittel, (pw.calfL != null || pw.calfR != null) ? [pw.calfL, pw.calfR].filter(function(x){ return x != null; }).reduce(function(a, b){ return a + b; }, 0)/[pw.calfL, pw.calfR].filter(function(x){ return x != null; }).length : null, function(d){ return String(Math.round(d*10)/10); }));
    } else if(T.id === "plank" && w.plank != null) h += zeile(T, '<b>'+esc(fmtUhr(w.plank*1000))+'</b>', stStufeBand(w.plank, T.band), stT("richtwert"), delta(w.plank, pw.plank, function(d){ return fmtUhr(d*1000); }));
  });
  if(!n) h += '<p class="st-sub">'+esc(stT("ergLeer"))+'</p>';
  h += '<p class="st-sub">'+esc(stT("wiederholen"))+'</p></div>'+
    '<button type="button" class="btn btn-primary st-startbtn" data-stneu>'+esc(stT("neuTest"))+'</button>'+stQuellenHTML();
  return h;
}
/* Umschalter oben auf Wissensaustausch: Fragen | Selbsttest (nur außerhalb eines laufenden Tests) */
function faqTabsHTML(){
  return '<div class="card lib-tabs-card"><div class="theme-pick lib-tabs seg-2" role="group" aria-label="'+esc(stT("tabAria"))+'">'+
    '<button type="button" data-faqmodus="fragen" class="'+(faqModus === "fragen" ? "active" : "")+'">'+esc(stT("tabFragen"))+'</button>'+
    '<button type="button" data-faqmodus="test" class="'+(faqModus === "test" ? "active" : "")+'">'+esc(stT("tabTest"))+'</button></div></div>';
}
function stSeiteHTML(){
  if(selbst.schritt === "test") return stTestHTML();
  if(selbst.schritt === "pause") return stPauseHTML();
  if(selbst.schritt === "ergebnis") return faqTabsHTML()+stErgebnisHTML();
  return faqTabsHTML()+stIntroHTML();
}

/* ---------- Ablauf ---------- */
function stNeuZeichnen(oben){ renderFaq(); if(oben) window.scrollTo(0, 0); }
function stWertSpeichern(){
  var T = ST_TESTS[selbst.i];
  if(T.id === "calf") selbst.w[selbst.seite ? "calfR" : "calfL"] = selbst.zaehl;
  else if(T.id === "plank") selbst.w.plank = selbst.dauer;
  else if(T.id === "jump"){ var v = Math.round(+selbst.zahl); if(v >= 30 && v <= 400) selbst.w.jump = v; }
  else selbst.w[T.id] = selbst.zaehl;
}
function stWeiter(ueberspringen){
  var T = ST_TESTS[selbst.i];
  if(!ueberspringen) stWertSpeichern();
  stClear();
  if(stLetzter() || (ueberspringen && selbst.i === ST_TESTS.length - 1)) return stFertig();
  var naechsteSeite = T.seiten && selbst.seite === 0 && !ueberspringen;
  selbst.next = naechsteSeite ? { i:selbst.i, seite:1 } : { i:selbst.i + 1, seite:0 };
  selbst.pauseEnde = Date.now() + (naechsteSeite ? 45 : (ueberspringen ? 5 : T.pause))*1000;
  selbst.schritt = "pause";
  stNeuZeichnen(true);
}
function stNaechster(){
  var n = selbst.next; stClear();
  selbst.i = n.i; selbst.seite = n.seite; selbst.schritt = "test"; selbst.phase = "bereit"; selbst.zaehl = 0; selbst.zahl = ""; selbst.dauer = 0;
  stNeuZeichnen(true);
}
function stFertig(){
  var liste = stListe(), alle = Object.keys(selbst.w);
  if(alle.length){
    var p = stProfil(); liste.push({ at:Date.now(), alter:p.alter, sex:p.sex, w:selbst.w });
    while(liste.length > 20) liste.shift();
    save(); selbst.ergIndex = liste.length - 1;
  } else selbst.ergIndex = -1;
  selbst.schritt = "ergebnis"; stNeuZeichnen(true);
}
function stStartTest(){
  selbst.w = {}; selbst.i = 0; selbst.seite = 0; selbst.schritt = "test"; selbst.phase = "bereit"; selbst.zaehl = 0; selbst.zahl = ""; selbst.dauer = 0;
  stNeuZeichnen(true);
}
function stLos(){
  stClear(); selbst.phase = "vorlauf"; selbst.vorEnde = Date.now() + 3000; selbst.vorZuletzt = 4; selbst.zaehl = 0;
  try{ requestWakeLock(); }catch(e){}
  try{ audioBereit(function(){}); }catch(e){}
  renderFaq();
}
/* Eine Uhr für Vorlauf, Countdown, Stoppuhr und Pause; läuft nur, solange ihr Anzeigefeld im Dokument steht */
function stTick(){
  var el = document.getElementById("st-gross");
  if(!el || !document.body.contains(el) || selbst.schritt === "intro" || selbst.schritt === "ergebnis"){ stClear(); return; }
  var jetzt = Date.now(), T = ST_TESTS[selbst.i];
  if(selbst.schritt === "pause"){
    var rest = Math.ceil((selbst.pauseEnde - jetzt)/1000);
    if(rest <= 0){ stBeep("work"); stNaechster(); return; }
    el.textContent = fmtUhr(rest*1000);
    if(rest <= 3 && rest !== selbst.vorZuletzt){ selbst.vorZuletzt = rest; stBeep("tick"); }
    return;
  }
  if(selbst.phase === "vorlauf"){
    var r = Math.ceil((selbst.vorEnde - jetzt)/1000);
    if(r <= 0){ selbst.phase = "laeuft"; selbst.t0 = jetzt; stBeep("work"); renderFaq(); return; }
    if(r !== selbst.vorZuletzt){ selbst.vorZuletzt = r; el.textContent = r; stBeep("tick"); }
  } else if(selbst.phase === "laeuft"){
    if(T.limit){
      var left = Math.max(0, Math.ceil((selbst.t0 + T.limit*1000 - jetzt)/1000));
      el.textContent = fmtUhr(left*1000);
      if(left <= 3 && left > 0 && left !== selbst.vorZuletzt){ selbst.vorZuletzt = left; stBeep("tick"); }
      if(left <= 0){ stClear(); stBeep("done"); selbst.phase = "fertig"; renderFaq(); }
    } else el.textContent = fmtUhr(jetzt - selbst.t0);
  }
}
function stBinden(){
  var s = state.db.settings;
  stUhrStop();   // nur die Uhr: der Bildschirm bleibt während eines laufenden Tests an
  function an(sel, fn){ app.querySelectorAll(sel).forEach(function(b){ b.addEventListener("click", fn); }); }
  an("[data-faqmodus]", function(ev){ faqModus = ev.currentTarget.getAttribute("data-faqmodus"); renderFaq(); });
  var al = app.querySelector("#st-alter");
  if(al) al.addEventListener("change", function(){ var k = s.koerper || (s.koerper = {}); var v = Math.round(+al.value); if(v >= 14 && v <= 100) k.alter = v; else { delete k.alter; al.value = ""; } save(); });
  an("[data-stsex]", function(ev){ var k = s.koerper || (s.koerper = {}), v = ev.currentTarget.getAttribute("data-stsex"); if(v) k.sex = v; else delete k.sex; save(); app.querySelectorAll("[data-stsex]").forEach(function(b){ b.classList.toggle("active", b === ev.currentTarget); }); });
  an("[data-ststart]", function(){ if(al) al.dispatchEvent(new Event("change")); stStartTest(); });
  an("[data-stletzter]", function(){ selbst.ergIndex = stListe().length - 1; selbst.schritt = "ergebnis"; stNeuZeichnen(true); });
  an("[data-stneu]", function(){ stReset(); stNeuZeichnen(true); });
  an("[data-stlos]", stLos);
  an("[data-stskip]", function(){ stWeiter(true); });
  an("[data-stweiter]", function(){
    var T = ST_TESTS[selbst.i];
    if(T.art === "zahl"){ var inp = app.querySelector("#st-wert"), v = Math.round(+inp.value); if(!(v >= 30 && v <= 400)){ showToast(stT("sprungFehlt")); inp.focus(); return; } selbst.zahl = v; }
    stWeiter(false);
  });
  an("[data-stpauseweiter]", stNaechster);
  an("[data-stnochmal]", function(){ stClear(); selbst.phase = "bereit"; selbst.zaehl = 0; selbst.dauer = 0; renderFaq(); });
  an("[data-ststopp]", function(){ stClear(); selbst.dauer = Math.max(1, Math.round((Date.now() - selbst.t0)/1000)); selbst.phase = "fertig"; stBeep("done"); renderFaq(); });
  an("[data-sttap]", function(){ selbst.zaehl++; var z = app.querySelector("#st-zahl"); if(z) z.textContent = selbst.zaehl; try{ vibrate(15); }catch(e){} });
  an("[data-stplus]", function(){ selbst.zaehl++; var z = app.querySelector("#st-zahl"); if(z) z.textContent = selbst.zaehl; });
  an("[data-stminus]", function(){ selbst.zaehl = Math.max(0, selbst.zaehl - 1); var z = app.querySelector("#st-zahl"); if(z) z.textContent = selbst.zaehl; });
  an("[data-stabbruch]", function(){
    confirmSheet(stT("abbrFrage"), stT("abbrText"), stT("abbrOk"), function(){ stReset(); renderFaq(); window.scrollTo(0, 0); });
  });
  if(selbst.schritt === "pause" || selbst.phase === "vorlauf" || (selbst.schritt === "test" && selbst.phase === "laeuft")){ selbst.vorZuletzt = 4; stTimer = setInterval(stTick, 200); stTick(); }
}
