import { saveItems } from './store';
import { saveProfiles } from './profiles';

const VERSION = 1;

export function exportToFile(items, profiles) {
  const payload = {
    version: VERSION,
    exportedAt: new Date().toISOString(),
    items,
    profiles,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `purchase-planner-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(onSuccess, onError) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.items || !Array.isArray(data.items)) throw new Error('Invalid file format');
        const profiles = Array.isArray(data.profiles) ? data.profiles : [];
        saveItems(data.items);
        saveProfiles(profiles);
        onSuccess(data.items, profiles);
      } catch {
        onError('Failed to load file — make sure it is a valid Purchase Planner export.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export function saveToCache(items, profiles) {
  saveItems(items);
  saveProfiles(profiles);
}
