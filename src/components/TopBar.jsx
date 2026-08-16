import { useState, useEffect, useRef, useCallback } from 'react';
import { useUI } from '../i18n/strings';
import { collectionBadge } from '../constants/collections';
import { highlightMatch } from '../utils/highlight';
import { IconSearch, IconHome } from './icons';

export function TopBar({ search, onSearch, searchResults, onResultClick, theme, onToggle, lang, onToggleLang, onLogoClick, onExercises }) {
  const t = useUI(lang);
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  // Abre el dropdown cuando hay resultados y texto
  useEffect(() => {
    setOpen(!!search.trim() && searchResults !== null && Array.isArray(searchResults) && searchResults.length > 0);
  }, [search, searchResults]);

  // Cierra al hacer click fuera
  useEffect(() => {
    function handle(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') { onSearch(''); setOpen(false); }
  }, [onSearch]);

  const handleSelect = useCallback((article) => {
    onResultClick(article, {
      term: search,
      subsectionIndex: article.snippetSubsectionIndex ?? null,
    });
    onSearch('');
    setOpen(false);
  }, [onResultClick, onSearch, search]);

  const showEmpty = !!search.trim() && searchResults !== null && Array.isArray(searchResults) && searchResults.length === 0;

  return (
    <header className="topbar">
      <a href="#content" className="skip-link">{t.skipToContent}</a>
      <button className="topbar-logo" onClick={onLogoClick} title={t.home}>
        Claude <IconHome />
      </button>
      <div className="topbar-sep" />

      <div className="search-wrap" ref={wrapRef}>
        <IconSearch />
        <input
          value={search}
          onChange={e => { onSearch(e.target.value); }}
          onKeyDown={handleKey}
          onFocus={() => { if (searchResults && searchResults.length > 0 && search.trim()) setOpen(true); }}
          placeholder={t.searchPlaceholder}
          type="text"
          role="combobox"
          aria-label={t.searchLabel}
          aria-expanded={open}
          aria-controls="search-listbox"
          aria-autocomplete="list"
        />
        {search && (
          <button
            onClick={() => { onSearch(''); setOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 16, lineHeight: 1, padding: 0 }}
            aria-label={t.clearSearch}
          >×</button>
        )}

        {/* Dropdown */}
        {(open || showEmpty) && (
          <div className="search-dropdown" role="listbox" id="search-listbox">
            {showEmpty ? (
              <div className="search-empty">{t.noSearchResults(search)}</div>
            ) : (
              (Array.isArray(searchResults) ? searchResults : []).slice(0, 8).map(article => (
                <button
                  key={`${article.sourceFile}#${article.articleIndex}`}
                  className="search-result-item"
                  role="option"
                  onClick={() => handleSelect(article)}
                >
                  <span className="search-result-title">{article.title}</span>
                  <span className={`badge ${collectionBadge(article.collectionTitle)} search-result-badge`}>
                    {article.collectionTitle}
                  </span>
                  {article.snippet && (
                    <span
                      className="search-result-snippet"
                      dangerouslySetInnerHTML={{
                        __html: (article.snippetSubsectionTitle ? `${highlightMatch(article.snippetSubsectionTitle, search)}: ` : '') + highlightMatch(article.snippet, search)
                      }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <button className="lang-btn" onClick={onToggleLang} title={t.switchLanguage}>
        {lang === 'en' ? 'EN' : 'ES'}
      </button>
      <button className="theme-btn" onClick={onToggle} title={t.switchTheme}>
        {theme === 'dark' ? '☀' : '☾'}
      </button>
      <button className="exercises-btn" onClick={onExercises}>
        {t.exercises}
      </button>
      <a className="exam-btn" href="/practice" target="_blank" rel="noopener noreferrer">
        {t.exam}
      </a>
    </header>
  );
}
