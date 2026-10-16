// Authentic Naija Stadium Web Audio Synthesizer
// Zero external files, zero latency, guaranteed to work offline and in any browser.

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.unlocked = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.unlocked = true;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // --- 1. Realistic Referee Whistle ---
  playWhistle(isShort = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Whistles typically mix ~2600Hz and ~2800Hz to create the trilling acoustic beat
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(2700, t);
    osc2.frequency.setValueAtTime(2950, t);

    // Modulation for Pea / Trill flutter
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = 'sawtooth';
    lfo.frequency.setValueAtTime(35, t);
    lfoGain.gain.setValueAtTime(150, t);
    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    const duration = isShort ? 0.22 : 0.55;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
    gain.gain.setValueAtTime(0.22, t + duration - 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(t);
    osc1.start(t);
    osc2.start(t);

    lfo.stop(t + duration);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  // --- 2. Iconic Nigerian Stadium Vuvuzela ---
  playVuvuzela(duration = 1.2) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Vuvuzelas resonate around B-flat (approx 233Hz) with rich buzzy harmonics
    const freqs = [233, 466, 699, 932];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 4 - 2), t);
      // Slight pitch drift
      osc.frequency.linearRampToValueAtTime(freq * 1.02, t + duration * 0.5);
      osc.frequency.linearRampToValueAtTime(freq * 0.98, t + duration);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, t);
      filter.Q.setValueAtTime(3.0, t);

      const amp = (0.09 / (idx + 1));
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(amp, t + 0.15);
      gain.gain.setValueAtTime(amp, t + duration - 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    });
  }

  // --- 3. Solid Ball Kick Thud ---
  playKick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.16);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // --- 4. Ball Striking Goal Net (Swish/Rustle) ---
  playNet() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // --- 5. Metallic Post / Crossbar Clang ---
  playPost() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [640, 980, 1420].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  // --- 6. Goalkeeper Glove Deflect / Save ---
  playSave() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // --- 7. Explosive Stadium Goal Roar ---
  playGoalCheer() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 2.2;

    // Crowd white noise roar with low-pass rise
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(1600, t + 0.4);
    filter.frequency.linearRampToValueAtTime(600, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.25);
    gain.gain.linearRampToValueAtTime(0.28, t + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);

    // Also fire a joyous vuvuzela blast!
    this.playVuvuzela(1.4);
  }

  // --- 8. Crowd Gasp on Miss / Blocked Shot ---
  playCrowdGasp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const duration = 0.9;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + duration);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // --- 9. Fanfare for Shootout Victory ---
  playVictoryFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Major arpeggio
    notes.forEach((freq, idx) => {
      const delay = idx * 0.11;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const noteDuration = idx === notes.length - 1 ? 0.8 : 0.25;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + noteDuration);
    });

    this.playVuvuzela(2.0);
  }
}

// Spoken Naija Matchday Commentary (Text-To-Speech)
class CommentaryVoice {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voice = null;
    this.init();
  }

  init() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      const isFemale = (v) => /female|woman|girl|zira|samantha|victoria|karen|catherine|jenny|hazel|susan|helena|fiona/i.test(v.name);
      const isMale = (v) => /male|man|boy|david|george|james|mark|daniel|brian|oliver|guy|richard|alex|tom|fred/i.test(v.name);

      // 1. Try Nigerian English male voice first (en-NG)
      let selected = voices.find(v => (v.lang === 'en-NG' || v.lang.startsWith('en-NG')) && !isFemale(v));
      if (!selected) selected = voices.find(v => v.lang === 'en-NG' || v.lang.startsWith('en-NG'));

      // 2. Try any English male voice
      if (!selected) selected = voices.find(v => v.lang.startsWith('en') && isMale(v));

      // 3. Any English voice that is not explicitly female
      if (!selected) selected = voices.find(v => v.lang.startsWith('en') && !isFemale(v));

      // 4. Default fallback
      if (!selected) selected = voices.find(v => v.lang.startsWith('en')) || voices[0];

      this.voice = selected;
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  speak(text) {
    if (!this.synth || sounds.muted) return;
    try {
      this.synth.cancel(); // Stop overlapping speech
      // Clean emojis and punctuation for smooth delivery
      const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').replace(/[!#?*]/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (this.voice) utterance.voice = this.voice;

      // Paced speech rate (reduced speed as requested by user)
      utterance.rate = 0.90;

      // Deep masculine pitch (giving that robust Nigerian stadium commentator hype)
      utterance.pitch = 0.88;
      utterance.volume = 1.0;
      this.synth.speak(utterance);
    } catch (e) {
      // Fallback silently
    }
  }
}

export const sounds = new SoundManager();
export const commentator = new CommentaryVoice();

