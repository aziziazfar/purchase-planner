import { doc, getDoc, setDoc, onSnapshot, collection, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';

const ROOM_LIMIT = 10;

export async function roomExists(roomId) {
  const snap = await getDoc(doc(db, 'rooms', roomId));
  return snap.exists();
}

export async function createRoom(roomId) {
  const snapshot = await getCountFromServer(collection(db, 'rooms'));
  if (snapshot.data().count >= ROOM_LIMIT) {
    throw new Error(`Room limit of ${ROOM_LIMIT} reached.`);
  }
  await setDoc(doc(db, 'rooms', roomId), { items: [], profiles: [], todos: [] });
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
