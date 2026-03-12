import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  XCircle,
  ListChecks,
  Link2,
  Lock,
  BookOpen,
  Map as MapIcon,
  Loader2,
  X,
  Heart,
  Backpack,
  Trophy,
  RotateCcw,
  Lightbulb,
  Snowflake,
  Clock,
  Zap,
  Medal,
  Star,
  ArrowRight,
  Gift,
  Bug,
  GitBranch,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { toast } from "sonner";

// --- IMPORTS ---
import { supabase } from "~/utils/supabase";
import { useAuth } from "~/contexts/AuthContext";
import { useGameProgress } from "~/hooks/useGameProgress";
import { useHeartSystem, MAX_HEARTS, HEART_COST } from "~/hooks/useHeartSystem";
import {
  QuizActivity,
  BuildingBlocksActivity,
  MatchingActivity,
  type ActivityHandle,
} from "~/components/dashboardmodule/ActivityComponents";
import { AdventureResults } from "~/components/dashboardmodule/AdventureResults";
import { AdventureCompletedCelebration } from "~/components/dashboardmodule/AdventureCompletedCelebration"; // ✅ NEW COMPONENT
import { AdventureSkeleton } from "~/components/dashboardmodule/AdventureSkeleton"; // ✅ NEW COMPONENT
import { ArticleSkeleton } from "~/components/dashboardmodule/ArticleSkeleton"; // ✅ NEW COMPONENT
import {
  CHAPTER_VISUALS,
  CHAPTER_0_VISUAL,
  CHAPTER_0_LESSON,
} from "~/data/adventureContent"; // CSHARP_LESSONS removed — content now from DB
import { trackQuestEvent } from "~/lib/quest-tracker";
import { useGameSound } from "~/hooks/useGameSound";
import { BugReportModal } from "~/components/playmodule/challenge/BugReportModal";
import { calculateStreakUpdate } from "~/lib/streak-logic";
import { OnboardingTour, TourStep } from "~/components/ui/OnboardingTour";
import { useSearchParams } from "@remix-run/react";
import { CoinIcon } from "~/components/ui/Icons";

const NODE_HEIGHT = 160;
const NODE_GAP = 32;

// --- HELPER: Format Seconds ---
const formatRuntime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

// --- COMPONENT: RANK BADGE ---
// --- COMPONENT: RANK BADGE ---
function RankBadge({
  rank,
  className,
}: {
  rank: number | string;
  className?: string;
}) {
  if (!rank || rank === 0) return null;

  if (rank === 1) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1 md:px-4 md:py-2 bg-yellow-500/10 text-yellow-600 rounded-full font-bold border border-yellow-500/20 shadow-sm text-xs md:text-sm",
          className,
        )}
      >
        <Medal className="w-3 h-3 md:w-4 md:h-4 fill-yellow-600 text-yellow-600" />
        <span>Rank 1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1 md:px-4 md:py-2 bg-slate-200 text-slate-600 rounded-full font-bold border border-slate-300 shadow-sm text-xs md:text-sm",
          className,
        )}
      >
        <Medal className="w-3 h-3 md:w-4 md:h-4 fill-slate-300 text-slate-500" />
        <span>Rank 2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1 md:px-4 md:py-2 bg-orange-100 text-orange-700 rounded-full font-bold border border-orange-200 shadow-sm text-xs md:text-sm",
          className,
        )}
      >
        <Medal className="w-3 h-3 md:w-4 md:h-4 fill-orange-400 text-orange-600" />
        <span>Rank 3</span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1 md:px-4 md:py-2 bg-secondary/50 text-muted-foreground rounded-full font-bold border border-border text-xs md:text-sm",
        className,
      )}
    >
      <Trophy className="w-3 h-3 md:w-4 md:h-4" />
      <span>#{rank}</span>
    </div>
  );
}

// --- REUSABLE HEART DROPDOWN ---
function HeartDropdown({ hearts, timeRemaining, buyHearts }: any) {
  const isFull = hearts >= MAX_HEARTS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 hover:bg-transparent px-2"
        >
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-red-500" />
          <span className="font-bold text-red-500 text-base sm:text-lg">
            {hearts}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 sm:w-72 p-2">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Lives</span>
          <Badge
            variant={isFull ? "default" : "outline"}
            className={
              isFull ? "bg-green-500" : "text-orange-500 border-orange-500"
            }
          >
            {isFull ? "MAX" : "REGENERATING"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-3 bg-secondary/30 rounded-md mb-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Hearts</span>
            <span className="font-bold">
              {hearts} / {MAX_HEARTS}
            </span>
          </div>
          {!isFull && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Next in
              </span>
              <span className="font-mono font-bold text-orange-500">
                {timeRemaining}
              </span>
            </div>
          )}
        </div>

        <Button
          className="w-full gap-2 font-bold bg-green-500 hover:bg-green-600 text-white"
          size="lg"
          disabled={isFull}
          onClick={() => {
            if (isFull) return;
            buyHearts();
          }}
        >
          <Zap className="w-4 h-4 fill-white" />
          {isFull ? "Hearts are Full" : `Refill Full (${HEART_COST})`}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- COMPONENT: ROADMAP NODE ---
function RoadmapNode({
  chapter,
  status,
  alignment,
  onClick,
  id,
  cardId,
  isAdventureComplete,
}: any) {
  const Icon = chapter.icon;
  const isCompleted = status === "completed";
  const isLocked = status === "locked";
  const isCurrent = status === "current";

  const isTutorial = chapter.isTutorial === true;

  // Tutorial is always clickable (replay anytime); real chapters follow the normal rule
  const isClickable = isTutorial
    ? isCurrent || isCompleted
    : isCurrent || (isCompleted && isAdventureComplete);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.1 } },
  };

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div
        className="relative w-full h-40 flex items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* --- NODE BUTTON --- */}
        <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                id={id}
                whileHover={isClickable ? { scale: 1.15 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                disabled={!isClickable}
                onClick={isClickable ? onClick : undefined}
                className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 border-background transition-all",
                  isLocked
                    ? "bg-muted text-muted-foreground"
                    : cn(
                        chapter.color,
                        "text-white shadow-xl ring-4 ring-offset-4 ring-offset-background",
                        isTutorial ? "ring-amber-400/50" : "ring-indigo-500/20",
                      ),
                  isCompleted &&
                    (isTutorial
                      ? "ring-amber-400/60 border-amber-100"
                      : "ring-green-400/50 border-green-100"),
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 md:w-8 md:h-8 stroke-[3]" />
                ) : isLocked ? (
                  <Lock className="w-6 h-6 md:w-8 md:h-8" />
                ) : (
                  <Icon className="w-6 h-6 md:w-8 md:h-8" />
                )}
                {status === "current" && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white" />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>
                {isTutorial
                  ? isCompleted
                    ? "Replay Tutorial"
                    : "Start Tutorial"
                  : isCompleted && !isAdventureComplete
                  ? "Complete Adventure to Replay"
                  : isCompleted
                  ? "Replay Lesson"
                  : chapter.activityType}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* --- CONTENT CARD --- */}
        <motion.div
          id={cardId}
          variants={cardVariants}
          className={cn(
            "absolute w-[calc(100%-6rem)] md:w-64",
            "left-20",
            alignment === "left"
              ? "md:left-auto md:right-[calc(50%+5rem)]"
              : "md:left-[calc(50%+5rem)]",
          )}
        >
          <Card
            className={cn(
              "shadow-lg rounded-2xl transition-all border-2",
              isClickable ? "hover:scale-105 cursor-pointer" : "cursor-default",
              isCompleted
                ? isTutorial
                  ? "bg-amber-50 border-amber-400/40 dark:bg-amber-900/20 dark:border-amber-500/30"
                  : "bg-green-50 border-green-500/30 dark:bg-green-900/20 dark:border-green-500/30"
                : isLocked
                ? "opacity-60 grayscale border-dashed"
                : isTutorial
                ? "border-amber-400/60 hover:border-amber-500"
                : "hover:border-indigo-400",
            )}
            onClick={isClickable ? onClick : undefined}
          >
            <CardHeader className="pb-1 p-3 md:p-4">
              <div className="flex justify-between items-start">
                <Badge
                  variant={isCompleted ? "default" : "outline"}
                  className={cn(
                    "mb-1 md:mb-2 text-[10px]",
                    isCompleted
                      ? isTutorial
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-green-600 hover:bg-green-700"
                      : isTutorial
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "",
                  )}
                >
                  {isCompleted
                    ? isTutorial
                      ? "Done ✓"
                      : "Completed"
                    : isTutorial
                    ? "Tutorial"
                    : `Chapter ${chapter.order_index}`}
                </Badge>
                {!isLocked && (
                  <BookOpen
                    className={cn(
                      "w-3 h-3",
                      isTutorial ? "text-amber-500" : "text-indigo-500",
                    )}
                  />
                )}
              </div>
              <CardTitle className="text-sm md:text-base leading-tight">
                {chapter.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {chapter.description}
              </p>
            </CardContent>
          </Card>
          {/* ── Reward Footer ── */}
          {!isLocked && !isTutorial && (
            <div className="flex items-center justify-start gap-3 px-3 pt-1 pb-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                <Zap className="w-3 h-3 fill-blue-500" />+
                {chapter.xp_reward ?? 50} XP
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/20">
                <span className="text-base leading-none">🪙</span>
                {Math.floor((chapter.xp_reward ?? 50) / 2)} Coins
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}

// --- COMPONENT: SIDE QUEST NODE ---
function SideQuestNode({
  quest,
  parentCompleted,
  onClick,
}: {
  quest: any;
  parentCompleted: boolean;
  onClick: () => void;
}) {
  const isCompleted = quest.isCompleted;
  const isLocked = !parentCompleted && !isCompleted;
  const isActive = parentCompleted && !isCompleted;

  return (
    <TooltipProvider delayDuration={100}>
      {/* Connector line from main node path */}
      <div className="relative flex items-center ml-8 md:ml-auto md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 md:flex-row-reverse">
        {/* Dashed branch line */}
        <div
          className={cn(
            "hidden md:block w-8 h-0.5 border-t-2 border-dashed mx-1",
            isCompleted
              ? "border-purple-400"
              : isLocked
              ? "border-muted-foreground/30"
              : "border-purple-400/60",
          )}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={!isLocked ? { scale: 1.1 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              disabled={isLocked}
              onClick={!isLocked ? onClick : undefined}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                isLocked
                  ? "bg-muted text-muted-foreground border-dashed border-muted-foreground/30"
                  : isCompleted
                  ? "bg-purple-500 text-white border-purple-400 shadow-md ring-2 ring-purple-300/50 ring-offset-2 ring-offset-background"
                  : "bg-orange-400 text-white border-orange-300 shadow-md ring-2 ring-orange-300/50 ring-offset-2 ring-offset-background",
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : isLocked ? (
                <Lock className="w-3.5 h-3.5" />
              ) : (
                <GitBranch className="w-4 h-4" />
              )}
              {isActive && (
                <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-orange-400" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>
              {isLocked
                ? "Complete parent chapter to unlock"
                : isCompleted
                ? "Replay Side Quest"
                : "Side Quest — Start!"}
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Info pill */}
        <div
          className={cn(
            "ml-2 md:ml-0 md:mr-2 px-2 py-1 rounded-xl text-[10px] font-bold max-w-[120px] leading-tight border",
            isLocked
              ? "bg-muted text-muted-foreground border-dashed border-muted-foreground/20"
              : isCompleted
              ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
              : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
          )}
        >
          <p className="text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
            Side Quest
          </p>
          <p className="truncate">{quest.title}</p>
          {!isLocked && (
            <p className="opacity-60 mt-0.5">+{quest.xp_reward ?? 30} XP</p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// --- COMPONENT: REGRESS CONFIRMATION MODAL ---
function RegressModal({ open, onClose, onConfirm }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg">
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Regress Adventure?
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              This will <strong>reset your chapter progress</strong> to the very
              beginning.
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 rounded-lg text-sm">
              <p className="font-bold text-red-800 dark:text-red-200">
                What resets:
              </p>
              <ul className="list-disc list-inside text-red-600 dark:text-red-300">
                <li>Completed Chapters (0/10)</li>
                <li>Adventure Run Time (00:00:00)</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              You will <strong>keep</strong> your XP, Coins, Badges, and
              Inventory. This is for speed-runners who want to improve their
              time.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            Confirm Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENT: EXIT CONFIRMATION MODAL ---
function ExitConfirmModal({ open, onClose, onConfirm }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 text-base sm:text-lg">
            <X className="w-4 h-4 sm:w-5 sm:h-5" /> Exit Activity?
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm sm:text-base">
            If you leave now, your progress in this lesson will be lost and
            cannot be saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Stay
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            Exit Lesson
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENT: GAME OVER OVERLAY (Stable External Component) ---
const GameOverOverlay = ({
  onRefill,
  onClose,
  timeRemaining,
}: {
  onRefill: () => void;
  onClose: () => void;
  timeRemaining: string;
}) => (
  <motion.div
    key="game-over-modal"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-[60] bg-background/95 backdrop-blur flex items-center justify-center p-4"
  >
    <div className="text-center space-y-5 sm:space-y-6 w-full max-w-xs sm:max-w-md bg-card border shadow-2xl p-6 sm:p-8 rounded-2xl sm:rounded-3xl">
      <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
        <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 fill-red-500" />
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground">
          Out of Hearts!
        </h2>
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
          Wait for regeneration or refill instantly.
        </p>
        <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-sm font-mono text-muted-foreground">
          <Clock className="w-4 h-4" />
          Next heart in: {timeRemaining || "20:00"}
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:pt-4">
        <Button
          onClick={onRefill}
          size="lg"
          className="gap-2 w-full font-bold bg-green-500 hover:bg-green-600 text-white"
        >
          <Zap className="w-4 h-4 fill-white" />
          Refill for {HEART_COST} Coins
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Give Up &amp; Return
        </Button>
      </div>
    </div>
  </motion.div>
);

// --- COMPONENT: TUTORIAL INFO CARD ---
const TUTORIAL_COLORS: Record<
  string,
  {
    bg: string;
    border: string;
    header: string;
    badge: string;
    icon: React.ReactNode;
    stepText: string;
  }
> = {
  quiz: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-300 dark:border-blue-700",
    header: "bg-blue-600 dark:bg-blue-700",
    badge: "bg-blue-600 dark:bg-blue-700",
    stepText: "text-blue-900 dark:text-blue-100",
    icon: <ListChecks className="w-6 h-6 text-white" />,
  },
  blocks: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-300 dark:border-purple-700",
    header: "bg-purple-600 dark:bg-purple-700",
    badge: "bg-purple-600 dark:bg-purple-700",
    stepText: "text-purple-900 dark:text-purple-100",
    icon: <Zap className="w-6 h-6 text-white" />,
  },
  matching: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-700",
    header: "bg-emerald-600 dark:bg-emerald-700",
    badge: "bg-emerald-600 dark:bg-emerald-700",
    stepText: "text-emerald-900 dark:text-emerald-100",
    icon: <Link2 className="w-6 h-6 text-white" />,
  },
};

function TutorialInfoCard({
  activity,
  onGotIt,
}: {
  activity: any;
  onGotIt: () => void;
}) {
  const {
    icon: iconType,
    title,
    howToPlay,
    correctMsg,
    wrongMsg,
    tip,
  } = activity.data;
  const theme = TUTORIAL_COLORS[iconType] || TUTORIAL_COLORS.quiz;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-2xl mx-auto rounded-2xl border-2 overflow-hidden shadow-lg",
        theme.bg,
        theme.border,
      )}
    >
      {/* Header — solid colored background, always white text */}
      <div className={cn("flex items-center gap-3 px-6 py-4", theme.header)}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ring-2 ring-white/30">
          {theme.icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-white/75 uppercase tracking-widest">
            Activity Type
          </p>
          <h2 className="text-lg font-black text-white leading-tight">
            {title}
          </h2>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* How to Play */}
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-foreground/60 mb-2">
            📋 How to Play
          </p>
          <ol className="space-y-2">
            {howToPlay.map((step: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white flex-shrink-0 mt-0.5",
                    theme.badge,
                  )}
                >
                  {i + 1}
                </span>
                {/* Explicit dark text for step content — readable in light AND dark */}
                <span className="text-foreground font-medium leading-snug">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Correct / Wrong Feedback Preview */}
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-foreground/60 mb-2">
            🎮 Feedback Preview
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-700 p-3 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-900 dark:text-green-300 font-semibold leading-relaxed">
                {correctMsg}
              </p>
            </div>
            <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-3 flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-900 dark:text-red-300 font-semibold leading-relaxed">
                {wrongMsg}
              </p>
            </div>
          </div>
        </div>

        {/* Tip — amber box with always-dark text in light mode */}
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700/50 px-4 py-3">
          <p className="text-xs text-amber-900 dark:text-amber-300 font-semibold leading-relaxed">
            {tip}
          </p>
        </div>

        {/* Got It button */}
        <Button
          className={cn(
            "w-full h-12 text-base font-bold rounded-xl gap-2 text-white shadow-md",
            theme.badge,
            "hover:opacity-90 transition-opacity",
          )}
          onClick={onGotIt}
        >
          Got It — Let Me Try! <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function FullScreenLesson({
  chapter,
  onClose,
  onComplete,
  inventory,
  onUseHint,
  mistakesSet,
  setMistakesSet,
}: any) {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState<"lesson" | "game">("lesson");
  const [isFinished, setIsFinished] = useState(false);
  const { playSound } = useGameSound();

  // --- TOUR STATE ---
  const [showLessonTour, setShowLessonTour] = useState(false);
  const [showGameTour, setShowGameTour] = useState(false);

  useEffect(() => {
    // Tours only appear in the Chapter 0 tutorial, never in real chapters
    if (!user || !chapter.isTutorial) return;

    if (step === "lesson") {
      const timer = setTimeout(() => setShowLessonTour(true), 800);
      return () => clearTimeout(timer);
    } else if (step === "game") {
      const timer = setTimeout(() => setShowGameTour(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user, step, chapter]);

  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 640 : false;

  const GAME_TOUR_STEPS: TourStep[] = [
    {
      target: "tour-game-progress",
      title: "📊 Progress Bar",
      content:
        "Each question you answer fills this bar. Complete them all to clear the chapter!",
    },
    {
      target: "tour-game-hearts",
      title: "❤️ Hearts & Health",
      content:
        "Every wrong answer costs a heart. Lose them all and it's Game Over. Don't worry — you can refill with coins!",
    },
    {
      target: isMobile ? "tour-game-timer-mobile" : "tour-game-timer",
      title: "⏱️ Speed Timer",
      content:
        "Your time is being tracked! Faster finishes earn better ranks on the leaderboard. Speed matters!",
    },
    {
      target: isMobile ? "tour-game-hints-mobile" : "tour-game-hints",
      title: "💡 Hint Button",
      content:
        "Stuck? Use a Hint! For quizzes it removes wrong options. For blocks it highlights the next piece. Buy hints in the Store.",
    },
    {
      target: "tour-activity-area",
      title: "🧩 Activity Zone",
      content: chapter.isTutorial
        ? "Three activity types await you: ① Multiple Choice — pick the answer. ② Code Builder — drag blocks in order. ③ Matching — connect concepts. Try each one!"
        : "Read the prompt carefully, then solve the puzzle! Drag blocks, select choices, or match phrases. Good luck!",
    },
  ];

  // --- DYNAMIC QUEUE FOR RETRIES ---
  const [lessonQueue, setLessonQueue] = useState<any[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [originalQuestionCount, setOriginalQuestionCount] = useState(0);

  useEffect(() => {
    if (chapter?.activities) {
      const rawActivities = [...chapter.activities];
      // Tutorial: keep in order (quiz → blocks → matching) so each type is shown in sequence
      const queue = chapter.isTutorial
        ? rawActivities.map((act: any, idx: number) => ({
            ...act,
            _originalId: idx,
          }))
        : rawActivities
            .sort(() => Math.random() - 0.5)
            .map((act: any, idx: number) => ({ ...act, _originalId: idx }));

      setLessonQueue(queue);
      setOriginalQuestionCount(queue.length);
      setCurrentActivityIndex(0);
    }
  }, [chapter]);

  const hintCount =
    inventory?.find((i: any) => i.name === "Hint")?.quantity || 0;

  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);

  useEffect(() => {
    if (step === "game" && !isFinished) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, isFinished, startTime]);

  const { hearts, loseHeart, buyHearts, timeRemaining, setIsGameOver } =
    useHeartSystem();

  const [showGameOver, setShowGameOver] = useState(false);

  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "correct" | "wrong"
  >("idle");

  const currentActivity = lessonQueue[currentActivityIndex];
  const activityRef = useRef<ActivityHandle>(null);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  const handleActivitySubmit = async (success: boolean) => {
    if (feedbackStatus !== "idle") return;

    if (success) {
      setFeedbackStatus("correct");
    } else {
      setFeedbackStatus("wrong");

      // Tutorial mode: show red feedback but NEVER lose hearts (safe practice)
      if (chapter.isTutorial) {
        // Re-queue so the player must answer it correctly eventually,
        // but don't deduct a heart. Track the mistake for accuracy display.
        if (currentActivity && currentActivity._originalId !== undefined) {
          setMistakesSet((prev: any) =>
            new Set(prev).add(currentActivity._originalId),
          );
        }
        setLessonQueue((prev) => [...prev, prev[currentActivityIndex]]);
        return;
      }

      if (hearts <= 1) {
        playSound("gameover");
        setShowGameOver(true);
        setIsGameOver(true);
        loseHeart();
      } else {
        const isDead = await loseHeart();
        if (isDead) {
          playSound("gameover");
          setShowGameOver(true);
        } else {
          if (currentActivity && currentActivity._originalId !== undefined) {
            setMistakesSet((prev: any) =>
              new Set(prev).add(currentActivity._originalId),
            );
          }
          setLessonQueue((prev) => [...prev, prev[currentActivityIndex]]);
        }
      }
    }
  };

  const handleContinue = () => {
    setFeedbackStatus("idle");
    if (currentActivityIndex < lessonQueue.length - 1) {
      setCurrentActivityIndex((prev) => prev + 1);
    } else {
      playSound("complete");
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);
      setFinalTime(durationSeconds);
      setIsFinished(true);
    }
  };

  const handleBuyHearts = async () => {
    await buyHearts();
    setShowGameOver(false);
    setIsGameOver(false);
  };

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Handle X button click
  const handleCloseAttempt = () => {
    // If in game and not finished, show confirm
    if (step === "game" && !isFinished) {
      setShowExitConfirm(true);
    } else {
      // Otherwise just close (article view or finished view)
      onClose();
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      <OnboardingTour
        steps={
          chapter.isTutorial
            ? [
                {
                  target: "tour-lesson-content",
                  title: "📖 Step 1: Read the Article",
                  content:
                    "Every chapter begins with a short reading. This one explains how adventures work — study it carefully so you're ready for the challenge!",
                },
                {
                  target: "tour-start-challenge",
                  title: "▶️ Step 2: Start the Challenge",
                  content:
                    "When you're ready, click this button to enter the activity zone. You'll practice three different puzzle types: quiz, code builder, and matching!",
                },
              ]
            : [
                {
                  target: "tour-lesson-content",
                  title: "Study Material",
                  content:
                    "Welcome to class! Here you'll find the core concepts for this chapter. Read through the explanations and code examples carefully before proceeding.",
                },
                {
                  target: "tour-start-challenge",
                  title: "Ready for the Test?",
                  content:
                    "Once you feel confident in what you've learned, click here to jump into the interactive challenges and put your knowledge to the test!",
                },
              ]
        }
        isOpen={showLessonTour}
        onComplete={() => setShowLessonTour(false)}
        onSkip={() => setShowLessonTour(false)}
        avatarConfig={user?.avatarConfig}
        tutorialId={chapter.isTutorial ? undefined : "adventureLesson"}
      />

      {step === "game" && (
        <OnboardingTour
          steps={GAME_TOUR_STEPS}
          isOpen={showGameTour}
          onComplete={() => setShowGameTour(false)}
          onSkip={() => setShowGameTour(false)}
          avatarConfig={user?.avatarConfig}
          tutorialId={chapter.isTutorial ? undefined : "adventureGame"}
        />
      )}

      <ExitConfirmModal
        open={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={confirmExit}
      />

      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
        challengeId={chapter?.id}
      />

      {/* HEADER */}
      <div className="pt-6 pb-2 px-4 sm:px-6 w-full max-w-5xl mx-auto flex flex-col gap-3">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            onClick={handleCloseAttempt}
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsBugReportOpen(true)}
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            title="Report a bug"
          >
            <Bug className="w-6 h-6" />
          </Button>

          {step === "game" && !isFinished ? (
            <div
              id="tour-game-progress"
              className="flex-1 h-4 bg-secondary rounded-full overflow-hidden relative"
            >
              <div className="absolute top-1 left-2 right-2 h-1 bg-white/10 rounded-full z-10" />
              <motion.div
                className="h-full bg-green-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (currentActivityIndex / lessonQueue.length) * 100
                  }%`,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="absolute top-1 left-2 right-2 h-1 bg-white/20 rounded-full" />
              </motion.div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex items-center gap-2 shrink-0">
            {step === "game" && !isFinished && (
              <div className="hidden sm:flex items-center gap-3">
                <Button
                  id="tour-game-hints"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10",
                    hintCount > 0 && "text-yellow-500",
                  )}
                  disabled={hintCount <= 0 || feedbackStatus !== "idle"}
                  onClick={() => activityRef.current?.triggerHint()}
                >
                  <Lightbulb className="w-6 h-6 stroke-[2.5]" />
                </Button>
                <div
                  id="tour-game-timer"
                  className="font-bold text-muted-foreground font-mono"
                >
                  {formatRuntime(elapsedTime)}
                </div>
              </div>
            )}
            <div id="tour-game-hearts">
              <HeartDropdown
                hearts={hearts}
                timeRemaining={timeRemaining}
                buyHearts={buyHearts}
              />
            </div>
          </div>
        </div>

        {step === "game" && !isFinished && (
          <div className="flex sm:hidden items-center justify-center gap-6 pb-2 text-sm font-bold text-muted-foreground">
            <div
              className="flex items-center gap-2"
              id="tour-game-timer-mobile"
            >
              <Clock className="w-4 h-4" />
              {formatRuntime(elapsedTime)}
            </div>
            <button
              id="tour-game-hints-mobile"
              onClick={() => activityRef.current?.triggerHint()}
              disabled={hintCount <= 0 || feedbackStatus !== "idle"}
              className={cn(
                "flex items-center gap-2 disabled:opacity-50",
                hintCount > 0 && "text-yellow-500",
              )}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Hint ({hintCount})</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {step === "lesson" && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 overflow-y-auto"
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 min-h-full flex flex-col justify-center">
                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                        {chapter.title}
                      </h1>
                      {chapter.isCompleted && (
                        <Badge className="bg-green-500 text-white hover:bg-green-600">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className="text-base sm:text-xl text-muted-foreground">
                      {chapter.description}
                    </p>
                  </div>

                  <Card className="border-2 shadow-sm" id="tour-lesson-content">
                    <CardContent className="p-5 sm:p-8 prose dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap font-sans text-base sm:text-lg leading-relaxed">
                        {chapter.content_markdown}
                      </div>
                    </CardContent>
                  </Card>

                  {chapter.codeSnippet && (
                    <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-border">
                      <div className="absolute top-0 right-0 bg-muted px-3 py-1 text-xs font-mono rounded-bl-xl border-l border-b border-border text-muted-foreground">
                        C#
                      </div>
                      <pre className="bg-zinc-950 text-zinc-50 p-6 font-mono text-sm overflow-x-auto">
                        <code>{chapter.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  <div
                    className="pt-8 flex justify-end"
                    id="tour-start-challenge"
                  >
                    <Button
                      size="lg"
                      onClick={() => setStep("game")}
                      className="text-lg px-8 h-14 shadow-xl font-bold bg-green-500 hover:bg-green-600 text-white"
                    >
                      {chapter.isCompleted
                        ? "Practice Again"
                        : "Start Challenge"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === "game" && (
            <motion.div
              key="game"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center"
            >
              <AnimatePresence>
                {showGameOver && (
                  <GameOverOverlay
                    onRefill={handleBuyHearts}
                    onClose={onClose}
                    timeRemaining={timeRemaining}
                  />
                )}
              </AnimatePresence>

              <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 pb-32 sm:pb-40 overflow-y-auto h-full flex flex-col justify-center custom-scrollbar">
                {!isFinished ? (
                  <>
                    {chapter.activities && chapter.activities.length === 0 ? (
                      <div className="text-center space-y-6 py-12">
                        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30" />
                        <h2 className="text-3xl font-black text-foreground">No Activities Found</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          It looks like the instructor hasn't added any interactive activities to this quest yet. Check back later!
                        </p>
                        <Button onClick={handleCloseAttempt} size="lg" variant="outline" className="mt-8 border-2 font-bold">
                          Return to Map
                        </Button>
                      </div>
                    ) : currentActivity ? (
                      <div
                        className="space-y-8"
                        key={currentActivityIndex}
                        id="tour-activity-area"
                      >
                        {/* TUTORIAL_INFO: Show explanation card — no header/question counter */}
                        {currentActivity.type === "TUTORIAL_INFO" ? (
                          <TutorialInfoCard
                            activity={currentActivity}
                            onGotIt={() => handleActivitySubmit(true)}
                          />
                        ) : (
                          <>
                            <div className="text-center space-y-2">
                              <h2 className="text-2xl md:text-3xl font-black text-foreground">
                                {currentActivity.prompt}
                              </h2>
                              <p className="text-muted-foreground font-medium">
                                Step {currentActivityIndex + 1} of{" "}
                                {lessonQueue.length}
                              </p>
                            </div>

                            <Card className="border-none shadow-none bg-transparent">
                              <CardContent className="p-0">
                                {currentActivity.type === "QUIZ" && (
                                  <QuizActivity
                                    ref={activityRef}
                                    data={currentActivity.data}
                                    onComplete={handleActivitySubmit}
                                    onConsumeHint={onUseHint}
                                    disabled={feedbackStatus !== "idle"}
                                  />
                                )}
                                {currentActivity.type === "BUILDING_BLOCKS" && (
                                  <BuildingBlocksActivity
                                    ref={activityRef}
                                    data={currentActivity.data}
                                    onComplete={handleActivitySubmit}
                                    onConsumeHint={onUseHint}
                                    disabled={feedbackStatus !== "idle"}
                                  />
                                )}
                                {currentActivity.type === "MATCHING" && (
                                  <MatchingActivity
                                    ref={activityRef}
                                    data={currentActivity.data}
                                    onComplete={handleActivitySubmit}
                                    onConsumeHint={onUseHint}
                                    disabled={feedbackStatus !== "idle"}
                                  />
                                )}
                              </CardContent>
                            </Card>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-6 py-12">
                        <Loader2 className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
                      </div>
                    )}
                  </>
                ) : (
                  <AdventureResults
                    stats={{
                      timeSeconds: finalTime,
                      accuracy:
                        originalQuestionCount > 0
                          ? Math.max(
                              0,
                              Math.round(
                                ((originalQuestionCount - mistakesSet.size) /
                                  originalQuestionCount) *
                                  100,
                              ),
                            )
                          : 100,
                      totalQuestions: originalQuestionCount,
                    }}
                    rewards={{
                      xp: chapter.xp_reward || 50,
                      coins: Math.floor((chapter.xp_reward || 50) / 2),
                    }}
                    onContinue={() => onComplete(finalTime)}
                  />
                )}
              </div>

              {/* --- FEEDBACK FOOTER --- */}
              <AnimatePresence>
                {feedbackStatus !== "idle" && !showGameOver && (
                  <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                      "absolute bottom-0 left-0 right-0 p-6 border-t-2 z-50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl",
                      feedbackStatus === "correct"
                        ? "bg-green-100 border-green-200 dark:bg-green-950/90 dark:border-green-900"
                        : "bg-red-100 border-red-200 dark:bg-red-950/90 dark:border-red-900",
                    )}
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex shrink-0 items-center justify-center border-4 bg-white",
                          feedbackStatus === "correct"
                            ? "border-green-500 text-green-600"
                            : "border-red-500 text-red-600",
                        )}
                      >
                        {feedbackStatus === "correct" ? (
                          <Check className="w-8 h-8 stroke-[3]" />
                        ) : (
                          <X className="w-8 h-8 stroke-[3]" />
                        )}
                      </div>
                      <div className="text-left">
                        <h3
                          className={cn(
                            "text-2xl font-black",
                            feedbackStatus === "correct"
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400",
                          )}
                        >
                          {feedbackStatus === "correct"
                            ? chapter.isTutorial
                              ? "✅ This is what CORRECT looks like!"
                              : "Nice job!"
                            : chapter.isTutorial
                            ? "❌ This is what WRONG looks like!"
                            : "Incorrect"}
                        </h3>
                        {feedbackStatus === "wrong" && (
                          <p className="text-red-600 dark:text-red-300 text-sm font-medium">
                            {chapter.isTutorial
                              ? "No hearts lost in tutorial — try again!"
                              : "Don't worry, keep going!"}
                          </p>
                        )}
                        {feedbackStatus === "correct" && chapter.isTutorial && (
                          <p className="text-green-600 dark:text-green-300 text-sm font-medium">
                            Tap CONTINUE to move on. In real chapters you earn
                            XP!
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleContinue}
                      size="lg"
                      className={cn(
                        "w-full sm:w-auto min-w-[150px] font-black text-lg h-12 border-b-4 active:border-b-0 active:translate-y-1 transition-all",
                        feedbackStatus === "correct"
                          ? "bg-green-500 hover:bg-green-600 text-white border-green-700 shadow-green-900/20"
                          : "bg-red-500 hover:bg-red-600 text-white border-red-700 shadow-red-900/20",
                      )}
                    >
                      CONTINUE
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// --- MAIN PAGE ---
export default function AdventurePage() {
  const navigate = useNavigate();
  const { user, syncUser, refreshUser, updateProfile } = useAuth();
  const { grantXP } = useGameProgress();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { hearts, timeRemaining, buyHearts } = useHeartSystem();

  const [lessons, setLessons] = useState<any[]>([]);
  const [sideQuestMap, setSideQuestMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [maxCompletedOrder, setMaxCompletedOrder] = useState(0);
  // Track if we entered via a URL param (from the classroom page), so we can
  // navigate back there after completing/closing a special quest.
  const [returnToClassroom, setReturnToClassroom] = useState(false);

  const { playSound } = useGameSound();
  const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);

  const [stats, setStats] = useState({
    level: 1,
    completed_chapters: 0,
    total_chapters: 0,
    total_runtime: 0,
    rank: 0 as number | string,
  });

  // ✅ New State for Completion Modal
  const [showCelebration, setShowCelebration] = useState(false);
  const [adventureStats, setAdventureStats] = useState({
    averageAccuracy: 0,
    isClaimed: false,
  });

  // Keep track of mistakes in the parent so we can calculate accuracy at the end
  const [mistakesSet, setMistakesSet] = useState<Set<number>>(new Set());
  const [hintsUsedCount, setHintsUsedCount] = useState(0); // ADDED

  const [inventory, setInventory] = useState<any[]>([]);

  // const [rewardData, setRewardData] = useState<any>(null); // Removed RewardData state as RewardModal is processed
  const [showRegressConfirm, setShowRegressConfirm] = useState(false);

  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  // --- TOUR STATE ---
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMainTour, setShowMainTour] = useState(false);

  useEffect(() => {
    if (user && !loading && lessons.length > 0) {
      const isManualTrigger = searchParams.get("tour") === "true";
      const hasSeenTour =
        user?.claimedTutorials?.includes("adventureTab") ||
        user.settings?.tutorials?.adventureTab;

      if (isManualTrigger) {
        setShowMainTour(true);
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("tour");
          return newParams;
        });
      } else if (!hasSeenTour) {
        // Delay to allow scroll to active node
        const timer = setTimeout(() => setShowMainTour(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, lessons.length, searchParams, setSearchParams]);

  // ✅ Check hearts BEFORE entering lesson (tutorial chapters bypass this)
  const handleNodeClick = (chapter: any) => {
    if (chapter.isTutorial) {
      // Tutorial: always accessible, no hearts needed
      setMistakesSet(new Set());
      setHintsUsedCount(0);
      setSelectedChapter(chapter);
      return;
    }
    if (hearts > 0) {
      // Reset mistakes when starting a new lesson
      setMistakesSet(new Set());
      setHintsUsedCount(0); // Reset hints
      setSelectedChapter(chapter);
    } else {
      playSound("gameover");
      setShowNoHeartsModal(true);
    }
  };

  const loadAdventureProgress = useCallback(async () => {
    if (!user) return;

    try {
      // setLoading(true); // <--- REMOVED to prevent flicker on refresh

      // 1. Fetch User Stats (Including new adventure_rewards_claimed)
      const { data: userStats, error: statsError } = await supabase
        .from("users")
        .select(
          "level, xp, completed_chapters, hints, streak_freezes, total_runtime, adventure_rewards_claimed, classroom_id",
        )
        .eq("id", user.uid)
        .single();

      if (statsError) console.error("Error fetching stats:", statsError);

      // 2. Fetch Match History to Calculate Average Accuracy
      const { data: history } = await supabase
        .from("match_history")
        .select("results")
        .eq("user_id", user.uid)
        .ilike("mode", "Adventure%");

      let totalAccuracy = 0;
      let count = 0;

      if (history && history.length > 0) {
        history.forEach((match) => {
          // Assume first result is the user's
          const result = match.results?.[0];
          if (result && result.accuracy) {
            const accNum = parseInt(
              result.accuracy.toString().replace("%", ""),
              10,
            );
            if (!isNaN(accNum)) {
              totalAccuracy += accNum;
              count++;
            }
          }
        });
      }
      const avgAccuracy = count > 0 ? Math.round(totalAccuracy / count) : 0;

      setAdventureStats({
        averageAccuracy: avgAccuracy,
        isClaimed: userStats?.adventure_rewards_claimed || false,
      });

      // --- CALCULATE RANK (Match Leaderboard Logic) ---
      let rank: number | string = 0;
      const restrictedRoles = ["superadmin", "admin", "instructor"];
      const currentRuntime = userStats?.total_runtime || 0;

      // Only calculate rank if user is valid and has played
      if (!restrictedRoles.includes(user.role || "") && currentRuntime > 0) {
        // Fetch top 1000 users for client-side sorting
        const { data: allUsers } = await supabase
          .from("users")
          .select("id, xp, total_runtime, completed_chapters")
          .eq("role", "user")
          .gt("total_runtime", 0)
          .limit(1000);

        if (allUsers) {
          // Client-side Sort: Chapters (DESC) -> Time (ASC) -> XP (DESC) -> ID (ASC)
          allUsers.sort((a, b) => {
            const chaptersA = a.completed_chapters?.length || 0;
            const chaptersB = b.completed_chapters?.length || 0;
            if (chaptersA !== chaptersB) return chaptersB - chaptersA;

            const timeA = a.total_runtime || 999999999;
            const timeB = b.total_runtime || 999999999;
            if (timeA !== timeB) return timeA - timeB;

            if (a.xp !== b.xp) return (b.xp || 0) - (a.xp || 0);

            return a.id.localeCompare(b.id);
          });

          // Find user index
          const index = allUsers.findIndex((u) => u.id === user.uid);
          if (index !== -1) {
            rank = index + 1;
          } else {
            rank = "1000+"; // User not in top 1000
          }
        }
      }

      // 3a. Fetch core lessons (always) + classroom-scoped side quests
      const { data: coreDbLessons, error: lessonsError } = await supabase
        .from("lessons")
        .select(
          "id, title, slug, description, content_markdown, xp_reward, order_index, activity_type, is_core_node, parent_lesson_id",
        )
        .eq("is_core_node", true)
        .order("order_index", { ascending: true });

      if (lessonsError) console.error("Error fetching lessons:", lessonsError);

      // 3b. Fetch side quests only for this student's classroom
      const studentClassroomId = userStats?.classroom_id ?? null;
      let dbSideQuests: any[] = [];
      if (studentClassroomId) {
        const { data: sqData } = await supabase
          .from("lessons")
          .select(
            "id, title, slug, description, content_markdown, xp_reward, order_index, activity_type, is_core_node, parent_lesson_id, classroom_id",
          )
          .eq("is_core_node", false)
          .eq("classroom_id", studentClassroomId);
        dbSideQuests = sqData ?? [];
      }

      const totalChapters = (coreDbLessons ?? []).length || 0;
      const completedChaptersArray = userStats?.completed_chapters || [];
      const safeCoreDbLessons = coreDbLessons ?? [];

      // 3b. Fetch all activities for the fetched lessons
      let activitiesMap: Record<string, any[]> = {};
      const allDbLessons: any[] = [...safeCoreDbLessons, ...dbSideQuests];
      if (allDbLessons.length > 0) {
        const lessonIds = allDbLessons.map((l: any) => l.id);
        const { data: dbActivities, error: actErr } = await supabase
          .from("activities")
          .select("id, lesson_id, type, prompt, data")
          .in("lesson_id", lessonIds);

        if (actErr) console.error("Error fetching activities:", actErr);
        if (dbActivities) {
          dbActivities.forEach((a) => {
            if (!activitiesMap[a.lesson_id]) activitiesMap[a.lesson_id] = [];
            activitiesMap[a.lesson_id].push({
              ...a,
              data: typeof a.data === "string" ? JSON.parse(a.data) : a.data,
            });
          });
        }
      }

      let maxOrder = 0;
      if (safeCoreDbLessons.length > 0) {
        const completedDbLessons = safeCoreDbLessons.filter((l) =>
          completedChaptersArray.includes(l.id),
        );
        if (completedDbLessons.length > 0) {
          maxOrder = Math.max(...completedDbLessons.map((l) => l.order_index));
        }
      }
      setMaxCompletedOrder(maxOrder);

      // --- BUILD SIDE QUEST MAP (parent_lesson_id → side quest list) ---
      // User requested Side Quests appear only in the Classroom tab, so we hide them from the map.
      setSideQuestMap({});

      if (userStats) {
        setStats({
          level: userStats.level || 1,
          completed_chapters: completedChaptersArray.length,
          total_chapters: totalChapters,
          total_runtime: userStats.total_runtime || 0,
          rank: rank,
        });

        const items = [
          {
            name: "Hint",
            quantity: userStats.hints || 0,
            icon: Lightbulb,
            color: "text-yellow-500",
            description:
              "Reveals part of the answer or removes a wrong option.",
          },
          {
            name: "Streak Freeze",
            quantity: userStats.streak_freezes || 0,
            icon: Snowflake,
            color: "text-blue-500",
            description:
              "Prevents you from losing your streak if you miss a day.",
          },
        ];
        setInventory(items.filter((i) => i.quantity > 0));
      }

      // Merge CHAPTER_VISUALS (icons/colors) with full DB core lesson content
      const mergedLessons = CHAPTER_VISUALS.map((visual) => {
        const dbLesson = safeCoreDbLessons?.find(
          (l) => l.order_index === visual.id,
        );

        const isCompleted = dbLesson
          ? completedChaptersArray.includes(dbLesson.id)
          : false;

        return {
          ...visual,
          id: dbLesson?.id || visual.id,
          title: dbLesson?.title || `Chapter ${visual.id}`,
          description: dbLesson?.description || "",
          content_markdown: dbLesson?.content_markdown || "",
          xp_reward: dbLesson?.xp_reward || 50,
          activities: dbLesson ? activitiesMap[dbLesson.id] || [] : [],
          order_index: visual.id,
          activityType: dbLesson?.activity_type || visual.activityLabel,
          isCompleted: isCompleted,
        };
      });

      // --- BUILD CHAPTER 0 TUTORIAL NODE ---
      const isChapter0Done =
        user?.claimedTutorials?.includes("adventureChapter0") ||
        user.settings?.tutorials?.adventureChapter0 === true;
      const chapter0 = {
        ...CHAPTER_0_VISUAL,
        ...CHAPTER_0_LESSON,
        order_index: 0,
        activityType: CHAPTER_0_VISUAL.activityLabel,
        isCompleted: isChapter0Done,
      };

      // Prepend Chapter 0 so it always renders first
      setLessons([chapter0, ...mergedLessons]);

      // --- AUTO START LESSON IF lessonId IS IN URL ---
      // Only auto-start on the FIRST load (i.e. when the URL still has the param).
      // We clear the param immediately so that subsequent calls to loadAdventureProgress
      // (e.g. after the lesson completes) do NOT re-open the quest.
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const targetLessonId = urlParams.get("lessonId");
        if (targetLessonId) {
          // Clear the param from the URL without a full page reload
          urlParams.delete("lessonId");
          const newSearch = urlParams.toString();
          const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
          window.history.replaceState({}, "", newUrl);

          const found = allDbLessons.find((l: any) => l.id === targetLessonId);
          if (found) {
            const processedFound = {
              ...found,
              activities: activitiesMap[found.id] || [],
              isSideQuest: found.is_core_node === false,
            };
            setSelectedChapter(processedFound);
            // Remember that we came from the classroom page
            setReturnToClassroom(true);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load adventure progress:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAdventureProgress();
  }, [loadAdventureProgress]);

  const hasAutoScrolled = useRef(false);

  useEffect(() => {
    if (hasAutoScrolled.current) return;
    const timer = setTimeout(() => {
      if (!loading && lessons.length > 0) {
        const activeNode = document.getElementById("active-chapter-node");
        if (activeNode) {
          activeNode.scrollIntoView({ behavior: "smooth", block: "center" });
          hasAutoScrolled.current = true;
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [loading, lessons]);

  const handleConsumeHint = async (): Promise<boolean> => {
    if (!user) return false;

    const hintItem = inventory.find((i) => i.name === "Hint");
    if (!hintItem || hintItem.quantity <= 0) {
      toast.error("No hints left! Visit the shop.");
      return false;
    }

    const newQuantity = hintItem.quantity - 1;
    setInventory((prev) =>
      prev.map((i) =>
        i.name === "Hint" ? { ...i, quantity: newQuantity } : i,
      ),
    );
    setHintsUsedCount((prev) => prev + 1); // Track usage

    const { error } = await supabase
      .from("users")
      .update({ hints: newQuantity })
      .eq("id", user.uid);

    if (error) {
      setInventory((prev) =>
        prev.map((i) =>
          i.name === "Hint" ? { ...i, quantity: hintItem.quantity } : i,
        ),
      );
      toast.error("Failed to use hint.");
      return false;
    }

    return true;
  };

  const handleRegress = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        completed_chapters: [],
        total_runtime: 0,
        adventure_rewards_claimed: false, // Reset rewards claim too
      })
      .eq("id", user.uid);

    if (error) {
      toast.error("Failed to regress.");
      return;
    }

    setStats((prev) => ({ ...prev, completed_chapters: 0, total_runtime: 0 }));
    setAdventureStats((prev) => ({ ...prev, isClaimed: false })); // Reset local state
    setMaxCompletedOrder(0);
    setLessons((prev) => prev.map((l) => ({ ...l, isCompleted: false })));
    setShowRegressConfirm(false);
    refreshUser(); // ✅ Refresh global stats
    toast.success("Adventure Reset! Good luck speedrunning.");
  };

  // ✅ ONE-TIME CLAIM FUNCTION
  const handleClaimGrandPrize = async () => {
    if (!user) return;
    try {
      // Update DB
      const { error } = await supabase
        .from("users")
        .update({
          adventure_rewards_claimed: true,
          coins: (user.coins || 0) + 500,
          xp: (user.xp || 0) + 1000,
        })
        .eq("id", user.uid);

      if (error) throw error;

      // Update Local State
      setAdventureStats((prev) => ({ ...prev, isClaimed: true }));
      syncUser({
        ...user,
        coins: (user.coins || 0) + 500,
        xp: (user.xp || 0) + 1000,
      });
      refreshUser(); // ✅ Refresh global stats

      toast.success("🏆 Grand Prize Claimed!");
    } catch (err) {
      console.error("Claim error:", err);
      toast.error("Failed to claim rewards.");
    }
  };

  const recordChapterCompletion = async (
    coinsEarned: number,
    lessonId: string,
    timeTaken: number,
  ) => {
    if (!user) return;

    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("coins, completed_chapters, total_runtime, badges")
      .eq("id", user.uid)
      .single();

    if (fetchError || !userData) return;

    const currentChapters: string[] = userData.completed_chapters || [];
    const isReplay = currentChapters.includes(lessonId);
    let updatedChapters = [...currentChapters];

    if (!isReplay) {
      updatedChapters.push(lessonId);
    }

    let currentTotalTime = userData.total_runtime || 0;
    let newTotalTime = currentTotalTime;

    if (isReplay) {
      const { data: oldProgress } = await supabase
        .from("user_lesson_progress")
        .select("completion_time")
        .eq("user_id", user.uid)
        .eq("lesson_id", lessonId)
        .single();

      const oldTime = oldProgress?.completion_time || 0;
      newTotalTime = Math.max(0, currentTotalTime - oldTime) + timeTaken;
    } else {
      newTotalTime = currentTotalTime + timeTaken;
    }

    let currentBadges = userData.badges || [];
    let badgeUnlocked = false;
    const BADGE_NAME = "Adventure Champion";
    const realChaptersCount = lessons.filter((l) => !l.isTutorial).length;

    if (updatedChapters.length >= realChaptersCount && realChaptersCount > 0) {
      if (!currentBadges.includes(BADGE_NAME)) {
        currentBadges.push(BADGE_NAME);
        badgeUnlocked = true;
      }
    }

    const newCoins = (userData.coins || 0) + coinsEarned;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        coins: newCoins,
        completed_chapters: updatedChapters,
        total_runtime: newTotalTime,
        badges: currentBadges,
      })
      .eq("id", user.uid);

    if (!updateError) {
      setStats((prev) => ({
        ...prev,
        completed_chapters: updatedChapters.length,
        total_runtime: newTotalTime,
        badges: currentBadges,
      }));

      setLessons((prevLessons) =>
        prevLessons.map((l) => {
          if (l.id === lessonId) return { ...l, isCompleted: true };
          return l;
        }),
      );

      // Also mark completed in sideQuestMap (if it was a side quest)
      setSideQuestMap((prev) => {
        const updated = { ...prev };
        for (const pid in updated) {
          updated[pid] = updated[pid].map((sq) =>
            sq.id === lessonId ? { ...sq, isCompleted: true } : sq,
          );
        }
        return updated;
      });

      const justCompletedLesson = lessons.find((l) => l.id === lessonId);
      if (
        justCompletedLesson &&
        justCompletedLesson.order_index > maxCompletedOrder
      ) {
        setMaxCompletedOrder(justCompletedLesson.order_index);
      }

      if (badgeUnlocked) {
        toast.success("🏆 BADGE UNLOCKED: Adventure Champion!", {
          style: {
            border: "2px solid #EAB308",
            backgroundColor: "#FEF9C3",
            color: "#854D0E",
          },
        });
      }
    }
  };

  const currentChapterIndex = maxCompletedOrder + 1;
  const maxLineHeight =
    Math.max(0, lessons.length - 1) * (NODE_HEIGHT + NODE_GAP) +
    NODE_HEIGHT / 2;

  // Chapter 0 (tutorial) is at visual slot 0 — it doesn't count toward real chapter progress.
  // Real chapters start at visual slot 1. We light the line from Ch0 → completed real chapters.
  // After Ch0 is done, the line lights up from the top (Ch0 node center) down through
  // each completed real chapter.
  const isChapter0Complete = lessons[0]?.isCompleted === true;
  const completedRealChapterCount = lessons.filter(
    (l, i) => i > 0 && l.isCompleted,
  ).length;

  // Visual slot 0 = Ch0 (tutorial), slot 1 = Ch1, ... slot N = ChN.
  // The line reaches the center of the CURRENT chapter node
  // (i.e. the first non-completed chapter the player is working on).
  // currentSlot = 0 → tutorial is their current; +1 for each completed real chapter.
  const currentSlot = !isChapter0Complete
    ? 0 // Tutorial not done yet — current is Ch0
    : completedRealChapterCount + 1; // Tutorial done → current is Ch(completedReal+1)

  const calculatedProgress =
    currentSlot * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2;

  const progressHeight = Math.min(calculatedProgress, maxLineHeight);

  const realChaptersCount = lessons.filter((l) => !l.isTutorial).length;
  const isAdventureFinished =
    stats.completed_chapters >= realChaptersCount && realChaptersCount > 0;

  // Auto-scroll to bottom on finish
  useEffect(() => {
    if (isAdventureFinished) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 1000);
    }
  }, [isAdventureFinished]);

  const handleChapterComplete = async (timeTaken: number) => {
    try {
      if (!selectedChapter || !user) return;

      // --- TUTORIAL CHAPTER: Skip all DB writes ---
      if (selectedChapter.isTutorial) {
        const chapter = selectedChapter;
        setSelectedChapter(null); // Close UI immediately

        const currentSettings = user.settings || {};
        await updateProfile({
          settings: {
            ...currentSettings,
            tutorials: {
              ...currentSettings.tutorials,
              adventureChapter0: true,
            },
          },
        });

        // Refresh so Chapter 0 shows as completed and Chapter 1 unlocks
        await loadAdventureProgress();
        refreshUser();
        return;
      }

      // Capture whether we should return to the classroom page BEFORE closing the chapter
      const wasFromClassroom = returnToClassroom && selectedChapter.isSideQuest;

      // 1. Capture Data & CLOSE MODAL IMMEDIATELY
      // We close the modal first to prevent "Article View" glitch and make it snappy.
      const chapter = selectedChapter;
      setSelectedChapter(null); // <--- Close UI

      const xpEarned = chapter.xp_reward || 50;
      const coinsEarned = Math.floor(xpEarned / 2);

      grantXP(xpEarned);

      // 2. Calculate Accuracy for History
      const totalQuestions = chapter.activities?.length || 0;
      const correctAnswers = Math.max(0, totalQuestions - mistakesSet.size);
      const accuracy =
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 100;

      // --- QUEST TRACKING ---
      // 1. Quiz Master: Answer questions correctly
      if (correctAnswers > 0) {
        await trackQuestEvent(user.uid, "quiz_answers", correctAnswers);
      }

      // 2. Scholar: 100% Accuracy
      if (accuracy === 100) {
        await trackQuestEvent(user.uid, "perfect_quizzes", 1);
      }

      // 3. Speed Runner: Complete < 60s
      if (timeTaken < 60) {
        await trackQuestEvent(user.uid, "speed_runs", 1);
      }

      // 4. Steady Hand: No Hints used
      if (hintsUsedCount === 0) {
        await trackQuestEvent(user.uid, "levels_without_hints", 1);
      }
      // ----------------------

      // 3. Record to Match History
      // 3. Record to Match History
      const modePrefix = chapter.isSideQuest ? "Special Quest" : "Adventure";
      await supabase.from("match_history").insert({
        mode: `${modePrefix}: ${chapter.title}`,
        played_at: new Date().toISOString(),
        winner_name: user.displayName || "Player",
        participants_count: 1,
        user_id: user.uid,
        duration_seconds: timeTaken,
        results: [
          {
            rank: 1,
            name: user.displayName || "Player",
            score: xpEarned,
            accuracy: `${accuracy}%`,
            time: timeTaken,
          },
        ],
      });

      // 4. Update Course/Quest specific progress tracking
      // We upsert into user_lesson_progress so the instructor can see detailed stats
      await supabase.from("user_lesson_progress").upsert({
        user_id: user.uid,
        lesson_id: chapter.id,
        status: "completed",
        completion_time: timeTaken,
        wrong_count: mistakesSet.size,
        total_questions: totalQuestions,
        created_at: new Date().toISOString(),
      }, { onConflict: "user_id,lesson_id" });

      await recordChapterCompletion(coinsEarned, chapter.id, timeTaken);

      console.log(
        "[AdventureDebug] Lesson Complete. Calling calculateStreakUpdate...",
      );
      // ... (Streak Logic - CENTRALIZED) ...
      const streakResult = calculateStreakUpdate(user);
      console.log("[AdventureDebug] Streak Result:", streakResult);

      // We always use the new streak value, whether it updated or not
      const newStreak = streakResult.newStreak;

      // If we need to update DB (streak changed or day added)
      if (streakResult.shouldUpdate) {
        syncUser({
          ...user,
          streaks: streakResult.newStreak,
          activeDates: streakResult.newActiveDates,
          streakFreezes: streakResult.newFreezes,
          frozenDates: streakResult.newFrozenDates,
          coins: streakResult.newCoins,
        });

        await supabase
          .from("users")
          .update({
            streaks: streakResult.newStreak,
            active_dates: streakResult.newActiveDates,
            streak_freezes: streakResult.newFreezes,
            frozen_dates: streakResult.newFrozenDates,
          })
          .eq("id", user.uid);
      }


      // Finally refresh stats in background
      await loadAdventureProgress();
      refreshUser();

      // If the student launched this special quest from the classroom page,
      // send them back there after completion.
      if (wasFromClassroom) {
        setReturnToClassroom(false);
        navigate("/play/classroom");
      }
    } catch (err: any) {
      console.error("[Adventure] Critical Error:", err);
      alert(
        "❌ Critical Error completing lesson: " + (err.message || String(err)),
      );
    }
  };

  if (loading) {
    if (searchParams.get("lessonId")) {
      return <ArticleSkeleton />;
    }
    return <AdventureSkeleton />;
  }

  const MAIN_TOUR_STEPS: TourStep[] = [
    {
      target: "chapter-0-node",
      title: "🗺️ Welcome to C# Adventure!",
      content:
        "This is your learning roadmap — a path of chapters that guide you from complete beginner to C# Architect. Each glowing node is a chapter. Start with Chapter 0!",
    },
    {
      target: "chapter-0-node",
      title: "📖 Chapter 0 — Your Tutorial",
      content:
        "This amber node is Chapter 0 — a FREE tutorial that teaches you exactly how adventures work. It explains the heart system, activity types, and feedback. Click it to begin!",
    },
    {
      target: "active-chapter-node",
      title: "⚡ Your Next Chapter",
      content:
        "After finishing the tutorial, this pulsing node unlocks as your next real challenge. Each chapter has a reading article + 3 types of activities. Complete it to advance!",
      position: "top",
    },
    {
      target: "tour-chapter-card",
      title: "📚 Chapter Info & Rewards",
      content:
        "Each chapter card shows the chapter title, a short lore description, and the XP + Coins you’ll earn for completing it. The more advanced the chapter, the bigger the reward!",
      position: "top",
    },
    {
      target: "tour-runtime, tour-runtime-mobile",
      title: "⏱️ Your Adventure Timer",
      content:
        "This tracks your total playtime across all chapters. The leaderboard ranks players by how many chapters they've completed — and the fastest times win! Try to improve your speed each run.",
    },
    {
      target: "tour-rank",
      title: "🏅 Your Rank",
      content:
        "This is your current leaderboard rank among all players. Rank is determined by completed chapters first, then by total time. The fewer minutes you take, the higher you climb!",
    },
    {
      target: "tour-hearts-stats",
      title: "❤️ Hearts — Your Lives",
      content:
        "You lose a heart every time you answer wrong. If you run out, you'll need to wait for regeneration or spend coins to refill. Keep an eye on them during challenges!",
    },
    {
      target: "tour-backpack",
      title: "🎒 Backpack — Your Items",
      content:
        "Tap this to see your items. Hints let you remove wrong options during a quiz. Streak Freezes protect your daily streak. Earn them by completing challenges!",
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <OnboardingTour
        steps={MAIN_TOUR_STEPS}
        isOpen={showMainTour}
        onComplete={() => setShowMainTour(false)}
        onSkip={() => setShowMainTour(false)}
        avatarConfig={user?.avatarConfig}
        tutorialId="adventureTab"
      />

      {/* 2. Regress Confirm */}
      <RegressModal
        open={showRegressConfirm}
        onClose={() => setShowRegressConfirm(false)}
        onConfirm={handleRegress}
      />
      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
      />
      {/* 3. Grand Prize Celebration */}
      <AdventureCompletedCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        onClaim={handleClaimGrandPrize}
        stats={{
          totalRuntime: stats.total_runtime,
          averageAccuracy: adventureStats.averageAccuracy,
          isClaimed: adventureStats.isClaimed,
        }}
      />

      <AnimatePresence>
        {showNoHeartsModal && (
          <GameOverOverlay
            onRefill={async () => {
              await buyHearts();
              setShowNoHeartsModal(false);
            }}
            onClose={() => setShowNoHeartsModal(false)}
            timeRemaining={timeRemaining}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!selectedChapter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto space-y-8 pb-24"
          >
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  className="w-fit -ml-4 text-muted-foreground hover:text-foreground"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>

                {/* --- BUTTONS AREA --- */}
                <div className="flex gap-2">
                  {/* REMOVED: Grand Prize Button from here to fix overflow */}

                  {isAdventureFinished && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowRegressConfirm(true)}
                    >
                      <RotateCcw className="w-4 h-4" /> Regress
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl">
                    <MapIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-foreground">
                      C# Adventure
                    </h1>
                    <p className="text-muted-foreground">
                      Your journey from Novice to Architect.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-start md:justify-end gap-3 sm:gap-4 w-full md:w-auto mt-6 md:mt-0">
                  {/* Action Icons Group */}
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-10 h-10 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 shrink-0"
                            onClick={() => setShowMainTour(true)}
                          >
                            <MapIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Replay adventure tour</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full w-10 h-10 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800 shrink-0"
                            onClick={() => setIsBugReportOpen(true)}
                          >
                            <Bug className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Report a bug</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <div id="tour-backpack" className="shrink-0">
                      <TooltipProvider>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full w-10 h-10 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800"
                            >
                              <Backpack className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64">
                            <DropdownMenuLabel>Backpack</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {inventory.length > 0 ? (
                              inventory.map((item, idx) => (
                                <DropdownMenuItem
                                  key={idx}
                                  className="flex justify-between cursor-pointer py-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={cn(
                                        "p-1 rounded-md bg-secondary",
                                        item.color,
                                      )}
                                    >
                                      <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">
                                      {item.name}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="h-5 px-1.5 font-bold"
                                  >
                                    {item.quantity}x
                                  </Badge>
                                </DropdownMenuItem>
                              ))
                            ) : (
                              <div className="p-4 text-sm text-muted-foreground text-center">
                                Your backpack is empty.
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Stats Group: Rank, Time, Hearts */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div id="tour-rank" className="shrink-0">
                      <RankBadge rank={stats.rank as number | string} />
                    </div>

                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          {/* Desktop runtime badge */}
                          <div
                            id="tour-runtime"
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full font-bold border border-blue-500/20 cursor-default shrink-0"
                          >
                            <Clock className="w-4 h-4 text-blue-600" />
                            {formatRuntime(stats.total_runtime)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total Adventure Time</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Mobile runtime badge — mirrors desktop, visible only on mobile */}
                    <div
                      id="tour-runtime-mobile"
                      className="flex md:hidden items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-full font-bold border border-blue-500/20 cursor-default shrink-0 text-xs"
                    >
                      <Clock className="w-3 h-3 text-blue-600" />
                      {formatRuntime(stats.total_runtime)}
                    </div>

                    <div className="flex shrink-0" id="tour-hearts-stats">
                      <HeartDropdown
                        hearts={hearts}
                        timeRemaining={timeRemaining}
                        buyHearts={buyHearts}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-full mt-12">
              <div
                className="absolute top-0 left-8 md:left-1/2 -translate-x-1/2 w-2 bg-muted rounded-full"
                style={{ height: maxLineHeight }}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: progressHeight }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute top-0 left-8 md:left-1/2 -translate-x-1/2 w-2 bg-gradient-to-b from-green-400 to-green-600 rounded-full z-0 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
              />
              <div className="relative z-10 flex flex-col gap-8">
                {lessons.map((chapter, index) => {
                  let status: "locked" | "current" | "completed" = "locked";
                  const isChapter0 = chapter.isTutorial === true;
                  const isChapter0Done = lessons[0]?.isCompleted === true;

                  if (isChapter0) {
                    // Chapter 0: completed or current (never locked)
                    status = chapter.isCompleted ? "completed" : "current";
                  } else {
                    // Real chapters: locked until tutorial is done
                    if (!isChapter0Done) {
                      status = "locked";
                    } else {
                      // Normal unlock logic for real chapters
                      const level = index; // index=1 → Chapter 1 (order_index 1)
                      if (chapter.isCompleted) status = "completed";
                      else if (level === maxCompletedOrder + 1)
                        status = "current";
                    }
                  }

                  const nodeId = isChapter0
                    ? "chapter-0-node"
                    : status === "current" || (!isChapter0Done && index === 1)
                    ? "active-chapter-node"
                    : undefined;

                  // Always give the first non-tutorial chapter its card tour ID
                  // so step 3 can spotlight it regardless of locked/current status
                  const cardId =
                    !isChapter0 && index === 1
                      ? "tour-chapter-card"
                      : undefined;

                  const attachedSideQuests: any[] =
                    sideQuestMap[chapter.id] ?? [];

                  return (
                    <div
                      key={chapter.id ?? `chapter-${index}`}
                      className="relative"
                    >
                      <RoadmapNode
                        id={nodeId}
                        cardId={cardId}
                        chapter={chapter}
                        status={status}
                        alignment={index % 2 === 0 ? "left" : "right"}
                        isAdventureComplete={isAdventureFinished}
                        onClick={() => handleNodeClick(chapter)}
                      />
                      {attachedSideQuests.map((sq) => (
                        <SideQuestNode
                          key={sq.id}
                          quest={sq}
                          parentCompleted={chapter.isCompleted}
                          onClick={() => handleNodeClick(sq)}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
              <div
                ref={bottomRef}
                className="flex flex-col items-center justify-center gap-6 mt-16 pl-0 md:pl-0 pb-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  className="w-28 h-28 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-xl z-10 relative"
                >
                  <Star className="w-14 h-14 text-yellow-600 fill-yellow-500" />

                  {/* Glowing Effect Behind */}
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full -z-10 animate-pulse" />
                </motion.div>

                {isAdventureFinished && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className={cn(
                        "gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 h-12 px-6 text-base font-bold shadow-md rounded-xl",
                        !adventureStats.isClaimed &&
                          "animate-bounce shadow-[0_0_15px_rgba(234,179,8,0.6)]",
                      )}
                      onClick={() => setShowCelebration(true)}
                    >
                      <Gift className="w-5 h-5" />
                      {adventureStats.isClaimed
                        ? "View Certificate"
                        : "Claim Prize"}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedChapter && (
          <FullScreenLesson
            chapter={selectedChapter}
            onClose={() => {
              setSelectedChapter(null);
              // If this special quest was opened from the classroom page, go back there
              if (returnToClassroom && selectedChapter?.isSideQuest) {
                setReturnToClassroom(false);
                navigate("/play/classroom");
              }
            }}
            onComplete={handleChapterComplete}
            inventory={inventory}
            onUseHint={handleConsumeHint}
            mistakesSet={mistakesSet}
            setMistakesSet={setMistakesSet}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
