(function () {
  const PAGES = [
    { title: 'Home', url: 'index.html', keywords: 'home start' },
    { title: 'Apps & Tools', url: 'apps.html', keywords: 'apps tools generators links' },
    { title: 'Saving Documents to the Shared Drive', url: 'guide-1.html', keywords: 'guide shared drive save documents files folder' },
    { title: 'Method 2', url: 'method-2.html', keywords: 'method guide 2' },
    { title: 'Method 3', url: 'method-3.html', keywords: 'method guide 3' }
  ];

  function init() {
    const wrap = document.querySelector('.nav-search-wrap');
    if (!wrap) return;
    const input = wrap.querySelector('#navSearchInput');
    const results = wrap.querySelector('#navSearchResults');
    if (!input || !results) return;

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      results.innerHTML = '';
      if (!q) { results.classList.remove('open'); return; }
      const matches = PAGES.filter(p =>
        p.title.toLowerCase().includes(q) || p.keywords.includes(q)
      );
      if (!matches.length) {
        results.innerHTML = '<div class="nav-search-empty">No results</div>';
      } else {
        matches.forEach(m => {
          const a = document.createElement('a');
          a.href = m.url;
          a.textContent = m.title;
          results.appendChild(a);
        });
      }
      results.classList.add('open');
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) results.classList.remove('open');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
