#!/usr/bin/env python3
"""Makety tří návrhů nového stromu dovedností (25. 11. 2026): A Tři cechy, B Deska podniku, C Kumpáni u stolu.
Použití: python3 tools/navrhy-strom.py docs/navrhy-skilly/strom-2/navrhy.html && node tools/navrhy-ui.mjs <html> <složka>
Jen obrázky k výběru, ve hře zatím nic není. Čísla odpovídají tools/sim/strom-navrhy.mjs."""
import base64, sys

OUT = sys.argv[1]
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
FONT = b64('node_modules/@fontsource/jersey-10/files/jersey-10-latin-400-normal.woff2')
FONT2 = b64('node_modules/@fontsource/jersey-10/files/jersey-10-latin-ext-400-normal.woff2')

CSS = '''
@font-face{font-family:J;src:url(data:font/woff2;base64,FONT1X) format('woff2');unicode-range:U+0000-00FF}
@font-face{font-family:J;src:url(data:font/woff2;base64,FONT2X) format('woff2');unicode-range:U+0100-024F}
:root{--ink:#2e222f;--dusk:#3e3546;--slate:#625565;--fog:#9babb2;--bone:#c7dcd0;--gold:#f9c22b;--amber:#f79617;--copper:#cd683d;
--sky:#4d9be6;--ice:#8fd3ff;--mint:#1ebc73;--green:#239063;--plum:#6b3e75;--sand:#fbb954;--scarlet:#e83b3b;--navy:#323353}
*{box-sizing:border-box}
body{margin:0;background:#1b151c;font-family:J,monospace;color:var(--bone);padding:24px;width:max-content}
.row{display:flex;gap:28px;margin-bottom:34px;align-items:flex-start}
.lab{width:260px;font-size:22px;line-height:1.15;color:var(--bone)}
.lab h2{font-size:46px;margin:0 0 6px;color:var(--gold);font-weight:400}
.lab p{margin:0 0 10px;color:var(--fog)}
.lab b{color:var(--sand);font-weight:400}
.cap{font-size:20px;color:var(--fog);text-align:center;margin-top:6px;width:405px}
.scr{width:405px;height:720px;background:#2a2030;border:3px solid var(--ink);border-radius:6px;position:relative;overflow:hidden;
 text-shadow:2px 0 var(--ink),-2px 0 var(--ink),0 2px var(--ink),0 -2px var(--ink)}
.top{height:50px;display:flex;align-items:center;justify-content:space-between;padding:0 10px;background:#352a3b;border-bottom:3px solid var(--gold)}
.pill{background:var(--plum);border:2px solid var(--ink);border-radius:10px;padding:4px 12px;font-size:20px}
.x{background:var(--scarlet);border:2px solid var(--ink);border-radius:8px;width:36px;height:32px;text-align:center;font-size:22px}
.ttl{color:var(--gold);font-size:26px}
.lvl{padding:6px 12px 0;display:flex;justify-content:space-between;align-items:center;font-size:21px;color:var(--gold)}
.bar{margin:4px 12px 0;height:8px;background:var(--dusk);border-radius:4px}.bar u{display:block;height:8px;background:var(--gold);border-radius:4px}
.tabs{display:flex;gap:5px;padding:8px 6px 0}
.tab{flex:1;text-align:center;font-size:19px;padding:7px 0;border-radius:9px;border:2px solid var(--ink);background:var(--plum);position:relative}
.tab.on{color:var(--ink);text-shadow:none}
.dot{position:absolute;right:-3px;top:-5px;width:14px;height:14px;border-radius:50%;background:var(--scarlet);border:3px solid var(--ink)}
.area{position:absolute;left:6px;right:6px;top:150px;bottom:130px;background:rgba(20,14,22,.55);border-radius:10px;overflow:hidden}
.panel{position:absolute;left:6px;right:6px;bottom:6px;height:118px;background:rgba(20,14,22,.75);border-radius:10px;padding:10px 12px}
.panel h3{margin:0;font-weight:400;font-size:25px;color:var(--gold)}
.panel p{margin:2px 0;font-size:18px;color:var(--fog);text-shadow:none;line-height:1.1}
.btn{position:absolute;right:12px;bottom:12px;background:var(--green);border:3px solid var(--ink);border-radius:10px;padding:8px 14px;font-size:22px;
 box-shadow:inset 0 -4px #165a4c}
.btn.off{background:var(--slate);box-shadow:inset 0 -4px #3e3546}
.btn.l{right:auto;left:12px;background:var(--plum);box-shadow:inset 0 -4px #4a2a52}
.tag{display:inline-block;font-size:15px;padding:0 6px;border-radius:6px;border:2px solid var(--ink);text-shadow:none;color:var(--ink);vertical-align:2px}
.t-a{background:var(--sand)}.t-p{background:var(--ice)}
/* A – patra */
.fl{position:absolute;left:8px;right:8px;height:52px;display:flex;align-items:center;gap:8px}
.fn{width:22px;font-size:17px;color:var(--fog);text-align:center}
.craft{flex:1;height:46px;border-radius:10px;border:3px solid var(--ink);display:flex;align-items:center;padding:0 8px;gap:8px;font-size:18px}
.pips{display:flex;gap:3px;margin-left:auto}.pips i{width:12px;height:12px;border:2px solid var(--ink);background:#3a3045;border-radius:3px}
.pips i.f{background:var(--gold)}
.ch{flex:1;height:48px;border-radius:10px;border:3px solid var(--ink);padding:2px 6px;font-size:16px;line-height:1.05;position:relative;overflow:hidden;white-space:nowrap}
.ch small{display:block;font-size:13px;margin-top:2px;color:var(--fog);text-shadow:none}
.nebo{font-size:14px;color:var(--fog);text-shadow:none}
.own{background:#8a5a1a}.own.c1{background:#7c3f26}.own.c2{background:#2f5f8f}
.can{background:#5d4f6b;box-shadow:0 0 0 3px var(--mint)}
.lock{background:#3a3045;color:#7d6d80}
.gone{background:#2c2433;color:#5d4f6b;text-decoration:line-through}
.sel{outline:3px solid #fff;outline-offset:2px}
.capn{flex:1;height:60px;border-radius:14px;border:3px solid var(--ink);background:#3a3045;display:flex;align-items:center;gap:10px;padding:0 10px;
 box-shadow:0 0 0 3px var(--gold);font-size:20px;color:var(--gold)}
.star{width:34px;height:34px;background:var(--gold);clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
.gate{position:absolute;left:30px;right:8px;border-top:2px dashed #7d6d80;font-size:14px;color:#9a8aa0;text-shadow:none;text-align:right;padding-top:1px}
.spine{position:absolute;left:19px;top:8px;bottom:8px;width:6px;background:#4a3f55;border-radius:3px}
/* B – deska */
.board{position:absolute;left:6px;right:6px;display:grid;grid-template-columns:repeat(7,1fr);gap:6px;padding:6px}
.tile{height:44px;border-radius:8px;border:3px solid var(--ink);display:flex;align-items:center;justify-content:center;font-size:15px;position:relative}
.tile.e{border:0;background:transparent}
.tile .c{position:absolute;right:2px;bottom:-1px;font-size:13px;color:var(--sand)}
.z0{background:#3d3226}.z1{background:#3b2a26}.z2{background:#26303f}
.tile.o0{background:var(--amber)}.tile.o1{background:var(--copper)}.tile.o2{background:var(--sky)}
.tile.gd{border-radius:50%;box-shadow:0 0 0 2px var(--gold)}
.tile.ky{transform:rotate(45deg) scale(.78);border-color:var(--ink);background:var(--plum);box-shadow:0 0 0 3px #c78ad6}
.tile.ky span{transform:rotate(-45deg)}
.tile.cr{background:#3a3045;box-shadow:0 0 0 3px var(--gold)}
.tile.av{box-shadow:0 0 0 3px var(--mint)}
.tile.hk{background:var(--gold)}
.lg{position:absolute;left:12px;right:12px;font-size:15px;display:flex;justify-content:space-between;color:var(--fog);text-shadow:none}
/* C – stůl a karty */
.table{position:absolute;left:10px;right:10px;top:150px;height:168px;border-radius:16px;background:#6b4325;border:3px solid var(--ink);
 box-shadow:inset 0 -8px #4c2f1b;padding:8px}
.table h4{margin:0 0 4px;font-weight:400;font-size:19px;color:var(--sand)}
.seats{display:flex;gap:6px}
.seat{width:57px;height:84px;border-radius:9px;border:3px solid var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:3px;font-size:13px;line-height:1}
.seat.em{background:rgba(0,0,0,.25);border-style:dashed;justify-content:center;font-size:26px;color:#a37a55}
.seat.lk{background:rgba(0,0,0,.35);border-style:dashed;justify-content:center;font-size:12px;color:#a37a55;text-align:center}
.face{width:34px;height:34px;border-radius:50%;border:3px solid var(--ink);margin-bottom:auto;margin-top:5px}
.k0{background:#8a5a1a}.k1{background:#7c3f26}.k2{background:#2f5f8f}
.f0{background:var(--sand)}.f1{background:var(--ochre,#e6904e)}.f2{background:var(--ice)}
.stars{color:var(--gold);font-size:12px;letter-spacing:-1px}
.stars s{color:#5d4f6b;text-decoration:none}
.party{font-size:16px;color:var(--bone);margin-top:6px}
.grid{position:absolute;left:10px;right:10px;top:364px;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.card{height:88px;border-radius:10px;border:3px solid var(--ink);display:flex;flex-direction:column;align-items:center;padding:3px;font-size:15px;line-height:1;position:relative}
.card .face{width:30px;height:30px;margin:2px 0 3px}
.card.lk{background:#2c2433;color:#6a5a6e}
.card .ut{position:absolute;left:3px;top:3px;font-size:11px;background:var(--mint);color:var(--ink);text-shadow:none;border-radius:4px;padding:0 3px}
.sub{position:absolute;left:10px;right:10px;top:328px;display:flex;gap:5px}
.sub .tab{font-size:16px;padding:4px 0}
.big{position:absolute;left:30px;right:30px;top:160px;height:400px;border-radius:16px;border:4px solid var(--ink);background:#8a5a1a;padding:14px}
.big .face{width:84px;height:84px;margin:0 auto 6px;display:block}
.big h3{margin:0;text-align:center;font-weight:400;font-size:30px;color:var(--gold)}
.big .lv{font-size:18px;margin:5px 0;color:var(--bone);text-shadow:none;background:rgba(0,0,0,.25);border-radius:6px;padding:3px 6px;line-height:1.1}
.big .lv.on{background:rgba(30,188,115,.35)}
.dim{position:absolute;inset:0;background:rgba(10,6,12,.6)}
.pop{position:absolute;left:24px;right:24px;top:120px;border-radius:14px;border:4px solid var(--ink);background:#3e3546;padding:16px;font-size:20px;line-height:1.15}
.pop h3{margin:0 0 8px;font-weight:400;font-size:32px;color:var(--gold);text-align:center}
.pop p{margin:6px 0;color:var(--bone);text-shadow:none}
'''.replace('FONT1X', FONT).replace('FONT2X', FONT2)


def frame(inner, tabs, on, color, level='Hostinský – úroveň 18', pts='body: 22  ?', extra=''):
    tb = ''.join(f'<div class="tab{" on" if i == on else ""}" style="{"background:" + color if i == on else ""}">{t}{"<i class=dot></i>" if d else ""}</div>' for i, (t, d) in enumerate(tabs))
    return f'''<div class="top"><span class="pill">← Menu</span><span class="ttl">Hostinský</span><span class="x">×</span></div>
<div class="lvl"><span>{level}</span><span class="pill" style="background:var(--green);font-size:18px">{pts}</span></div>
<div class="bar"><u style="width:46%"></u></div>{extra}<div class="tabs">{tb}</div>{inner}'''


def pips(n, k=5):
    return '<span class="pips">' + ''.join(f'<i class="{"f" if i < n else ""}"></i>' for i in range(k)) + '</span>'


# ---------------- A: Tři cechy ----------------
def fl_y(i):  # patro 1 dole
    return 370 - 66 + 8 - (i - 1) * 44 * 0 - (i - 1) * 0


def towerA(floors, cls):
    # floors: seznam HTML řádků zdola nahoru (8); vrchol nahoře, patra 7–1 pod ním
    out = '<div class="area" style="bottom:130px"><div class="spine"></div>'
    ys = [74 + (6 - i) * 52 for i in range(7)] + [6]
    for i, (row, gate) in enumerate(floors):
        out += f'<div class="fl" style="top:{ys[i]}px;{"height:62px" if i == 7 else ""}"><span class="fn">{i + 1}</span>{row}</div>'
    return out + '</div>'


def craft(name, n, st):
    c = 'own' + (' c1' if st == 1 else ' c2' if st == 2 else '') if n else 'can'
    return f'<div class="craft {c}">{name}{pips(n)}</div>'


def choice(a, b, sa, sb, ta='a', tb='p'):
    T = {'a': '<span class="tag t-a">ťukám</span>', 'p': '<span class="tag t-p">samo</span>'}
    return f'<div class="ch {sa}">{a[0]} {T[ta]}<small>{a[1]}</small></div><span class="nebo">nebo</span><div class="ch {sb}">{b[0]} {T[tb]}<small>{b[1]}</small></div>'


A1 = frame(towerA([
    (craft('Pípař · výdělek +0,5 %', 5, 0), ''),
    (choice(('Zlatá ruka', 'bublina 5 %: ×10 spropitné'), ('Spropitné samo', '1 bublina/min sama'), 'own', 'gone'), ''),
    (craft('Spropitné +0,9 %', 3, 0), ''),
    (choice(('Dlouhá hodina', 'Šťastná hodina 2× déle'), ('Uvítací hodina', 'po návratu hned nabitá'), 'can sel', 'can'), ''),
    ('<div class="craft lock">Dvojitý výdělek +0,3 %<span style="margin-left:auto;font-size:14px">zámek: 50 b. v cestě (máš 41)</span></div>', ''),
    (choice(('Plný podnos', 'číšníci +25 %'), ('Slavná hospoda', 'VIP 2× častěji'), 'lock', 'lock'), ''),
    ('<div class="craft lock">Výdělek +0,5 %<span style="margin-left:auto;font-size:14px">zámek: 100 b.</span></div>', ''),
    ('<div class="capn"><span class="star"></span><span>VRCHOL: Druhý manažer<br><small style="font-size:15px;color:var(--fog);text-shadow:none">Pivní smršť: stanice 2× rychleji 30 s · 140 b. v cestě</small></span></div>', ''),
], ''), [('Výčep', 1), ('Sklep', 1), ('Noc', 0), ('Mistrovství', 0)], 0, 'var(--amber)',
    extra='<div style="position:absolute;right:12px;top:58px;font-size:16px;color:var(--fog)"></div>') + \
    '''<div class="panel"><h3>Dlouhá hodina <span class="tag t-a">ťukám</span></h3>
<p>Šťastná hodina trvá 60 s místo 30 s.</p><p>Druhá možnost se zamkne<br>(změna = vrácení bodů).</p>
<div class="btn">VYBRAT · 14 b.</div></div>'''

A2 = frame(towerA([
    (craft('Sklepmistr · krígly +0,8 %', 5, 1), ''),
    (choice(('Rozjezd', '90 s po hygieně ×5 rychleji'), ('Dobrá pověst', 'po hygieně zůstane 5 % úr.'), 'gone', 'own c1'), ''),
    (craft('Stanice rychlejší +0,4 %', 5, 1), ''),
    (choice(('Druhý kotel', 'pivovar +50 %'), ('Velký tank', 'tank 2×, vaří i bez tebe'), 'gone', 'own c1'), ''),
    (craft('Vaření +0,9 %', 4, 1), ''),
    (choice(('Sudová loterie', 'zlatý sud: +1–3 krígly'), ('Zásobárna', 'start kola: 10 % coins'), 'own c1', 'gone'), ''),
    (craft('Obsluha levnější +0,9 %', 2, 1), ''),
    ('<div class="capn" style="background:#7c3f26;color:var(--ink);text-shadow:none"><span class="star" style="background:var(--ink)"></span><span>VRCHOL: Pivní dynastie<br><small style="font-size:15px">po hygieně stanice hned na 25. úrovni</small></span></div>', ''),
], ''), [('Výčep', 0), ('Sklep', 0), ('Noc', 1), ('Mistrovství', 0)], 1, 'var(--copper)', level='Hostinský – úroveň 47', pts='body: 9  ?',
    extra='<div style="position:absolute;left:12px;top:56px"></div>') + \
    '''<div class="panel"><h3>★ Koruna hostinského · 1 / 3 vrcholů</h3>
<p>Vrchol ve všech 3 cestách → <b style="color:var(--sand);font-weight:400">Legenda okresu</b>:<br>v jednom patře každé cesty obě volby naráz,<br>zlatý portrét a titul v lize.</p>
<div class="btn off">40 b.</div></div>'''

# ---------------- B: Deska podniku ----------------
MAP = ['R..R..R', 'o..o..o', 'Co.K.oC', 'o..o..o', 'oooCooo', 'K..o..K', 'o..o..o', 'Co.C.oC', 'o..o..o', 'ooKoKoo', 'C..o..C', 'o..C..o', 'ooooooo', '...S...']
MAP = MAP[::-1]
OWN = {(3, 0), (3, 1), (2, 1), (4, 1), (3, 2), (1, 1), (0, 1), (0, 2), (0, 3), (3, 3), (3, 4), (5, 1), (6, 1), (6, 2), (4, 4)}
GLYPH = {0: ['výd', 'spr', '×2'], 1: ['rych', 'kríg', 'var'], 2: ['kost', 'udál', 'noc']}
GUILD = {(3, 2): 'Spr. samo', (0, 3): 'Podnos', (6, 3): 'Kost. spr.', (0, 6): 'VIP 2×', (3, 6): 'Rozjezd', (6, 6): 'Kostňák', (3, 9): 'Kotel', (0, 11): 'Hod. 2×', (6, 11): 'Večery'}
KEY = {(2, 4): 'Rychlá kola', (4, 4): 'Pomalý večer', (0, 8): 'Rváči', (6, 8): 'Noční podnik', (3, 11): 'Hazard'}
CROWN = {(0, 13): 'Druhý man.', (3, 13): 'Dynastie', (6, 13): 'Pán noci'}


def avail(x, y, own):
    return (x, y) not in own and any((x + dx, y + dy) in own for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))


def boardB(rows, own, sel, top):
    out = f'<div class="board" style="top:{top}px">'
    k = 0
    for y in rows:
        for x in range(7):
            c = MAP[y][x]
            z = 0 if x < 2 else 2 if x > 4 else 1
            if c == '.':
                out += '<div class="tile e"></div>'
                continue
            cls = f'tile z{z}'
            txt = ''
            if c == 'S':
                cls += ' hk'; txt = '<span style="color:var(--ink);text-shadow:none">TY</span>'
            elif c == 'o':
                k += 1
                txt = GLYPH[z][(x + y) % 3]
                cls += f' o{z}' if (x, y) in own else ''
                if (x, y) not in own: txt += f'<span class="c">{2 + y}</span>'
            elif c == 'C':
                cls += ' gd' + (f' o{z}' if (x, y) in own else '')
                txt = f'<span style="font-size:12px;line-height:1;text-align:center">{GUILD[(x, y)]}</span>'
            elif c == 'K':
                cls += ' ky'
                txt = f'<span style="font-size:11px;line-height:1;text-align:center">{KEY[(x, y)]}</span>'
            elif c == 'R':
                cls += ' cr' + (' o0' if (x, y) in own else '')
                txt = f'<span style="font-size:12px;line-height:1;text-align:center;color:var(--gold)">★<br>{CROWN[(x, y)]}</span>'
            if avail(x, y, own) and c != 'S':
                cls += ' av'
            if (x, y) == sel:
                cls += ' sel'
            out += f'<div class="{cls}">{txt}</div>'
    return out + '</div>'


B1 = frame('<div class="area">' + '<div class="lg" style="top:6px"><span style="color:var(--amber)">◀ VÝČEP</span><span style="color:var(--copper)">SKLEP</span><span style="color:var(--sky)">NOC ▶</span></div>' +
           boardB(list(range(7, -1, -1)), OWN, (4, 4), 22) + '</div>', [('Deska', 1), ('Mistrovství', 0)], 0, 'var(--gold)', level='Hostinský – úroveň 18', pts='body: 22  ?') + \
    '''<div class="panel"><h3 style="color:#c78ad6">◆ Klíčový kámen: Pomalý večer</h3>
<p><span style="color:var(--mint)">+ offline výdělek +30 %</span><br><span style="color:var(--scarlet)">− stanice o 10 % pomalejší</span></p>
<p>Pro toho, kdo hraje málo.</p>
<div class="btn">KOUPIT · 12 b.</div></div>'''

OWN2 = OWN | {(0, 4), (0, 5), (0, 6), (0, 7), (0, 8), (0, 9), (0, 10), (0, 11), (0, 12), (0, 13), (1, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (1, 9), (2, 9), (1, 6)}
B2 = frame('<div class="area">' + boardB(list(range(13, 5, -1)), OWN2, (3, 13), 8) + '</div>', [('Deska', 0), ('Mistrovství', 0)], 0, 'var(--gold)', level='Hostinský – úroveň 52', pts='body: 41  ?') + \
    '''<div class="panel"><h3>★ Koruna Sklepa: Pivní dynastie</h3>
<p>Po hygieně začínají všechny stanice na 25. úrovni<br>a manažer je hned najatý.</p><p>Cesta středem přes Hazard, nebo bokem<br>přes spojku.</p>
<div class="btn off">50 b.</div></div>'''

# ---------------- C: Kumpáni u stolu ----------------
CARDS = [
    ('Franta', 'Spropitné samo', 0, 4), ('Božka', 'Plný podnos', 0, 3), ('Pan rada', 'VIP 2×', 0, 2), ('Pepa', 'Dlouhá hodina', 0, 1), ('Kuba', 'Zlatá ruka', 0, 0), ('Věra', 'Druhý manažer', 0, -1),
    ('Vašek', 'Rozjezd', 1, 2), ('Hostinská', 'Dobrá pověst', 1, 1), ('Ota', 'Druhý kotel', 1, 3), ('Bednář', 'Velký tank', 1, 0), ('Krígloun', 'Sudová loterie', 1, -1), ('Děda', 'Pivní dynastie', 1, -1),
    ('Ferda', 'Kostěné spr.', 2, 3), ('Kostňák', 'Hraje sám', 2, 1), ('Vědma', 'Talismany 2×', 2, 0), ('Bard', 'Pověstné večery', 2, 0), ('Lovec', 'Noční lov', 2, -1), ('Hraběnka', 'Pán noci', 2, -1),
]
SEAT = ['Franta', 'Božka', 'Ota', 'Ferda', 'Pan rada']


def stars(n):
    return '<span class="stars">' + '★' * n + '<s>' + '★' * (5 - n) + '</s></span>'


def seat(c):
    n, a, col, s = c
    return f'<div class="seat k{col}"><i class="face f{col}"></i><span>{n}</span>{stars(s)}</div>'


def cardC(c):
    n, a, col, s = c
    if s < 0:
        return f'<div class="card lk"><i class="face" style="background:#3a3045"></i><b style="font-weight:400">?</b><span style="font-size:12px;text-shadow:none">věrnost 2: {n}</span></div>'
    ut = '<span class="ut">u stolu</span>' if n in SEAT else ''
    st = stars(s) if s else '<span style="font-size:12px;color:var(--mint)">koupit 8 b.</span>'
    return f'<div class="card k{col}">{ut}<i class="face f{col}"></i><span>{n}</span><span style="font-size:12px;color:var(--bone);text-shadow:none;margin:2px 0">{a}</span>{st}</div>'


byname = {c[0]: c for c in CARDS}
tableC = '<div class="table"><h4>Stůl hostinského · 5 / 8 míst</h4><div class="seats">' + ''.join(seat(byname[n]) for n in SEAT) + \
    '<div class="seat lk">6. místo<br>260 b.</div></div><div class="party">Parta Výčepu 3/3: Šťastná hodina +10 s</div></div>'
C1 = frame(tableC + '<div class="sub"><div class="tab on" style="background:var(--amber)">Výčep</div><div class="tab">Sklep</div><div class="tab">Noc</div></div>' +
           '<div class="grid">' + ''.join(cardC(c) for c in CARDS[:6]) + '</div>', [('Kumpáni', 1), ('Mistrovství', 0)], 0, 'var(--gold)', pts='body: 22  ?') + \
    '''<div class="panel" style="height:120px"><h3>Pan rada · VIP 2× častěji</h3><p>Platí jen kumpáni u stolu.<br>Přesadit jde kdykoli.</p>
<div class="btn">VYLEPŠIT ★3 · 6 b.</div></div>'''

C2 = frame('<div class="big k0"><i class="face f0"></i><h3>Franta Výčepák</h3><div style="text-align:center;margin-bottom:6px">' + stars(4).replace('12px', '22px') + '</div>' +
           '<div class="lv on">★1 Spropitné samo: 1 bublina za minutu se obslouží sama</div>' +
           '<div class="lv on">★2 spropitné +0,8 %</div>' +
           '<div class="lv on">★3 schopnost silnější: 1 bublina za 40 s</div>' +
           '<div class="lv on">★4 spropitné +0,8 %</div>' +
           '<div class="lv">★5 1 bublina za 30 s a sbírá i noční kosti</div>' +
           '<div style="font-size:17px;color:var(--mint);margin-top:8px;text-shadow:none">Sedí u stolu (místo 1)</div></div>',
           [('Kumpáni', 0), ('Mistrovství', 0)], 0, 'var(--gold)', pts='body: 22  ?') + \
    '''<div class="panel" style="height:120px"><h3>Franta · ★5 za 13 b.</h3><p>Další kumpáni přisednou<br>z věrnosti hostů.</p>
<div class="btn l">VSTÁT OD STOLU</div><div class="btn">★5 · 13 b.</div></div>'''

# ---------------- přechod (společný) ----------------
P = frame('<div class="dim"></div><div class="pop"><h3>Nový strom hostinského!</h3>'
          '<p>Strom je přestavěný: méně uzlů, větší volby a schopnosti na konci cest.</p>'
          '<p style="color:var(--gold)">Všechny body máš zpátky: 214 b.</p>'
          '<p>Aby ti nic neubylo, výdělek ze starého stromu ti zůstane jako <span style="color:var(--sand)">Stará pověst +38 %</span>. Zmenšuje se, jak kupuješ nový strom, a nikdy tě nedá pod dnešek.</p>'
          '<div class="btn" style="position:static;display:block;text-align:center;margin-top:12px">ROZDĚLIT BODY</div></div>',
          [('Výčep', 1), ('Sklep', 1), ('Noc', 1), ('Mistrovství', 0)], 0, 'var(--amber)', level='Hostinský – úroveň 31', pts='body: 214  ?')


def lab(h, lines):
    return f'<div class="lab"><h2>{h}</h2>' + ''.join(f'<p>{l}</p>' for l in lines) + '</div>'


def scr(id_, html, cap):
    return f'<div><div class="scr" id="{id_}">{html}</div><div class="cap">{cap}</div></div>'


html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body data-prehled="prehled" data-crop="1">
<div class="row">{lab('A Tři cechy', ['3 cesty × 8 pater, <b>34 uzlů</b> místo 120.', 'Každé druhé patro <b>volba 1 ze 2</b>: „ťukám“ nebo „samo“.', 'Patro se otevře po bodech v cestě, nahoře <b>vrchol</b> se schopností, nad vším koruna.', 'Celá cesta na jednu obrazovku, bez posouvání.'])}
{scr('A1', A1, 'Výčep: volba ve 4. patře')}{scr('A2', A2, 'Sklep hotový, vrchol Pivní dynastie')}</div>
<div class="row">{lab('B Deska podniku', ['Jedna deska 7 sloupců: <b>55 dlaždic</b>, kupuje se vedle koupené.', '<b>9 cechů</b> se schopností, <b>5 klíčových kamenů</b> (výhoda za cenu), 3 koruny nahoře.', 'Spojky mezi Výčepem, Sklepem a Nocí → plánuješ cestu.', 'Posouvá se jen nahoru a dolů.'])}
{scr('B1', B1, 'Spodek desky, vybraný klíčový kámen')}{scr('B2', B2, 'Vršek desky: koruny')}</div>
<div class="row">{lab('C Kumpáni u stolu', ['<b>18 karet</b> kumpánů, každá ★1–★5: ★1 schopnost, další hvězdy +0,8 % a silnější schopnost.', 'U stolu sedí jen <b>3 až 8</b> (místa přibývají) → skládáš partu podle toho, jak hraješ.', 'Parta 3 stejné barvy = bonus. Noví kumpáni chodí z věrnosti hostů.'])}
{scr('C1', C1, 'Stůl a karty Výčepu')}{scr('C2', C2, 'Detail karty')}</div>
<div class="row">{lab('Přechod', ['Stejné u všech tří: body zpátky,', 'starý výdělek zůstane jako <b>Stará pověst</b>, dokud ho nový strom nedožene.'])}{scr('P', P, 'Po aktualizaci (jednou)')}</div>
</body></html>'''
open(OUT, 'w').write(html)
print('ok', OUT)
