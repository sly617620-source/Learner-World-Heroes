/* All mini-games. Each: (root, done) => ..., calls done(correctCount 0-5). */
const COLS = ['#ef4444', '#f59e0b', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
const SH = {
  circle: '<circle cx="50" cy="50" r="40"/>',
  square: '<rect x="12" y="12" width="76" height="76" rx="8"/>',
  triangle: '<polygon points="50,10 92,88 8,88"/>',
  star: '<polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38"/>',
  heart: '<path d="M50 88C10 58 8 28 28 20c12-4 20 2 22 10 2-8 10-14 22-10 20 8 18 38-22 68z"/>'
};
const svg = (k, c) => `<svg viewBox="0 0 100 100" fill="${c}">${SH[k]}</svg>`;
const AN = { dog: '🐶', cat: '🐱', cow: '🐮', duck: '🦆', bird: '🐦' };
const LET = {
  en: [['A', '🍎'], ['B', '🐻'], ['C', '🐱'], ['D', '🐶'], ['E', '🐘'], ['F', '🐟'], ['G', '🍇'], ['H', '🏠']],
  ar: [['أ', '🐰'], ['ب', '🦆'], ['ت', '🍎'], ['ج', '🐪'], ['ح', '🐴'], ['د', '🐻'], ['س', '🐟'], ['ش', '🌞']]
};
const ST = {
  en: [
    { t: 'Robo the robot hears a tiny meow 🐱 in the garden. Where should he look?', c: [['Under the flowers 🌸', 1], ['Up in the tree 🌳', 2]] },
    { t: 'A kitten is hiding under the flowers! Robo shares his snack 🍪.', c: [['Take the kitten home 🏠', 3]] },
    { t: 'A kitten is stuck in the tree! Robo stretches his long arm 🦾.', c: [['Catch it gently 🤗', 3]] },
    { t: 'Hooray! The kitten is home and purring. Robo earned a star! ⭐', c: null }
  ],
  ar: [
    { t: 'سمع الروبوت «روبو» مواءً صغيراً 🐱 في الحديقة. أين يبحث؟', c: [['تحت الزهور 🌸', 1], ['فوق الشجرة 🌳', 2]] },
    { t: 'قطة صغيرة تختبئ تحت الزهور! يشاركها روبو وجبته 🍪.', c: [['خذها إلى البيت 🏠', 3]] },
    { t: 'القطة عالقة فوق الشجرة! يمد روبو ذراعه الطويلة 🦾.', c: [['أنقذها بلطف 🤗', 3]] },
    { t: 'يا للفرحة! عادت القطة إلى بيتها وهي تخرخر. حصل روبو على نجمة! ⭐', c: null }
  ]
};

/* Generic multiple-choice engine: 5 rounds, gen() -> {prompt, opts:[{html, ok}], sound?} */
function quiz(root, done, gen, n = 5) {
  let i = 0, ok = 0;
  const next = () => {
    if (i >= n) return done(ok);
    const q = gen(); i++;
    root.replaceChildren(
      h('div', { class: 'prompt', html: q.prompt }),
      ...(q.sound ? [h('button', { class: 'btn sm', onclick: q.sound }, '🔊')] : []),
      h('div', { class: 'opts' }, ...q.opts.map(o => {
        let missed = false;
        const b = h('button', { class: 'opt', html: o.html, onclick: () => {
          if (o.ok) { Sfx.good(); burst(b); if (!missed) ok++; root.querySelectorAll('.opt').forEach(x => x.disabled = true); setTimeout(next, 900); }
          else { Sfx.bad(); missed = true; b.disabled = true; b.classList.add('shake'); }
        } });
        return b;
      })),
      h('div', {}, '⭐'.repeat(ok) + ' ' + i + '/' + n));
    if (q.sound) q.sound();
  };
  next();
}

const Games = {
  shapes: (root, done) => quiz(root, done, () => {
    const [a, ...r] = pick(Object.keys(SH), 3), cols = pick(COLS, 3);
    return { prompt: t('findShape') + `<div class="big">${svg(a, '#cbd5e1')}</div>`, opts: pick([a, ...r], 3).map((k, i) => ({ ok: k === a, html: svg(k, cols[i]) })) };
  }),

  animals: (root, done) => quiz(root, done, () => {
    const [a, ...r] = pick(Object.keys(AN), 3);
    return { prompt: t('whoSays'), sound: () => Sfx.animal(a), opts: pick([a, ...r], 3).map(k => ({ ok: k === a, html: AN[k] })) };
  }),

  colors: (root, done) => {
    let n = 0;
    const keys = Object.keys(SH);
    const grid = h('div', { class: 'opts c3' }, ...Array.from({ length: 6 }, (_, i) => {
      let c = -1;
      const b = h('button', { class: 'opt', html: svg(keys[i % 5], '#e2e8f0'), onclick: () => {
        c = (c + 1) % COLS.length; b.firstChild.setAttribute('fill', COLS[c]);
        Sfx.note(c); burst(b); if (++n === 12) setTimeout(() => done(2), 500);
      } });
      return b;
    }));
    root.replaceChildren(h('div', { class: 'prompt' }, t('tapColor')), grid);
  },

  math: (root, done) => quiz(root, done, () => {
    const mk = (s, prompt) => { const w = new Set([s]); while (w.size < 4) w.add(Math.max(0, s + rnd(7) - 3)); return { prompt, opts: pick([...w], 4).map(x => ({ ok: x === s, html: x })) }; };
    if (rnd(2)) { const n = 1 + rnd(10), e = pick(['🐞', '🌟', '🎈', '🍓'], 1)[0]; return mk(n, `${t('count')}<div dir="ltr" class="big">${e.repeat(n)}</div>`); }
    const a = 1 + rnd(9), b = 1 + rnd(9);
    return mk(a + b, `<div dir="ltr" class="big">${a} + ${b} = ?</div><div dir="ltr">${'🍎'.repeat(a)} ➕ ${'🍌'.repeat(b)}</div>`);
  }),

  letters: (root, done) => quiz(root, done, () => {
    const [a, ...r] = pick(LET[Store.s.lang], 3);
    return { prompt: `${t('letter')}<div class="big">${a[0]}</div>`, sound: () => Sfx.say(a[0]), opts: pick([a, ...r], 3).map(x => ({ ok: x === a, html: x[1] })) };
  }),

  puzzle: (root, done) => {
    const scene = '<rect width="90" height="90" fill="#bde8ff"/><circle cx="72" cy="16" r="9" fill="#ffd23f"/><rect y="60" width="90" height="30" fill="#6bd36b"/><rect x="12" y="38" width="32" height="26" fill="#ff8fa3"/><polygon points="8,40 28,22 48,40" fill="#7c5cff"/><rect x="22" y="48" width="12" height="16" fill="#fff"/><rect x="62" y="44" width="8" height="20" fill="#8a5a2b"/><circle cx="66" cy="38" r="14" fill="#2ec4b6"/>';
    let lvl = 0;
    const run = () => {
      const n = lvl ? 3 : 2, N = n * n, s = 90 / n;
      let order = pick([...Array(N).keys()], N);
      while (order.every((v, i) => v === i)) order = pick(order, N);
      let sel = null;
      const grid = h('div', { class: 'opts', style: `grid-template-columns:repeat(${n},1fr);max-width:360px;gap:6px` });
      const draw = () => grid.replaceChildren(...order.map((v, i) => h('button', {
        class: 'opt tile' + (sel === i ? ' worn' : ''), style: 'padding:0;overflow:hidden;min-height:0;aspect-ratio:1;border-radius:12px',
        html: `<svg viewBox="${(v % n) * s} ${Math.floor(v / n) * s} ${s} ${s}" style="width:100%;max-height:none">${scene}</svg>`,
        onclick: () => {
          Sfx.tap();
          if (sel === null) sel = i;
          else {
            [order[sel], order[i]] = [order[i], order[sel]]; sel = null;
            if (order.every((x, k) => x === k)) { Sfx.good(); confetti(); return setTimeout(() => lvl ? done(5) : (lvl = 1, run()), 1200); }
          }
          draw();
        } })));
      draw();
      root.replaceChildren(h('div', { class: 'prompt' }, t('tapSwap')), grid);
    };
    run();
  },

  memory: (root, done) => {
    const em = pick(['🐶', '🐱', '🐼', '🦊', '🐸', '🦁', '🐵', '🐰'], 4);
    let first = null, lock = false, found = 0, moves = 0;
    const grid = h('div', { class: 'opts c4' }, ...pick([...em, ...em], 8).map(e => {
      const b = h('button', { class: 'opt card', onclick: () => {
        if (lock || b.classList.contains('up')) return;
        b.classList.add('up'); b.textContent = e; Sfx.tap();
        if (!first) { first = b; return; }
        moves++;
        if (first.textContent === e) { Sfx.good(); burst(b); first = null; if (++found === 4) setTimeout(() => done(moves <= 6 ? 5 : moves <= 9 ? 3 : 2), 700); }
        else { lock = true; const f = first; first = null; setTimeout(() => { [f, b].forEach(x => { x.classList.remove('up'); x.textContent = '❓'; }); lock = false; Sfx.bad(); }, 800); }
      } }, '❓');
      return b;
    }));
    root.replaceChildren(grid);
  },

  story: (root, done) => {
    const S = ST[Store.s.lang];
    const clean = s => s.replace(/[^\p{L}\p{N}\s.,!?]/gu, '');
    const show = i => {
      const p = S[i];
      root.replaceChildren(
        h('div', { class: 'big' }, '📖'),
        h('div', { class: 'prompt' }, p.t),
        h('button', { class: 'btn sm', onclick: () => Sfx.say(clean(p.t)) }, '🔊'),
        h('div', { class: 'opts' }, ...(p.c ? p.c.map(([label, to]) => h('button', { class: 'opt sm', onclick: () => { Sfx.tap(); show(to); } }, label)) : [h('button', { class: 'btn', onclick: () => done(3) }, '⭐')])));
      Sfx.say(clean(p.t));
    };
    show(0);
  }
};
