/* Synthesized sounds (Web Audio) + speech: zero audio files, works offline. */
const Sfx = (() => {
  let c;
  const ctx = () => { c = c || new (window.AudioContext || window.webkitAudioContext)(); if (c.state === 'suspended') c.resume(); return c; };
  const tone = (f, t = 0, d = .15, ty = 'sine', v = .2, f2) => {
    if (Store.s.mute) return;
    try {
      const a = ctx(), o = a.createOscillator(), g = a.createGain(), s = a.currentTime + t;
      o.type = ty; o.frequency.setValueAtTime(f, s);
      if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d);
      g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(.001, s + d);
      o.connect(g); g.connect(a.destination); o.start(s); o.stop(s + d);
    } catch (e) {}
  };
  const P = [523, 587, 659, 784, 880, 1047];
  const A = {
    dog: () => [0, .25].forEach(t => tone(350, t, .15, 'square', .15, 180)),
    cat: () => { tone(500, 0, .4, 'sine', .25, 900); tone(900, .4, .4, 'sine', .2, 450); },
    cow: () => tone(150, 0, .9, 'sawtooth', .18, 110),
    duck: () => [0, .22].forEach(t => tone(600, t, .15, 'square', .1, 420)),
    bird: () => [0, .12, .24, .4].forEach((t, i) => tone(2000 + i * 200, t, .08, 'sine', .15, 2800))
  };
  return {
    tap: () => tone(600, 0, .07),
    note: i => tone(P[i % 6], 0, .25, 'triangle'),
    good: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .09, .2, 'triangle')),
    bad: () => tone(392, 0, .25, 'sine', .08, 330),
    win: () => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .25, 'square', .1)),
    animal: k => A[k] && A[k](),
    say: txt => {
      if (Store.s.mute || !window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = Store.s.lang === 'ar' ? 'ar-SA' : 'en-US'; u.rate = .85;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }
  };
})();
