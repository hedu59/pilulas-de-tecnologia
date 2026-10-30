(() => {
  const input = document.getElementById('article-search');
  if (!input) return;
  const cards = [...document.querySelectorAll('.article-card')];
  const chips = [...document.querySelectorAll('.chip')];
  const blank = document.getElementById('empty-state');
  const coming = document.getElementById('coming-card');
  const count = document.getElementById('article-count');
  let category = 'Todos';
  function filter() {
    const clean = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
    const search = clean(input.value.trim());
    let visible = 0;
    for (const card of cards) {
      const match = (category === 'Todos' || card.dataset.category === category) && clean(card.dataset.title || '').includes(search);
      card.hidden = !match;
      if (match) visible++;
    }
    coming.hidden = category !== 'Todos' || !!search;
    blank.style.display = visible ? 'none' : 'block';
    count.textContent = visible === 1 ? '1 artigo encontrado' : `${visible} artigos encontrados`;
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    category = chip.dataset.category;
    chips.forEach(c => {
      const active = c === chip;
      c.classList.toggle('active', active);
      c.setAttribute('aria-pressed', String(active));
    });
    filter();
  }));
  document.querySelectorAll('[data-side-category]').forEach(el => el.addEventListener('click', () => {
    const target = chips.find(c => c.dataset.category === el.dataset.sideCategory);
    if (target) target.click();
  }));
  input.addEventListener('input', filter);
})();

// Reader comfort controls.
(() => {
  const bar = document.getElementById('reader-progress');
  const up = document.getElementById('scroll-up');
  if (bar) {
    const draw = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${max > 0 ? Math.min(100, 100 * window.scrollY / max) : 0}%`;
      if (up) up.hidden = window.scrollY < 450;
    };
    addEventListener('scroll', draw, { passive: true }); draw();
  }
  up?.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
  document.querySelectorAll('.article-page pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.className = 'copy-code'; btn.type = 'button'; btn.textContent = 'Copiar';
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.innerText.replace(/^Copiar\n/, '')); btn.textContent = 'Copiado ✓'; }
      catch { btn.textContent = 'Selecione o código'; }
      setTimeout(() => btn.textContent = 'Copiar', 1800);
    });
    pre.prepend(btn);
  });
})();