// utils/url.js
export const withBase = (base, path) => {
  const b = base?.replace(/\/+$/, '') || '';
  const p = path?.replace(/^\/+/, '') || '';
  return `${b}/${p}`;
};
