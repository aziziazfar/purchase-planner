import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export async function roomExists(roomId) {
  const snap = await getDoc(doc(db, 'rooms', roomId));
  return snap.exists();
}

export async function createRoom(roomId) {
  const res = await fetch('/api/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create room.');
}

export function listenToRoom(roomId, callback) {
  return onSnapshot(doc(db, 'rooms', roomId), (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export async function saveRoom(roomId, items, profiles, todos = []) {
  await setDoc(doc(db, 'rooms', roomId), { items, profiles, todos });
}
