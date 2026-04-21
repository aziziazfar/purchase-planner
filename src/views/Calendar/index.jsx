import { useState } from 'react';

const URGENCY_ICONS = { 1: '❗', 2: '❗❗', 3: '❗❗❗' };
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_VISIBLE = 2; // max chips shown per day cell before overflow

function formatPrice(price) {
  return `$${Number(price).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ymd(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function firstDayOffset(year, month) {
  const day = new Date(year, month, 1).getDay(); // 0=Sun
  return (day + 6) % 7; // Monday-based
}

function formatDayLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-MY', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

// ── Day detail modal ─────────────────────────────────────────────────────────
function DayModal({ dayKey, dayTodos, dayPayments, onClose, onEdit }) {
  return (
    <div className="cal-day-modal-backdrop" onClick={onClose}>
      <div className="cal-day-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cal-day-modal-header">
          <span className="cal-day-modal-title">{formatDayLabel(dayKey)}</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="cal-day-modal-body">
          {dayTodos.length > 0 && (
            <div className="cal-day-modal-section">
              <div className="cal-day-modal-section-label">To Do</div>
              {dayTodos.map((t) => (
                <div key={t.id} className="cal-todo-chip cal-todo-chip--full">
                  {t.description}
                </div>
              ))}
            </div>
          )}
          {dayPayments.length > 0 && (
            <div className="cal-day-modal-section">
              <div className="cal-day-modal-section-label">Payments</div>
              {dayPayments.map((p) => (
                <button
                  key={p.id}
                  className={`cal-payment-chip cal-payment-chip--full cal-payment-chip--clickable${p.purchased ? ' cal-payment-chip--done' : ''}`}
                  onClick={() => { onEdit(p); onClose(); }}
                >
                  <span className="cal-payment-name">{p.name}</span>
                  <span className="cal-payment-price">{formatPrice(p.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CalendarView({ items, todos, onTodosChange, onEdit }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({ description: '', date: '', urgency: 2 });
  const [dayModal, setDayModal] = useState(null); // { key, dayTodos, dayPayments }

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDayOffset(year, month);
  const todayKey = ymd(today.getFullYear(), today.getMonth(), today.getDate());
  const monthLabel = viewDate.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });

  // Index by date
  const todosByDate = {};
  for (const t of todos) {
    if (!t.date) continue;
    if (!todosByDate[t.date]) todosByDate[t.date] = [];
    todosByDate[t.date].push(t);
  }

  const paymentsByDate = {};
  for (const item of items) {
    if (!item.plannedDate) continue;
    const key = item.plannedDate.slice(0, 10);
    if (!paymentsByDate[key]) paymentsByDate[key] = [];
    paymentsByDate[key].push(item);
  }

  const cells = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const sortedTodos = [...todos].sort((a, b) => b.urgency - a.urgency);

  function handleAddTodo(e) {
    e.preventDefault();
    if (!newTodo.description.trim()) return;
    onTodosChange([...todos, { ...newTodo, id: crypto.randomUUID(), description: newTodo.description.trim() }]);
    setNewTodo({ description: '', date: '', urgency: 2 });
    setShowAddForm(false);
  }

  function handleDeleteTodo(id) {
    onTodosChange(todos.filter((t) => t.id !== id));
  }

  return (
    <div className="calendar-view">
      {/* ── Left: Calendar ── */}
      <div className="calendar-panel">
        <div className="calendar-nav">
          <button className="cal-nav-btn" onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
          <span className="cal-month-label">{monthLabel}</span>
          <button className="cal-nav-btn" onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
        </div>

        <div className="calendar-grid">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="cal-day-header">{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`e-${i}`} className="cal-cell cal-cell--empty" />;

            const key = ymd(year, month, day);
            const dayTodos = todosByDate[key] || [];
            const dayPayments = paymentsByDate[key] || [];
            const allItems = [
              ...dayTodos.map((t) => ({ type: 'todo', data: t })),
              ...dayPayments.map((p) => ({ type: 'payment', data: p })),
            ];
            const visible = allItems.slice(0, MAX_VISIBLE);
            const overflow = allItems.length - visible.length;
            const isToday = key === todayKey;

            return (
              <div key={key} className={`cal-cell${isToday ? ' cal-cell--today' : ''}`}>
                <span className={`cal-date-num${isToday ? ' cal-date-num--today' : ''}`}>{day}</span>
                <div className="cal-cell-items">
                  {visible.map(({ type, data }) =>
                    type === 'todo' ? (
                      <div key={data.id} className="cal-todo-chip">{data.description}</div>
                    ) : (
                      <button
                        key={data.id}
                        className={`cal-payment-chip cal-payment-chip--clickable${data.purchased ? ' cal-payment-chip--done' : ''}`}
                        onClick={() => onEdit(data)}
                      >
                        <span className="cal-payment-name">{data.name}</span>
                        <span className="cal-payment-price">{formatPrice(data.price)}</span>
                      </button>
                    )
                  )}
                </div>
                {overflow > 0 && (
                  <button
                    className="cal-overflow-btn"
                    onClick={() => setDayModal({ key, dayTodos, dayPayments })}
                  >
                    +{overflow} more
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Todo list ── */}
      <div className="todo-panel">
        <div className="todo-panel-header">
          <span className="todo-panel-title">To Do</span>
          <button className="btn-primary" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showAddForm && (
          <form className="todo-add-form" onSubmit={handleAddTodo}>
            <input
              type="text"
              className="todo-form-input"
              placeholder="What needs doing?"
              value={newTodo.description}
              onChange={(e) => setNewTodo((p) => ({ ...p, description: e.target.value }))}
              autoFocus
            />
            <input
              type="date"
              className="todo-form-input"
              value={newTodo.date}
              onChange={(e) => setNewTodo((p) => ({ ...p, date: e.target.value }))}
            />
            <select
              className="todo-form-select"
              value={newTodo.urgency}
              onChange={(e) => setNewTodo((p) => ({ ...p, urgency: Number(e.target.value) }))}
            >
              <option value={1}>❗ Low</option>
              <option value={2}>❗❗ Medium</option>
              <option value={3}>❗❗❗ High</option>
            </select>
            <button type="submit" className="btn-primary todo-form-submit">Add item</button>
          </form>
        )}

        <ul className="todo-list">
          {sortedTodos.length === 0 ? (
            <li className="todo-empty">No to-do items yet.</li>
          ) : (
            sortedTodos.map((t) => (
              <li key={t.id} className="todo-item">
                <div className="todo-item-body">
                  <span className="todo-urgency">{URGENCY_ICONS[t.urgency]}</span>
                  <span className="todo-desc">{t.description}</span>
                </div>
                {t.date && (
                  <span className="todo-date">
                    {new Date(t.date + 'T00:00:00').toLocaleDateString('en-MY', {
                      day: 'numeric', month: 'short',
                    })}
                  </span>
                )}
                <button className="todo-delete" onClick={() => handleDeleteTodo(t.id)} title="Delete">×</button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* ── Day detail modal ── */}
      {dayModal && (
        <DayModal
          dayKey={dayModal.key}
          dayTodos={dayModal.dayTodos}
          dayPayments={dayModal.dayPayments}
          onClose={() => setDayModal(null)}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}
