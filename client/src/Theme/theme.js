const STORAGE_KEY = 'theme'; // 'light' | 'dark' | 'system'

export function getStoredTheme() {
  return localStorage.getItem(STORAGE_KEY) || 'system';
}

export function resolveTheme(choice /* 'light'|'dark'|'system' */) {
  if (choice === 'light' || choice === 'dark') return choice;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(choice) {
  const resolved = resolveTheme(choice);
  document.documentElement.setAttribute('data-theme', resolved);
}

export function setTheme(choice /* 'light'|'dark'|'system' */) {
  localStorage.setItem(STORAGE_KEY, choice);
  applyTheme(choice);
}

// export function toggleTheme() {
//   const current = document.documentElement.getAttribute('data-theme') || 'light';
//   const next = current === 'dark' ? 'light' : 'dark';
//   setTheme(next);
// }

export function listenToSystemTheme(callback) {
  const mm = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => callback(mm.matches ? 'dark' : 'light');
  if (mm.addEventListener) mm.addEventListener('change', handler);
  else mm.addListener(handler); // older Safari
  return () => {
    if (mm.removeEventListener) mm.removeEventListener('change', handler);
    else mm.removeListener(handler);
  };
}
