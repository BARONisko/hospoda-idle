import subprocess, sys, os
V='/tmp/claude-0/vid'; FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
ICON='/home/user/hospoda-idle/docs/play/ikona-512.png'
def esc(s): return s.replace('\\','\\\\').replace("'", "’").replace(':','\\:').replace('%','\\%')
def txt(lines, y0=330, size=84, col='white'):
    f=[]
    for i,(l) in enumerate(lines):
        c=col if i==0 else '#ffd23f'
        sz=size if i==0 else int(size*0.8)
        f.append(f"drawtext=fontfile={FB}:text='{esc(l)}':fontsize={sz}:fontcolor={c}:borderw=9:bordercolor=black:x=(w-tw)/2:y={y0+i*int(size*1.2)}")
    return f
def seg(n, clip, ss, dur, lines=(), zoom=1.0, push=0.0, speed=1.0, y0=330, ytxt=None):
    out=f'{V}/seg/{n}.mp4'
    vf=[f'setpts=(PTS-STARTPTS)/{speed}']
    if zoom>1 or push:
        vf.append(f"scale=w='trunc(1080*({zoom}+{push}*t/{dur})/2)*2':h=-2:eval=frame:flags=neighbor")
        vf.append(f"crop=1080:1920:(iw-1080)/2:min((ih-1920)/2\\,{int(1920*0.03)})")
    vf.append('scale=1080:1920,setsar=1,fps=30')
    if lines: vf+=txt(lines, y0)
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(ss),'-i',f'{V}/cfr/{clip}.mp4','-t',str(dur*speed),'-vf',','.join(vf),'-t',str(dur),'-an','-c:v','libx264','-crf','17','-preset','fast','-pix_fmt','yuv420p',out],check=True)
    return out
def endcard(n, dur=2.6, l1='P.U.B. IDLE', l2='Free on Google Play'):
    out=f'{V}/seg/{n}.mp4'
    fc=(f"[0:v]setpts=PTS-STARTPTS,scale=1080:1920,boxblur=18:2,eq=brightness=-0.25,fps=30[bg];"
        f"[1:v]scale=440:440[ic];[bg][ic]overlay=(W-w)/2:520,"
        + ','.join(txt([l1],1020,110)) + ',' + ','.join(txt([l2],1180,70,'#ffd23f'))
        + f",drawtext=fontfile={FB}:text='Dive Bar Tycoon':fontsize=58:fontcolor=white:borderw=6:bordercolor=black:x=(w-tw)/2:y=1300[v]")
    subprocess.run(['ffmpeg','-v','error','-y','-ss','2','-i',f'{V}/cfr/night.mp4','-loop','1','-i',ICON,'-filter_complex',fc,'-map','[v]','-t',str(dur),'-c:v','libx264','-crf','17','-preset','fast','-pix_fmt','yuv420p',out],check=True)
    return out
def join(name, segs, music):
    lst=f'{V}/seg/{name}.txt'; open(lst,'w').write(''.join(f"file '{s}'\n" for s in segs))
    tmp=f'{V}/seg/{name}_v.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy',tmp],check=True)
    d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',tmp]))
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-i',music,'-filter_complex',f'[1:a]atrim=0:{d},afade=t=out:st={d-0.8}:d=0.8,volume=0.9[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',f'{V}/out/{name}.mp4'],check=True)
    print(name, round(d,1))
M=f'{V}/music/polka.wav'
which=sys.argv[1:] or ['vampiri','miliardy','spanek']
if 'vampiri' in which:
    s=[seg('v1','night',3,1.6,['THIS PUB SERVES','VAMPIRES'],zoom=1.5,push=0.15),
       seg('v2','day',1.0,1.3,['By day: humans','pay in coins'],zoom=1.35),
       seg('v3','night',7.5,1.5,['At night: monsters','pay in BONES'],zoom=1.5,push=0.1),
       seg('v4','gold',3.5,1.5,['Tap golden barrels'],zoom=1.4,push=0.1),
       seg('v5','darts',1.0,1.2,['Darts with the regulars']),
       seg('v6','temple',2.0,1.8,['...and CTHULHU','is a regular'],y0=1000),
       seg('v7','away',2.5,1.8,['It earns while','you sleep'],y0=230),
       endcard('v8')]
    join('1-vampiri', s, M)
if 'miliardy' in which:
    s=[seg('m1','fresh',0.3,1.6,['I inherited the','WORST pub','6 coins'],zoom=1.0,y0=1000),
       seg('m2','fresh',3.0,1.2,['Tap. Tap. Tap.'],zoom=1.4,speed=3,y0=1000),
       seg('m3','day',0.5,1.6,['3 months later...','3.48 BILLION'],zoom=1.0,y0=330),
       seg('m4','day',8.0,1.4,['3 pubs at once'],zoom=1.3,push=0.1),
       seg('m5','gold',5.0,1.4,['Golden barrels!'],zoom=1.4,push=0.1),
       seg('m6','night',3.0,1.4,['Night shift: vampires'],zoom=1.45),
       seg('m7','away',2.5,1.8,['+38 BILLION','while I slept'],y0=230),
       endcard('m8')]
    join('2-miliardy', s, M)
if 'spanek' in which:
    s=[seg('s1','away',1.0,2.0,['POV: you closed the','game for 8 hours'],y0=230),
       seg('s2','day',3.0,1.3,['Your staff kept','pouring beer'],zoom=1.35,push=0.1),
       seg('s3','night',1.5,1.3,['Even at night'],zoom=1.5),
       seg('s4','gold',2.0,1.3,['Golden barrel!'],zoom=1.4,push=0.1),
       seg('s5','day',12.0,1.3,['All pubs earn at once'],zoom=1.35),
       seg('s6','temple',4.0,1.6,['Fight Cthulhu','on weekends'],y0=1000),
       endcard('s7', l2='Pour the first beer')]
    join('3-spanek', s, M)
