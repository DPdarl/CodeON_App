// app/components/dashboardmodule/HomeTab.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Star,
  Map,
  Code2,
  Terminal,
  Cpu,
  ArrowRight,
  Brain,
  Loader2,
  Play,
  Crown,
  Zap,
  Sparkles,
  Compass, // Added for Adventure Icon
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { Challenge } from "~/types/challenge.types";
import { SelectionCarousel } from "./SelectionCarousel";
import { calculateProgress } from "~/lib/leveling-system";
import { TrophyIcon, FlameIcon, CrownIcon, StarIcon } from "../ui/Icons";

// --- NEW IMPORTS FOR GAME LOGIC ---
import { useGameProgress } from "~/hooks/useGameProgress";
import { LevelUpModal } from "./LevelUpModal";

interface HomeTabProps {
  onTabChange: (tab: string) => void;
}

export function HomeTab({ onTabChange }: HomeTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // --- CONNECT GAME LOGIC HOOK ---
  const { grantXP, levelUpModal, isProcessing } = useGameProgress();

  // 1. Fetch Data from Supabase
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const { data, error } = await supabase.from("challenges").select("*");

        if (error) {
          throw error;
        }

        if (data) {
          setChallenges(data as Challenge[]);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // 2. Calculate Stats
  const progressData = calculateProgress(user?.xp || 0);

  const stats = {
    // Level Info (Hero Section)
    level: progressData.currentLevel,
    currentBarXP: progressData.currentXP,
    maxBarXP: progressData.xpForNextLevel,

    // Competitive Stats (Grid)
    streak: user?.streaks || 0,
    trophies: user?.trophies || 0,
    league: user?.league || "Novice",
  };

  const handleSelectChallenge = (challenge: Challenge) => {
    navigate(`/solo-challenge`, {
      state: { challenge },
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* --- LEVEL UP MODAL --- */}
      <LevelUpModal
        isOpen={levelUpModal.isOpen}
        newLevel={levelUpModal.newLevel}
        rewards={levelUpModal.rewards}
        onClose={levelUpModal.close}
      />

      {/* --- Hero / Welcome Section --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  {stats.league} League
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight font-pixelify">
                Welcome back, {user?.displayName || "Traveler"}!
              </h1>

              {/* --- TEST BUTTON FOR DEMO --- */}
              <div className="mt-6 flex flex-wrap gap-4 items-center">
                <Button
                  onClick={() => grantXP(100)}
                  disabled={isProcessing}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-0 transition-all active:scale-95"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Adding...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2 text-yellow-300 fill-yellow-300" />{" "}
                      Test: Give 100 XP
                    </>
                  )}
                </Button>
                <span className="text-[10px] text-indigo-200 opacity-70">
                  * Click to test Level Up & Leaderboard
                </span>
              </div>
            </div>

            {/* Level / XP Card (Personal Progress) */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 min-w-[280px] border border-white/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black flex items-center gap-2">
                  Level {stats.level}
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </span>
                <span className="text-sm text-indigo-200 font-mono">
                  {Math.round(stats.currentBarXP)}/{stats.maxBarXP} XP
                </span>
              </div>
              <Progress
                value={(stats.currentBarXP / stats.maxBarXP) * 100}
                className="h-3 bg-black/30"
                indicatorClassName="bg-gradient-to-r from-yellow-300 to-yellow-500"
              />
              <p className="text-xs text-indigo-200 mt-3 text-right">
                {Math.round(stats.maxBarXP - stats.currentBarXP)} XP to Level{" "}
                {stats.level + 1}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Stats Row (Competitive Stats) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Streak */}
        <StatCard
          icon={FlameIcon}
          label="Day Streak"
          value={stats.streak.toString()}
          color="text-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-950/30"
          iconClassName="h-6 w-5"
        />
        {/* 2. Trophies */}
        <StatCard
          icon={TrophyIcon}
          label="Total Trophies"
          value={stats.trophies.toLocaleString()}
          color="text-yellow-500"
          bgColor="bg-yellow-50 dark:bg-yellow-950/30"
        />
        {/* 3. League */}
        <StatCard
          icon={CrownIcon}
          label="Current League"
          value={stats.league}
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-950/30"
        />
        {/* 4. Challenges */}
        <StatCard
          icon={StarIcon}
          label="Challenges"
          value={challenges.length.toString()}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
        />
      </div>

      {/* --- Adventure Banner (Where you left off) --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300"
      >
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 dark:from-orange-900/20 dark:to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  Adventure Mode
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Where you left off
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                You are currently facing challenges in{" "}
                <span className="font-bold text-orange-600 dark:text-orange-400">
                  Level {stats.level}
                </span>
                . Ready to continue your journey?
              </p>
            </div>
          </div>

          <Button
            onClick={() => onTabChange("play")}
            className="w-full md:w-auto h-12 px-8 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-transform active:scale-95"
          >
            Resume Journey <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* --- Enhanced Available Challenges Section --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 pt-2"
      >
        <div className="flex justify-between items-end px-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-6 h-6 text-indigo-500" />
              Practice Arena
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Sharpen your skills with standalone coding challenges.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/play.challenges")} // Navigate to full challenges page if distinct
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Enhanced Card Container for Carousel */}
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/50 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="relative z-10">
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              </div>
            ) : challenges.length > 0 ? (
              <SelectionCarousel
                challenges={challenges}
                onSelectChallenge={handleSelectChallenge}
              />
            ) : (
              <div className="text-center py-20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 text-lg">
                  No challenges found in the database.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  (Try adding some to your 'challenges' table!)
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm dark:hover:shadow-white hover:shadow-md flex items-center gap-4 transition-transform hover:scale-105">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}
