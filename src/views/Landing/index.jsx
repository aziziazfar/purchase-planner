import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomExists, createRoom } from '../../data/firestore';

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Landing() {
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleJoin() {
    const id = roomId.trim().toUpperCase();
    if (!id) { setStatus('Enter a room ID to join.'); return; }
    setLoading(true);
    setStatus('');
    try {
      const exists = await roomExists(id);
      if (!exists) {
        setStatus(`Room "${id}" not found. Create it instead.`);
        setLoading(false);
        return;
      }
      navigate(`/${id}`);
    } catch (e) {
      setStatus(`Error: ${e.message}`);
      setLoading(false);
    }
  }

  async function handleCreate() {
    const id = roomId.trim().toUpperCase() || generateRoomId();
    setLoading(true);
    setStatus('');
    try {
      const exists = await roomExists(id);
      if (exists) {
        setStatus(`Room "${id}" already exists. Join it instead.`);
        setRoomId(id);
        setLoading(false);
        return;
      }
      await createRoom(id);
      navigate(`/${id}`);
    } catch (e) {
      setStatus(`Error: ${e.message}`);
      setLoading(false);
    }
  }

  return (
    <div className="landing">
      <div className="landing-card">
        <div className="landing-logo">💰</div>
        <h1 className="landing-title">Purchase Planner</h1>
        <p className="landing-subtitle">Plan and track purchases together</p>

        <div className="landing-input-row">
          <input
            className="landing-input"
            placeholder="Room ID (e.g. HOME42)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            maxLength={20}
            autoCapitalize="characters"
          />
          <button
            className="landing-btn-generate"
            onClick={() => setRoomId(generateRoomId())}
            title="Generate a random room ID"
            type="button"
          >
            ↻
          </button>
        </div>

        <div className="landing-actions">
          <button className="landing-btn-secondary" onClick={handleJoin} disabled={loading}>
            Join Room
          </button>
          <button className="landing-btn-primary" onClick={handleCreate} disabled={loading}>
            {loading ? '…' : 'Create Room'}
          </button>
        </div>

        {status && <p className="landing-status">{status}</p>}

        <p className="landing-hint">
          Share your Room ID with your household to sync purchases in real time.
        </p>
      </div>
    </div>
  );
}
