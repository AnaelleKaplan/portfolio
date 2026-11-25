(() => {
  const viewer = document.querySelector('.viewer');
  const picture = viewer.querySelector('img');
  const close = viewer.querySelector('.close');
  document.querySelector('.gallery').addEventListener('click', (event) => {
    const button = event.target.closest('[data-lightbox]');
    if (!button) return;
    const source = button.querySelector('img');
    picture.src = source.currentSrc || source.src;
    picture.alt = source.alt;
    viewer.classList.add('open');
    document.body.style.overflow='hidden';
  });
  function dismiss() {
    viewer.classList.remove('open');
    picture.removeAttribute('src');
    document.body.style.overflow='';
  }
  close.addEventListener('click', dismiss);
  viewer.addEventListener('click', e => { if(e.target===viewer) dismiss(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') dismiss(); });
})();
