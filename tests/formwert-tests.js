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

  // 7) 3D-Betrachter: Seite lässt sich auspacken und ist vollständig.
  await test("3D-Betrachter lädt", async () => {
    const s = await seite({});
    const r = await s.page.evaluate(async () => { const h = await fw3dHtml(); const h2 = await fw3dHtml(); return { len: h.length, anfang: h.slice(0, 15), gleich: h === h2 }; });
    pruefe(r.anfang === "<!DOCTYPE html>" && r.len > 1000000 && r.gleich, JSON.stringify(r));
    await s.ctx.close();
  });

  await browser.close();
  srv.close();
  const schlecht = ergebnisse.filter(e => !e[0]);
  console.log("\n" + (ergebnisse.length - schlecht.length) + " von " + ergebnisse.length + " Tests bestanden.");
  process.exit(schlecht.length ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
