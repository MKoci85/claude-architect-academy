import { useUI } from '../i18n/strings';
import { IconChevronRight } from './icons';
import { SubsectionContent } from './SubsectionContent';

export function ExercisesView({ data, activeIndex, onSelect, onHome, lang }) {
  const t = useUI(lang);
  if (!data) {
    return (
      <div className="exercises-scope">
        <div className="article-layout">
          <main id="content" className="article-view">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="skeleton" style={{ height: 14, width: 120 }} />
              <div className="skeleton" style={{ height: 32, width: '70%' }} />
              <div className="skeleton" style={{ height: 16, width: '90%' }} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const exercises = data.exercises || [];
  const ex = exercises[activeIndex] || exercises[0];

  return (
    <div className="exercises-scope">
      <div className="article-layout fade-in">
        <aside className="article-sidebar">
          <button className="sidebar-home-btn" onClick={onHome}>{"← " + t.home}</button>
          <div className="sidebar-collection-label">
            <span className="badge exercises-badge">{t.practicalExercises}</span>
          </div>
          <nav className="sidebar-nav">
            {exercises.map((e, i) => (
              <button
                key={e.id}
                className={`sidebar-item ${i === activeIndex ? 'active' : ''}`}
                onClick={() => i !== activeIndex && onSelect(i)}
              >
                <span className="exercise-num">{e.number}</span> {e.title}
              </button>
            ))}
          </nav>
        </aside>

        <main id="content" className="article-view">
          <div className="breadcrumb">
            <button className="breadcrumb-btn breadcrumb-home" onClick={onHome}>{t.home}</button>
            <IconChevronRight />
            <span className="breadcrumb-current">{t.exercise(ex.number)}</span>
          </div>

          <h1 className="article-title">{ex.title}</h1>
          {ex.objective && <p className="article-lead">{ex.objective}</p>}

          {ex.subsections && ex.subsections.length > 0 ? (
            <div>
              {ex.subsections.map((sub, i) => (
                <section key={i} className="sub-group">
                  {sub.title && <h2 className="subsection-title">{sub.title}</h2>}
                  <SubsectionContent sub={sub} />
                </section>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: 32 }}>⊘</div>
              <p>{t.resolutionComingSoon}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
