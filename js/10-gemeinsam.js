"use strict";
/* ============ Install tip (iOS / Android) ============ */
function isStandalone(){
  return IST_NATIV || window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;   // die App selbst braucht keinen Installationshinweis
}
function isIOS(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
}
function isAndroid(){
  return /android/i.test(navigator.userAgent);
}
function installTipHTML(){
  if(isStandalone()) return "";
  if(localStorage.getItem("sporttimer-tip-hidden")==="1") return "";
  if(deferredInstallPrompt){
    return '<div class="installtip"><div><b>'+t("installTitle")+'</b><br>'+t("installText")+
      '<div style="margin-top:10px;"><button type="button" class="btn btn-primary" style="margin:0;width:auto;padding:11px 18px;font-size:14px;" data-install-now>'+ICON_DOWNLOAD+' '+t("installNow")+'</button></div></div>'+
      '<button data-hidetip>&times;</button></div>';
  }
  if(!isIOS() && !isAndroid()) return "";
  var txt = isIOS() ? t("tipIOS") : t("tipAndroid");
  return '<div class="installtip"><div>'+txt+' <a href="#install">'+t("viewGuide")+'</a></div>'+
    '<button data-hidetip>&times;</button></div>';
}
function maybeShowInstallTip(){}

/* ============ Common bindings ============ */
/* Dauerhafte Einzeiler für Bedienung, die man nicht sieht (langes Drücken): mit Finger-Symbol, per × dauerhaft ausblendbar (settings.tippAus) */
var ICON_TIPP = '<path d="M9 11V5a2 2 0 0 1 4 0v5M13 10V8a2 2 0 0 1 4 0v4M17 12v-1a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-3-5a2 2 0 0 1 3-2l2 2"/>';
function tippZeileHTML(key, textKey){
  return "";   // Tipp-Zeilen entfallen: weniger Text auf den Seiten
  var aus = state.db.settings.tippAus || {};
  if(aus[key]) return "";
  return '<div class="tipp-zeile" data-tipp="'+esc(key)+'">'+svgIcon(ICON_TIPP, "ico tipp-ico")+'<span>'+esc(t(textKey))+'</span>'+
    '<button type="button" class="tipp-x" data-tippx aria-label="'+esc(t("tippAus"))+'" title="'+esc(t("tippAus"))+'">&times;</button></div>';
}
function bindCommon(){
if(typeof pgFigurenFuellen === "function") pgFigurenFuellen(app);   // kleine Übungsfiguren auf Karten (Katalog) füllen
app.querySelectorAll("[data-tippx]").forEach(function(b){    b.addEventListener("click", function(){      var z = b.closest("[data-tipp]"), s = state.db.settings;      (s.tippAus || (s.tippAus = {}))[z.getAttribute("data-tipp")] = 1; save(); z.remove();    });  });
  app.querySelectorAll("[data-hinweis]").forEach(function(b){ b.addEventListener("click", openHinweise); });
  app.querySelectorAll("[data-myedit]").forEach(function(b){   // Stift an einer Karte unter Meine: ins Bearbeiten (die Karte selbst führt zum Deckblatt mit „Los geht’s“)
    b.addEventListener("click", function(ev){ ev.stopPropagation(); go("#mybuild/"+b.getAttribute("data-myedit")); });
  });
  app.querySelectorAll("[data-lupe]").forEach(function(b){
    b.addEventListener("click", function(){
      var pre = b.getAttribute("data-lupe"), w = app.querySelector('.lib-suche[data-lsw="'+pre+'"]'), q = app.querySelector("#"+pre+"-q");
      if(!w) return;
      if(w.classList.toggle("offen") && q) q.focus();
    });
  });
  app.querySelectorAll("[data-nav]").forEach(function(el){
    el.addEventListener("click", function(ev){
      if(ev.target.closest("[data-play]") || ev.target.closest("[data-playblock]") || ev.target.closest("[data-del]") || ev.target.closest("[data-twedit]")) return;
      go(el.getAttribute("data-nav"));
    });
  });
  var backBtn = app.querySelector("[data-back]");
  if(backBtn) backBtn.addEventListener("click", function(){
    goBack(backBtn.getAttribute("data-back"));
  });
  var tip = app.querySelector("[data-hidetip]");
  if(tip) tip.addEventListener("click", function(e){
    e.stopPropagation();
    localStorage.setItem("sporttimer-tip-hidden","1");
    render();
  });
  app.querySelectorAll("[data-install-now]").forEach(function(btn){
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      triggerInstall();
    });
  });
  app.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click", function(ev){
      ev.preventDefault();
      go(a.getAttribute("href"));
    });
  });
}

/* ============ Block list ============ */
function createBlock(){
  var b = { id:uid(), name:t("newBlock"), reps:6, workSec:30, restSec:10, updatedAt:Date.now() };
  neuEntwurf = { liste:"blocks", obj:b };
  return b;
}
/* ============ Block edit ============ */
function renderBlockEdit(id){
  var istNeu = !!entwurf("blocks", id);
  var b = findBlock(id) || entwurf("blocks", id);
  if(!b){ goBack("#intervall"); return; }
  app.innerHTML =
    topbar(t("editBlock"), { back:"#intervall" }) +
    '<div class="card">'+
      '<label for="f-name">'+t("name")+'</label>'+
      '<input type="text" id="f-name" value="'+esc(b.name)+'" maxlength="40">'+

      '<label>'+t("reps")+'</label>'+
      stepperHTML("f-reps", b.reps, 1, 99, 1) +

      '<label>'+t("workSec")+'</label>'+
      stepperHTML("f-work", b.workSec, 1, 3600, 5) +

      '<label>'+t("restSec")+'</label>'+
      stepperHTML("f-rest", b.restSec, 0, 3600, 5) +

      '<div class="section-title" style="margin:16px 4px 0;">'+t("total")+' <span id="f-total">'+fmtDuration(blockDuration(b))+'</span></div>'+
    '</div>'+
    '<button class="btn btn-primary" data-save>'+ICON_SAVE+' '+t("save")+'</button>'+
    '<button class="btn btn-danger" data-delete>'+ICON_TRASH+' '+t("deleteBlock")+'</button>';
  bindCommon();

  function refreshTotal(){
    var reps = parseInt(app.querySelector("#f-reps").value)||1;
    var work = parseInt(app.querySelector("#f-work").value)||0;
    var rest = parseInt(app.querySelector("#f-rest").value)||0;
    app.querySelector("#f-total").textContent = fmtDuration(reps*work + Math.max(0,reps-1)*rest);
  }
  function persist(){
    b.name = app.querySelector("#f-name").value.trim() || t("untitled");
    b.reps = clamp(parseInt(app.querySelector("#f-reps").value)||1, 1, 99);
    b.workSec = clamp(parseInt(app.querySelector("#f-work").value)||1, 1, 3600);
    b.restSec = clamp(parseInt(app.querySelector("#f-rest").value)||0, 0, 3600);
    b.updatedAt = Date.now();
    if(!istNeu) save();
    refreshTotal();
  }
  bindSteppers(app, persist);
  app.querySelector("#f-name").addEventListener("input", persist);
  app.querySelector("#f-name").addEventListener("blur", persist);

  /* Nach dem Speichern/Löschen zurück dorthin, woher man kam (Startseite, Blockliste oder Workout) */
  app.querySelector("[data-save]").addEventListener("click", function(){
    persist();
    entwurfSichern("blocks", b);
    goBack("#home");
  });

  app.querySelector("[data-delete]").addEventListener("click", function(){
    if(istNeu){ neuEntwurf = null; goBack("#home"); return; }   // noch nicht gespeichert: einfach verwerfen
    confirmSheet(t("deleteBlockQ"), t("deleteBlockText", { name:b.name }), t("del"), function(){
      deleteBlockNow(id);
      goBack("#home");
    });
  });
}

function clamp(v,min,max){ return Math.min(max, Math.max(min, v)); }

function stepperHTML(name, value, min, max, step){
  return '<div class="stepper" data-min="'+min+'" data-max="'+max+'" data-step="'+step+'">'+
    '<button type="button" data-dec>&minus;</button>'+
    '<input type="number" id="'+name+'" value="'+value+'" inputmode="numeric">'+
    '<button type="button" data-inc>&plus;</button>'+
    '</div>';
}
function bindSteppers(root, onChange){
  root.querySelectorAll(".stepper").forEach(function(st){
    var input = st.querySelector("input");
    var min = parseInt(st.getAttribute("data-min")), max = parseInt(st.getAttribute("data-max")), step = parseInt(st.getAttribute("data-step"));
    st.querySelector("[data-dec]").addEventListener("click", function(){
      input.value = clamp((parseInt(input.value)||0) - step, min, max);
      onChange();
    });
    st.querySelector("[data-inc]").addEventListener("click", function(){
      input.value = clamp((parseInt(input.value)||0) + step, min, max);
      onChange();
    });
    input.addEventListener("change", function(){
      input.value = clamp(parseInt(input.value)||min, min, max);
      onChange();
    });
    input.addEventListener("focus", function(){ input.select(); });
  });
}

/* ============ Workout edit ============ */
function renderWorkoutEdit(id){
  var istNeu = !!entwurf("workouts", id);
  var w = findWorkout(id) || entwurf("workouts", id);
  function save(){ if(!istNeu) speichereDB(); }   // Entwurf: erst „Speichern“ legt ihn an
  if(!w){ goBack("#intervall"); return; }

  var itemsHTML = w.items.map(function(it, idx){
    var b = findBlock(it.blockId);
    var name = b ? b.name : t("deletedBlock");
    var times = Math.max(1, Math.min(99, Math.round(+it.times) || 1));
    var sub = b ? (blockSpec(b)+' &middot; '+fmtDuration(blockDuration(b))) : "";
    /* Wie oft der Block hintereinander läuft („3 × Block A, 2 × Block B“); die Pause danach gilt auch zwischen den Wiederholungen */
    var wdh = '<div class="gap-row times-row"><label for="tm-'+idx+'">'+esc(t("blockTimes"))+'</label> <input type="number" id="tm-'+idx+'" inputmode="numeric" min="1" max="99" data-times="'+idx+'" value="'+times+'"> &times;</div>';
    var gap = "";
    if(idx < w.items.length-1 || times > 1){
      gap = '<div class="gap-row">'+t("restAfter")+' <input type="number" inputmode="numeric" data-gap="'+idx+'" value="'+(it.restAfterSec||0)+'"> '+t("sec")+'</div>';
    }
    return '<div class="wblock">'+
      '<div class="wblock-top">'+
        '<div class="meta"><div class="name">'+esc(name)+'</div><div class="sub">'+sub+'</div></div>'+
        '<div class="wblock-actions">'+
          '<button data-up="'+idx+'" '+(idx===0?'disabled':'')+'>&#8593;</button>'+
          '<button data-down="'+idx+'" '+(idx===w.items.length-1?'disabled':'')+'>&#8595;</button>'+
          '<button data-remove="'+idx+'">&times;</button>'+
        '</div>'+
      '</div>'+
      (b ? wdh : '')+gap+
    '</div>';
  }).join("");

  var pickerHTML = state.db.blocks.map(function(b){
    return '<div class="block-pick" data-addblock="'+b.id+'">'+
      '<div class="meta"><div class="name">'+esc(b.name)+'</div><div class="sub">'+blockSpec(b)+'</div></div>'+
      '<span class="chip">+</span></div>';
  }).join("") || '<div class="empty">'+t("noBlocksAvail")+' <br><a href="#blocks" style="color:var(--accent-ink, var(--accent))">'+t("createBlockFirst")+'</a></div>';

  var pickCat = state.db.settings.libPickCat || "all";
  if(pickCat === "stretch") pickCat = "all";
  var exPos = {};
  w.items.forEach(function(it, i){ var b = findBlock(it.blockId); if(b && b.ex) (exPos[b.ex] = exPos[b.ex] || []).push(i+1); });
  var libPickHTML = catChipsHTML(pickCat, "data-pickcat", ["stretch"]) +
    '<div class="fig-grid">'+EXERCISES.filter(function(ex){
      return fuerBau(ex) && !libHidden("ex:"+ex.id) && (pickCat==="all" || ex.cats.indexOf(pickCat) > -1);
    }).map(function(ex){
      return uebKachel({ bild:ex.id, name:tplText(ex.name), attr:'data-addex="'+ex.id+'"', cat:studioFarbe(ex), nr:exPos[ex.id] || [],
        unter:'<span class="st-sub">'+blockSpec(exBlock(ex))+'</span>' });
    }).join("")+'</div>';

  app.innerHTML =
    topbar(t("workout"), { back:"#intervall", right:istNeu ? '' : '<button class="iconbtn" data-play title="'+t("start")+'">'+ICON_PLAY+'</button>' }) +
    '<div class="card">'+
      '<label for="w-name">'+t("name")+'</label>'+
      '<input type="text" id="w-name" value="'+esc(w.name)+'" maxlength="40">'+
    '</div>'+
    '<div class="section-title">'+t("workoutBlocks", { n:w.items.length, d:fmtDuration(workoutDuration(w)) })+'</div>'+
    (itemsHTML || '<div class="empty">'+t("noBlocksInWorkout")+'</div>') +
    '<div class="section-title">'+t("addBlock")+'</div>'+
    pickerHTML +
    '<div class="section-title">'+t("addFromLibrary")+'</div>'+
    libPickHTML +
    '<button class="btn btn-primary" data-save>'+ICON_SAVE+' '+t("save")+'</button>'+
    '<button class="btn btn-danger" data-delete>'+ICON_TRASH+' '+t("deleteWorkout")+'</button>';

  bindCommon();

  app.querySelector("#w-name").addEventListener("input", function(){
    w.name = app.querySelector("#w-name").value.trim() || t("untitled");
    w.updatedAt = Date.now();
    save();
  });

  app.querySelectorAll("[data-pickcat]").forEach(function(el){
    el.addEventListener("click", function(){
      state.db.settings.libPickCat = el.getAttribute("data-pickcat");
      save();
      var y = window.scrollY;
      renderWorkoutEdit(id);
      window.scrollTo(0, y);
    });
  });
  kachelKlick(app, "[data-addex]", function(el){
    var ex = findExercise(el.getAttribute("data-addex"));
    if(!ex) return;
    if(exPos[ex.id]) w.items = w.items.filter(function(it){ var b = findBlock(it.blockId); return !(b && b.ex === ex.id); });   // nochmal = raus
    else w.items.push({ blockId: adoptExercise(ex, istNeu ? neuEntwurf.bloecke : null).id, restAfterSec: 30 });
    w.updatedAt = Date.now();
    save();
    var y = window.scrollY; renderWorkoutEdit(id); window.scrollTo(0, y);
  });
  app.querySelectorAll("[data-addblock]").forEach(function(el){
    el.addEventListener("click", function(){
      w.items.push({ blockId: el.getAttribute("data-addblock"), restAfterSec: 30 });
      w.updatedAt = Date.now();
      save();
      renderWorkoutEdit(id);
    });
  });
  app.querySelectorAll("[data-up]").forEach(function(el){
    el.addEventListener("click", function(){
      var i = parseInt(el.getAttribute("data-up"));
      if(i>0){ var tmp=w.items[i-1]; w.items[i-1]=w.items[i]; w.items[i]=tmp; save(); renderWorkoutEdit(id); }
    });
  });
  app.querySelectorAll("[data-down]").forEach(function(el){
    el.addEventListener("click", function(){
      var i = parseInt(el.getAttribute("data-down"));
      if(i<w.items.length-1){ var tmp=w.items[i+1]; w.items[i+1]=w.items[i]; w.items[i]=tmp; save(); renderWorkoutEdit(id); }
    });
  });
  app.querySelectorAll("[data-remove]").forEach(function(el){
    el.addEventListener("click", function(){
      var i = parseInt(el.getAttribute("data-remove"));
      w.items.splice(i,1); save(); renderWorkoutEdit(id);
    });
  });
  app.querySelectorAll("[data-times]").forEach(function(el){
    el.addEventListener("change", function(){
      var i = parseInt(el.getAttribute("data-times"));
      w.items[i].times = clamp(parseInt(el.value)||1, 1, 99);
      w.updatedAt = Date.now();
      save();
      var y = window.scrollY; renderWorkoutEdit(id); window.scrollTo(0, y);
    });
  });
  app.querySelectorAll("[data-gap]").forEach(function(el){
    el.addEventListener("change", function(){
      var i = parseInt(el.getAttribute("data-gap"));
      w.items[i].restAfterSec = clamp(parseInt(el.value)||0, 0, 3600);
      save();
      renderWorkoutEdit(id);
    });
  });
  var playBtn = app.querySelector("[data-play]");
  if(playBtn) playBtn.addEventListener("click", function(){
    if(!w.items.length) return;
    go("#play/"+w.id);
  });

  app.querySelector("[data-save]").addEventListener("click", function(){
    w.name = app.querySelector("#w-name").value.trim() || t("untitled");
    w.updatedAt = Date.now();
    entwurfSichern("workouts", w);
    goBack("#intervall");
  });

  app.querySelector("[data-delete]").addEventListener("click", function(){
    if(istNeu){ neuEntwurf = null; goBack("#intervall"); return; }
    confirmSheet(t("deleteWorkoutQ"), t("cantUndo"), t("del"), function(){
      deleteTimerWorkoutNow(id);
      goBack("#intervall");
    });
  });
}

/* Fertige Programme gehören zu Aufwärmen & Dehnen (Aufwärm- und Dehnprogramme) oder zur Workouts-Bibliothek */
function libIstWarmDehn(lw){ return !!lw && (lw.focus === "stretch" || AUFWAERM_IDS.indexOf(lw.id) > -1); }

/* ============ Favoriten ============ */
/* Schlüssel "lib:<id>" (fertiges Workout oder Dehnprogramm) bzw. "my:<id>" (eigenes Workout) */
function isFav(k){ return (state.db.settings.favs || []).indexOf(k) > -1; }
function toggleFav(k){
  var f = (state.db.settings.favs || []).slice(), i = f.indexOf(k);
  if(i > -1) f.splice(i, 1); else f.push(k);
  state.db.settings.favs = f; save();
  showToast(t(i > -1 ? "favRemoved" : "favAdded"));
}
function favBtn(k){
  var on = isFav(k);
  return '<button type="button" class="fav-btn'+(on?' on':'')+'" data-fav="'+k+'" aria-pressed="'+on+'" title="'+t("favorite")+'" aria-label="'+t("favorite")+'">'+(on?'\u2605':'\u2606')+'</button>';
}
/* Favoriten auf der Startseite als kompakte Kacheln (zwei nebeneinander).
   Reihenfolge: zuletzt gestartete zuerst (settings.favUsed), nie gestartete in der Reihenfolge
   des Markierens. Sichtbar sind höchstens FAV_LIMIT, der Rest per „Alle anzeigen“. */
var FAV_LIMIT = 4;
var favShowAll = false;
function favEntries(){
  var used = state.db.settings.favUsed || {}, out = [];
  (state.db.settings.favs || []).forEach(function(k, order){
    var kind = k.split(":")[0], id = k.slice(kind.length+1), e = null;
    if(kind==="tw"){
      var tw = findWorkout(id);
      if(tw) e = { name:tw.name || t("untitled"), sub:fmtDuration(workoutDuration(tw)), cls:"ti", go:"#play/"+id, ok:tw.items.length > 0 };
    } else if(kind==="bl"){
      var bl = findBlock(id);
      if(bl && state.db.blocks.indexOf(bl) > -1) e = { name:bl.name, sub:blockSpec(bl), cls:"ti", go:"#playblock/"+id, ok:true };
    } else if(kind==="lib"){
      var lw = findLibWorkout(id);
      if(lw) e = { name:tplText(lw.name), sub:fmtDuration(workoutDuration(libWorkoutRun(lw))), cls:libIstWarmDehn(lw) ? "ws" : "tp", cover:"lib/"+id, ok:true,
        ort:katWoOrt(lw.exercises.map(findExercise).filter(Boolean)), thema:workoutThema(lw.exercises, tplText(lw.name)) };   // „studio“, wenn eine Übung Geräte im Fitnessstudio braucht
    } else if(kind==="my"){
      var mw = findMy(id);
      if(mw) e = { name:mw.name, sub:fmtDuration(workoutDuration(myRun(mw))), cls:mw.ws ? "ws" : "tp", cover:"my/"+id, ok:mw.items.length > 0,
        ort:katWoOrt((mw.items || []).map(function(x){ return findExercise(typeof x === "string" ? x : x && x.ex); }).filter(Boolean)), thema:workoutThema(mw.items, mw.name) };
    } else if(kind==="prog"){   // Trainingsplan aus der Arena
      var pg = typeof programmFinde === "function" ? programmFinde(id) : null;
      if(pg) e = { name:pg.name, sub:pg.items.length === 1 ? t("progMeta1") : t("progMeta", { n:pg.items.length }), cls:"st", go:"prog:"+id, ok:pg.items.length > 0 };
    } else if(kind==="plan"){   // Studio › Mein Plan
      var pl = stPlanFind(id);
      if(pl) e = { name:pl.name, sub:planAnzahl(stPlanIds(pl).length), cls:"st", go:"#studioplan/"+id, ok:true };
    }
    if(e){ e.key = k; e.used = used[k] || 0; e.order = order; out.push(e); }
  });
  out.sort(function(a, b){ return (b.used - a.used) || (a.order - b.order); });
  return out;
}
/* Bild-Pool eines Favoriten nach Inhalt (Modern): Mobility → Dehnen, Timer → Halle, Studio → Studio, sonst nach der Muskelgruppe des Workouts (Bauch → Kettlebell/Core usw.) */
function favFotoPool(e){
  if(e.cls === "ws") return "mobility";
  if(e.cls === "ti") return "timer";
  if(e.cls === "tp" && e.ort === "studio") return "st";
  if(e.cls === "tp" && e.thema && e.thema !== "ganz") return e.thema;
  return e.cls;
}
/* Symbol der Glas-Kachel (Favorit ohne Foto): nach Art bzw. Muskelthema des Workouts */
function favSymbol(e){
  if(e.cls === "ti") return HOME_ICON.intervall;
  if(e.cls === "ws") return HOME_ICON.warm;
  var th = { brust:"brust", ruecken:"ruecken", schulter:"schulter", arme:"arme", core:"bauch", beine:"beine" }[e.thema];
  return th ? katIcon(th) : (e.cls === "st" || e.ort === "studio" ? KAT_ICON_STUDIO : HOME_ICON.timer);
}
function favItemsHTML(){
  var list = favEntries();
  if(!list.length) return "";
  var shown = favShowAll ? list : list.slice(0, FAV_LIMIT);
  // Fotokarten in einer Reihe zum Wischen (wie im Entwurf)
    var fotos = fotosZuteilen(list.map(function(e){ return { key:e.key || e.name, pool:favFotoPool(e) }; }));   // Fitnessstudio-Workouts bekommen Studio-Bilder, nicht die Calisthenics-Anlage   // kein Foto doppelt, solange es freie gibt
    var BEREICH = { ti:t("tabTimer"), ws:t("warmTitle"), tp:t("katalog"), st:t("katalog") };
    return '<div class="fav-fotos">'+shown.map(function(e){
      var mitFoto = /^lib\//.test(e.cover || "");   // Fotos nur für Workouts (BLOCs) aus dem Katalog; alles andere ist eine ruhige Glas-Kachel mit Name
      return '<div class="fav-foto'+(mitFoto ? '' : ' ohne')+'" data-art="'+e.cls+'" data-favkey="'+esc(e.key)+'" data-favname="'+esc(e.name)+'" role="button" tabindex="0" '+(e.cover ? 'data-favgo="'+e.cover+'"' : 'data-favstart="'+e.go+'"')+
          (e.ok ? '' : ' aria-disabled="true"')+(mitFoto ? ' style="background-image:url('+fotos[e.key || e.name]+')'+(fotoFokus(fotos[e.key || e.name]) ? ';background-position:'+fotoFokus(fotos[e.key || e.name]) : '')+'"' : '')+'>'+
        '<span class="ff-stern" aria-hidden="true">'+svgIcon(ICON_STAR)+'</span>'+
        (mitFoto ? '' : '<span class="ff-ico" aria-hidden="true">'+svgIcon(favSymbol(e))+'</span>')+
        '<span class="ff-text"><small class="ff-bereich">'+esc(BEREICH[e.cls] || "")+'</small><b class="ff-name">'+esc(e.name)+'</b><small class="ff-sub">'+e.sub+'</small></span>'+
      '</div>';
    }).join("")+'</div>';
}
/* merkt sich, wann ein Favorit zuletzt gestartet wurde (für die Reihenfolge auf der Startseite) */
function markFavUsed(source){
  var k = null;
  if(source.type==="workout") k = "tw:"+source.id;
  else if(source.type==="block") k = "bl:"+source.id;
  else if(source.type==="libworkout") k = "lib:"+source.id;
  else if(source.type==="mine") k = "my:"+source.id;
  else if(source.type==="draft" && coverDraft && /^(lib|my):/.test(coverDraft.key || "")) k = coverDraft.key;
  if(!k) return;
  var u = state.db.settings.favUsed || {};
  u[k] = Date.now();
  state.db.settings.favUsed = u;
}

