import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { listenToRoom, saveRoom } from './data/firestore';
import { exportToFile, importFromFile } from './data/io';
import ItemList from './views/ItemList';
import PhaseView from './views/Phase';
import ContributionsView from './views/Contributions';
import CalendarView from './views/Calendar';
import Landing from './views/Landing';
import ItemModal from './components/ItemModal';
import DataMenu from './components/DataMenu';
import './App.css';

// ── Icons ─────────────────────────────────────────────────────────────────────
const IcList = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/>
  </svg>
);
const IcLayers = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 5l6-3 6 3-6 3-6-3z"/><path d="M2 8l6 3 6-3"/><path d="M2 11l6 3 6-3"/>
  </svg>
);
const IcUsers = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5"/>
    <circle cx="12" cy="5" r="2"/><path d="M15 13c0-2-1.3-3.5-3-3.5"/>
  </svg>
);
const IcCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1.5" y="2.5" width="13" height="12" rx="1.5"/>
    <line x1="1.5" y1="6.5" x2="14.5" y2="6.5"/>
    <line x1="5" y1="1" x2="5" y2="4"/><line x1="11" y1="1" x2="11" y2="4"/>
  </svg>
);
const IcSun = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <circle cx="7.5" cy="7.5" r="2.5"/>
    <line x1="7.5" y1="1" x2="7.5" y2="2.5"/><line x1="7.5" y1="12.5" x2="7.5" y2="14"/>
    <line x1="1" y1="7.5" x2="2.5" y2="7.5"/><line x1="12.5" y1="7.5" x2="14" y2="7.5"/>
    <line x1="3" y1="3" x2="4.1" y2="4.1"/><line x1="10.9" y1="10.9" x2="12" y2="12"/>
    <line x1="12" y1="3" x2="10.9" y2="4.1"/><line x1="4.1" y1="10.9" x2="3" y2="12"/>
  </svg>
);
const IcMoon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M12.5 10A6 6 0 0 1 5 2.5a6.5 6.5 0 1 0 7.5 7.5z"/>
  </svg>
);
const IcChevrons = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5,2 2,7 5,12"/><polyline points="9,2 12,7 9,12"/>
  </svg>
);

// ── Logo icon ─────────────────────────────────────────────────────────────────
const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" fill="var(--accent)"/>
    <rect x="13" y="3" width="8" height="8" rx="1.5" fill="var(--accent)" opacity="0.5"/>
    <rect x="3" y="13" width="8" height="8" rx="1.5" fill="var(--accent)" opacity="0.3"/>
    <rect x="13" y="13" width="8" height="8" rx="1.5" fill="var(--accent)" opacity="0.7"/>
  </svg>
);

// ── Navigation config ─────────────────────────────────────────────────────────
const VIEWS = [
  { id: 'list',          label: 'Items',         Icon: IcList },
  { id: 'phase',         label: 'Phases',        Icon: IcLayers },
  { id: 'contributions', label: 'Contributions', Icon: IcUsers },
  { id: 'calendar',      label: 'Calendar',      Icon: IcCalendar },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, theme, onToggleTheme, collapsed, onToggleCollapse }) {
  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-logo">
        <LogoIcon />
        {!collapsed && (
          <div className="sidebar-logo-text">
            <strong>Purchase</strong>
            <span>Planner</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {VIEWS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`sidebar-nav-item${active === id ? ' sidebar-nav-item--active' : ''}`}
            onClick={() => onNav(id)}
            title={collapsed ? label : undefined}
          >
            <span className="sidebar-nav-icon"><Icon /></span>
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" onClick={onToggleTheme} title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}>
          <span className="sidebar-nav-icon">{theme === 'dark' ? <IcSun /> : <IcMoon />}</span>
          {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>
        <button className="sidebar-footer-btn" onClick={onToggleCollapse} title={collapsed ? 'Expand' : 'Collapse'}>
          <span className="sidebar-nav-icon" style={{ transform: collapsed ? 'scaleX(-1)' : 'none', transition: 'transform 0.2s' }}>
            <IcChevrons />
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

// ── Mobile bottom nav ─────────────────────────────────────────────────────────
function MobileNav({ active, onNav }) {
  return (
    <nav className="mobile-nav">
      {VIEWS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`mobile-nav-item${active === id ? ' mobile-nav-item--active' : ''}`}
          onClick={() => onNav(id)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── Room app ──────────────────────────────────────────────────────────────────
function RoomApp() {
  const { roomId } = useParams();
  const [items, setItems] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [todos, setTodos] = useState([]);
  const [tab, setTab] = useState('list');
  const [modal, setModal] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [syncing, setSyncing] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

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

  const activeLabel = VIEWS.find((v) => v.id === tab)?.label ?? '';

  return (
    <div className="app">
      <Sidebar
        active={tab}
        onNav={setTab}
        theme={theme}
        onToggleTheme={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className={`app-main${collapsed ? ' app-main--collapsed' : ''}`}>
        <div className="app-topbar">
          <div className="app-topbar-left">
            <span className="app-topbar-title">{activeLabel}</span>
            <span className="room-id-badge">{roomId}</span>
          </div>
          <DataMenu
            onSaveFile={handleSaveFile}
            onLoadFile={handleLoadFile}
            onSaveCache={() => {}}
            onLoadCache={() => {}}
          />
        </div>

        <main className="main-content">
          {syncing ? (
            <div className="sync-loading">Connecting…</div>
          ) : tab === 'list' ? (
            <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} onTogglePurchased={handleTogglePurchased} />
          ) : tab === 'phase' ? (
            <PhaseView items={items} onAdd={handleAdd} />
          ) : tab === 'contributions' ? (
            <ContributionsView items={items} profiles={profiles} onAdd={handleAdd} />
          ) : (
            <CalendarView items={items} todos={todos} onTodosChange={handleTodosChange} onEdit={handleEdit} onAdd={handleAdd} />
          )}
        </main>
      </div>

      <MobileNav active={tab} onNav={setTab} />

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
