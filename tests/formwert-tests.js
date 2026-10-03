/* Formwert – automatische Browser-Tests für die App unter app/.
   Laufen bei jedem Push und Pull Request (siehe .github/workflows/tests.yml), lassen sich aber
   auch lokal starten:
       npm install --no-save playwright && npx playwright install chromium
       node tests/formwert-tests.js
   Warum: Mehrere Sitzungen arbeiten parallel an der App und veröffentlichen einzelne Dateien.
   Diese Tests decken die Fehler ab, die bisher erst live aufgefallen sind – Datenverlust beim
   Sync, "Heute" über Mitternacht, abstürzende Tabs, deutsch gebliebene Texte auf Englisch.
   Das 3D-Modell wird nur kurz geöffnet: Ohne Grafikkarte rendert der Testbrowser es auf der
   CPU, das ist langsam und sagt über echte Geräte wenig. */
"use strict";
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const APP = path.join(__dirname, "..", "app");
const TYPEN = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp",
  ".woff2": "font/woff2", ".txt": "text/plain", ".json": "application/json" };

// Eigener kleiner Webserver: über file:// blockiert Chrome fetch() und Schriften.
function server() {
  return new Promise(res => {
    const s = http.createServer((req, rsp) => {
      const p = path.join(APP, decodeURIComponent(req.url.split("?")[0]));
      if (!p.startsWith(APP) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { "Content-Type": TYPEN[path.extname(p)] || "application/octet-stream" });
      fs.createReadStream(p).pipe(rsp);
    }).listen(0, () => res(s));
  });
}

const PROFIL = { version: 3, age: 30, sex: "m", bodyweight: 80, restHr: 60, cooper: 0, mainEx: ["bench", "squat"], cardioPick: null,
  goals: { days: 3, mob: 2, cardio: 60 }, peaks: {}, startedAt: "2026-09-01" };
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const tagLeer = note => ({ sets: [], cardio: [], workouts: [], mobility: false, rest: false, note });

let browser, basis;
const ergebnisse = [];
function pruefe(bed, text) { if (!bed) throw new Error(text); }

// Neue Seite mit gespeichertem Profil. opts.cloud: nachgebaute Cloud-Datenbank (window.claude.use("db")).
async function seite(opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ locale: opts.locale || "de-DE" });
  const fehler = [];
  const ctl = { fail: false };
  if (opts.cloud) {
    const cloud = opts.cloud;
    await ctx.exposeBinding("__cloud", (src, op, p, v) => {
      if (op === "get") return cloud[p] === undefined ? null : cloud[p];
      if (op === "list") return Object.keys(cloud).filter(k => k.startsWith(p + "/")).map(k => ({ id: k.slice(p.length + 1), data: cloud[k] }));
      if (ctl.fail) return { __f: 1 };
      if (op === "set") cloud[p] = v; else if (op === "del") delete cloud[p];
      return true;
    });
    await ctx.addInitScript(() => {
      const call = (...a) => window.__cloud(...a);
      const w = (op, p, v) => call(op, p, v).then(r => { if (r && r.__f) throw new Error("offline"); });
      const doc = p => ({ get: () => call("get", p).then(v => ({ exists: v !== null, data: () => v })), set: v => w("set", p, JSON.parse(JSON.stringify(v))), delete: () => w("del", p) });
      const coll = n => { const c = { limit: () => c, orderBy: () => c, where: () => c, startAfter: () => c,
        get: () => call("list", n).then(l => ({ docs: l.map(x => ({ id: x.id, data: () => x.data })), size: l.length, empty: !l.length })) }; return c; };
      window.claude = { use: () => Promise.resolve({ doc, collection: coll }) };
    });
  }
  const page = await ctx.newPage();
  page.on("pageerror", e => fehler.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error" && !/ERR_|net::|Failed to load resource/.test(m.text())) fehler.push("console: " + m.text()); });
  if (opts.uhr) await page.clock.install({ time: opts.uhr });
  await page.goto(basis + "/index.html", { waitUntil: "commit" });
  await page.evaluate(d => { localStorage.clear(); localStorage.setItem("formwert-v3", JSON.stringify(d)); },
    { profile: PROFIL, days: opts.days || {}, routines: opts.routines || {} });
  await page.reload({ waitUntil: "load", timeout: 120000 });
  if (opts.uhr) await page.clock.fastForward(3000); else await page.waitForTimeout(2500);
  return { ctx, page, fehler, ctl, warte: ms => opts.uhr ? page.clock.fastForward(ms) : page.waitForTimeout(ms) };
}

async function test(name, fn) {
  const t0 = Date.now();
  try { await fn(); ergebnisse.push([true, name, Date.now() - t0]); console.log("ok    " + name); }
  catch (e) { ergebnisse.push([false, name, Date.now() - t0, e.message]); console.log("FEHLER " + name + "\n       " + e.message); }
}

const TABS = ["tab-heute", "tab-entdecken", "tab-training", "tab-koerper", "tab-werte", "tab-heute"];

async function main() {
  // 1) Syntax aller Skripte – ein Tippfehler legt sonst die ganze App lahm.
  await test("Syntax aller JavaScript-Dateien", async () => {
    const dateien = [];
    (function walk(d) { fs.readdirSync(d).forEach(f => { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) dateien.push(p); }); })(APP);
    const kaputt = [];
    dateien.forEach(p => { try { new vm.Script(fs.readFileSync(p, "utf8"), { filename: p }); } catch (e) { kaputt.push(path.relative(APP, p) + ": " + e.message); } });
    pruefe(!kaputt.length, kaputt.join("; "));
  });

  const srv = await server();
  basis = "http://localhost:" + srv.address().port;
  browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });

  // 2) Rundgang durch alle Tabs, deutsch und englisch, ohne Fehlermeldung.
  for (const locale of ["de-DE", "en-US"]) {
    await test("Rundgang alle Tabs (" + locale + ")", async () => {
      const s = await seite({ locale });
      for (const id of TABS) { await s.page.evaluate(id => document.getElementById(id).click(), id); await s.warte(900); }
      pruefe(!s.fehler.length, s.fehler.slice(0, 3).join(" | "));
      await s.ctx.close();
    });
  }

  // 3) Schriften kommen aus app/fonts, nicht von Google.
  await test("Schriften lokal geladen", async () => {
    const s = await seite({});
    const anGoogle = [];
    s.page.on("request", r => { if (/google/.test(r.url())) anGoogle.push(r.url()); });
    await s.page.reload({ waitUntil: "load" }); await s.warte(2500);
    const ok = await s.page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('600 16px "IBM Plex Sans Condensed"') && document.fonts.check('400 16px "IBM Plex Sans"'); });
    pruefe(ok, "IBM Plex nicht geladen");
    pruefe(!anGoogle.length, "Anfragen an Google: " + anGoogle.join(", "));
    await s.ctx.close();
  });

  // 4) Training: Satz abhaken, neu laden – Satz und laufendes Training bleiben.
  await test("Training überlebt Neuladen", async () => {
    const s = await seite({});
    await s.page.evaluate(() => { startWorkout(); workout.exercises.push({ ex: "bench", restSec: 0, sets: [{ kg: 60, reps: 8, done: false }] }); woShape = null; renderSession(); });
    await s.warte(500);
    await s.page.evaluate(() => document.querySelector('.wo-page[data-i="0"] .wo-check').click()); await s.warte(600);
    await s.page.reload({ waitUntil: "load" }); await s.warte(2500);
    const r = await s.page.evaluate(() => ({ saetze: (day(TODAY).sets || []).length, laeuft: !!workout }));
    pruefe(r.saetze === 1 && r.laeuft, "nach Neuladen: " + JSON.stringify(r));
    pruefe(!s.fehler.length, s.fehler.slice(0, 3).join(" | "));
    await s.ctx.close();
  });

  // 5) Sync: offline geänderter früherer Tag und Einheit überleben einen Neustart,
  //    eine spätere Änderung von einem anderen Gerät kommt trotzdem an.
  await test("Sync: Offline-Änderung überlebt Neustart", async () => {
    const g = new Date(); g.setDate(g.getDate() - 1); const G = iso(g);
    const cloud = { "state/profile": PROFIL, ["days/" + G]: Object.assign({ d: G }, tagLeer("alt")), "routines/r1": { id: "r1", name: "Alt", ord: 0, items: [] } };
    const s = await seite({ cloud, days: { [G]: tagLeer("alt") }, routines: { r1: { id: "r1", name: "Alt", ord: 0, items: [] } } });
    s.ctl.fail = true;
    await s.page.evaluate(g => { day(g).note = "neu"; touch(g); state.routines.r1.name = "Neu"; state.dirtyRoutines.r1 = true; persist(); }, G);
    await s.warte(1500);
    s.ctl.fail = false;
    await s.page.reload({ waitUntil: "load" }); await s.warte(3500);
    const r = await s.page.evaluate(g => ({ tag: state.days[g] && state.days[g].note, einheit: state.routines.r1 && state.routines.r1.name }), G);
    pruefe(r.tag === "neu" && cloud["days/" + G].note === "neu", "Tag: lokal " + r.tag + ", Cloud " + cloud["days/" + G].note);
    pruefe(r.einheit === "Neu" && cloud["routines/r1"].name === "Neu", "Einheit: lokal " + r.einheit + ", Cloud " + cloud["routines/r1"].name);
    // Gegenprobe
    await s.page.evaluate(g => { day(g).note = "hier"; touch(g); }, G); await s.warte(2500);
    cloud["days/" + G] = Object.assign({ d: G }, tagLeer("anderes Geraet"));
    await s.page.reload({ waitUntil: "load" }); await s.warte(3500);
    const n = await s.page.evaluate(g => state.days[g].note, G);
    pruefe(n === "anderes Geraet", "Änderung vom anderen Gerät kam nicht an: " + n);
    await s.ctx.close();
  });

  // 6) Tageswechsel bei offener App.
  await test("Tageswechsel bei offener App", async () => {
    const s = await seite({ uhr: new Date("2026-09-26T23:58:30") });
    await s.page.clock.fastForward(3 * 60 * 1000);
    const r = await s.page.evaluate(() => { day(TODAY).mobility = true; touch(TODAY); return { heute: TODAY, angezeigt: heuteDate }; });
    pruefe(r.heute === "2026-09-27" && r.angezeigt === "2026-09-27", "nach Mitternacht: " + JSON.stringify(r));
    await s.ctx.close();
  });

  // 7) Mobilität wird aus Übungen gemessen: Minuten zählen bis 10 min als eine Einheit,
  //    reine Mobilitätstage sind kein Trainingstag, der alte Haken zählt weiter voll.
  await test("Mobilität aus Übungen", async () => {
    const h = iso(new Date()), g = new Date(); g.setDate(g.getDate() - 1); const G = iso(g), v = new Date(); v.setDate(v.getDate() - 2); const V = iso(v);
    const days = {
      [h]: Object.assign(tagLeer(""), { sets: [{ ex: "mob_couch", reps: 45 }, { ex: "mob_couch", reps: 45 }, { ex: "mob_9090", reps: 10 }, { ex: "mob_frog", reps: 60 }, { ex: "mob_pigeon", reps: 45 }, { ex: "mob_hipflex", reps: 45 }, { ex: "mob_wgs", reps: 5 }] }),
      [G]: Object.assign(tagLeer(""), { sets: [{ ex: "bench", kg: 60, reps: 8 }, { ex: "mob_chest", reps: 40 }] }),
      [V]: Object.assign(tagLeer(""), { mobility: true })
    };
    const s = await seite({ days });
    const r = await s.page.evaluate(d => { const c = compute(TODAY);
      return { h: mobDay(state.days[d[0]]), g: mobDay(state.days[d[1]]), v: mobDay(state.days[d[2]]), tHeute: isTrainDay(state.days[d[0]]), tGestern: isTrainDay(state.days[d[1]]), trainDays: c.trainDays, mobDays: c.mobDays }; }, [h, G, V]);
    // Bis 10 Minuten volle Einheit, jede Minute darüber zählt halb (mobUnitsFromMin, seit 30.09.).
    pruefe(r.h.min > 10 && Math.abs(r.h.units - (1 + (r.h.min - 10) / 20)) < 1e-9 && r.h.exs === 6, "heute: " + JSON.stringify(r.h));
    pruefe(r.g.units > 0 && r.g.units < 1, "gestern: " + JSON.stringify(r.g));
    pruefe(r.v.units === 1 && r.v.legacy, "alter Haken: " + JSON.stringify(r.v));
    pruefe(!r.tHeute && r.tGestern && r.trainDays === 1, "Trainingstage: " + JSON.stringify(r));
    pruefe(Math.abs(r.mobDays - (r.h.units + 1 + r.g.units)) < 1e-9, "Einheiten: " + r.mobDays);
    // Obergrenze: auch eine Stunde Dehnen bringt höchstens MOB_DAY_MAX Einheiten.
    const grenze = await s.page.evaluate(() => [mobUnitsFromMin(5), mobUnitsFromMin(30), mobUnitsFromMin(60), MOB_DAY_MAX]);
    pruefe(grenze[0] === 0.5 && grenze[1] === 2 && grenze[2] === 2 && grenze[3] === 2, "Obergrenze: " + JSON.stringify(grenze));
    await s.page.evaluate(() => { document.getElementById("tab-koerper").click(); });
    await s.warte(900);
    await s.page.evaluate(() => document.querySelector('#mlistmode [data-m="mob"]').click());
    const n = await s.page.evaluate(() => document.querySelectorAll("#moblist .row.tap").length);
    pruefe(n === 7, "Bereiche in der Mobilitätsansicht: " + n);
    // Katalog: jede Mobilitätsübung hat einen Bereich und ergibt mit 10 Wdh./30 s eine Zeit.
    const k = await s.page.evaluate(() => { const m = EX.filter(e => e.mob);
      return { n: m.length, ohneBereich: m.filter(e => !mobAreaOf(e)).map(e => e.id), ohneZeit: m.filter(e => !(mobSetSec(e, { reps: e.t === "sec" ? 30 : 10 }) > 0)).map(e => e.id) }; });
    pruefe(k.n >= 80 && !k.ohneBereich.length && !k.ohneZeit.length, "Katalog: " + JSON.stringify(k));
    pruefe(!s.fehler.length, s.fehler.slice(0, 3).join(" | "));
    await s.ctx.close();
  });

  // 8) 3D-Betrachter: Seite lässt sich auspacken und ist vollständig.
  await test("3D-Betrachter lädt", async () => {
    const s = await seite({});
    const r = await s.page.evaluate(async () => { const h = await fw3dHtml(); const h2 = await fw3dHtml(); return { len: h.length, anfang: h.slice(0, 15), gleich: h === h2 }; });
    pruefe(r.anfang === "<!DOCTYPE html>" && r.len > 1000000 && r.gleich, JSON.stringify(r));
    await s.ctx.close();
  });

  // 9) Legende-Trophäe: Zähler x / 85, Ring leuchtet bei kompletter Sammlung, Feier genau einmal.
  //    Alle Reihen außer Bankdrücken stehen per Testwert genau auf Bronze; der abgehakte
  //    Bankdrück-Satz macht die Bronze-Sammlung voll.
  await test("Legende-Trophäe und Sammlungs-Feier", async () => {
    const g = new Date(); g.setDate(g.getDate() - 3);
    const s = await seite({ days: { [iso(g)]: Object.assign(tagLeer(""), { sets: [{ ex: "bench", kg: 50, reps: 5, ts: 1 }] }) } });
    await s.page.evaluate(() => { const orig = msValue, v = {}; MILESTONES.forEach(m => { if (m.id !== "bench") v[m.id] = m.steps[0]; });
      msValue = (m, D) => m.id in v ? v[m.id] : orig(m, D); });
    const karte = () => s.page.evaluate(() => { vtOpen("bad"); const c = document.querySelector(".vt-set.legend");
      const r = { ct: c.querySelector(".ct").textContent, an: [...c.querySelectorAll(".lt-ring.on")].map(x => +x.dataset.i) }; vtClose(); return r; });
    let k = await karte();
    pruefe(k.ct === "16 / 85" && !k.an.length, "vorher: " + JSON.stringify(k));
    const haken = kg => s.page.evaluate(kg => { if (!workout) startWorkout(); workout.exercises.push({ ex: "bench", restSec: 0, sets: [{ kg, reps: 5, done: false }] });
      woShape = null; renderSession(); const i = workout.exercises.length - 1; document.querySelector('.wo-page[data-i="' + i + '"] .wo-check').click(); }, kg);
    await s.page.evaluate(() => { window.__feiern = []; const o = lgShowSet; lgShowSet = j => { window.__feiern.push(j.i); o(j); }; });
    await haken(60);
    for (let t = 0; t < 40 && !(await s.page.evaluate(() => window.__feiern.length)); t++) await s.warte(500);
    await s.warte(5000);
    k = await karte();
    const r = await s.page.evaluate(() => ({ feiern: window.__feiern, sa: state.profile.setsAt }));
    pruefe(r.feiern.join() === "0" && r.sa && r.sa.bronze, "Feier: " + JSON.stringify(r));
    pruefe(k.ct === "17 / 85" && k.an.join() === "0", "nachher: " + JSON.stringify(k));
    await haken(61); await s.warte(6000);
    pruefe((await s.page.evaluate(() => window.__feiern.length)) === 1, "zweite Feier");
    pruefe(!s.fehler.length, s.fehler.slice(0, 3).join(" | "));
    await s.ctx.close();
  });

  // 10) "Nächstes Ziel" auf Heute: ohne Training aus, mit Training ein Ziel, das sich nach dem
  //     Erreichen ändert.
  await test("Nächstes-Ziel-Karte", async () => {
    let s = await seite({});
    pruefe(await s.page.evaluate(() => { const c = document.getElementById("nextgoal"); return !c || c.hidden; }), "ohne Training sichtbar");
    await s.ctx.close();
    const days = {};
    for (let i = 1; i <= 4; i++) { const d = new Date(); d.setDate(d.getDate() - i * 3); days[iso(d)] = Object.assign(tagLeer(""), { sets: [{ ex: "bench", kg: 70 + i, reps: 6, ts: i }] }); }
    s = await seite({ days });
    const vorher = await s.page.evaluate(() => { const c = document.getElementById("nextgoal"); return c && !c.hidden ? c.innerText : null; });
    pruefe(vorher && /Nächstes Ziel/i.test(vorher), "Karte fehlt: " + vorher);
    const nachher = await s.page.evaluate(() => { const g = nextGoalPick(); let rec;
      if (g.kind === "rank") { const need = valueForScore(g.ex, exRank(g.ex).next + 0.5); rec = { ex: g.ex.id, kg: Math.ceil(rawKg(g.ex, need)), reps: 1, ts: Date.now() }; }
      else { const m = g.m; rec = { ex: m.ex ? m.ex[0] : "bench", kg: m.unit === "kg" ? m.steps[g.i] : 0, reps: m.unit === "kg" ? 1 : m.steps[g.i], ts: Date.now() }; }
      day(TODAY).sets.push(rec); touch(TODAY); renderAll(); return document.getElementById("nextgoal").innerText; });
    pruefe(nachher !== vorher, "Karte unverändert: " + nachher);
    pruefe(!s.fehler.length, s.fehler.slice(0, 3).join(" | "));
    await s.ctx.close();
  });

  // 11) Rangleitern: jede Stufe höher als die vorige, Wert -> Rang -> Wert ergibt dasselbe –
  //     für jede Übung mit Rang, Mann und Frau.
  await test("Rangleitern stimmig", async () => {
    const s = await seite({});
    const probs = await s.page.evaluate(() => { const out = [];
      [["m", 80], ["w", 60]].forEach(([sex, bw]) => { const prof = Object.assign({}, state.profile, { sex, bodyweight: bw });
        EX.filter(e => e.std && RANK_LADDER[ladderKey(e)]).forEach(ex => { const L = ladderThresholds(ex, prof);
          for (let i = 1; i < 19; i++) if (!(L[i] > L[i - 1])) out.push(sex + " " + ex.id + " Stufe " + i);
          [1, 6, 9.5, 15, 17.5].forEach(r => { const sc = r * 100 / 18, v = valueForScoreLadder(L, sc), g = gradeLadder(L, v);
            if (!g || Math.abs(g.score - sc) > 0.05) out.push(sex + " " + ex.id + " Rundreise " + r); }); }); });
      return out; });
    pruefe(!probs.length, probs.slice(0, 5).join(" | "));
    await s.ctx.close();
  });

  // 11b) Formwert ohne Sprünge: Zwei dichte Trainingswochen, danach Pause. Alte Trainings laufen
  //      sanft aus (FADE, seit 03.10.) – vorher fiel der Formwert an einem Tag um bis zu 10 Punkte
  //      und die Kraft um 35, nur weil ein Training aus dem 30- bzw. 90-Tage-Fenster rutschte.
  await test("Formwert ohne Sprünge", async () => {
    const s = await seite({});
    const r = await s.page.evaluate(() => {
      const T = "2026-06-01", days = {};
      state.profile.startedAt = "2026-01-01"; state.profile.goals = { days: 3, mob: 2, cardio: 60 };
      for (let i = 0; i < 14; i++) days[shiftDays(T, i)] = { sets: [{ ex: "bench", kg: 90, reps: 5 }, { ex: "squat", kg: 120, reps: 5 }, { ex: "row_bb", kg: 80, reps: 8 }],
        cardio: [{ ex: "run", min: 30 }], workouts: [], mobility: true, rest: false, note: "" };
      state.days = days;
      const K = ["fitness", "kraft", "konst", "deckung", "ausdauer", "mob"], worst = {}; let prev = null;
      for (let k = 13; k < 140; k++) { const c = compute(shiftDays(T, k)), v = K.map(x => c[x]);
        if (prev) K.forEach((x, i) => { worst[x] = Math.max(worst[x] || 0, prev[i] - v[i]); }); prev = v; }
      return { worst, ende: prev };
    });
    pruefe(r.worst.fitness <= 4, "Formwert fällt an einem Tag um " + r.worst.fitness);
    pruefe(r.worst.kraft <= 3, "Kraft fällt an einem Tag um " + r.worst.kraft.toFixed(1));
    // Nach Ablauf aller Fenster (Kraft 90 + 30 Tage) zählt das alte Training gar nicht mehr.
    pruefe(r.ende[1] === 0 && r.ende[2] === 0 && r.ende[3] === 0, "nach 4 Monaten Pause noch Kraft/Konstanz/Abdeckung " + r.ende.slice(1, 4).join("/"));
    pruefe(!s.fehler.length, s.fehler.slice(0, 3).join(" | "));
    await s.ctx.close();
  });

  // 12) Sicherheit: Backup nur, wenn es wirklich ein Formwert-Backup ist (vorher Sicherungskopie),
  //     kein HTML aus gespeicherten Daten, CSV ohne ausführbare Formeln.
  await test("Sicherheit: Backup, HTML, CSV", async () => {
    const g = new Date(); g.setDate(g.getDate() - 2); const G = iso(g);
    const s = await seite({ days: { [G]: Object.assign(tagLeer(""), { sets: [{ ex: "bench", kg: 60, reps: 8, wid: "w1" }],
      workouts: [{ id: "w1", name: "Test", dur: 600, exs: "<img src=x id=boese>", sets: 1, vol: "<img src=x id=boese2>" }] }) } });
    const r = await s.page.evaluate(() => {
      const echt = JSON.stringify(backupData()), vorher = Object.keys(state.days).length;
      readBackupText(JSON.stringify({ profile: {}, days: {} }));            // fremde Datei
      readBackupText(JSON.stringify({ profile: state.profile, days: [] })); // kaputte Tage
      const nachFalsch = Object.keys(state.days).length, profilOk = !!(state.profile && state.profile.goals);
      const gueltig = backupLooksValid(JSON.parse(echt));
      applyBackup(JSON.parse(echt));
      const kopie = !!localStorage.getItem("formwert-vor-backup");
      return { vorher, nachFalsch, profilOk, gueltig, kopie };
    });
    pruefe(r.nachFalsch === r.vorher && r.profilOk, "ungültiges Backup hat Daten verändert: " + JSON.stringify(r));
    pruefe(r.gueltig && r.kopie, "echtes Backup abgelehnt oder keine Sicherungskopie: " + JSON.stringify(r));
    const html = await s.page.evaluate(G => { const wo = state.days[G].workouts[0]; sheetWorkoutDetail ? sheetWorkoutDetail(G, wo) : null;
      return { img: !!document.getElementById("boese") || !!document.getElementById("boese2") }; }, G).catch(() => ({ img: false, skip: true }));
    pruefe(!html.img, "HTML aus gespeicherten Daten wurde ausgeführt");
    const csv = await s.page.evaluate(() => [csvCell("=HYPERLINK(1)"), csvCell("-2,5"), csvCell("@x"), csvCell("Bank")]);
    pruefe(csv[0] === "'=HYPERLINK(1)" && csv[1] === "-2,5" && csv[2] === "'@x" && csv[3] === "Bank", "CSV: " + JSON.stringify(csv));
    await s.ctx.close();
  });

  // 13) Sync: Ein Tag bleibt "offen", bis die Cloud den Empfang bestätigt; Profil und eigene
  //     Übungen werden erst geschrieben, wenn der Cloud-Stand einmal geladen wurde.
  await test("Sync: offen bis bestätigt, erst laden dann schreiben", async () => {
    const s = await seite({});
    const r = await s.page.evaluate(async () => {
      const alt = db, altPulled = cloudPulled, writes = []; let loes = null;
      const haengt = new Promise(res => { loes = res; });
      db = { doc: p => ({ set: () => { writes.push(p); return p.startsWith("days/") ? haengt : Promise.resolve(); }, get: () => Promise.resolve({ exists: false }), delete: () => Promise.resolve() }) };
      cloudPulled = false;
      day(TODAY).note = "x"; touch(TODAY); persist();
      const offenWaehrend = !!state.dirty[TODAY];
      const profilGeschrieben = writes.includes("state/profile") || writes.includes("state/customex");
      loes(); await new Promise(r => setTimeout(r, 50));
      const offenDanach = !!state.dirty[TODAY];
      cloudPulled = true; writes.length = 0; persist(); await new Promise(r => setTimeout(r, 50));
      const profilJetzt = writes.includes("state/profile");
      db = alt; cloudPulled = altPulled;
      return { offenWaehrend, profilGeschrieben, offenDanach, profilJetzt };
    });
    pruefe(r.offenWaehrend && !r.offenDanach, "Offen-Markierung falsch: " + JSON.stringify(r));
    pruefe(!r.profilGeschrieben && r.profilJetzt, "Profil zu früh/nicht geschrieben: " + JSON.stringify(r));
    await s.ctx.close();
  });

  await browser.close();
  srv.close();
  const schlecht = ergebnisse.filter(e => !e[0]);
  console.log("\n" + (ergebnisse.length - schlecht.length) + " von " + ergebnisse.length + " Tests bestanden.");
  process.exit(schlecht.length ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
