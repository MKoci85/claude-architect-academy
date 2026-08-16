import { useState } from 'react';
import { useUI } from '../i18n/strings';
import { ArticleCard } from './ArticleCard';

export function SuperSectionView({ collection, onArticle, lang }) {
  const t = useUI(lang);
  const [activeSection, setActiveSection] = useState(null);

  const sections = collection.sections || [];
  const displayed = activeSection
    ? sections.filter(s => s.title === activeSection)
    : sections;

  return (
    <div className="super-section">
      <div className="super-section-header">
        <h2 className="super-section-title">{collection.title}</h2>
        {collection.summary && (
          <p className="super-section-desc">{collection.summary}</p>
        )}
      </div>

      <div className="super-section-tabs">
        <button
          className={`super-tab-btn ${activeSection === null ? 'active' : ''}`}
          onClick={() => setActiveSection(null)}
        >
          {t.all}
        </button>
        {sections.map(s => (
          <button
            key={s.title}
            className={`super-tab-btn ${activeSection === s.title ? 'active' : ''}`}
            onClick={() => setActiveSection(s.title === activeSection ? null : s.title)}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="super-section-body">
        {displayed.map(section => (
          <div key={section.title} className="super-section-group">
            <div className="super-section-group-header">
              <h3 className="super-section-group-title">{section.title}</h3>
              {section.description && (
                <p className="super-section-group-desc">{section.description}</p>
              )}
            </div>
            <div className="cards-grid">
              {(section.articles || []).map(article => (
                <ArticleCard
                  key={article.id || article.title}
                  article={{ ...article, collectionTitle: collection.title, sectionTitle: section.title }}
                  onClick={onArticle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
