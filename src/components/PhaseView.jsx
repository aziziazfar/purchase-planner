function formatPrice(price) {
  return `$${Number(price).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PhaseView({ items, onAdd }) {
  const phaseMap = {};
  for (const item of items) {
    const phase = item.phase || 1;
    if (!phaseMap[phase]) phaseMap[phase] = [];
    phaseMap[phase].push(item);
  }

  const phases = Object.keys(phaseMap).map(Number).sort((a, b) => a - b);

  return (
    <div className="phase-view">
      <div className="list-toolbar">
        <div />
        <button className="btn-primary" onClick={onAdd}>+ Add Item</button>
      </div>

      {phases.length === 0 ? (
        <div className="empty-state">No items yet. Click <strong>+ Add Item</strong> to get started.</div>
      ) : (
        <div className="phase-columns">
          {phases.map((phase) => {
            const phaseItems = phaseMap[phase];
            const total = phaseItems.reduce((sum, i) => sum + (i.price || 0), 0);
            return (
              <div key={phase} className="phase-column">
                <div className="phase-column-header">
                  <span className="phase-column-title">Phase {phase}</span>
                  <div className="phase-column-amounts">
                    <span className="phase-column-total">{formatPrice(total)}</span>
                    <span className="phase-column-upcoming">
                      {formatPrice(phaseItems.filter((i) => !i.purchased).reduce((s, i) => s + (i.price || 0), 0))} upcoming
                    </span>
                  </div>
                </div>
                <ul className="phase-item-list">
                  {[...phaseItems.filter(i => !i.purchased), ...phaseItems.filter(i => i.purchased)].map((item) => (
                    <li key={item.id} className={`phase-item ${item.purchased ? 'phase-item-purchased' : ''}`}>
                      <span className="phase-item-name">{item.name}</span>
                      <span className="phase-item-price">{formatPrice(item.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
