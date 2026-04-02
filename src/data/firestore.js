import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export async function roomExists(roomId) {
  const snap = await getDoc(doc(db, 'rooms', roomId));
  return snap.exists();
}

export async function createRoom(roomId) {
  await setDoc(doc(db, 'rooms', roomId), { items: [], profiles: [] });
}

export function listenToRoom(roomId, callback) {
  return onSnapshot(doc(db, 'rooms', roomId), (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export async function saveRoom(roomId, items, profiles) {
  await setDoc(doc(db, 'rooms', roomId), { items, profiles });
}
