// app/lib/leaderboard-logic.ts
import {
  collection,
  query,
  where,
  getCountFromServer,
  getFirestore,
} from "firebase/firestore";
import app from "~/lib/firebase";

const db = getFirestore(app);

// Keep League based on XP (Long term progress), or switch to Trophies?
// Based on your request "trophies, level, and rank/league",
// we'll keep the League calculation as is (XP-based) for now so it matches HomeTab,
// BUT the *Leaderboard Ranking* will be purely Trophy based.

export const LEAGUES = [
  { name: "Novice", minXp: 0, color: "text-gray-500" },
  { name: "Bronze", minXp: 500, color: "text-orange-600" },
  { name: "Silver", minXp: 2000, color: "text-slate-400" },
  { name: "Gold", minXp: 5000, color: "text-yellow-500" },
  { name: "Platinum", minXp: 10000, color: "text-cyan-400" },
  { name: "Diamond", minXp: 25000, color: "text-indigo-400" },
];

export function getLeagueFromXP(xp: number) {
  const league = [...LEAGUES].reverse().find((l) => xp >= l.minXp);
  return league ? league.name : "Novice";
}

// ▼▼▼ CHANGED: Rank is now based on TROPHIES ▼▼▼
export async function getUserRank(userTrophies: number): Promise<number> {
  try {
    const usersRef = collection(db, "users");
    // Count how many users have MORE trophies than the current user
    const q = query(usersRef, where("trophies", ">", userTrophies));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count + 1;
  } catch (error) {
    console.error("Error fetching rank:", error);
    return 0;
  }
}
