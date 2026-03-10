import { useState, useEffect, useCallback } from "react";
import { saveFullBracket } from '../utils/database.js';
import { generateBracketFromPlayers, propagateWinners, setWinnerAndPropagate, getRoundNamesForBracket } from '../utils/bracket.js';

const MatchCard = ({ match, roundIndex, onSelectWinner, isAdmin }) => {
  const [hovered, setHovered] = useState(null);

  const getPlayerStyle = (player, isWinner, isHover) => {
    if (player === "BYE") return {
      background: "rgba(20,20,20,0.4)", color: "#444", cursor: "default", border: "1px solid #222"
    };
    if (isWinner) return {
      background: "linear-gradient(135deg, #FFD700 0%, #B8860B 50%, #FFD700 100%)",
      color: "#000", cursor: "default", border: "1px solid #FFD700",
      fontWeight: 900, textShadow: "0 0 4px rgba(255,215,0,0.3)"
    };
    if (isHover) return {
      background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))",
      color: "#FFD700", cursor: "pointer", border: "1px solid rgba(255,215,0,0.5)",
      transform: "scale(1.02)"
    };
    return {
      background: "rgba(15,15,15,0.8)", color: "#ccc",
      cursor: isAdmin && match.player1 && match.player2 && !match.winner ? "pointer" : "default",
      border: "1px solid #333"
    };
  };

  const canSelect = isAdmin && match.player1 && match.player2 &&
    match.player1 !== "BYE" && match.player2 !== "BYE" && !match.winner;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      {[match.player1, match.player2].map((player, pi) => {
        const isWinner = match.winner === player && player !== "BYE";
        const isHover = hovered === pi && canSelect;
        const style = getPlayerStyle(player, isWinner, isHover);
        return (
          <div key={pi}
            onClick={() => { if (canSelect && player) onSelectWinner(player); }}
            onMouseEnter={() => canSelect && setHovered(pi)}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...style, padding: "6px 10px", fontSize: roundIndex >= 3 ? 13 : 11,
              fontFamily: "'Oswald', sans-serif", textTransform: "uppercase",
              letterSpacing: "1.5px", transition: "all 0.2s ease",
              display: "flex", alignItems: "center", gap: 6, borderRadius: 2,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minHeight: 28,
            }}
          >
            {isWinner && <span style={{ fontSize: 10, color: "#000" }}>◆</span>}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{player || "—"}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function Bracket({ playerNames, bracketData, isAdmin }) {
  const [particles, setParticles] = useState([]);

  const rounds = bracketData?.rounds || null;
  const champion = bracketData?.champion || null;

  const handleSelectWinner = useCallback(async (roundIndex, matchIndex, winner) => {
    if (!rounds) return;
    const newRounds = setWinnerAndPropagate(rounds, roundIndex, matchIndex, winner);
    const finalMatch = newRounds[newRounds.length - 1][0];
    await saveFullBracket(newRounds, finalMatch.winner || null);
  }, [rounds]);

  useEffect(() => {
    if (champion) {
      const interval = setInterval(() => {
        const newP = Array.from({ length: 6 }, (_, i) => ({
          id: Date.now() + i, x: Math.random() * 100, y: Math.random() * 60,
          color: Math.random() > 0.5 ? "#FFD700" : "#FFA500", size: Math.random() * 6 + 3
        }));
        setParticles(prev => [...prev.slice(-30), ...newP]);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [champion]);

  // No bracket yet
  if (!rounds) {
    return (
      <div style={{
        color: '#fff', textAlign: 'center', padding: '80px 20px',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#FFD700', letterSpacing: 4,
        }}>BRACKET NOT GENERATED YET</div>
        <div style={{ fontSize: 12, color: '#555', letterSpacing: 2, marginTop: 8 }}>
          {playerNames.length} PLAYER{playerNames.length !== 1 ? 'S' : ''} REGISTERED
          {isAdmin ? ' — GO TO ADMIN TO GENERATE' : ' — WAITING FOR HOST'}
        </div>
      </div>
    );
  }

  const completedMatches = rounds.flat().filter(m => m.winner).length;
  const totalMatches = rounds.flat().length;

  return (
    <div style={{ color: "#fff", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes firework { 0% { opacity:1; transform:scale(0); } 50% { opacity:1; transform:scale(1.5); } 100% { opacity:0; transform:scale(0.5) translateY(20px); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes crownBounce { 0%,100% { transform:translateY(0) rotate(-5deg); } 50% { transform:translateY(-8px) rotate(5deg); } }
      `}</style>

      {/* Fireworks */}
      {champion && particles.map(p => (
        <div key={p.id} style={{
          position: "fixed", left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: "50%",
          background: p.color, boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          opacity: 0, zIndex: 100, animation: "firework 1.5s ease-out forwards", pointerEvents: "none"
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 10, padding: "20px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24, animation: "slideIn 0.6s ease-out" }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 5vw, 48px)",
            margin: "4px 0", lineHeight: 1,
            background: "linear-gradient(180deg, #FFD700 0%, #FFA500 40%, #B8860B 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 8px rgba(255,215,0,0.3))"
          }}>1v1 BRACKET</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 8 }}>
            <div style={{ height: 1, width: 60, background: "linear-gradient(90deg, transparent, #FFD700)" }} />
            <span style={{ fontSize: 12, color: "#888", letterSpacing: 4 }}>{playerNames.length} FIGHTERS</span>
            <div style={{ height: 1, width: 60, background: "linear-gradient(270deg, transparent, #FFD700)" }} />
          </div>
          {!isAdmin && (
            <div style={{ fontSize: 10, color: '#333', letterSpacing: 2, marginTop: 8 }}>
              SPECTATOR MODE — RESULTS UPDATE IN REAL-TIME
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{ maxWidth: 500, margin: "0 auto 20px", padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#666", letterSpacing: 2, marginBottom: 4 }}>
            <span>PROGRESSION</span>
            <span>{completedMatches} / {totalMatches} MATCHES</span>
          </div>
          <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2 }}>
            <div style={{
              height: "100%", width: `${(completedMatches / totalMatches) * 100}%`,
              background: "linear-gradient(90deg, #FFD700, #FFA500)", borderRadius: 2,
              transition: "width 0.5s ease",
              boxShadow: completedMatches > 0 ? "0 0 10px rgba(255,215,0,0.3)" : "none"
            }} />
          </div>
        </div>

        {/* Champion */}
        {champion && (
          <div style={{
            textAlign: "center", margin: "0 auto 20px", padding: 20,
            background: "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(184,134,11,0.05))",
            border: "1px solid rgba(255,215,0,0.3)", maxWidth: 400, animation: "slideIn 0.8s ease-out"
          }}>
            <div style={{ fontSize: 32, animation: "crownBounce 2s ease-in-out infinite" }}>👑</div>
            <div style={{ fontSize: 10, color: "#FFD700", letterSpacing: 6, marginBottom: 4 }}>CHAMPION</div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 36,
              background: "linear-gradient(180deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{champion}</div>
          </div>
        )}

        {/* Bracket grid */}
        <div style={{ overflowX: "auto", paddingBottom: 24 }}>
          <div style={{
            display: "flex", gap: 0, minWidth: rounds.length * 200,
            alignItems: "stretch", position: "relative",
          }}>
            {rounds.map((round, ri) => {
              const matchHeight = 62;
              const baseGap = 4;
              const gap = baseGap * Math.pow(2, ri);
              const topOffset = (matchHeight + baseGap) * (Math.pow(2, ri) - 1) / 2;

              return (
                <div key={ri} style={{
                  display: "flex", flexDirection: "column",
                  minWidth: ri === rounds.length - 1 ? 180 : 185,
                  width: ri === rounds.length - 1 ? 180 : 185, flexShrink: 0,
                }}>
                  <div style={{
                    textAlign: "center", marginBottom: 12, padding: "6px 0",
                    borderBottom: ri === rounds.length - 1 ? "2px solid #FFD700" : "1px solid #222",
                  }}>
                    <span style={{
                      fontSize: ri === rounds.length - 1 ? 14 : 10, letterSpacing: 3,
                      color: ri === rounds.length - 1 ? "#FFD700" : "#555",
                      fontWeight: ri === rounds.length - 1 ? 700 : 400,
                    }}>{(getRoundNamesForBracket(rounds))[ri] || `ROUND ${ri + 1}`}</span>
                  </div>
                  <div style={{
                    display: "flex", flexDirection: "column", justifyContent: "space-around",
                    flex: 1, gap, paddingTop: topOffset, paddingRight: ri < rounds.length - 1 ? 8 : 0,
                  }}>
                    {round.map((match, mi) => (
                      <div key={`${ri}-${mi}`} style={{
                        animation: `slideIn ${0.3 + ri * 0.1}s ease-out backwards`,
                        animationDelay: `${mi * 0.03 + ri * 0.1}s`,
                      }}>
                        <MatchCard
                          match={match}
                          roundIndex={ri}
                          isAdmin={isAdmin}
                          onSelectWinner={(winner) => handleSelectWinner(ri, mi, winner)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
          <span style={{ fontSize: 10, color: "#333", letterSpacing: 4 }}>
            {isAdmin ? 'ADMIN MODE — CLICK A PLAYER TO SELECT WINNER' : 'SPECTATOR MODE — LIVE UPDATES'}
          </span>
        </div>
      </div>
    </div>
  );
}
