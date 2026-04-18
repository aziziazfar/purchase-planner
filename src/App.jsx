import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { listenToRoom, saveRoom } from './data/firestore';
import { exportToFile, importFromFile } from './data/io';
import ItemList from './views/ItemList';
import TimelineTable from './views/Timeline';
import PhaseView from './views/Phase';
import ContributionsView from './views/Contributions';
import CalendarView from './views/Calendar';
import Landing from './views/Landing';
import ItemModal from './components/ItemModal';
import DataMenu from './components/DataMenu';
import './App.css';

function RoomApp() {
  const { roomId } = useParams();
  const [items, setItems] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [todos, setTodos] = useState([]);
  const [tab, setTab] = useState('list');
  const [modal, setModal] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [syncing, setSyncing] = useState(true);

  // Refs so async Firestore writes always have current state
  const itemsRef = useRef(items);
  const profilesRef = useRef(profiles);
  const todosRef = useRef(todos);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { profilesRef.current = profiles; }, [profiles]);
  useEffect(() => { todosRef.current = todos; }, [todos]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = listenToRoom(roomId, (data) => {
      setItems(data.items || []);
      setProfiles(data.profiles || []);
      setTodos(data.todos || []);
      setSyncing(false);
    });
    return unsub;
  }, [roomId]);

  function write(newItems, newProfiles, newTodos) {
    saveRoom(
      roomId,
      newItems ?? itemsRef.current,
      newProfiles ?? profilesRef.current,
      newTodos ?? todosRef.current,
    );
  }

  function handleTodosChange(updated) {
    setTodos(updated);
    write(null, null, updated);
  }

  function handleAdd() { setModal('add'); }
  function handleEdit(item) { setModal(item); }

  function handleTogglePurchased(id) {
    const updated = items.map((i) => i.id === id ? { ...i, purchased: !i.purchased } : i);
    setItems(updated);
    write(updated);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    write(updated);
  }

  function handleSave(formData) {
    let updated;
    if (modal === 'add') {
      updated = [...items, { ...formData, id: crypto.randomUUID() }];
    } else {
      updated = items.map((i) => i.id === formData.id ? formData : i);
    }
    setItems(updated);
    write(updated);
    setModal(null);
  }

  function handleCreateProfile(name) {
    const updated = [...profiles, { id: crypto.randomUUID(), name: name.trim() }];
    setProfiles(updated);
    write(null, updated);
  }

  function handleSaveFile() { exportToFile(items, profiles); }
  function handleLoadFile(onSuccess, onError) {
    importFromFile((newItems, newProfiles) => {
      setItems(newItems);
      setProfiles(newProfiles);
      write(newItems, newProfiles);
      onSuccess();
    }, onError);
  }

  return (
    <div className="app" data-theme={theme}>
      <header className="app-header">
        <div className="header-content">
          <h1>Purchase Planner</h1>
          <p>Room: <span className="room-id-badge">{roomId}</span></p>
        </div>
        <div className="header-actions">
          <DataMenu
            onSaveFile={handleSaveFile}
            onLoadFile={handleLoadFile}
            onSaveCache={() => {}}
            onLoadCache={() => {}}
          />
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
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
        <button className={`tab ${tab === 'calendar' ? 'active' : ''}`} onClick={() => setTab('calendar')}>
          Calendar
        </button>
      </div>

      <main className="main-content">
        {syncing ? (
          <div className="sync-loading">Connecting…</div>
        ) : tab === 'list' ? (
          <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} onTogglePurchased={handleTogglePurchased} />
        ) : tab === 'timeline' ? (
          <TimelineTable items={items} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} />
        ) : tab === 'phase' ? (
          <PhaseView items={items} onAdd={handleAdd} />
        ) : tab === 'contributions' ? (
          <ContributionsView items={items} profiles={profiles} onAdd={handleAdd} />
        ) : (
          <CalendarView items={items} todos={todos} onTodosChange={handleTodosChange} />
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/:roomId" element={<RoomApp />} />
    </Routes>
  );
}
