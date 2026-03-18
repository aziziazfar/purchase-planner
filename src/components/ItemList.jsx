import { useState } from 'react';
import StarRating from './StarRating';

const SORT_OPTIONS = [
  { label: 'Priority (High → Low)', fn: (a, b) => b.importance - a.importance },
  { label: 'Priority (Low → High)', fn: (a, b) => a.importance - b.importance },
  { label: 'Date (Soonest)', fn: (a, b) => new Date(a.plannedDate) - new Date(b.plannedDate) },
  { label: 'Date (Latest)', fn: (a, b) => new Date(b.plannedDate) - new Date(a.plannedDate) },
  { label: 'Price (High → Low)', fn: (a, b) => b.price - a.price },
  { label: 'Price (Low → High)', fn: (a, b) => a.price - b.price },
];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(price) {
  return `$${Number(price).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ItemList({ items, onEdit, onDelete, onAdd }) {
  const [sortIdx, setSortIdx] = useState(0);

  const sorted = [...items].sort(SORT_OPTIONS[sortIdx].fn);
  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);

  return (
    <div className="item-list">
      <div className="list-toolbar">
        <div className="budget-summary">
          <span className="budget-label">Total Budget</span>
          <span className="budget-amount">{formatPrice(total)}</span>
          <span className="budget-count">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="list-controls">
          <select value={sortIdx} onChange={(e) => setSortIdx(Number(e.target.value))}>
            {SORT_OPTIONS.map((opt, i) => (
              <option key={i} value={i}>{opt.label}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={onAdd}>+ Add Item</button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">No items yet. Click <strong>+ Add Item</strong> to get started.</div>
      ) : (
        <table className="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Planned Date</th>
              <th>Price</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="item-name">{item.name}</div>
                  {item.details && <div className="item-details">{item.details}</div>}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="item-link">
                      View item ↗
                    </a>
                  )}
                </td>
                <td>{formatDate(item.plannedDate)}</td>
                <td className="price-cell">{formatPrice(item.price)}</td>
                <td><StarRating value={item.importance} readOnly /></td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit" onClick={() => onEdit(item)}>Edit</button>
                    <button className="btn-delete" onClick={() => onDelete(item.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}><strong>Total</strong></td>
              <td className="price-cell"><strong>{formatPrice(total)}</strong></td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
