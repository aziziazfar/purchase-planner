const STORAGE_KEY = 'purchase_planner_items';

const defaultItems = [
  {
    id: '1',
    name: 'Sofa',
    price: 2500,
    plannedDate: '2026-06-15',
    details: 'L-shaped sofa for the living room',
    link: 'https://example.com/sofa',
    importance: 3,
    purchased: false,
  },
  {
    id: '2',
    name: 'Refrigerator',
    price: 1800,
    plannedDate: '2026-04-20',
    details: 'Side-by-side fridge with freezer',
    link: '',
    importance: 5,
    purchased: false,
  },
  {
    id: '3',
    name: 'Dining Table',
    price: 900,
    plannedDate: '2026-06-28',
    details: '6-seater wooden dining table',
    link: '',
    importance: 2,
    purchased: false,
  },
];

export function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return defaultItems;
}

export function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addItem(items, item) {
  const newItem = { ...item, id: crypto.randomUUID() };
  const updated = [...items, newItem];
  saveItems(updated);
  return updated;
}

export function updateItem(items, updated) {
  const result = items.map((i) => (i.id === updated.id ? updated : i));
  saveItems(result);
  return result;
}

export function togglePurchased(items, id) {
  const result = items.map((i) => (i.id === id ? { ...i, purchased: !i.purchased } : i));
  saveItems(result);
  return result;
}

export function deleteItem(items, id) {
  const result = items.filter((i) => i.id !== id);
  saveItems(result);
  return result;
}
