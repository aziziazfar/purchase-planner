import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const ROOM_LIMIT = 10;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomId } = req.body;

  if (!roomId || !/^[A-Z0-9]{4,20}$/.test(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID.' });
  }

  const db = getFirestore();

  const snap = await db.collection('rooms').count().get();
  if (snap.data().count >= ROOM_LIMIT) {
    return res.status(403).json({ error: 'Room limit reached. No new rooms can be created.' });
  }

  const existing = await db.doc(`rooms/${roomId}`).get();
  if (existing.exists) {
    return res.status(409).json({ error: `Room "${roomId}" already exists. Join it instead.` });
  }

  await db.doc(`rooms/${roomId}`).set({ items: [], profiles: [], todos: [] });

  return res.status(200).json({ roomId });
}
