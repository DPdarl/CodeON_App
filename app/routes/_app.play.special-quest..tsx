import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
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
  Loader2,
  X,
  Heart,
  Lightbulb,
  Snowflake,
  Clock,
  Zap,
  ArrowRight,
  Bug,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
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
import { trackQuestEvent } from "~/lib/quest-tracker";
import { useGameSound } from "~/hooks/useGameSound";
import { BugReportModal } from "~/components/playmodule/challenge/BugReportModal";
import { calculateStreakUpdate } from "~/lib/streak-logic";

// --- HELPER: Format Seconds ---
const formatRuntime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

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
            if (!isFull) buyHearts();
          }}
        >
          <Zap className="w-4 h-4 fill-white" />
          {isFull ? "Hearts are Full" : `Refill Full (${HEART_COST})`}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
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

// --- COMPONENT: GAME OVER OVERLAY ---
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
  }
> = {
  quiz: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-300 dark:border-blue-700",
    header: "bg-blue-600 dark:bg-blue-700",
    badge: "bg-blue-600 dark:bg-blue-700",
    icon: <ListChecks className="w-6 h-6 text-white" />,
  },
  blocks: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-300 dark:border-purple-700",
    header: "bg-purple-600 dark:bg-purple-700",
    badge: "bg-purple-600 dark:bg-purple-700",
    icon: <Zap className="w-6 h-6 text-white" />,
  },
  matching: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-700",
    header: "bg-emerald-600 dark:bg-emerald-700",
    badge: "bg-emerald-600 dark:bg-emerald-700",
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
                <span className="text-foreground font-medium leading-snug">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
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
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700/50 px-4 py-3">
          <p className="text-xs text-amber-900 dark:text-amber-300 font-semibold leading-relaxed">
            {tip}
          </p>
        </div>
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

// ============================================================================
// FULL SCREEN LESSON COMPONENT
// (Article view → Activity view → Results view, all self-contained)
// ============================================================================
function FullScreenLesson({
  chapter,
  onClose,
  onComplete,
  inventory,
  onUseHint,
  mistakesSet,
  setMistakesSet,
}: any) {
  const { user } = useAuth();
  const [step, setStep] = useState<"lesson" | "game">("lesson");
  const [isFinished, setIsFinished] = useState(false);
  const { playSound } = useGameSound();

  const [lessonQueue, setLessonQueue] = useState<any[]>([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [originalQuestionCount, setOriginalQuestionCount] = useState(0);

  useEffect(() => {
    if (chapter?.activities) {
      const queue = [...chapter.activities]
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
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
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

  const handleCloseAttempt = () => {
    if (step === "game" && !isFinished) {
      setShowExitConfirm(true);
    } else {
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
                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white">
                        ✨ Special Quest
                      </Badge>
                      {chapter.isCompleted && (
                        <Badge className="bg-green-500 text-white hover:bg-green-600">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                      {chapter.title}
                    </h1>
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
                        <h2 className="text-3xl font-black text-foreground">
                          No Activities Found
                        </h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          The instructor hasn't added any interactive activities
                          to this quest yet. Check back later!
                        </p>
                        <Button
                          onClick={handleCloseAttempt}
                          size="lg"
                          variant="outline"
                          className="mt-8 border-2 font-bold"
                        >
                          Return to Classroom
                        </Button>
                      </div>
                    ) : currentActivity ? (
                      <div
                        className="space-y-8"
                        key={currentActivityIndex}
                        id="tour-activity-area"
                      >
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
                            ? "Nice job!"
                            : "Incorrect"}
                        </h3>
                        {feedbackStatus === "wrong" && (
                          <p className="text-red-600 dark:text-red-300 text-sm font-medium">
                            Don't worry, keep going!
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

// ============================================================================
// MAIN PAGE — SpecialQuestPage
// Reads `lessonId` from ?lessonId=..., fetches that specific quest, and renders
// FullScreenLesson directly — no adventure map needed.
// ============================================================================
export default function SpecialQuestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, syncUser, refreshUser } = useAuth();
  const { grantXP } = useGameProgress();

  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [inventory, setInventory] = useState<any[]>([]);
  const [mistakesSet, setMistakesSet] = useState<Set<number>>(new Set());
  const [hintsUsedCount, setHintsUsedCount] = useState(0);

  const lessonId = searchParams.get("lessonId");

  // Fetch the single lesson + its activities
  useEffect(() => {
    if (!lessonId || !user?.uid) return;

    const load = async () => {
      setLoading(true);
      try {
        // Fetch lesson data
        const { data: lesson, error: lessonError } = await supabase
          .from("lessons")
          .select(
            "id, title, description, content_markdown, xp_reward, is_core_node",
          )
          .eq("id", lessonId)
          .single();

        if (lessonError || !lesson) {
          setNotFound(true);
          return;
        }

        // Fetch activities for this lesson
        const { data: activities } = await supabase
          .from("activities")
          .select("id, lesson_id, type, prompt, data")
          .eq("lesson_id", lessonId);

        const processedActivities = (activities || []).map((a) => ({
          ...a,
          data: typeof a.data === "string" ? JSON.parse(a.data) : a.data,
        }));

        // Check if already completed
        const { data: userData } = await supabase
          .from("users")
          .select("hints, streak_freezes, completed_chapters")
          .eq("id", user.uid)
          .single();

        const completedChapters: string[] = userData?.completed_chapters || [];

        setChapter({
          ...lesson,
          activities: processedActivities,
          isSideQuest: true,
          isCompleted: completedChapters.includes(lesson.id),
        });

        // Build inventory from user data
        const items = [
          {
            name: "Hint",
            quantity: userData?.hints || 0,
            icon: Lightbulb,
            color: "text-yellow-500",
            description:
              "Reveals part of the answer or removes a wrong option.",
          },
          {
            name: "Streak Freeze",
            quantity: userData?.streak_freezes || 0,
            icon: Snowflake,
            color: "text-blue-500",
            description:
              "Prevents you from losing your streak if you miss a day.",
          },
        ];
        setInventory(items.filter((i) => i.quantity > 0));
      } catch (err) {
        console.error("Failed to load special quest:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [lessonId, user?.uid]);

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
    setHintsUsedCount((prev) => prev + 1);
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

  const handleComplete = async (timeTaken: number) => {
    if (!user || !chapter) return;
    try {
      const xpEarned = chapter.xp_reward || 50;
      const coinsEarned = Math.floor(xpEarned / 2);
      const totalQuestions = chapter.activities?.length || 0;
      const correctAnswers = Math.max(0, totalQuestions - mistakesSet.size);
      const accuracy =
        totalQuestions > 0
          ? Math.round((correctAnswers / totalQuestions) * 100)
          : 100;

      grantXP(xpEarned);

      // Quest tracking
      if (correctAnswers > 0)
        await trackQuestEvent(user.uid, "quiz_answers", correctAnswers);
      if (accuracy === 100)
        await trackQuestEvent(user.uid, "perfect_quizzes", 1);
      if (timeTaken < 60) await trackQuestEvent(user.uid, "speed_runs", 1);
      if (hintsUsedCount === 0)
        await trackQuestEvent(user.uid, "levels_without_hints", 1);

      // Record to match history
      await supabase.from("match_history").insert({
        mode: `Special Quest: ${chapter.title}`,
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

      // Record progress
      await supabase.from("user_lesson_progress").upsert(
        {
          user_id: user.uid,
          lesson_id: chapter.id,
          status: "completed",
          completion_time: timeTaken,
          wrong_count: mistakesSet.size,
          total_questions: totalQuestions,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      );

      // Update coins
      const { data: userData } = await supabase
        .from("users")
        .select("coins, completed_chapters")
        .eq("id", user.uid)
        .single();

      if (userData) {
        const currentChapters: string[] = userData.completed_chapters || [];
        const updatedChapters = currentChapters.includes(chapter.id)
          ? currentChapters
          : [...currentChapters, chapter.id];

        await supabase
          .from("users")
          .update({
            coins: (userData.coins || 0) + coinsEarned,
            completed_chapters: updatedChapters,
          })
          .eq("id", user.uid);
      }

      // Streak update
      const streakResult = calculateStreakUpdate(user);
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

      refreshUser();
      navigate("/play/classroom");
    } catch (err: any) {
      console.error("[SpecialQuest] Error completing quest:", err);
      toast.error("Failed to save progress: " + (err.message || String(err)));
    }
  };

  const handleClose = () => {
    navigate("/play/classroom");
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading Special Quest…
          </p>
        </div>
      </div>
    );
  }

  // No lessonId / not found
  if (notFound || !chapter) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-black">Quest Not Found</h1>
          <p className="text-muted-foreground">
            This special quest could not be loaded. It may have been removed or
            you don't have access.
          </p>
          <Button onClick={() => navigate("/play/classroom")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Classroom
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <FullScreenLesson
        chapter={chapter}
        onClose={handleClose}
        onComplete={handleComplete}
        inventory={inventory}
        onUseHint={handleConsumeHint}
        mistakesSet={mistakesSet}
        setMistakesSet={setMistakesSet}
      />
    </AnimatePresence>
  );
}
