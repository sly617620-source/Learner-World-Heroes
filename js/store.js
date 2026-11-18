/* Persistent progress (LocalStorage). Nothing leaves the device. */
const Store = (() => {
  const K = 'lwh.v1';
  const d = { stars: 0, owned: [], worn: {}, pet: '🤖', mode: null, lang: /^ar/.test(navigator.language) ? 'ar' : 'en', mute: false };
  let s = JSON.parse(JSON.stringify(d));
  try { Object.assign(s, JSON.parse(localStorage.getItem(K))); } catch (e) {}
  const save = () => { try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) {} };
  return {
    get s() { return s; },
    save,
    add(n) { s.stars += n; save(); },
    reset() { const l = s.lang; s = JSON.parse(JSON.stringify(d)); s.lang = l; save(); }
  };
})();
