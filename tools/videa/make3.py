import subprocess
V='/tmp/claude-0/vid'; H=V+'/hi'; JER=V+'/font/jersey10.ttf'; ICON='/home/user/hospoda-idle/docs/play/ikona-512.png'
def esc(s): return s.replace("'", "’").replace(':','\\:').replace(',','\\,')
def cap(lines, y=430, size=104):
    return [f"drawtext=fontfile={JER}:text='{esc(l)}':fontsize={size}:fontcolor=white:borderw=6:bordercolor=black:x=(w-tw)/2-50:y={y+i*int(size*0.95)}" for i,l in enumerate(lines)]
def seg(n, clip, ss, dur, crop, k, lines=(), extra='', y=430):
    cx,cy,w,h=crop
    vf=['setpts=PTS-STARTPTS',f'crop={w}:{h}:{cx}:{cy}',f'scale={w*k}:{h*k}:flags=neighbor','setsar=1','fps=30']+([extra] if extra else [])+cap(lines,y)
    out=f'{V}/seg3/{n}.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(ss),'-i',f'{H}/{clip}.mp4','-t',str(dur+0.1),'-vf',','.join(vf),'-t',str(dur),'-an','-c:v','libx264','-crf','16','-preset','slow','-pix_fmt','yuv420p',out],check=True)
    return out
def endcard(n, dur):
    out=f'{V}/seg3/{n}.mp4'
    fc=(f"color=c=#1a1420:s=1080x1920:r=30:d={dur}[bg];[1:v]scale=384:384:flags=neighbor[ic];[bg][ic]overlay=(W-w)/2:540,"
        f"drawtext=fontfile={JER}:text='P.U.B. Idle':fontsize=170:fontcolor=white:borderw=6:bordercolor=black:x=(w-tw)/2:y=960,"
        f"drawtext=fontfile={JER}:text='free on Google Play':fontsize=92:fontcolor=#ffd23f:borderw=6:bordercolor=black:x=(w-tw)/2:y=1140[v]")
    subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','nullsrc=s=16x16','-loop','1','-i',ICON,'-filter_complex',fc,'-map','[v]','-t',str(dur),'-c:v','libx264','-crf','16','-preset','slow','-pix_fmt','yuv420p',out],check=True)
    return out
P=(162,130,216,384)
segs=[seg('d1','empty',2.0,2.0,(0,0,540,960),2,['i inherited the','worst pub in town'],y=860),
      seg('d2','day',3.0,1.6,(0,0,540,960),2,['90 days later'],y=860),
      seg('d3','gold',3.6,0.8,(200,130,216,384),5),
      seg('d4','brawl',5.6,0.8,P,5),
      seg('d5','day',12.6,0.8,P,5),
      seg('d6','temple',1.5,0.8,(162,290,216,384),5),
      seg('d7','away',2.0,2.8,(0,0,540,960),2,['it made this','while i slept'],y=320),
      endcard('d8',1.5)]
# text okna výdělku: nad oknem (okno začíná ~y 200 v 540 → 400 v 1080) – posunout titulek výš
lst=f'{V}/seg3/d.txt'; open(lst,'w').write(''.join(f"file '{s}'\n" for s in segs))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',lst,'-c','copy',f'{V}/seg3/d_v.mp4'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',f'{V}/seg3/d_v.mp4','-i',f'{V}/music/polka2.wav','-filter_complex','[1:a]atrim=0:11.1,volume=0.6[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',f'{V}/out3/D-proměna.mp4'],check=True)
