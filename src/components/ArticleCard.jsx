import { collectionBadge } from '../constants/collections';

export function ArticleCard({ article, onClick }) {
  const badge = collectionBadge(article.collectionTitle);

  return (
    <button className="article-card fade-in" onClick={() => onClick(article)}>
      <div className="card-title">{article.title}</div>
      {article.summary && (
        <div className="card-summary">{article.summary}</div>
      )}
      <div className="card-meta">
        <span className={`badge ${badge}`}>{article.collectionTitle}</span>
        {article.sectionTitle && (
          <span className="card-section">{article.sectionTitle}</span>
        )}
      </div>
    </button>
  );
}
