// app/components/dashboardmodule/PlayTab.tsx
import { useState } from "react";
import { Gamepad2, Users, Map } from "lucide-react";
import { MultiplayerQuiz } from "./MultiplayerQuiz";
import { ChallengeNode } from "./ChallengeNode";
import { motion } from "framer-motion";
import { challenges } from "~/data/challenges";
import { useNavigate } from "@remix-run/react";
import { Challenge } from "~/types/challenge.types";

// Constants for perfect alignment
const NODE_HEIGHT = 160; // h-40
const NODE_GAP = 32; // gap-8

export function PlayTab({
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
}: any) {
  const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState(2);

  const handleStartSolo = (challenge: Challenge) => {
    navigate(`/solo-challenge`, { state: { challenge } });
  };

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

      {/* Multiplayer Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <MultiplayerQuiz
          onStartMultiplayerQuiz={onStartMultiplayerQuiz}
          onJoinMultiplayerQuiz={onJoinMultiplayerQuiz}
        />
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
