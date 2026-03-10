// app/components/dashboardmodule/PlayTab.tsx
import { useNavigate, useSearchParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { Users, Code2, ArrowRight, Lock } from "lucide-react";
import { useState, useEffect } from "react"; // ADDED
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useAuth } from "~/contexts/AuthContext";
import { cn } from "~/lib/utils";
import { ControllerIcon, MapIcon } from "../ui/Icons";
import { PlaySkeleton } from "./PlaySkeleton"; // ADDED
import { OnboardingTour } from "~/components/ui/OnboardingTour";
import type { TourStep } from "~/components/ui/OnboardingTour";

// Import the Updated MatchHistoryTab
import { MatchHistoryTab } from "./MatchHistoryTab";

export function PlayTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentLevel = user?.level || 1;
  const completedChaptersCount = user?.completedChapters?.length || 0;
  const CHAPTERS_REQUIRED = 5;
  const isChallengesLocked = completedChaptersCount < CHAPTERS_REQUIRED;
  const [loading, setLoading] = useState(true); // ADDED

  // Tour Logic
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTour, setShowTour] = useState(false);
  const [isManual, setIsManual] = useState(false);

  // Simulate loading for consistent UX
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && !loading) {
      const isManualTrigger = searchParams.get("tour") === "true";
      const hasSeenTour = user?.settings?.tutorials?.playTab;

      if (isManualTrigger) {
        setShowTour(true);
        setIsManual(true);
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("tour");
          return newParams;
        });
      } else if (!hasSeenTour) {
        // Small delay to ensure elements are rendered
        const timer = setTimeout(() => setShowTour(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, loading, searchParams, setSearchParams]);

  if (loading) return <PlaySkeleton />; // ADDED

  const TOUR_STEPS: TourStep[] = [
    {
      target: "mode-adventure",
      title: "C# Adventures",
      content:
        "Master C# concepts step-by-step through interactive lessons and mini-games. This is where you will do most of your learning.",
    },
    {
      target: "mode-multiplayer",
      title: "Multiplayer ",
      content: "(Coming Soon. Need a paid API to work)",
    },
    {
      target: "mode-challenges",
      title: "C#allenges",
      content:
        "Test your logic with raw machine problems. Great for practicing exactly what you've learned.",
      position: "top",
    },
    {
      target: "match-history-section",
      title: "Match History",
      content:
        "Review your past multiplayer battles and adventure progress, including how accurate and fast you were.",
      position: "top",
    },
  ];

  const gameModes = [
    {
      id: "adventure",
      title: "C# Adventures",
      description:
        "Your main journey. Master C# concepts step-by-step through interactive lessons and mini-games.",
      icon: MapIcon,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "hover:border-emerald-500/50",
      route: "/play/adventure",
      minLevel: 1,
    },
    {
      id: "multiplayer",
      title: "Multiplayer ",
      description:
        "Compete with peers in real-time coding battles. Prove your speed and accuracy.",
      icon: Users,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "hover:border-indigo-500/50",
      route: "/play/multiplayer",
      minLevel: 5,
    },
    {
      id: "challenges",
      title: "C#allenges",
      description:
        "Test your logic with raw machine problems. No hand-holding, just code.",
      icon: Code2,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "hover:border-orange-500/50",
      route: "/play/challenges",
      minLevel: 1,
      requiresChapters: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 pt-4 px-4 relative">
      <OnboardingTour
        steps={TOUR_STEPS}
        isOpen={showTour}
        onComplete={() => {
          setShowTour(false);
          setIsManual(false);
        }}
        onSkip={() => {
          setShowTour(false);
          setIsManual(false);
        }}
        avatarConfig={user?.avatarConfig}
        tutorialId="playTab"
        returnTo={isManual ? "/how-to" : undefined}
      />
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <ControllerIcon className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Play CodeON
            </h1>
            <p className="text-muted-foreground">
              Choose your path and level up your skills.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gameModes.map((mode, index) => {
          const isLocked =
            mode.id === "multiplayer"
              ? true
              : mode.id === "challenges"
              ? isChallengesLocked
              : currentLevel < mode.minLevel;

          return (
            <motion.div
              key={mode.id}
              id={`mode-${mode.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card
                className={cn(
                  "h-full relative overflow-hidden transition-all duration-300 border-2",
                  isLocked
                    ? "opacity-80 grayscale-[0.5] border-dashed"
                    : `cursor-pointer hover:shadow-xl hover:-translate-y-1 ${mode.borderColor}`,
                )}
                onClick={() => !isLocked && navigate(mode.route)}
              >
                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    {mode.id === "challenges" ? (
                      <>
                        <p className="font-bold text-lg text-foreground">
                          Complete 5 Adventure Chapters
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Finish adventure chapters to unlock C#allenges.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 w-28 bg-muted-foreground/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  (completedChaptersCount / CHAPTERS_REQUIRED) *
                                    100,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-orange-500">
                            {completedChaptersCount} / {CHAPTERS_REQUIRED}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/play/adventure");
                          }}
                          className="mt-3 text-xs font-bold text-indigo-500 hover:underline"
                        >
                          Go to Adventure →
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-lg text-foreground">
                          Coming Soon
                        </p>
                        <p className="text-md text-muted-foreground mt-1">
                          Coming Soon. Need a paid API to work.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Decorative Background Gradient */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-20",
                    mode.color.replace("text-", "bg-"),
                  )}
                />

                <CardHeader>
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                      mode.bgColor,
                    )}
                  >
                    <mode.icon className={cn("w-10 h-10", mode.color)} />
                  </div>
                  <CardTitle className="text-xl flex items-center justify-between">
                    {mode.title}
                    {!isLocked && mode.id === "adventure" && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      >
                        RECOMMENDED
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-muted-foreground text-sm leading-relaxed min-h-[60px]">
                    {mode.description}
                  </p>

                  <Button
                    variant={isLocked ? "outline" : "default"}
                    className={cn(
                      "w-full justify-between group",
                      !isLocked &&
                        "bg-foreground text-background hover:bg-foreground/90",
                    )}
                    disabled={isLocked}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the card's onClick twice
                      if (!isLocked) navigate(mode.route);
                    }}
                  >
                    {isLocked ? "Locked" : "Play Now"}
                    {!isLocked && (
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* History Table */}
      <div
        className="mt-8 h-[400px] overflow-y-auto pr-2"
        id="match-history-section"
      >
        <MatchHistoryTab />
      </div>
    </div>
  );
}
