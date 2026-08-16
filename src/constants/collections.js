export const COLLECTION_BADGE = {
  'Introducción a Claude Code': 'badge-a',
  'Sistema de Memoria':         'badge-d',
  'Hooks':                      'badge-b',
  'Fundamentos':                'badge-a',
  'Arquitectura avanzada':      'badge-b',
  'Claude API':                 'badge-c',
};

export function collectionBadge(title) {
  return COLLECTION_BADGE[title] || 'badge-d';
}

export const COLLECTION_ACCENT = [
  { bg: 'rgba(0,102,204,0.10)',   border: 'rgba(0,102,204,0.28)',   dot: '#0066CC' },
  { bg: 'rgba(124,58,237,0.10)',  border: 'rgba(124,58,237,0.28)',  dot: '#7C3AED' },
  { bg: 'rgba(5,150,105,0.10)',   border: 'rgba(5,150,105,0.28)',   dot: '#059669' },
  { bg: 'rgba(234,88,12,0.10)',   border: 'rgba(234,88,12,0.28)',   dot: '#EA580C' },
  { bg: 'rgba(220,38,38,0.10)',   border: 'rgba(220,38,38,0.28)',   dot: '#DC2626' },
  { bg: 'rgba(8,145,178,0.10)',   border: 'rgba(8,145,178,0.28)',   dot: '#0891B2' },
  { bg: 'rgba(101,163,13,0.10)',  border: 'rgba(101,163,13,0.28)',  dot: '#65A30D' },
  { bg: 'rgba(219,39,119,0.10)',  border: 'rgba(219,39,119,0.28)',  dot: '#DB2777' },
  { bg: 'rgba(180,83,9,0.10)',    border: 'rgba(180,83,9,0.28)',    dot: '#B45309' },
  { bg: 'rgba(79,70,229,0.10)',   border: 'rgba(79,70,229,0.28)',   dot: '#4F46E5' },
];
