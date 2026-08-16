import { Md } from '../Md';

export function BlockTable({ block }) {
  const headers = block.headers || block.columns;
  return (
    <div className="block-table-wrap">
      <table className="block-table">
        {headers && (
          <thead>
            <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
        )}
        <tbody>
          {(block.rows || []).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci}><Md>{cell}</Md></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
