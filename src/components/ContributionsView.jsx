function formatPrice(price) {
  return `$${Number(price).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ContributionsView({ items, profiles, onAdd }) {
  if (profiles.length === 0) {
    return (
      <div className="contributions-view">
        <div className="list-toolbar">
          <div />
          <button className="btn-primary" onClick={onAdd}>+ Add Item</button>
        </div>
        <div className="empty-state">
          No profiles yet. Create a profile when adding or editing an item.
        </div>
      </div>
    );
  }

  // Build per-profile contribution data
  const profileData = profiles.map((profile) => {
    const contributions = [];
    for (const item of items) {
      const entry = (item.paidBy || []).find((p) => p.profileId === profile.id);
      if (entry && entry.amount > 0) {
        contributions.push({ item, amount: entry.amount });
      }
    }
    const total = contributions.reduce((sum, c) => sum + c.amount, 0);
    return { profile, contributions, total };
  });

  const grandTotal = profileData.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="contributions-view">
      <div className="list-toolbar">
        <div className="budget-summary">
          <span className="budget-label">Total Tracked</span>
          <span className="budget-amount">{formatPrice(grandTotal)}</span>
        </div>
        <button className="btn-primary" onClick={onAdd}>+ Add Item</button>
      </div>

      <div className="contributions-list">
        {profileData.map(({ profile, contributions, total }) => (
          <div key={profile.id} className="contribution-card">
            <div className="contribution-header">
              <div className="contribution-avatar">{profile.name.charAt(0).toUpperCase()}</div>
              <span className="contribution-name">{profile.name}</span>
              <span className="contribution-total">{formatPrice(total)}</span>
            </div>
            {contributions.length > 0 ? (
              <ul className="contribution-items">
                {contributions.map(({ item, amount }) => (
                  <li key={item.id} className="contribution-item">
                    <span className="contribution-item-name">{item.name}</span>
                    <span className="contribution-item-amount">{formatPrice(amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="contribution-empty">No contributions yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
