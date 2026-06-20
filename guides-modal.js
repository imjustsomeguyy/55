(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('guidesBtn');
    const modal = document.getElementById('guidesModal');
    const closeBtn = document.getElementById('guidesClose');
    if (!btn || !modal) return;

    function open() {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  });
})();
