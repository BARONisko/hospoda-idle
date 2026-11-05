// Zvuky syntetizované přes Web Audio (žádné soubory) – zjednodušené z P.U.B. (src/systems/audio.ts).
class Sfx {
  ctx: AudioContext | null = null;
  private out!: GainNode;
  private noise!: AudioBuffer;
  muted = false;

  /** musí se zavolat z dotyku/kliku (prohlížeče jinak zvuk nepustí) */
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      this.ctx = new AudioContext();
    } catch {
      return;
    }
    this.out = this.ctx.createGain();
    this.out.gain.value = this.muted ? 0 : 0.8;
    this.out.connect(this.ctx.destination);
    this.noise = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.out) this.out.gain.value = m ? 0 : 0.8;
  }

  tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.12, slideTo?: number, delay = 0) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  hiss(dur: number, freq: number, vol = 0.1, slideTo?: number, delay = 0) {
    if (!this.ctx || this.muted) return;
    const c = this.ctx, t = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(freq, t);
    if (slideTo) f.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(this.out);
    s.start(t);
    s.stop(t + dur + 0.05);
  }

  click() {
    this.tone(660, 0.05, 'square', 0.06);
    this.tone(990, 0.04, 'square', 0.04, undefined, 0.03);
  }
  error() {
    this.tone(180, 0.12, 'square', 0.08);
    this.tone(140, 0.16, 'square', 0.08, undefined, 0.07);
  }
  buy() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.1, 'square', 0.07, undefined, i * 0.05));
  }
  /** výdělek stanice: tiché cinknutí (výška podle hospody, ať se tři hospody neslévají) */
  coin(pitch = 1) {
    this.tone(988 * pitch, 0.06, 'triangle', 0.035);
    this.tone(1319 * pitch, 0.16, 'triangle', 0.035, undefined, 0.05);
  }
  /** spropitné od hosta */
  tip() {
    this.tone(1319, 0.07, 'triangle', 0.07);
    this.tone(1760, 0.2, 'triangle', 0.07, undefined, 0.06);
    this.tone(2637, 0.12, 'sine', 0.03, undefined, 0.06);
  }
  pour() {
    this.hiss(0.35, 700, 0.05, 1600);
  }
  hire() {
    this.tone(220, 0.12, 'square', 0.07, 440);
    this.tone(330, 0.2, 'square', 0.06, 660, 0.1);
  }
}

export const sfx = new Sfx();
