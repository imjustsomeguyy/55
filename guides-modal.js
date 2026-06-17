// Guides popup modal — open/close handling, shared across pages.
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('guidesModal');
  const openBtn = document.getElementById('guidesBtn');
  const closeBtn = document.getElementById('guidesClose');
  if (!overlay || !openBtn) return;

  function openModal() {
    overlay.classList.add('open');
    document.body.classList.add('modal-open');
  }
  function closeModal() {
    overlay.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
