/* ============ Protein-Tracker (Tools › Protein, 2026-10-24) ============
   Oben: Tagessumme in Gramm und Kalorienbedarf (Schätzung), darunter das Mengenfeld, die Favoriten (Sterne im Katalog), der Katalog nach Rubriken mit Suche (zugeklappt) und die heutigen Einträge.
   Seltenes (eigener Button, Kombi, Gramm eintippen, Woche, Bedarf, Erklärung) steht eingeklappt darunter.
   Beim ersten Öffnen fragt ein Bildschirm Gewicht, Größe, Alter, Geschlecht und Aktivität (dieselben Körperdaten wie unter Fortschritt, settings.koerper).
   Alles lokal in settings.protein - nichts verlässt das Gerät. Kein Barcode-Scanner: Er bräuchte eine Produktdatenbank im Netz und bräche das Versprechen.
   Keine Erinnerung ums Training, keine rote Warnung. Texte dieser Seite stehen in PROT_T (Deutsch und Englisch). */
var PROT_T = {
  de: {
    titel:"Protein-Tracker", kachelSub:"Tagesziel und Schnellbuttons", heute:"Heute", von:"von {g} g", noch:"noch {g} g", erreicht:"Ziel erreicht",
    rueck:"Rückgängig", schnell:"Schnellbuttons", schnellHint:"", katalog:"Katalog", favoriten:"Favoriten", favLeer:"Noch keine Favoriten. Tippe im Katalog auf ☆, dann steht das Lebensmittel hier.", favStern:"Als Favorit", katalogHint:"Ein Tipp trägt die Menge oben ein (Basis 100 g: je 100 g steht die Protein-Menge in der Zeile). ＋ speichert das Lebensmittel als eigenen Schnellbutton.",
    rub_milch:"Milch & Quark", rub_kaese:"Käse", rub_wurst:"Wurst & Aufschnitt", rub_fleisch:"Fleisch & Geflügel", rub_fisch:"Fisch", rub_eier:"Eier", rub_huelsen:"Hülsenfrüchte & vegan", rub_getreide:"Getreide & Brot", rub_nuss:"Nüsse & Samen", rub_shake:"Shakes & Riegel", rub_weitere:"Weitere", azTitel:"A–Z durchblättern",
    tabWoche:"Woche", tabBedarf:"Bedarf", koerper:"Körperdaten", eigenBtn:"＋ Eigenes", subGramm:"Gramm", subEigen:"Eigener Button", subKombi:"Kombi", kombiLeer:"Lege zuerst einen eigenen Button an.",
    bedarfOnb:"Trage deine Daten oben in der Einrichtung ein oder tippe auf „Später“.", keineBeratung:"Keine medizinische Beratung.", schliessen:"Schließen",
    onbTitel:"Dein Bedarf", onbText:"Für dein Proteinziel und deinen Kalorienbedarf.",
    onbFertig:"Fertig", onbSpaeter:"Später", onbFehl:"Bitte mindestens das Gewicht eintragen.", onbOffen:"Bedarf noch offen",
    kcal:"Kalorienbedarf", kcalWert:"Bedarf ca. {k} kcal pro Tag", kcalHint:"Schätzung, 10–20 % Abweichung möglich.",
    kcalZiel:"Ziel ca. {k} kcal pro Tag", kcalErhalt:"Erhaltung ca. {k} kcal · Schätzung, 10–20 % Abweichung möglich.",
    kcalMinder:"Unter 18: keine Kalorienschätzung. Bitte mit Ärztin oder Arzt besprechen.",
    zielTitel:"Ziel", zielAb:"Abnehmen", zielHalten:"Halten", zielAuf:"Aufbauen",
    sonder:"Schwangerschaft, Stillzeit, Nierenerkrankung oder Essstörung: Ziele bitte mit Ärztin oder Arzt klären.",
    kcalOffen:"Für den Kalorienbedarf fehlen Größe und Alter.",
    bedarf:"Mein Bedarf", bedarfHint:"", stufeTitel:"Proteinziel pro kg Körpergewicht",
    manuell:"Gramm eintippen", manuellHint:"", manuellName:"Manuell",
    name:"Name (optional)", hinzu:"Hinzufügen", eigenDetails:"Eigenes hinzufügen", eigen:"Eigener Button",
    eigenHint:"Protein je 100 g steht auf der Packung.", portion:"Portion (g)",
    je100:"Protein je 100 g", vorschau:"ergibt {g} g Protein", anlegen:"Button anlegen", fehlEingabe:"Name, Portion und Protein eintragen.",
    liste:"Heute erfasst", leer:"Noch nichts erfasst.", loeschen:"Eintrag löschen",
    faktor:"Portion wählen", suche:"Lebensmittel suchen", sucheHint:"",
    sucheLeer:"Nicht in der Liste: eigenen Button anlegen oder Gramm eintippen.", suchePh:"z. B. Quark, Ei, Linsen", menge:"Menge (g)", je100kurz:"{g} g / 100 g",
    alsButton:"Als Button speichern", angelegt:"Button angelegt.",
    kombi:"Kombi-Button", kombiHint:"", kombiWahl:"Buttons wählen",
    kombiAnlegen:"Kombi anlegen", kombiFehl:"Name und mindestens zwei Buttons wählen.",
    wocheDetails:"Woche und Verteilung", verteilung:"Verteilung heute", morgens:"Morgens", mittags:"Mittags", abends:"Abends",
    woche:"Letzte 7 Tage", schnitt:"Schnitt an erfassten Tagen", gkg:"in g/kg",
    fehlt:"Im Schnitt fehlen {g} g pro Tag, etwa ein Skyr oder Shake.", ok:"Ziel im Wochenschnitt erreicht.",
    viel:"Über 2,2 g/kg im Schnitt: mehr bringt kaum zusätzlichen Nutzen.",
    basis:"Basis", training:"Training", intensiv:"Intensiv", basisS:"0,83 g/kg · WHO/EFSA", trainS:"1,6 g/kg", intensivS:"2,0 g/kg",
    proMahl:"pro Mahlzeit (0,25–0,4 g/kg)",
    quelle:"",
    info:"So rechnet die Seite",
    quellenTitel:"Quellen",
    infoListe:[
      "Die Tagessumme zählt am meisten. Die Stufen 1,6 und 2,0 g/kg sind eine eigene Wahl innerhalb der Spannen der Quellen.",
      "Kalorien: Grundumsatz (Mifflin-St-Jeor, erst ab 18) mal Aktivität. Das ist der Erhaltungsbedarf; bei einem einzelnen Menschen sind 10 bis 20 % Abweichung möglich. Abnehmen rechnet etwa 15 % weniger, nie unter dem Grundumsatz und nie unter 1.500 (Männer), 1.200 (Frauen) bzw. 1.350 kcal; Aufbauen etwa 8 % mehr. Ohne Angabe zum Geschlecht rechnet die Seite mit dem Mittelwert beider Formeln, die Aktivitätsfaktoren sind an FAO/WHO/UNU 2004 angelehnt.",
      "Verteilung: 3 bis 5 Mahlzeiten mit je etwa 0,25 bis 0,4 g/kg gelten als sinnvoll, die Belege dafür sind schwach.",
      "Timing: Ein enges Zeitfenster nach dem Training ist nicht nötig, die Tagessumme zählt am meisten.",
      "Beim Abnehmen steigt die Stufe auf mindestens 2,0 g/kg, weil im Defizit mehr Eiweiß hilft, Muskeln zu halten. Ab 65 Jahren gilt mindestens 1,0 g/kg. Ab BMI 30 rechnet die Seite mit dem Gewicht bei BMI 25.",
      "Über etwa 2,2 g/kg im Wochenschnitt zeigt die Studienlage kaum zusätzlichen Muskelzuwachs. Das ist die obere Grenze, kein fester Schwellenwert.",
      "Nieren, Schwangerschaft, Stillzeit, Essstörung und unter 18: Menge und Kalorien mit einer Ärztin oder einem Arzt klären, die Seite ist dafür nicht gedacht.",
      "Lebensmittelwerte sind grob gerundete Richtwerte, die Packungsangabe geht vor. Angaben aus Packungen und Listen sind auf etwa ±10 bis 20 % genau.",
      "Keine medizinische Beratung."
    ],
    quellen:[
      "Joint WHO/FAO/UNU Expert Consultation: Protein and amino acid requirements in human nutrition, WHO TRS 935 (2007)",
      "Jäger et al.: ISSN Position Stand: protein and exercise, J Int Soc Sports Nutr 14:20 (2017)",
      "Thomas, Erdman, Burke: Position of the Academy of Nutrition and Dietetics, Dietitians of Canada and the American College of Sports Medicine: Nutrition and athletic performance, J Acad Nutr Diet 116:501 (2016)",
      "Morton et al.: Protein supplementation and resistance training-induced gains in muscle mass and strength, meta-analysis, Br J Sports Med 52:376 (2018)",
      "Schoenfeld, Aragon: How much protein can the body use in a single meal for muscle-building?, J Int Soc Sports Nutr 15:10 (2018)",
      "EFSA NDA Panel: Scientific Opinion on Dietary Reference Values for protein, EFSA Journal 10(2):2557 (2012)",
      "Mifflin et al.: A new predictive equation for resting energy expenditure in healthy individuals, Am J Clin Nutr 51:241 (1990)",
      "Frankenfield et al.: Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults, J Am Diet Assoc 105:775 (2005)",
      "Helms et al.: Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation, J Int Soc Sports Nutr 11:20 (2014)",
      "Bauer et al.: Evidence-based recommendations for optimal dietary protein intake in older people (PROT-AGE), J Am Med Dir Assoc 14:542 (2013)",
      "FAO/WHO/UNU: Human energy requirements, FAO Food and Nutrition Technical Report 1 (2004)",
      "Lebensmittelwerte: eigene Auswahl grob gerundeter Richtwerte, stichprobenartig abgeglichen mit USDA FoodData Central"
    ]
  },
  en: {
    titel:"Protein Tracker", kachelSub:"Daily goal and quick buttons", heute:"Today", von:"of {g} g", noch:"{g} g to go", erreicht:"Goal reached",
    rueck:"Undo", schnell:"Quick buttons", schnellHint:"", katalog:"Catalogue", favoriten:"Favourites", favLeer:"No favourites yet. Tap ☆ in the catalogue and the food appears here.", favStern:"Mark as favourite", katalogHint:"One tap logs the amount above (base 100 g: each row shows protein per 100 g). ＋ saves the food as your own quick button.",
    rub_milch:"Milk & quark", rub_kaese:"Cheese", rub_wurst:"Sausage & cold cuts", rub_fleisch:"Meat & poultry", rub_fisch:"Fish", rub_eier:"Eggs", rub_huelsen:"Legumes & vegan", rub_getreide:"Grains & bread", rub_nuss:"Nuts & seeds", rub_shake:"Shakes & bars", rub_weitere:"Other", azTitel:"Browse A–Z",
    tabWoche:"Week", tabBedarf:"Needs", koerper:"Body data", eigenBtn:"＋ Custom", subGramm:"Grams", subEigen:"Own button", subKombi:"Combo", kombiLeer:"Create your own button first.",
    bedarfOnb:"Enter your data in the setup above or tap “Later”.", keineBeratung:"No medical advice.", schliessen:"Close",
    onbTitel:"Your needs", onbText:"For your protein goal and calorie need.",
    onbFertig:"Done", onbSpaeter:"Later", onbFehl:"Please enter at least your weight.", onbOffen:"Needs not set yet",
    kcal:"Calorie need", kcalWert:"Need about {k} kcal per day", kcalHint:"Estimate, 10–20 % deviation possible.",
    kcalZiel:"Goal about {k} kcal per day", kcalErhalt:"Maintenance about {k} kcal · estimate, 10–20 % deviation possible.",
    kcalMinder:"Under 18: no calorie estimate. Please talk to a doctor.",
    zielTitel:"Goal", zielAb:"Lose weight", zielHalten:"Maintain", zielAuf:"Build",
    sonder:"Pregnancy, breastfeeding, kidney disease or an eating disorder: please clarify goals with a doctor.",
    kcalOffen:"Height and age are missing for the calorie need.",
    bedarf:"My needs", bedarfHint:"", stufeTitel:"Protein goal per kg body weight",
    manuell:"Type in grams", manuellHint:"", manuellName:"Manual",
    name:"Name (optional)", hinzu:"Add", eigenDetails:"Add your own", eigen:"Own button",
    eigenHint:"Protein per 100 g is on the pack.", portion:"Portion (g)",
    je100:"Protein per 100 g", vorschau:"gives {g} g protein", anlegen:"Create button", fehlEingabe:"Enter a name, portion and protein.",
    liste:"Logged today", leer:"Nothing logged yet.", loeschen:"Delete entry",
    faktor:"Choose portion", suche:"Search foods", sucheHint:"",
    sucheLeer:"Not in the list: create your own button or type in grams.", suchePh:"e.g. quark, egg, lentils", menge:"Amount (g)", je100kurz:"{g} g / 100 g",
    alsButton:"Save as button", angelegt:"Button created.",
    kombi:"Combo button", kombiHint:"", kombiWahl:"Choose buttons",
    kombiAnlegen:"Create combo", kombiFehl:"Enter a name and choose at least two buttons.",
    wocheDetails:"Week and spread", verteilung:"Spread today", morgens:"Morning", mittags:"Midday", abends:"Evening",
    woche:"Last 7 days", schnitt:"Average on logged days", gkg:"in g/kg",
    fehlt:"On average {g} g a day are missing, about one skyr or shake.", ok:"Weekly average reaches the goal.",
    viel:"Above 2.2 g/kg on average: more brings little extra benefit.",
    basis:"Basic", training:"Training", intensiv:"Intensive", basisS:"0.83 g/kg · WHO/EFSA", trainS:"1.6 g/kg", intensivS:"2.0 g/kg",
    proMahl:"per meal (0.25–0.4 g/kg)",
    quelle:"",
    info:"How the page calculates",
    quellenTitel:"Sources",
    infoListe:[
      "The daily total counts most. The levels 1.6 and 2.0 g/kg are our own choice within the ranges of the sources.",
      "Calories: basal rate (Mifflin-St Jeor, from 18) times activity. This is the maintenance need; for one person 10 to 20 % deviation is possible. Losing weight uses about 15 % less, never below the basal rate and never below 1,500 (men), 1,200 (women) or 1,350 kcal; building about 8 % more. Without a sex entry the page uses the mean of both formulas; the activity factors follow FAO/WHO/UNU 2004.",
      "Spread: 3 to 5 meals with about 0.25 to 0.4 g/kg each are considered sensible, the evidence is weak.",
      "Timing: a narrow window after training is not necessary, the daily total counts most.",
      "When losing weight the level rises to at least 2.0 g/kg, because in a deficit more protein helps keep muscle. From 65 the minimum is 1.0 g/kg. From BMI 30 the page uses the weight at BMI 25.",
      "Above about 2.2 g/kg on average the studies show little extra muscle gain. That is the upper bound, not a fixed threshold.",
      "Kidneys, pregnancy, breastfeeding, eating disorder and under 18: clarify amount and calories with a doctor, the page is not meant for this.",
      "Food values are roughly rounded guide values, the pack comes first. Figures from packs and lists are about ±10 to 20 % accurate.",
      "No medical advice."
    ],
    quellen:[
      "Joint WHO/FAO/UNU Expert Consultation: Protein and amino acid requirements in human nutrition, WHO TRS 935 (2007)",
      "Jäger et al.: ISSN Position Stand: protein and exercise, J Int Soc Sports Nutr 14:20 (2017)",
      "Thomas, Erdman, Burke: Position of the Academy of Nutrition and Dietetics, Dietitians of Canada and the American College of Sports Medicine: Nutrition and athletic performance, J Acad Nutr Diet 116:501 (2016)",
      "Morton et al.: Protein supplementation and resistance training-induced gains in muscle mass and strength, meta-analysis, Br J Sports Med 52:376 (2018)",
      "Schoenfeld, Aragon: How much protein can the body use in a single meal for muscle-building?, J Int Soc Sports Nutr 15:10 (2018)",
      "EFSA NDA Panel: Scientific Opinion on Dietary Reference Values for protein, EFSA Journal 10(2):2557 (2012)",
      "Mifflin et al.: A new predictive equation for resting energy expenditure in healthy individuals, Am J Clin Nutr 51:241 (1990)",
      "Frankenfield et al.: Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults, J Am Diet Assoc 105:775 (2005)",
      "Helms et al.: Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation, J Int Soc Sports Nutr 11:20 (2014)",
      "Bauer et al.: Evidence-based recommendations for optimal dietary protein intake in older people (PROT-AGE), J Am Med Dir Assoc 14:542 (2013)",
      "FAO/WHO/UNU: Human energy requirements, FAO Food and Nutrition Technical Report 1 (2004)",
      "Food values: own selection of roughly rounded guide values, spot-checked against USDA FoodData Central"
    ]
  }
};
/* Mitgelieferte Lebensmittel: „Name|Protein in g je 100 g“. Eigene Auswahl mit grob gerundeten Richtwerten; die Packungsangabe geht vor.
   Neue Einträge einfach als weitere Zeile anhängen. */
var PROT_FOODS_BASIS = ("Magerquark|12;Quark 20 % Fett|11;Skyr|11;Griechischer Joghurt 10 %|6;Naturjoghurt 3,5 %|4;Joghurt fettarm|4;Hüttenkäse|12;Frischkäse|6;Milch 1,5 %|3,4;Buttermilch|3,5;Kefir|3,5;"+
  "Gouda|25;Emmentaler|29;Mozzarella|18;Parmesan|36;Feta|15;Harzer Käse|30;Camembert|20;Proteinpudding|10;Sojadrink|3,3;Haferdrink|1;"+
  "Whey-Pulver|75;Casein-Pulver|80;Erbsenprotein-Pulver|78;Proteinriegel|35;Protein-Shake fertig|10;"+
  "Ei|13;Eiklar|11;"+
  "Hähnchenbrust, roh|23;Hähnchenschenkel|19;Putenbrust|24;Rinderhack, mager|21;Rindersteak|22;Schweinefilet|22;Schweinehack|17;Schinken, gekocht|20;"+
  "Putenaufschnitt|17;Salami|20;Leberkäse|12;Bratwurst|13;Lammfleisch|20;"+
  "Lachs|20;Thunfisch, abgetropft|26;Forelle|20;Kabeljau|18;Seelachs|18;Garnelen|18;Hering|17;Makrele|19;Sardinen, Dose|21;"+
  "Tofu|14;Räuchertofu|16;Tempeh|19;Seitan|25;Sojagranulat, trocken|50;Edamame|12;Sojabohnen, gekocht|16;Quorn|14;"+
  "Linsen, gekocht|9;Linsen, trocken|24;Kichererbsen, gekocht|9;Kidneybohnen, gekocht|8;Weiße Bohnen, gekocht|7;Erbsen|6;Hummus|8;"+
  "Haferflocken|13;Müsli|10;Vollkornbrot|8;Weißbrot|8;Toast|8;Brötchen|9;Nudeln, trocken|12;Nudeln, gekocht|5;Reis, gekocht|3;Quinoa, gekocht|4;Couscous, gekocht|4;"+
  "Kartoffeln|2;Brokkoli|3;Spinat|3;Mais|3;"+
  "Erdnüsse|26;Erdnussmus|25;Mandeln|21;Walnüsse|15;Cashews|18;Haselnüsse|15;Kürbiskerne|30;Sonnenblumenkerne|21;Chiasamen|17;Leinsamen|18;Hanfsamen|32").split(";").map(function(z){
  var x = z.split("|"); return [x[0], parseFloat(x[1].replace(",", "."))];
});
/* Weitere Lebensmittel: Käse, Wurst, vegane Wurst, Nudeln, Riegel, Fleisch, Fisch, Hülsenfrüchte, Brot und Getreide */
var PROT_FOODS_MEHR = ("Appenzeller|27;Bergkäse|30;Brie|18;Butter|0,7;Butterkäse|23;Cheddar|25;Cottage Cheese|11;Edamer|25;Frischkäse light|8;Halloumi|22;Hirtenkäse|15;Mascarpone|4;Mozzarella light|20;Ricotta|9;Schafskäse|18;Schmelzkäse|15;Schweizer Käse|28;Tilsiter|27;Ziegenkäse|20;Schmand|3;Sahne|2,5;Margarine|0,3;Veganer Käse|2;"+
  "Bierschinken|13;Bockwurst|12;Cervelatwurst|22;Chorizo|24;Corned Beef|22;Fleischkäse|14;Fleischwurst|12;Frikadelle|15;Geflügelwurst|14;Gelbwurst|12;Krakauer|14;Kochschinken mager|18;Landjäger|28;Leberwurst|12;Lyoner|11;Mettwurst|16;Mortadella|15;Putenwurst|16;Rohschinken|27;Serranoschinken|28;Teewurst|22;Wiener Würstchen|12;"+
  "Vegane Wurst|14;Vegane Salami|15;Vegane Mortadella|13;Veggie-Aufschnitt|14;Sojawurst|13;Seitan-Aufschnitt|18;Lupinen-Aufschnitt|15;Tofu-Würstchen|13;Veggie-Frikadelle|12;Vegane Bratwurst|13;Veganes Hack|16;Sojageschnetzeltes|13;"+
  "Dinkelnudeln, gekocht|5;Vollkornnudeln, gekocht|5;Hartweizennudeln, gekocht|5;Eiernudeln, gekocht|5;Linsennudeln, gekocht|9;Kichererbsennudeln, gekocht|8;Protein-Nudeln, gekocht|14;Reisnudeln, gekocht|2;Glasnudeln, gekocht|0,2;Spätzle, gekocht|6;Lasagneplatten, gekocht|5;"+
  "Proteinriegel Schoko|25;Proteinriegel Erdnuss|27;Eiweißriegel|35;Protein-Waffel|20;Müsliriegel|6;Haferriegel|8;Reiswaffel|8;Beef Jerky|33;Protein-Chips|30;"+
  "Rinderfilet|21;Rindergulasch|21;Rinderbraten|23;Kalbfleisch|20;Kalbsschnitzel|21;Hirsch|22;Wildschwein|21;Entenbrust|20;Schweinebraten|21;Schweinenacken|19;Kasseler|20;Putenhack|20;Hähnchenbrust gekocht|30;Hähnchenschnitzel|23;Hühnchenkeule ohne Haut|18;Gänsebrust|18;Hackfleisch gemischt|18;"+
  "Hecht|19;Zander|19;Karpfen|17;Dorade|19;Pangasius|16;Shrimps gekocht|24;Lachs geräuchert|24;Heringsfilet|16;Thunfisch in Öl|23;Forelle geräuchert|23;Saibling|20;Rotbarsch|17;Scampi|20;Muscheln|12;Tintenfisch|16;Sardellen|25;"+
  "Kidneybohnen trocken|22;Kichererbsen trocken|19;Linsen rot trocken|24;Bohnen rot gekocht|8;Schwarze Bohnen gekocht|8;Falafel|13;Tofu seidig|8;Sojajoghurt|3,5;Veganer Quark|8;Lupinenjoghurt|10;Sojaschnetzel, trocken|50;Mandelmus|21;Tahini|17;"+
  "Ei gekocht|13;Eigelb|16;Vollmilch|3,4;Kondensmilch|7;Milchreis|3;"+
  "Roggenbrot|8;Knäckebrot|10;Vollkornbrötchen|9;Haferkleie|17;Weizenkleie|15;Buchweizen gekocht|4;Hirse gekocht|3;Bulgur gekocht|3;Polenta|3;Haferbrei|4;"+
  "Milch 3,5 %|3,4;Laktosefreie Milch|3,4;Joghurt 1,5 %|4;Quark 40 % Fett|10;Rührei|10;Putenschnitzel|24;Rinderleber|21;Pistazien|20;Paranüsse|14;Pinienkerne|14;Lupinen, gekocht|16;Pumpernickel|6;Protein-Brot|25").split(";").map(function(z){
  var x = z.split("|"); return [x[0], parseFloat(x[1].replace(",", "."))];
});
/* Katalog: alle Lebensmittel alphabetisch (deutsche Sortierung), gleiche Namen nur einmal */
var PROT_FOODS = PROT_FOODS_BASIS.concat(PROT_FOODS_MEHR).filter(function(f, i, all){
  return all.findIndex(function(g){ return g[0] === f[0]; }) === i;
}).sort(function(a, b){ return a[0].localeCompare(b[0], "de"); });
var protOffen = {};
var protMengeMerk = 100;   // „Menge (g)“ im Katalog bleibt beim Neuzeichnen erhalten   // eingeklappte Karten, die der Nutzer geöffnet hat (bleiben beim Neuzeichnen offen)
function protT(key, vars){
  var s = (PROT_T[currentLang()] || PROT_T.de)[key];
  if(s == null) s = PROT_T.de[key];
  if(vars && typeof s === "string") s = s.replace(/\{(\w+)\}/g, function(m, k){ return vars[k] != null ? vars[k] : m; });
  return s;
}
/* Einstellungen des Protein-Trackers: Version, Stufe (g/kg), Schnellbuttons, Einträge je Tag, „später“ (Onboarding übersprungen) */
function protDaten(){
  var s = state.db.settings;
  if(!s.protein || typeof s.protein !== "object"){
    s.protein = { v:1, stufe:1.6, kg:0, knoepfe:[], favs:[], tage:{} };
    save();
  } else if(!s.protein.v){ s.protein.v = 1; save(); }
  if(!Array.isArray(s.protein.favs)){ s.protein.favs = []; save(); }
  return s.protein;
}
function protKg(){
  var kd = koerperDaten();
  return kd ? kd.kg : (protDaten().kg || null);
}
/* Ziel: "ab" abnehmen, "halten", "auf" aufbauen (Standard halten) */
function protZielArt(){ var z = protDaten().ziel; return z === "ab" || z === "auf" ? z : "halten"; }
/* Gewicht als Bezug fürs Proteinziel: ab BMI 30 das Gewicht bei BMI 25 (sonst wird der Bedarf überschätzt) */
function protBezugKg(){
  var kd = koerperDaten(), kg = protKg();
  if(kd && kd.cm >= 120 && kd.cm <= 230){ var m = kd.cm / 100; if(kg / (m*m) > 30) return Math.round(25 * m*m * 10) / 10; }
  return kg;
}
/* Gramm pro kg: gewählte Stufe; beim Abnehmen mindestens 2,0 (im Defizit höher), ab 65 mindestens 1,0 */
function protStufe(){
  var st = protDaten().stufe, kd = koerperDaten();
  if(protZielArt() === "ab") st = Math.max(st, 2);
  if(kd && kd.alter >= 65) st = Math.max(st, 1);
  return st;
}
function protZiel(){
  var kg = protBezugKg();
  return kg ? Math.round(kg * protStufe()) : 0;
}
/* Grundumsatz nach Mifflin-St-Jeor (an Erwachsenen geprüft: erst ab 18); ohne Angabe zum Geschlecht der Mittelwert beider Formeln. Ohne Größe und Alter: 0 */
function protGrundumsatz(kd){
  if(!kd || !(kd.cm >= 120 && kd.cm <= 230) || !(kd.alter >= 18)) return 0;
  return 10*kd.kg + 6.25*kd.cm - 5*kd.alter + (kd.sex === "m" ? 5 : kd.sex === "w" ? -161 : -78);
}
/* Erhaltungsbedarf = Grundumsatz × Aktivität (ohne Angabe 1,55), auf 100 kcal gerundet - eine Schätzung, 10 bis 20 % Abweichung sind möglich */
function protKcal(){
  var kd = koerperDaten(), b = protGrundumsatz(kd);
  return b > 0 ? Math.round(b * (kd.pal || 1.55) / 100) * 100 : 0;
}
/* Tagesziel in kcal: halten = Erhaltung, aufbauen +8 %, abnehmen −15 % (nie unter dem Grundumsatz und nie unter 1.500 / 1.200 / 1.350 kcal, nie über der Erhaltung) */
function protKcalZiel(){
  var e = protKcal(), art = protZielArt(), kd = koerperDaten();
  if(!e || art === "halten") return e;
  if(art === "auf") return Math.round(e * 1.08 / 100) * 100;
  var boden = Math.max(Math.round(protGrundumsatz(kd)), kd.sex === "m" ? 1500 : kd.sex === "w" ? 1200 : 1350);
  return Math.min(e, Math.round(Math.max(e * 0.85, boden) / 100) * 100);
}
function protTag(key){ var p = protDaten(); return p.tage[key] || []; }
function protSumme(eintraege){ return eintraege.reduce(function(a, e){ return a + e.p; }, 0); }
/* Schnellbuttons: die häufig genutzten zuerst (gleiche Nutzung bleibt in der angelegten Reihenfolge) */
function protKnoepfe(){
  return protDaten().knoepfe.map(function(b, i){ return { b:b, i:i }; })
    .sort(function(x, y){ return (y.b.nutz || 0) - (x.b.nutz || 0) || x.i - y.i; }).map(function(x){ return x.b; });
}
function protEintragen(n, g, a){
  var p = protDaten(), key = kalTagKey(Date.now());
  (p.tage[key] || (p.tage[key] = [])).push({ id:uid(), n:n, p:Math.round(g), a:a || 0, at:Date.now() });
  save();
}
function protZeit(at){
  return new Date(at).toLocaleTimeString(currentLang() === "en" ? "en-GB" : "de-DE", { hour:"2-digit", minute:"2-digit" });
}
/* Kopfkarte: Protein von Ziel, Balken, Kalorienbedarf - wird auch nach Änderung der Körperdaten allein neu gezeichnet */
function protKopfHTML(summe){
  var ziel = protZiel(), rest = ziel - summe, proz = ziel ? Math.min(100, Math.round(summe / ziel * 100)) : 0, kcal = protKcalZiel(), erh = protKcal(), kd = koerperDaten();
  var zahl = function(n){ return n.toLocaleString(currentLang() === "en" ? "en-GB" : "de-DE"); };
  return '<div class="prot-gross"><b>'+summe+' g</b>'+(ziel ? '<span>'+esc(protT("von", { g:ziel }))+'</span>' : '')+'</div>'+
    '<div class="prot-bar"><i style="width:'+proz+'%"></i></div>'+
    '<div class="prot-zeile">'+esc(ziel ? (rest > 0 ? protT("noch", { g:rest }) : protT("erreicht")) : protT("onbOffen"))+'</div>'+
    (kcal ? '<div class="prot-kcal"><b>'+esc(protT(protZielArt() === "halten" ? "kcalWert" : "kcalZiel", { k:zahl(kcal) }))+'</b>'+
              '<small>'+esc(protZielArt() === "halten" ? protT("kcalHint") : protT("kcalErhalt", { k:zahl(erh) }))+'</small></div>'
          : kd ? '<div class="prot-kcal"><small>'+esc(protT(kd.alter > 0 && kd.alter < 18 ? "kcalMinder" : "kcalOffen"))+'</small></div>' : '');
}
/* Favoriten: Namen aus dem Katalog (settings.protein.favs), per Stern im Katalog gesetzt */
function protIstFav(name){ return protDaten().favs.indexOf(name) > -1; }
function protFavWechseln(name){
  var f = protDaten().favs, i = f.indexOf(name);
  if(i > -1) f.splice(i, 1); else f.push(name);
  save();
}
/* Suche: Groß/klein egal, ß = ss, ä/ö/ü = a/o/u und ae/oe/ue = a/o/u (so findet „Kaese“ den Käse). Gilt für Suchtext und Namen gleich */
function protFold(s){
  return String(s).toLowerCase().replace(/ß/g, "ss").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
}
/* Rubriken des Katalogs in Anzeigereihenfolge. Jedes Lebensmittel steht in mindestens einer Rubrik (eine darf in mehreren stehen,
   Hüttenkäse etwa in Milch und Käse). Was in keiner Liste steht, landet in „weitere“. Vegetarisches und Veganes steht nur in „huelsen“, nicht in Käse oder Wurst. */
var PROT_RUBRIKEN = ["milch", "kaese", "wurst", "fleisch", "fisch", "eier", "huelsen", "getreide", "nuss", "shake", "weitere"];
var PROT_RUBRIK_LISTEN = {
  milch:"Magerquark;Quark 20 % Fett;Skyr;Griechischer Joghurt 10 %;Naturjoghurt 3,5 %;Joghurt fettarm;Hüttenkäse;Cottage Cheese;Milch 1,5 %;Vollmilch;Buttermilch;Kefir;Kondensmilch;Milchreis;Sahne;Schmand;Butter;Margarine;Milch 3,5 %;Laktosefreie Milch;Joghurt 1,5 %;Quark 40 % Fett",
  kaese:"Gouda;Emmentaler;Mozzarella;Mozzarella light;Parmesan;Feta;Harzer Käse;Camembert;Hüttenkäse;Cottage Cheese;Frischkäse;Frischkäse light;Appenzeller;Bergkäse;Brie;Butterkäse;Cheddar;Edamer;Halloumi;Hirtenkäse;Mascarpone;Ricotta;Schafskäse;Schmelzkäse;Schweizer Käse;Tilsiter;Ziegenkäse",
  wurst:"Putenaufschnitt;Salami;Schinken, gekocht;Leberkäse;Bratwurst;Bierschinken;Bockwurst;Cervelatwurst;Chorizo;Corned Beef;Fleischkäse;Fleischwurst;Frikadelle;Geflügelwurst;Gelbwurst;Krakauer;Kochschinken mager;Landjäger;Leberwurst;Lyoner;Mettwurst;Mortadella;Putenwurst;Rohschinken;Serranoschinken;Teewurst;Wiener Würstchen",
  fleisch:"Hähnchenbrust, roh;Hähnchenschenkel;Putenbrust;Rinderhack, mager;Rindersteak;Schweinefilet;Schweinehack;Lammfleisch;Rinderfilet;Rindergulasch;Rinderbraten;Kalbfleisch;Kalbsschnitzel;Hirsch;Wildschwein;Entenbrust;Schweinebraten;Schweinenacken;Kasseler;Putenhack;Hähnchenbrust gekocht;Hähnchenschnitzel;Hühnchenkeule ohne Haut;Gänsebrust;Hackfleisch gemischt;Beef Jerky;Putenschnitzel;Rinderleber",
  fisch:"Lachs;Thunfisch, abgetropft;Forelle;Kabeljau;Seelachs;Garnelen;Hering;Makrele;Sardinen, Dose;Hecht;Zander;Karpfen;Dorade;Pangasius;Shrimps gekocht;Lachs geräuchert;Heringsfilet;Thunfisch in Öl;Forelle geräuchert;Saibling;Rotbarsch;Scampi;Muscheln;Tintenfisch;Sardellen",
  eier:"Ei;Eiklar;Ei gekocht;Eigelb;Rührei",
  huelsen:"Tofu;Räuchertofu;Tempeh;Seitan;Sojagranulat, trocken;Edamame;Sojabohnen, gekocht;Quorn;Linsen, gekocht;Linsen, trocken;Kichererbsen, gekocht;Kidneybohnen, gekocht;Weiße Bohnen, gekocht;Erbsen;Hummus;Kidneybohnen trocken;Kichererbsen trocken;Linsen rot trocken;Bohnen rot gekocht;Schwarze Bohnen gekocht;Falafel;Tofu seidig;Sojajoghurt;Veganer Quark;Lupinenjoghurt;Sojaschnetzel, trocken;Sojadrink;Haferdrink;Veganer Käse;Vegane Wurst;Vegane Salami;Vegane Mortadella;Veggie-Aufschnitt;Sojawurst;Seitan-Aufschnitt;Lupinen-Aufschnitt;Tofu-Würstchen;Veggie-Frikadelle;Vegane Bratwurst;Veganes Hack;Sojageschnetzeltes;Linsennudeln, gekocht;Kichererbsennudeln, gekocht;Lupinen, gekocht",
  getreide:"Haferflocken;Müsli;Vollkornbrot;Weißbrot;Toast;Brötchen;Nudeln, trocken;Nudeln, gekocht;Reis, gekocht;Quinoa, gekocht;Couscous, gekocht;Dinkelnudeln, gekocht;Vollkornnudeln, gekocht;Hartweizennudeln, gekocht;Eiernudeln, gekocht;Linsennudeln, gekocht;Kichererbsennudeln, gekocht;Protein-Nudeln, gekocht;Reisnudeln, gekocht;Glasnudeln, gekocht;Spätzle, gekocht;Lasagneplatten, gekocht;Roggenbrot;Knäckebrot;Vollkornbrötchen;Haferkleie;Weizenkleie;Buchweizen gekocht;Hirse gekocht;Bulgur gekocht;Polenta;Haferbrei;Pumpernickel;Protein-Brot",
  nuss:"Erdnüsse;Erdnussmus;Mandeln;Walnüsse;Cashews;Haselnüsse;Kürbiskerne;Sonnenblumenkerne;Chiasamen;Leinsamen;Hanfsamen;Mandelmus;Tahini;Pistazien;Paranüsse;Pinienkerne",
  shake:"Whey-Pulver;Casein-Pulver;Erbsenprotein-Pulver;Proteinriegel;Protein-Shake fertig;Proteinriegel Schoko;Proteinriegel Erdnuss;Eiweißriegel;Protein-Waffel;Müsliriegel;Haferriegel;Reiswaffel;Protein-Chips;Proteinpudding",
  weitere:"Kartoffeln;Brokkoli;Spinat;Mais"
};
/* Name → Rubriken, einmal beim Laden gebaut */
var PROT_RUBRIK_SATZ = {};
PROT_RUBRIKEN.forEach(function(k){
  PROT_RUBRIK_LISTEN[k].split(";").forEach(function(n){ (PROT_RUBRIK_SATZ[n] || (PROT_RUBRIK_SATZ[n] = [])).push(k); });
});
/* Liste aller Rubriken eines Lebensmittels (mindestens eine: sonst „weitere“) */
function protRubrik(name){ return PROT_RUBRIK_SATZ[name] || ["weitere"]; }
/* Katalog nach Rubriken, zugeklappt. Suche (protSuchText) prüft Name und Rubrik; passende Rubriken öffnen sich */
var protSuchText = "";
var protTab = "heute";   // sichtbarer Reiter (heute · woche · bedarf), nur im Arbeitsspeicher
/* Eine Zeile im Katalog: ein Tipp trägt die Menge aus „Menge (g)“ ein (Basis 100 g); der Stern macht ein Lebensmittel zum Favoriten */
function protKatalogZeile(f, idx){
  var an = protIstFav(f[0]);
  return '<div class="prot-eintrag"><button type="button" class="prot-treffer" data-pfood="'+idx+'"><b>'+esc(f[0])+'</b><small>'+esc(protT("je100kurz", { g:String(f[1]).replace(".", ",") }))+'</small></button>'+
    '<button type="button" class="prot-x prot-stern'+(an ? ' an' : '')+'" data-pstern="'+idx+'" aria-pressed="'+an+'" aria-label="'+esc(protT("favStern"))+'" title="'+esc(protT("favStern"))+'">'+(an ? '★' : '☆')+'</button></div>';
}
function protKatalogHTML(suche){
  var q = protFold(String(suche || "").trim()), html = "";
  PROT_RUBRIKEN.forEach(function(r){
    var rubName = protFold(protT("rub_" + r)), treffer = PROT_FOODS.map(function(f, idx){ return { f:f, idx:idx }; }).filter(function(x){
      return protRubrik(x.f[0]).indexOf(r) > -1 && (!q || protFold(x.f[0]).indexOf(q) > -1 || rubName.indexOf(q) > -1);
    });
    if(q && !treffer.length) return;
    var offen = q ? true : protOffen["rub_" + r] === true;
    html += '<details class="prot-karte prot-rub" data-pdet="rub_'+r+'"'+(offen ? ' open' : '')+'><summary>'+esc(protT("rub_" + r))+'</summary>'+
      treffer.map(function(x){ return protKatalogZeile(x.f, x.idx); }).join("")+'</details>';
  });
  /* A–Z zum Durchblättern (ohne Suche): zugeklappt, je Buchstabe eine eigene Gruppe, steht vor den Rubriken */
  var az = "";
  if(!q){
    var buch = {}, folge = [];
    PROT_FOODS.forEach(function(f, idx){
      var b = f[0].charAt(0).toUpperCase();
      if(!buch[b]){ buch[b] = []; folge.push(b); }
      buch[b].push(protKatalogZeile(f, idx));
    });
    az = '<details class="prot-karte prot-rub prot-az" data-pdet="az"'+(protOffen.az === true ? ' open' : '')+'><summary>'+esc(protT("azTitel"))+'</summary>'+
      folge.map(function(b){
        return '<details class="prot-karte prot-rub" data-pdet="az_'+b+'"'+(protOffen["az_" + b] === true ? ' open' : '')+'><summary>'+esc(b)+'</summary>'+buch[b].join("")+'</details>';
      }).join("")+'</details>';
  }
  return az + html;
}
/* Favoriten unter dem Katalog: Katalog-Favoriten (Menge aus „Menge (g)“) und eigene Buttons aus Kombi und Eigener Button */
function protFavoritenHTML(menge){
  var kat = protDaten().favs.map(function(n){ return PROT_FOODS.filter(function(f){ return f[0] === n; })[0]; }).filter(Boolean);
  var kacheln = kat.map(function(f){
    var idx = PROT_FOODS.indexOf(f), g = menge > 0 ? menge : 100;
    return '<button type="button" class="prot-kn" data-pfav="'+idx+'"><b>'+esc(f[0])+'</b><small>'+g+' g</small><em>+'+Math.round(g * f[1] / 100)+' g</em></button>';
  }).concat(protKnoepfe().map(function(b){
    return '<button type="button" class="prot-kn" data-pbtn="'+esc(b.id)+'"><b>'+esc(b.n)+'</b><small>'+b.a+' g</small><em>+'+b.p+' g</em></button>';
  })).join("");
  return kacheln ? '<div class="prot-raster">'+kacheln+'</div>' : '<p class="prot-leer">'+esc(protT("favLeer"))+'</p>';
}
function renderProtein(){
  var p = protDaten(), heute = kalTagKey(Date.now()), eint = protTag(heute), summe = protSumme(eint);
  var kg = protKg(), lang = currentLang() === "en" ? "en-GB" : "de-DE", s = state.db.settings;
  var onboarding = !koerperDaten() && !p.spaeter;
  /* Wochenblick: die letzten sieben Tage, heute rechts */
  var tage = [], ziel = protZiel();
  for(var i = 6; i >= 0; i--){
    var k = kalTagKey(kalPlus(new Date(), -i)), e = protTag(k);
    tage.push({ key:k, sum:protSumme(e), n:e.length });
  }
  var max = Math.max.apply(null, [ziel, 1].concat(tage.map(function(x){ return x.sum; }))) * 1.1;
  var erfasst = tage.filter(function(x){ return x.n > 0; }), avg = erfasst.length ? Math.round(erfasst.reduce(function(a, x){ return a + x.sum; }, 0) / erfasst.length) : null;
  var bezug = protBezugKg(), avgKg = avg && bezug ? avg / bezug : null, hinweis = "";
  if(avgKg && avgKg > (protZielArt() === "ab" ? 2.7 : 2.2)) hinweis = '<div class="prot-tip">'+esc(protT("viel"))+'</div>';
  else if(avg && ziel && avg >= ziel * 0.95) hinweis = '<div class="prot-tip">'+esc(protT("ok"))+'</div>';
  else if(avg && ziel) hinweis = '<div class="prot-tip">'+esc(protT("fehlt", { g:ziel - avg }))+'</div>';
  var saeulen = tage.map(function(x){
    var d = kalTagDatum(x.key);
    return '<div class="prot-saeule"><div class="prot-s-bal'+(x.n ? '' : ' leer')+'" style="height:calc((100% - 22px) * '+(x.sum / max).toFixed(3)+')"></div>'+
      '<small>'+esc(d.toLocaleDateString(lang, { weekday:"short" }).replace(/\.$/, ""))+'</small></div>';
  }).join("");
  var linie = ziel ? '<div class="prot-ziel" style="bottom:calc(22px + (100% - 22px) * '+(ziel / max).toFixed(3)+')"></div>' : "";
  var vt = [0, 0, 0];
  eint.forEach(function(e){ var h = new Date(e.at).getHours(); vt[h < 11 ? 0 : h < 16 ? 1 : 2] += e.p; });
  var verteil = eint.length > 1 ? '<section class="prot-karte"><h3>'+esc(protT("verteilung"))+'</h3><div class="prot-verteil">'+
    ["morgens", "mittags", "abends"].map(function(k2, i2){ return '<div><b>'+vt[i2]+' g</b><small>'+esc(protT(k2))+'</small></div>'; }).join("")+'</div></section>' : "";
  var favHTML = protFavoritenHTML(protMengeMerk), katHTML = protKatalogHTML(protSuchText);
  var liste = eint.length ? eint.slice().reverse().map(function(e){
    return '<div class="prot-eintrag"><div class="prot-e-links"><b>'+esc(e.n)+'</b><small>'+protZeit(e.at)+(e.a ? ' · '+e.a+' g' : '')+'</small></div>'+
      '<div class="prot-e-rechts">'+e.p+' g <button type="button" class="prot-x" data-pdel="'+esc(e.id)+'" aria-label="'+esc(protT("loeschen"))+'">×</button></div></div>';
  }).join("") : '<p class="prot-leer">'+esc(protT("leer"))+'</p>';
  var stufen = [["basis", 0.83, "basisS"], ["training", 1.6, "trainS"], ["intensiv", 2, "intensivS"]].map(function(x){
    return '<button type="button" class="prot-stufe'+(protStufe() === x[1] ? ' an' : '')+'" data-pstufe="'+x[1]+'" aria-pressed="'+(protStufe() === x[1])+'">'+esc(protT(x[0]))+'<small>'+esc(protT(x[2]))+'</small></button>';
  }).join("");
  var proMahl = bezug ? '<p class="prot-hint-txt">'+esc(protT("proMahl"))+': '+Math.round(bezug * 0.25)+'–'+Math.round(bezug * 0.4)+' g</p>' : '';
  var profilForm = koerperFormHTML(s, { ohneName:true });
  var zielChips = '<h4>'+esc(protT("zielTitel"))+'</h4><div class="prot-stufen">'+[["ab", "zielAb"], ["halten", "zielHalten"], ["auf", "zielAuf"]].map(function(x){
    return '<button type="button" class="prot-stufe'+(protZielArt() === x[0] ? ' an' : '')+'" data-pziel="'+x[0]+'" aria-pressed="'+(protZielArt() === x[0])+'">'+esc(protT(x[1]))+'</button>';
  }).join("")+'</div>';
  var sonder = '<p class="prot-hint-txt" style="margin-top:12px">'+esc(protT("sonder"))+'</p>';
  var onb = onboarding
    ? '<section class="prot-karte prot-onb"><h3>'+esc(protT("onbTitel"))+'</h3><p class="prot-hint-txt">'+esc(protT("onbText"))+'</p>'+profilForm+zielChips+sonder+
      '<div class="prot-onb-knoepfe"><button type="button" class="prot-btn" data-ponbfertig>'+esc(protT("onbFertig"))+'</button>'+
      '<button type="button" class="prot-btn ghost" data-ponbspaeter>'+esc(protT("onbSpaeter"))+'</button></div></section>' : '';
  /* „Eigenes hinzufügen“ liegt in einem Sheet mit drei Formularen (Gramm · Eigener Button · Kombi), immer nur eines sichtbar */
  var eiGramm = '<p class="prot-hint-txt">'+esc(protT("manuellHint"))+'</p>'+
    '<div class="prot-form"><div class="voll"><label>'+esc(protT("name"))+'</label><input id="pManN" maxlength="40"></div>'+
    '<div><label>g</label><input id="pManG" type="number" inputmode="decimal" min="1" max="300" placeholder="25"></div>'+
    '<button type="button" class="prot-btn" data-pmanu>'+esc(protT("hinzu"))+'</button></div>';
  var eiEigen = '<p class="prot-hint-txt">'+esc(protT("eigenHint"))+'</p>'+
    '<div class="prot-form"><div class="voll"><label>'+esc(protT("name"))+'</label><input id="pEN" maxlength="40"></div>'+
    '<div><label>'+esc(protT("portion"))+'</label><input id="pEA" type="number" inputmode="decimal" placeholder="200"></div>'+
    '<div><label>'+esc(protT("je100"))+'</label><input id="pEP" type="number" inputmode="decimal" placeholder="12"></div>'+
    '<div class="voll prot-zeile-flex"><span class="prot-hint-txt" id="pEVor" style="margin:0">'+esc(protT("vorschau", { g:"–" }))+'</span>'+
    '<button type="button" class="prot-btn" data-peneu>'+esc(protT("anlegen"))+'</button></div></div>';
  var eiKombi = '<p class="prot-hint-txt">'+esc(protT("kombiHint"))+'</p>'+
    '<div class="prot-form"><div class="voll"><label>'+esc(protT("name"))+'</label><input id="pKN" maxlength="40"></div></div>'+
    (p.knoepfe.length
      ? '<p class="prot-hint-txt" style="margin:10px 0 6px">'+esc(protT("kombiWahl"))+'</p>'+
        '<div class="prot-stufen" style="grid-template-columns:repeat(2,1fr)">'+p.knoepfe.map(function(b){
          return '<button type="button" class="prot-stufe" data-pkc="'+esc(b.id)+'" aria-pressed="false">'+esc(b.n)+'<small>+'+b.p+' g</small></button>'; }).join("")+'</div>'+
        '<button type="button" class="prot-btn" data-pkombi>'+esc(protT("kombiAnlegen"))+'</button>'
      : '<p class="prot-leer">'+esc(protT("kombiLeer"))+'</p>');
  /* Reiter: Heute (Standard) · Woche · Bedarf; alle drei Bereiche werden immer gezeichnet, nur einer ist sichtbar (so finden die Handler unten alle Felder) */
  if(onboarding) protTab = "heute";
  var reiter = [["heute", protT("heute")], ["woche", protT("tabWoche")], ["bedarf", protT("tabBedarf")]];
  function panel(k){ return ' data-ppanel="'+k+'" role="tabpanel"'+(protTab === k ? '' : ' hidden'); }
  var woche = '<section class="prot-karte"><h3>'+esc(protT("woche"))+'</h3><div class="prot-wochen">'+saeulen+linie+'</div>'+
    '<div class="prot-schnitt"><span>'+esc(protT("schnitt"))+'</span>'+
    '<div class="prot-gross"><b>'+(avg ? avg : '–')+' g</b>'+(avgKg ? '<span>'+avgKg.toFixed(2).replace('.', ',')+' '+esc(protT("gkg"))+'</span>' : '')+'</div></div>'+hinweis+'</section>'+verteil;
  var bedarf = '<section class="prot-karte"><h3>'+esc(protT("koerper"))+'</h3>'+(onboarding ? '<p class="prot-hint-txt">'+esc(protT("bedarfOnb"))+'</p>' : profilForm)+'</section>'+
    '<section class="prot-karte">'+(onboarding ? '' : zielChips)+
      '<h4>'+esc(protT("stufeTitel"))+'</h4><div class="prot-stufen">'+stufen+'</div>'+proMahl+sonder+'</section>'+
    '<details class="prot-karte prot-info" data-pdet="info"'+(protOffen.info ? ' open' : '')+'><summary>'+esc(protT("info"))+'</summary>'+
      '<ul>'+protT("infoListe").map(function(z){ return '<li>'+esc(z)+'</li>'; }).join("")+'</ul><h4>'+esc(protT("quellenTitel"))+'</h4><ul>'+protT("quellen").map(function(z){ return '<li>'+esc(z)+'</li>'; }).join("")+'</ul></details>'+
    '<p class="prot-hint-txt prot-keine-beratung">'+esc(protT("keineBeratung"))+'</p>';
  app.innerHTML = topbar(protT("titel"), { back:"#training", right:kopfSymboleNeu("training") }) +
    '<div class="prot-seite">'+
      '<div class="seg-row prot-tabs" role="tablist" aria-label="'+esc(protT("titel"))+'">'+reiter.map(function(r){
        return '<button type="button" role="tab" data-ptab="'+r[0]+'" class="'+(protTab === r[0] ? 'active' : '')+'" aria-selected="'+(protTab === r[0])+'">'+esc(r[1])+'</button>'; }).join("")+'</div>'+
      '<div class="prot-panel"'+panel("heute")+'>'+
        onb+
        '<section class="prot-karte prot-heute" aria-label="'+esc(protT("heute"))+'">'+
          '<div class="prot-kopfzeile"><span class="prot-label">'+esc(protT("heute"))+'</span>'+
          '<button type="button" class="prot-rueck" data-prueck'+(eint.length ? '' : ' disabled')+'>'+esc(protT("rueck"))+'</button></div>'+
          '<div id="pKopf">'+protKopfHTML(summe)+'</div></section>'+
        '<section class="prot-karte prot-erfassen"><div class="prot-menge-zeile"><div class="prot-menge-feld"><label for="pFG">'+esc(protT("menge"))+'</label>'+
          '<input id="pFG" type="number" inputmode="decimal" value="'+protMengeMerk+'" min="1" max="2000"></div>'+
          '<button type="button" class="prot-btn ghost" data-peigenauf aria-haspopup="dialog">'+esc(protT("eigenBtn"))+'</button></div>'+
          '<h3>'+esc(protT("favoriten"))+'</h3>'+favHTML+'</section>'+
        '<details class="prot-karte prot-katalog" data-pdet="katalog"'+(protOffen.katalog === true ? ' open' : '')+'><summary>'+esc(protT("katalog"))+'</summary>'+
          '<p class="prot-hint-txt">'+esc(protT("katalogHint"))+'</p>'+
          '<div class="prot-form"><div class="voll"><label for="pSuche">'+esc(protT("suche"))+'</label><input id="pSuche" type="search" maxlength="40" placeholder="'+esc(protT("suchePh"))+'" value="'+esc(protSuchText)+'"></div></div>'+
          '<div id="pKat" style="margin-top:8px">'+(katHTML || '<p class="prot-leer">'+esc(protT("sucheLeer"))+'</p>')+'</div></details>'+
        '<section class="prot-karte"><h3>'+esc(protT("liste"))+'</h3>'+liste+'</section>'+
      '</div>'+
      '<div class="prot-panel"'+panel("woche")+'>'+woche+'</div>'+
      '<div class="prot-panel"'+panel("bedarf")+'>'+bedarf+'</div>'+
      '<div class="confirm-overlay prot-sheet" data-psheet hidden><div class="confirm-sheet" role="dialog" aria-modal="true" aria-label="'+esc(protT("eigenDetails"))+'">'+
        '<h3>'+esc(protT("eigenDetails"))+'</h3>'+
        '<div class="seg-row prot-sub" role="tablist">'+[["gramm", "subGramm"], ["eigen", "subEigen"], ["kombi", "subKombi"]].map(function(x, i){
          return '<button type="button" role="tab" data-psub="'+x[0]+'" class="'+(i ? '' : 'active')+'">'+esc(protT(x[1]))+'</button>'; }).join("")+'</div>'+
        '<div data-psubp="gramm">'+eiGramm+'</div><div data-psubp="eigen" hidden>'+eiEigen+'</div><div data-psubp="kombi" hidden>'+eiKombi+'</div>'+
        '<div class="btn-row"><button type="button" class="btn btn-secondary" data-peigenzu>'+esc(protT("schliessen"))+'</button></div>'+
      '</div></div>'+
    '</div>';
  bindCommon();
  function neu(){ var y = window.scrollY; renderProtein(); window.scrollTo(0, y); }
  /* Reiter wechseln, ohne neu zu zeichnen (Eingaben bleiben stehen) */
  app.querySelectorAll("[data-ptab]").forEach(function(b){
    b.addEventListener("click", function(){
      protTab = b.getAttribute("data-ptab");
      app.querySelectorAll("[data-ptab]").forEach(function(x){ var an = x === b; x.classList.toggle("active", an); x.setAttribute("aria-selected", an); });
      app.querySelectorAll("[data-ppanel]").forEach(function(pn){ pn.hidden = pn.getAttribute("data-ppanel") !== protTab; });
      window.scrollTo(0, 0);
    });
  });
  /* Sheet „Eigenes hinzufügen“ */
  var sheet = app.querySelector("[data-psheet]");
  function sheetZu(){ sheet.hidden = true; document.body.classList.remove("prot-sheet-offen"); }
  app.querySelector("[data-peigenauf]").addEventListener("click", function(){ sheet.hidden = false; document.body.classList.add("prot-sheet-offen"); });
  sheet.querySelector("[data-peigenzu]").addEventListener("click", sheetZu);
  sheet.addEventListener("click", function(e){ if(e.target === sheet) sheetZu(); });
  sheet.addEventListener("keydown", function(e){ if(e.key === "Escape") sheetZu(); });
  sheet.querySelectorAll("[data-psub]").forEach(function(b){
    b.addEventListener("click", function(){
      var k = b.getAttribute("data-psub");
      sheet.querySelectorAll("[data-psub]").forEach(function(x){ x.classList.toggle("active", x === b); });
      sheet.querySelectorAll("[data-psubp]").forEach(function(pn){ pn.hidden = pn.getAttribute("data-psubp") !== k; });
    });
  });
  app.querySelectorAll("[data-pdet]").forEach(function(d){ d.addEventListener("toggle", function(){ protOffen[d.getAttribute("data-pdet")] = d.open; }); });
  /* Körperdaten (Gewicht, Größe, Alter, Geschlecht, Aktivität): gemeinsam mit Fortschritt; nach jeder Änderung nur die Kopfkarte aktualisieren (Eingabe behält den Fokus) */
  koerperBinden(app);
  function kopfAktualisieren(){ var kopf = document.getElementById("pKopf"); if(kopf) kopf.innerHTML = protKopfHTML(protSumme(protTag(kalTagKey(Date.now())))); }
  app.querySelectorAll(".koerper-form input, .koerper-form button").forEach(function(el){
    el.addEventListener("change", function(){ setTimeout(kopfAktualisieren, 0); });
    el.addEventListener("click", function(){ setTimeout(kopfAktualisieren, 0); });
    el.addEventListener("blur", function(){ setTimeout(kopfAktualisieren, 0); });
  });
  var fertig = app.querySelector("[data-ponbfertig]");
  if(fertig) fertig.addEventListener("click", function(){
    var kg2 = parseFloat(String(document.getElementById("k-kg").value).replace(",", "."));
    if(!(kg2 >= 30 && kg2 <= 250)){ showToast(protT("onbFehl")); return; }
    document.getElementById("k-kg").dispatchEvent(new Event("change"));   // speichert alle Felder über koerperBinden
    neu();
  });
  var spaeter = app.querySelector("[data-ponbspaeter]");
  if(spaeter) spaeter.addEventListener("click", function(){ p.spaeter = true; save(); neu(); });
  app.querySelectorAll("[data-pbtn]").forEach(function(b){
    b.addEventListener("click", function(){
      var id = b.getAttribute("data-pbtn"), kn = protDaten().knoepfe.filter(function(x){ return x.id === id; })[0];
      if(!kn) return;
      kn.nutz = (kn.nutz || 0) + 1;
      protEintragen(kn.n, kn.p, kn.a);
      neu();
    });
    /* Lange drücken: Portionsfaktor ½ × / 1 × / 1,5 × / 2 × */
    langDruck(b, function(){
      var kn = protDaten().knoepfe.filter(function(x){ return x.id === b.getAttribute("data-pbtn"); })[0];
      if(!kn) return;
      openActionSheet(kn.n+" · "+protT("faktor"), [[0.5, "½"], [1, "1"], [1.5, "1,5"], [2, "2"]].map(function(f){
        return { ico:'<path d="M12 5v14M5 12h14"/>', label:f[1]+" × · +"+Math.round(kn.p * f[0])+" g", fn:function(){
          kn.nutz = (kn.nutz || 0) + 1; protEintragen(kn.n, kn.p * f[0], Math.round(kn.a * f[0])); neu(); } };
      }));
    });
  });
  /* Katalog: Tipp trägt die Menge aus „Menge (g)“ ein; der Stern setzt einen Favoriten (erscheint unter dem Katalog) */
  var fG = document.getElementById("pFG");
  if(fG) fG.addEventListener("change", function(){ var g = +fG.value; if(g > 0 && g <= 2000) protMengeMerk = g; });
  /* Suche: der Text liegt in protSuchText, weil neu() die Seite neu zeichnet; das Feld bleibt mit Cursor am Ende fokussiert */
  var sIn = document.getElementById("pSuche");
  if(sIn) sIn.addEventListener("input", function(){
    protSuchText = sIn.value;
    var y = window.scrollY; renderProtein(); window.scrollTo(0, y);
    var s2 = document.getElementById("pSuche");
    if(s2){ s2.focus({ preventScroll:true }); s2.setSelectionRange(s2.value.length, s2.value.length); }
  });
  app.querySelectorAll("[data-pfood]").forEach(function(b){
    b.addEventListener("click", function(){
      var f = PROT_FOODS[+b.getAttribute("data-pfood")], g = +fG.value;
      if(!f || !(g > 0 && g <= 2000)) return;
      protMengeMerk = g;
      protEintragen(f[0], g * f[1] / 100, Math.round(g));
      neu();
    });
  });
  app.querySelectorAll("[data-pstern]").forEach(function(b){
    b.addEventListener("click", function(e){
      e.stopPropagation();
      var f = PROT_FOODS[+b.getAttribute("data-pstern")];
      if(f){ protFavWechseln(f[0]); neu(); }
    });
  });
  /* Favoriten aus dem Katalog: ein Tipp trägt die Menge aus „Menge (g)“ ein */
  app.querySelectorAll("[data-pfav]").forEach(function(b){
    b.addEventListener("click", function(){
      var f = PROT_FOODS[+b.getAttribute("data-pfav")], g = +fG.value;
      if(!f || !(g > 0 && g <= 2000)) return;
      protMengeMerk = g;
      protEintragen(f[0], g * f[1] / 100, Math.round(g));
      neu();
    });
  });
  /* Kombi-Button: Summe mehrerer Buttons als ein neuer */
  app.querySelectorAll("[data-pkc]").forEach(function(b){
    b.addEventListener("click", function(){ var an = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", an); b.classList.toggle("an", an); });
  });
  var kombi = app.querySelector("[data-pkombi]");
  if(kombi) kombi.addEventListener("click", function(){
    var n = document.getElementById("pKN").value.trim(), ids = [];
    app.querySelectorAll("[data-pkc].an").forEach(function(b){ ids.push(b.getAttribute("data-pkc")); });
    if(!n || ids.length < 2){ showToast(protT("kombiFehl")); return; }
    var teile = protDaten().knoepfe.filter(function(x){ return ids.indexOf(x.id) > -1; });
    protDaten().knoepfe.unshift({ id:uid(), n:n, a:teile.reduce(function(sum, x){ return sum + x.a; }, 0), p:teile.reduce(function(sum, x){ return sum + x.p; }, 0), nutz:0 });
    save(); neu(); showToast(protT("angelegt"));
  });
  app.querySelectorAll("[data-pdel]").forEach(function(b){
    b.addEventListener("click", function(){
      var id = b.getAttribute("data-pdel"), p2 = protDaten(), k2 = kalTagKey(Date.now());
      p2.tage[k2] = (p2.tage[k2] || []).filter(function(e){ return e.id !== id; });
      save(); neu();
    });
  });
  var rueck = app.querySelector("[data-prueck]");
  if(rueck) rueck.addEventListener("click", function(){
    var p2 = protDaten(), k2 = kalTagKey(Date.now());
    if(p2.tage[k2] && p2.tage[k2].length){ p2.tage[k2].pop(); save(); neu(); }
  });
  var manu = app.querySelector("[data-pmanu]");
  if(manu) manu.addEventListener("click", function(){
    var g = +document.getElementById("pManG").value, n = document.getElementById("pManN").value.trim();
    if(!(g > 0 && g <= 300)) return;
    protEintragen(n || protT("manuellName"), g, 0);
    neu();
  });
  var eN = document.getElementById("pEN"), eA = document.getElementById("pEA"), eP = document.getElementById("pEP"), vor = document.getElementById("pEVor");
  function eVorschau(){ var a = +eA.value, per = +eP.value; vor.textContent = protT("vorschau", { g:(a > 0 && per > 0 ? Math.round(a * per / 100) : "–") }); }
  if(eA && eP){ eA.addEventListener("input", eVorschau); eP.addEventListener("input", eVorschau); }
  var neuB = app.querySelector("[data-peneu]");
  if(neuB) neuB.addEventListener("click", function(){
    var a = +eA.value, per = +eP.value, n = eN.value.trim();
    if(!n || !(a > 0) || !(per > 0)){ showToast(protT("fehlEingabe")); return; }
    protDaten().knoepfe.unshift({ id:uid(), n:n, a:Math.round(a), p:Math.round(a * per / 100), nutz:0 });
    save(); neu(); showToast(protT("angelegt"));
  });
  app.querySelectorAll("[data-pziel]").forEach(function(b){
    b.addEventListener("click", function(){ protDaten().ziel = b.getAttribute("data-pziel"); save(); neu(); });
  });
  app.querySelectorAll("[data-pstufe]").forEach(function(b){
    b.addEventListener("click", function(){ protDaten().stufe = +b.getAttribute("data-pstufe"); save(); neu(); });
  });
}
