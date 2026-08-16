import { useUI } from '../i18n/strings';
import { CollectionCard } from './CollectionCard';
import { SuperSectionView } from './SuperSectionView';
import { ArticleCard } from './ArticleCard';

export function HomeView({ collections, articles, activeCollection, onCollection, onArticle, onOpenCollection, search, lang }) {
  const t = useUI(lang);
  const activeCollectionData = collections.find(c => c.title === activeCollection);
  const isSuper = activeCollectionData?.isSuper && !search.trim();
  const isHome = activeCollection === 'Todos' && !search.trim();

  return (
    <>
      {isHome && (
        <div className="home-hero">
          <div className="home-hero-eyebrow">{t.heroEyebrow}</div>
          <h1 className="home-hero-headline">
            {t.heroHeadline}
          </h1>
          <p className="home-hero-sub">
            {t.heroSub}
          </p>
        </div>
      )}
    <div className="home">
      {isHome ? (
        <div className="collections-grid">
          {collections.map((col, i) => (
            <CollectionCard key={col.title} collection={col} index={i} onClick={onOpenCollection} lang={lang} />
          ))}
        </div>
      ) : isSuper ? (
        <SuperSectionView collection={activeCollectionData} onArticle={onArticle} lang={lang} />
      ) : (
        <>
          <div className="results-meta">
            {search.trim() ? (
              <><strong>{articles.length}</strong> {t.resultsCount(articles.length)} {t.resultsFor(search)}</>
            ) : articles.length > 0 ? (
              <><strong>{articles.length}</strong> {t.articlesCount(articles.length)}{activeCollection !== 'Todos' ? t.inCollection(activeCollection) : ''}</>
            ) : null}
          </div>

          {articles.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 32 }}>⊘</div>
              <p>{t.noResultsFor(search)}</p>
            </div>
          ) : (
            <div className="cards-grid">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} onClick={onArticle} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}
