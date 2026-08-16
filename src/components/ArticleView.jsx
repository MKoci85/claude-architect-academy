import { useState, useEffect } from 'react';
import { useUI } from '../i18n/strings';
import { collectionBadge } from '../constants/collections';
import { IconChevronRight } from './icons';
import { SubsectionContent } from './SubsectionContent';
import { Block } from './blocks';

export function ArticleView({ article, sectionArticles, groupedSections, onArticle, onCollection, onHome, highlightTarget, lang }) {
  const t = useUI(lang);
  const [flashIndex, setFlashIndex] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  // Abre automáticamente la sección que contiene el artículo activo.
  useEffect(() => {
    if (!article || !groupedSections) return;
    const active = groupedSections.find(section =>
      section.articles.some(a => a.title === article.title && a.sectionTitle === article.sectionTitle)
    );
    if (active) setOpenSection(active.title);
  }, [article, groupedSections]);

  // Al llegar desde un resultado de búsqueda: hace scroll a la subsección
  // encontrada y la resalta durante 2 segundos.
  useEffect(() => {
    if (!article || !highlightTarget || highlightTarget.subsectionIndex == null) return;

    const { subsectionIndex } = highlightTarget;
    const el = document.getElementById(`subsection-${subsectionIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setFlashIndex(subsectionIndex);
    const timer = setTimeout(() => setFlashIndex(null), 2000);
    return () => clearTimeout(timer);
  }, [article, highlightTarget]);

  if (!article) {
    return (
      <div className="article-layout">
        <div className="article-view">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton" style={{ height: 14, width: 120 }} />
            <div className="skeleton" style={{ height: 32, width: '70%' }} />
            <div className="skeleton" style={{ height: 16, width: '90%' }} />
            <div className="skeleton" style={{ height: 16, width: '80%' }} />
          </div>
        </div>
      </div>
    );
  }

  const badge = collectionBadge(article.collectionTitle);
  const isActive = (a) => a.title === article.title && a.sectionTitle === article.sectionTitle;

  const renderSidebar = () => {
    if (groupedSections && groupedSections.length > 0) {
      return (
        <aside className="article-sidebar">
          <button className="sidebar-home-btn" onClick={onHome}>{"← " + t.home}</button>
          <div className="sidebar-collection-label">
            <span className={`badge ${badge}`}>{article.collectionTitle}</span>
          </div>
          <nav className="sidebar-nav">
            {groupedSections.map(section => {
              const isOpen = openSection === section.title;
              return (
                <div key={section.title} className={`sidebar-group ${isOpen ? 'open' : ''}`}>
                  <button
                    className="sidebar-group-label sidebar-group-toggle"
                    onClick={() => setOpenSection(isOpen ? null : section.title)}
                  >
                    <span>{section.title}</span>
                    <IconChevronRight className="sidebar-group-chevron" />
                  </button>
                  {isOpen && section.articles.map(a => (
                    <button
                      key={a.title}
                      className={`sidebar-item ${isActive(a) ? 'active' : ''}`}
                      onClick={() => !isActive(a) && onArticle(a)}
                    >
                      {a.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>
        </aside>
      );
    }

    if (sectionArticles && sectionArticles.length > 1) {
      return (
        <aside className="article-sidebar">
          <button className="sidebar-home-btn" onClick={onHome}>{"← " + t.home}</button>
          <div className="sidebar-collection-label">
            <span className={`badge ${badge}`}>{article.collectionTitle}</span>
          </div>
          <nav className="sidebar-nav">
            {sectionArticles.map(a => (
              <button
                key={a.id || a.title}
                className={`sidebar-item ${isActive(a) ? 'active' : ''}`}
                onClick={() => !isActive(a) && onArticle(a)}
              >
                {a.title}
              </button>
            ))}
          </nav>
        </aside>
      );
    }
    return null;
  };

  return (
    <div className="article-layout fade-in">
      {renderSidebar()}

      {/* Article content */}
      <div className="article-view">
        <div className="breadcrumb">
          <button className="breadcrumb-btn breadcrumb-home" onClick={onHome}>{t.home}</button>
          <IconChevronRight />
          <span className={`badge ${badge}`}>{article.collectionTitle}</span>
          <IconChevronRight />
          <span className="breadcrumb-current">{article.sectionTitle}</span>
        </div>

        <h1 className="article-title">{article.title}</h1>

        {article.summary && (
          <p className="article-lead">{article.summary}</p>
        )}

        {article.blocks && article.blocks.length > 0 && (
          <div className="sub-blocks">
            {article.blocks.map((b, i) => <Block key={i} block={b} />)}
          </div>
        )}

        {article.subsections && article.subsections.length > 0 && (
          <>
            <div className="section-label">{t.content}</div>
            <div>
              {article.subsections.map((sub, i) => (
                <div
                  key={i}
                  id={`subsection-${i}`}
                  className={`sub-group ${flashIndex === i ? 'sub-group-flash' : ''}`}
                >
                  {sub.title && <div className="subsection-title">{sub.title}</div>}
                  <SubsectionContent sub={sub} highlightTerm={flashIndex === i ? highlightTarget?.term : null} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
