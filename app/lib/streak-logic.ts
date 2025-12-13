// app/lib/streak-logic.ts
import { UserData } from "~/contexts/AuthContext";

/* -------------------------------- CONFIG -------------------------------- */

export const STREAK_MILESTONES: Record<
  number,
  { coins: number; badge?: string; title?: string }
> = {
  3: { coins: 50, title: "3-Day Spark" },
  7: { coins: 100, badge: "week-warrior", title: "Week Warrior" },
  14: { coins: 250, title: "Fortnight Fighter" },
  30: { coins: 500, badge: "consistency-king", title: "Consistency King" },
  100: { coins: 1000, badge: "century-club", title: "Century Club" },
};

/* ----------------------------- DATE HELPERS ------------------------------ */

// PH calendar day (Duolingo-style)
export const getPhDateString = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }))
    .toISOString()
    .split("T")[0];
};

const diffInDays = (a: string, b: string) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

/* ----------------------------- RESULT TYPE ------------------------------ */

export interface StreakUpdateResult {
  shouldUpdate: boolean;
  newStreak: number;
  newActiveDates: string[];
  newCoins: number;
  newFreezes: number;
  newBadges: string[];
  messages: string[];
}

/* --------------------------- MAIN STREAK LOGIC --------------------------- */

export function calculateStreakUpdate(user: UserData): StreakUpdateResult {
  const today = getPhDateString();
  const activeDates = user.activeDates ?? [];
  const lastActive = activeDates.at(-1) ?? null;

  const result: StreakUpdateResult = {
    shouldUpdate: false,
    newStreak: user.streaks ?? 0,
    newActiveDates: [...activeDates],
    newCoins: user.coins ?? 0,
    newFreezes: user.streakFreezes ?? 0,
    newBadges: user.badges ?? [],
    messages: [],
  };

  /* 1️⃣ Already played today */
  if (lastActive === today) return result;

  result.shouldUpdate = true;
  result.newActiveDates.push(today);

  /* 2️⃣ First ever activity */
  if (!lastActive) {
    result.newStreak = 1;
    result.messages.push("🔥 Streak Started!");
    return rewardMilestone(result);
  }

  const dayGap = diffInDays(lastActive, today);

  /* 3️⃣ Duolingo Rules */
  if (dayGap === 1) {
    // Normal continuation
    result.newStreak += 1;
  } else if (dayGap === 2 && result.newFreezes > 0) {
    // Missed 1 day → Freeze saves streak (NO increment on missed day)
    result.newFreezes -= 1;
    result.newStreak += 1;
    result.messages.push("❄️ Streak Freeze Used!");
  } else {
    // Hard reset
    result.newStreak = 1;
    result.messages.push("💔 Streak Reset. New streak started!");
  }

  return rewardMilestone(result);
}

/* --------------------------- MILESTONE REWARD --------------------------- */

function rewardMilestone(result: StreakUpdateResult): StreakUpdateResult {
  const milestone = STREAK_MILESTONES[result.newStreak];
  if (!milestone) return result;

  result.newCoins += milestone.coins;
  result.messages.push(`🎉 ${milestone.title}! +${milestone.coins} Coins`);

  if (milestone.badge && !result.newBadges.includes(milestone.badge)) {
    result.newBadges.push(milestone.badge);
    result.messages.push(`🏅 Badge Unlocked: ${milestone.title}`);
  }

  return result;
}
