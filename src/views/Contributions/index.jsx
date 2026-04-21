import { useState } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Deterministic avatar color from profile id
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

const PHASE_COLORS = [
  'oklch(0.52 0.14 225)',
  'oklch(0.62 0.16 50)',
  'oklch(0.55 0.17 320)',
];

function phaseColor(phase) {
  return PHASE_COLORS[((phase || 1) - 1) % PHASE_COLORS.length];
}

function fmt(price) {
  return '$' + Number(price).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${MONTHS[+m - 1]} ${+day}, ${y}`;
}

function fmtMonthKey(mk) {
  const [y, m] = mk.split('-');
  return MONTHS[+m - 1] + ' ' + y;
}

export default function ContributionsView({ items, profiles, onAdd }) {
  const [showPaidFor, setShowPaidFor] = useState({});

  function togglePaid(profileId) {
    setShowPaidFor((prev) => ({ ...prev, [profileId]: !prev[profileId] }));
  }
  if (profiles.length === 0) {
    return (
      <div>
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

  const upcomingItems = items.filter((i) => !i.purchased && i.plannedDate);
  const paidItems     = items.filter((i) =>  i.purchased);

  const totalUpcoming = upcomingItems.reduce((s, i) => s + (i.price || 0), 0);
  const totalPaid     = paidItems.reduce((s, i) => s + (i.price || 0), 0);

  // All months that have upcoming payments
  const allMonthKeys = [
    ...new Set(upcomingItems.map((i) => i.plannedDate.slice(0, 7))),
  ].sort();

  // Monthly totals for the bar chart (total item price per month)
  const monthlyTotals = allMonthKeys.map((mk) => {
    const monthItems = upcomingItems.filter((i) => i.plannedDate.startsWith(mk));
    return {
      mk,
      total: monthItems.reduce((s, i) => s + (i.price || 0), 0),
    };
  });
  const maxMonthTotal = Math.max(...monthlyTotals.map((m) => m.total), 1);

  // Per-profile helpers
  function profileUpcoming(profileId) {
    return upcomingItems
      .filter((i) => (i.paidBy || []).some((p) => p.profileId === profileId && p.amount > 0))
      .map((i) => {
        const entry = (i.paidBy || []).find((p) => p.profileId === profileId);
        return { ...i, myAmount: entry ? Number(entry.amount) : 0 };
      })
      .sort((a, b) => (a.plannedDate || '').localeCompare(b.plannedDate || ''));
  }

  function profilePaidItems(profileId) {
    return paidItems
      .filter((i) => (i.paidBy || []).some((p) => p.profileId === profileId && p.amount > 0))
      .map((i) => {
        const entry = (i.paidBy || []).find((p) => p.profileId === profileId);
        return { ...i, myAmount: entry ? Number(entry.amount) : 0 };
      })
      .sort((a, b) => (a.plannedDate || '').localeCompare(b.plannedDate || ''));
  }

  function profilePaidTotal(profileId) {
    return paidItems.reduce((s, i) => {
      const entry = (i.paidBy || []).find((p) => p.profileId === profileId);
      return s + (entry ? Number(entry.amount) : 0);
    }, 0);
  }

  return (
    <div>
      {/* ── Summary strip ─────────────────────────────────────────── */}
      <div className="cv-summary-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Upcoming',  value: fmt(totalUpcoming), sub: upcomingItems.length + ' items remaining',         color: 'var(--accent)' },
          { label: 'Already Paid',    value: fmt(totalPaid),     sub: paidItems.length + ' items completed',             color: 'var(--green)'  },
          { label: 'Payment Months',  value: allMonthKeys.length, sub: 'months with scheduled spend',                   color: 'var(--t2)'     },
        ].map((s) => (
          <div key={s.label} style={{ padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Monthly cashflow bar chart ─────────────────────────────── */}
      {monthlyTotals.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '18px 20px', marginBottom: 24, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)', marginBottom: 16 }}>Monthly Payment Schedule</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
            {monthlyTotals.map((m) => (
              <div key={m.mk} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t2)' }}>{fmt(m.total)}</div>
                <div style={{
                  width: '100%',
                  borderRadius: '4px 4px 0 0',
                  background: 'var(--accent)',
                  opacity: 0.85,
                  height: Math.max(4, Math.round(m.total / maxMonthTotal * 52)) + 'px',
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: 10, color: 'var(--t3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>
                  {fmtMonthKey(m.mk)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Per-profile upcoming schedules ────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {profiles.map((profile) => {
          const upcoming = profileUpcoming(profile.id);
          const paidTotal = profilePaidTotal(profile.id);
          const upcomingTotal = upcoming.reduce((s, i) => s + i.myAmount, 0);
          if (upcoming.length === 0 && paidTotal === 0) return null;

          const color = avatarColor(profile.id);
          const paidList = profilePaidItems(profile.id);
          const showPaid = showPaidFor[profile.id] || false;

          // Group upcoming by month
          const byMonth = {};
          upcoming.forEach((i) => {
            const mk = i.plannedDate.slice(0, 7);
            if (!byMonth[mk]) byMonth[mk] = [];
            byMonth[mk].push(i);
          });
          const monthGroups = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));

          return (
            <div key={profile.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>

              {/* Contributor header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: upcoming.length ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{profile.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                    {upcoming.length} upcoming payment{upcoming.length !== 1 ? 's' : ''} · {fmt(paidTotal)} already paid
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: upcomingTotal > 0 ? 'var(--t1)' : 'var(--t3)' }}>{fmt(upcomingTotal)}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>to be paid</div>
                </div>
              </div>

              {/* Month groups */}
              {monthGroups.map(([mk, monthItems]) => {
                const monthTotal = monthItems.reduce((s, i) => s + i.myAmount, 0);
                return (
                  <div key={mk}>
                    {/* Month sub-header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{fmtMonthKey(mk)}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{fmt(monthTotal)}</span>
                    </div>

                    {/* Items */}
                    {monthItems.map((item) => {
                      const totalContributed = (item.paidBy || []).reduce((s, p) => s + Number(p.amount), 0);
                      const pct = item.price > 0 ? Math.min(100, Math.round(totalContributed / item.price * 100)) : 0;
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid var(--border)' }}>
                          {/* Phase color bar */}
                          <span style={{ width: 3, height: 32, borderRadius: 2, background: phaseColor(item.phase), flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                              {fmtDate(item.plannedDate)} · {fmt(item.price)} total · {pct}% funded
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: color }}>{fmt(item.myAmount)}</div>
                            <div style={{ fontSize: 10, color: 'var(--t3)' }}>your share</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {upcoming.length === 0 && (
                <div style={{ padding: '14px 20px', fontSize: 13, color: 'var(--t3)', fontStyle: 'italic' }}>
                  No upcoming payments — all done!
                </div>
              )}

              {/* Paid items toggle */}
              {paidList.length > 0 && (
                <>
                  <button
                    onClick={() => togglePaid(profile.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 20px', background: 'var(--surface2)', border: 'none', borderTop: '1px solid var(--border)', cursor: 'pointer', color: 'var(--t2)', fontSize: 12, fontWeight: 500 }}
                  >
                    <span>{showPaid ? 'Hide' : 'Show'} paid items ({paidList.length})</span>
                    <span style={{ fontSize: 10, transition: 'transform 0.2s', display: 'inline-block', transform: showPaid ? 'rotate(180deg)' : 'none' }}>▼</span>
                  </button>

                  {showPaid && (
                    <div>
                      {/* Paid section sub-header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 20px', background: 'var(--green-soft)', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paid</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>{fmt(paidList.reduce((s, i) => s + i.myAmount, 0))}</span>
                      </div>
                      {paidList.map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid var(--border)', opacity: 0.7 }}>
                          <span style={{ width: 3, height: 32, borderRadius: 2, background: phaseColor(item.phase), flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'line-through' }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{fmtDate(item.plannedDate)} · {fmt(item.price)} total</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{fmt(item.myAmount)}</div>
                            <div style={{ fontSize: 10, color: 'var(--t3)' }}>paid</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
