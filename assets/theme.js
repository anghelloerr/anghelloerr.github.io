// Run before styles to avoid a flash when a saved preference exists.
(() => {
  let theme;
  try { theme = localStorage.getItem('ar-theme'); } catch { /* Storage can be disabled. */ }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();
