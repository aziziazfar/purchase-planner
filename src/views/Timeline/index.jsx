import StarRating from '../../components/StarRating';

function formatPrice(price) {
  return `$${Number(price).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });
}

export default function TimelineTable({ items, onEdit, onDelete, onAdd }) {
  // Group items by month
  const monthMap = {};
  for (const item of items) {
    if (!item.plannedDate) continue;
    const key = getMonthKey(item.plannedDate);
    if (!monthMap[key]) monthMap[key] = [];
    monthMap[key].push(item);
  }

  // Sort months chronologically
  const months = Object.keys(monthMap).sort();

  if (months.length === 0) {
    return (
      <div className="timeline">
        <div className="list-toolbar">
          <div />
          <button className="btn-primary" onClick={onAdd}>+ Add Item</button>
        </div>
        <div className="empty-state">No items yet. Click <strong>+ Add Item</strong> to get started.</div>
      </div>
    );
  }

  return (
    <div className="timeline">
      <div className="list-toolbar">
        <div />
        <button className="btn-primary" onClick={onAdd}>+ Add Item</button>
      </div>
      <div className="timeline-scroll">
        <table className="timeline-table">
          <thead>
            <tr>
              {months.map((m) => (
                <th key={m}>
                  <div className="month-header">
                    <span className="month-name">{getMonthLabel(m)}</span>
                    <span className="month-total">
                      {formatPrice(monthMap[m].reduce((s, i) => s + (i.price || 0), 0))}
                    </span>
                    <span className="month-upcoming">
                      {formatPrice(monthMap[m].filter((i) => !i.purchased).reduce((s, i) => s + (i.price || 0), 0))} upcoming
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="timeline-items-row">
              {months.map((m) => (
                <td key={m} className="timeline-cell">
                  {monthMap[m]
                    .sort((a, b) => {
                      if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
                      return b.importance - a.importance;
                    })
                    .map((item) => (
                      <div key={item.id} className={`timeline-card${item.purchased ? ' timeline-card--purchased' : ''}`}>
                        <div className="card-header">
                          <span className="card-name">{item.name}</span>
                          <StarRating value={item.importance} readOnly />
                        </div>
                        <div className="card-price">{formatPrice(item.price)}</div>
                        {item.details && <div className="card-details">{item.details}</div>}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noreferrer" className="item-link">
                            View item ↗
                          </a>
                        )}
                        <div className="card-actions">
                          <button className="btn-edit" onClick={() => onEdit(item)}>Edit</button>
                          <button className="btn-delete" onClick={() => onDelete(item.id)}>Delete</button>
                        </div>
                        {item.purchased && <span className="timeline-purchased-tick">✓</span>}
                      </div>
                    ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
