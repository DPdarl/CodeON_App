import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Lock,
  BookOpen,
  Star,
  Terminal,
  Code,
  Box,
  Cpu,
  Layers,
  PlayCircle,
  Braces,
  Database,
  AlertTriangle,
  X,
  ArrowRight,
  CheckCircle,
  Map as MapIcon,
  Gamepad2,
  Loader2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// --- LOGIC IMPORTS ---
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/contexts/AuthContext";
import { useGameProgress } from "~/hooks/useGameProgress";
import {
  QuizActivity,
  BuildingBlocksActivity,
  MatchingActivity,
} from "~/components/dashboardmodule/ActivityComponents";
import confetti from "canvas-confetti";

// --- CONSTANTS ---
const NODE_HEIGHT = 160;
const NODE_GAP = 32;

// --- VISUAL TEMPLATE (Keeps your UI style strict) ---
// We map DB data to these visual slots based on order_index
const CHAPTER_VISUALS = [
  {
    id: 1,
    icon: Terminal,
    color: "bg-blue-500",
    activityLabel: "Identify the Concept",
  },
  { id: 2, icon: Code, color: "bg-emerald-500", activityLabel: "Code Builder" },
  { id: 3, icon: Box, color: "bg-indigo-500", activityLabel: "Hybrid" },
  { id: 4, icon: Cpu, color: "bg-orange-500", activityLabel: "Math Ops Rush" },
  {
    id: 5,
    icon: Layers,
    color: "bg-purple-500",
    activityLabel: "Flow Control Runner",
  },
  {
    id: 6,
    icon: PlayCircle,
    color: "bg-pink-500",
    activityLabel: "Method Maker",
  },
  {
    id: 7,
    icon: Braces,
    color: "bg-cyan-500",
    activityLabel: "Object Creator",
  },
  {
    id: 8,
    icon: Database,
    color: "bg-teal-500",
    activityLabel: "Concept Match",
  },
  {
    id: 9,
    icon: Layers,
    color: "bg-yellow-500",
    activityLabel: "Predict the Output",
  },
  {
    id: 10,
    icon: AlertTriangle,
    color: "bg-red-500",
    activityLabel: "Exception Escape",
  },
];

// --- COMPONENT: ROADMAP NODE (Strictly your UI) ---
function RoadmapNode({ chapter, status, alignment, onClick }: any) {
  const Icon = chapter.icon;
  const isLocked = status === "locked";

  const cardVariants = {
    hidden: { opacity: 0, x: alignment === "left" ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { delay: 0.1 } },
  };

  return (
    <TooltipProvider delayDuration={100}>
      <motion.div
        className="relative w-full h-40"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* 1. Info Card */}
        <motion.div
          variants={cardVariants}
          className={cn(
            "absolute w-64 top-1/2 -translate-y-1/2",
            alignment === "left"
              ? "right-[calc(50%+5rem)]"
              : "left-[calc(50%+5rem)]"
          )}
        >
          <Card
            className={cn(
              "shadow-lg rounded-2xl transition-all border-2",
              !isLocked
                ? "hover:scale-105 cursor-pointer hover:border-indigo-400"
                : "opacity-60 grayscale border-dashed"
            )}
            onClick={!isLocked ? onClick : undefined}
          >
            <CardHeader className="pb-2 p-4">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="mb-2 text-[10px]">
                  Chapter {chapter.order_index}
                </Badge>
                {!isLocked && <BookOpen className="w-3 h-3 text-indigo-500" />}
              </div>
              <CardTitle className="text-base leading-tight">
                {chapter.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {chapter.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. Node Circle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              style={{ x: "-50%", y: "0%" }}
              whileHover={!isLocked ? { scale: 1.15 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              disabled={isLocked}
              onClick={onClick}
              className={cn(
                "absolute z-10 w-20 h-20 rounded-full flex items-center justify-center border-4 border-background transition-all",
                "left-1/2",
                isLocked
                  ? "bg-muted text-muted-foreground"
                  : cn(
                      chapter.color,
                      "text-white shadow-xl ring-4 ring-offset-4 ring-offset-background ring-indigo-500/20"
                    )
              )}
            >
              {status === "completed" ? (
                <Check className="w-8 h-8 stroke-[3]" />
              ) : isLocked ? (
                <Lock className="w-8 h-8" />
              ) : (
                <Icon className="w-8 h-8" />
              )}

              {status === "current" && (
                <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white" />
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side={alignment === "left" ? "right" : "left"}>
            <p>{chapter.activityType}</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </TooltipProvider>
  );
}

// --- COMPONENT: LESSON OVERLAY (Logic Injected into your UI) ---
function LessonOverlay({ chapter, onClose, onComplete }: any) {
  const [step, setStep] = useState<"lesson" | "game">("lesson");

  // Game Logic
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Use DB activities or fallback to empty array
  const activities = chapter.activities || [];
  const currentActivity = activities[currentActivityIndex];

  const handleActivitySuccess = (success: boolean) => {
    if (!success) return;

    if (currentActivityIndex < activities.length - 1) {
      setTimeout(() => setCurrentActivityIndex((prev) => prev + 1), 500);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-xl border-none shadow-2xl">
        {/* Header */}
        <div
          className={`p-6 flex items-center justify-between border-b ${
            step === "lesson"
              ? "bg-indigo-50/50 dark:bg-indigo-950/20"
              : "bg-orange-50/50 dark:bg-orange-950/20"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-lg ${
                step === "lesson"
                  ? "bg-indigo-500 text-white"
                  : "bg-orange-500 text-white"
              }`}
            >
              {step === "lesson" ? (
                <BookOpen className="w-5 h-5" />
              ) : (
                <chapter.icon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{chapter.title}</h2>
              <p className="text-sm text-muted-foreground">
                {step === "lesson"
                  ? "Read the Lesson"
                  : `Activity: ${chapter.activityType}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative p-8">
          <AnimatePresence mode="wait">
            {step === "lesson" ? (
              <motion.div
                key="lesson"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <div className="prose dark:prose-invert prose-lg">
                  {/* Render content from DB or Fallback */}
                  <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {chapter.title}
                  </h3>
                  <div className="whitespace-pre-wrap font-sans text-foreground/80 leading-relaxed">
                    {chapter.content_markdown || "Content coming soon..."}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="game"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                {!isFinished ? (
                  <div className="w-full max-w-xl">
                    {currentActivity ? (
                      <>
                        <div className="mb-8">
                          <h3 className="text-2xl font-black mb-2">
                            {currentActivity.prompt}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Question {currentActivityIndex + 1} of{" "}
                            {activities.length}
                          </p>
                        </div>

                        {/* DYNAMIC ACTIVITY RENDERER */}
                        {currentActivity.type === "QUIZ" && (
                          <QuizActivity
                            data={currentActivity.data}
                            onComplete={handleActivitySuccess}
                          />
                        )}
                        {currentActivity.type === "BUILDING_BLOCKS" && (
                          <BuildingBlocksActivity
                            data={currentActivity.data}
                            onComplete={handleActivitySuccess}
                          />
                        )}
                        {currentActivity.type === "MATCHING" && (
                          <MatchingActivity
                            data={currentActivity.data}
                            onComplete={handleActivitySuccess}
                          />
                        )}
                      </>
                    ) : (
                      // Fallback if DB has no activities for this lesson
                      <div className="text-center">
                        <div className="w-32 h-32 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                          <chapter.icon className="w-16 h-16 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-bold">Practice Mode</h3>
                        <p className="text-muted-foreground mb-4">
                          No specific activities configured yet.
                        </p>
                        <Button
                          onClick={() => setIsFinished(true)}
                          variant="secondary"
                        >
                          Auto-Complete
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  // SUCCESS SCREEN (Your "Complete Chapter" UI)
                  <>
                    <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                      <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-black mb-2">
                      Chapter Complete!
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      You earned{" "}
                      <strong className="text-yellow-500">
                        +{chapter.xp_reward || 50} XP
                      </strong>
                    </p>

                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full max-w-xs shadow-lg shadow-green-900/20"
                      onClick={handleFinish}
                    >
                      <CheckCircle className="w-5 h-5" /> Finish
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-background flex justify-end">
          {step === "lesson" && (
            <Button
              size="lg"
              onClick={() => setStep("game")}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
            >
              Start Activity <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- MAIN PAGE: C# ADVENTURE ---
export default function AdventurePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { grantXP } = useGameProgress();

  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  // 1. FETCH & MAP DATA
  useEffect(() => {
    const fetchData = async () => {
      // Fetch DB Lessons
      const { data: dbLessons } = await supabase
        .from("lessons")
        .select("*, activities(*)")
        .order("order_index");

      // Merge DB data with your UI Template (CHAPTER_VISUALS)
      // This preserves your exact colors/icons while using DB content
      const mergedLessons = CHAPTER_VISUALS.map((visual) => {
        const dbMatch = dbLessons?.find((l) => l.order_index === visual.id);
        return {
          ...visual,
          // If DB has data, use it; otherwise fallback or keep defaults
          id: dbMatch?.id || visual.id,
          title: dbMatch?.title || `Chapter ${visual.id}`,
          description: dbMatch?.description || "Loading description...",
          content_markdown: dbMatch?.content_markdown,
          xp_reward: dbMatch?.xp_reward || 50,
          activities: dbMatch?.activities || [],
          // Keep Visuals
          order_index: visual.id,
          icon: visual.icon,
          color: visual.color,
          activityType: visual.activityLabel,
        };
      });

      setLessons(mergedLessons);
      setLoading(false);
    };

    fetchData();
  }, []);

  // 2. Logic: User Level
  const userLevel = user?.level || 1;

  // 3. Logic: Green Line (Exact Formula)
  const progressHeight =
    userLevel > 0
      ? (userLevel - 1) * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2
      : 0;

  // 4. Handle Completion
  const handleChapterComplete = async () => {
    if (!selectedChapter || !user) return;

    // Grant XP
    grantXP(selectedChapter.xp_reward);

    // Update DB Progress
    const { error } = await supabase.from("user_lesson_progress").upsert(
      {
        user_id: user.uid,
        lesson_id: selectedChapter.id,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id, lesson_id" }
    );

    if (error) console.error("Save failed:", error);

    setSelectedChapter(null);
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8 pb-24">
        {/* 1. Header with Back Button */}
        <div className="flex flex-col gap-6">
          <Button
            variant="ghost"
            className="w-fit -ml-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
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
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-full font-bold border border-yellow-500/20">
              <Star className="w-4 h-4 fill-yellow-600" /> Level {userLevel}
            </div>
          </div>
        </div>

        {/* 2. The Map (Your Exact UI) */}
        <div className="relative w-full mt-12">
          {/* Gray Background Path */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-2 bg-muted rounded-full" />

          {/* Green Progress Path */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: progressHeight }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 bg-gradient-to-b from-green-400 to-green-600 rounded-full z-0 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
          />

          {/* Nodes Container */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {lessons.map((chapter, index) => {
              const level = index + 1;
              let status: "locked" | "current" | "completed" = "locked";

              if (level < userLevel) status = "completed";
              else if (level === userLevel) status = "current";

              return (
                <RoadmapNode
                  key={chapter.id}
                  chapter={chapter}
                  status={status}
                  alignment={index % 2 === 0 ? "left" : "right"}
                  onClick={() => setSelectedChapter(chapter)}
                />
              );
            })}
          </div>

          {/* Finishing Trophy */}
          <div className="flex justify-center mt-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-xl z-10"
            >
              <Star className="w-12 h-12 text-yellow-600 fill-yellow-500" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lesson Overlay */}
      {selectedChapter && (
        <LessonOverlay
          chapter={selectedChapter}
          onClose={() => setSelectedChapter(null)}
          onComplete={handleChapterComplete}
        />
      )}
    </div>
  );
}
