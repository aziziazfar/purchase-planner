const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PHASE_COLORS = [
  'oklch(0.52 0.14 225)',
  'oklch(0.62 0.16 50)',
  'oklch(0.55 0.17 320)',
  'oklch(0.52 0.15 155)',
  'oklch(0.52 0.18 20)',
  'oklch(0.50 0.15 280)',
];

const PHASE_LABELS = ['Essentials', 'Nice-to-haves', 'Luxury', 'Phase 4', 'Phase 5', 'Phase 6'];

const AVATAR_PALETTE = [
  'oklch(0.52 0.14 225)',
  'oklch(0.52 0.15 155)',
  'oklch(0.55 0.17 320)',
  'oklch(0.62 0.16 50)',
  'oklch(0.52 0.18 20)',
  'oklch(0.50 0.15 280)',
];

function avatarColor(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

// importance 1-5 → priority dot color
function priorityColor(importance) {
  if (importance >= 5) return 'oklch(0.52 0.18 20)';   // red
  if (importance >= 3) return 'oklch(0.65 0.16 65)';   // amber
  return 'oklch(0.52 0.15 155)';                        // green
}

function fmt(price) {
  return '$' + Number(price).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${MONTHS[+m - 1]} ${+day}, ${y}`;
}

export default function PhaseView({ items, profiles = [], onAdd, onEdit }) {
  const phaseMap = {};
  for (const item of items) {
    const phase = item.phase || 1;
    if (!phaseMap[phase]) phaseMap[phase] = [];
    phaseMap[phase].push(item);
  }

  const phases = Object.keys(phaseMap).map(Number).sort((a, b) => a - b);

  return (
    <div>
      <div className="list-toolbar">
        <div />
        <button className="btn-primary" onClick={onAdd}>+ Add Item</button>
      </div>

      {phases.length === 0 ? (
        <div className="empty-state">No items yet. Click <strong>+ Add Item</strong> to get started.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {phases.map((phase) => {
            const phaseItems = phaseMap[phase];
            const color = PHASE_COLORS[(phase - 1) % PHASE_COLORS.length];
            const label = PHASE_LABELS[(phase - 1) % PHASE_LABELS.length];

            const budget = phaseItems.reduce((s, i) => s + (i.price || 0), 0);
            const purchased = phaseItems.filter((i) => i.purchased).reduce((s, i) => s + (i.price || 0), 0);
            const contributed = phaseItems.reduce((s, i) => {
              return s + (i.paidBy || []).reduce((ss, p) => ss + Number(p.amount), 0);
            }, 0);

            const purchasedPct = budget > 0 ? Math.min(100, Math.round(purchased / budget * 100)) : 0;
            const fundedPct    = budget > 0 ? Math.min(100, Math.round(contributed / budget * 100)) : 0;

            const sortedItems = [
              ...phaseItems.filter((i) => !i.purchased),
              ...phaseItems.filter((i) => i.purchased),
            ];

            return (
              <div key={phase} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: 'var(--shadow)',
              }}>
                {/* Phase header */}
                <div style={{ display: 'flex', gap: 0 }}>
                  {/* Color bar */}
                  <div style={{ width: 3, background: color, flexShrink: 0, borderRadius: '0 0 0 0' }} />

                  <div style={{ flex: 1, padding: '16px 20px' }}>
                    {/* Top row: title + stats */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Phase {phase}</span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: color, background: `color-mix(in oklch, ${color} 15%, transparent)`, padding: '2px 8px', borderRadius: 20 }}>{label}</span>
                          <span style={{ fontSize: 11, color: 'var(--t3)' }}>{phaseItems.length} item{phaseItems.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        {[
                          { label: 'Budget',      value: fmt(budget),      color: 'var(--t1)' },
                          { label: 'Purchased',   value: fmt(purchased),   color: 'var(--green)' },
                          { label: 'Contributed', value: fmt(contributed), color: 'var(--accent)' },
                        ].map((s) => (
                          <div key={s.label} style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ position: 'relative', height: 4, borderRadius: 2, background: 'var(--border)' }}>
                      {/* Funded layer (lighter, behind) */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: fundedPct + '%',
                        borderRadius: 2,
                        background: color,
                        opacity: 0.35,
                        transition: 'width 0.4s',
                      }} />
                      {/* Purchased layer (solid, in front) */}
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: purchasedPct + '%',
                        borderRadius: 2,
                        background: color,
                        transition: 'width 0.4s',
                      }} />
                    </div>

                    {/* Progress labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                      <span style={{ fontSize: 10, color: 'var(--t3)' }}>{purchasedPct}% purchased · {fundedPct}% funded</span>
                    </div>
                  </div>
                </div>

                {/* Item card grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 1,
                  borderTop: '1px solid var(--border)',
                }}>
                  {sortedItems.map((item) => {
                    const totalContributed = (item.paidBy || []).reduce((s, p) => s + Number(p.amount), 0);
                    const isAllocated = item.price > 0 && totalContributed >= item.price;

                    // Contributor avatars (up to 3)
                    const contributors = (item.paidBy || [])
                      .filter((p) => p.amount > 0)
                      .slice(0, 3)
                      .map((p) => {
                        const profile = profiles.find((pr) => pr.id === p.profileId);
                        return profile ? { name: profile.name, color: avatarColor(profile.id) } : null;
                      })
                      .filter(Boolean);

                    return (
                      <button
                        key={item.id}
                        onClick={() => onEdit && onEdit(item)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          padding: '12px 16px',
                          background: item.purchased ? 'var(--surface2)' : 'var(--surface)',
                          border: 'none',
                          borderRight: '1px solid var(--border)',
                          borderBottom: '1px solid var(--border)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = item.purchased ? 'var(--surface2)' : 'var(--surface)'; }}
                      >
                        {/* Card top row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          {/* Priority dot */}
                          <span style={{
                            width: 7, height: 7, borderRadius: '50%',
                            background: priorityColor(item.importance),
                            flexShrink: 0, marginTop: 4,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 13, fontWeight: 600, color: 'var(--t1)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              textDecoration: item.purchased ? 'line-through' : 'none',
                              opacity: item.purchased ? 0.5 : 1,
                            }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                              {fmtDate(item.plannedDate)}
                            </div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', flexShrink: 0 }}>
                            {fmt(item.price)}
                          </div>
                        </div>

                        {/* Card bottom: avatars + allocation status */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex' }}>
                            {contributors.map((c, idx) => (
                              <div key={idx} style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: c.color,
                                border: '2px solid var(--surface)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 9, fontWeight: 700, color: '#fff',
                                marginLeft: idx > 0 ? -6 : 0,
                                flexShrink: 0,
                              }}>
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 600,
                            padding: '2px 7px', borderRadius: 20,
                            background: isAllocated ? 'var(--green-soft)' : 'var(--surface2)',
                            color: isAllocated ? 'var(--green)' : 'var(--t3)',
                          }}>
                            {isAllocated ? 'Assigned' : 'Unassigned'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
