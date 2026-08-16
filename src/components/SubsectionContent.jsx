import { Block } from './blocks';

export function SubsectionContent({ sub, highlightTerm }) {
  if (sub.blocks && sub.blocks.length > 0) {
    return <div className="sub-blocks">{sub.blocks.map((b, i) => <Block key={i} block={b} highlightTerm={highlightTerm} />)}</div>;
  }
  if (sub.content) {
    return <div className="subsection-body">{sub.content}</div>;
  }
  return null;
}
