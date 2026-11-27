import subprocess, sys
V='/tmp/claude-0/vid'; H=V+'/hi'
INTER='/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'; JER=V+'/font/jersey10.ttf'
ICON='/home/user/hospoda-idle/docs/play/ikona-512.png'
def esc(s): return s.replace('\\','\\\\').replace("'", "’").replace(':','\\:').replace('%','\\%').replace(',','\\,')
VIEW={'full':(0,0,540,960,2),'zoom':(90,0,360,640,3),'close':(135,60,270,480,4)}
def cap(lines,y=300,size=54):
    # popisek ve stylu TikToku: bílé písmo na tmavém pruhu
    return [f"drawtext=fontfile={INTER}:text='{esc(l)}':fontsize={size}:fontcolor=white:box=1:boxcolor=black@0.62:boxborderw=18:x=(w-tw)/2:y={y+i*int(size*1.65)}" for i,l in enumerate(lines)]
def seg(n, clip, ss, dur, view='full', lines=(), y=300, speed=1.0, x=None):
    cx,cy,w,h,k=VIEW[view]
    if x is not None: cx=x
    vf=[f'setpts=(PTS-STARTPTS)/{speed}',f'crop={w}:{h}:{cx}:{cy}',f'scale={w*k}:{h*k}:flags=neighbor','setsar=1','fps=30']+cap(lines,y)
    out=f'{V}/seg2/{n}.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(ss),'-i',f'{H}/{clip}.mp4','-t',str(dur*speed+0.1),'-vf',','.join(vf),'-t',str(dur),'-an','-c:v','libx264','-crf','14','-preset','fast','-pix_fmt','yuv420p',out],check=True)
    return out
def split(n, dur, top=('fresh',0.5), bot=('day',3.0), lt='DAY 1', lb='DAY 90'):
    out=f'{V}/seg2/{n}.mp4'
    fc=(f"[0:v]setpts=PTS-STARTPTS,crop=540:480:0:70,scale=1080:960:flags=neighbor,fps=30[a];"
        f"[1:v]setpts=PTS-STARTPTS,crop=540:480:0:70,scale=1080:960:flags=neighbor,fps=30[b];"
        f"[a][b]vstack,drawbox=y=956:w=iw:h=8:color=black:t=fill,"
        f"drawtext=fontfile={JER}:text='{lt}':fontsize=150:fontcolor=white:borderw=8:bordercolor=black:x=50:y=720,"
        f"drawtext=fontfile={JER}:text='{lb}':fontsize=150:fontcolor=#ffd23f:borderw=8:bordercolor=black:x=50:y=1690[v]")
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(top[1]),'-i',f'{H}/{top[0]}.mp4','-ss',str(bot[1]),'-i',f'{H}/{bot[0]}.mp4','-filter_complex',fc,'-map','[v]','-t',str(dur),'-c:v','libx264','-crf','14','-preset','fast','-pix_fmt','yuv420p',out],check=True)
    return out
def endcard(n, dur=2.5, sub='Free on Google Play'):
    out=f'{V}/seg2/{n}.mp4'
    fc=(f"[0:v]setpts=PTS-STARTPTS,crop=270:480:135:90,scale=1080:1920:flags=neighbor,boxblur=14:2,eq=brightness=-0.3,fps=30[bg];"
        f"[1:v]scale=384:384:flags=neighbor[ic];[bg][ic]overlay=(W-w)/2:560,"
        f"drawtext=fontfile={JER}:text='P.U.B. Idle':fontsize=150:fontcolor=white:borderw=8:bordercolor=black:x=(w-tw)/2:y=1000,"
        f"drawtext=fontfile={INTER}:text='{esc(sub)}':fontsize=54:fontcolor=white:x=(w-tw)/2:y=1190[v]")
    subprocess.run(['ffmpeg','-v','error','-y','-ss','2','-i',f'{H}/night.mp4','-loop','1','-i',ICON,'-filter_complex',fc,'-map','[v]','-t',str(dur),'-c:v','libx264','-crf','14','-preset','fast','-pix_fmt','yuv420p',out],check=True)
    return out
def join(name, segs, music=V+'/music/polka2.wav', vol=0.55):
    lst=f'{V}/seg2/{name}.txt'; open(lst,'w').write(''.join(f"file '{s}'\n" for s in segs))
    tmp=f'{V}/seg2/{name}_v.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy',tmp],check=True)
    d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',tmp]))
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-i',music,'-filter_complex',f'[1:a]atrim=0:{d},afade=t=out:st={d-1}:d=1,volume={vol}[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',f'{V}/out2/{name}.mp4'],check=True)
    print(name, round(d,1))
w=sys.argv[1:] or ['A','B','C']
if 'A' in w:  # devlog: věcné popisky v první osobě
    join('A-devlog',[seg('a1','day',1.0,2.6,'full',['I made an idle game about','running a pub'],y=260),
        seg('a2','day',4.0,2.2,'zoom',['your staff keep pouring','beer while you’re away'],y=150),
        seg('a3','night',4.0,2.4,'zoom',['at night the monsters','come in and pay in bones'],y=150),
        seg('a4','gold',3.5,2.0,'close',['golden barrels roll in','sometimes'],y=150),
        seg('a5','temple',1.5,2.2,'full',['and on weekends you can','fight Cthulhu'],y=1500),
        seg('a6','away',2.0,2.0,'full',['it’s out now on Android'],y=200),
        endcard('a7')])
if 'B' in w:  # bez textu, jen hra zblízka
    join('B-jen-hra',[seg('b1','gold',2.5,1.6,'close'),seg('b2','night',6.0,1.4,'close'),seg('b3','day',2.0,1.4,'zoom'),
        seg('b4','brawl',4.0,1.4,'close'),seg('b5','day',9.0,1.4,'zoom'),seg('b6','darts',0.5,1.4,'zoom',x=90),
        seg('b7','temple',2.0,1.6,'full'),seg('b8','away',2.5,1.6,'full'),endcard('b9')])
if 'C' in w:  # den 1 vs den 90
    join('C-den1-den90',[split('c1',3.5),
        seg('c2','day',6.0,1.6,'zoom'),seg('c3','night',5.0,1.6,'zoom'),seg('c4','gold',4.0,1.5,'close'),
        seg('c5','away',2.5,1.8,'full'),endcard('c6')])
