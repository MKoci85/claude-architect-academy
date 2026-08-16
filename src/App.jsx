import { useCallback } from 'react';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './i18n/useLanguage';
import { useWikiData } from './hooks/useWikiData';
import { TopBar } from './components/TopBar';
import { HomeView } from './components/HomeView';
import { ArticleView } from './components/ArticleView';
import { ExercisesView } from './components/ExercisesView';

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [lang, toggleLang] = useLanguage();
  const wiki = useWikiData(lang);

  const handleToggleLang = useCallback(() => {
    wiki.handleToggleLang(toggleLang);
  }, [wiki, toggleLang]);

  return (
    <>
      <TopBar
        search={wiki.search}
        onSearch={wiki.setSearch}
        searchResults={wiki.searchResults}
        onResultClick={wiki.openArticle}
        theme={theme}
        onToggle={toggleTheme}
        lang={lang}
        onToggleLang={handleToggleLang}
        onLogoClick={wiki.goHome}
        onExercises={wiki.goExercises}
      />
      {wiki.view === 'ejercicios' ? (
        <ExercisesView
          data={wiki.exercisesData}
          activeIndex={wiki.activeExercise}
          onSelect={wiki.setActiveExercise}
          onHome={wiki.goHome}
          lang={lang}
        />
      ) : wiki.view === 'home' ? (
        <HomeView
          collections={wiki.collections}
          articles={wiki.displayedArticles}
          activeCollection={wiki.activeCollection}
          onCollection={wiki.setActiveCollection}
          onArticle={wiki.openArticle}
          onOpenCollection={wiki.openCollection}
          search={wiki.search}
          lang={lang}
        />
      ) : (
        <ArticleView
          article={wiki.activeArticle}
          sectionArticles={wiki.activeArticle
            ? wiki.allArticles.filter(a =>
                a.collectionTitle === wiki.activeArticle.collectionTitle &&
                a.sectionTitle === wiki.activeArticle.sectionTitle
              )
            : []}
          groupedSections={(() => {
            if (!wiki.activeArticle) return null;
            const col = wiki.collections.find(c => c.title === wiki.activeArticle.collectionTitle);
            if (!col) return null;
            return col.sections.map(s => ({
              title: s.title,
              articles: (s.articles || []).map(a => ({
                ...a,
                collectionTitle: col.title,
                sectionTitle: s.title,
              })),
            }));
          })()}
          onArticle={wiki.openArticle}
          onCollection={wiki.goHomeToCollection}
          onHome={wiki.goHome}
          highlightTarget={wiki.highlightTarget}
          lang={lang}
        />
      )}
    </>
  );
}
