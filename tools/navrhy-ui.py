#!/usr/bin/env python3
"""Makety nového UI (hospoda 70, přání uživatele: 5 návrhů). Skládá HTML z výřezu hospody a spritů hry;
obrázky z něj udělá tools/navrhy-ui.mjs. Použití: python3 tools/navrhy-ui.py <složka s podklady> <out.html>
Podklady: pub.png (čistý výřez hospody 810×606) a složka spr/ (sprity vyvezené ze hry)."""
import base64, sys
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
FONT = b64('node_modules/@fontsource/jersey-10/files/jersey-10-latin-400-normal.woff2')
FONT2 = b64('node_modules/@fontsource/jersey-10/files/jersey-10-latin-ext-400-normal.woff2')
PUB = 'data:image/png;base64,' + b64(SRC + '/pub.png')


def spr(name, k=2, extra=''):
    p = f'{SRC}/spr/{name}.png'
    w, h = Image.open(p).size
    return f'<img class="px" src="data:image/png;base64,{b64(p)}" style="width:{w*k}px;height:{h*k}px;{extra}">'


ST = [('Pípa', 87, '1.8K', 0.34, 'obj_tap'), ('Kuchyně', 54, '113K', 0.62, 'obj_stove0'), ('Sklep se sudy', 41, '155K', 0.18, 'obj_barrel'), ('Kostky v rohu', 22, '127K', 0.71, 'obj_slots')]
NAV = [('Hospoda', 'icons_mug', 1), ('Obchod', 'icons_bag', 0), ('Úkoly', 'icons_clipboard', 0), ('Menu', 'icons_menu', 0)]


def nav(cls=''):
    return f'<div class="nav {cls}">' + ''.join(f'<div class="ni{" on" if on else ""}">{spr(i, 2)}<span>{n}</span></div>' for n, i, on in NAV) + '</div>'


def waiters(bottom=8):
    return ''


def waiters_old(bottom=8):
    f = lambda s, lv: f'<div class="wc">{spr(s, 2)}<b>{lv}</b></div>'
    return f'<div class="ws" style="bottom:{bottom}px">' + f('waiter_0', 3) + f('waiterB_0', 2) + f('waiterC_0', 1) + '</div>'


def quest(cls=''):
    return f'<div class="quest {cls}">{spr("icons_clipboard", 2)}<div class="qt"><b>Kuchyně na úroveň 60</b><i><u style="width:70%"></u></i></div><span class="qr">{spr("icons_coin", 1)}+68K</span><div class="btn amber sm">UKAŽ</div></div>'


def card(name, lvl, price, prog, icon, big_icon=False):
    ic = f'<div class="ico">{spr(icon, 2)}</div>' if big_icon else ''
    return f'<div class="card{" wi" if big_icon else ""}">{ic}<div class="ci"><b>{name}</b><small>úroveň {lvl}</small><i><u style="width:{int(prog*100)}%"></u></i></div><div class="btn green">+1<br>{price}</div></div>'


def hud(extra='', cls=''):
    return f'<div class="hud {cls}"><div class="coins">{spr("icons_coin", 2)}<div><b>3.48M coins</b><small>+2.04K / s</small></div></div>{extra}<div class="gem">💎 120</div></div>'


def pub(h, zoom=1.0, inner='', cls=''):
    return f'<div class="pub {cls}" style="height:{h}px;background-size:{int(405*zoom)}px auto">{inner}</div>'


# ---------- A: Úklid ----------
A = hud() + '<div class="hyg"><span>Hygiena</span><i><u style="width:62%"></u></i><span>62 %</span></div>' + quest() + pub(232, 1.0, waiters()) + \
    '<div class="lh"><span>Stanice</span><span class="chip">kupuji ×1 ▾</span></div>' + ''.join(card(*s) for s in ST) + nav()

# ---------- B: Velká hospoda ----------
tiles = ''.join(f'<div class="tile"><div class="th">{spr(ic, 2)}<div><b>{n}</b><small>úroveň {l}</small></div></div><i><u style="width:{int(pr*100)}%"></u></i><div class="btn green wide">+1 · {p}</div></div>' for n, l, p, pr, ic in ST)
B = hud(cls='slim') + pub(344, 1.22, '<div class="pill tl">' + spr('icons_clipboard', 1) + ' Kuchyně na úroveň 60 · 42/60</div><div class="hygr tr">' + spr('icons_mug', 2) + '<small>hygiena 62 %</small></div>', 'bl') + \
    f'<div class="grid2">{tiles}</div>' + nav()

# ---------- C: Karty s ikonami ----------
C = hud('<div class="ring"><svg width="40" height="40"><circle cx="20" cy="20" r="16" fill="none" stroke="#4a3f55" stroke-width="6"/><circle cx="20" cy="20" r="16" fill="none" stroke="#f9c22b" stroke-width="6" stroke-dasharray="62 101" transform="rotate(-90 20 20)"/></svg><span class="rv">62</span><small>hygiena</small></div>') + \
    quest('slim') + pub(214, 1.0, waiters()) + ''.join(card(*s, big_icon=True) for s in ST) + nav()

# ---------- D: Světlé dřevo ----------
D = '<div class="wood">' + hud() + '<div class="hyg"><span>Hygiena</span><i><u style="width:62%"></u></i><span>62 %</span></div>' + quest() + pub(232, 1.0, waiters()) + \
    '<div class="lh"><span>Stanice</span><span class="chip">kupuji ×1 ▾</span></div>' + ''.join(card(*s) for s in ST) + nav() + '</div>'

# ---------- E: Jedna ruka ----------
tabs = ''.join(f'<div class="stab{" on" if k == 0 else ""}">{spr(ic, 2)}<b>{l}</b></div>' for k, (n, l, p, pr, ic) in enumerate(ST))
E = hud(cls='slim') + pub(318, 1.06, '<div class="pill top">' + spr('icons_clipboard', 1) + ' Kuchyně na úroveň 60 · 42/60 <span class="go">UKAŽ ▸</span></div>' + waiters()) + \
    f'<div class="stabs">{tabs}</div>' + \
    '<div class="bigc"><div class="bh"><b>Pípa</b><small>úroveň 87 · 1.2K za pivo · číšníci 3</small></div><i><u style="width:34%"></u></i>' \
    '<div class="brow"><div class="btn green huge">+1 úroveň<br>1.8K coins</div><div class="bcol"><div class="btn plum sm2">×10</div><div class="btn plum sm2">MAX</div></div></div></div>' + nav()

# ---------- Menu 1: jen odemčené + co bude další ----------
T = [('Hostinský', 'obj_apronIcon', 1), ('Sbírka', 'icons_book', 0), ('Nabídka', 'obj_chest', 1), ('Nastavení', 'icons_gear', 0)]
mt = ''.join(f'<div class="mt">{"<em></em>" if dot else ""}{spr(i, 3)}<span>{n}</span></div>' for n, i, dot in T)
M1 = hud() + '<div class="mhead"><b>Menu</b><div class="x">✕</div></div>' + f'<div class="mgrid">{mt}</div>' + \
    '<div class="next"><small>DALŠÍ ODEMKNEŠ</small><div class="nx">' + spr('obj_krigl0', 3) + '<div><b>Krígly</b><span>trvalé bonusy za první hygienu</span><i><u style="width:62%"></u></i></div></div></div>' + \
    '<div class="later">a později: Kostnice · Pivovar · Chrám · Výzdoba · Šipky · Liga</div>' + nav('menu')

# ---------- Menu 2: seznam s popisem ----------
R = [('Hostinský', 'obj_apronIcon', 'strom dovedností · 4 volné body', 1), ('Sbírka', 'icons_book', 'hosté a jejich věrnost', 0), ('Speciální nabídka', 'obj_chest', 'denní truhla je připravená', 1), ('Nastavení', 'icons_gear', 'zvuk, jazyk, záloha', 0)]
rows = ''.join(f'<div class="mr"><div class="ico">{spr(i, 2)}</div><div><b>{n}</b><span>{d}</span></div>{"<em></em>" if dot else ""}<s>›</s></div>' for n, i, d, dot in R)
M2 = hud() + '<div class="mhead"><b>Menu</b><div class="x">✕</div></div>' + rows + \
    '<div class="mr lock"><div class="ico">' + spr('icons_lock', 2) + '</div><div><b>Zamčeno (7)</b><span>nejdřív Krígly – po 1. hygieně (62 %)</span></div><s>▾</s></div>' + nav('menu')

# ---------- Menu 3: spodní list přes hospodu ----------
S8 = [('Hostinský', 'obj_apronIcon', 1, 0), ('Sbírka', 'icons_book', 0, 0), ('Nabídka', 'obj_chest', 1, 0), ('Nastavení', 'icons_gear', 0, 0), ('Krígly', 'obj_krigl0', 0, 1), ('Kostnice', 'obj_dSkulls', 0, 1), ('Pivovar', 'obj_fermenter', 0, 1), ('Liga', 'obj_trophy', 0, 1)]
rs = ''.join(f'<div class="rc{" lk" if lk else ""}">{"<em></em>" if dot else ""}<div class="rb">{spr(i, 2)}</div><span>{n}</span></div>' for n, i, dot, lk in S8)
M3 = hud(cls='slim') + pub(318, 1.06, '<div class="shade"></div>') + '<div class="sheet"><div class="grab"></div>' + f'<div class="rgrid">{rs}</div>' + \
    '<div class="nx2">' + spr('obj_krigl0', 2) + '<div><b>Další: Krígly</b><i><u style="width:62%"></u></i></div><span>po 1. hygieně</span></div></div>' + nav('menu')

SCREENS = [('A', 'Úklid', 'stejný vzhled, méně věcí: hygiena má popsaný pruh, ×1 je malé tlačítko', A),
           ('B', 'Velká hospoda', 'hospoda přes půl obrazovky, stanice jako čtyři dlaždice', B),
           ('C', 'Karty s ikonami', 'každá stanice má velkou ikonu, hygiena jako kroužek', C),
           ('D', 'Světlé dřevo', 'rozložení A ve světlých barvách jako ikona a obchod', D),
           ('E', 'Jedna ruka', 'dole přepínač stanic a jedno velké tlačítko pro palec', E),
           ('M1', 'Menu: jen odemčené', 'místo sedmi zámků jedna karta „další odemkneš“', M1),
           ('M2', 'Menu: seznam', 'řádky s popisem, zámky sbalené do jednoho řádku', M2),
           ('M3', 'Menu: spodní list', 'vyjede přes hospodu, ikony v dosahu palce', M3)]

CSS = '''
@font-face{font-family:J;src:url(data:font/woff2;base64,%s) format('woff2');}
@font-face{font-family:J;src:url(data:font/woff2;base64,%s) format('woff2');unicode-range:U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF;}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#17121a;font-family:J,sans-serif;color:#f2e6d8;padding:24px;width:max-content}
.px{image-rendering:pixelated;display:block}
.row{display:flex;gap:26px;margin-bottom:30px}
.col{width:405px}
.cap{height:78px}
.cap h2{font-size:34px;color:#f9c22b;font-weight:400;line-height:1}
.cap p{font:14px/1.25 Arial,sans-serif;color:#cfc4d0;margin-top:4px}
.scr{width:405px;height:720px;background:#2e222f;position:relative;overflow:hidden;display:flex;flex-direction:column;border-radius:6px}
i{display:block;height:10px;border-radius:5px;background:#231a25;overflow:hidden;font-style:normal}
i u{display:block;height:100%%;background:#1ebc73;border-radius:5px;text-decoration:none}
small{font-size:17px;color:#9babb2;display:block;line-height:1}
.hud{height:64px;display:flex;align-items:center;padding:0 12px;gap:10px;flex:none}
.hud .coins{display:flex;align-items:center;gap:9px;flex:1}
.hud .coins b{font-size:31px;color:#f9c22b;font-weight:400;line-height:.9;display:block}
.hud .coins small{color:#1ebc73;font-size:17px}
.gem{background:#231a25;border-radius:9px;padding:5px 10px;font-size:20px;color:#8fd3ff}
.hud.over{position:absolute;left:0;right:0;top:0;background:linear-gradient(rgba(30,20,32,.92),rgba(30,20,32,0));height:78px;align-items:flex-start;padding-top:8px}
.hud.slim{height:54px}
.hyg{height:24px;display:flex;align-items:center;gap:8px;padding:0 12px 4px;flex:none;font-size:18px;color:#f9c22b}
.hyg i{flex:1;height:8px}.hyg i u{background:#f9c22b}
.quest{height:48px;margin:0 8px 6px;border:2px solid #f9c22b;border-radius:10px;background:#231a25;display:flex;align-items:center;gap:8px;padding:0 6px 0 8px;flex:none}
.quest .qt{flex:1}.quest .qt b{font-size:21px;color:#f9c22b;font-weight:400;display:block;line-height:1;margin-bottom:3px}
.quest .qt i{height:6px}.quest .qr{font-size:16px;color:#f9c22b;display:flex;align-items:center;gap:3px}
.quest.slim{height:40px;border-width:1px}
.btn{border-radius:9px;text-align:center;font-size:20px;line-height:1.05;display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:inset 0 9px 0 rgba(255,255,255,.16),0 3px 0 rgba(0,0,0,.35);flex:none}
.btn.green{background:#1e9e68;width:126px;height:50px}
.btn.amber{background:#f79617;color:#2e222f}
.btn.plum{background:#6b3e75}
.btn.sm{width:66px;height:32px;font-size:18px}
.btn.wide{width:100%%;height:34px;margin-top:7px}
.btn.huge{flex:1;height:76px;font-size:25px;width:auto}
.btn.sm2{width:74px;height:35px}
.pub{background:url(%s) center 38%% no-repeat;position:relative;flex:none;border-top:2px solid #f9c22b;border-bottom:2px solid #f9c22b;overflow:hidden}
.ws{position:absolute;left:8px;display:flex;gap:7px}
.wc{width:42px;height:42px;border-radius:50%%;background:rgba(30,20,32,.85);border:2px solid #a884f3;display:flex;align-items:center;justify-content:center;position:relative}
.wc b{position:absolute;right:-5px;top:-5px;background:#f9c22b;color:#2e222f;border-radius:50%%;width:17px;height:17px;font-size:14px;line-height:17px;text-align:center;font-weight:400}
.lh{display:flex;justify-content:space-between;align-items:center;padding:5px 12px 2px;font-size:18px;color:#9babb2;flex:none}
.chip{background:#3e3546;border-radius:8px;padding:2px 9px;color:#f9c22b;font-size:17px}
.card{display:flex;align-items:center;gap:10px;background:#3a2f3d;border-radius:10px;margin:3px 8px;padding:0 8px 0 12px;flex:1;min-height:0}
.card .ci{flex:1}.card b{font-size:25px;font-weight:400;display:block;line-height:1}
.card i{margin-top:5px}
.card.wi{padding-left:8px}.ico{width:46px;height:46px;border-radius:10px;background:#231a25;display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden}
.nav{height:62px;display:flex;border-top:2px solid #f9c22b;background:#2e222f;flex:none;margin-top:auto}
.ni{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:17px;color:#f2e6d8}
.ni.on span{color:#f9c22b}.nav.menu .ni.on span{color:#f2e6d8}.nav.menu .ni:last-child span{color:#f9c22b}
.pill{position:absolute;left:8px;bottom:8px;background:rgba(30,20,32,.9);border:1px solid #f9c22b;border-radius:14px;padding:4px 10px;font-size:17px;color:#f9c22b;display:flex;align-items:center;gap:6px}
.pill.top{top:8px;bottom:auto;right:8px;justify-content:flex-start}.pill .go{margin-left:auto;color:#2e222f;background:#f79617;border-radius:8px;padding:1px 7px}
.hygr{position:absolute;right:8px;bottom:8px;background:rgba(30,20,32,.9);border-radius:12px;padding:4px 8px;display:flex;align-items:center;gap:6px}.hygr small{color:#f9c22b}
.pub.bl{background-position:left bottom}.pill.tl{top:8px;bottom:auto}.hygr.tr{top:8px;bottom:auto}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:7px 8px;flex:1}
.tile{background:#3a2f3d;border-radius:10px;padding:8px 9px;display:flex;flex-direction:column;justify-content:space-between}
.tile .th{display:flex;gap:9px;align-items:center;height:44px}.tile b{font-size:23px;font-weight:400;line-height:1;display:block}
.ring{position:relative;width:40px;height:40px;margin-top:-10px}.ring .rv{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:17px;color:#f9c22b}.ring small{position:absolute;left:-10px;right:-10px;bottom:-13px;text-align:center;font-size:13px}
.stabs{display:flex;gap:8px;padding:8px 10px 4px;flex:none}
.stab{flex:1;height:60px;border-radius:12px;background:#3a2f3d;display:flex;align-items:center;justify-content:center;position:relative;border:2px solid transparent}
.stab.on{border-color:#f9c22b;background:#4a3b4e}.stab b{position:absolute;right:4px;top:2px;font-size:15px;color:#f9c22b;font-weight:400}
.bigc{margin:4px 10px 8px;background:#3a2f3d;border-radius:12px;padding:10px 12px;flex:1;display:flex;flex-direction:column;justify-content:space-between}
.bigc .bh b{font-size:28px;font-weight:400;line-height:1}.brow{display:flex;gap:8px}.bcol{display:flex;flex-direction:column;gap:6px}
.mhead{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-top:2px solid #f9c22b;flex:none}.mhead b{font-size:28px;color:#f9c22b;font-weight:400}
.x{width:44px;height:36px;border-radius:9px;background:#c93038;display:flex;align-items:center;justify-content:center;font:16px Arial}
.mgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:4px 12px;flex:none}
.mt{height:112px;border-radius:12px;background:#5a4e63;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;font-size:21px;position:relative;box-shadow:inset 0 12px 0 rgba(255,255,255,.08),0 4px 0 rgba(0,0,0,.3)}
em{position:absolute;right:8px;top:8px;width:13px;height:13px;border-radius:50%%;background:#e83b3b;border:2px solid #2e222f}
.next{margin:14px 12px 0;border:2px solid #f9c22b;border-radius:12px;padding:10px 12px;background:#231a25;flex:none}.next>small{color:#f9c22b;margin-bottom:8px}
.nx{display:flex;gap:12px;align-items:center}.nx div{flex:1}.nx b{font-size:25px;font-weight:400;display:block;line-height:1}.nx span{font:13px Arial;color:#cfc4d0;display:block;margin:3px 0 7px}.nx i u{background:#f9c22b}
.later{font:13px/1.4 Arial;color:#8d8194;padding:12px 16px;text-align:center}
.mr{display:flex;align-items:center;gap:12px;margin:4px 10px;padding:9px 10px;border-radius:12px;background:#3a2f3d;position:relative;flex:none}
.mr b{font-size:23px;font-weight:400;display:block;line-height:1}.mr span{font:13px Arial;color:#cfc4d0}.mr div:nth-child(2){flex:1}.mr s{text-decoration:none;font:22px Arial;color:#9babb2}
.mr em{position:static}.mr.lock{background:#231a25;border:1px dashed #6a5f70}.mr.lock b{color:#9babb2}
.shade{position:absolute;inset:0;background:rgba(20,12,22,.55)}
.sheet{position:absolute;left:0;right:0;bottom:62px;background:#2e222f;border-radius:18px 18px 0 0;border-top:2px solid #f9c22b;padding:8px 10px 12px}
.grab{width:54px;height:5px;border-radius:3px;background:#6a5f70;margin:0 auto 10px}
.rgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px 4px}
.rc{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:17px;position:relative}.rb{width:58px;height:58px;border-radius:50%%;background:#5a4e63;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 rgba(0,0,0,.3)}
.rc.lk{opacity:.38}.rc em{right:12px;top:0}
.nx2{display:flex;align-items:center;gap:10px;margin-top:12px;background:#231a25;border-radius:10px;padding:7px 10px}.nx2 div{flex:1}.nx2 b{font-size:18px;font-weight:400;color:#f9c22b;display:block;line-height:1;margin-bottom:4px}.nx2 i u{background:#f9c22b}.nx2 span{font:12px Arial;color:#cfc4d0}
/* D: světlé dřevo */
.wood{display:flex;flex-direction:column;height:100%%;background:#e9cf9d repeating-linear-gradient(0deg,transparent 0 46px,rgba(120,70,30,.13) 46px 48px);color:#3a2318}
.wood .hud{background:#6b4226}.wood .hyg{background:#6b4226;color:#ffd77a}.wood .hyg i{background:#3f2616}
.wood .quest{background:#fff3d6;border-color:#c9741c;margin-top:6px}.wood .quest .qt b,.wood .quest .qr{color:#9a4f0c}.wood .quest i{background:#e2c58f}
.wood small{color:#7a5a3c}.wood .hud small{color:#7dffb9}
.wood .lh{color:#6b4226}.wood .chip{background:#6b4226;color:#ffd77a}
.wood .card{background:#fff3d6;box-shadow:0 2px 0 #c9a86b}.wood .card i{background:#e2c58f}
.wood .nav{background:#6b4226;border-color:#3f2616}.wood .ni{color:#f6e3bd}.wood .ni.on span{color:#ffd24a}
.wood .pub{border-color:#3f2616}
''' % (FONT, FONT2, PUB)

html = '<html><head><meta charset="utf-8"><style>' + CSS + '</style></head><body>'
for part in (SCREENS[:5], SCREENS[5:]):
    html += '<div class="row">' + ''.join(f'<div class="col"><div class="cap"><h2>{k} – {t}</h2><p>{d}</p></div><div class="scr" id="{k}">{body}</div></div>' for k, t, d, body in part) + '</div>'
html += '</body></html>'
open(OUT, 'w', encoding='utf-8').write(html)
print('ok', len(html) // 1024, 'kB')
