import { useState, useEffect } from 'react';
import StarRating from './StarRating';

const empty = {
  name: '',
  price: '',
  plannedDate: '',
  details: '',
  link: '',
  importance: 3,
};

export default function ItemModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(item ? { ...item, price: String(item.price) } : empty);
  }, [item]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.plannedDate) return;
    onSave({ ...form, price: parseFloat(form.price) || 0 });
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
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
