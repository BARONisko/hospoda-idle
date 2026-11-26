# Vlastní chiptune polka (původní skladba, generovaná kódem – bez licencí)
import numpy as np, wave, sys
SR=44100; BPM=float(sys.argv[2]) if len(sys.argv)>2 else 150; beat=60/BPM; e=beat/2
def note(n): return 440*2**((n-69)/12)
def sq(f,d,duty=0.5,vol=0.2):
    t=np.arange(int(SR*d))/SR; w=np.where((t*f)%1<duty,1.0,-1.0)
    env=np.minimum(1,np.minimum(t/0.005,(d-t)/0.02).clip(0))*np.exp(-t*3)
    return w*env*vol
def tri(f,d,vol=0.35):
    t=np.arange(int(SR*d))/SR; w=2*np.abs(2*((t*f)%1)-1)-1
    env=np.minimum(1,(d-t).clip(0)/0.02)*np.exp(-t*6); return w*env*vol
def kick(vol=0.6):
    t=np.arange(int(SR*0.15))/SR; f=120*np.exp(-t*30)+45
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*25)*vol
def hat(vol=0.08,d=0.04):
    t=np.arange(int(SR*d))/SR; return np.random.uniform(-1,1,len(t))*np.exp(-t*90)*vol
def snare(vol=0.25):
    t=np.arange(int(SR*0.12))/SR; return (np.random.uniform(-1,1,len(t))*0.8+np.sin(2*np.pi*190*t)*0.4)*np.exp(-t*30)*vol
bars=int(sys.argv[3]) if len(sys.argv)>3 else 12
L=int(SR*(bars*4*beat+1)); out=np.zeros(L)
def put(x,at):
    i=int(at*SR); out[i:i+len(x)]+=x[:max(0,L-i)]
# akordy: C G Am F … (po taktech), oom-pah: basa na 1/3, akord na 2/4
prog=[(48,[60,64,67]),(43,[59,62,67]),(45,[60,64,69]),(41,[60,65,69])]
mel=[ # osminy (MIDI, 0=pauza) – 4 takty = 32 osmin, opakuje se s obměnou
 [72,0,76,79,84,79,76,74, 74,0,79,74,71,74,79,0, 76,0,72,76,81,76,72,76, 77,76,74,72,74,76,77,0],
 [84,83,81,79,81,79,76,79, 79,0,74,79,83,0,79,0, 81,79,76,72,76,79,81,84, 84,0,81,0,77,0,72,0]]
for b in range(bars):
    t0=b*4*beat; root,ch=prog[b%4]
    for k in range(4):
        tb=t0+k*beat
        if k%2==0: put(tri(note(root if k==0 else root+7),beat*0.9),tb); put(kick(),tb)
        else:
            for c in ch: put(sq(note(c),beat*0.5,0.25,0.06),tb)
            put(snare(),tb)
        put(hat(),tb); put(hat(0.05),tb+e)
    m=mel[(b//4)%2] if b>=1 else None
    if b>=1:
        seg=m[(b%4)*8:(b%4)*8+8]
        for j,n in enumerate(seg):
            if n: put(sq(note(n),e*0.95,0.5,0.13)+sq(note(n)*1.005,e*0.95,0.125,0.04),t0+j*e)
# riser do prvního taktu (háček)
out=out/np.max(np.abs(out))*0.85
fade=int(SR*0.8); out[-fade:]*=np.linspace(1,0,fade)
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes())
