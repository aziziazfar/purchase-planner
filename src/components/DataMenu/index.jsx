import { useState, useEffect, useRef } from 'react';

export default function DataMenu({ onSaveFile, onLoadFile, onSaveCache, onLoadCache }) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  function handle(fn, successMsg) {
    setOpen(false);
    fn(successMsg ? () => showToast(successMsg) : undefined);
  }

  return (
    <div className="data-menu" ref={ref}>
      <button className="data-menu-trigger" onClick={() => setOpen((o) => !o)}>
        Data {open ? '▴' : '▾'}
      </button>

      {open && (
        <div className="data-menu-dropdown">
          <div className="data-menu-section">Cache</div>
          <button className="data-menu-item" onClick={() => { setOpen(false); onSaveCache(); showToast('Saved to cache'); }}>
            Save to cache
          </button>
          <button className="data-menu-item" onClick={() => { setOpen(false); onLoadCache(); showToast('Loaded from cache'); }}>
            Load from cache
          </button>

          <div className="data-menu-divider" />

          <div className="data-menu-section">File</div>
          <button className="data-menu-item" onClick={() => { setOpen(false); onSaveFile(); }}>
            Save to file
          </button>
          <button className="data-menu-item" onClick={() => {
            setOpen(false);
            onLoadFile(
              () => showToast('Data loaded successfully'),
              (err) => showToast(err, 'error'),
            );
          }}>
            Load from file
          </button>
        </div>
      )}

      {toast && (
        <div className={`data-toast ${toast.type === 'error' ? 'data-toast-error' : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
