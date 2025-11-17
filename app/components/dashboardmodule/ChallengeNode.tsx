// app/components/dashboardmodule/ChallengeNode.tsx
import { Challenge } from "~/types/challenge.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Lock, Check, Code2, Terminal, Cpu, Brain, Zap } from "lucide-react";
import { motion } from "framer-motion";

// Helper functions (getLanguageIcon, getDifficultyStyle) remain the same
const getLanguageIcon = (lang: string) => {
  switch (lang.toLowerCase()) {
    case "python":
      return Terminal;
    case "javascript":
      return Code2;
    case "react":
      return Cpu;
    default:
      return Brain;
  }
};

const getDifficultyStyle = (difficulty: "Easy" | "Medium" | "Hard") => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Hard":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

type ChallengeStatus = "locked" | "unlocked" | "completed";

interface ChallengeNodeProps {
  challenge: Challenge;
  status: ChallengeStatus;
  alignment: "left" | "right";
  onSelect: () => void;
}

export function ChallengeNode({
  challenge,
  status,
  alignment,
  onSelect,
}: ChallengeNodeProps) {
  const Icon = getLanguageIcon(String(challenge.language));
  const isDisabled = status === "locked";

  const nodeStyles = {
    locked: "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed",
    unlocked:
      "bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 cursor-pointer hover:bg-indigo-700",
    completed:
      "bg-green-500 text-white shadow-lg shadow-green-500/30 cursor-default",
  };

  const nodeIcon = {
    locked: <Lock className="w-8 h-8" />,
    unlocked: <Icon className="w-8 h-8" />,
    completed: <Check className="w-8 h-8" />,
  };

  const cardVariants = {
    hidden: { opacity: 0, x: alignment === "left" ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.1 } },
  };

  return (
    <TooltipProvider delayDuration={100}>
      {/* ▼▼▼ ALIGNMENT FIX 1: Increased height to h-40 (160px) ▼▼▼ */}
      <motion.div
        className="relative w-full h-40"
        initial="hidden"
        animate="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {/* 1. The Pop-out Info Card */}
        <motion.div
          variants={cardVariants}
          className={cn(
            "absolute w-64",
            "top-1/2 -translate-y-1/2", // Vertical centering
            // ▼▼▼ ALIGNMENT FIX 2: Increased offset to 5rem ▼▼▼
            alignment === "left"
              ? "right-[calc(50%+5rem)]"
              : "left-[calc(50%+5rem)]"
          )}
        >
          <Card
            className={cn(
              "shadow-lg rounded-2xl transition-all",
              status === "unlocked"
                ? "cursor-pointer hover:shadow-xl hover:-translate-y-0.5"
                : "cursor-default",
              status === "locked"
                ? "bg-gray-50 dark:bg-gray-800/50 opacity-60"
                : "bg-white dark:bg-gray-900"
            )}
            onClick={status === "unlocked" ? onSelect : undefined}
          >
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {challenge.title}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{challenge.xp}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex gap-2">
                <Badge className={getDifficultyStyle(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600"
                >
                  {String(challenge.language)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. The Node Orb (Tooltip) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={status === "unlocked" ? { scale: 1.1 } : {}}
              whileTap={status === "unlocked" ? { scale: 0.95 } : {}}
              disabled={isDisabled}
              onClick={status === "unlocked" ? onSelect : undefined}
              className={cn(
                "absolute z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-950 transition-all",
                // Vertical and horizontal centering
                "left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2",
                nodeStyles[status]
              )}
            >
              {/* Pulsing animation for 'unlocked' state */}
              {status === "unlocked" && (
                <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-75 animate-pulse" />
              )}
              <div className="relative z-10">{nodeIcon[status]}</div>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent
            side={alignment === "left" ? "right" : "left"}
            className="max-w-xs"
          >
            <p className="text-sm text-muted-foreground mb-3">
              {challenge.description}
            </p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}
