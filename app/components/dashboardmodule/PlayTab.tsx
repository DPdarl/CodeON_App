// app/components/dashboardmodule/PlayTab.tsx
import { useState } from "react";
import { Gamepad2, Users, Map, Lock } from "lucide-react";
import { MultiplayerQuiz } from "./MultiplayerQuiz";
import { ChallengeNode } from "./ChallengeNode";
import { motion } from "framer-motion";
import { challenges } from "~/data/challenges";
import { useNavigate } from "@remix-run/react";
import { Challenge } from "~/types/challenge.types";
import { useAuth } from "~/contexts/AuthContext";
import { Button } from "~/components/ui/button";

// Constants for perfect alignment
const NODE_HEIGHT = 160; // h-40
const NODE_GAP = 32; // gap-8

export function PlayTab({
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
}: any) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // TODO: Connect this to user.completedChallenges.length in the future
  const [userProgress, setUserProgress] = useState(2);

  const handleStartSolo = (challenge: Challenge) => {
    navigate(`/solo-challenge`, { state: { challenge } });
  };

  // Logic: Unlock at Level 5
  const currentLevel = user?.level || 1;
  const isMultiplayerUnlocked = currentLevel >= 5;

  // Calculate green line height
  const progressHeight =
    userProgress > 0
      ? (userProgress - 1) * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3"
      >
        <Gamepad2 className="w-8 h-8 text-indigo-500" />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Challenge Arena
        </h1>
      </motion.div>

      {/* Multiplayer Section (Conditional Lock) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {isMultiplayerUnlocked ? (
          <MultiplayerQuiz
            onStartMultiplayerQuiz={onStartMultiplayerQuiz}
            onJoinMultiplayerQuiz={onJoinMultiplayerQuiz}
          />
        ) : (
          /* LOCKED STATE CARD */
          <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-8 md:p-12 text-center">
            {/* Blurry Background Elements for visual interest */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2 shadow-inner">
                <Lock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                Multiplayer Arena Locked
              </h2>

              <p className="text-gray-400 max-w-md mx-auto">
                Prove your skills in the solo journey first. Reach{" "}
                <span className="font-bold text-indigo-500">Level 5</span> to
                unlock competitive coding battles!
              </p>

              <div className="pt-4">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-mono text-sm font-bold">
                  Current Level: {currentLevel} / 5
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Solo Journey Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative w-full">
          {/* Gray Path */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          {/* Green Progress Path */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 bg-green-500 rounded-full transition-all duration-500"
            style={{ height: `${progressHeight}px` }}
          />

          {/* Nodes Container with Gap */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {challenges.map((challenge, index) => (
              <ChallengeNode
                key={challenge.id}
                challenge={challenge}
                status={
                  index < userProgress
                    ? "completed"
                    : index === userProgress
                    ? "unlocked"
                    : "locked"
                }
                alignment={index % 2 === 0 ? "left" : "right"}
                onSelect={() => handleStartSolo(challenge)}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
