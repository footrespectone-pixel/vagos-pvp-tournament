export function seededShuffle(arr, seed = 42) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nextPowerOf2(n) {
  let p = 2;
  while (p < n) p *= 2;
  return p;
}

export function getRoundNamesForBracket(rounds) {
  const t = rounds.length;
  if (t <= 1) return ["FINALE"];
  if (t === 2) return ["DEMIS", "FINALE"];
  if (t === 3) return ["QUARTS", "DEMIS", "FINALE"];
  if (t === 4) return ["ROUND 1", "QUARTS", "DEMIS", "FINALE"];
  if (t === 5) return ["ROUND 1", "ROUND 2", "QUARTS", "DEMIS", "FINALE"];
  const names = [];
  for (let i = 0; i < t - 3; i++) names.push(`ROUND ${i + 1}`);
  names.push("QUARTS", "DEMIS", "FINALE");
  return names;
}

export const ROUND_NAMES = ["ROUND 1", "ROUND 2", "QUARTS", "DEMIS", "FINALE"];

/**
 * PROPER BYE DISTRIBUTION:
 * With 24 players and 32 slots = 8 BYEs.
 * We pair each BYE with a real player so there's NEVER a BYE vs BYE.
 * 
 * Strategy: 
 * - We have `size` slots = `size/2` matches in R1
 * - `numByes` = size - count
 * - We shuffle the players, then place BYEs spread across matches
 * - BYE matches: player auto-advances
 * - Real matches: two players fight
 */
export function generateBracketFromPlayers(playerNames, seed) {
  const count = playerNames.length;
  if (count < 2) return [];

  const size = nextPowerOf2(count);
  const numByes = size - count;
  const numMatches = size / 2;
  const shuffled = seededShuffle(playerNames, seed || Math.floor(Math.random() * 999999));

  // Build R1 matches: first `numByes` matches get a BYE, rest are real matches
  // Spread BYEs from the bottom of the bracket
  const rounds = [];
  const r1 = [];
  
  let playerIdx = 0;
  for (let m = 0; m < numMatches; m++) {
    // BYEs go at the END of the bracket (last matches)
    const isByeMatch = m >= (numMatches - numByes);
    
    if (isByeMatch) {
      // One player vs BYE — auto-advance
      const player = shuffled[playerIdx++];
      r1.push({
        player1: player,
        player2: "BYE",
        winner: player,
        isBye: true
      });
    } else {
      // Two real players
      const p1 = shuffled[playerIdx++];
      const p2 = shuffled[playerIdx++];
      r1.push({
        player1: p1,
        player2: p2,
        winner: null,
        isBye: false
      });
    }
  }
  rounds.push(r1);

  // Subsequent rounds
  let matchCount = Math.floor(size / 4);
  while (matchCount >= 1) {
    const round = [];
    for (let i = 0; i < matchCount; i++) {
      round.push({ player1: null, player2: null, winner: null, isBye: false });
    }
    rounds.push(round);
    matchCount = Math.floor(matchCount / 2);
  }

  return propagateWinners(rounds);
}

export function propagateWinners(rounds) {
  const newRounds = rounds.map(r => r.map(m => ({ ...m })));
  
  for (let r = 0; r < newRounds.length - 1; r++) {
    const currentRound = newRounds[r];
    const nextRound = newRounds[r + 1];
    
    for (let m = 0; m < currentRound.length; m++) {
      const match = currentRound[m];
      if (match.winner) {
        const nextMatchIndex = Math.floor(m / 2);
        if (m % 2 === 0) nextRound[nextMatchIndex].player1 = match.winner;
        else nextRound[nextMatchIndex].player2 = match.winner;
      }
    }
  }
  
  return newRounds;
}

export function setWinnerAndPropagate(rounds, roundIndex, matchIndex, winner) {
  const newRounds = rounds.map(r => r.map(m => ({ ...m })));
  newRounds[roundIndex][matchIndex].winner = winner;

  // Clear downstream
  for (let r = roundIndex; r < newRounds.length - 1; r++) {
    const nextRound = newRounds[r + 1];
    for (let m = 0; m < nextRound.length; m++) {
      nextRound[m] = { player1: null, player2: null, winner: null, isBye: false };
    }
  }

  return propagateWinners(newRounds);
}

export function formatTime(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateSchedule(playerNames) {
  const count = playerNames.length;
  if (count < 2) return [];

  const size = nextPowerOf2(count);
  const totalRounds = Math.log2(size);
  const numByes = size - count;
  const numMatches = size / 2;
  const realMatchCount = numMatches - numByes;

  // Dynamic day distribution
  const days = [];

  if (totalRounds <= 2) {
    days.push({
      date: "MARCH 10, 2026", dayLabel: "DAY 1",
      subtitle: "TOURNAMENT DAY",
      description: `${realMatchCount} matches${numByes > 0 ? ` + ${numByes} BYEs` : ''} — all rounds today.`,
      matches: [], roundTag: "ALL ROUNDS"
    });
  } else if (totalRounds <= 3) {
    days.push({
      date: "MARCH 10, 2026", dayLabel: "DAY 1",
      subtitle: "ROUND 1 — ELIMINATION BEGINS",
      description: `${realMatchCount} matches.${numByes > 0 ? ` ${numByes} players advance with BYE.` : ''}`,
      matches: [], roundTag: "ROUND 1"
    });
    days.push({
      date: "MARCH 11, 2026", dayLabel: "DAY 2",
      subtitle: "FINALS",
      description: "The remaining rounds to crown the champion.",
      matches: [], roundTag: "FINALS"
    });
  } else {
    days.push({
      date: "MARCH 10, 2026", dayLabel: "DAY 1",
      subtitle: "ROUND 1 — ELIMINATION BEGINS",
      description: `${realMatchCount} matches.${numByes > 0 ? ` ${numByes} players advance with BYE.` : ''}`,
      matches: [], roundTag: "ROUND 1"
    });
    days.push({
      date: "MARCH 11, 2026", dayLabel: "DAY 2",
      subtitle: "ROUND 2 & QUARTER-FINALS",
      description: "The field narrows as fighters battle for the final spots.",
      matches: [], roundTag: "R2 + QUARTERS"
    });
    days.push({
      date: "MARCH 12, 2026", dayLabel: "DAY 3",
      subtitle: "SEMI-FINALS & GRAND FINALE",
      description: "The last warriors. Who will be crowned champion?",
      matches: [], roundTag: "SEMIS + FINALE"
    });
  }

  // Build round schedule info
  // R1: only real matches (BYE matches are listed separately)
  const r1RealCount = realMatchCount;
  
  // Round sizes after R1
  const roundSizes = [];
  let rs = size / 4;
  while (rs >= 1) {
    roundSizes.push(rs);
    rs = Math.floor(rs / 2);
  }

  // Tag each round
  const roundTags = [];
  for (let r = 0; r < roundSizes.length; r++) {
    if (r === roundSizes.length - 1) roundTags.push("FINALE");
    else if (r === roundSizes.length - 2) roundTags.push("SF");
    else if (r === roundSizes.length - 3) roundTags.push("QF");
    else roundTags.push(`R${r + 2}`);
  }

  // BYE advancers (for display)
  const shuffled = seededShuffle(playerNames);
  const byeAdvancers = [];
  let pIdx = (numMatches - numByes) * 2; // skip real match players
  for (let i = 0; i < numByes; i++) {
    byeAdvancers.push(shuffled[pIdx + i]);
  }

  if (days.length === 1) {
    let time = { h: 21, m: 0 };
    // R1 real matches
    for (let i = 0; i < r1RealCount; i++) {
      days[0].matches.push({ num: i + 1, time: formatTime(time.h, time.m), p1: "TBD", p2: "TBD", round: "R1", status: "scheduled" });
      time.m += 20; if (time.m >= 60) { time.h += 1; time.m -= 60; }
    }
    // Subsequent rounds
    roundSizes.forEach((size, ri) => {
      for (let i = 0; i < size; i++) {
        days[0].matches.push({ num: days[0].matches.length + 1, time: formatTime(time.h, time.m), p1: "TBD", p2: "TBD", round: roundTags[ri], status: "pending" });
        time.m += 20; if (time.m >= 60) { time.h += 1; time.m -= 60; }
      }
    });
    if (byeAdvancers.length > 0) days[0].byeAdvancers = byeAdvancers;

  } else if (days.length === 2) {
    let time = { h: 21, m: 0 };
    for (let i = 0; i < r1RealCount; i++) {
      days[0].matches.push({ num: i + 1, time: formatTime(time.h, time.m), p1: "TBD", p2: "TBD", round: "R1", status: "scheduled" });
      time.m += 20; if (time.m >= 60) { time.h += 1; time.m -= 60; }
    }
    if (byeAdvancers.length > 0) days[0].byeAdvancers = byeAdvancers;

    time = { h: 21, m: 0 };
    roundSizes.forEach((size, ri) => {
      for (let i = 0; i < size; i++) {
        days[1].matches.push({ num: days[1].matches.length + 1, time: formatTime(time.h, time.m), p1: "TBD", p2: "TBD", round: roundTags[ri], status: "pending" });
        time.m += 20; if (time.m >= 60) { time.h += 1; time.m -= 60; }
      }
      time.m += 10; if (time.m >= 60) { time.h += 1; time.m -= 60; }
    });

  } else {
    // 3 days: Day1 = R1, Day2 = middle rounds, Day3 = SF + Finale
    let time = { h: 21, m: 0 };
    for (let i = 0; i < r1RealCount; i++) {
      days[0].matches.push({ num: i + 1, time: formatTime(time.h, time.m), p1: "TBD", p2: "TBD", round: "R1", status: "scheduled" });
      time.m += 20; if (time.m >= 60) { time.h += 1; time.m -= 60; }
    }
    if (byeAdvancers.length > 0) days[0].byeAdvancers = byeAdvancers;

    // Day 2: all rounds except last 2 (SF + Finale)
    time = { h: 21, m: 0 };
    const middleEnd = roundSizes.length - 2;
    for (let ri = 0; ri < middleEnd; ri++) {
      for (let i = 0; i < roundSizes[ri]; i++) {
        days[1].matches.push({ num: days[1].matches.length + 1, time: formatTime(time.h, time.m), p1: "TBD", p2: "TBD", round: roundTags[ri], status: "pending" });
        time.m += 20; if (time.m >= 60) { time.h += 1; time.m -= 60; }
      }
      time.m += 10; if (time.m >= 60) { time.h += 1; time.m -= 60; }
    }

    // Day 3: SF + Finale
    time = { h: 21, m: 0 };
    for (let ri = middleEnd; ri < roundSizes.length; ri++) {
      for (let i = 0; i < roundSizes[ri]; i++) {
        days[2].matches.push({ num: days[2].matches.length + 1, time: formatTime(time.h, time.m), p1: "TBD", p2: "TBD", round: roundTags[ri], status: "pending" });
        time.m += 20; if (time.m >= 60) { time.h += 1; time.m -= 60; }
      }
      time.m += 15; if (time.m >= 60) { time.h += 1; time.m -= 60; }
    }
  }

  return days;
}
