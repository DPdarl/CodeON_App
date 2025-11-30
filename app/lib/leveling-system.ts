// app/lib/leveling-system.ts

export const LEVELING_CONSTANTS = {
  BASE_XP: 100,
  INCREMENT: 50,
};

interface LevelProgress {
  currentLevel: number;
  currentXP: number; // XP gained towards the *next* level
  totalXP: number; // Lifetime accumulated XP
  xpForNextLevel: number;
  progressPercent: number;
}

interface XPGainResult {
  newTotalXP: number;
  newLevel: number;
  levelsGained: number;
  rewards: string[];
}

/**
 * Calculates the XP required to pass a specific level.
 * Formula: Base + (Level - 1) * Increment
 */
export function getXpRequiredForLevel(level: number): number {
  return (
    LEVELING_CONSTANTS.BASE_XP + (level - 1) * LEVELING_CONSTANTS.INCREMENT
  );
}

/**
 * Converts Total XP (lifetime) into current level and partial progress.
 * This handles "overflow" automatically because it recalculates from total.
 */
export function calculateProgress(totalXP: number): LevelProgress {
  let level = 1;
  let xp = totalXP;
  let required = getXpRequiredForLevel(level);

  // Keep subtracting required XP until we don't have enough for the next level
  while (xp >= required) {
    xp -= required;
    level++;
    required = getXpRequiredForLevel(level);
  }

  return {
    currentLevel: level,
    currentXP: xp, // Remaining XP (current bar fill)
    totalXP: totalXP,
    xpForNextLevel: required,
    progressPercent: Math.min(100, (xp / required) * 100),
  };
}

/**
 * Adds XP to a user and determines if they leveled up.
 * Usage: Call this when a user completes a lesson.
 */
export function addXP(
  currentTotalXP: number,
  amountToAdd: number
): XPGainResult {
  const oldStats = calculateProgress(currentTotalXP);
  const newTotalXP = currentTotalXP + amountToAdd;
  const newStats = calculateProgress(newTotalXP);

  const levelsGained = newStats.currentLevel - oldStats.currentLevel;
  const rewards: string[] = [];

  if (levelsGained > 0) {
    // Grant rewards for leveling up
    rewards.push(`${levelsGained * 50} Coins`); // Example: 50 coins per level
    if (newStats.currentLevel >= 5) rewards.push("Multiplayer Unlocked");
    if (newStats.currentLevel % 10 === 0) rewards.push("Special Badge");
  }

  return {
    newTotalXP,
    newLevel: newStats.currentLevel,
    levelsGained,
    rewards,
  };
}
