import { useState, useEffect, useCallback } from 'react';

export function parseHash(hash) {
  const raw = (hash || '').replace(/^#\/?/, '');
  const parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
  const lang = parts[0] === 'en' ? 'en' : parts[0] === 'es' ? 'es' : null;
  if (!lang) return null;

  if (parts[1] === 'a' && parts[2] && parts[3] !== undefined) {
    const articleIndex = Number(parts[3]);
    if (!Number.isInteger(articleIndex) || articleIndex < 0) return { lang, view: 'home' };
    const subsectionIndex = parts[4] !== undefined ? Number(parts[4]) : null;
    return {
      lang,
      view: 'article',
      sourceFile: parts[2],
      articleIndex,
      subsectionIndex: Number.isInteger(subsectionIndex) ? subsectionIndex : null,
    };
  }

  if (parts[1] === 'ejercicios') {
    const exercise = parts[2] !== undefined ? Number(parts[2]) : 0;
    return { lang, view: 'ejercicios', exercise: Number.isInteger(exercise) ? exercise : 0 };
  }

  if (parts[1] === 'c' && parts[2]) {
    return { lang, view: 'home', collection: parts[2] };
  }

  return { lang, view: 'home' };
}

export function buildHash(route) {
  const { lang, view } = route;
  if (view === 'article') {
    const base = `#/${lang}/a/${encodeURIComponent(route.sourceFile)}/${route.articleIndex}`;
    return route.subsectionIndex != null ? `${base}/${route.subsectionIndex}` : base;
  }
  if (view === 'ejercicios') {
    return route.exercise ? `#/${lang}/ejercicios/${route.exercise}` : `#/${lang}/ejercicios`;
  }
  if (view === 'home' && route.collection && route.collection !== 'Todos') {
    return `#/${lang}/c/${encodeURIComponent(route.collection)}`;
  }
  return `#/${lang}`;
}

export function useHashRoute(fallbackLang) {
  const [route, setRoute] = useState(() =>
    parseHash(window.location.hash) || { lang: fallbackLang, view: 'home' }
  );

  useEffect(() => {
    const onChange = () => {
      const next = parseHash(window.location.hash);
      if (next) setRoute(next);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((next, { replace = false } = {}) => {
    const hash = buildHash(next);
    if (hash === window.location.hash) return;
    if (replace) {
      window.history.replaceState(null, '', hash);
      setRoute(next);
    } else {
      window.location.hash = hash;
    }
  }, []);

  return [route, navigate];
}
