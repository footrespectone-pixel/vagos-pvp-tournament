import { useState, useEffect } from 'react'
import { onPlayersChange, onBracketChange, onConfigChange } from './utils/database.js'
import Bracket from './components/Bracket.jsx'
import Calendar from './components/Calendar.jsx'
import Admin from './components/Admin.jsx'

const TABS = [
  { id: 'bracket', label: 'BRACKET', icon: '⚔️' },
  { id: 'calendar', label: 'CALENDAR', icon: '📅' },
]

export default function App() {
  const [tab, setTab] = useState('bracket')
  const [players, setPlayers] = useState([])
  const [bracketData, setBracketData] = useState(null)
  const [config, setConfig] = useState({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [dbError, setDbError] = useState(false)

  // Real-time listeners
  useEffect(() => {
    try {
      const unsub1 = onPlayersChange(setPlayers);
      const unsub2 = onBracketChange(setBracketData);
      const unsub3 = onConfigChange(setConfig);
      return () => { unsub1(); unsub2(); unsub3(); };
    } catch (e) {
      console.error('Firebase connection error:', e);
      setDbError(true);
    }
  }, []);

  const playerNames = players.map(p => p.name);

  if (dbError) {
    return (
      <div style={{
        minHeight: '100vh', background: '#080808', color: '#fff',
        fontFamily: "'Oswald', sans-serif", display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48 }}>🔥</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#FFD700' }}>
          FIREBASE NOT CONFIGURED
        </div>
        <div style={{ fontSize: 13, color: '#888', maxWidth: 500, lineHeight: 1.8 }}>
          Edit <code style={{ color: '#FFD700', background: '#1a1a1a', padding: '2px 8px' }}>src/firebase.js</code> and
          replace the placeholder values with your Firebase project credentials.
          Check the README for step-by-step instructions.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      fontFamily: "'Oswald', sans-serif",
    }}>
      {/* Top accent */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 1000,
        background: 'linear-gradient(90deg, transparent, #FFD700, #FFA500, #FFD700, transparent)'
      }} />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 999,
        background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a1a1a', padding: '0 20px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', height: 56,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 22,
              background: 'linear-gradient(180deg, #FFD700, #B8860B)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 3,
            }}>VAGOS PVP</span>
            <span style={{
              fontSize: 9, color: '#555', letterSpacing: 3,
              borderLeft: '1px solid #333', paddingLeft: 10,
            }}>BY AGUERROX9</span>
            {/* Live indicator */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5, marginLeft: 10,
              padding: '3px 8px', background: 'rgba(83,252,24,0.08)',
              border: '1px solid rgba(83,252,24,0.2)', borderRadius: 2,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: '#53FC18',
                animation: 'livePulse 2s infinite',
              }} />
              <span style={{ fontSize: 9, color: '#53FC18', letterSpacing: 2 }}>LIVE</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setShowAdmin(false); }}
                style={{
                  background: tab === t.id && !showAdmin ? 'rgba(255,215,0,0.1)' : 'transparent',
                  border: 'none',
                  borderBottom: tab === t.id && !showAdmin ? '2px solid #FFD700' : '2px solid transparent',
                  color: tab === t.id && !showAdmin ? '#FFD700' : '#555',
                  padding: '8px 20px', cursor: 'pointer', fontFamily: "'Oswald', sans-serif",
                  fontSize: 13, letterSpacing: 3, display: 'flex', alignItems: 'center',
                  gap: 8, transition: 'all 0.2s', height: 56,
                }}
              >
                <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
              </button>
            ))}
            {/* Admin button */}
            <button onClick={() => setShowAdmin(!showAdmin)}
              style={{
                background: showAdmin ? 'rgba(255,215,0,0.1)' : 'transparent',
                border: 'none',
                borderBottom: showAdmin ? '2px solid #FFD700' : '2px solid transparent',
                color: showAdmin ? '#FFD700' : isAdmin ? '#B8860B' : '#333',
                padding: '8px 16px', cursor: 'pointer', fontFamily: "'Oswald', sans-serif",
                fontSize: 13, letterSpacing: 3, height: 56, transition: 'all 0.2s',
              }}
            >
              {isAdmin ? '🔓' : '🔒'} ADMIN
            </button>
          </div>

          {/* Kick */}
          <a href="https://kick.com/aguerrox9" target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: 10, color: '#53FC18', letterSpacing: 2, textDecoration: 'none',
              border: '1px solid rgba(83,252,24,0.3)', padding: '6px 14px', borderRadius: 2,
              transition: 'all 0.2s', fontFamily: "'Oswald', sans-serif",
            }}
          >LIVE ON KICK</a>
        </div>
      </nav>

      <style>{`
        @keyframes livePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      {/* Content */}
      <div style={{ minHeight: 'calc(100vh - 56px)' }}>
        {showAdmin ? (
          <Admin
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            players={players}
            playerNames={playerNames}
            bracketData={bracketData}
          />
        ) : tab === 'bracket' ? (
          <Bracket
            playerNames={playerNames}
            bracketData={bracketData}
            isAdmin={isAdmin}
          />
        ) : (
          <Calendar playerNames={playerNames} bracketData={bracketData} />
        )}
      </div>
    </div>
  );
}
