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

  // Group items by phase
  const phaseMap = {};
  for (const item of items) {
    const phase = item.phase || 1;
    if (!phaseMap[phase]) phaseMap[phase] = [];
    phaseMap[phase].push(item);
  }
  const phases = Object.keys(phaseMap).map(Number).sort((a, b) => a - b);

  // Per-phase summary totals across all items
  const totalPaid = items.filter((i) => i.purchased).reduce((s, i) => s + (i.price || 0), 0);
  const totalUpcoming = items.filter((i) => !i.purchased).reduce((s, i) => s + (i.price || 0), 0);

  return (
    <div className="contributions-view">
      <div className="list-toolbar">
        <div className="budget-summary">
          <span className="budget-label">Paid</span>
          <span className="budget-amount">{formatPrice(totalPaid)}</span>
          <span className="budget-label" style={{ marginLeft: 8 }}>Upcoming</span>
          <span className="budget-amount">{formatPrice(totalUpcoming)}</span>
        </div>
        <button className="btn-primary" onClick={onAdd}>+ Add Item</button>
      </div>

      <div className="cv-phases">
        {phases.map((phase) => {
          const phaseItems = phaseMap[phase];
          const paid = phaseItems.filter((i) => i.purchased);
          const upcoming = phaseItems.filter((i) => !i.purchased);
          const phasePaidTotal = paid.reduce((s, i) => s + (i.price || 0), 0);
          const phaseUpcomingTotal = upcoming.reduce((s, i) => s + (i.price || 0), 0);

          return (
            <div key={phase} className="cv-phase">
              {/* Phase header */}
              <div className="cv-phase-header">
                <span className="cv-phase-title">Phase {phase}</span>
                <div className="cv-phase-totals">
                  {phasePaidTotal > 0 && (
                    <span className="cv-badge cv-badge-paid">Paid {formatPrice(phasePaidTotal)}</span>
                  )}
                  {phaseUpcomingTotal > 0 && (
                    <span className="cv-badge cv-badge-upcoming">Upcoming {formatPrice(phaseUpcomingTotal)}</span>
                  )}
                </div>
              </div>

              {/* Profile rows */}
              <div className="cv-profile-rows">
                {profiles.map((profile) => {
                  const profilePaid = paid.flatMap((item) => {
                    const entry = (item.paidBy || []).find((p) => p.profileId === profile.id);
                    return entry && entry.amount > 0 ? [{ item, amount: entry.amount }] : [];
                  });
                  const profileUpcoming = upcoming.flatMap((item) => {
                    const entry = (item.paidBy || []).find((p) => p.profileId === profile.id);
                    return entry && entry.amount > 0 ? [{ item, amount: entry.amount }] : [];
                  });
                  const profilePaidTotal = profilePaid.reduce((s, c) => s + c.amount, 0);
                  const profileUpcomingTotal = profileUpcoming.reduce((s, c) => s + c.amount, 0);

                  if (profilePaid.length === 0 && profileUpcoming.length === 0) return null;

                  return (
                    <div key={profile.id} className="cv-profile-row">
                      <div className="cv-profile-meta">
                        <div className="contribution-avatar">{profile.name.charAt(0).toUpperCase()}</div>
                        <span className="cv-profile-name">{profile.name}</span>
                      </div>

                      <div className="cv-profile-detail">
                        {profilePaid.length > 0 && (
                          <div className="cv-section">
                            <span className="cv-section-label paid">Paid</span>
                            <ul className="cv-item-list">
                              {profilePaid.map(({ item, amount }) => (
                                <li key={item.id} className="cv-item">
                                  <span className="cv-item-name">{item.name}</span>
                                  <span className="cv-item-amount">{formatPrice(amount)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="cv-subtotal">{formatPrice(profilePaidTotal)}</div>
                          </div>
                        )}
                        {profileUpcoming.length > 0 && (
                          <div className="cv-section">
                            <span className="cv-section-label upcoming">Upcoming</span>
                            <ul className="cv-item-list">
                              {profileUpcoming.map(({ item, amount }) => (
                                <li key={item.id} className="cv-item">
                                  <span className="cv-item-name">{item.name}</span>
                                  <span className="cv-item-amount">{formatPrice(amount)}</span>
                                </li>
                              ))}
                            </ul>
                            <div className="cv-subtotal upcoming">{formatPrice(profileUpcomingTotal)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
