import { db } from '../firebase.js';
import { ref, set, get, onValue, remove, push, update } from 'firebase/database';

// ===================== PLAYERS =====================

export function onPlayersChange(callback) {
  const playersRef = ref(db, 'tournament/players');
  return onValue(playersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const list = Object.entries(data).map(([id, val]) => ({
        id,
        name: val.name,
        addedAt: val.addedAt || 0
      }));
      list.sort((a, b) => a.addedAt - b.addedAt);
      callback(list);
    } else {
      callback([]);
    }
  });
}

export async function addPlayer(name) {
  const playersRef = ref(db, 'tournament/players');
  const newRef = push(playersRef);
  await set(newRef, { name: name.toUpperCase().trim(), addedAt: Date.now() });
}

export async function removePlayer(id) {
  const playerRef = ref(db, `tournament/players/${id}`);
  await remove(playerRef);
}

// ===================== BRACKET =====================

export function onBracketChange(callback) {
  const bracketRef = ref(db, 'tournament/bracket');
  return onValue(bracketRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export async function saveBracket(bracketData) {
  const bracketRef = ref(db, 'tournament/bracket');
  await set(bracketRef, bracketData);
}

export async function updateMatchWinner(roundIndex, matchIndex, winner) {
  const matchRef = ref(db, `tournament/bracket/rounds/${roundIndex}/${matchIndex}`);
  await update(matchRef, { winner });
}

export async function saveFullBracket(rounds, champion) {
  const bracketRef = ref(db, 'tournament/bracket');
  await set(bracketRef, { rounds, champion: champion || null, updatedAt: Date.now() });
}

// ===================== TOURNAMENT CONFIG =====================

export function onConfigChange(callback) {
  const configRef = ref(db, 'tournament/config');
  return onValue(configRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
}

export async function saveConfig(config) {
  const configRef = ref(db, 'tournament/config');
  await set(configRef, config);
}

// ===================== ADMIN =====================

export async function checkAdminPassword(password) {
  const configRef = ref(db, 'tournament/adminHash');
  const snapshot = await get(configRef);
  const stored = snapshot.val();
  if (!stored) {
    // First time setup — save the password
    await set(configRef, simpleHash(password));
    return true;
  }
  return stored === simpleHash(password);
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36);
}
