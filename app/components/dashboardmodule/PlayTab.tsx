// app/components/dashboardmodule/PlayTab.tsx
import { useState } from "react";
import { Gamepad2, Users, Map } from "lucide-react";
import { MultiplayerQuiz } from "./MultiplayerQuiz";
import { ChallengeNode } from "./ChallengeNode";
import { motion } from "framer-motion";
import { challenges } from "~/data/challenges";
import { useNavigate } from "@remix-run/react";
import { Challenge } from "~/types/challenge.types";

interface PlayTabProps {
  onStartMultiplayerQuiz: () => void;
  onJoinMultiplayerQuiz: () => void;
}

type ChallengeStatus = "locked" | "unlocked" | "completed";

// ▼▼▼ ALIGNMENT FIX ▼▼▼
// We define node height (160px = h-40) and gap (32px = gap-8)
// to calculate the progress line height.
const NODE_ROW_HEIGHT = 160;
const NODE_ROW_GAP = 32;

export function PlayTab({
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
}: PlayTabProps) {
  const navigate = useNavigate();

  // --- MOCK DATA ---
  const [userProgress, setUserProgress] = useState(2); // User has completed 2 challenges
  // --- END MOCK DATA ---

  const handleStartSoloChallenge = (challenge: Challenge) => {
    navigate(`/solo-challenge`, {
      state: { challenge },
    });
  };

  const getChallengeStatus = (index: number): ChallengeStatus => {
    if (index < userProgress) return "completed";
    if (index === userProgress) return "unlocked";
    return "locked";
  };

  // ▼▼▼ COLORED LINE FIX ▼▼▼
  // Calculate the height of the "completed" progress line
  const progressLineHeight =
    userProgress > 0
      ? (userProgress - 1) * (NODE_ROW_HEIGHT + NODE_ROW_GAP) +
        NODE_ROW_HEIGHT / 2
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Gamepad2 className="w-8 h-8 text-indigo-500" />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Challenge Arena
        </h1>
      </motion.div>

      {/* Section 1: Multiplayer Battles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-red-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Multiplayer Battles
          </h2>
        </div>
        <MultiplayerQuiz
          onStartMultiplayerQuiz={onStartMultiplayerQuiz}
          onJoinMultiplayerQuiz={onJoinMultiplayerQuiz}
        />
      </motion.div>

      {/* Section 2: Solo Journey */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Map className="w-6 h-6 text-green-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Solo Journey
          </h2>
        </div>

        {/* The Path */}
        <div className="relative w-full">
          {/* 1. The gray "background" path line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />

          {/* 2. The green "completed" path line */}
          {userProgress > 0 && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 bg-green-500 rounded-full transition-all duration-500 ease-out"
              style={{ height: `${progressLineHeight}px` }}
            />
          )}

          {/* ▼▼▼ ALIGNMENT FIX: Increased gap to gap-8 ▼▼▼ */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {challenges.map((challenge, index) => (
              <ChallengeNode
                key={challenge.id}
                challenge={challenge}
                status={getChallengeStatus(index)}
                alignment={index % 2 === 0 ? "left" : "right"}
                onSelect={() => handleStartSoloChallenge(challenge)}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
