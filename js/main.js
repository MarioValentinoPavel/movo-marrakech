// MOVO · interacción. Sin dependencias.
(() => {
  const D = window.MOVO;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lang = () => (window.I18N ? I18N.get() : 'fr');
  const t = (fr, en, es) => (window.I18N ? I18N.t(fr, en, es) : fr);
  const loc = () => ({ fr: 'fr-FR', en: 'en-GB', es: 'es-ES' }[lang()] || 'fr-FR');
  const num = (n) => new Intl.NumberFormat(loc()).format(n);
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const easeIO = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const wa = (n, txt) => `https://wa.me/${n}?text=${encodeURIComponent(txt)}`;
  const tween = (dur, fn, ease = easeOut) => new Promise((done) => {
    if (reduce || dur <= 0) { fn(1); return done(); }
    const t0 = performance.now();
    const step = (now) => { const p = Math.min(1, (now - t0) / dur); fn(ease(p)); if (p < 1) requestAnimationFrame(step); else done(); };
    requestAnimationFrame(step);
  });

  /* ---------- cabecera, menú, barra móvil ---------- */
  const hd = $('.hd'), menuBtn = $('.menu-btn'), menu = $('#menu'), mbar = $('#mbar');
  const onScroll = () => {
    hd.classList.toggle('stuck', scrollY > 30);
    const heroEnd = $('.hero').getBoundingClientRect().bottom;
    const book = $('#reserver').getBoundingClientRect().top;
    mbar.classList.toggle('show', heroEnd < 80 && book > innerHeight * 0.6);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menuBtn.setAttribute('aria-expanded', 'false'); menu.hidden = true; } });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { menuBtn.setAttribute('aria-expanded', 'false'); menu.hidden = true; menuBtn.focus(); } });

  /* ---------- logo: el scooter naranja rueda por su carretera hasta aparcar ---------- */
  const logo = $('.logo');
  const scoot = $('.lg-scoot', logo), ride = $('.lg-ride', logo);
  const REST = { x: 921, y: 674 };
  let rideBusy = false;
  const rideInfo = (() => {
    const L = ride.getTotalLength();
    let best = 0, bd = 1e9;
    for (let s = 0; s <= L; s += 2) { const p = ride.getPointAtLength(s); const d = Math.abs(p.x - REST.x); if (d < bd) { bd = d; best = s; } }
    const ang = (s) => { const a = ride.getPointAtLength(Math.max(0, s - 6)), b = ride.getPointAtLength(Math.min(L, s + 6)); return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; };
    return { L, rest: best, p0: ride.getPointAtLength(best), a0: ang(best), ang };
  })();
  // coloca un scooter (el de la cabecera o el de la pantalla de carga) a la distancia s de su carretera
  const placeScoot = (el, s) => {
    const { p0, a0, ang } = rideInfo, p = ride.getPointAtLength(s);
    el.setAttribute('transform', `translate(${(p.x - p0.x).toFixed(1)} ${(p.y - p0.y).toFixed(1)}) rotate(${(ang(s) - a0).toFixed(2)} ${REST.x} ${REST.y})`);
  };
  function rideIn(from = 0) {
    if (reduce || rideBusy || !root.classList.contains('ld-done')) return;
    rideBusy = true;
    const { rest } = rideInfo;
    scoot.style.opacity = '0';
    placeScoot(scoot, from);
    tween(1700, (k) => { placeScoot(scoot, from + (rest - from) * k); scoot.style.opacity = String(Math.min(1, k * 6)); }).then(() => { scoot.removeAttribute('transform'); rideBusy = false; });
  }
  if (fine) $('.brand').addEventListener('mouseenter', () => rideIn(rideInfo.rest * 0.35));

  /* ---------- pantalla de carga y arranque ----------
     El scooter del logo avanza por su carretera según lo que ya ha cargado (fuentes, foto de portada, página).
     Al terminar, el logo vuela a la cabecera, el fondo se desvanece y la portada se abre desde el eje.
     Se salta con un toque o una tecla. Con movimiento reducido no se muestra (lo decide el script del <head>). */
  const ld = $('#ld'), ldSvg = $('#ld-logo .logo'), main = $('#main');
  const finishLoad = () => { root.classList.add('ld-done'); main.removeAttribute('aria-busy'); };
  if (ld && ldSvg && !root.classList.contains('ld-done')) {
    const ldScoot = $('.lg-scoot', ldSvg);
    const MIN = 1300, MAX = 3400; // ms desde el inicio de la navegación
    let tasks = 0, shown = 0, leaving = false;
    const TASKS = 3, done = () => { tasks++; };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(done, done);
    const heroImg = $('.hero-ph img');
    if (heroImg.complete) done(); else { heroImg.addEventListener('load', done, { once: true }); heroImg.addEventListener('error', done, { once: true }); }
    if (document.readyState === 'complete') done(); else addEventListener('load', done, { once: true });
    placeScoot(ldScoot, 0);
    const leave = () => {
      if (leaving) return;
      leaving = true;
      placeScoot(ldScoot, rideInfo.rest);
      ldScoot.removeAttribute('transform');
      const a = ldSvg.getBoundingClientRect(), b = logo.getBoundingClientRect();
      const s = b.width / a.width, dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
      root.classList.add('ready');
      const fly = ldSvg.animate([{ transform: 'translate(0px, 0px) scale(1)' }, { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${s.toFixed(4)})` }], { duration: 900, easing: 'cubic-bezier(.77,0,.175,1)', fill: 'forwards' });
      ld.animate([{ backgroundColor: 'rgba(244, 238, 229, 1)' }, { backgroundColor: 'rgba(244, 238, 229, 0)' }], { duration: 650, delay: 250, easing: 'ease', fill: 'forwards' });
      fly.finished.then(finishLoad, finishLoad);
      setTimeout(finishLoad, 1400);
    };
    let last = performance.now();
    const frame = () => {
      if (leaving) return;
      const now = performance.now(), dt = Math.min(120, now - last), ok = (tasks >= TASKS && now >= MIN) || now >= MAX;
      last = now;
      const target = ok ? 1 : Math.min(0.9, Math.max((tasks / TASKS) * 0.85, (now / MIN) * 0.55));
      // suavizado por tiempo (no por fotograma): el mismo ritmo a 30, 60 o 120 Hz
      shown += (target - shown) * (1 - Math.exp(-dt / (ok ? 140 : 260)));
      placeScoot(ldScoot, rideInfo.rest * shown);
      if (ok && shown > 0.994) leave(); else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    ld.addEventListener('pointerdown', leave);
    addEventListener('keydown', function skip() { removeEventListener('keydown', skip); leave(); });
  } else {
    finishLoad();
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))]).then(() => requestAnimationFrame(() => root.classList.add('ready')));
  }

  /* ---------- flota: el Torino se repinta (fotos alineadas al píxel), el Stunt funde ---------- */
  const COLORS = { rouge: ['Blanc et rouge', 'White and red', 'Blanco y rojo'], noir: ['Noir', 'Black', 'Negro'], turquoise: ['Turquoise', 'Turquoise', 'Turquesa'], gris: ['Gris clair', 'Light grey', 'Gris claro'] };
  $$('.model').forEach((card) => {
    const ph = $('.model-ph', card), imgs = $$('img', ph), btns = $$('.sw button', card), name = $('.sw-name', card), gloss = $('.gloss', ph);
    const paint = ph.hasAttribute('data-paint');
    let cur = imgs.find((i) => i.classList.contains('on')).dataset.color, busy = false;
    const setName = () => { name.textContent = t(...COLORS[cur]); };
    card._setName = setName;
    btns.forEach((b, bi) => b.addEventListener('click', () => {
      const c = b.dataset.color;
      if (c === cur || busy) return;
      btns.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      const next = imgs.find((i) => i.dataset.color === c), prev = imgs.find((i) => i.dataset.color === cur);
      cur = c; setName();
      if (!paint || reduce) {
        next.classList.add('on'); prev.classList.remove('on');
        return;
      }
      // la pintura nueva entra desde el lateral del carenado y una franja de brillo la acompaña
      busy = true;
      next.style.zIndex = '2'; next.style.clipPath = 'circle(0% at 64% 58%)'; next.classList.add('on');
      const anim = next.animate([{ clipPath: 'circle(0% at 64% 58%)' }, { clipPath: 'circle(95% at 64% 58%)' }], { duration: 900, easing: 'cubic-bezier(.77,0,.175,1)', fill: 'forwards' });
      let done = false;
      const finish = () => { if (done) return; done = true; prev.classList.remove('on'); next.style.zIndex = ''; next.style.clipPath = ''; anim.cancel(); busy = false; };
      anim.finished.then(finish, finish);
      setTimeout(finish, 1300); // por si la pestaña no pinta y la animación no termina
      gloss.animate([{ translate: '-110% 0' }, { translate: '110% 0' }], { duration: 1100, delay: 250, easing: 'cubic-bezier(.23,1,.32,1)' });
    }));
    // flechas del teclado dentro del grupo de colores
    $('.sw', card).addEventListener('keydown', (e) => {
      const i = btns.findIndex((x) => x.getAttribute('aria-checked') === 'true');
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!k) return;
      e.preventDefault();
      const n = btns[(i + k + btns.length) % btns.length]; n.focus(); n.click();
    });
  });

  /* ---------- precio y mensaje ---------- */
  const P = D.price;
  const st = { model: 'torino', days: 7 };
  const bars = $('#bars'), range = $('#range'), chart = $('#chart'), rideEl = $('#ride');
  for (let d = 1; d <= 30; d++) bars.appendChild(document.createElement('i'));
  const perDay = (m, d) => P.total(m, d) / d;
  function drawBars() {
    const vals = Array.from({ length: 30 }, (_, i) => perDay(st.model, i + 1));
    const lo = 185, hi = Math.max(...vals);
    $$('i', bars).forEach((b, i) => {
      b.style.setProperty('--h', (34 + 66 * (vals[i] - lo) / (hi - lo)).toFixed(1));
      b.classList.toggle('on', i + 1 <= st.days);
      b.classList.toggle('cur', i + 1 === st.days);
    });
  }
  function placeRider() {
    const d = Math.min(st.days, 30), bar = bars.children[d - 1];
    const cr = chart.getBoundingClientRect(), br = bar.getBoundingClientRect();
    const x = st.days > 30 ? 100 : ((br.left + br.width / 2 - cr.left) / cr.width) * 100;
    rideEl.style.setProperty('--x', x.toFixed(2));
    rideEl.style.setProperty('--y', (br.top - cr.top - 6).toFixed(1) + 'px');
  }
  const PICK = {
    airport: ['aéroport Marrakech Ménara', 'Marrakech Menara airport', 'aeropuerto Marrakech Menara'],
    jemaa: ['place Jemaa el-Fna', 'Jemaa el-Fna square', 'plaza Jemaa el-Fna'],
    riad: ['livraison à mon riad ou hôtel', 'delivery to my riad or hotel', 'entrega en mi riad u hotel']
  };
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function message(html) {
    const m = (s) => (html ? `<mark>${esc(s)}</mark>` : s);
    const model = D.models[st.model], n = st.days, over = n > P.max;
    const pick = t(...PICK[$('input[name="pick"]:checked').value]);
    const arr = $('#arr').value;
    const date = arr ? new Intl.DateTimeFormat(loc(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(arr + 'T12:00:00')) : '';
    const total = over ? '' : num(P.total(st.model, n));
    const L = lang();
    if (L === 'en') return over
      ? `Hello MOVO, I would like to rent an ${m(model)} for ${m('more than 30 days')}${date ? `, from ${m(date)}` : ''}. Pick-up: ${m(pick)}. Could you send me a quote?`
      : `Hello MOVO, I would like to rent an ${m(model)} for ${m(n + (n === 1 ? ' day' : ' days'))}${date ? `, from ${m(date)}` : ''}. Pick-up: ${m(pick)}. Estimated total: ${m(total + ' MAD')}. Is it available?`;
    if (L === 'es') return over
      ? `Hola MOVO, quiero alquilar un ${m(model)} durante ${m('más de 30 días')}${date ? `, a partir del ${m(date)}` : ''}. Recogida: ${m(pick)}. ¿Me podéis hacer un presupuesto?`
      : `Hola MOVO, quiero alquilar un ${m(model)} durante ${m(n + (n === 1 ? ' día' : ' días'))}${date ? `, a partir del ${m(date)}` : ''}. Recogida: ${m(pick)}. Total estimado: ${m(total + ' MAD')}. ¿Está disponible?`;
    return over
      ? `Bonjour MOVO, je souhaite louer un ${m(model)} pendant ${m('plus de 30 jours')}${date ? `, à partir du ${m(date)}` : ''}. Retrait : ${m(pick)}. Pouvez-vous me faire un devis ?`
      : `Bonjour MOVO, je souhaite louer un ${m(model)} pendant ${m(n + (n === 1 ? ' jour' : ' jours'))}${date ? `, à partir du ${m(date)}` : ''}. Retrait : ${m(pick)}. Total estimé : ${m(total + ' MAD')}. Est-ce disponible ?`;
  }
  function render() {
    const n = st.days, over = n > P.max, total = over ? null : P.total(st.model, n);
    $('#days-n').textContent = over ? '30+' : String(n);
    $('#days-u').textContent = n === 1 ? t('jour', 'day', 'día') : t('jours', 'days', 'días');
    range.value = String(Math.min(n, 31));
    range.setAttribute('aria-valuetext', over ? t('Plus de 30 jours', 'More than 30 days', 'Más de 30 días') : `${n} ${n === 1 ? t('jour', 'day', 'día') : t('jours', 'days', 'días')}`);
    $$('.step').forEach((b) => { b.disabled = (+b.dataset.d < 0 && n <= 1) || (+b.dataset.d > 0 && n > P.max); });
    $$('.seg button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.m === st.model)));
    const totalEl = $('#total');
    if (over) {
      totalEl.textContent = t('Sur devis', 'On quote', 'A medida');
      totalEl.nextElementSibling.hidden = true;
      $('#per').textContent = t('Au-delà de 30 jours, nous vous faisons un devis sur mesure.', 'For more than 30 days, we make you a custom quote.', 'Para más de 30 días, te hacemos un presupuesto a medida.');
      $('#fx').hidden = true; $('#save').hidden = true;
    } else {
      totalEl.textContent = num(total);
      totalEl.nextElementSibling.hidden = false;
      $('#per').textContent = t(`soit ${num(Math.round(total / n))} MAD par jour`, `that is ${num(Math.round(total / n))} MAD per day`, `es decir, ${num(Math.round(total / n))} MAD al día`);
      const fx = $('#fx'); fx.hidden = false;
      fx.firstChild.textContent = `≈ ${num(Math.ceil(total / P.eur))} € · ≈ ${num(Math.ceil(total / P.usd))} $ `;
      const saved = P.base[st.model] * n - total, save = $('#save');
      save.hidden = saved <= 0;
      save.textContent = t(`Vous économisez ${num(saved)} MAD`, `You save ${num(saved)} MAD`, `Ahorras ${num(saved)} MAD`);
    }
    const canDeliver = n >= P.delivery;
    $('#deliv').classList.toggle('off', !canDeliver);
    const riad = $('input[value="riad"]');
    riad.disabled = !canDeliver;
    if (!canDeliver && riad.checked) $('input[value="airport"]').checked = true;
    $('#pk-hint').hidden = canDeliver;
    drawBars();
    placeRider();
    $$('.presets button').forEach((b) => {
      const d = +b.dataset.days;
      b.setAttribute('aria-pressed', String(d === n));
      $('span', b).textContent = `${num(P.total(st.model, d))} MAD`;
    });
    $('#msg').innerHTML = message(true);
    const plain = message(false);
    $('#send-fr').href = wa(D.wa.fr, plain);
    $('#send-ma').href = wa(D.wa.ma, plain);
    $('#send-mail').href = `mailto:${D.mail}?subject=${encodeURIComponent(t('Réservation scooter', 'Scooter booking', 'Reserva de scooter'))}&body=${encodeURIComponent(plain)}`;
  }
  const setDays = (n) => { st.days = Math.max(1, Math.min(P.max + 1, n)); render(); };
  $$('.step').forEach((b) => b.addEventListener('click', () => setDays(st.days + +b.dataset.d)));
  $$('.presets button').forEach((b) => b.addEventListener('click', () => setDays(+b.dataset.days)));
  range.addEventListener('input', () => setDays(+range.value));
  range.max = String(P.max + 1);
  $$('.seg button').forEach((b) => b.addEventListener('click', () => { st.model = b.dataset.m; render(); }));
  $('.seg').addEventListener('keydown', (e) => {
    const k = { ArrowRight: 'torino', ArrowLeft: 'stunt' }[e.key];
    if (k) { e.preventDefault(); st.model = k; render(); $(`.seg button[data-m="${k}"]`).focus(); }
  });
  $$('input[name="pick"]').forEach((r) => r.addEventListener('change', render));
  const arr = $('#arr');
  arr.min = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  arr.addEventListener('input', render);
  $$('[data-pick]').forEach((a) => a.addEventListener('click', () => { st.model = a.dataset.pick; render(); }));
  // arrastrar sobre las barras (el input range queda para el teclado y los lectores)
  range.style.pointerEvents = 'none';
  let dragging = false;
  const dayAt = (x) => { const r = bars.getBoundingClientRect(); const f = (x - r.left) / r.width; return f > 1.01 ? P.max + 1 : Math.max(1, Math.min(P.max, Math.ceil(f * 30))); };
  chart.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    dragging = true; chart.classList.add('drag');
    chart.setPointerCapture(e.pointerId);
    range.focus({ preventScroll: true });
    setDays(dayAt(e.clientX));
  });
  chart.addEventListener('pointermove', (e) => { if (dragging) setDays(dayAt(e.clientX)); });
  const end = () => { dragging = false; chart.classList.remove('drag'); };
  chart.addEventListener('pointerup', end);
  chart.addEventListener('pointercancel', end);
  addEventListener('resize', () => placeRider());

  /* ---------- enlaces de WhatsApp genéricos (en el idioma de la página) ---------- */
  function waLinks() {
    const g = t('Bonjour MOVO, je souhaite louer un scooter. Est-ce disponible ?', 'Hello MOVO, I would like to rent a scooter. Is it available?', 'Hola MOVO, quiero alquilar un scooter. ¿Está disponible?');
    $$('[data-wa]').forEach((a) => { a.href = wa(D.wa.fr, g); });
    const duo = t('Bonjour MOVO, je souhaite réserver l’offre duo (deux Torino 2026 pendant 48 h). Est-ce disponible ?', 'Hello MOVO, I would like to book the duo offer (two Torino 2026 for 48 hours). Is it available?', 'Hola MOVO, quiero reservar la oferta dúo (dos Torino 2026 durante 48 horas). ¿Está disponible?');
    $$('[data-wa-duo]').forEach((a) => { a.href = wa(D.wa.fr, duo); });
  }

  /* ---------- mapa de las rutas ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const svg = $('#map-svg'), ov = $('#ov');
  const mk = (tag, attrs = {}, parent = ov) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); parent.appendChild(el); return el; };
  const FULL = [0, 0, 1000, 932];
  let vb = FULL.slice(), curRoute = null, runId = 0;
  const LBL = {
    lbMedina: ['Médina', 'Medina', 'Medina'], lbGueliz: ['Guéliz', 'Guéliz', 'Guéliz'], lbHiv: ['Hivernage', 'Hivernage', 'Hivernage'],
    lbPalm: ['Palmeraie', 'Palmeraie', 'Palmeral'], lbAgdal: ['Agdal', 'Agdal', 'Agdal'], lbMajorelle: ['Majorelle', 'Majorelle', 'Majorelle'],
    pinAir: ['Aéroport Ménara', 'Menara airport', 'Aeropuerto Menara'], pinJemaa: ['Jemaa el-Fna', 'Jemaa el-Fna', 'Jemaa el-Fna']
  };
  const ghosts = {};
  for (const id in D.routes) ghosts[id] = mk('path', { d: D.routes[id].d, class: 'route-ghost' });
  const labels = D.map.labels.map((l) => Object.assign(mk('text', { x: l.x, y: l.y, class: 'lbl' + (l.big ? ' big' : ''), 'text-anchor': 'middle' }), { _k: l.k }));
  const pins = D.map.pins.map((p) => {
    const g = mk('g', { class: 'pin' });
    mk('path', { d: 'M0 0C-6 -9 -10 -13 -10 -19a10 10 0 0 1 20 0c0 6 -4 10 -10 19Z' }, g);
    mk('circle', { cx: 0, cy: -19, r: 3.6 }, g);
    const tx = mk('text', { class: 'lbl', 'text-anchor': 'middle' });
    return { g, tx, p };
  });
  const routeEl = mk('path', { class: 'route', d: '' });
  const stopsG = mk('g', { class: 'stops-g' });
  const rider = mk('g', { class: 'rider' });
  mk('path', { d: $('.lg-scoot', logo).getAttribute('d'), 'fill-rule': 'evenodd' }, rider);
  rider.style.opacity = '0';
  let stopEls = [], stopLens = [], riderAt = { x: 0, y: 0, dir: 1 };

  function scaleOverlay() {
    const k = vb[2] / (svg.clientWidth || 1000);
    labels.forEach((l) => { const big = l.classList.contains('big'); l.style.fontSize = ((big ? 13 : 11) * k) + 'px'; l.style.strokeWidth = (3 * k) + 'px'; l.style.letterSpacing = (0.14 * (big ? 13 : 11) * k) + 'px'; });
    pins.forEach(({ g, tx, p }) => {
      g.setAttribute('transform', `translate(${p.x} ${p.y}) scale(${k})`);
      tx.setAttribute('x', p.x); tx.setAttribute('y', p.y + 16 * k);
      tx.style.fontSize = (11 * k) + 'px'; tx.style.strokeWidth = (3 * k) + 'px'; tx.style.letterSpacing = (1.5 * k) + 'px';
    });
    stopEls.forEach((g) => { $('circle', g).setAttribute('r', 11 * k); $('text', g).style.fontSize = (11 * k) + 'px'; });
    placeRiderOnMap(riderAt.x, riderAt.y, riderAt.dir, k);
  }
  function placeRiderOnMap(x, y, dir, k = vb[2] / (svg.clientWidth || 1000)) {
    riderAt = { x, y, dir };
    const s = (34 / 130) * k; // el scooter del logo mide 130 unidades; en pantalla, unos 34 px
    rider.setAttribute('transform', `translate(${x} ${y}) scale(${s * dir} ${s}) translate(-921 -660)`);
  }
  function setVB(v) { vb = v; svg.setAttribute('viewBox', v.map((n) => n.toFixed(1)).join(' ')); scaleOverlay(); }
  function fitBox(path, pts) {
    const b = path.getBBox();
    let x0 = Math.min(b.x, ...pts.map((p) => p[0])), y0 = Math.min(b.y, ...pts.map((p) => p[1]));
    let x1 = Math.max(b.x + b.width, ...pts.map((p) => p[0])), y1 = Math.max(b.y + b.height, ...pts.map((p) => p[1]));
    const pad = Math.max(x1 - x0, y1 - y0) * 0.22 + 18;
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    const ar = 1000 / 932;
    let w = x1 - x0, h = y1 - y0;
    if (w / h > ar) { const nh = w / ar; y0 -= (nh - h) / 2; h = nh; } else { const nw = h * ar; x0 -= (nw - w) / 2; w = nw; }
    return [x0, y0, w, h];
  }
  const zoomTo = (target, dur = 900) => { const from = vb.slice(); return tween(dur, (k) => setVB(from.map((v, i) => v + (target[i] - v) * k)), easeIO); };

  function panel(id) {
    const r = D.routes[id], L = lang();
    $('#r-name').textContent = r[L] || r.fr;
    $('#r-meta').innerHTML = `<span><i>${t('Durée', 'Duration', 'Duración')}</i>${r.dur}</span><span><i>${t('Distance', 'Distance', 'Distancia')}</i>${r.km}</span><span><i>${t('Niveau', 'Level', 'Nivel')}</i>${r.lvl[L] || r.lvl.fr}</span>`;
    $('#r-tip').textContent = r.tip[L] || r.tip.fr;
    const ol = $('#stops'); ol.innerHTML = '';
    r.stops.forEach((s, i) => {
      const [name, desc] = s[L] || s.fr;
      const li = document.createElement('li'); li.dataset.i = i;
      li.innerHTML = `<div><b>${esc(name)}</b><span>${esc(desc)}</span></div>`;
      li.addEventListener('mouseenter', () => hi(i, true)); li.addEventListener('mouseleave', () => hi(i, false));
      ol.appendChild(li);
    });
    const ll = r.stops.map((s) => s.ll.join(','));
    const url = `https://www.google.com/maps/dir/?api=1&origin=${ll[0]}&destination=${ll[ll.length - 1]}&waypoints=${encodeURIComponent(ll.slice(1, -1).join('|'))}&travelmode=driving`;
    $('#r-gmaps').href = url;
    $('#tour-panel').setAttribute('aria-labelledby', 't-' + id);
  }
  function hi(i, on) {
    stopEls[i] && stopEls[i].classList.toggle('hi', on);
    const li = $(`#stops li[data-i="${i}"]`); li && li.classList.toggle('hi', on);
  }
  function lenAt(path, L, x, y) {
    let best = 0, bd = 1e12;
    for (let s = 0; s <= L; s += 1.5) { const p = path.getPointAtLength(s); const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = s; } }
    return best;
  }
  async function showRoute(id, animate = true) {
    const my = ++runId;
    curRoute = id;
    const r = D.routes[id];
    $$('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.r === id)));
    for (const k in ghosts) ghosts[k].style.opacity = k === id ? '0' : '.55';
    panel(id);
    routeEl.setAttribute('d', r.d);
    const L = routeEl.getTotalLength();
    routeEl.style.strokeDasharray = `${L} ${L}`;
    routeEl.style.strokeDashoffset = String(L);
    stopsG.innerHTML = '';
    stopEls = r.pts.map(([x, y], i) => {
      const g = mk('g', { class: 'stop', transform: `translate(${x} ${y})` }, stopsG);
      mk('circle', { r: 11 }, g);
      const tx = mk('text', {}, g); tx.textContent = String(i + 1);
      g.addEventListener('mouseenter', () => hi(i, true)); g.addEventListener('mouseleave', () => hi(i, false));
      return g;
    });
    stopLens = r.pts.map(([x, y]) => lenAt(routeEl, L, x, y));
    ov.appendChild(rider);
    scaleOverlay();
    rider.style.opacity = '0';
    await zoomTo(fitBox(routeEl, r.pts), animate ? 900 : 0);
    if (my !== runId) return;
    const p0 = routeEl.getPointAtLength(0);
    placeRiderOnMap(p0.x, p0.y, 1);
    rider.style.opacity = '1';
    let last = p0, dir = 1;
    const dur = animate ? Math.min(3600, 1500 + L * 6) : 0;
    await tween(dur, (k) => {
      if (my !== runId) return;
      const s = L * k, p = routeEl.getPointAtLength(s);
      if (Math.abs(p.x - last.x) > 0.4) dir = p.x < last.x ? -1 : 1;
      last = p;
      routeEl.style.strokeDashoffset = String(L - s);
      placeRiderOnMap(p.x, p.y, dir);
      stopLens.forEach((sl, i) => { if (s >= sl - 1) { if (!stopEls[i].classList.contains('seen')) { stopEls[i].classList.add('seen'); flash(i); } } });
    }, (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    if (my !== runId) return;
    routeEl.style.strokeDashoffset = '0';
    stopEls.forEach((g) => g.classList.add('seen'));
  }
  function flash(i) {
    const li = $(`#stops li[data-i="${i}"]`);
    stopEls[i].classList.add('on'); li && li.classList.add('on');
    setTimeout(() => { stopEls[i] && stopEls[i].classList.remove('on'); li && li.classList.remove('on'); }, 700);
  }
  function mapTexts() {
    labels.forEach((l) => { l.textContent = t(...LBL[l._k]); });
    pins.forEach(({ tx, p }) => { tx.textContent = t(...LBL[p.k]); });
  }
  const tabs = $$('.tabs button');
  tabs.forEach((b) => b.addEventListener('click', () => showRoute(b.dataset.r)));
  $('.tabs').addEventListener('keydown', (e) => {
    const i = tabs.findIndex((b) => b.getAttribute('aria-selected') === 'true');
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!k) return;
    e.preventDefault();
    const n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); n.click();
  });
  $('#map-all').addEventListener('click', () => { runId++; zoomTo(FULL); });
  addEventListener('resize', scaleOverlay);
  mapTexts();
  panel('medina');
  setVB(FULL);
  // las capas de OpenStreetMap (100 KB) se cargan cuando la sección se acerca
  let mapLoad = null;
  const loadMap = () => mapLoad || (mapLoad = fetch('assets/map.svg?v=2').then((r) => r.text()).then((txt) => {
    const doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
    const layers = $('#layers');
    doc.querySelectorAll('path').forEach((p) => layers.appendChild(document.importNode(p, true)));
    $('#map').classList.add('loaded');
  }).catch(() => {}));
  const nearIO = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { loadMap(); nearIO.disconnect(); } }, { rootMargin: '900px 0px' });
  nearIO.observe($('#map'));
  let mapStarted = false;
  const mapIO = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting) && !mapStarted) { mapStarted = true; mapIO.disconnect(); loadMap().then(() => showRoute('medina')); }
  }, { threshold: 0.35 });
  mapIO.observe($('#map'));

  /* ---------- vídeo: solo en pantalla, con pausa ---------- */
  const vid = $('[data-video]'), vbtn = $('.vid-btn');
  let userPaused = reduce;
  const syncBtn = () => { vbtn.setAttribute('aria-pressed', String(vid.paused)); vbtn.setAttribute('aria-label', vid.paused ? t('Lire la vidéo', 'Play the video', 'Reproducir el vídeo') : t('Mettre en pause', 'Pause', 'Pausa')); };
  vbtn.addEventListener('click', () => { if (vid.paused) { userPaused = false; vid.play().catch(() => {}); } else { userPaused = true; vid.pause(); } });
  vid.addEventListener('play', syncBtn); vid.addEventListener('pause', syncBtn);
  new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting && !userPaused) { vid.preload = 'auto'; vid.play().catch(() => {}); } else if (!e.isIntersecting) vid.pause();
  }), { threshold: 0.3 }).observe(vid);
  syncBtn();

  /* ---------- idioma ---------- */
  document.addEventListener('langchange', () => {
    document.title = t('Location de scooters à Marrakech dès 250 MAD/jour · MOVO', 'Scooter rental in Marrakech from 250 MAD/day · MOVO', 'Alquiler de scooters en Marrakech desde 250 MAD/día · MOVO');
    $$('.model').forEach((c) => c._setName && c._setName());
    waLinks();
    render();
    mapTexts();
    panel(curRoute || 'medina');
    scaleOverlay();
    syncBtn();
  });
  waLinks();
  render();
})();
