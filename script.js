(function () {
  var chapters = Array.prototype.slice.call(document.querySelectorAll('.chapter'));
  var home = document.getElementById('view-home');
  var tocv = document.getElementById('view-toc');
  var read = document.getElementById('view-read');
  var where = document.getElementById('where');
  var progress = document.getElementById('progress');
  var root = document.documentElement;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var size = parseFloat(store('dl-size')) || 1.125;
  function applySize() { root.style.setProperty('--read-size', size + 'rem'); }
  applySize();
  document.getElementById('smaller').onclick = function () { size = Math.max(.95, +(size - .0625).toFixed(4)); applySize(); store('dl-size', size); };
  document.getElementById('bigger').onclick = function () { size = Math.min(1.5, +(size + .0625).toFixed(4)); applySize(); store('dl-size', size); };

  var savedTheme = store('dl-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') root.setAttribute('data-theme', savedTheme);
  var themeBtn = document.getElementById('theme');
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return !window.matchMedia('(prefers-color-scheme: light)').matches;
  }
  function themeIcon() { themeBtn.textContent = isDark() ? '☼' : '☾'; }
  themeIcon();
  themeBtn.onclick = function () { var next = isDark() ? 'light' : 'dark'; root.setAttribute('data-theme', next); store('dl-theme', next); themeIcon(); };

  var last = store('dl-last');
  if (last && document.getElementById(last)) {
    var r = document.getElementById('resumeBtn');
    document.getElementById('resumeWrap').hidden = false; r.href = '#' + last;
    r.textContent = 'Продолжить: ' + document.getElementById(last).getAttribute('data-short');
  }

  function route() {
    var id = location.hash.replace('#', '');
    var target = id && document.getElementById(id);
    if (target && target.classList.contains('chapter')) {
      home.hidden = true; tocv.hidden = true; read.hidden = false;
      chapters.forEach(function (c) {
        var on = c === target;
        c.hidden = !on;
        var p = document.querySelector('.pager[data-for="' + c.id + '"]');
        if (p) p.hidden = !on;
      });
      where.textContent = target.getAttribute('data-short');
      store('dl-last', id);
      window.scrollTo(0, 0);
      onScroll();
    } else {
      read.hidden = true;
      var toc = id === 'oglavlenie';
      tocv.hidden = !toc; home.hidden = toc;
      window.scrollTo(0, 0);
      if (!toc) stars();
    }
  }
  function onScroll() {
    if (read.hidden) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? Math.min(100, window.scrollY / h * 100) : 100) + '%';
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('scroll', onScroll, { passive: true });

  // starfield on the cover: each star twinkles on its own rhythm, a few flare brighter
  var cv = document.getElementById('stars');
  var ctx = cv.getContext('2d');
  var starList = [], starCol = '#c7cfe0', raf = 0, dpr = 1;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stars() {
    var r = cv.getBoundingClientRect(); dpr = window.devicePixelRatio || 1;
    if (!r.width) return;
    cv.width = r.width * dpr; cv.height = r.height * dpr;
    starCol = getComputedStyle(root).getPropertyValue('--moon').trim() || '#c7cfe0';
    var n = Math.round(r.width * r.height / 2600), seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    starList = [];
    for (var i = 0; i < n; i++) {
      var big = rnd() < .08;
      starList.push({
        x: rnd() * cv.width, y: rnd() * cv.height,
        r: (big ? 1.3 + rnd() * .9 : .3 + rnd() * 1) * dpr,
        base: .12 + rnd() * .45, amp: .15 + rnd() * .45,
        speed: .4 + rnd() * 1.8, phase: rnd() * 6.283, big: big
      });
    }
    if (!raf) raf = requestAnimationFrame(draw);
  }
  function draw(ts) {
    raf = 0;
    if (home.hidden) return;
    var t = (still ? 0 : ts || 0) / 1000;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = starCol;
    for (var i = 0; i < starList.length; i++) {
      var s = starList[i];
      var w = Math.sin(t * s.speed + s.phase);
      var a = Math.max(0, Math.min(1, s.base + s.amp * w));
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      if (s.big && w > .55) {           // a short cross-shaped glint at the peak
        var g = (w - .55) / .45, len = s.r * (3 + 5 * g);
        ctx.globalAlpha = a * g * .8;
        ctx.fillRect(s.x - len, s.y - .35 * dpr, len * 2, .7 * dpr);
        ctx.fillRect(s.x - .35 * dpr, s.y - len, .7 * dpr, len * 2);
      }
    }
    ctx.globalAlpha = 1;
    if (!still) raf = requestAnimationFrame(draw);
  }

  // sun rays slipping out from behind the moon now and then
  (function () {
    var g = document.getElementById('rays');
    if (!g) return;
    var ns = 'http://www.w3.org/2000/svg', seed = 11;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    var count = 22;
    for (var i = 0; i < count; i++) {
      var ang = (i / count) * Math.PI * 2 + (rnd() - .5) * .18;
      var inner = 52, outer = 74 + rnd() * 30, half = .025 + rnd() * .035;
      var p = [
        [100 + Math.cos(ang - half) * inner, 100 + Math.sin(ang - half) * inner],
        [100 + Math.cos(ang) * outer, 100 + Math.sin(ang) * outer],
        [100 + Math.cos(ang + half) * inner, 100 + Math.sin(ang + half) * inner]
      ];
      var el = document.createElementNS(ns, 'polygon');
      el.setAttribute('points', p.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '));
      el.setAttribute('class', 'ray');
      el.style.animationDuration = (5 + rnd() * 7).toFixed(2) + 's';
      el.style.animationDelay = (5 + rnd() * 9).toFixed(2) + 's';
      g.appendChild(el);
    }
  })();
  window.addEventListener('resize', stars);
  themeBtn.addEventListener('click', stars);
  stars();
  document.querySelector('.read-btn').addEventListener('click', function (e) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    if (home.classList.contains('turning')) return;
    window.scrollTo(0, 0);
    tocv.hidden = false; tocv.classList.add('under');
    home.classList.add('turning');
    setTimeout(function () {
      home.classList.remove('turning');
      location.hash = 'oglavlenie';
      route();
      setTimeout(function () { tocv.classList.remove('under'); }, 300);
    }, 1500);
  });
  route();
})();
