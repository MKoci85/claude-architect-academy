import { Md } from '../Md';

export function BlockCallout({ block, highlightTerm }) {
  const variant = block.variant || block.style;
  return (
    <div className={`block-callout${variant ? ` block-callout-${variant}` : ''}`}>
      {block.title && <div className="block-callout-title">{block.icon && <span>{block.icon} </span>}{block.title}</div>}
      {block.icon && !block.title && <span className="block-callout-icon">{block.icon}</span>}
      <div><Md highlightTerm={highlightTerm}>{block.content}</Md></div>
    </div>
  );
}
