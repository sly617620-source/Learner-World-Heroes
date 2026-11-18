/* Screens + routing. */
(() => {
  const app = $('#app');
  const GAMES = { toddler: [['shapes', '🔷'], ['animals', '🐮'], ['colors', '🎨']], kids: [['math', '🔢'], ['letters', '🔤'], ['memory', '🧠'], ['puzzle', '🧩'], ['story', '📖']] };
  const btn = (label, fn, cls = 'btn') => h('button', { class: cls, onclick: () => { Sfx.tap(); fn(); } }, label);
  const bar = (title, back) => h('header', { class: 'bar' }, back ? btn('🏠', back, 'btn sm') : h('span'), h('h1', {}, title), h('div', { class: 'stars' }, '⭐ ' + Store.s.stars));
  const show = (...k) => {
    document.documentElement.lang = Store.s.lang;
    document.documentElement.dir = Store.s.lang === 'ar' ? 'rtl' : 'ltr';
    app.replaceChildren(...k);
  };
  const langRow = after => h('div', { class: 'opts' }, ...[['ar', 'العربية'], ['en', 'English']].map(([l, n]) =>
    btn(n, () => { Store.s.lang = l; Store.save(); after(); }, 'btn' + (Store.s.lang === l ? ' on' : ' sm'))));

  function welcome() {
    show(h('main', {},
      h('img', { src: 'assets/cover.jpg', alt: 'Learner World Heroes', class: 'cover' }), h('h2', { dir: 'rtl' }, 'أبطال العالم المتعلمين'), avatar(),
      h('div', { class: 'opts' },
        h('button', { class: 'opt wide', onclick: () => setMode('toddler') }, '🧸 2–4'),
        h('button', { class: 'opt wide', onclick: () => setMode('kids') }, '🚀 5–8')),
      langRow(welcome)));
  }
  function setMode(m) { Sfx.good(); Store.s.mode = m; Store.save(); home(); }

  function home() {
    if (!Store.s.mode) return welcome();
    const m = Store.s.mode;
    show(bar(t(m), null), h('main', {},
      h('div', { class: 'hero' }, avatar(), h('div', { class: 'bubble' }, t('hi'))),
      h('div', { class: 'opts' }, ...GAMES[m].map(([id, e]) => h('button', { class: 'opt', onclick: () => { Sfx.tap(); play(id); } }, h('span', { class: 'big' }, e), h('small', {}, t(id)))))),
      h('footer', {}, btn('🛍️ ' + t('shop'), shop), btn('⚙️', () => gate(settings), 'btn sm')));
  }

  function play(id) {
    const stage = h('div', { style: 'display:flex;flex-direction:column;gap:18px;align-items:center;width:100%' });
    show(bar(t(id), home), h('main', {}, stage));
    Games[id](stage, n => finish(id, n));
  }
  function finish(id, n) {
    const g = Math.max(1, n); Store.add(g); Sfx.win(); confetti(); setTimeout(() => Sfx.say(t('great')), 700);
    show(bar('', home), h('main', {}, h('div', { class: 'big' }, '🎉'), h('h2', {}, t('great')), h('div', { class: 'big' }, '⭐'.repeat(g)),
      h('div', { class: 'opts' }, btn('🔁 ' + t('again'), () => play(id)), btn('🏠', home, 'btn sm'))));
  }

  function shop() {
    const w = Store.s.worn;
    show(bar('🛍️ ' + t('shop'), home), h('main', {},
      avatar(),
      h('div', { class: 'opts c3' }, ...PETS.map(p => h('button', { class: 'opt sm', onclick: () => { Store.s.pet = p; Store.save(); Sfx.tap(); shop(); } }, p))),
      h('div', { class: 'opts' }, ...ITEMS.map(it => {
        const owned = Store.s.owned.includes(it.id), worn = w[it.s] === it.id;
        const tile = h('button', { class: 'opt tile' + (worn ? ' worn' : ''), onclick: () => {
          if (owned) { worn ? delete w[it.s] : w[it.s] = it.id; Sfx.tap(); }
          else if (Store.s.stars >= it.p) { Store.s.stars -= it.p; Store.s.owned.push(it.id); w[it.s] = it.id; Sfx.good(); confetti(); }
          else { Sfx.bad(); tile.classList.add('shake'); return; }
          Store.save(); shop();
        } }, h('span', { html: it.e || `<i class="sw" style="background:${it.c}"></i>` }), h('small', { class: 'price' }, owned ? (worn ? '✔' : '✓') : '⭐ ' + it.p));
        return tile;
      }))));
  }

  function settings() {
    show(bar('⚙️ ' + t('settings'), home), h('main', {},
      langRow(settings),
      btn((Store.s.mute ? '🔇 ' : '🔊 ') + t('sound'), () => { Store.s.mute = !Store.s.mute; Store.save(); settings(); }),
      btn('⏱️ ' + t('limit') + ': ' + (Store.s.limit || t('off')), () => { const o = [0, 15, 30, 45]; Store.s.limit = o[(o.indexOf(Store.s.limit || 0) + 1) % 4]; Store.save(); settings(); }),
      btn(t('age'), () => { Store.s.mode = null; Store.save(); welcome(); }),
      btn('🗑️ ' + t('reset'), () => { if (confirm(t('sure'))) { Store.reset(); welcome(); } }, 'btn sm')));
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
  let start = Date.now();
  setInterval(() => {
    if (!Store.s.limit || document.querySelector('.modal') || Date.now() - start < Store.s.limit * 60000) return;
    const m = h('div', { class: 'modal' }, h('div', { class: 'card2' }, h('div', { class: 'big' }, '😴'), h('h2', {}, t('brk')),
      btn('👨‍👩‍👧', () => gate(() => { start = Date.now(); m.remove(); }), 'btn sm')));
    document.body.append(m); Sfx.say(t('brk').replace(/[^\p{L}\s!]/gu, ''));
  }, 15000);
  home();
})();
