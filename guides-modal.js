// Guides modal
(function () {
  const btn   = document.getElementById('guidesBtn');
  const modal = document.getElementById('guidesModal');
  const close = document.getElementById('guidesClose');
  if (!btn || !modal) return;

  function open() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    close && close.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', open);
  close && close.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();
