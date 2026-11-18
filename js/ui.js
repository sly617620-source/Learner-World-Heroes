/* Helpers, translations, effects, avatar, parental gate. */
const $ = s => document.querySelector(s);
const rnd = n => Math.floor(Math.random() * n);
const pick = (a, n) => [...a].sort(() => Math.random() - .5).slice(0, n);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  e.append(...kids); return e;
};

const L = {
  en: { toddler: 'Little Explorers (2–4)', kids: 'Smart Adventure (5–8)', hi: "Let's play!", shapes: 'Shapes', animals: 'Animals', colors: 'Colors', math: 'Numbers', letters: 'Letters', memory: 'Memory', story: 'Story', shop: 'Shop', settings: 'Parents', great: 'Great job!', again: 'Again', findShape: 'Find the same shape!', whoSays: 'Who makes this sound?', tapColor: 'Tap to color!', count: 'How many?', letter: 'Which one starts with this letter?', parent: 'Grown-ups only: solve to continue', sound: 'Sound', age: 'Change age group', puzzle: 'Puzzle', tapSwap: 'Tap two pieces to swap them!', limit: 'Play limit (min)', off: 'Off', brk: 'Time for a break! Rest your eyes 👀', reset: 'Reset progress', sure: 'Erase all stars and items?' },
  ar: { toddler: 'المستكشفون الصغار (٢–٤)', kids: 'مغامرة المهارات (٥–٨)', hi: 'هيا نلعب!', shapes: 'الأشكال', animals: 'الحيوانات', colors: 'الألوان', math: 'الأرقام', letters: 'الحروف', memory: 'الذاكرة', story: 'قصة', shop: 'المتجر', settings: 'الأهل', great: 'أحسنت!', again: 'مرة أخرى', findShape: 'جد الشكل المطابق!', whoSays: 'من يصدر هذا الصوت؟', tapColor: 'المس لتلوّن!', count: 'كم العدد؟', letter: 'أيّها يبدأ بهذا الحرف؟', parent: 'للكبار فقط: حلّ المسألة للمتابعة', sound: 'الصوت', age: 'تغيير الفئة العمرية', puzzle: 'تركيب', tapSwap: 'المس قطعتين لتبديلهما!', limit: 'حد اللعب (دقيقة)', off: 'متوقف', brk: 'وقت الاستراحة! أرح عينيك 👀', reset: 'مسح التقدم', sure: 'مسح كل النجوم والأغراض؟' }
};
const t = k => L[Store.s.lang][k] || k;

function confetti() {
  const fx = $('#fx');
  for (let i = 0; i < 45; i++) {
    const p = h('i', { class: 'cf', style: `left:${Math.random() * 100}%;background:hsl(${rnd(360)} 90% 60%);animation-delay:${Math.random() * .5}s` });
    fx.append(p); setTimeout(() => p.remove(), 3000);
  }
}
function burst(el) {
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    const p = h('i', { class: 'sp', style: `left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;--a:${i * 45}deg` }, '⭐');
    $('#fx').append(p); setTimeout(() => p.remove(), 800);
  }
}

/* Shop catalogue: emoji/colour only, so it is language-neutral. */
const PETS = ['🤖', '🐱', '🐶', '🐼', '🦊', '🐸'];
const ITEMS = [
  { id: 'cap', s: 'hat', e: '🧢', p: 4 }, { id: 'topHat', s: 'hat', e: '🎩', p: 6 }, { id: 'cowboy', s: 'hat', e: '🤠', p: 8 }, { id: 'grad', s: 'hat', e: '🎓', p: 8 }, { id: 'crown', s: 'hat', e: '👑', p: 10 },
  { id: 'red', s: 'cape', c: '#ef4444', p: 5 }, { id: 'blue', s: 'cape', c: '#3b82f6', p: 5 }, { id: 'gold', s: 'cape', c: '#f59e0b', p: 9 },
  { id: 'bow', s: 'acc', e: '🎀', p: 4 }, { id: 'shades', s: 'acc', e: '🕶️', p: 5 }, { id: 'phones', s: 'acc', e: '🎧', p: 7 }
];
function avatar() {
  const w = Store.s.worn, g = id => ITEMS.find(i => i.id === id);
  const cape = w.cape && g(w.cape), hat = w.hat && g(w.hat), acc = w.acc && g(w.acc);
  return h('div', { class: 'avatar', html: (cape ? `<i class="cape" style="background:${cape.c}"></i>` : '') + `<b class="face">${Store.s.pet}</b>` + (hat ? `<u class="hat">${hat.e}</u>` : '') + (acc ? `<u class="acc">${acc.e}</u>` : '') });
}

/* Simple parental gate: multiplication a young child can't solve. */
function gate(ok) {
  const a = 3 + rnd(6), b = 3 + rnd(6), r = a * b, w = new Set([r]);
  while (w.size < 4) w.add(r + rnd(11) - 5);
  const m = h('div', { class: 'modal' }, h('div', { class: 'card2' },
    h('p', {}, t('parent')), h('h2', { dir: 'ltr' }, `${a} × ${b} = ?`),
    h('div', { class: 'opts c4' }, ...pick([...w], 4).map(x => h('button', { class: 'opt sm', onclick: () => { m.remove(); x === r ? ok() : Sfx.bad(); } }, x))),
    h('button', { class: 'btn sm', onclick: () => m.remove() }, '✖')));
  document.body.append(m);
}
