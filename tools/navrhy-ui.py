#!/usr/bin/env python3
"""Makety nového UI (hospoda 70, přání uživatele: 5 návrhů). Skládá HTML z výřezu hospody a spritů hry;
obrázky z něj udělá tools/navrhy-ui.mjs. Použití: python3 tools/navrhy-ui.py <složka s podklady> <out.html> [sada]
Sada 1 (výchozí): A–E + M1–M3 → prehled.png. Sada 2: F–K + M4–M9 (uživatel vybral B, chce další návrhy) → prehled-2.png.
Sada 3: KA–KD pozdní cíle pro krígly → docs/navrhy-ui/krigly-cile/ (prehled-krigly.png).
Podklady: pub.png (čistý výřez hospody 810×606) a složka spr/ (sprity vyvezené ze hry)."""
import base64, io, math, sys
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
SADA = sys.argv[3] if len(sys.argv) > 3 else '1'
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

# =====================================================================================================
# Sada 2 (hospoda 71): uživatel vybral B „Velká hospoda“ a chce další návrhy hlavní obrazovky a menu.
# Vždy vidět: coins + příjem, 💎, hospoda, úkol, hygiena, 4 stanice s +1 a cenou, ×1/×10/MAX, obsluha, spodní lišta.
# Ovládání jednou rukou (důležité dole), dotyková místa ≥ 44 CSS px.
# =====================================================================================================


def clean_pub():
    """výřez hospody bez kroužků číšníků (v návrzích je obsluha samostatné tlačítko): podlaha z vedlejšího místa"""
    im = Image.open(SRC + '/pub.png').convert('RGB')
    c = im.copy()
    c.paste(im.crop((312, 474, 568, 606)), (4, 474))
    c.paste(im.crop((312, 474, 364, 606)), (260, 474))
    buf = io.BytesIO()
    c.save(buf, 'PNG')
    return 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def fit(name, box, extra=''):
    """sprite co největší do čtverce box (měřítko po 0,5 – na 2× displeji celé pixely)"""
    w, h = Image.open(f'{SRC}/spr/{name}.png').size
    return spr(name, max(0.5, math.floor(box / max(w, h) * 2) / 2), extra)


ST10 = ['25K', '1.56M', '2.14M', '1.75M']  # ceny při ×10


def hud2(cls=''):
    return f'<div class="hd {cls}"><div class="coins">{spr("icons_coin", 2)}<div><b>3.48M coins</b><small>+2.04K / s</small></div></div><div class="gem2">💎 120<span>+</span></div></div>'


def qpill(cls='', txt='Kuchyně na úr. 60', bar=True):
    b = '<i><u style="width:90%"></u></i>' if bar else ''
    return f'<div class="qp {cls}">{spr("icons_clipboard", 2)}<div class="qt"><b>{txt}</b>{b}</div><span class="rw">54/60<br>+68K</span></div>'


def hpill(cls=''):
    return f'<div class="hp {cls}">{spr("icons_mug", 2)}<div><small>hygiena</small><b>62 %</b></div></div>'


def hcard(cls=''):
    """hygiena jako karta v pravém horním rohu hospody (zakryje i ceduli hospody, která by jinak napůl prosvítala)"""
    return f'<div class="hc {cls}"><div class="hr">{spr("icons_mug", 2)}<div><small>hygiena</small><b>62 %</b></div></div><i><u style="width:62%"></u></i></div>'


def obs(cls='', label=True):
    f = ''.join(spr(w, 2) for w in ('waiter_0', 'waiterB_0', 'waiterC_0'))
    lb = '<div class="ol"><b>Obsluha</b><small>3 číšníci</small></div>' if label else ''
    return f'<div class="obs {cls}"><div class="fc">{f}</div>{lb}<span class="up">↑</span></div>'


def seg(cur='×1', cls=''):
    return f'<div class="seg {cls}">' + ''.join(f'<span{" class=on" if m == cur else ""}>{m}</span>' for m in ('×1', '×10', 'MAX')) + '</div>'


def pubc(h, zoom, pos='left bottom', inner='', cls=''):
    return f'<div class="pub c {cls}" style="height:{h}px;background-size:{round(405 * zoom)}px auto;background-position:{pos}">{inner}</div>'


# ---------- F: B úsporná ----------
fts = ''.join(f'<div class="ft"><div class="fth">{fit(ic, 40)}<div><b>{n}</b><small>úroveň {l}</small></div></div><i><u style="width:{int(pr * 100)}%"></u></i>'
              f'<div class="fbuy"><span>+1</span>{spr("icons_coin", 1)}<b>{p}</b></div></div>' for n, l, p, pr, ic in ST)
F = hud2() + pubc(372, 1.25, 'left bottom', qpill('tl') + hcard() + '<div class="pbar">' + obs() + seg() + '</div>') + f'<div class="fgrid">{fts}</div>' + nav()

# ---------- G: B s pásem stanic ----------
gcs = ''.join(f'<div class="gc"><div class="gi">{fit(ic, 40)}</div><b>{n}</b><small>úr. {l}</small><i><u style="width:{int(pr * 100)}%"></u></i><div class="gb">+1<br>{p}</div></div>' for n, l, p, pr, ic in ST)
gcs += f'<div class="gc lk"><div class="gi">{spr("icons_lock", 2)}</div><b>Nová stanice</b><small>2.5M</small></div>'
G = hud2() + pubc(398, 1.33, 'left bottom', qpill('tl') + hcard() + '<div class="pbar">' + obs() + seg() + '</div>') + \
    f'<div class="gband"><div class="gtrack">{gcs}</div><div class="dots"><s class="on"></s><s></s></div></div>' + nav()

# ---------- H: B přes celou obrazovku ----------
hts = ''.join(f'<div class="tile glass"><div class="th">{fit(ic, 40)}<div><b>{n}</b><small>úroveň {l}</small></div></div><i><u style="width:{int(pr * 100)}%"></u></i><div class="btn green hb">+10 · {p10}</div></div>'
              for (n, l, p, pr, ic), p10 in zip(ST, ST10))
H = pubc(0, 1.62, 'left top', '', 'full') + '<div class="hshade"></div>' + hud2('over') + qpill('tl hq') + hpill('tr hq') + \
    f'<div class="hctl">{obs()}{seg("×10")}</div><div class="hgrid">{hts}</div>' + nav()

# ---------- I: Tabule ----------
crs = ''.join(f'<div class="cr"><div class="ci2">{fit(ic, 40)}</div><div class="cn"><b>{n}</b><small>úroveň {l}</small><i><u style="width:{int(pr * 100)}%"></u></i></div><span class="dl"></span>'
              f'<div class="cbuy"><span>+1</span><b>{p}</b></div></div>' for n, l, p, pr, ic in ST)
note = '<div class="note"><s class="pin"></s><b>Úkol: Kuchyně na úr. 60</b><span>54/60 · odměna +68K</span></div>'
I = hud2() + pubc(266, 1.0, 'center 20%', note + hpill('br') + obs('bl'), 'tab') + \
    f'<div class="board"><div class="bh"><b>CENÍK</b>{seg("×1", "chalk")}</div>{crs}</div>' + nav()


# ---------- J: Akční kruhy ----------
def kring(cx, cy, side, n, l, p, pr, ic):
    C = 2 * math.pi * 35
    svg = f'<svg width="80" height="80"><circle cx="40" cy="40" r="35" fill="none" stroke="#231a25" stroke-width="7"/><circle cx="40" cy="40" r="35" fill="none" stroke="#f9c22b" stroke-width="7" stroke-dasharray="{C * pr:.0f} 999" transform="rotate(-90 40 40)"/></svg>'
    return f'<div class="kc" style="left:{cx - 40:.0f}px;top:{cy - 40:.0f}px">{svg}<div class="kin">{fit(ic, 28)}<b><s>+1</s> {p}</b></div><span class="klv">{l}</span><span class="kn {side}">{n}</span></div>'


PIV = (418, 612)  # střed oblouku ≈ kloub pravého palce; jmenovky směrem od palce
kcs = ''.join(kring(PIV[0] + 230 * math.cos(math.radians(a)), PIV[1] - 230 * math.sin(math.radians(a)), side, *s)
              for a, side, s in zip((106, 128, 150, 172), ('up', 'up', 'left', 'down'), ST))
J = pubc(0, 2.0, 'left top', '', 'full') + '<div class="jg"></div>' + hud2('over') + qpill('tl jq') + \
    '<div class="ring2"><svg width="56" height="56"><circle cx="28" cy="28" r="23" fill="#231a25" stroke="#4a3f55" stroke-width="6"/><circle cx="28" cy="28" r="23" fill="none" stroke="#f9c22b" stroke-width="6" stroke-dasharray="90 145" transform="rotate(-90 28 28)"/></svg><span>62 %</span><small>hygiena</small></div>' + \
    kcs + f'<div class="jo">{spr("waiter_0", 3)}<span>3</span><small>Obsluha</small></div>' + seg('×1', 'v jseg') + nav()

# ---------- K: Všechno dole ----------
krs = ''.join(f'<div class="kr"><div class="ci2">{fit(ic, 40)}</div><div class="cn"><b>{n}</b><small>úroveň {l}</small><i><u style="width:{int(pr * 100)}%"></u></i></div>'
              f'<div class="btn green kb">+1 · {p}</div></div>' for n, l, p, pr, ic in ST)
K = pubc(296, 1.0, 'center top', hpill('tl') + qpill('kq', 'Kuchyně na úroveň 60'), 'top') + \
    '<div class="dock"><div class="hd in"><div class="coins">' + spr('icons_coin', 2) + '<div><b>3.48M coins</b><small>+2.04K / s</small></div></div><div class="gem2">💎 120<span>+</span></div></div>' + \
    krs + f'<div class="kctl">{obs()}{seg()}</div></div>' + nav()

# ---------- menu: stav hráče po 4. hygieně a první noci (hostinský úr. 6, 320 kostí) ----------
# klíč: (název, sprite, stav, zamčeno → krátká podmínka, tečka)
MI = {
    'keeper': ('Hostinský', 'obj_apronIcon', 'úroveň 6 · 4 volné body', None, 1),
    'krigl': ('Krígly', 'obj_krigl0', '1 240 krígel · +124 %', None, 0),
    'brew': ('Pivovar', 'obj_fermenter', 'várka je hotová', None, 1),
    'bones': ('Kostnice', 'obj_dSkulls', '320 kostí', None, 0),
    'special': ('Nabídka', 'obj_chest', 'truhla je připravená', None, 1),
    'book': ('Sbírka', 'icons_book', '23 / 60 hostů', None, 0),
    'gems': ('Diamanty', None, 'balíčky a Štamgast', None, 0),
    'opts': ('Nastavení', 'icons_gear', 'zvuk, jazyk, záloha', None, 0),
    'coll': ('Sběrač', 'icons_tray', '', '500 kostí', 0),
    'temple': ('Chrám', 'obj_dIdol1', '', '6. hygiena', 0),
    'decor': ('Výzdoba', 'obj_plant', '', '10. hygiena', 0),
    'darts': ('Šipky', 'obj_darts', '', '15. hygiena', 0),
    'league': ('Liga', 'obj_trophy', '', '20. hygiena', 0),
}


def mico(key, box, dark=False):
    """ikona položky menu; zamčená = silueta (světlá na tmavém pozadí, tmavá na polici)"""
    n, s, st, lk, dot = MI[key]
    if s is None:
        return f'<span class="emo" style="font-size:{int(box * .78)}px;height:{box}px">💎</span>'
    return fit(s, box, ('filter:brightness(0);opacity:.6' if dark else 'filter:brightness(0) invert(.75);opacity:.4') if lk else '')


def mtitle(right=''):
    return f'<div class="mt2"><b>Menu</b>{right}</div>'


# ---------- M4: Skupiny ----------
def t4(key):
    n, s, st, lk, dot = MI[key]
    if lk:
        return f'<div class="t4 lk"><div class="tic">{mico(key, 34)}{spr("icons_lock", 1.5, "position:absolute;right:-14px;bottom:-2px")}</div><span>{n}</span><small>{lk.replace("hygiena", "hyg.")}</small></div>'
    return f'<div class="t4">{"<em></em>" if dot else ""}<div class="tic">{mico(key, 38)}</div><span>{n}</span></div>'


def sec(title, keys, hint=''):
    return f'<div class="sec"><div class="sh"><small>{title}</small><small>{hint}</small></div><div class="g4">' + ''.join(t4(k) for k in keys) + '</div></div>'


NX4 = '<div class="nx4">' + fit('obj_dIdol1', 28, 'filter:brightness(0) invert(.75);opacity:.5') + '<div><b>Další odemkneš: Chrám</b><i><u style="width:67%"></u></i></div><span>po 6. hygieně<br>4 / 6</span></div>'
chips = ''.join(f'<div class="chip2">{mico(k, 26)}<span>{MI[k][0]}</span></div>' for k in ('book', 'gems', 'opts'))
M4 = hud2() + mtitle('<small>nejčastější dole ↓</small>') + f'<div class="chips">{chips}</div>' + NX4 + '<div class="mw">' + \
    sec('V noci', ('bones', 'coll'), 'v noci se platí kostmi') + sec('Trvalé bonusy', ('krigl', 'keeper', 'brew', 'decor')) + \
    sec('Každý den', ('special', 'temple', 'darts', 'league')) + '</div>' + nav('menu')

# ---------- M5: Cesta odemykání ----------
NODES = [('Krígly', 'krigl', 1), ('Pivovar', 'brew', 3), ('Chrám', 'temple', 6), ('Výzdoba', 'decor', 10), ('Šipky', 'darts', 15), ('Liga', 'league', 20)]
XN = [24 + i * 63.4 for i in range(6)]
nodes = ''.join(f'<div class="nd{" ok" if h <= 4 else ""}" style="left:{x - 23:.0f}px">' + (f'<div class="nc">{fit(MI[k][1], 30)}</div>' if h <= 4 else f'<div class="nc">{fit(MI[k][1], 28, "filter:brightness(0) invert(.75);opacity:.4")}</div>') +
                f'<b>{n}</b><small>{h}. hyg.</small>{"<s>✓</s>" if h <= 4 else ""}</div>' for (n, k, h), x in zip(NODES, XN))
here = (XN[1] + XN[2]) / 2  # 4. hygiena: mezi pivovarem (3.) a chrámem (6.)
road = f'<div class="road"><div class="rh"><b>Cesta hospodského</b><small>hygien: 4</small></div><div class="track"><div class="tl0"></div><div class="tl1" style="width:{here - XN[0]:.0f}px"></div>{nodes}' + \
    f'<div class="hdot" style="left:{here - 8:.0f}px"></div><div class="here" style="left:{here - 24:.0f}px">JSI TU</div></div><div class="rnext"><span>Chrám otevře 6. hygiena – ještě 2</span><i><u style="width:67%"></u></i></div></div>'
night = '<div class="night">' + fit('obj_dSkulls', 28) + '<div><b>Noc: Kostnice ✓ · další Sběrač</b><i><u style="width:64%"></u></i></div><span>320 / 500<br>kostí</span></div>'
g8 = ''.join(t4(k) for k in ('bones', 'book', 'gems', 'opts', 'krigl', 'keeper', 'brew', 'special'))
M5 = hud2() + mtitle() + road + night + f'<div class="mw"><div class="g4 bot">{g8}</div></div>' + nav('menu')


# ---------- M6: Zamčené nahoře malé, odemčené dole velké ----------
def lchip(key, bar=None):
    n, s, st, lk, dot = MI[key]
    b = f'<i><u style="width:{bar}%"></u></i>' if bar else ''
    return f'<div class="lc{" wide" if bar else ""}">{mico(key, 24)}<div><b>{n}</b><small>{"od " + lk if bar else "po " + lk.replace("hygiena", "hygieně")}</small>{b}</div>{spr("icons_lock", 1)}</div>'


def t6(key):
    n, s, st, lk, dot = MI[key]
    st = {'keeper': '4 volné body', 'krigl': '+124 % výdělek'}.get(key, st)
    return f'<div class="t6">{"<em></em>" if dot else ""}<div class="tic">{mico(key, 36)}</div><div><b>{n}</b><small>{st}</small></div></div>'


M6 = hud2() + mtitle() + '<div class="soon"><small>BRZY ODEMKNEŠ</small><div class="lcs">' + lchip('temple') + lchip('decor') + lchip('darts') + lchip('league') + lchip('coll', 64) + '</div></div>' + \
    '<div class="mw"><div class="g6">' + ''.join(t6(k) for k in ('opts', 'book', 'gems', 'bones', 'krigl', 'keeper', 'brew', 'special')) + '</div></div>' + nav('menu')


# ---------- M7: Seznam s rychlou akcí ----------
def r7(key, act=None, cls='green'):
    n, s, st, lk, dot = MI[key]
    a = f'<div class="btn {cls} act">{act}</div>' if act else '<s>›</s>'
    return f'<div class="r7"><div class="tic">{mico(key, 34)}</div><div class="rt"><b>{n}</b><small>{st}</small></div>{a}</div>'


def soon7(key, txt, pct):
    n = MI[key][0]
    return f'<div class="r7 lk"><div class="tic">{mico(key, 30)}</div><div class="rt"><b>{n}</b><small>{txt}</small><i><u style="width:{pct}%"></u></i></div>{spr("icons_lock", 2)}</div>'


M7 = hud2() + mtitle('<small>💎 kupuješ přes + nahoře</small>') + '<div class="l7">' + r7('opts') + r7('book') + r7('bones') + r7('krigl') + \
    r7('keeper', '4 BODY', 'plum') + r7('brew', 'VYBRAT') + r7('special', 'OTEVŘÍT', 'amber') + \
    '<div class="sh7"><small>BRZY</small></div>' + soon7('coll', '320 / 500 kostí', 64) + soon7('temple', 'hygien 4 / 6', 67) + \
    '<div class="r7 more"><small>a dál: Výzdoba (10.), Šipky (15.), Liga (20. hygiena)</small></div></div>' + nav('menu')

# ---------- M8: Police ----------
SHELF = [('book', 'gems', 'opts'), ('bones', 'coll', 'temple'), ('krigl', 'keeper', 'decor'), ('special', 'brew', 'darts', 'league')]


def it8(key):
    n, s, st, lk, dot = MI[key]
    return f'<div class="ob">{mico(key, 46, True)}{"<em></em>" if dot else ""}</div>'


def pl8(key):
    n, s, st, lk, dot = MI[key]
    if lk:
        return f'<span class="pl lk"><span style="display:flex;gap:3px;align-items:center">{spr("icons_lock", 1)}{n}</span><small>{lk.replace("hygiena", "hyg.")}</small></span>'
    return f'<span class="pl">{n}</span>'


M8 = hud2() + mtitle('<small>police hostinského</small>') + '<div class="cab">' + \
    ''.join(f'<div class="shelf"><div class="its" style="grid-template-columns:repeat({len(row)},1fr)">' + ''.join(it8(k) for k in row) + '</div><div class="board8"></div>'
            f'<div class="its pls" style="grid-template-columns:repeat({len(row)},1fr)">' + ''.join(pl8(k) for k in row) + '</div></div>' for row in SHELF) + '</div>' + nav('menu')

# ---------- M9: Vějíř pro palec ----------
# kloub palce nad tlačítkem Menu; vnitřní oblouk = nejčastější, vnější = zamčené
FAN = [(125, (100, 140, 180), ('special', 'brew', 'keeper')),
       (220, (95, 116, 137, 158, 179), ('krigl', 'bones', 'book', 'gems', 'opts')),
       (315, (97, 114, 131, 148, 165), ('coll', 'temple', 'decor', 'darts', 'league'))]
PF = (380, 600)


def f9(key, x, y):
    n, s, st, lk, dot = MI[key]
    inner = mico(key, 30) + (spr('icons_lock', 1, 'position:absolute;right:4px;bottom:4px') if lk else '')
    lab = n if not lk else f'{n}<small>{lk.replace("hygiena", "hyg.")}</small>'
    return f'<div class="f9{" lk" if lk else ""}" style="left:{x - 27:.0f}px;top:{y - 27:.0f}px"><div class="fb">{inner}{"<em></em>" if dot else ""}</div><span>{lab}</span></div>'


fan = ''.join(f9(k, PF[0] + r * math.cos(math.radians(a)), PF[1] - r * math.sin(math.radians(a))) for r, angs, keys in FAN for a, k in zip(angs, keys))
M9 = hud2() + pubc(330, 1.22, 'left bottom', hcard()) + '<div class="tdim">' + ''.join(f'<div class="tile"></div>' for _ in range(4)) + '</div><div class="fanbg"></div>' + \
    '<div class="nx9">' + fit('obj_dIdol1', 30) + '<div><b>Další: Chrám</b><small>po 6. hygieně · 4/6</small><i><u style="width:67%"></u></i></div></div>' + fan + nav('menu')

SCREENS2 = [('F', 'B úsporná', 'B s menším písmem; celá dlaždice je tlačítko (46 px), obsluha a ×1/×10/MAX na spodní hraně hospody', F),
            ('G', 'B s pásem stanic', 'hospoda vyšší, stanice jako sloupce v posuvném pásu nad lištou – všechna +1 v jedné řadě pro palec', G),
            ('H', 'B přes celou obrazovku', 'hospoda je pod vším; dlaždice, úkol a ovládání plavou přes ni (ukázáno s ×10)', H),
            ('I', 'Tabule', 'nový směr: stanice jako ceník na křídové tabuli, úkol jako papírek připíchnutý v hospodě', I),
            ('J', 'Akční kruhy', 'nový směr: hospoda celá, stanice jako 4 kulatá tlačítka v oblouku pod pravým palcem', J),
            ('K', 'Všechno dole', 'nový směr: nahoře jen hospoda, peníze, stanice i ovládání v jednom panelu u palce', K),
            ('M4', 'Menu: skupiny', 'dlaždice podle druhu, nejčastější (každý den) úplně dole; vedlejší věci jako malé čipy nahoře', M4),
            ('M5', 'Menu: cesta odemykání', 'nahoře cesta 1.→20. hygiena s „jsi tu“, dole jen odemčené dlaždice', M5),
            ('M6', 'Menu: stav na dlaždici', 'zamčené malé nahoře, odemčené velké dole s jednou větou, co tam čeká', M6),
            ('M7', 'Menu: rychlé akce', 'seznam, kde se to hlavní (truhla, várka, body) udělá rovnou tlačítkem', M7),
            ('M8', 'Menu: police', 'věci hospody stojí na polici se štítky, zamčené jsou jen stíny', M8),
            ('M9', 'Menu: vějíř pro palec', 'vyjede z rohu nad hospodu, nejčastější nejblíž palci, zamčené na kraji', M9)]

CSS2 = '''
.pub.c{background-image:url(@CLEAN@);image-rendering:pixelated}
.pub.full{position:absolute;left:0;right:0;top:0;bottom:62px;height:auto!important;border:0;background-color:#2a1f2b}
.hd{height:52px;display:flex;align-items:center;padding:0 8px 0 12px;gap:10px;flex:none;position:relative;z-index:3}
.hd .coins{display:flex;align-items:center;gap:9px;flex:1}
.hd .coins b{font-size:29px;color:#f9c22b;font-weight:400;line-height:.9;display:block}
.hd .coins small{color:#1ebc73;font-size:16px}
.hd.over{position:absolute;left:0;right:0;top:0;height:70px;align-items:flex-start;padding-top:4px;background:linear-gradient(rgba(30,20,32,.96) 55%%,rgba(30,20,32,0))}
.gem2{height:44px;background:#231a25;border-radius:10px;padding:0 6px 0 10px;font-size:20px;color:#8fd3ff;display:flex;align-items:center;gap:8px;flex:none}
.gem2 span{width:30px;height:30px;border-radius:7px;background:#1e9e68;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:inset 0 5px 0 rgba(255,255,255,.18)}
.qp{position:absolute;display:flex;align-items:center;gap:7px;background:rgba(30,20,32,.93);border:2px solid #f9c22b;border-radius:12px;padding:0 9px 0 7px;height:46px;z-index:2}
.qp .qt{flex:1}.qp b{font-size:18px;color:#f9c22b;font-weight:400;display:block;line-height:1;margin-bottom:4px;white-space:nowrap}
.qp i{height:5px;width:100%%}.qp i u{background:#f9c22b}.qp .rw{font-size:14px;color:#f2e6d8;line-height:1;text-align:right}
.hp{position:absolute;height:46px;display:flex;align-items:center;gap:6px;background:rgba(30,20,32,.93);border-radius:12px;padding:0 10px 0 6px;z-index:2}
.hp small{font-size:14px;color:#cfc4d0}.hp b{font-size:21px;color:#f9c22b;font-weight:400;line-height:1;display:block}
.tl{left:8px;top:8px}.tr{right:8px;top:8px}.bl{left:8px;bottom:8px}.br{right:8px;bottom:8px}
.hc{position:absolute;right:0;top:0;width:110px;height:78px;background:#1e1420;border-radius:0 0 0 14px;padding:7px 9px 0 8px;z-index:2}
.hc .hr{display:flex;align-items:center;gap:6px}.hc small{font-size:14px;color:#cfc4d0}.hc b{font-size:22px;color:#f9c22b;font-weight:400;line-height:1;display:block}
.hc i{height:7px;margin-top:7px}.hc i u{background:#f9c22b}
.obs{height:50px;display:flex;align-items:center;gap:8px;background:#6b3e75;border-radius:12px;padding:0 12px 0 6px;position:relative;box-shadow:inset 0 9px 0 rgba(255,255,255,.12),0 3px 0 rgba(0,0,0,.35);flex:none;z-index:2}
.obs .fc{display:flex}.obs .fc img{margin-right:-11px;background:#2e222f;border-radius:50%%;border:2px solid #a884f3;width:34px!important;height:34px!important;padding:1px}
.obs .fc img:last-child{margin-right:0}
.obs b{font-size:20px;font-weight:400;display:block;line-height:1}.obs .ol small{font-size:14px;color:#e4d2ea}
.obs .up{position:absolute;right:-6px;top:-7px;width:22px;height:22px;border-radius:50%%;background:#1ebc73;color:#fff;font:bold 14px Arial;display:flex;align-items:center;justify-content:center;border:2px solid #2e222f}
.seg{display:flex;background:#231a25;border-radius:12px;padding:3px;gap:3px;flex:none;z-index:2;box-shadow:0 3px 0 rgba(0,0,0,.35)}
.seg span{width:48px;height:44px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#9babb2;border-radius:9px}
.seg span.on{background:#f79617;color:#2e222f;box-shadow:inset 0 8px 0 rgba(255,255,255,.2)}
.seg.v{flex-direction:column}
.pbar{position:absolute;left:0;right:0;bottom:0;height:74px;padding:0 8px 8px;display:flex;align-items:flex-end;justify-content:space-between;background:linear-gradient(rgba(30,20,32,0),rgba(30,20,32,.88) 50%%)}
/* F */
.fgrid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:7px;padding:7px 8px;flex:1;min-height:0}
.ft{background:#3a2f3d;border-radius:11px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 3px 0 rgba(0,0,0,.3)}
.fth{display:flex;gap:8px;align-items:center;height:46px;padding:4px 8px 0}.fth .px{flex:none}
.ft b{font-size:21px;font-weight:400;line-height:1;display:block}.ft small{font-size:15px}
.ft i{margin:4px 8px 0;height:6px}
.fbuy{margin-top:auto;height:46px;background:#1e9e68;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:inset 0 8px 0 rgba(255,255,255,.16)}
.fbuy span{background:rgba(0,0,0,.22);border-radius:6px;padding:1px 6px;font-size:18px}.fbuy b{font-size:23px}
/* G */
.gband{flex:1;padding:7px 0 0 8px;overflow:hidden;position:relative}
.gtrack{display:flex;gap:6px;width:max-content}
.gc{width:88px;height:170px;background:#3a2f3d;border-radius:11px;padding:5px;display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:0 3px 0 rgba(0,0,0,.3)}
.gi{height:42px;display:flex;align-items:flex-end;justify-content:center;flex:none}
.gc b{font-size:18px;font-weight:400;line-height:.9;height:34px;display:flex;align-items:center;justify-content:center}
.gc small{font-size:14px;margin:0 0 4px}.gc i{width:100%%;height:6px;flex:none}
.gb{margin-top:auto;width:100%%;height:50px;border-radius:9px;background:#1e9e68;display:flex;align-items:center;justify-content:center;font-size:19px;line-height:1;box-shadow:inset 0 8px 0 rgba(255,255,255,.16),0 3px 0 rgba(0,0,0,.35)}
.gc.lk{background:#231a25;border:2px dashed #5a4e63;box-shadow:none;color:#8d8194}
.dots{position:absolute;bottom:5px;left:0;right:0;display:flex;justify-content:center;gap:6px}.dots s{width:7px;height:7px;border-radius:50%%;background:#5a4e63}.dots s.on{background:#f9c22b}
/* H */
.hshade{position:absolute;left:0;right:0;bottom:62px;height:360px;background:linear-gradient(rgba(30,20,32,0),rgba(30,20,32,.75) 45%%,rgba(30,20,32,.95))}
.qp.hq,.hp.hq{top:64px}
.hctl{position:absolute;left:8px;right:8px;bottom:342px;display:flex;justify-content:space-between;align-items:flex-end}
.hgrid{position:absolute;left:8px;right:8px;bottom:70px;display:grid;grid-template-columns:1fr 1fr;gap:7px}
.tile.glass{background:rgba(46,34,47,.84);border:1px solid rgba(249,194,43,.35);height:128px;backdrop-filter:blur(3px)}
.btn.green.hb{width:100%%;height:46px;margin-top:7px}
/* I */
.pub.tab{border-bottom:0}
.note{position:absolute;left:10px;top:12px;background:#f3e3b5;color:#3a2318;padding:7px 11px 6px;border-radius:2px;transform:rotate(-2deg);box-shadow:0 4px 0 rgba(0,0,0,.35);z-index:2}
.note b{font-size:20px;font-weight:400;display:block;line-height:1}.note span{font-size:16px;color:#7a5a3c}
.pin{position:absolute;top:-6px;left:48%%;width:12px;height:12px;border-radius:50%%;background:#e83b3b;border:2px solid #7a1a20}
.board{margin:0 6px 8px;flex:1;border:8px solid #7a4524;border-top-width:10px;border-radius:6px;background:#1d2a24;background-image:radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.5px),radial-gradient(ellipse at 30%% 20%%,rgba(255,255,255,.07),transparent 60%%);background-size:7px 7px,100%% 100%%;box-shadow:inset 0 0 0 2px #4a2914,0 4px 0 #3b2110;padding:2px 10px 6px;display:flex;flex-direction:column;justify-content:space-between;color:#eef2ea}
.bh{display:flex;justify-content:space-between;align-items:center;height:52px}.bh b{font-size:32px;color:#f4e27a;font-weight:400;letter-spacing:3px}
.seg.chalk{background:transparent;box-shadow:none;gap:5px}.seg.chalk span{border:2px solid rgba(238,242,234,.3);color:#cfd8cc}.seg.chalk span.on{border-color:#f4e27a;color:#f4e27a;background:rgba(244,226,122,.12);box-shadow:none}
.cr{display:flex;align-items:center;gap:9px;height:60px;border-top:2px dashed rgba(238,242,234,.14)}
.ci2{width:40px;display:flex;justify-content:center;flex:none}
.cn b{font-size:23px;font-weight:400;line-height:1;display:block;white-space:nowrap}.cr small{color:#b9c4b7;font-size:15px}
.cr i{height:5px;width:96px;margin-top:4px;background:rgba(255,255,255,.12)}.cr i u{background:#e8eee4}
.dl{flex:1;align-self:center;border-bottom:3px dotted rgba(238,242,234,.3);margin-top:8px;min-width:8px}
.cbuy{width:116px;height:48px;border-radius:10px;background:#1e9e68;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:inset 0 8px 0 rgba(255,255,255,.16),0 3px 0 rgba(0,0,0,.4);flex:none}
.cbuy span{background:rgba(0,0,0,.22);border-radius:6px;padding:1px 5px;font-size:17px}.cbuy b{font-size:22px;font-weight:400}
.obs.bl{position:absolute}
/* J */
.jg{position:absolute;left:0;right:0;bottom:62px;height:330px;background:linear-gradient(rgba(20,12,22,0),rgba(20,12,22,.55) 35%%,rgba(20,12,22,.9))}
.qp.jq{top:64px;right:76px}
.ring2{position:absolute;right:10px;top:60px;width:56px;height:70px;z-index:2}.ring2 span{position:absolute;left:0;right:0;top:17px;text-align:center;font-size:17px;color:#f9c22b}
.ring2 small{position:absolute;left:-12px;right:-12px;top:57px;text-align:center;font-size:14px;color:#f2e6d8;text-shadow:0 1px 0 #000}
.kc{position:absolute;width:80px;height:80px;z-index:2}.kc svg{position:absolute;inset:0}
.kin{position:absolute;inset:8px;border-radius:50%%;background:#1e9e68;box-shadow:inset 0 10px 0 rgba(255,255,255,.16),0 3px 0 rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.kin b{font-size:17px;font-weight:400;line-height:1}.kin s{text-decoration:none;font-size:13px;opacity:.85}
.klv{position:absolute;right:-6px;top:-5px;background:#f9c22b;color:#2e222f;border-radius:10px;padding:0 6px;font-size:15px;line-height:20px;border:2px solid #2e222f}
.kn{position:absolute;font-size:17px;white-space:nowrap;background:rgba(30,20,32,.9);padding:1px 7px;border-radius:7px;color:#f2e6d8}
.kn.up{left:50%%;bottom:calc(100%% + 3px);transform:translateX(-50%%)}.kn.left{right:calc(100%% + 3px);top:50%%;transform:translateY(-50%%)}.kn.down{left:50%%;top:calc(100%% + 3px);transform:translateX(-50%%)}
.jo{position:absolute;left:10px;bottom:268px;width:64px;height:64px;border-radius:50%%;background:#6b3e75;border:3px solid #a884f3;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 0 rgba(0,0,0,.4);z-index:2}
.jo span{position:absolute;right:-6px;top:-6px;background:#f9c22b;color:#2e222f;border-radius:50%%;width:22px;height:22px;font-size:16px;display:flex;align-items:center;justify-content:center;border:2px solid #2e222f}
.jo small{position:absolute;top:66px;left:-10px;right:-10px;text-align:center;font-size:15px;color:#f2e6d8;text-shadow:0 1px 0 #000}
.jseg{position:absolute;left:10px;bottom:76px}.jseg span{width:58px}
/* K */
.pub.top{border-top:0}
.qp.kq{left:8px;right:8px;bottom:8px}.qp.kq .qt{flex:1}
.dock{flex:1;display:flex;flex-direction:column;background:#2e222f;padding-bottom:4px}
.hd.in{height:54px;border-bottom:1px solid #3e3546;margin-bottom:5px}
.kr{display:flex;align-items:center;gap:8px;height:54px;background:#3a2f3d;border-radius:11px;margin:0 8px 5px;padding:0 4px 0 6px;flex:none}
.kr .cn{flex:1}.kr b{font-size:22px}.kr small{font-size:15px}.kr i{height:5px;width:100%%;margin-top:3px}
.btn.kb{width:124px;height:46px;font-size:21px}
.kctl{display:flex;justify-content:space-between;align-items:center;padding:1px 8px 0;margin-top:auto}
/* menu */
.mt2{display:flex;justify-content:space-between;align-items:center;padding:4px 12px;border-top:2px solid #f9c22b;flex:none;height:44px}
.mt2 b{font-size:29px;color:#f9c22b;font-weight:400}.mt2 small{font-size:16px}
.emo{display:flex;align-items:center;justify-content:center;line-height:1;font-family:'Segoe UI Emoji',sans-serif}
.tic{position:relative;display:flex;align-items:center;justify-content:center;height:40px;flex:none}
.chips{display:flex;gap:6px;padding:4px 8px 0;flex:none}
.chip2{flex:1;height:44px;border-radius:10px;background:#3a2f3d;display:flex;align-items:center;justify-content:center;gap:7px;font-size:19px}
.sec{padding:0 8px;flex:none}
.nav{position:relative;z-index:4}
.sh{display:flex;justify-content:space-between;padding:9px 4px 5px}.sh small{font-size:16px;color:#f9c22b}.sh small+small{color:#8d8194}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.t4{height:96px;border-radius:12px;background:#5a4e63;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:18px;position:relative;box-shadow:inset 0 12px 0 rgba(255,255,255,.08),0 4px 0 rgba(0,0,0,.3)}
.t4.lk{background:#231a25;box-shadow:none;border:2px dashed #4a3f55;color:#8d8194;gap:2px}.t4.lk small{color:#f9c22b;font-size:15px}
.t4 em{right:6px;top:6px}.mw .t4{height:104px}
.nx4{display:flex;align-items:center;gap:10px;margin:8px 8px 0;background:#231a25;border:1px dashed #6a5f70;border-radius:12px;padding:8px 12px;flex:none}.nx4 div{flex:1}.nx4 b{font-size:18px;font-weight:400;display:block;line-height:1;margin-bottom:5px;color:#cfc4d0}.nx4 i u{background:#f9c22b}.nx4 span{font-size:14px;line-height:1.05;text-align:right;color:#f9c22b}
.mw{flex:1;display:flex;flex-direction:column;justify-content:flex-end;min-height:0;padding-bottom:8px}
/* M5 */
.road{margin:6px 8px 0;background:#231a25;border-radius:14px;padding:8px 10px 10px;flex:none}
.rh{display:flex;justify-content:space-between;align-items:baseline}.rh b{font-size:22px;color:#f9c22b;font-weight:400}.rh small{font-size:16px}
.track{position:relative;height:104px;margin-top:8px}
.tl0,.tl1{position:absolute;top:22px;left:24px;height:6px;border-radius:3px}.tl0{right:24px;background:#4a3f55}.tl1{background:#f9c22b}
.nd{position:absolute;top:0;width:46px;display:flex;flex-direction:column;align-items:center;text-align:center}
.nc{width:46px;height:46px;border-radius:50%%;background:#3a2f3d;border:3px solid #4a3f55;display:flex;align-items:center;justify-content:center}
.nd.ok .nc{background:#5a4e63;border-color:#f9c22b}
.nd b{font-size:16px;font-weight:400;margin-top:4px;line-height:1;white-space:nowrap}.nd small{font-size:14px;color:#8d8194}.nd.ok small{color:#1ebc73}
.nd s{position:absolute;top:-4px;right:-6px;width:20px;height:20px;border-radius:50%%;background:#1ebc73;color:#fff;font:bold 12px Arial;display:flex;align-items:center;justify-content:center;text-decoration:none;border:2px solid #231a25}
.here{position:absolute;top:84px;width:48px;text-align:center;font-size:14px;color:#2e222f;background:#f9c22b;border-radius:6px;line-height:18px}
.hdot{position:absolute;top:17px;width:16px;height:16px;border-radius:50%%;background:#fff;border:3px solid #f9c22b;box-shadow:0 0 0 3px #231a25}
.rnext{display:flex;align-items:center;gap:10px;margin-top:4px}.rnext span{font-size:17px;white-space:nowrap}.rnext i{flex:1;height:8px}.rnext i u{background:#f9c22b}
.night{display:flex;align-items:center;gap:10px;margin:7px 8px 0;background:#231a25;border-radius:12px;padding:8px 12px;flex:none}
.night div{flex:1}.night b{font-size:18px;font-weight:400;display:block;line-height:1;margin-bottom:5px;color:#8fd3ff}.night i u{background:#8fd3ff}.night span{font-size:15px;line-height:1;text-align:right;color:#cfc4d0}
.g4.bot{padding:0 8px}
/* M6 */
.soon{margin:4px 8px 0;flex:none}.soon>small{font-size:15px;color:#8d8194;margin:2px 4px 6px}
.lcs{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.lc{height:46px;border-radius:10px;background:#231a25;border:2px dashed #4a3f55;display:flex;align-items:center;gap:8px;padding:0 8px;color:#8d8194}
.lc div{flex:1}.lc b{font-size:18px;font-weight:400;display:block;line-height:1}.lc small{font-size:14px;color:#f9c22b}
.lc.wide{grid-column:span 2}.lc.wide i{height:5px;margin-top:3px;width:100%%}.lc.wide i u{background:#f9c22b}
.g6{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:0 8px 8px;margin-top:auto}
.t6{height:80px;border-radius:12px;background:#5a4e63;display:flex;align-items:center;gap:9px;padding:0 8px;position:relative;box-shadow:inset 0 12px 0 rgba(255,255,255,.08),0 4px 0 rgba(0,0,0,.3)}
.t6 .tic{width:48px;height:48px;border-radius:10px;background:#3a2f3d}
.t6 b{font-size:22px;font-weight:400;display:block;line-height:1}.t6 small{font-size:15px;color:#e0d4e4;margin-top:3px;line-height:1}
.t6 em{right:6px;top:6px}
/* M7 */
.l7{flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:0 8px 6px}
.r7{display:flex;align-items:center;gap:10px;height:50px;background:#3a2f3d;border-radius:11px;margin-top:4px;padding:0 6px 0 6px;flex:none}
.r7 .tic{width:42px;height:42px;border-radius:9px;background:#231a25}
.r7 .rt{flex:1}.r7 b{font-size:21px;font-weight:400;display:block;line-height:1}.r7 small{font-size:15px;color:#cfc4d0;margin-top:2px}
.r7 s{text-decoration:none;font:24px Arial;color:#9babb2;width:44px;text-align:center}
.btn.act{width:104px;height:44px;font-size:19px}
.r7.lk{background:#231a25;border:2px dashed #4a3f55;height:48px}.r7.lk b{color:#9babb2}.r7.lk i{height:5px;margin-top:3px;width:150px}.r7.lk i u{background:#f9c22b}.r7.lk>img{margin-right:12px;opacity:.7}
.sh7 small{font-size:15px;color:#8d8194;margin:8px 4px 0}
.r7.more{height:28px;background:none;justify-content:center}.r7.more small{font-size:15px;color:#8d8194}
/* M8 */
.cab{flex:1;margin:4px 8px 8px;border-radius:10px;background:#4a2c1c;background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.12) 0 2px,transparent 2px 64px);border:6px solid #2f1a10;box-shadow:inset 0 0 0 2px #6b4226;display:flex;flex-direction:column;justify-content:space-evenly;padding:0 4px}
.shelf{display:flex;flex-direction:column}
.its{display:grid;justify-items:center;align-items:end;padding:0 4px}
.its:not(.pls){height:64px}.ob{position:relative;display:inline-flex}.ob em{right:-12px;top:-8px}
.board8{height:10px;background:#9a6a3c;box-shadow:inset 0 3px 0 #b8834f,0 6px 0 #2f1a10;margin:0 -4px}
.pls{margin-top:12px;align-items:center}
.pl{background:#d9b25a;color:#3a2318;font-size:16px;line-height:22px;padding:0 6px;border-radius:3px;box-shadow:inset 0 -2px 0 #9a7428,0 2px 0 rgba(0,0,0,.4);white-space:nowrap;display:flex;align-items:center;gap:3px}
.pl.lk{background:#2e222f;color:#cfc4d0;box-shadow:inset 0 -2px 0 #1a121c;flex-direction:column;line-height:1;padding:3px 7px 4px;gap:1px}.pl.lk small{font-size:13px;color:#f9c22b}.pls{min-height:38px;align-items:start}
/* M9 */
.tdim{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:7px 8px;flex:1}
.fanbg{position:absolute;inset:0;background:radial-gradient(circle at 380px 600px,rgba(46,34,47,.97) 0,rgba(46,34,47,.95) 352px,rgba(20,12,22,.6) 353px)}
.f9{position:absolute;width:54px;display:flex;flex-direction:column;align-items:center;z-index:2}
.fb{width:54px;height:54px;border-radius:50%%;background:#5a4e63;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:inset 0 9px 0 rgba(255,255,255,.1),0 3px 0 rgba(0,0,0,.4)}
.f9 span{font-size:16px;margin-top:3px;white-space:nowrap;line-height:1}
.f9.lk .fb{background:#231a25;border:2px dashed #4a3f55;box-shadow:none}.f9.lk span{color:#cfc4d0;font-size:15px;text-align:center}.f9.lk span small{color:#f9c22b;font-size:13px}
.f9 em{right:-2px;top:-2px}
.nx9{position:absolute;left:10px;top:64px;width:250px;display:flex;align-items:center;gap:10px;background:#231a25;border:2px solid #f9c22b;border-radius:12px;padding:8px 10px;z-index:2}
.nx9 div{flex:1}.nx9 b{font-size:19px;font-weight:400;color:#f9c22b;display:block;line-height:1}.nx9 small{font-size:14px;margin:2px 0 5px}.nx9 i u{background:#f9c22b}
'''

# =====================================================================================================
# Sada 3 (hospoda 72): pozdní cíle pro krígly – 4 návrhy (KA hospody za krígly, KB cechovní erby = 2. prestiž,
# KC milníky krígel + Sláva hospody, KD slavnosti). Výstup: docs/navrhy-ui/krigly-cile/ (KA–KD.png, prehled-krigly.png).
# Stav hráče na maketách: 3 hospody, 2,48M krígel. Pozor na pojmy: „pečeť“ už je v Chrámu (SEAL_BONUS) → měna KB jsou „erby“.
# =====================================================================================================
KR = '2.48M'


def hud3():
    return f'<div class="hd"><div class="coins">{spr("icons_coin", 2)}<div><b>8.42T coins</b><small>+1.93B / s</small></div></div><div class="gem2">💎 120<span>+</span></div></div>'


def head3(title, right=None):
    r = right if right is not None else f'<div class="kch">{fit("obj_krigl0", 26)}<b>{KR}</b></div>'
    return f'<div class="h3"><div class="btn plum bk">← Menu</div><b>{title}</b>{r}</div>'


def info3(how, gives):
    return '<div class="inf"><div class="ih">JAK TO FUNGUJE</div><ul>' + ''.join(f'<li>{h}</li>' for h in how) + f'</ul><div class="ih g">CO TO HRÁČI DÁ</div><p>{gives}</p></div>'


def kcost(v, cls=''):
    return f'<span class="kc3 {cls}">{fit("obj_krigl0", 18)}{v}</span>'


def erb(k=1.0):
    return f'<span class="erb" style="width:{26 * k:.0f}px;height:{30 * k:.0f}px"><span>{fit("icons_mug", 16 * k)}</span></span>'


# ---------- KA: další hospody za krígly ----------
def prow(no, name, guests, filt, pos, state, price, sub):
    g = ''.join(spr(x, 2) for x in guests)
    th = f'<div class="th3" style="filter:{filt};background-position:{pos}"></div>'
    if state == 'buy':
        btn = f'<div class="btn green b3">KOUPIT{kcost(price)}</div>'
    else:
        btn = f'<div class="btn off b3">{spr("icons_lock", 1)}{kcost(price, "dim")}</div>'
    bar = f'<i><u style="width:{sub}%"></u></i>' if state == 'lock' and sub else ''
    return f'<div class="p3 {state}">{th}<div class="pt"><b>{no}. {name}</b><div class="gs">{g}<small>×10 výdělek<br>+20 % krígel</small></div>{bar}</div>{btn}</div>'


owned = ''.join(f'<span>✓ {n}</span>' for n in ('Pajzl u Berana', 'Sklepní krčma', 'Žabákův podnik'))
KA = hud3() + head3('Další hospody') + f'<div class="own"><small>MÁŠ 3 HOSPODY</small><div>{owned}</div></div>' + '<div class="pl3">' + \
    prow(4, 'Hřbitovní hospoda', ('digger_0', 'ghost_0', 'skeleton_0'), 'grayscale(.75) hue-rotate(190deg) brightness(.75)', '-150px -120px', 'buy', '25K', 0) + \
    prow(5, 'Ledová nálevna', ('frostbrewer_0', 'werewolf_0', 'monk_0'), 'hue-rotate(175deg) saturate(.8) brightness(1.15)', '-10px -40px', 'buy', '1M', 0) + \
    prow(6, 'Cantina La Catrina', ('mariachi_0', 'catrinaSinger_0', 'muertos0_0'), 'hue-rotate(-28deg) saturate(1.7)', '-240px -130px', 'lock', '40M', 0) + \
    prow(7, 'Přístavní krčma', ('captain_0', 'vodnik_0', 'deep0_0'), 'hue-rotate(125deg) saturate(.75) brightness(.8)', '-90px -180px', 'lock', '1.6B', 0) + \
    '</div>' + \
    info3(['Hospodu koupíš za krígly a zůstane ti i po hygieně.',
           'Každá další je 40× dražší (25K, 1M, 40M, 1,6B, 64B …).',
           'Utracené krígly se dál počítají do bonusu výdělku.'],
          'Hospoda vydělává 10× víc než ta předchozí, přidá +20 % krígel z hygieny, nové prostředí, 6 nových hostů do Sbírky a vlastní názvy stanic.') + nav('menu')

# ---------- KB: druhá prestiž – cechovní erby ----------
TREE = [('obj_kegGold', 'Rychlý rozjezd', 'začínáš se všemi 3 hospodami', '1/1', None),
        ('obj_krigl3', 'Plnější krígly', 'krígly z hygieny ×2', '1/5', 9),
        ('obj_krigl0', 'Silnější krígl', '+1,0 % místo +0,9 % za krígl', '0/5', 8),
        ('icons_clock', 'Hygiena sama', 'spustí se, jakmile se vyplatí', '0/1', 20),
        ('icons_bag', 'Levný obchod', 'obchod za krígly −10 %', '0/5', 4),
        ('obj_trophy', 'Mistr cechu', 'výdělek ×2, bez stropu', '2', 40)]


def node3(ic, n, d, lv, c):
    have = 7
    if c is None:
        b = '<div class="nb done">HOTOVO</div>'
    else:
        b = f'<div class="nb{" ok" if c <= have else ""}">{erb(.55)}{c}</div>'
    return f'<div class="n3"><div class="nh">{fit(ic, 28)}<b>{n}</b></div><small>{d}</small><div class="nf"><span>úr. {lv}</span>{b}</div></div>'


minis = ''.join(f'<div class="th3 mini" style="filter:{f};background-position:{p}"></div>' for f, p in (('none', '-150px -120px'), ('hue-rotate(215deg) saturate(.6) brightness(.7)', '-10px -40px'), ('hue-rotate(75deg) saturate(.8) brightness(.85)', '-240px -130px')))
KB = hud3() + head3('Cech hostinských', f'<div class="kch">{erb(.75)}<b>7</b></div>') + \
    f'<div class="sell"><div class="sr">{minis}<span class="ar">→</span>{erb(1.35)}<div class="sg"><b>+15 erbů</b><small>za {KR} krígel</small></div></div>' \
    '<div class="btn amber sb">PRODAT ŘETĚZEC HOSPOD</div>' \
    '<div class="kl"><span class="bad">Ztratíš: coins, stanice, krígly, obchod za krígly, 2. a 3. hospodu</span><span class="good">Zůstane: 💎, talismany, Hostinský, Kostnice, Pivovar, Chrám, Liga</span></div></div>' + \
    '<div class="sh3"><small>CECHOVNÍ SÍŇ – TRVALÉ BONUSY</small><small>máš 7 erbů</small></div><div class="g3">' + ''.join(node3(*t) for t in TREE) + '</div>' + \
    info3(['Od 1M krígel můžeš prodat celý řetězec. Erby = √(krígly ÷ 10K): za 1M je 10 erbů, za 100M 100 erbů.',
           'Začneš znovu v Pajzlu, ale s bonusy z Cechovní síně.',
           'Za erby kupuješ 6 trvalých bonusů v Cechovní síni.'],
          'Nový dlouhý cíl nad hygienou: každé další kolo je rychlejší a krígly mají znovu cenu.') + nav('menu')

# ---------- KC: milníky krígel + Sláva hospody ----------
MS = [('1K', 'done', 'icons_star', 'Titul „Výčepní“', 'a dřevěný rámeček'),
      ('10K', 'done', 'count_0', 'Vzácný host Hrabě', 'nechává 5× spropitné'),
      ('100K', 'done', 'obj_tap_gold', 'Zlatá pípa', 'nový vzhled všech hospod'),
      ('1M', 'done', 'obj_cCrown', 'Titul „Pan hostinský“', 'a zlatý rámeček'),
      ('10M', 'next', 'yellowKing_0', 'Vzácný host Žlutý král', '2.48M / 10M krígel'),
      ('100M', 'lock', 'obj_tap_crystal', 'Křišťálová pípa a stoly', ''),
      ('1B', 'lock', 'obj_kegGold', 'Titul „Pivní baron“', '')]


def ms3(v, st, ic, n, d):
    lk = st == 'lock'
    icon = fit(ic, 30, 'filter:brightness(0) invert(.75);opacity:.4' if lk else '')
    end = {'done': '<span class="ck">✓</span>', 'next': '<span class="nx">DALŠÍ</span>', 'lock': spr('icons_lock', 1.5, 'opacity:.7')}[st]
    bar = '<i><u style="width:25%"></u></i>' if st == 'next' else ''
    return f'<div class="m3 {st}"><span class="mv">{v}</span><div class="mi">{icon}</div><div class="mt3"><b>{n}</b>{f"<small>{d}</small>" if d else ""}{bar}</div>{end}</div>'


KC = hud3() + head3('Sláva hospody') + \
    f'<div class="fame"><div class="por">{spr("player_0", 4)}</div><div class="fi"><small>Pan hostinský Beran</small><b>Sláva hospody 11</b><div class="stars">★★★★★★★★★★★</div>' \
    '<i><u style="width:21%"></u></i><small class="fs">spropitné +11 % · další sláva při 4.1M krígel</small></div></div>' + \
    '<div class="sh3"><small>MILNÍKY – CELKEM ZÍSKANÉ KRÍGLY</small><small>4 / 7</small></div><div class="ml3">' + ''.join(ms3(*m) for m in MS) + '</div>' + \
    info3(['Počítají se všechny získané krígly, nic se neutrácí.',
           'Každý 10× násobek odemkne titul, vzhled nebo hosta.',
           'Sláva: +1 za každé zdvojnásobení krígel, bez stropu.'],
          'Stále viditelný další cíl a čím se pochlubit – titul a rámeček uvidí i soupeři v Lize.') + nav('menu')

# ---------- KD: slavnosti (opakovaná útrata krígel) ----------
FE = [('obj_dVepro', 'Zabijačka', '2 %', '49.6K', 'výdělek ×2 na 8 h', 'green'),
      ('obj_guitar', 'Koncert', '5 %', '124K', 'spropitné ×5 na 8 h<br>+ vzácný host', 'green'),
      ('obj_kegGold', 'Korunovace sudu', '10 %', '248K', 'výdělek ×3 na 24 h<br>+10 💎 a talisman', 'amber')]
fes = ''.join(f'<div class="f3"><div class="fic">{fit(ic, 40)}</div><div class="ft3"><b>{n}</b><small>{e}</small></div><div class="btn {c} fb3">{p} krígel{kcost(k)}</div></div>' for ic, n, p, k, e, c in FE)
pips = ''.join(f'<s{" class=on" if i < 7 else ""}></s>' for i in range(10))
KD = hud3() + head3('Slavnosti') + \
    f'<div class="run3">{fit("obj_dFlag", 34)}<div><b>Dnes můžeš uspořádat 1 slavnost</b><small>hospoda bude vyzdobená a přijde víc hostů</small></div></div>' + \
    f'<div class="fl3">{fes}</div>' + \
    f'<div class="chr"><div class="ch1">{fit("icons_book", 30)}<div><b>Kronika slavností</b><small>uspořádáno 27 · trvale výdělek +10 %</small></div></div><div class="pp">{pips}<span>7 / 10 → dalších +5 %</span></div></div>' + \
    info3(['Jednou denně uspořádáš slavnost. Stojí podíl tvých krígel (2, 5 nebo 10 %), takže má váhu s tisícem i s miliardou.',
           'Po dobu slavnosti je hospoda vyzdobená, chodí víc hostů a platí její bonus.',
           'Každá 10. slavnost zapíše do Kroniky trvalých +5 % výdělku.'],
          'Krígly mají kam téct každý den a je důvod se vracet; drahá slavnost dá i 💎 a talisman.') + nav('menu')

SCREENS3 = [('KA', 'Další hospody', '4., 5., 6. … hospoda se kupuje za krígly; každá má nové prostředí a hosty a vydělává 10× víc', KA),
            ('KB', 'Cechovní erby', 'druhá prestiž: prodáš celý řetězec za erby a za ně kupuješ trvalé bonusy v Cechovní síni', KB),
            ('KC', 'Milníky a Sláva', 'nic se neutrácí: za 1K, 10K … 1B získaných krígel jsou tituly, vzhledy a hosté, k tomu nekonečná Sláva', KC),
            ('KD', 'Slavnosti', 'denní útrata: slavnost za podíl krígel dá na pár hodin velký bonus a plní Kroniku', KD)]

CSS3 = '''
.h3{height:50px;display:flex;align-items:center;justify-content:space-between;padding:0 8px;border-top:2px solid #f9c22b;flex:none}
.h3>b{font-size:26px;color:#f9c22b;font-weight:400}
.btn.bk{width:88px;height:36px;font-size:19px}
.kch{min-width:88px;height:36px;border-radius:9px;background:#231a25;border:1px solid #f9c22b;display:flex;align-items:center;justify-content:center;gap:6px;padding:0 8px}
.kch b{font-size:21px;color:#f9c22b;font-weight:400}
.kc3{display:inline-flex;align-items:center;gap:4px;justify-content:center}.kc3.dim{color:#cfc4d0}
.inf{margin:0 8px 7px;background:#231a25;border:2px solid #f9c22b;border-radius:10px;padding:6px 10px 7px;flex:none}
.ih{font-size:16px;color:#f9c22b;letter-spacing:1px;line-height:1.1}.ih.g{color:#1ebc73;margin-top:4px}
.inf ul{list-style:none}.inf li{font-size:16.5px;line-height:1.02;padding-left:11px;position:relative;margin-top:3px;color:#f2e6d8}
.inf li:before{content:"";position:absolute;left:0;top:6px;width:5px;height:5px;background:#f9c22b}
.inf p{font-size:16.5px;line-height:1.02;color:#bff0d6;margin-top:2px}
.sh3{display:flex;justify-content:space-between;padding:6px 12px 3px;flex:none}.sh3 small{font-size:15px;color:#9babb2}.sh3 small:last-child{color:#f9c22b}
.th3{width:84px;height:56px;border-radius:7px;background-image:url(@PUB@);background-size:405px auto;image-rendering:pixelated;border:2px solid #f9c22b;flex:none}
.th3.mini{width:44px;height:36px;border-width:1px;margin-right:-10px;box-shadow:2px 0 0 #231a25}
.btn.off{background:#4a3f55;color:#cfc4d0;box-shadow:none;gap:5px}
/* KA */
.own{margin:0 8px;padding:5px 9px 7px;background:#3a2f3d;border-radius:10px;flex:none}.own small{font-size:14px;margin-bottom:4px}
.own div{display:flex;justify-content:space-between}.own span{font-size:16px;color:#1ebc73;white-space:nowrap}
.pl3{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;padding:2px 8px;min-height:0}
.p3{display:flex;align-items:center;gap:9px;background:#3a2f3d;border-radius:11px;padding:5px 6px 5px 6px;box-shadow:0 3px 0 rgba(0,0,0,.3)}
.p3 .pt{flex:1;min-width:0}.p3 b{font-size:21px;font-weight:400;line-height:1;display:block;white-space:nowrap}
.gs{display:flex;align-items:center;margin-top:3px}.gs img{margin-right:-4px}.gs small{font-size:14px;color:#f9c22b;margin-left:9px;line-height:.95;white-space:nowrap}
.p3 i{height:5px;margin-top:3px}.p3 i u{background:#f9c22b}
.btn.b3{width:86px;height:52px;font-size:18px;flex-direction:column;gap:2px}
.p3.lock{background:#231a25;border:2px dashed #4a3f55;box-shadow:none}.p3.lock b{color:#cfc4d0}.p3.lock .th3{border-color:#4a3f55;opacity:.75}
.more3{font-size:15px;color:#8d8194;text-align:center}
/* KB */
.erb{display:inline-flex;flex:none;background:#8a5a12;clip-path:polygon(0 0,100% 0,100% 62%,50% 100%,0 62%);padding:2px;position:relative}
.erb>span{flex:1;display:flex;align-items:center;justify-content:center;background:linear-gradient(90deg,#f9c22b 50%,#f79617 50%);clip-path:polygon(0 0,100% 0,100% 61%,50% 100%,0 61%);padding-bottom:12%}
.sell{margin:0 8px;background:#3a2f3d;border-radius:11px;padding:8px 9px;flex:none;border:2px solid #f79617}
.sr{display:flex;align-items:center;justify-content:center}.sr .ar{font:26px Arial;color:#f9c22b;margin:0 16px 0 22px}
.sg{margin-left:10px}.sg b{font-size:27px;color:#f9c22b;font-weight:400;line-height:.9;display:block}.sg small{font-size:15px;color:#cfc4d0}
.btn.sb{height:44px;margin:7px 0 6px;font-size:22px;width:100%}
.kl span{display:block;font-size:15px;line-height:1.05;white-space:nowrap}.kl .bad{color:#ff8f8f}.kl .good{color:#8fe8b8;margin-top:2px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;padding:0 8px;flex:1;min-height:0;margin-bottom:6px}
.n3{background:#3a2f3d;border-radius:10px;padding:5px 6px;display:flex;flex-direction:column;box-shadow:0 3px 0 rgba(0,0,0,.3)}
.nh{display:flex;align-items:center;gap:5px;height:30px}.nh b{font-size:17px;font-weight:400;line-height:.9}
.n3>small{font-size:14px;color:#cfc4d0;line-height:.98;margin-top:2px}
.nf{margin-top:auto;display:flex;align-items:center;justify-content:space-between}.nf span{font-size:14px;color:#9babb2}
.nb{height:26px;min-width:50px;border-radius:7px;background:#4a3f55;color:#cfc4d0;font-size:17px;display:flex;align-items:center;justify-content:center;gap:4px;padding:0 6px}
.nb.ok{background:#1e9e68;color:#fff;box-shadow:inset 0 5px 0 rgba(255,255,255,.16)}.nb.done{background:none;color:#1ebc73;font-size:15px;padding:0}
/* KC */
.fame{margin:0 8px;background:#3a2f3d;border-radius:11px;padding:6px 10px;display:flex;gap:11px;align-items:center;flex:none}
.por{width:76px;height:76px;flex:none;background:#231a25;border:4px solid #f9c22b;box-shadow:0 0 0 2px #8a5a12,inset 0 0 0 2px #8a5a12;border-radius:6px;display:flex;align-items:center;justify-content:center}
.fi{flex:1}.fi small{font-size:15px;color:#cfc4d0}.fi b{font-size:26px;color:#f9c22b;font-weight:400;line-height:1;display:block}
.stars{font:11px Arial;color:#f9c22b;letter-spacing:1px;margin:1px 0 4px}.fi i{height:7px}.fi i u{background:#f9c22b}.fi .fs{margin-top:4px;font-size:14px}
.ml3{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;padding:0 8px 4px;min-height:0;position:relative}
.ml3:before{content:"";position:absolute;left:33px;top:14px;bottom:18px;width:3px;background:#4a3f55}
.m3{display:flex;align-items:center;gap:8px;height:34px;position:relative}
.mv{width:52px;height:24px;border-radius:12px;background:#4a3f55;color:#cfc4d0;font-size:17px;display:flex;align-items:center;justify-content:center;flex:none;z-index:1}
.m3.done .mv{background:#1e9e68;color:#fff}.m3.next .mv{background:#f79617;color:#2e222f}
.mi{width:32px;height:32px;border-radius:8px;background:#231a25;display:flex;align-items:center;justify-content:center;flex:none}
.mt3{flex:1;min-width:0}.mt3 b{font-size:19px;font-weight:400;line-height:1;display:block;white-space:nowrap}.mt3 small{font-size:14px;color:#cfc4d0;line-height:1}
.m3.lock b{color:#9babb2}.m3.next{background:#3a2f3d;border:2px solid #f9c22b;border-radius:10px;height:46px;margin:0 -4px;padding:0 6px 0 2px}.m3.next b{color:#f9c22b}
.m3 i{height:4px;margin-top:2px;width:150px}.m3 i u{background:#f9c22b}
.ck{color:#1ebc73;font:bold 17px Arial;width:26px;text-align:center}.nx{background:#f79617;color:#2e222f;font-size:15px;border-radius:7px;padding:1px 6px}
/* KD */
.run3{margin:0 8px;background:#3a2f3d;border-radius:11px;padding:7px 10px;display:flex;gap:10px;align-items:center;flex:none}
.run3 b{font-size:20px;color:#f9c22b;font-weight:400;line-height:1;display:block}.run3 small{font-size:14px;color:#cfc4d0;margin-top:2px}
.fl3{flex:1;display:flex;flex-direction:column;justify-content:space-evenly;padding:3px 8px;min-height:0}
.f3{display:flex;align-items:center;gap:9px;background:#3a2f3d;border-radius:11px;padding:6px;box-shadow:0 3px 0 rgba(0,0,0,.3)}
.fic{width:50px;height:50px;border-radius:9px;background:#231a25;display:flex;align-items:center;justify-content:center;flex:none}
.ft3{flex:1;min-width:0}.ft3 b{font-size:22px;font-weight:400;line-height:1;display:block}.ft3 small{font-size:15px;color:#f9c22b;line-height:1;margin-top:3px}
.btn.fb3{width:104px;height:52px;font-size:17px;flex-direction:column;gap:1px}
.chr{margin:0 8px 6px;background:#231a25;border:2px dashed #6a5f70;border-radius:11px;padding:6px 9px;flex:none}
.ch1{display:flex;gap:9px;align-items:center}.ch1 b{font-size:19px;font-weight:400;line-height:1;display:block}.ch1 small{font-size:14px;color:#1ebc73;margin-top:1px}
.pp{display:flex;align-items:center;gap:4px;margin-top:5px}.pp s{width:17px;height:9px;border-radius:3px;background:#4a3f55}.pp s.on{background:#f9c22b}.pp span{font-size:14px;color:#cfc4d0;margin-left:6px}
'''

if SADA == '3':
    SCREENS, CSS, PREHLED = SCREENS3, CSS + (CSS2 % ()).replace('@CLEAN@', clean_pub()) + CSS3.replace('@PUB@', PUB), 'prehled-krigly'
    ROWS = (SCREENS,)
elif SADA == '2':
    SCREENS, CSS, PREHLED = SCREENS2, CSS + (CSS2 % ()).replace('@CLEAN@', clean_pub()), 'prehled-2'
    ROWS = (SCREENS[:6], SCREENS[6:])
else:
    PREHLED, ROWS = 'prehled', (SCREENS[:5], SCREENS[5:])

html = f'<html><head><meta charset="utf-8"><style>{CSS}</style></head><body data-prehled="{PREHLED}"{' data-crop="1"' if SADA == '3' else ''}>'
for part in ROWS:
    html += '<div class="row">' + ''.join(f'<div class="col"><div class="cap"><h2>{k[-1] if SADA == '3' else k} – {t}</h2><p>{d}</p></div><div class="scr" id="{k}">{body}</div></div>' for k, t, d, body in part) + '</div>'
html += '</body></html>'
open(OUT, 'w', encoding='utf-8').write(html)
print('ok', len(html) // 1024, 'kB')
