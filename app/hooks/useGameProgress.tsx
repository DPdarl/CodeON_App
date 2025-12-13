// app/hooks/useGameProgress.ts
import { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { awardXPToUser } from "~/lib/leveling-system";

export function useGameProgress() {
  const { user, syncUser } = useAuth();

  // Modal State
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState<
    { type: "coin" | "badge" | "unlock"; label: string }[]
  >([]);
  const [newLevel, setNewLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const grantXP = async (amount: number) => {
    if (!user || isProcessing) return;
    setIsProcessing(true);

    try {
      // 1. Run the Logic & Update DB
      // (Ensure awardXPToUser is exported from your ~/lib/leveling-system.ts)
      const result = await awardXPToUser(user.uid, amount);

      // 2. Prepare Rewards Data for UI
      const currentRewards: typeof earnedRewards = [];

      if (result.coinsEarned > 0) {
        currentRewards.push({
          type: "coin",
          label: `+${result.coinsEarned} Coins`,
        });
      }

      // Check specific level milestones
      if (result.newLevel > user.level!) {
        // Level Up Happened!
        if (result.newLevel === 5)
          currentRewards.push({
            type: "unlock",
            label: "Multiplayer Unlocked",
          });
        if (result.newLevel % 5 === 0)
          currentRewards.push({ type: "badge", label: "Milestone Badge" });

        setNewLevel(result.newLevel);
        setEarnedRewards(currentRewards);
        setShowLevelUp(true);
      }

      // 3. Sync Context immediately (Updates Home/Leaderboard instantly)
      syncUser({
        ...user,
        xp: result.newTotalXP,
        level: result.newLevel,
        coins: (user.coins || 0) + result.coinsEarned,
      });
    } catch (error) {
      console.error("XP Grant Failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    grantXP,
    levelUpModal: {
      isOpen: showLevelUp,
      newLevel,
      rewards: earnedRewards,
      close: () => setShowLevelUp(false),
    },
    isProcessing,
  };
}
