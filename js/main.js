(function () {
  var root = document.documentElement;
  root.classList.add('js');

  /* One hero moment: title rises, photo opens, live cards land. */
  function go() { requestAnimationFrame(function () { root.classList.add('ready'); }); }
  var hero = document.querySelector('.hero__photo img');
  if (hero && !hero.complete) {
    hero.addEventListener('load', go, { once: true });
    setTimeout(go, 900);
  } else { go(); }

  /* Live status from real hours, in San Carlos time (America/Los_Angeles). */
  var HOURS = { 0: null, 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 14] };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function laNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: map[o.weekday], h: parseInt(o.hour, 10) % 24, m: parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), h: d.getHours(), m: d.getMinutes() };
    }
  }
  function fmt(h) { var s = h >= 12 ? 'PM' : 'AM'; var x = h % 12 || 12; return x + ':00 ' + s; }

  function nextOpen(day) {
    for (var i = 1; i <= 7; i++) {
      var d = (day + i) % 7;
      if (HOURS[d]) return { d: d, i: i };
    }
  }

  function updateStatus() {
    var n = laNow();
    var box = document.getElementById('status');
    var t = document.getElementById('statusTitle');
    var s = document.getElementById('statusSub');
    var today = HOURS[n.day];
    var mins = n.h * 60 + n.m;

    if (today && mins >= today[0] * 60 && mins < today[1] * 60) {
      box.classList.add('is-open');
      t.textContent = 'Open now';
      s.textContent = 'Until ' + fmt(today[1]) + ' today. Call (650) 630-1777';
    } else {
      box.classList.remove('is-open');
      var when;
      if (today && mins < today[0] * 60) {
        when = 'today at ' + fmt(today[0]);
      } else {
        var nx = nextOpen(n.day);
        when = (nx.i === 1 ? 'tomorrow' : DAYS[nx.d]) + ' at ' + fmt(HOURS[nx.d][0]);
      }
      t.textContent = 'Closed now';
      s.textContent = 'Opens ' + when;
    }

    var rows = document.querySelectorAll('#hours tr');
    rows.forEach(function (r) { r.classList.toggle('is-today', +r.getAttribute('data-d') === n.day); });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* "What is your pool doing?" helper: general guidance only, no promises. */
  var TIPS = {
    green: 'Usually a sign the water balance or filtration has slipped. It tends to get worse quickly in warm weather, so it is worth a look soon.',
    pump: 'A loud, humming or silent pump can point to a clog, air in the line or a worn part. Running it that way can cause more damage, so it is best to have it checked.',
    heat: 'Heaters stop for many reasons: gas supply, a sensor, a pressure switch or the settings. A proper diagnosis saves you from replacing parts that are fine.',
    leak: 'Some water loss is normal from evaporation and splashing. If the level drops faster than usual, the cause can be plumbing, equipment or the shell.',
    auto: 'Wi-Fi controllers and automation systems can lose settings, connections or sensors. Often it is a configuration problem, not new hardware.',
    spa: 'A spa that is cold, cloudy or foamy usually needs a look at the heater, the jets or the water chemistry. Small spas change fast.'
  };
  var picks = document.querySelectorAll('.pick');
  var text = document.getElementById('helperText');
  picks.forEach(function (b) {
    b.addEventListener('click', function () {
      picks.forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-selected', 'false'); });
      b.classList.add('is-on'); b.setAttribute('aria-selected', 'true');
      text.classList.add('is-swap');
      setTimeout(function () { text.textContent = TIPS[b.getAttribute('data-k')]; text.classList.remove('is-swap'); }, 160);
    });
  });

  /* Sticky nav border + mobile call dock after the hero. */
  var nav = document.querySelector('.nav');
  var dock = document.querySelector('.dock');
  var ctas = document.querySelector('.hero__ctas');
  var contact = document.getElementById('contact');
  if ('IntersectionObserver' in window) {
    var heroVisible = true, contactVisible = false;
    function sync() { dock.classList.toggle('is-on', !heroVisible && !contactVisible); nav.classList.toggle('is-stuck', !heroVisible); }
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; sync(); }).observe(ctas);
    new IntersectionObserver(function (e) { contactVisible = e[0].isIntersecting; sync(); }, { threshold: 0.15 }).observe(contact);
  }

  /* Quote form is visual in this preview. */
  var form = document.getElementById('quote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('quoteNote').hidden = false;
  });

  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
