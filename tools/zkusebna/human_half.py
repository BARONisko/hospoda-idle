#!/usr/bin/env python3
"""Zkušebna – lidská půlka pro P.U.B. Idle (zábava, tempo, nuda). Stačí Python 3, bez prohlížeče.

  score RUN      Přečte RUN/timeline.json (nováček), RUN/timeline_bezny.json, RUN/timeline_slaby.json (z tools/zkusebna/bot.mjs),
                 spočítá automatická kritéria z docs/zkusebna/kriteria.json (prahy jsou DATA tam), křivku zájmu, odhad minuty,
                 kdy skončí netrpělivý / běžný / trpělivý hráč, a připraví zadání pro hodnotitele: RUN/review/prompt.md
                 (postup docs/zkusebna/hodnotitel.md). Výsledek čísel: RUN/auto.json.
  merge RUN      Zkontroluje odpověď hodnotitele (RUN/review/hodnoceni.json): známka bez důkazu, který v záznamu existuje,
                 se zahodí; samé dvojky jsou podezřelé. Napíše RUN/lidska_cast.md a .json (tabulka, křivka, nejslabší místa,
                 rozdíl proti minulému běhu v docs/zkusebna/vysledky/posledni.json).
  calibrate RUN  Porovná bota s živými testery (docs/zkusebna/lide.json) a řekne, jak posunout čísla „human“ v kriteria.json.

Pravidla čísel (stejná jako u The Hole):
- Co se v dost dlouhém záznamu nestalo, je selhání, ne „neměřeno“.
- Bot vždy ví, co dělat: u „bot“: „fail_only“ jeho úspěch nic nedokazuje (neměřeno), jeho selhání je jisté selhání.
- Časy startu se přepočítávají na odhad pro člověka, který hru vidí poprvé (human.time_factor + discover_s).
"""
import json
import os
import re
import statistics
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DOCS = os.path.join(ROOT, "docs", "zkusebna")
CRITERIA = os.path.join(DOCS, "kriteria.json")
REVIEWER = os.path.join(DOCS, "hodnotitel.md")
PEOPLE = os.path.join(DOCS, "lide.json")
LAST = os.path.join(DOCS, "vysledky", "posledni.json")

BUYISH = ("buy", "staff", "unlock", "upgrade", "waiter")
PROGRESS = BUYISH + ("pub", "prestige", "quest", "ach", "level", "tab", "guest", "event", "tut", "offline")
SURPRISE = ("event_start", "event", "guest", "night", "day", "quest", "ach")
LABELS = {"buy": "nákup", "staff": "obsluha", "unlock": "nová stanice", "upgrade": "vylepšení", "waiter": "číšník", "pub": "nová hospoda",
          "prestige": "hygiena", "quest": "úkol", "ach": "úspěch", "level": "úroveň hostinského", "tab": "nová dlaždice menu",
          "guest": "nový host", "event": "událost zvládnutá", "event_start": "událost", "night": "noc", "day": "den", "offline": "návrat po pauze"}


def load(path):
    with open(path, encoding="utf-8") as fp:
        return json.load(fp)


def dump(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False, indent=1)


def kind(m):
    return m.get("kind") or ""


def base(m):
    return kind(m).split(":")[0]


def first_t(tl, k):
    for m in tl["marks"]:
        if kind(m) == "first:" + k:
            return m["t"]
    return None


def gaps(ts):
    return [b - a for a, b in zip(ts, ts[1:])]


def num(text, key):
    mm = re.search(key + r"=([-\d.e+]+)", text or "")
    return float(mm.group(1)) if mm else None


def sessions(tl):
    """Úseky, kdy hráč hraje (slabý hráč odchází: 'leave' … 'offline')."""
    out, start = [], 0.0
    for m in tl["marks"]:
        if kind(m) == "leave":
            out.append((start, m["t"]))
        elif kind(m) == "offline":
            start = m["t"]
    out.append((start, tl["seconds"]))
    return out


def play_gaps(times, tl, t0=0.0, t1=None):
    """Mezery mezi časy, jen uvnitř hraných úseků (pauza slabého hráče se nepočítá)."""
    t1 = tl["seconds"] if t1 is None else t1
    res = []
    for a, b in sessions(tl):
        a, b = max(a, t0), min(b, t1)
        if b <= a:
            continue
        pts = [a] + [t for t in times if a <= t <= b] + [b]
        res += gaps(pts)
    return res


def longest_unaffordable(tl):
    best, start, prev_t = 0.0, None, None
    for s in tl.get("samples", []):
        if prev_t is not None and s["t"] - prev_t > 60:  # pauza (hráč pryč)
            start = None
        if s.get("afford", 0) == 0:
            start = s["t"] if start is None else start
            best = max(best, s["t"] - start)
        else:
            start = None
        prev_t = s["t"]
    return best


# ---------------------------------------------------------------------------- měření

def measure(run):
    cfg = load(CRITERIA)
    human = cfg.get("human", {})
    f = human.get("time_factor", 1.0)
    disc = human.get("discover_s", {})
    nov = run.get("novacek")
    bez = run.get("bezny")
    sla = run.get("slaby")
    v, notes = {}, {}
    all_tl = [x for x in (nov, bez, sla) if x]

    # --- start (nováček, reálný čas bota → člověk)
    if nov:
        L = nov["seconds"]
        for name, k in (("first_tap_s", "coins"), ("first_buy_s", "buy"), ("first_staff_s", "staff"), ("tutorial_done_s", "tutorial_done")):
            b = first_t(nov, k)
            if b is None:
                v[name] = float(L)
                notes[name] = f"nikdy za {L:.0f} s záznamu"
                continue
            v[name] = b * f + disc.get(name, 0)
            notes[name] = f"bot {b:.0f} s → člověk asi {v[name]:.0f} s"
        prog = sorted(m["t"] for m in nov["marks"] if base(m) in PROGRESS or kind(m).startswith("first:"))
        win = min(900.0, L)
        g = play_gaps(prog, nov, 0, win)
        v["longest_no_progress_s"] = max(g) if g else None
        if g:
            pts = [0.0] + [t for t in prog if t <= win] + [win]
            i = gaps(pts).index(max(g)) if max(g) in gaps(pts) else 0
            notes["longest_no_progress_s"] = f"od {pts[i]:.0f}. s nováčka nic nového (bot čeká na coins; člověk by tu nejspíš ťukal na hosty)"
        buy, staff = first_t(nov, "buy"), first_t(nov, "staff")
        v["loop_ok_by_10min"] = int(buy is not None and buy * f <= 600) + int(staff is not None and staff * f + disc.get("first_staff_s", 0) <= 600) if L >= 600 else None

    # --- tempo (všechny záznamy, platí nejhorší)
    def buys(tl, t0=0, t1=None):
        t1 = tl["seconds"] if t1 is None else t1
        return [m for m in tl["marks"] if base(m) in BUYISH and t0 <= m["t"] <= t1 and (num(m.get("text"), "price") or 0) > 0]

    worst_max, meds = None, []
    for tl in all_tl:
        h1 = min(3600, tl["seconds"])
        bt = [m["t"] for m in buys(tl, 0, h1)]
        g = play_gaps(bt, tl, 0, h1)
        if g:
            worst_max = max(worst_max or 0, max(g))
            meds.append(statistics.median(g))
    v["buy_gap_max_h1_s"] = worst_max
    v["buy_gap_median_h1_s"] = max(meds) if meds else None
    ratios = []
    for tl in all_tl:
        lastp = {}
        for m in buys(tl):
            item = (m.get("text") or "").split(" level=")[0]
            pr = num(m.get("text"), "price")
            if item in lastp and lastp[item] > 0 and base(m) == "buy":
                r = pr / lastp[item]
                if 0.5 < r < 10:
                    ratios.append(r)
            lastp[item] = pr
    v["price_growth"] = statistics.median(ratios) if ratios else None
    notes["price_growth"] = f"{len(ratios)} dvojic nákupů po sobě (pozn.: bot kupuje po 1 úrovni, cena je odhadnutá z úbytku coins)"
    lu = [(longest_unaffordable(tl), tl["persona"]) for tl in all_tl if tl.get("samples")]
    if lu:
        v["longest_unaffordable_s"], who = max(lu)
        notes["longest_unaffordable_s"] = f"nejhorší má {who}; počítá se jen vybraná hospoda"
    # skoky ×2 za 5 min (běžný bot)
    if bez:
        S = (run.get("dlouhy") or bez)["samples"]
        hrs_src = (run.get("dlouhy") or bez)
        jumps, last_j = 0, -1e9
        for i, s in enumerate(S):
            for s2 in S[i + 1:]:
                if s2["t"] - s["t"] > 300:
                    break
                if s["rate"] > 0 and s2["rate"] >= 2 * s["rate"] and s2["t"] - last_j > 300 and s2["prestiges"] == s["prestiges"]:
                    jumps += 1
                    last_j = s2["t"]
                    break
        v["jumps_per_30min"] = jumps / (hrs_src["seconds"] / 1800)
        notes["jumps_per_30min"] = f"{jumps} skoků za {hrs_src['seconds'] / 60:.0f} min (bez skoků způsobených hygienou)"
        # nejlepší výdělek dosud (hygiena ho nesrazí) po hodinách
        hrs, best, prev = [], 0.0, None
        for h in range(1, int(hrs_src["seconds"] // 3600) + 1):
            best = max([best] + [s_["rate"] for s_ in S if s_["t"] < h * 3600])
            if prev:
                hrs.append(best / prev)
            prev = best if best > 0 else None
        v["income_growth_per_hour"] = statistics.median(hrs) if hrs else None
        notes["income_growth_per_hour"] = "nejlepší výdělek dosud, poměr hodina/hodina: " + ", ".join(f"{x:.2f}" for x in hrs)
    if nov:
        v["offers_max_30min"] = max((s.get("afford", 0) for tl in all_tl for s in tl["samples"] if s["t"] <= 1800), default=None)
    # --- návrat (slabý)
    if sla:
        vals, useful = [], None
        for m in sla["marks"]:
            if kind(m) == "leave":
                useful = num(m.get("text"), "useful")
            if kind(m) == "offline":
                c = num(m.get("text"), "coins")
                if c is not None and useful:
                    vals.append(c / useful)
        v["offline_return_value"] = min(vals) if vals else None
        notes["offline_return_value"] = "návraty: " + ", ".join(f"{x:.0f}×" for x in vals) + " (nejhorší platí; měřítko = medián cen posledních 5 nákupů před odchodem)"
        v["weak_longest_unaffordable_s"] = longest_unaffordable(sla)
    # --- objevování a nuda
    src = bez or nov
    if src:
        fts = sorted(m["t"] for m in src["marks"] if kind(m).startswith("first:"))
        lim = min(7200, src["seconds"])
        g = play_gaps([t for t in fts if t <= lim], src, 0, lim)
        v["new_thing_gap_max_s"] = max(g) if g else None
        if g:
            pts = [0.0] + [t for t in fts if t <= lim] + [lim]
            i = gaps(pts).index(max(g)) if max(g) in gaps(pts) else 0
            notes["new_thing_gap_max_s"] = f"od {pts[i] / 60:.0f}. do {(pts[i] + max(g)) / 60:.0f}. min běžného bota žádná nová věc (boti nechodí do Menu)"
        mech = [m["t"] for m in src["marks"] if kind(m).startswith("first:") and not kind(m).startswith(("first:coins", "first:buy", "first:guest", "first:event:", "first:tutorial_done"))]
        v["new_mechanics_per_5min_max"] = max((sum(1 for t in mech if w <= t < w + 300) for w in range(0, 1800, 60)), default=0)
        notes["new_mechanics_per_5min_max"] = "první ťuk, první nákup, noví hosté, konec návodu a druhy událostí (počítá se jen první událost) se nepočítají"
        sur = sorted(m["t"] for m in src["marks"] if base(m) in SURPRISE)
        g = play_gaps(sur, src)
        v["surprise_gap_max_s"] = max(g) if g else None
        g = play_gaps(sorted(m["t"] for m in src["marks"] if base(m) not in ("buy", "tut", "guide", "leave") ), src)
        v["routine_max_s"] = max(g) if g else None
        notes["routine_max_s"] = "rutina = jen další úrovně stanic (nákup úrovně rutinu nepřeruší)"
        third = src["seconds"] / 3
        def wait(t0, t1):
            bt = [m["t"] for m in buys(src, t0, t1)]
            g = play_gaps(bt, src, t0, t1)
            return statistics.median(g) if g else None
        a, b = wait(0, third), wait(2 * third, src["seconds"])
        v["grind_growth"] = b / a if a and b else None
        notes["grind_growth"] = f"medián čekání na nákup: první třetina {a or 0:.1f} s, poslední {b or 0:.1f} s"
        # D3: kdy přestanou novinky = poslední first:* v záznamu, pokud po něm záznam běží aspoň hodinu
        dl = run.get("dlouhy") or src
        fl = sorted(m["t"] for m in dl["marks"] if kind(m).startswith("first:") and not kind(m).startswith("first:guest"))
        lastf = fl[-1] if fl else 0
        if dl["seconds"] - lastf >= 3600:
            v["content_hours"] = lastf / 3600
            notes["content_hours"] = f"poslední novinka v {lastf / 60:.0f}. min, pak už jen opakování do konce záznamu ({dl['seconds'] / 3600:.1f} h; noví hosté se nepočítají)"
        else:
            v["content_hours"] = None
            notes["content_hours"] = f"novinky chodí až do konce záznamu ({dl['seconds'] / 3600:.1f} h): na rozhodnutí je potřeba delší bot"
    # --- hygiena
    def first_prestige(tl):
        t = first_t(tl, "prestige")
        return t / 60 if t is not None else None
    if bez:
        fp = first_prestige(bez)
        v["first_prestige_min"] = fp if fp is not None else bez["seconds"] / 60
        if fp is None:
            notes["first_prestige_min"] = "běžný bot hygienu za celý záznam neudělal"
        S = bez["samples"]
        pt = [m["t"] for m in bez["marks"] if kind(m) == "prestige"]
        if pt:
            before = [s["rate"] for s in S if s["t"] < pt[0] and s["prestiges"] == 0]
            target = max(before) if before else 0
            reach = next((s["t"] for s in S if s["t"] > pt[0] and s["rate"] >= target), None)
            run1 = pt[0]
            reach1 = next((s["t"] for s in S if s["rate"] >= target), None)
            if reach is not None and reach1:
                v["prestige_speedup"] = reach1 / max(1, reach - pt[0])
                notes["prestige_speedup"] = f"1. běh došel na {target:.0f}/s za {reach1 / 60:.0f} min, 2. běh za {(reach - pt[0]) / 60:.0f} min"
            else:
                v["prestige_speedup"] = 0.0
                notes["prestige_speedup"] = f"2. běh výdělek 1. běhu ({target:.0f}/s) do konce záznamu nedohnal"
        if sla:
            w = first_prestige(sla)
            ref = v.get("first_prestige_min")
            act = None
            if w is not None:
                act = sum(min(b, w * 60) - a for a, b in sessions(sla) if a < w * 60) / 60
            # počítá se odehraný čas (pauzy slabého hráče hru nezpomalují, jen kalendář)
            v["weak_vs_strong_prestige"] = (act if act is not None else sla["seconds"] / 60) / ref if ref else None
            notes["weak_vs_strong_prestige"] = (f"slabý {w:.0f} min od instalace (z toho hrál {act:.0f} min, zbytek pauzy), běžný {ref:.0f} min" if w is not None
                                                else f"slabý nikdy za {sla['seconds'] / 60:.0f} min, běžný {ref:.0f} min")
    return v, notes, cfg


def grade(c, val):
    if val is None:
        return None
    d, g, b = c["direction"], c.get("good"), c.get("bad")
    if d == "lower":
        return 2 if val <= g else 0 if val > b else 1
    if d == "higher":
        return 2 if val >= g else 0 if val < b else 1
    if d == "range":
        if g[0] <= val <= g[1]:
            return 2
        return 0 if (val < b[0] or val > b[1]) else 1
    return None


def curve(run, cfg):
    """Křivka zájmu po 5 min + minuta, kdy skončí hráč s danou trpělivostí."""
    bo = cfg["boredom"]
    W = bo["weights"]
    strong = bo.get("strong_weight", 2)
    src = run.get("bezny") or run.get("novacek")
    nov = run.get("novacek")
    marks = []
    if nov:
        marks += [m for m in nov["marks"] if m["t"] <= 900]
    marks += [m for m in src["marks"] if not nov or m["t"] > 900]
    def w(m):
        k = kind(m)
        if k.startswith("first:"):
            return W.get("first:*", 0) if not k.startswith(("first:buy", "first:coins")) else 0
        return W.get(base(m), 0)
    rows = []
    for a in range(0, int(src["seconds"]), 300):
        ms = [m for m in marks if a <= m["t"] < a + 300]
        rows.append({"min": a // 60, "score": sum(w(m) for m in ms), "what": sorted({LABELS.get(base(m), base(m)) for m in ms if w(m) >= strong})})
    strong_t = sorted(m["t"] for m in marks if w(m) >= strong)
    quits = {}
    for who, pat in bo["patience_s"].items():
        q = None
        pts = [0.0] + strong_t + [float(src["seconds"])]
        for x, y in zip(pts, pts[1:]):
            if y - x > pat:
                q = (x + pat) / 60
                break
        quits[who] = q
    return rows, quits


def load_run(run):
    out = {}
    for key, fn in (("novacek", "timeline.json"), ("bezny", "timeline_bezny.json"), ("slaby", "timeline_slaby.json"), ("dlouhy", "timeline_dlouhy.json")):
        pth = os.path.join(run, fn)
        if os.path.exists(pth):
            out[key] = load(pth)
    if not out:
        sys.exit(f"v {run} není žádná časová osa (spusť tools/zkusebna/bot.mjs)")
    return out


def fmt(val, unit=""):
    if val is None:
        return "–"
    if isinstance(val, float):
        val = f"{val:.2f}" if abs(val) < 10 else f"{val:.0f}"
    return f"{val} {unit}".strip()


def cmd_score(run):
    R = load_run(run)
    v, notes, cfg = measure(R)
    rows, quits = curve(R, cfg)
    table = []
    for c in cfg["criteria"]:
        if not c.get("auto"):
            continue
        val = v.get(c["metric"])
        sc = grade(c, val)
        if c.get("bot") == "fail_only" and sc == 2:
            sc, note = None, "bot prošel, o člověku to nic neříká (neměřeno)"
        else:
            note = notes.get(c["metric"], "")
        table.append({"code": c["code"], "name": c["name"], "metric": c["metric"], "value": val, "unit": c.get("unit", ""), "good": c.get("good"), "bad": c.get("bad"), "score": sc, "note": note})
    auto = {"metrics": v, "table": table, "curve": rows, "quit_min": quits,
            "runs": {k: {"seconds": t["seconds"], "real_s": t.get("real_s"), "marks": len(t["marks"]), "errors": t.get("errors", [])} for k, t in R.items()}}
    dump(os.path.join(run, "auto.json"), auto)
    # zadání pro hodnotitele
    shots = sorted(os.listdir(os.path.join(run, "shots"))) if os.path.isdir(os.path.join(run, "shots")) else []
    rev = [c for c in cfg["criteria"] if not c.get("auto")]
    L = ["# Zkušebna P.U.B. Idle – zadání pro hodnotitele", "",
         "Hra: P.U.B. Idle – Pajzl Tycoon, idle hra pro mobil na výšku (popis: PLAN.md v kořeni repa).",
         f"Záznam: složka `{run}`. Snímky jsou v `shots/` (405×720, telefon na výšku). Pořadí a čas (t v herních sekundách) je v názvu souboru.", "",
         "## Postup (závazný)", "", open(REVIEWER, encoding="utf-8").read(), "",
         "## Ohodnoť ty (kotvy 0 / 1 / 2)", ""]
    for c in rev:
        L.append(f"### {c['code']} – {c['name']} (podklad: {c.get('needs', 'shots')})")
        for k in ("0", "1", "2"):
            L.append(f"- **{k}**: {c['anchors'][k]}")
        L.append("")
    L += ["## Spočítaná čísla (nepřebírej je jako známky, slouží jako kontext)", "", "| Kód | Kritérium | Hodnota | Dobře | Špatně | Známka | Poznámka |", "|---|---|---|---|---|---|---|"]
    for r in table:
        L.append(f"| {r['code']} | {r['name']} | {fmt(r['value'], r['unit'])} | {r['good']} | {r['bad']} | {fmt(r['score'])} | {r['note']} |")
    L += ["", "## Křivka zájmu (běžný bot, prvních 15 min nováček; po 5 min)", "", "| minuta | body | co zaujme |", "|---|---|---|"]
    for r in rows:
        L.append(f"| {r['min']} | {r['score']} | {', '.join(r['what'])} |")
    L += ["", "Odhad konce podle trpělivosti (minuta, kdy hráč poprvé zažije delší úsek bez silné novinky): " +
          ", ".join(f"{cfg['boredom']['patience_names'].get(k, k)} {fmt(q)} min" for k, q in quits.items()), "",
          "## Časová osa (zkráceně: nákupy úrovní sečtené po minutách)", ""]
    for key, tl in R.items():
        L.append(f"### Bot {key} ({tl['seconds'] / 60:.0f} herních min)")
        per = {}
        for m in tl["marks"]:
            if base(m) == "buy":
                per[int(m["t"] // 60)] = per.get(int(m["t"] // 60), 0) + 1
        shown_min = set()
        for m in tl["marks"]:
            mi = int(m["t"] // 60)
            if base(m) == "buy":
                if mi not in shown_min:
                    shown_min.add(mi)
                    L.append(f"- t={m['t']:.0f} min {mi}: {per[mi]}× nákup úrovně")
                continue
            if base(m) in ("guide",):
                L.append(f"- t={m['t']:.0f} průvodce: {m.get('text', '')}")
                continue
            L.append(f"- t={m['t']:.0f} {kind(m)} {m.get('text') or ''}{'  [' + m['shot'] + ']' if m.get('shot') else ''}")
        L.append("")
    L += ["## Snímky", ""] + [f"- shots/{s}" for s in shots]
    L += ["", "## Odpověď", "", "Zapiš JSON do `review/hodnoceni.json` přesně ve tvaru z postupu výše."]
    os.makedirs(os.path.join(run, "review"), exist_ok=True)
    with open(os.path.join(run, "review", "prompt.md"), "w", encoding="utf-8") as fp:
        fp.write("\n".join(L))
    print(f"auto.json + review/prompt.md v {run}")
    for r in table:
        print(f"  {r['code']:4} {fmt(r['score']):2} {fmt(r['value'], r['unit']):>12}  {r['name']}")
    print("konec hráčů (min):", quits)


def cmd_merge(run):
    cfg = load(CRITERIA)
    auto = load(os.path.join(run, "auto.json"))
    rv = load(os.path.join(run, "review", "hodnoceni.json"))
    shots = set(os.listdir(os.path.join(run, "shots")))
    longest = max(x["seconds"] for x in auto["runs"].values())
    warn, kept = [], {}
    def ok_evidence(ev):
        if not ev:
            return False
        for s in re.findall(r"shots/([\w.-]+\.png)", ev):
            if s in shots:
                return True
        for t in re.findall(r"t=(\d+)", ev):
            if int(t) <= longest:
                return True
        return bool(re.search(r"(PLAN\.md|docs/|src/)", ev))
    rev_codes = {c["code"]: c for c in cfg["criteria"] if not c.get("auto")}
    for code, s in (rv.get("scores") or {}).items():
        if code not in rev_codes:
            warn.append(f"{code}: neznámé kritérium, zahozeno")
            continue
        sc = s.get("score")
        if sc is not None and not ok_evidence(s.get("evidence", "")):
            warn.append(f"{code}: známka {sc} bez dohledatelného důkazu → zahozena")
            sc = None
        if sc in (0, 1) and not s.get("proposal"):
            warn.append(f"{code}: známka {sc} bez návrhu změny")
        kept[code] = {**s, "score": sc}
    vals = [x["score"] for x in kept.values() if x["score"] is not None]
    if vals and all(x == 2 for x in vals):
        warn.append("samé dvojky: podezřelé, hodnotitel asi nebyl přísný")
    if len(rv.get("walkthrough", [])) < 8:
        warn.append(f"průchod snímky má jen {len(rv.get('walkthrough', []))} zastavení (má být aspoň 8)")
    allrows = []
    for c in cfg["criteria"]:
        if c.get("auto"):
            r = next(x for x in auto["table"] if x["code"] == c["code"])
            allrows.append({"code": c["code"], "name": c["name"], "score": r["score"], "value": fmt(r["value"], r["unit"]), "why": r["note"], "proposal": ""})
        else:
            s = kept.get(c["code"], {})
            allrows.append({"code": c["code"], "name": c["name"], "score": s.get("score"), "value": "hodnotitel", "why": s.get("evidence", "chybí"), "proposal": s.get("proposal", "")})
    have = [r for r in allrows if r["score"] is not None]
    pts, maxp = sum(r["score"] for r in have), 2 * len(have)
    prev = load(LAST) if os.path.exists(LAST) else None
    out = {"points": pts, "max": maxp, "rows": allrows, "quit_auto": auto["quit_min"], "quit_review": rv.get("quit"), "top10": rv.get("top10", []),
           "summary": rv.get("summary", ""), "walkthrough": rv.get("walkthrough", []), "warnings": warn, "curve": auto["curve"], "runs": auto["runs"]}
    dump(os.path.join(run, "lidska_cast.json"), out)
    L = [f"# Zkušebna P.U.B. Idle – lidská část", "", f"**{pts} z {maxp} bodů** ({len(have)} hodnocených kritérií, {len(allrows) - len(have)} neměřeno).", "",
         rv.get("summary", ""), ""]
    if prev:
        L.append(f"Minulý běh: {prev.get('points')} z {prev.get('max')} bodů.")
        pr = {r["code"]: r["score"] for r in prev.get("rows", [])}
        ch = [f"{r['code']} {pr.get(r['code'])}→{r['score']}" for r in allrows if pr.get(r["code"]) != r["score"]]
        if ch:
            L.append("Změny: " + ", ".join(ch))
        L.append("")
    if warn:
        L += ["## Kontrola hodnotitele", ""] + [f"- {w}" for w in warn] + [""]
    L += ["## Známky", "", "| Kód | Kritérium | Známka | Hodnota | Proč | Návrh |", "|---|---|---|---|---|---|"]
    for r in allrows:
        L.append(f"| {r['code']} | {r['name']} | {fmt(r['score'])} | {r['value']} | {str(r['why']).replace('|', '/')} | {str(r['proposal']).replace('|', '/')} |")
    L += ["", "## Kdy hráči skončí", "", "Odhad z čísel: " + ", ".join(f"{k} {fmt(q)} min" for k, q in auto["quit_min"].items())]
    for k, q in (rv.get("quit") or {}).items():
        L.append(f"- {k}: {fmt(q.get('min'))} min – {q.get('why', '')}")
    L += ["", "## Deset nejslabších míst", ""]
    for i, t in enumerate(rv.get("top10", []), 1):
        L.append(f"{i}. **{t.get('code')}** – {t.get('why')} → {t.get('proposal')} (asi {t.get('hours')} h)")
    with open(os.path.join(run, "lidska_cast.md"), "w", encoding="utf-8") as fp:
        fp.write("\n".join(L) + "\n")
    print(f"{pts} z {maxp} bodů → {run}/lidska_cast.md; varování: {len(warn)}")
    for w in warn:
        print("  ", w)


def cmd_calibrate(run):
    if not os.path.exists(PEOPLE):
        sys.exit("chybí docs/zkusebna/lide.json")
    people = [p for p in load(PEOPLE).get("testers", []) if not p.get("example")]
    if not people:
        sys.exit("v lide.json zatím nejsou žádní testeři (jen vzor)")
    R = load_run(run)
    cfg = load(CRITERIA)
    nov = R.get("novacek")
    for name, k in (("first_tap_s", "coins"), ("first_buy_s", "buy"), ("first_staff_s", "staff")):
        b = first_t(nov, k) if nov else None
        hs = [p[name] for p in people if p.get(name) is not None]
        if b and hs:
            print(f"{name}: bot {b:.0f} s, lidé medián {statistics.median(hs):.0f} s → time_factor by byl {statistics.median(hs) / max(1, b):.2f} (teď {cfg['human']['time_factor']})")
    bored = [p["bored_min"] for p in people if p.get("bored_min")]
    if bored:
        print(f"nuda u lidí: medián {statistics.median(bored)} min; posuň boredom.patience_s.usual, aby odhad seděl")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    {"score": cmd_score, "merge": cmd_merge, "calibrate": cmd_calibrate}[sys.argv[1]](sys.argv[2])
