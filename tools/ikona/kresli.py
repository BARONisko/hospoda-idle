# Návrhy ikony A/B/C (pixel art, mřížka 64×64 → 512)
from PIL import Image, ImageDraw
import math, sys
SPR='tools/_tmp/spr/'  # sprity: node tools/sprity.mjs tools/_tmp/spr cthulhu/10 (vite na portu 5177)
OUT='docs/navrhy-ui/ikona-2/'
N=64
LAYERS=False
INK=(38,26,36,255)
def hx(h,a=255): h=h.lstrip('#'); return (int(h[0:2],16),int(h[2:4],16),int(h[4:6],16),a)

class C:
    def __init__(s): s.im=Image.new('RGBA',(N,N),(0,0,0,0)); s.d=ImageDraw.Draw(s.im)
    def px(s,x,y,c):
        if 0<=x<N and 0<=y<N: s.im.putpixel((x,y),c)
    def rect(s,x0,y0,x1,y1,c): s.d.rectangle([x0,y0,x1,y1],fill=c)
    def ell(s,x0,y0,x1,y1,c): s.d.ellipse([x0,y0,x1,y1],fill=c)
    def poly(s,pts,c): s.d.polygon(pts,fill=c)

def outline(layer,col=INK):
    """1px obrys kolem neprůhledných pixelů vrstvy"""
    w,h=layer.size; o=Image.new('RGBA',(w,h),(0,0,0,0)); a=layer.getchannel('A').load(); op=o.load()
    for y in range(h):
        for x in range(w):
            if a[x,y]: continue
            for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
                xx,yy=x+dx,y+dy
                if 0<=xx<w and 0<=yy<h and a[xx,yy]: op[x,y]=col; break
    o.alpha_composite(layer); return o

def rays(bg,c1,c2,cx=32,cy=32,n=12):
    im=Image.new('RGBA',(N,N),c1); d=ImageDraw.Draw(im)
    for i in range(n):
        a0=2*math.pi*i/n; a1=a0+math.pi/n
        d.polygon([(cx,cy),(cx+90*math.cos(a0),cy+90*math.sin(a0)),(cx+90*math.cos(a1),cy+90*math.sin(a1))],fill=c2)
    return im

def vignette(im,col,strength=0.55):
    w,h=im.size; p=im.load()
    for y in range(h):
        for x in range(w):
            r=math.hypot(x-31.5,y-31.5)/45
            # stupňovitě (pixel-art kroky)
            t=min(1,max(0,(r-0.45)/0.55)); t=round(t*3)/3*strength
            c=p[x,y]; p[x,y]=tuple(int(c[i]*(1-t)+col[i]*t) for i in range(3))+(255,)
    return im

def sparkle(c,x,y,col=hx('fff3c4')):
    for dx,dy in ((0,0),(1,0),(-1,0),(0,1),(0,-1)): c.px(x+dx,y+dy,col)

def mug(c,x,y,s=1,tilt=False):
    """krígl: x,y levý horní roh skla, šířka 12, výška 14 (při s=1)"""
    glass=hx('cfe6dc'); beer=hx('f5a623'); beer2=hx('ffc43d'); foam=hx('ffffff'); foam2=hx('e8e2d0')
    c.rect(x,y+3,x+11,y+15,glass)            # sklo
    c.rect(x+1,y+4,x+10,y+14,beer)           # pivo
    c.rect(x+2,y+5,x+3,y+12,beer2)           # odlesk
    c.rect(x+12,y+6,x+15,y+7,glass); c.rect(x+14,y+6,x+15,y+12,glass); c.rect(x+12,y+11,x+15,y+12,glass) # ucho
    c.ell(x-2,y-1,x+5,y+5,foam); c.ell(x+3,y-2,x+10,y+4,foam); c.ell(x+7,y,x+13,y+5,foam)  # pěna
    c.rect(x-1,y+3,x+12,y+5,foam); c.px(x+1,y+6,foam); c.px(x+9,y+7,foam); c.px(x+9,y+6,foam)  # stéká
    c.rect(x+2,y+4,x+8,y+4,foam2)

def coin(c,x,y):
    c.ell(x,y,x+6,y+6,hx('ffcf3a')); c.ell(x+1,y+1,x+5,y+5,hx('f2a516')); c.rect(x+3,y+2,x+3,y+4,hx('ffe680')); c.px(x+1,y+1,hx('fff3c4'))

def finish(layers,bg,name,shadow=True):
    out=bg.copy()
    if LAYERS: bg.resize((512,512),Image.NEAREST).save(OUT+name+'-pozadi.png'); out=Image.new('RGBA',(N,N),(0,0,0,0))
    for L in layers:
        L=getattr(L,'im',L); L2=outline(L)
        if shadow:
            sh=Image.new('RGBA',(N,N),(0,0,0,0)); a=L2.getchannel('A')
            sh.paste(Image.new('RGBA',(N,N),(30,14,10,110)),(1,1),a)
            out.alpha_composite(sh)
        out.alpha_composite(L2)
    big=out.resize((512,512),Image.NEAREST)
    if LAYERS: big.save(OUT+name+'-popredi.png')
    else: big.convert('RGB').save(OUT+name+'.png')
    return big

# ---------------- A: hospodský ----------------
def A():
    bg=rays(None,hx('1fa6a0'),hx('27b8b1'),32,26,14); bg=vignette(bg,hx('0d5f63'))
    sk=hx('f4b98c'); sk2=hx('d98a5f'); sk3=hx('ffd7b0')
    body=C()
    # ramena / košile + zástěra
    body.ell(6,46,58,80,hx('f4f1e6')); body.rect(18,50,46,63,hx('8a4b2a')); body.rect(18,50,46,51,hx('6d3720'))
    body.rect(14,50,17,63,hx('f4f1e6')); body.rect(47,50,50,63,hx('f4f1e6'))
    body.poly([(26,46),(32,54),(38,46)],hx('d9d4c4'))   # výstřih
    body.rect(30,50,34,52,hx('b5281f'))                 # motýlek
    body.rect(27,49,29,53,hx('d63a2c')); body.rect(35,49,37,53,hx('d63a2c'))
    head=C()
    head.ell(13,8,51,48,sk)                    # hlava
    head.ell(9,24,16,35,sk); head.ell(48,24,55,35,sk)   # uši
    head.ell(11,26,14,32,sk2); head.ell(50,26,53,32,sk2)
    head.ell(19,10,36,20,sk3)                  # lesk pleše
    head.rect(22,12,25,13,(255,240,220,255))
    head.ell(14,30,20,40,sk2) if False else None
    # obočí zvednuté
    head.rect(19,22,26,23,hx('5a3320')); head.px(19,24,hx('5a3320')); head.rect(37,20,44,21,hx('5a3320')); head.px(44,22,hx('5a3320'))
    # oči (mrknutí vlevo)
    head.rect(20,27,25,28,INK)  # zavřené oko ^
    head.px(19,28,INK); head.px(26,28,INK)
    head.rect(38,25,42,29,hx('ffffff')); head.rect(40,26,42,29,INK); head.px(41,26,hx('ffffff'))
    # nos
    head.ell(28,28,36,36,sk2); head.ell(29,28,35,34,hx('f09a78')); head.px(30,29,sk3)
    # tváře
    head.rect(17,32,21,34,hx('f08a7a')); head.rect(43,32,47,34,hx('f08a7a'))
    # úsměv
    head.ell(22,37,42,46,INK); head.rect(22,37,42,40,sk) ; head.ell(24,38,40,44,hx('8c1c24'))
    head.rect(24,38,40,40,sk); head.rect(25,40,39,41,hx('ffffff'))
    # knír
    head.ell(19,34,32,40,hx('5a3320')); head.ell(32,34,45,40,hx('5a3320'))
    head.px(18,38,hx('5a3320')); head.px(46,38,hx('5a3320')); head.rect(17,39,18,40,hx('5a3320')); head.rect(46,39,47,40,hx('5a3320'))
    head.rect(22,35,30,35,hx('7a4a30')); head.rect(34,35,42,35,hx('7a4a30'))
    # krígl + ruka vpravo dole
    hand=C(); mug(hand,43,37); hand.ell(39,47,47,55,sk); hand.rect(40,49,42,52,sk2)
    # mince
    cs=C(); coin(cs,8,15); coin(cs,49,10)
    big=finish([body,head,hand,cs],bg,'A-hospodsky')
    return big

# ---------------- B: Cthulhu štamgast ----------------
def B():
    bg=Image.new('RGBA',(N,N),hx('f5a623')); bg=rays(None,hx('f5a623'),hx('f8b640'),32,30,12); bg=vignette(bg,hx('c4561a'),0.7)
    s=Image.open(SPR+'cthulhu_8.png').convert('RGBA')   # 78×64, šťastný s pivem
    bb=s.getbbox(); s=s.crop(bb)
    # výřez: hlava + paže s půllitrem (horní část)
    w,h=s.size
    crop=s.crop((0,0,w,int(h*0.78)))
    # vejít do 64 – zmenšit ne, raději vyříznout: posadit tak, aby hlava a pivo byly ve středu
    L=Image.new('RGBA',(N,N),(0,0,0,0))
    cw,ch=crop.size
    sc=min(60/cw, 60/ch)
    if sc<1:
        # nechat 1:1 a oříznout křídla po stranách
        cx=cw//2; crop=crop.crop((max(0,cx-32),0,min(cw,cx+32),ch)); cw,ch=crop.size
    L.alpha_composite(crop,((N-cw)//2,N-ch))
    # tvářičky (blažený výraz)
    out=bg.copy()
    sh=Image.new('RGBA',(N,N),(0,0,0,0)); sh.paste(Image.new('RGBA',(N,N),(60,20,10,110)),(1,1),L.getchannel('A')); out.alpha_composite(sh); out.alpha_composite(L)
    fx=C(); sparkle(fx,6,8); sparkle(fx,57,12); sparkle(fx,55,40)
    out.alpha_composite(fx.im)
    out.resize((512,512),Image.NEAREST).convert('RGB').save(OUT+'B-cthulhu-raw.png')
    return out


def B2():
    G=57
    s=Image.open(SPR+'cthulhu_10.png').convert('RGBA').crop((3,0,59,46))   # hlava, chapadla, půllitr
    bg=Image.new('RGBA',(G,G)); 
    # paprsky + viněta na mřížce G
    d=ImageDraw.Draw(bg); bg.paste(hx('f5a623'),(0,0,G,G))
    cx,cy=28,22
    for i in range(12):
        a0=2*math.pi*i/12; a1=a0+math.pi/12
        d.polygon([(cx,cy),(cx+90*math.cos(a0),cy+90*math.sin(a0)),(cx+90*math.cos(a1),cy+90*math.sin(a1))],fill=hx('f9bb45'))
    p=bg.load()
    for y in range(G):
        for x in range(G):
            r=math.hypot(x-28,y-28)/40; t=min(1,max(0,(r-0.45)/0.55)); t=round(t*3)/3*0.7
            c=p[x,y]; p[x,y]=tuple(int(c[i]*(1-t)+hx('c4561a')[i]*t) for i in range(3))+(255,)
    L=Image.new('RGBA',(G,G),(0,0,0,0)); ox=(G-s.width)//2; oy=G-s.height+2
    L.alpha_composite(s,(ox,oy))
    # růžové tváře pod zavřenýma očima
    for (x,y) in ((33-3,11),(34-3,11),(41-3,11),(42-3,11)):
        L.putpixel((x+ox,y+oy+1),hx('e86a7a'))
    sh=Image.new('RGBA',(G,G),(0,0,0,0)); sh.paste(Image.new('RGBA',(G,G),(70,25,10,120)),(1,1),L.getchannel('A'))
    bg.alpha_composite(sh); bg.alpha_composite(L)
    fx=Image.new('RGBA',(G,G),(0,0,0,0)); 
    for (x,y) in ((6,7),(50,9),(8,30)):
        for dx,dy in ((0,0),(1,0),(-1,0),(0,1),(0,-1)): fx.putpixel((x+dx,y+dy),hx('fff3c4'))
    bg.alpha_composite(fx)
    big=bg.resize((G*9,G*9),Image.NEAREST).crop((0,0,512,512)); big.convert('RGB').save(OUT+'B-cthulhu.png')

def Cc():
    bg=rays(None,hx('7b3fb0'),hx('8a4cc2'),32,30,14); bg=vignette(bg,hx('3a1a5a'),0.6)
    # upír vlevo
    V=C(); pale=hx('cfd8e0'); pale2=hx('9fb0c0')
    V.ell(1,14,27,44,pale); 
    V.poly([(1,22),(4,12),(14,9),(24,10),(28,16),(28,22),(20,18),(14,22),(8,18)],hx('1f1a2e'))  # vlasy s cípem
    V.poly([(12,18),(14,24),(16,18)],hx('1f1a2e'))
    V.rect(15,24,20,25,hx('1f1a2e'))   # obočí
    V.rect(16,27,20,29,hx('ffffff')); V.rect(18,27,20,29,hx('d11f2f'))
    V.ell(13,33,25,41,INK); V.ell(14,33,24,39,hx('8c1c24')); V.rect(14,33,24,34,pale)
    V.rect(15,35,23,35,hx('ffffff')); V.px(16,36,hx('ffffff')); V.px(22,36,hx('ffffff')); V.px(16,37,hx('ffffff')); V.px(22,37,hx('ffffff'))
    V.ell(-6,44,30,72,hx('1f1a2e')); V.poly([(4,44),(12,52),(14,44)],hx('b5182a')); V.poly([(14,44),(16,52),(24,44)],hx('b5182a'))
    V.rect(12,44,16,58,hx('f4f1e6'))
    # trpaslík vpravo
    D=C(); sk=hx('f4b98c'); red=hx('d9572a'); red2=hx('b03e1c')
    D.ell(38,16,62,42,sk)
    D.ell(34,30,66,62,red); D.ell(40,44,60,64,red2); D.rect(42,34,58,38,red)
    D.ell(42,30,50,36,red); D.ell(50,30,58,36,red)   # knír
    D.ell(44,35,54,41,INK); D.ell(45,35,53,40,hx('8c1c24')); D.rect(45,35,53,36,red)
    D.ell(40,21,46,31,hx('e89a70')); 
    D.rect(41,23,44,24,red2); D.rect(48,23,52,24,red2)  # obočí
    D.rect(42,26,44,28,INK); D.rect(49,26,51,28,INK); D.px(43,26,hx('ffffff')); D.px(50,26,hx('ffffff'))
    D.ell(36,8,64,22,hx('9aa4b0')); D.rect(36,16,64,20,hx('7a8390')); D.rect(48,6,51,16,hx('c9a227'))
    D.poly([(36,14),(30,4),(38,10)],hx('f4f1e6')); D.poly([(63,14),(64,4),(60,10)],hx('f4f1e6'))
    # půllitry v nárazu nahoře uprostřed
    M=C(); mug(M,17,41); mug(M,33,41)
    fx=C(); sparkle(fx,31,37,hx('ffffff')); sparkle(fx,27,34); sparkle(fx,36,33)
    cs=C(); coin(cs,2,57); coin(cs,56,57)
    finish([V,D,M,fx],bg,'C-pripitek')



def B3():
    G=47
    src=Image.open(SPR+'cthulhu_10.png').convert('RGBA')
    body=src.crop((20,0,62,43)); mg=src.crop((4,25,20,42))
    bg=Image.new('RGBA',(G,G),hx('f5a623')); d=ImageDraw.Draw(bg); cx,cy=23,12
    for i in range(12):
        a0=2*math.pi*i/12; a1=a0+math.pi/12
        d.polygon([(cx,cy),(cx+70*math.cos(a0),cy+70*math.sin(a0)),(cx+70*math.cos(a1),cy+70*math.sin(a1))],fill=hx('f9bb45'))
    p=bg.load()
    for y in range(G):
        for x in range(G):
            r=math.hypot(x-23,y-23)/33; t=min(1,max(0,(r-0.45)/0.55)); t=round(t*3)/3*0.7
            c=p[x,y]; p[x,y]=tuple(int(c[i]*(1-t)+hx('c4561a')[i]*t) for i in range(3))+(255,)
    L=Image.new('RGBA',(G,G),(0,0,0,0)); L.alpha_composite(body,(5,4))
    for (x,y) in ((16,16),(17,16),(24,16),(25,16)): L.putpixel((x,y),hx('e86a7a'))
    L.alpha_composite(mg,(5,G-mg.height-3))
    for (x,y) in ((5,6),(41,8),(40,30)):
        for dx,dy in ((0,0),(1,0),(-1,0),(0,1),(0,-1)): bg.putpixel((x+dx,y+dy),hx('fff3c4'))
    sh=Image.new('RGBA',(G,G),(0,0,0,0)); sh.paste(Image.new('RGBA',(G,G),(70,25,10,120)),(1,1),L.getchannel('A'))
    bg.alpha_composite(sh); bg.alpha_composite(L)
    big=bg.resize((G*11,G*11),Image.NEAREST).crop((2,2,514,514)); big.convert('RGB').save(OUT+'B-cthulhu.png')


def B4():
    bg=rays(None,hx('f5a623'),hx('f9bb45'),32,24,12); bg=vignette(bg,hx('c4561a'),0.7)
    g=hx('2f9e5a'); g2=hx('1f7a44'); g3=hx('5cc97a'); g4=hx('15583a')
    H=C()
    # chapadla (pod hlavou)
    import math as m
    for i,x0 in enumerate([12,19,26,36,43,50]):
        for y in range(30,62):
            k=(y-30)/32; x=int(x0+ (3 if i<3 else -3)*m.sin(k*3.2+i)*(1+k*2) + (-6*k if i<2 else 6*k if i>3 else 0))
            w=max(1,int(4-3*k)); H.rect(x-w//2-1,y,x+w//2+1,y,g if i%2 else g2)
        # zatočený konec
    H.ell(10,2,54,38,g)                      # hlava (kopule)
    H.ell(14,4,32,16,g3); H.rect(18,6,22,7,hx('9be8a8'))   # lesk
    H.ell(36,8,42,13,g2); H.ell(44,16,48,20,g2); H.ell(16,20,20,24,g2)  # skvrny
    # oči: velké bílé, blažené (dolní víčko nahoru = úsměv očima)
    for ex in (17,35):
        H.ell(ex,15,ex+12,27,hx('ffffff')); H.ell(ex+3,17,ex+9,24,INK); H.rect(ex+4,18,ex+5,19,hx('ffffff'))
        H.ell(ex-1,24,ex+13,32,g)              # spodní víčko – šťastný výraz
    H.rect(14,27,18,28,hx('ef7a8a')); H.rect(46,27,50,28,hx('ef7a8a'))   # tváře
    # půllitr ve středu dole, v chapadlech
    M=C(); mug(M,23,40)
    T=C()   # chapadla obtočená kolem půllitru
    T.rect(20,47,24,49,g); T.rect(35,45,41,47,g2); T.rect(20,52,26,54,g2); T.rect(36,51,41,53,g)
    fx=C(); sparkle(fx,8,10); sparkle(fx,56,12); sparkle(fx,52,40)
    out=bg.copy()
    for L in (H,M,T):
        L2=outline(L.im); sh=Image.new('RGBA',(N,N),(0,0,0,0)); sh.paste(Image.new('RGBA',(N,N),(70,25,10,110)),(1,1),L2.getchannel('A')); out.alpha_composite(sh); out.alpha_composite(L2)
    out.alpha_composite(fx.im)
    out.resize((512,512),Image.NEAREST).convert('RGB').save(OUT+'B-cthulhu.png')


def launcher():
    """vrstvy ikony A pro Android (adaptivní ikona) do tools/_tmp"""
    global LAYERS, OUT
    LAYERS=True; o=OUT; OUT='tools/_tmp/'; A(); LAYERS=False; OUT=o

if __name__=='__main__':
    import sys
    if 'launcher' in sys.argv: launcher()
    else: A(); B4(); Cc()
