export function BlockStats({ block }) {
  const items = block.items || block.stats || [];
  return (
    <div className="block-stats">
      {items.map((item, i) => (
        <div key={i} className="block-stat">
          <div className="block-stat-value">{item.value}</div>
          <div className="block-stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
