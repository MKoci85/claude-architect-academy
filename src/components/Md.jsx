import { parseMd } from '../utils/markdown';

export function Md({ children, highlightTerm }) {
  if (!children) return null;
  const paragraphs = String(children).split(/\n\n+/);
  if (paragraphs.length === 1) {
    return <span dangerouslySetInnerHTML={{ __html: parseMd(paragraphs[0], highlightTerm) }} />;
  }
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: parseMd(p, highlightTerm) }} />
      ))}
    </>
  );
}
