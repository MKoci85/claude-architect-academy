import { Md } from '../Md';

export function BlockText({ block, highlightTerm }) {
  return <div className="block-text"><Md highlightTerm={highlightTerm}>{block.content}</Md></div>;
}
