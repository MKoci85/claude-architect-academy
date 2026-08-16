import { useUI } from '../i18n/strings';
import { COLLECTION_ACCENT } from '../constants/collections';

export function CollectionCard({ collection, index, onClick, lang }) {
  const t = useUI(lang);
  const accent = COLLECTION_ACCENT[index % COLLECTION_ACCENT.length];
  const count = (collection.sections || []).reduce((n, s) => n + (s.articles || []).length, 0);

  return (
    <button
      className="collection-card"
      style={{ '--cc-bg': accent.bg, '--cc-border': accent.border, '--cc-dot': accent.dot }}
      onClick={() => onClick(collection)}
    >
      <div className="collection-card-dot" />
      <div className="collection-card-title">{collection.title}</div>
      {collection.summary && (
        <div className="collection-card-desc">{collection.summary}</div>
      )}
      <div className="collection-card-footer">
        <span className="collection-card-count">{count} {t.articlesCount(count)}</span>
        <span className="collection-card-arrow">→</span>
      </div>
    </button>
  );
}
