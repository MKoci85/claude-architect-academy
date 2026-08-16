import { useState, useEffect, useCallback, useRef } from 'react';
import { buildSearchIndex, search as performSearch } from '../searchEngine';
import { fetchLocalized } from '../data/fetchLocalized';
import { useDebounce } from './useDebounce';

export function useWikiData(lang) {
  const [collections, setCollections] = useState([]);
  const [searchIndex, setSearchIndex] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [activeCollection, setActiveCollection] = useState('Todos');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 280);
  const [searchResults, setSearchResults] = useState(null);
  const [view, setView] = useState('home');
  const [activeArticle, setActiveArticle] = useState(null);
  const [highlightTarget, setHighlightTarget] = useState(null);
  const [exercisesData, setExercisesData] = useState(null);
  const [activeExercise, setActiveExercise] = useState(0);
  // Cache de archivos de colección completos (con blocks), por `${lang}:${sourceFile}`.
  const fullCollectionCache = useRef(new Map());
  // Descarta respuestas de fetch que quedaron obsoletas por una navegación más reciente.
  const openRequestRef = useRef(0);

  // Cargar índice liviano (metadata + texto para búsqueda, sin blocks) —
  // generado en build por scripts/build-index.mjs. El contenido completo de
  // cada artículo (blocks) se pide recién cuando el usuario lo abre, ver
  // loadFullArticle / openArticle más abajo.
  useEffect(() => {
    fetch(`/data/${lang}/index-lite.json`)
      .then(r => (r.ok ? r.json() : null))
      .then((index) => {
        if (!index) return;
        const collections = Array.isArray(index.collections) ? index.collections : [];

        setCollections(collections);

        // Construir índice de búsqueda
        const index2 = buildSearchIndex(collections);
        setSearchIndex(index2);

        // Aplanar artículos para vista general
        const flat = collections.flatMap(c =>
          (c.sections || []).flatMap(s =>
            (s.articles || []).map(a => ({
              ...a,
              collectionTitle: c.title,
              sectionTitle: s.title,
            }))
          )
        );
        setAllArticles(flat);
      })
      .catch(() => {});
  }, [lang]);

  // Búsqueda con scoring local
  useEffect(() => {
    const q = debouncedSearch.trim();
    if (!q) { setSearchResults(null); return; }
    const results = performSearch(q, searchIndex);
    setSearchResults(results);
  }, [debouncedSearch, searchIndex]);

  // Artículos mostrados según filtros
  const displayedArticles = (() => {
    const base = searchResults ?? allArticles;
    if (activeCollection === 'Todos') return base;
    return base.filter(a => a.collectionTitle === activeCollection);
  })();

  // Abrir artículo: si el archivo fuente (con blocks completos) ya está en
  // cache lo usa directo; si no, muestra el skeleton y lo trae bajo demanda.
  const openArticle = useCallback((article, highlight) => {
    const requestId = ++openRequestRef.current;
    setHighlightTarget(highlight && highlight.term ? highlight : null);
    setView('article');
    if (!highlight) window.scrollTo({ top: 0, behavior: 'smooth' });

    const applyFull = (fileData) => {
      if (openRequestRef.current !== requestId) return; // superado por otra navegación
      let full = null;
      if (fileData) {
        const flat = (fileData.sections || []).flatMap(s => s.articles || []);
        // articleIndex (posición en el archivo) es la fuente de verdad — muchos
        // artículos no tienen `id`, así que buscar por id matchearía siempre
        // el primero con id undefined. Se usa id solo como respaldo si el
        // índice no está disponible.
        full = (typeof article.articleIndex === 'number' ? flat[article.articleIndex] : null)
          ?? flat.find(a => a.id != null && a.id === article.id)
          ?? null;
      }
      setActiveArticle(full ? { ...article, ...full } : article);
    };

    if (!article.sourceFile) {
      setActiveArticle(article);
      return;
    }

    const cacheKey = `${lang}:${article.sourceFile}`;
    const cached = fullCollectionCache.current.get(cacheKey);
    if (cached) {
      applyFull(cached);
      return;
    }

    setActiveArticle(null); // dispara el skeleton existente en ArticleView
    fetchLocalized(article.sourceFile, lang).then((data) => {
      if (data) fullCollectionCache.current.set(cacheKey, data);
      applyFull(data);
    });
  }, [lang]);

  const goHome = useCallback(() => {
    setView('home');
    setActiveArticle(null);
    setActiveCollection('Todos');
  }, []);

  // Cambiar de idioma puede dejar la vista actual apuntando a un artículo o
  // colección que no existe en el otro idioma — volver al inicio evita ese estado roto.
  const handleToggleLang = useCallback((toggleLang) => {
    setView('home');
    setActiveArticle(null);
    setActiveCollection('Todos');
    setSearch('');
    setExercisesData(null);
    toggleLang();
  }, []);

  const goExercises = useCallback(() => {
    setView('ejercicios');
    if (!exercisesData) {
      const file = lang === 'en' ? '/data/en/exercises.json' : '/data/es/ejercicios.json';
      fetch(file)
        .then(r => (r.ok ? r.json() : lang === 'en' ? fetch('/data/es/ejercicios.json').then(r2 => r2.json()) : Promise.reject()))
        .then(setExercisesData)
        .catch(() => {});
    }
  }, [exercisesData, lang]);

  const goHomeToCollection = useCallback((collectionTitle) => {
    setView('home');
    setActiveArticle(null);
    setActiveCollection(collectionTitle);
    setSearch('');
  }, []);

  // Al hacer click en una CollectionCard: abre el primer artículo directamente
  const openCollection = useCallback((collection) => {
    const firstArticle = (collection.sections || [])
      .flatMap(s => (s.articles || []).map(a => ({
        ...a,
        collectionTitle: collection.title,
        sectionTitle: s.title,
      })))[0];
    if (firstArticle) {
      openArticle(firstArticle);
    }
  }, [openArticle]);

  return {
    collections, allArticles, displayedArticles, activeCollection,
    search, setSearch, searchResults,
    view, activeArticle, highlightTarget, exercisesData, activeExercise,
    openArticle, goHome, handleToggleLang, goExercises,
    goHomeToCollection, openCollection, setActiveExercise,
  };
}
