export function parseMd(text, highlightTerm) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  if (highlightTerm && highlightTerm.trim()) {
    const escapedQ = highlightTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`(${escapedQ})`, 'ig'), '<mark>$1</mark>');
  }
  return html;
}
