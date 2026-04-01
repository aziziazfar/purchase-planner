import { useState } from 'react';
import { loadItems, addItem, updateItem, deleteItem, togglePurchased } from './data/store';
import { loadProfiles, addProfile } from './data/profiles';
import ItemList from './components/ItemList';
import TimelineTable from './components/TimelineTable';
import PhaseView from './components/PhaseView';
import ContributionsView from './components/ContributionsView';
import ItemModal from './components/ItemModal';
import './App.css';

export default function App() {
  const [items, setItems] = useState(loadItems);
  const [profiles, setProfiles] = useState(loadProfiles);
  const [tab, setTab] = useState('list');
  const [modal, setModal] = useState(null);
  const [theme, setTheme] = useState('dark');

  function handleAdd() { setModal('add'); }
  function handleEdit(item) { setModal(item); }

  function handleTogglePurchased(id) {
    setItems((prev) => togglePurchased(prev, id));
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

  function handleCreateProfile(name) {
    setProfiles((prev) => addProfile(prev, name));
  }

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <div className="header-content">
          <h1>Purchase Planner</h1>
          <p>Plan and track your upcoming purchases</p>
        </div>
        <button
          className="theme-toggle"
          onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <div className="tabs">
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          Item List
        </button>
        <button className={`tab ${tab === 'timeline' ? 'active' : ''}`} onClick={() => setTab('timeline')}>
          Timeline View
        </button>
        <button className={`tab ${tab === 'phase' ? 'active' : ''}`} onClick={() => setTab('phase')}>
          Phase View
        </button>
        <button className={`tab ${tab === 'contributions' ? 'active' : ''}`} onClick={() => setTab('contributions')}>
          Contributions
        </button>
      </div>

      <main className="main-content">
        {tab === 'list' ? (
          <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} onTogglePurchased={handleTogglePurchased} />
        ) : tab === 'timeline' ? (
          <TimelineTable items={items} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        ) : tab === 'phase' ? (
          <PhaseView items={items} onAdd={handleAdd} />
        ) : (
          <ContributionsView items={items} profiles={profiles} onAdd={handleAdd} />
        )}
      </main>

      {modal !== null && (
        <ItemModal
          item={modal === 'add' ? null : modal}
          profiles={profiles}
          onSave={handleSave}
          onClose={() => setModal(null)}
          onCreateProfile={handleCreateProfile}
        />
      )}
    </div>
  );
}
