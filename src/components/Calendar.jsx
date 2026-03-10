import { useState, useMemo } from "react";
import { generateSchedule } from '../utils/bracket.js';

const roundColors = {
  R1: { bg: "rgba(255,215,0,0.06)", border: "#FFD700", tag: "#FFD700", text: "ROUND 1" },
  R2: { bg: "rgba(255,165,0,0.06)", border: "#FFA500", tag: "#FFA500", text: "ROUND 2" },
  QF: { bg: "rgba(255,140,0,0.08)", border: "#FF8C00", tag: "#FF8C00", text: "QUARTER" },
  SF: { bg: "rgba(255,69,0,0.08)", border: "#FF4500", tag: "#FF4500", text: "SEMI" },
  FINALE: { bg: "rgba(255,215,0,0.12)", border: "#FFD700", tag: "#FFD700", text: "FINALE" },
};

const MatchRow = ({ match, index }) => {
  const rc = roundColors[match.round];
  const isFinale = match.round === "FINALE";

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "60px 70px 1fr 40px 1fr",
      alignItems: "center", padding: isFinale ? "14px 16px" : "10px 16px",
      background: rc.bg, borderLeft: `3px solid ${rc.border}`, borderRadius: 2,
      animation: "fadeSlideIn 0.4s ease-out backwards",
      animationDelay: `${index * 0.05}s`, position: "relative", overflow: "hidden",
    }}>
      {isFinale && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(255,215,0,0.03), transparent 50%, rgba(255,215,0,0.03))",
          pointerEvents: "none"
        }} />
      )}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
        color: "#FFD700", fontWeight: 600, letterSpacing: 1
      }}>{match.time}</div>
      <div style={{
        fontSize: 9, letterSpacing: 2, color: "#000", background: rc.tag,
        padding: "2px 8px", borderRadius: 1, fontWeight: 700, textAlign: "center",
        fontFamily: "'Oswald', sans-serif",
      }}>{rc.text}</div>
      <div style={{
        fontFamily: "'Oswald', sans-serif", fontSize: isFinale ? 16 : 14,
        fontWeight: isFinale ? 700 : 500, color: match.p1 === "TBD" ? "#555" : "#eee",
        textTransform: "uppercase", letterSpacing: 2, textAlign: "right", paddingRight: 12,
      }}>{match.p1}</div>
      <div style={{
        textAlign: "center", fontSize: isFinale ? 14 : 11,
        color: isFinale ? "#FFD700" : "#444", fontWeight: 900,
        fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2,
      }}>VS</div>
      <div style={{
        fontFamily: "'Oswald', sans-serif", fontSize: isFinale ? 16 : 14,
        fontWeight: isFinale ? 700 : 500, color: match.p2 === "TBD" ? "#555" : "#eee",
        textTransform: "uppercase", letterSpacing: 2, paddingLeft: 12,
      }}>{match.p2}</div>
    </div>
  );
};

export default function Calendar({ playerNames, bracketData }) {
  const [activeDay, setActiveDay] = useState(0);
  const schedule = useMemo(() => {
    const sched = generateSchedule(playerNames);
    
    // If bracket exists, overlay real R1 matchups onto Day 1
    if (bracketData?.rounds && sched.length > 0) {
      const r1 = bracketData.rounds[0];
      if (r1) {
        const realMatches = r1.filter(m => m.player1 !== "BYE" && m.player2 !== "BYE");
        const day1Matches = sched[0].matches.filter(m => m.round === "R1");
        realMatches.forEach((rm, i) => {
          if (day1Matches[i]) {
            day1Matches[i].p1 = rm.player1;
            day1Matches[i].p2 = rm.player2;
            if (rm.winner) day1Matches[i].status = "done";
          }
        });
        // Update BYE advancers
        const byeMatches = r1.filter(m => m.player1 === "BYE" || m.player2 === "BYE");
        sched[0].byeAdvancers = byeMatches.map(m => m.winner).filter(Boolean);
      }
      
      // Overlay subsequent rounds onto Day 2 and Day 3
      for (let dayIdx = 1; dayIdx < sched.length; dayIdx++) {
        const dayMatches = sched[dayIdx].matches;
        dayMatches.forEach(dm => {
          // Find matching round in bracket data
          const roundTag = dm.round;
          let bracketRoundIdx = -1;
          const totalRounds = bracketData.rounds.length;
          
          if (roundTag === "FINALE") bracketRoundIdx = totalRounds - 1;
          else if (roundTag === "SF") bracketRoundIdx = totalRounds - 2;
          else if (roundTag === "QF") bracketRoundIdx = totalRounds - 3;
          else if (roundTag.startsWith("R")) {
            const rNum = parseInt(roundTag.replace("R", ""));
            bracketRoundIdx = rNum - 1;
          }
          
          if (bracketRoundIdx >= 0 && bracketData.rounds[bracketRoundIdx]) {
            const bracketRound = bracketData.rounds[bracketRoundIdx];
            // Count which match index within this round tag
            const sameRoundBefore = dayMatches.filter((m2, i2) => i2 < dayMatches.indexOf(dm) && m2.round === roundTag).length;
            const bracketMatch = bracketRound[sameRoundBefore];
            if (bracketMatch) {
              if (bracketMatch.player1) dm.p1 = bracketMatch.player1;
              if (bracketMatch.player2) dm.p2 = bracketMatch.player2;
              if (bracketMatch.winner) dm.status = "done";
            }
          }
        });
      }
    }
    
    return sched;
  }, [playerNames, bracketData]);
  const totalMatches = schedule.reduce((sum, d) => sum + d.matches.length, 0);

  if (playerNames.length < 2) {
    return (
      <div style={{
        color: '#fff', textAlign: 'center', padding: '80px 20px',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#FFD700', letterSpacing: 4,
        }}>WAITING FOR PLAYERS</div>
        <div style={{ fontSize: 12, color: '#555', letterSpacing: 2, marginTop: 8 }}>
          {playerNames.length} PLAYER{playerNames.length !== 1 ? 'S' : ''} REGISTERED — NEED AT LEAST 2
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
      `}</style>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 5vw, 48px)",
            margin: "4px 0", lineHeight: 1,
            background: "linear-gradient(180deg, #FFD700, #FFA500 50%, #B8860B)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 12px rgba(255,215,0,0.25))"
          }}>MATCH CALENDAR</h1>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 20, marginTop: 12, flexWrap: "wrap"
          }}>
            {[`${playerNames.length} FIGHTERS`, `${totalMatches} MATCHES`, "3 DAYS"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#FFD700", fontSize: 14 }}>◆</span>
                <span style={{ fontSize: 11, color: "#aaa", letterSpacing: 2 }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16, padding: "10px 24px",
            background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,165,0,0.04))",
            border: "1px solid rgba(255,215,0,0.15)", display: "inline-block", borderRadius: 2,
          }}>
            <span style={{ fontSize: 10, color: "#888", letterSpacing: 3 }}>MARCH 10-12, 2026 </span>
            <span style={{ fontSize: 10, color: "#FFD700", letterSpacing: 2 }}>• START 21:00 CET</span>
          </div>
        </div>

        {/* Day Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #1a1a1a" }}>
          {schedule.map((day, i) => (
            <button key={i} onClick={() => setActiveDay(i)} style={{
              flex: 1, padding: "14px 12px 12px",
              background: activeDay === i ? "linear-gradient(180deg, rgba(255,215,0,0.1), transparent)" : "transparent",
              border: "none", borderBottom: activeDay === i ? "2px solid #FFD700" : "2px solid transparent",
              color: activeDay === i ? "#FFD700" : "#555",
              cursor: "pointer", fontFamily: "'Oswald', sans-serif", transition: "all 0.3s",
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 3, fontFamily: "'Bebas Neue', sans-serif" }}>
                {day.dayLabel}
              </div>
              <div style={{ fontSize: 10, letterSpacing: 2, marginTop: 2, color: activeDay === i ? "#B8860B" : "#333" }}>
                {day.date}
              </div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, marginTop: 4, color: activeDay === i ? "#888" : "#2a2a2a" }}>
                {day.matches.length} MATCH{day.matches.length > 1 ? "ES" : ""}
              </div>
            </button>
          ))}
        </div>

        {schedule.map((day, dayIdx) => (
          dayIdx === activeDay && (
            <div key={dayIdx}>
              <div style={{
                marginBottom: 20, padding: "16px 20px",
                background: "linear-gradient(135deg, rgba(255,215,0,0.04), rgba(0,0,0,0.4))",
                borderLeft: "3px solid #FFD700",
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#FFD700", letterSpacing: 4,
                }}>{day.subtitle}</div>
                <div style={{ fontSize: 12, color: "#777", marginTop: 4, letterSpacing: 1, fontWeight: 300 }}>
                  {day.description}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 10, color: "#555", letterSpacing: 2 }}>
                  <span>START: <span style={{ color: "#FFD700" }}>21:00 CET</span></span>
                  <span>•</span>
                  <span>INTERVAL: <span style={{ color: "#aaa" }}>20 MIN</span></span>
                </div>
              </div>

              {day.byeAdvancers && day.byeAdvancers.length > 0 && (
                <div style={{
                  marginBottom: 16, padding: "12px 16px",
                  background: "rgba(255,215,0,0.03)", border: "1px dashed rgba(255,215,0,0.15)", borderRadius: 2,
                }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#FFD700", marginBottom: 6 }}>
                    ◆ BYE — DIRECT ADVANCE TO ROUND 2
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {day.byeAdvancers.map((p, i) => (
                      <span key={i} style={{
                        fontSize: 12, color: "#aaa", background: "rgba(255,215,0,0.06)",
                        padding: "3px 10px", borderRadius: 1, letterSpacing: 2,
                        border: "1px solid rgba(255,215,0,0.1)",
                      }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {day.matches.map((match, mi) => {
                  const prevMatch = day.matches[mi - 1];
                  const showBreak = prevMatch && prevMatch.round !== match.round;
                  return (
                    <div key={mi}>
                      {showBreak && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "14px 0", margin: "6px 0"
                        }}>
                          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #333, transparent)" }} />
                          <span style={{ fontSize: 9, letterSpacing: 4, color: "#555", animation: "pulse 2s infinite" }}>
                            ▲ BREAK ▲
                          </span>
                          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #333, transparent)" }} />
                        </div>
                      )}
                      <MatchRow match={match} index={mi} />
                    </div>
                  );
                })}
              </div>

              {dayIdx === 2 && (
                <div style={{
                  marginTop: 24, textAlign: "center", padding: 24,
                  background: "linear-gradient(135deg, rgba(255,215,0,0.05), transparent 50%, rgba(255,215,0,0.05))",
                  border: "1px solid rgba(255,215,0,0.1)",
                }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>👑</div>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#FFD700", letterSpacing: 6
                  }}>WHO WILL BE CROWNED CHAMPION?</div>
                </div>
              )}
            </div>
          )
        ))}

        <div style={{ textAlign: "center", marginTop: 32, paddingTop: 16, borderTop: "1px solid #141414" }}>
          <div style={{ fontSize: 9, color: "#222", letterSpacing: 4 }}>ALL TIMES CET • 20 MIN INTERVALS</div>
        </div>
      </div>
    </div>
  );
}
