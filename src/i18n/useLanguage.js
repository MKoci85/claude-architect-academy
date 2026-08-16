import { useState, useEffect, useCallback } from 'react';

export function useLanguage() {
  const [lang, setLang] = useState(() => {
    const fromHash = window.location.hash.match(/^#\/(es|en)\b/);
    if (fromHash) return fromHash[1];
    const stored = localStorage.getItem('wiki-lang');
    return stored === 'en' ? 'en' : 'es';
  });

  useEffect(() => {
    localStorage.setItem('wiki-lang', lang);
  }, [lang]);

  const toggle = useCallback(() => setLang(l => l === 'es' ? 'en' : 'es'), []);
  return [lang, toggle, setLang];
}
