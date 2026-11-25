/* Blog de Marea Alta: menú activo, apariciones, fichas que giran, disco y pantalla completa */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

  // Píldora de la sección que se está leyendo
  const pills = $$('.nav .pill'), secs = pills.map(a => document.querySelector(a.getAttribute('href')));
  const mark = () => { let cur = -1; secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; }); pills.forEach((p, i) => p.classList.toggle('on', i === cur)); };
  addEventListener('scroll', mark, { passive: true }); mark();

  // Aparecer al bajar (mismas clases que la web)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; const n = e.target; n.classList.add('in'); io.unobserve(n);
      setTimeout(() => { n.classList.remove('reveal', 'in'); n.style.transitionDelay = ''; }, 900);
    }), { threshold: .15 });
    $$('.title,.pop,.flip,.palette div,.post-card').forEach((n, i) => { n.classList.add('reveal'); n.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(n); });
  }

  // Fichas de la Biblia que giran al tocarlas
  $$('.flip').forEach(f => f.addEventListener('click', () => f.classList.toggle('on')));

  // Disco de la canción
  const disc = $('#disc'), tema = $('#tema'), dp = disc.querySelector('.disc-play');
  disc.addEventListener('click', () => {
    if (tema.paused) tema.play().then(() => { disc.classList.add('on'); dp.textContent = '❚❚'; }).catch(() => {});
    else { tema.pause(); disc.classList.remove('on'); dp.textContent = '▶'; }
  });
  tema.addEventListener('ended', () => { disc.classList.remove('on'); dp.textContent = '▶'; });
})();
