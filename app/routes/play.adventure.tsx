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
  Loader2,
  Lightbulb,
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

// --- 1. VISUAL TEMPLATE (Strict Styling) ---
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

// --- 2. C# CONTENT DATA (From PDF) ---
const CSHARP_LESSONS = [
  {
    id: 1,
    title: "Understanding C# and .NET",
    description: "C# is the language; .NET is the engine.",
    content_markdown:
      "C# (pronounced C-sharp) is a modern programming language created by Microsoft. It runs on .NET, a platform that translates your code so the computer can execute it.\n\nThink of C# as the language you speak, and .NET as the translator that makes your program run.",
    codeSnippet: `Console.WriteLine("Hello, CodeON!");`,
    keyTakeaway:
      "C# is the language you write, and .NET is the platform that runs it.",
    xp_reward: 50,
  },
  {
    id: 2,
    title: "Basic Syntax and Structure",
    description: "The grammar rules of your code.",
    content_markdown:
      "Syntax is the set of rules that defines how C# code must be written. Just like grammar in English, correct syntax ensures the computer understands you.\n\nEvery C# program follows a basic structure, typically starting with a 'Main' method.",
    codeSnippet: `using System;
class Program {
  static void Main() {
    Console.WriteLine("Welcome to CodeON");
  }
}`,
    keyTakeaway: "C# programs must follow a clear structure to work correctly.",
    xp_reward: 100,
  },
  {
    id: 3,
    title: "Variables and Data Types",
    description: "Containers for storing information.",
    content_markdown:
      "A variable is a container for data. Each variable has a 'type' telling C# what kind of value it holds:\n\n• int: Whole numbers\n• double: Decimals\n• bool: True or False\n• string: Text",
    codeSnippet: `int age = 18;
string name = "Alex";
bool isStudent = true;`,
    keyTakeaway:
      "Choose the correct data type based on the kind of data you want to store.",
    xp_reward: 150,
  },
  {
    id: 4,
    title: "Operators",
    description: "Math and logic symbols.",
    content_markdown:
      "Operators are symbols used to perform actions:\n\n• Arithmetic: + (Add), * (Multiply)\n• Comparison: == (Equal), > (Greater than)\n• Logical: && (And), ! (Not)",
    codeSnippet: `int total = 5 + 3;
bool isPassed = total >= 8;`,
    keyTakeaway: "Operators help your code think and calculate.",
    xp_reward: 150,
  },
  {
    id: 5,
    title: "Control Structures",
    description: "Making decisions with If and Loops.",
    content_markdown:
      "Control structures decide the flow of your program.\n\n• If Statements: Run code only if a condition is true.\n• Loops (for, while): Repeat tasks automatically.",
    codeSnippet: `if (score >= 75) {
  Console.WriteLine("You passed!");
}

for (int i = 0; i < 3; i++) {
  Console.WriteLine("Hello");
}`,
    keyTakeaway: "They control decisions and repetition in your program.",
    xp_reward: 200,
  },
  {
    id: 6,
    title: "Methods",
    description: "Reusable blocks of code.",
    content_markdown:
      "A method is a block of code designed to perform a specific task. Instead of writing the same code twice, you wrap it in a method and call it whenever needed.",
    codeSnippet: `static int Add(int a, int b) {
  return a + b;
}`,
    keyTakeaway:
      "Methods group actions into reusable blocks to keep code clean.",
    xp_reward: 200,
  },
  {
    id: 7,
    title: "Classes and Objects",
    description: "Blueprints and instances.",
    content_markdown:
      "A Class is a blueprint (like a drawing of a car). An Object is the actual instance (the red car in your driveway).\n\nClasses define properties (color, speed) and behaviors (drive, stop).",
    codeSnippet: `class Car {
  public string color;
}

Car myCar = new Car();
myCar.color = "Red";`,
    keyTakeaway: "Classes define objects, and objects use those definitions.",
    xp_reward: 250,
  },
  {
    id: 8,
    title: "OOP Pillars",
    description: "The 4 foundations of software design.",
    content_markdown:
      "Object-Oriented Programming (OOP) relies on four pillars:\n\n1. Encapsulation: Protecting data\n2. Inheritance: Reusing code\n3. Polymorphism: Flexibility\n4. Abstraction: Hiding complexity",
    codeSnippet: `// 1. Encapsulation
// 2. Inheritance
// 3. Polymorphism
// 4. Abstraction`,
    keyTakeaway: "OOP pillars help build scalable and maintainable software.",
    xp_reward: 300,
  },
  {
    id: 9,
    title: "Arrays and Collections",
    description: "Storing lists of data.",
    content_markdown:
      "An Array stores multiple values of the same type in a fixed list. Collections (like Lists) are more flexible and can grow or shrink.",
    codeSnippet: `int[] numbers = { 1, 2, 3 };`,
    keyTakeaway: "Arrays and collections store groups of data efficiently.",
    xp_reward: 250,
  },
  {
    id: 10,
    title: "Error Handling",
    description: "Preventing crashes with try-catch.",
    content_markdown:
      "Error handling prevents your program from crashing when something goes wrong (like dividing by zero).\n\nUse 'try' to run code and 'catch' to handle errors if they happen.",
    codeSnippet: `try {
  int num = int.Parse("abc");
} catch {
  Console.WriteLine("Error!");
}`,
    keyTakeaway: "Use try-catch to handle unexpected problems safely.",
    xp_reward: 300,
  },
];

// --- COMPONENT: ROADMAP NODE ---
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

// --- COMPONENT: LESSON OVERLAY ---
function LessonOverlay({ chapter, onClose, onComplete }: any) {
  const [step, setStep] = useState<"lesson" | "game">("lesson");

  // Game Logic
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Fallback to empty if no DB activities found yet
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
                  {/* TITLE */}
                  <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {chapter.title}
                  </h3>

                  {/* MAIN CONTENT */}
                  <div className="whitespace-pre-wrap font-sans text-foreground/80 leading-relaxed text-lg">
                    {chapter.content_markdown}
                  </div>

                  {/* CODE SNIPPET */}
                  {chapter.codeSnippet && (
                    <div className="my-6 relative group">
                      <div className="absolute -top-3 right-4 bg-gray-800 text-xs text-gray-400 px-2 py-1 rounded">
                        C#
                      </div>
                      <pre className="bg-gray-950 text-gray-100 p-6 rounded-xl font-mono text-sm overflow-x-auto border border-gray-800 shadow-xl">
                        <code>{chapter.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* KEY TAKEAWAY */}
                  {chapter.keyTakeaway && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-4 rounded-r-lg mt-8 flex gap-3 items-start">
                      <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-500 text-sm uppercase tracking-wide">
                          Key Takeaway
                        </h4>
                        <p className="text-yellow-900 dark:text-yellow-200">
                          {chapter.keyTakeaway}
                        </p>
                      </div>
                    </div>
                  )}
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
                  // SUCCESS SCREEN
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
      // Fetch DB Activities (Optional - we can merge if they exist)
      // For now, we rely primarily on CSHARP_LESSONS constant
      // so it works instantly without DB population.

      const { data: dbLessons } = await supabase
        .from("lessons")
        .select("id, order_index, activities(*)");

      // Merge: Visuals + C# Content + DB Activities (if any)
      const mergedLessons = CHAPTER_VISUALS.map((visual) => {
        // Find C# content by ID
        const content = CSHARP_LESSONS.find((c) => c.id === visual.id);
        // Find DB activities by ID (if you added minigames in DB)
        const dbMatch = dbLessons?.find((l) => l.order_index === visual.id);

        return {
          ...visual, // Visuals (Icon, Color)
          ...content, // Content (Title, Markdown, Code)
          // Use DB ID if exists, otherwise fallback to index for local key
          id: dbMatch?.id || visual.id,
          // Merge activities if DB has them
          activities: dbMatch?.activities || [],
          // Keep strict order
          order_index: visual.id,
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

  // 3. Logic: Green Line
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
        lesson_id: selectedChapter.id, // Ensure this matches DB ID if strict FK
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id, lesson_id" }
    );

    if (error) {
      // If it fails (e.g. strict FK on lesson_id that doesn't exist in DB yet),
      // just log it but allow UI to continue for demo purposes
      console.warn(
        "Progress save warning (Lesson might not exist in DB yet):",
        error
      );
    }

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

        {/* 2. The Map */}
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
