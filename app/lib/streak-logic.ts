// app/lib/streak-logic.ts
import { UserData } from "~/contexts/AuthContext";

// --- CONFIGURATION ---
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

// --- HELPERS ---
// Get current PH date as YYYY-MM-DD string
export const getPhDateString = () => {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }))
    .toISOString()
    .split("T")[0];
};

export interface StreakUpdateResult {
  shouldUpdate: boolean;
  newStreak: number;
  newActiveDates: string[];
  newCoins: number;
  newFreezes: number;
  newBadges: string[];
  messages: string[]; // Feedback for the user (e.g., "Streak Freeze Used!")
}

/**
 * Calculates the new state of the user's streak after playing a game.
 * Call this when a user successfully completes a challenge.
 */
export function calculateStreakUpdate(user: UserData): StreakUpdateResult {
  const today = getPhDateString();
  const activeDates = user.activeDates || [];
  const lastActive =
    activeDates.length > 0 ? activeDates[activeDates.length - 1] : null;

  // Default Result (No changes)
  const result: StreakUpdateResult = {
    shouldUpdate: false,
    newStreak: user.streaks || 0,
    newActiveDates: [...activeDates],
    newCoins: user.coins || 0,
    newFreezes: user.streakFreezes || 0,
    newBadges: user.badges || [],
    messages: [],
  };

  // 1. If already played today, do nothing
  if (lastActive === today) {
    return result;
  }

  // 2. Mark today as active
  result.shouldUpdate = true;
  result.newActiveDates.push(today);

  // 3. Calculate Date Difference
  let daysDiff = 1; // Default to 1 if first time
  if (lastActive) {
    const lastDate = new Date(lastActive);
    const currDate = new Date(today);
    const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
    daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 4. Logic Check
  if (daysDiff === 1) {
    // PERFECT: Played yesterday, streak continues
    result.newStreak += 1;
  } else if (daysDiff === 2) {
    // MISSED 1 DAY: Check for Freeze
    if (result.newFreezes > 0) {
      result.newFreezes -= 1;
      result.newStreak += 1; // Freeze saves the streak and increments it!
      result.messages.push("❄️ Streak Freeze Used! Your streak is safe.");
    } else {
      result.newStreak = 1; // Reset :(
      result.messages.push("Streak Reset! Stay consistent to earn rewards.");
    }
  } else {
    // MISSED > 1 DAY: Hard Reset (Freezes usually only cover 1 day gap)
    result.newStreak = 1;
    result.messages.push("Streak Started! Good luck.");
  }

  // 5. Check Milestones & Rewards
  const milestone = STREAK_MILESTONES[result.newStreak];
  if (milestone) {
    result.newCoins += milestone.coins;
    result.messages.push(
      `🎉 ${milestone.title} Reached! +${milestone.coins} Coins`
    );

    if (milestone.badge && !result.newBadges.includes(milestone.badge)) {
      result.newBadges.push(milestone.badge);
      result.messages.push(`🏅 Badge Unlocked: ${milestone.title}`);
    }
  }

  return result;
}
