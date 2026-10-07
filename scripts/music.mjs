// Procedural soundtrack: calm lo-fi pad + sparse bell arpeggio, plus UI sound effects.
// All synthesized here, so there are no licensing concerns.
import fs from 'node:fs';

const SR = 44100;

// Deterministic PRNG so every build sounds identical.
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

// I–vi–IV–V flavoured progression with 7ths/9ths (MIDI notes).
const CHORDS = [
  { bass: 48, notes: [60, 64, 67, 71, 74] }, // Cmaj9
  { bass: 45, notes: [57, 60, 64, 67, 71] }, // Am9
  { bass: 41, notes: [57, 60, 64, 65, 69] }, // Fmaj7(add9-ish)
  { bass: 43, notes: [59, 62, 67, 69, 74] }, // G6/9
];
const CHORD_LEN = 8; // seconds per chord

function music(buf, dur) {
  const n = Math.floor(dur * SR);
  const rand = rng(7);
  // Pad: each chord fades in/out with overlap.
  for (let c = 0; c * CHORD_LEN < dur + CHORD_LEN; c++) {
    const ch = CHORDS[c % CHORDS.length];
    const start = c * CHORD_LEN - 1.5, end = start + CHORD_LEN + 3;
    const s0 = Math.max(0, Math.floor(start * SR)), s1 = Math.min(n, Math.floor(end * SR));
    const freqs = ch.notes.map(midi);
    const bassF = midi(ch.bass);
    for (let i = s0; i < s1; i++) {
      const t = i / SR, local = t - start, len = end - start;
      const env = Math.min(1, local / 2.5) * Math.min(1, (len - local) / 2.5);
      let v = 0;
      for (let k = 0; k < freqs.length; k++) {
        const f = freqs[k];
        const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * (0.11 + k * 0.03) * t + k);
        v += (Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(2 * Math.PI * f * 2.003 * t)) * lfo;
      }
      v = v / freqs.length * 0.5 + Math.sin(2 * Math.PI * bassF * t) * 0.32;
      buf[i] += v * env * 0.22;
    }
  }
  // Bell arpeggio: sparse plucks on the beat grid (76 BPM eighths).
  const step = 60 / 76 / 2;
  for (let t = 0; t < dur; t += step) {
    if (rand() > 0.42) continue;
    const ch = CHORDS[Math.floor(t / CHORD_LEN) % CHORDS.length];
    const note = ch.notes[Math.floor(rand() * ch.notes.length)] + 12;
    const f = midi(note), amp = 0.05 + rand() * 0.035;
    const s0 = Math.floor(t * SR), s1 = Math.min(n, s0 + Math.floor(1.6 * SR));
    for (let i = s0; i < s1; i++) {
      const lt = (i - s0) / SR;
      const env = Math.exp(-lt * 3.2) * Math.min(1, lt / 0.004);
      buf[i] += (Math.sin(2 * Math.PI * f * lt) + 0.25 * Math.sin(2 * Math.PI * f * 3.01 * lt) * Math.exp(-lt * 6)) * env * amp;
    }
  }
}

function sfx(buf, events) {
  const n = buf.length;
  const rand = rng(99);
  for (const e of events) {
    const s0 = Math.floor(e.t * SR);
    if (s0 >= n) continue;
    if (e.type === 'key') {
      // Soft mechanical key tick: high-passed noise burst.
      const len = Math.floor(0.022 * SR), amp = 0.10 + rand() * 0.05;
      let prev = 0, hp = 0;
      for (let i = 0; i < len && s0 + i < n; i++) {
        const x = rand() * 2 - 1; hp = 0.75 * (hp + x - prev); prev = x;
        buf[s0 + i] += hp * amp * Math.exp(-i / (0.006 * SR));
      }
    } else if (e.type === 'click') {
      // Mouse click: short tick + body.
      const len = Math.floor(0.05 * SR);
      for (let i = 0; i < len && s0 + i < n; i++) {
        const lt = i / SR;
        buf[s0 + i] += (Math.sin(2 * Math.PI * 2100 * lt) * Math.exp(-lt * 400) * 0.22 + (rand() * 2 - 1) * Math.exp(-lt * 900) * 0.12);
      }
    } else if (e.type === 'whoosh') {
      // Filtered noise swell for title cards.
      const len = Math.floor(1.2 * SR);
      let lp = 0;
      for (let i = 0; i < len && s0 + i < n; i++) {
        const p = i / len;
        const cutoff = 0.02 + 0.25 * Math.sin(Math.PI * p);
        lp += cutoff * ((rand() * 2 - 1) - lp);
        buf[s0 + i] += lp * Math.sin(Math.PI * p) ** 2 * 0.5;
      }
    }
  }
}

export function writeSoundtrack(file, dur, events) {
  const n = Math.floor(dur * SR);
  const mus = new Float32Array(n);
  music(mus, dur);
  // Fade music in/out at the very start and end.
  for (let i = 0; i < Math.min(n, 3 * SR); i++) { mus[i] *= i / (3 * SR); mus[n - 1 - i] *= i / (3 * SR); }
  const fx = new Float32Array(n);
  sfx(fx, events);
  const data = Buffer.alloc(44 + n * 2);
  data.write('RIFF', 0); data.writeUInt32LE(36 + n * 2, 4); data.write('WAVE', 8);
  data.write('fmt ', 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 2, 28); data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
  data.write('data', 36); data.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.tanh((mus[i] * 0.55 + fx[i]) * 1.2) * 0.9;
    data.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(file, data);
}
