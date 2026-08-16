import { Md } from '../Md';

export function BlockCards({ block }) {
  const items = block.items || block.cards || [];
  return (
    <div className="block-cards">
      {items.map((item, i) => (
        <div key={i} className="block-card">
          <div className="block-card-title">{item.title}</div>
          <div className="block-card-body"><Md>{item.body || item.description || item.content}</Md></div>
        </div>
      ))}
    </div>
  );
}
