import { Md } from '../Md';

export function BlockCompare({ block }) {
  const renderCol = (col) => col && (
    <div className="block-compare-col">
      <div className="block-compare-head">{col.head || col.label || col.title}</div>
      <div className="block-compare-body">
        {(col.items || []).map((item, i) => (
          <div key={i} className="block-compare-row">
            <Md>{typeof item === 'string' ? item : item.title}</Md>
          </div>
        ))}
        {(col.rows || []).map((row, i) => (
          <div key={i} className="block-compare-row">
            <span className="block-compare-key">{row.key}</span>
            <span><Md>{row.value}</Md></span>
          </div>
        ))}
      </div>
    </div>
  );

  // Formato alternativo: array de items con left/right por item
  if (block.items && !block.left && !block.right) {
    return (
      <div className="block-compare">
        {block.title && <div className="block-compare-title">{block.title}</div>}
        <div className="block-compare-cols">
          {block.items.map((item, i) => (
            <div key={i} className="block-compare-col">
              <div className="block-compare-head">{item.title || item.label}</div>
              <div className="block-compare-body">
                {(item.items || item.rows || []).map((row, j) => (
                  <div key={j} className="block-compare-row">
                    <Md>{typeof row === 'string' ? row : (row.key ? <><span className="block-compare-key">{row.key}</span> {row.value}</> : row.title)}</Md>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="block-compare">
      {block.title && <div className="block-compare-title">{block.title}</div>}
      <div className="block-compare-cols">
        {renderCol(block.left)}
        {renderCol(block.right)}
      </div>
    </div>
  );
}
