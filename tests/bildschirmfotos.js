/* Formwert – Bildschirmfotos aller Hauptseiten mit Beispieldaten (Handygröße, dunkel und hell).
   Nur zum Anschauen von Design-Änderungen, kein Test:
       node tests/bildschirmfotos.js [ausgabeordner]
   Die Beispieldaten sind erfunden und landen nur im Testbrowser. */
"use strict";
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const APP = path.join(__dirname, "..", "app");
const OUT = process.argv[2] || path.join(__dirname, "..", "bildschirmfotos");
const TYPEN = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp",
  ".woff2": "font/woff2", ".txt": "text/plain", ".json": "application/json" };
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
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const PROFIL = { version: 3, age: 30, sex: "m", bodyweight: 85, restHr: 60, cooper: 0, mainEx: ["bench", "squat"], cardioPick: null,
  goals: { days: 4, mob: 2, cardio: 60 }, peaks: {}, startedAt: "2026-08-01" };

// Vier Wochen Push/Pull/Beine mit leichter Steigerung.
function beispielTage() {
  const plan = [
    [["bench", 70, 8], ["bench_inc_db", 26, 10], ["dips", 10, 10], ["ohp", 45, 8], ["fly_machine", 50, 12]],
    [["pullup", 5, 8], ["row_bb", 70, 8], ["curl_db", 14, 10]],
    [["squat", 95, 6], ["deadlift_rdl", 90, 8], ["legpress", 160, 10]],
  ];
  const tage = {}, heute = new Date();
  let k = 0;
  for (let back = 27; back >= 1; back--) {
    const d = new Date(heute); d.setDate(heute.getDate() - back);
    if ([0, 3].includes(d.getDay())) continue;
    if (back % 3 === 0) continue;
    const einheit = plan[k % 3], plus = Math.floor((27 - back) / 7) * 2.5; k++;
    const sets = [];
    let ts = d.getTime() - 3 * 3600e3;
    einheit.forEach(([ex, kg, reps]) => { for (let i = 0; i < 3; i++) { ts += 150e3; sets.push({ ex, kg: kg + plus, reps, ts }); } });
    tage[iso(d)] = { sets, cardio: [], workouts: [], mobility: back % 4 === 0, rest: false, note: "" };
  }
  return tage;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await server(), basis = "http://localhost:" + srv.address().port;
  const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
  const nur = (process.env.NUR || "").split(",").filter(Boolean);
  for (const schema of ["dark", "light"]) {
    if (nur.length && !nur.includes(schema)) continue;
    const ctx = await browser.newContext({ locale: "de-DE", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: schema, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    const fehler = [];
    page.on("pageerror", e => fehler.push(e.message));
    await page.goto(basis + "/index.html", { waitUntil: "commit" });
    await page.evaluate(([p, d, sch]) => { localStorage.clear(); localStorage.setItem("formwert-v3", JSON.stringify({ profile: p, days: d, routines: { r1: { id: "r1", name: "Push 1", ord: 0, items: [{ ex: "bench", sets: 3, kg: 72.5, reps: 8 }, { ex: "bench_inc_db", sets: 3, kg: 30, reps: 10 }, { ex: "dips", sets: 3, kg: 10, reps: 10 }, { ex: "ohp", sets: 3, kg: 45, reps: 8 }] }, r2: { id: "r2", name: "Pull 1", ord: 1, items: [{ ex: "pullup", sets: 3, kg: 5, reps: 8 }, { ex: "row_bb", sets: 3, kg: 70, reps: 8 }] } } })); localStorage.setItem("fw-theme", sch); },
      [PROFIL, beispielTage(), schema]);
    await page.reload({ waitUntil: "load", timeout: 120000 });
    await page.waitForTimeout(2500);
    const bild = async name => { await page.waitForTimeout(700); await page.screenshot({ path: path.join(OUT, schema + "-" + name + ".png"), timeout: 120000 }); };
    const tab = async id => { await page.evaluate(i => { const b = document.getElementById(i); if (b) b.click(); window.scrollTo(0, 0); }, id); };
    await bild("1-heute");
    await page.evaluate(() => window.scrollTo(0, 700)); await bild("1b-heute-unten");
    await tab("tab-koerper"); await page.waitForTimeout(1500); await bild("2-koerper");
    await tab("tab-training"); await bild("3-training");
    await tab("tab-raenge"); await bild("4-raenge");
    await page.evaluate(() => window.scrollTo(0, 700)); await bild("4b-raenge-unten");
    await tab("tab-werte"); await bild("5-du");
    await tab("tab-entdecken"); await bild("6-entdecken");
    await tab("tab-training");
    await page.evaluate(() => { startWorkout(); workout.exercises.push({ ex: "bench", restSec: 90, sets: [{ kg: 72.5, reps: 8, done: true }, { kg: 72.5, reps: 8, done: false }] }); woShape = null; renderSession(); });
    await bild("7-training-laeuft");
    await tab("tab-heute"); await bild("8-heute-mit-training");
    fs.writeFileSync(path.join(OUT, schema + "-fehler.txt"), fehler.join("\n"));
    await ctx.close();
  }
  await browser.close(); srv.close();
  console.log("fertig:", OUT);
})();
