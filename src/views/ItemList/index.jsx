import { useState } from 'react';
import StarRating from '../../components/StarRating';

const SORT_OPTIONS = [
  { label: 'Phase (1 → ...)', fn: (a, b) => (a.phase || 1) - (b.phase || 1) },
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

export default function ItemList({ items, onEdit, onDelete, onAdd, onTogglePurchased }) {
  const [sortIdx, setSortIdx] = useState(0);

  const sortFn = SORT_OPTIONS[sortIdx].fn;
  const unpurchased = [...items].filter((i) => !i.purchased).sort(sortFn);
  const purchased = [...items].filter((i) => i.purchased).sort(sortFn);
  const total = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const purchasedCount = purchased.length;

  return (
    <div className="item-list">
      <div className="list-toolbar">
        <div className="budget-summary">
          <span className="budget-label">Total Budget</span>
          <span className="budget-amount">{formatPrice(total)}</span>
          <span className="budget-count">{purchasedCount}/{items.length} bought</span>
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

      {items.length === 0 ? (
        <div className="empty-state">No items yet. Click <strong>+ Add Item</strong> to get started.</div>
      ) : (
        <table className="items-table">
          <thead>
            <tr>
              <th className="col-check"></th>
              <th>Item</th>
              <th>Phase</th>
              <th>Planned Date</th>
              <th>Price</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {unpurchased.map((item) => (
              <tr key={item.id}>
                <td className="col-check">
                  <input type="checkbox" className="purchase-checkbox" checked={false} onChange={() => onTogglePurchased(item.id)} />
                </td>
                <td>
                  <div className="item-name">{item.name}</div>
                  {item.details && <div className="item-details">{item.details}</div>}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="item-link">View item ↗</a>
                  )}
                </td>
                <td><span className="phase-badge">Phase {item.phase || 1}</span></td>
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
            {purchased.length > 0 && (
              <tr className="purchased-divider">
                <td colSpan={7}>Bought ({purchased.length})</td>
              </tr>
            )}
            {purchased.map((item) => (
              <tr key={item.id} className="row-purchased">
                <td className="col-check">
                  <input type="checkbox" className="purchase-checkbox" checked={true} onChange={() => onTogglePurchased(item.id)} />
                </td>
                <td>
                  <div className="item-name">{item.name}</div>
                  {item.details && <div className="item-details">{item.details}</div>}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer" className="item-link">View item ↗</a>
                  )}
                </td>
                <td><span className="phase-badge">Phase {item.phase || 1}</span></td>
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
              <td colSpan={4}><strong>Total</strong></td>
              <td className="price-cell"><strong>{formatPrice(total)}</strong></td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
