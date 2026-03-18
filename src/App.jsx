import { useState } from 'react';
import { loadItems, addItem, updateItem, deleteItem } from './data/store';
import ItemList from './components/ItemList';
import TimelineTable from './components/TimelineTable';
import ItemModal from './components/ItemModal';
import './App.css';

export default function App() {
  const [items, setItems] = useState(loadItems);
  const [tab, setTab] = useState('list');
  const [modal, setModal] = useState(null); // null | 'add' | item object

  function handleAdd() {
    setModal('add');
  }

  function handleEdit(item) {
    setModal(item);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;
    setItems((prev) => deleteItem(prev, id));
  }

  function handleSave(formData) {
    if (modal === 'add') {
      setItems((prev) => addItem(prev, formData));
    } else {
      setItems((prev) => updateItem(prev, formData));
    }
    setModal(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Purchase Planner</h1>
          <p>Plan and track your upcoming purchases</p>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${tab === 'list' ? 'active' : ''}`}
          onClick={() => setTab('list')}
        >
          Item List
        </button>
        <button
          className={`tab ${tab === 'timeline' ? 'active' : ''}`}
          onClick={() => setTab('timeline')}
        >
          Timeline View
        </button>
      </div>

      <main className="main-content">
        {tab === 'list' ? (
          <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        ) : (
          <TimelineTable items={items} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        )}
      </main>

      {modal !== null && (
        <ItemModal
          item={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
