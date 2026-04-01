import { useState, useEffect } from 'react';
import StarRating from './StarRating';

const empty = {
  name: '',
  price: '',
  plannedDate: '',
  details: '',
  link: '',
  importance: 3,
  phase: 1,
  paidBy: [],
};

export default function ItemModal({ item, profiles, onSave, onClose, onCreateProfile }) {
  const [form, setForm] = useState(empty);
  const [newProfileName, setNewProfileName] = useState('');
  const [showNewProfile, setShowNewProfile] = useState(false);

  useEffect(() => {
    setForm(item ? { ...item, price: String(item.price), paidBy: item.paidBy || [] } : empty);
  }, [item]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setPaidAmount(profileId, amount) {
    setForm((f) => {
      const existing = f.paidBy.filter((p) => p.profileId !== profileId);
      if (amount === '' || Number(amount) === 0) return { ...f, paidBy: existing };
      return { ...f, paidBy: [...existing, { profileId, amount: Number(amount) }] };
    });
  }

  function getPaidAmount(profileId) {
    return form.paidBy.find((p) => p.profileId === profileId)?.amount ?? '';
  }

  function handleCreateProfile() {
    if (!newProfileName.trim()) return;
    onCreateProfile(newProfileName.trim());
    setNewProfileName('');
    setShowNewProfile(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.plannedDate) return;
    onSave({ ...form, price: parseFloat(form.price) || 0, phase: parseInt(form.phase) || 1 });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Add Item'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Name *
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Sofa"
              required
            />
          </label>
          <label>
            Price ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder="0.00"
            />
          </label>
          <label>
            Planned Purchase Date *
            <input
              type="date"
              value={form.plannedDate}
              onChange={(e) => set('plannedDate', e.target.value)}
              required
            />
          </label>
          <label>
            Phase
            <input
              type="number"
              min="1"
              step="1"
              value={form.phase}
              onChange={(e) => set('phase', e.target.value)}
              placeholder="1"
            />
          </label>
          <label>
            Details
            <textarea
              value={form.details}
              onChange={(e) => set('details', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </label>
          <label>
            Item Link
            <input
              type="url"
              value={form.link}
              onChange={(e) => set('link', e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label>
            Priority
            <StarRating value={form.importance} onChange={(v) => set('importance', v)} />
          </label>

          <div className="paid-by-section">
            <div className="paid-by-header">
              <span className="paid-by-label">Paid By</span>
            </div>
            {profiles.length === 0 && !showNewProfile ? (
              <button type="button" className="btn-add-profile" onClick={() => setShowNewProfile(true)}>
                + Create a profile
              </button>
            ) : (
              <div className="paid-by-rows">
                {profiles.map((profile) => (
                  <div key={profile.id} className="paid-by-row">
                    <span className="paid-by-name">{profile.name}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="paid-by-amount"
                      placeholder="0.00"
                      value={getPaidAmount(profile.id)}
                      onChange={(e) => setPaidAmount(profile.id, e.target.value)}
                    />
                  </div>
                ))}
                {!showNewProfile && (
                  <button type="button" className="btn-add-profile" onClick={() => setShowNewProfile(true)}>
                    + New profile
                  </button>
                )}
              </div>
            )}
            {showNewProfile && (
              <div className="new-profile-row">
                <input
                  autoFocus
                  placeholder="Profile name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateProfile(); } }}
                />
                <button type="button" className="btn-primary" onClick={handleCreateProfile}>Add</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowNewProfile(false); setNewProfileName(''); }}>Cancel</button>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{item ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
