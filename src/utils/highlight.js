// Escapa HTML y resalta las coincidencias de q dentro de text
export function highlightMatch(text, q) {
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  if (!q) return escaped;
  const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp(`(${escapedQ})`, 'ig'), '<mark>$1</mark>');
}
