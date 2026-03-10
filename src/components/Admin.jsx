import { useState } from 'react';
import { addPlayer, removePlayer, checkAdminPassword, saveFullBracket } from '../utils/database.js';
import { generateBracketFromPlayers } from '../utils/bracket.js';

export default function Admin({ isAdmin, setIsAdmin, players, playerNames, bracketData }) {
  const [password, setPassword] = useState('');
  const [newPlayer, setNewPlayer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const ok = await checkAdminPassword(password);
      if (ok) {
        setIsAdmin(true);
        setSuccess('Access granted!');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('Wrong password');
      }
    } catch (e) {
      setError('Connection error');
    }
    setLoading(false);
  };

  const handleAddPlayer = async () => {
    const name = newPlayer.trim().toUpperCase();
    if (!name) return;
    if (playerNames.includes(name)) {
      setError(`${name} is already registered`);
      setTimeout(() => setError(''), 2000);
      return;
    }
    if (playerNames.length >= 64) {
      setError('Max 64 players for bracket');
      setTimeout(() => setError(''), 2000);
      return;
    }
    await addPlayer(name);
    setNewPlayer('');
    setSuccess(`${name} added!`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleRemovePlayer = async (player) => {
    if (window.confirm(`Remove ${player.name}?`)) {
      await removePlayer(player.id);
      setSuccess(`${player.name} removed`);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleGenerateBracket = async () => {
    if (playerNames.length < 2) {
      setError('Need at least 2 players');
      setTimeout(() => setError(''), 2000);
      return;
    }
    if (playerNames.length > 64) {
      setError('Max 64 players');
      setTimeout(() => setError(''), 2000);
      return;
    }
    const seed = Math.floor(Math.random() * 999999);
    const rounds = generateBracketFromPlayers(playerNames, seed);
    await saveFullBracket(rounds, null);
    setSuccess('Bracket generated & synced!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleResetBracket = async () => {
    if (window.confirm('Reset the entire bracket? This cannot be undone.')) {
      const seed = Math.floor(Math.random() * 999999);
      const rounds = generateBracketFromPlayers(playerNames, seed);
      await saveFullBracket(rounds, null);
      setSuccess('Bracket reset & reshuffled!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const inputStyle = {
    background: '#111', border: '1px solid #333', color: '#eee',
    padding: '10px 14px', fontFamily: "'Oswald', sans-serif", fontSize: 14,
    letterSpacing: 1, width: '100%', outline: 'none', borderRadius: 2,
  };

  const btnStyle = (color = '#FFD700') => ({
    background: 'transparent', border: `1px solid ${color}`, color,
    padding: '10px 24px', fontFamily: "'Oswald', sans-serif", fontSize: 12,
    letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase',
    transition: 'all 0.2s', borderRadius: 2,
  });

  // Login screen
  if (!isAdmin) {
    return (
      <div style={{
        maxWidth: 400, margin: '0 auto', padding: '80px 20px',
        color: '#fff', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
          color: '#FFD700', letterSpacing: 4, marginBottom: 8,
        }}>ADMIN PANEL</div>
        <div style={{ fontSize: 11, color: '#555', letterSpacing: 2, marginBottom: 32 }}>
          ENTER PASSWORD TO MANAGE TOURNAMENT
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Password..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={handleLogin} disabled={loading} style={btnStyle()}>
            {loading ? '...' : 'LOGIN'}
          </button>
        </div>

        {error && <div style={{ color: '#FF4444', fontSize: 12, marginTop: 12, letterSpacing: 1 }}>{error}</div>}
        
        <div style={{
          fontSize: 10, color: '#333', marginTop: 40, letterSpacing: 2, lineHeight: 1.8
        }}>
          FIRST LOGIN SETS THE PASSWORD.<br />
          REMEMBER IT — IT CANNOT BE RECOVERED.
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px', color: '#fff' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
            color: '#FFD700', letterSpacing: 4,
          }}>ADMIN PANEL</div>
          <div style={{ fontSize: 10, color: '#53FC18', letterSpacing: 2 }}>🔓 CONNECTED</div>
        </div>
        <button onClick={() => setIsAdmin(false)} style={btnStyle('#555')}>LOGOUT</button>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{
          background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
          color: '#FF4444', padding: '10px 16px', fontSize: 12, letterSpacing: 1,
          marginBottom: 16, borderRadius: 2,
        }}>⚠ {error}</div>
      )}
      {success && (
        <div style={{
          background: 'rgba(83,252,24,0.1)', border: '1px solid rgba(83,252,24,0.3)',
          color: '#53FC18', padding: '10px 16px', fontSize: 12, letterSpacing: 1,
          marginBottom: 16, borderRadius: 2,
        }}>✓ {success}</div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32,
      }}>
        {[
          { label: 'PLAYERS', value: playerNames.length, color: '#FFD700' },
          { label: 'BYE SLOTS', value: playerNames.length >= 2 ? ((() => { let p=2; while(p<playerNames.length) p*=2; return p; })() - playerNames.length) : 0, color: '#FFA500' },
          { label: 'BRACKET', value: bracketData?.rounds ? 'ACTIVE' : 'NONE', color: bracketData?.rounds ? '#53FC18' : '#555' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(255,215,0,0.03)', border: '1px solid #1a1a1a',
            padding: 16, textAlign: 'center', borderRadius: 2,
          }}>
            <div style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: '#555', letterSpacing: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Player */}
      <div style={{
        padding: 20, background: 'rgba(255,215,0,0.02)', border: '1px solid #1a1a1a',
        borderRadius: 2, marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, color: '#FFD700', letterSpacing: 3, marginBottom: 12 }}>
          ◆ ADD PLAYER
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newPlayer}
            onChange={e => setNewPlayer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
            placeholder="Player name..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={handleAddPlayer} style={btnStyle()}>ADD</button>
        </div>
      </div>

      {/* Player List */}
      <div style={{
        padding: 20, background: 'rgba(255,215,0,0.02)', border: '1px solid #1a1a1a',
        borderRadius: 2, marginBottom: 16,
      }}>
        <div style={{
          fontSize: 12, color: '#FFD700', letterSpacing: 3, marginBottom: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>◆ REGISTERED PLAYERS ({playerNames.length})</span>
        </div>
        
        {players.length === 0 ? (
          <div style={{ color: '#333', fontSize: 12, letterSpacing: 2, padding: 20, textAlign: 'center' }}>
            NO PLAYERS YET
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {players.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#111', padding: '6px 12px', borderRadius: 2,
                border: '1px solid #222', animation: 'fadeIn 0.3s ease-out',
                animationDelay: `${i * 0.02}s`, animationFillMode: 'backwards',
              }}>
                <span style={{ fontSize: 12, color: '#ccc', letterSpacing: 2, fontFamily: "'Oswald', sans-serif" }}>
                  {p.name}
                </span>
                <button
                  onClick={() => handleRemovePlayer(p)}
                  style={{
                    background: 'none', border: 'none', color: '#555', cursor: 'pointer',
                    fontSize: 14, padding: '0 2px', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = '#FF4444'}
                  onMouseLeave={e => e.target.style.color = '#555'}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bracket Controls */}
      <div style={{
        padding: 20, background: 'rgba(255,215,0,0.02)', border: '1px solid #1a1a1a',
        borderRadius: 2, marginBottom: 16,
      }}>
        <div style={{ fontSize: 12, color: '#FFD700', letterSpacing: 3, marginBottom: 12 }}>
          ◆ BRACKET CONTROLS
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleGenerateBracket} style={btnStyle('#53FC18')}>
            ⚡ GENERATE BRACKET
          </button>
          <button onClick={handleResetBracket} style={btnStyle('#FF4444')}>
            ✕ RESET & RESHUFFLE
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#444', letterSpacing: 1, marginTop: 10, lineHeight: 1.8 }}>
          Generate creates a new randomized bracket from all registered players.<br />
          Changes sync to all viewers in real-time.
        </div>
      </div>

      {/* Champion display */}
      {bracketData?.champion && (
        <div style={{
          padding: 20, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(184,134,11,0.03))',
          border: '1px solid rgba(255,215,0,0.2)', borderRadius: 2,
        }}>
          <div style={{ fontSize: 24 }}>👑</div>
          <div style={{ fontSize: 10, color: '#FFD700', letterSpacing: 4 }}>CURRENT CHAMPION</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
            color: '#FFD700', marginTop: 4,
          }}>{bracketData.champion}</div>
        </div>
      )}
    </div>
  );
}
