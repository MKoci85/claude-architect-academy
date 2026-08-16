import { Md } from '../Md';

export function BlockSteps({ block }) {
  const items = block.items || block.steps || [];
  return (
    <div className="block-steps">
      {items.map((item, i) => (
        <div key={i} className="block-step">
          <div className="block-step-num">{i + 1}</div>
          <div className="block-step-body">
            <div className="block-step-title">{item.title}</div>
            <div className="block-step-text"><Md>{item.body || item.description || item.content}</Md></div>
            {item.tag && <span className="block-step-tag">{item.tag}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
