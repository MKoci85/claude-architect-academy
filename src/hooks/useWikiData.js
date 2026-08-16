import { useState, useEffect, useCallback, useRef } from 'react';
import { buildSearchIndex, search as performSearch } from '../searchEngine';
import { fetchLocalized } from '../data/fetchLocalized';
import { useDebounce } from './useDebounce';
import { scrollBehavior } from '../utils/motion';

export function useWikiData(lang, route, navigate) {
  const [collections, setCollections] = useState([]);
  const [searchIndex, setSearchIndex] = useState([]);
  const [searchDocs, setSearchDocs] = useState(null);
  const searchDocsRef = useRef(null);
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
  const pendingHighlightRef = useRef(null);

  useEffect(() => {
    setSearchDocs(null);
    fetch(`/data/${lang}/index.json`)
      .then(r => (r.ok ? r.json() : null))
      .then((index) => {
        if (!index) return;
        const collections = Array.isArray(index.collections) ? index.collections : [];

        setCollections(collections);

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

  useEffect(() => {
    if (!search.trim() || searchDocs || searchDocsRef.current === lang) return;
    searchDocsRef.current = lang;
    fetch(`/data/${lang}/search-index.json`)
      .then(r => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || searchDocsRef.current !== lang) return;
        setSearchDocs(new Map((data.docs || []).map(d => [d.key, d.texts])));
      })
      .catch(() => { searchDocsRef.current = null; });
  }, [search, searchDocs, lang]);

  useEffect(() => {
    setSearchIndex(buildSearchIndex(collections, searchDocs));
  }, [collections, searchDocs]);

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
  const loadArticle = useCallback((article, highlight) => {
    const requestId = ++openRequestRef.current;
    setHighlightTarget(highlight && highlight.term ? highlight : null);
    setView('article');
    if (!highlight) window.scrollTo({ top: 0, behavior: scrollBehavior() });

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

  const openArticle = useCallback((article, highlight) => {
    if (article?.sourceFile && typeof article.articleIndex === 'number') {
      navigate({
        lang,
        view: 'article',
        sourceFile: article.sourceFile,
        articleIndex: article.articleIndex,
        subsectionIndex: highlight?.subsectionIndex ?? null,
      });
      pendingHighlightRef.current = highlight && highlight.term ? highlight : null;
      return;
    }
    loadArticle(article, highlight);
  }, [lang, navigate, loadArticle]);

  const goHome = useCallback(() => {
    navigate({ lang, view: 'home' });
  }, [lang, navigate]);

  // Cambiar de idioma puede dejar la vista actual apuntando a un artículo o
  // colección que no existe en el otro idioma — volver al inicio evita ese estado roto.
  const handleToggleLang = useCallback((toggleLang) => {
    const next = lang === 'es' ? 'en' : 'es';
    navigate({ lang: next, view: 'home' }, { replace: true });
    setView('home');
    setActiveArticle(null);
    setActiveCollection('Todos');
    setSearch('');
    setExercisesData(null);
    toggleLang();
  }, [lang, navigate]);

  const goExercises = useCallback(() => {
    navigate({ lang, view: 'ejercicios' });
  }, [lang, navigate]);

  const selectExercise = useCallback((index) => {
    navigate({ lang, view: 'ejercicios', exercise: index });
  }, [lang, navigate]);

  const loadExercises = useCallback(() => {
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
    navigate({ lang, view: 'home', collection: collectionTitle });
  }, [lang, navigate]);

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

  useEffect(() => {
    if (!route) return;

    if (route.view === 'article') {
      if (allArticles.length === 0) return;
      const match = allArticles.find(a =>
        a.sourceFile === route.sourceFile && a.articleIndex === route.articleIndex
      );
      if (!match) {
        navigate({ lang, view: 'home' }, { replace: true });
        return;
      }
      const highlight = pendingHighlightRef.current
        ?? (route.subsectionIndex != null ? { subsectionIndex: route.subsectionIndex } : null);
      pendingHighlightRef.current = null;
      loadArticle(match, highlight);
      return;
    }

    if (route.view === 'ejercicios') {
      loadExercises();
      if (route.exercise != null) setActiveExercise(route.exercise);
      return;
    }

    setView('home');
    setActiveArticle(null);
    setActiveCollection(route.collection || 'Todos');
  }, [route, allArticles, lang, navigate, loadArticle, loadExercises]);

  return {
    collections, allArticles, displayedArticles, activeCollection,
    search, setSearch, searchResults,
    view, activeArticle, highlightTarget, exercisesData, activeExercise,
    openArticle, goHome, handleToggleLang, goExercises,
    goHomeToCollection, openCollection, setActiveExercise: selectExercise,
  };
}
