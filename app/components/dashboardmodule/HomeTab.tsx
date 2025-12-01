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
  Crown, // Added Crown for League
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "~/lib/firebase";
import { Challenge } from "~/types/challenge.types";
import { SelectionCarousel } from "./SelectionCarousel";
import { calculateProgress } from "~/lib/leveling-system";

const db = getFirestore(app);

// Helper to get colors based on language (Visuals)
const getColorForLanguage = (lang: string) => {
  switch (lang.toLowerCase()) {
    case "python":
      return "from-yellow-400 to-orange-500";
    case "javascript":
      return "from-yellow-300 to-yellow-500";
    case "html/css":
      return "from-orange-400 to-red-500";
    case "react":
      return "from-cyan-400 to-blue-500";
    case "csharp":
    case "c#":
      return "from-green-400 to-blue-500";
    default:
      return "from-indigo-400 to-purple-500";
  }
};

// Helper to get icons based on language (Visuals)
const getIconForLanguage = (lang: string) => {
  switch (lang.toLowerCase()) {
    case "python":
      return Terminal;
    case "javascript":
      return Code2;
    case "react":
      return Cpu;
    case "csharp":
    case "c#":
      return Code2;
    default:
      return Brain;
  }
};

interface HomeTabProps {
  onTabChange: (tab: string) => void;
}

export function HomeTab({ onTabChange }: HomeTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data from Firestore
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "challenges"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Challenge[];
        setChallenges(data);
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
    trophies: user?.trophies || 0, // Replaced XP
    league: user?.league || "Novice", // Replaces Badges
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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
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
                  <Crown className="w-3 h-3" />
                  {stats.league} League
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight font-pixelify">
                Welcome back, {user?.displayName || "Traveler"}!
              </h1>
              <p className="text-indigo-100 max-w-lg text-lg">
                Ready to continue your coding adventure? The world of code
                awaits your command.
              </p>
            </div>

            {/* Level / XP Card (Personal Progress) */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 min-w-[280px] border border-white/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black">Lvl {stats.level}</span>
                <span className="text-sm text-indigo-200 font-mono">
                  {stats.currentBarXP}/{stats.maxBarXP} XP
                </span>
              </div>
              <Progress
                value={(stats.currentBarXP / stats.maxBarXP) * 100}
                className="h-3 bg-black/30"
                indicatorClassName="bg-gradient-to-r from-yellow-300 to-yellow-500"
              />
              <p className="text-xs text-indigo-200 mt-3 text-right">
                {stats.maxBarXP - stats.currentBarXP} XP to Level{" "}
                {stats.level + 1}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Stats Row (UPDATED: Competitive Stats) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 1. Streak */}
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={stats.streak.toString()}
          color="text-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-950/30"
        />
        {/* 2. Trophies (Replaced XP) */}
        <StatCard
          icon={Trophy}
          label="Total Trophies"
          value={stats.trophies.toLocaleString()}
          color="text-yellow-500"
          bgColor="bg-yellow-50 dark:bg-yellow-950/30"
        />
        {/* 3. League (Replaced Badges) */}
        <StatCard
          icon={Crown}
          label="Current League"
          value={stats.league}
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-950/30"
        />
        {/* 4. Challenges */}
        <StatCard
          icon={Star}
          label="Challenges"
          value={challenges.length.toString()}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
        />
      </div>

      {/* --- Carousel Section --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-500" />
            Available Challenges
          </h2>
          <Button
            variant="ghost"
            className="text-indigo-600 dark:text-indigo-400 font-semibold"
            onClick={() => onTabChange("play")}
          >
            View Map <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : challenges.length > 0 ? (
          <SelectionCarousel
            challenges={challenges}
            onSelectChallenge={handleSelectChallenge}
          />
        ) : (
          <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 text-lg">
              No challenges found in the database.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              (Try uploading them using the seed script!)
            </p>
          </div>
        )}
      </motion.div>

      {/* --- Daily Challenge Banner --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-3xl p-1 shadow-xl"
      >
        <div className="bg-white/5 backdrop-blur-sm rounded-[20px] p-6 md:p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-2xl">
              <Terminal className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                  Daily Quest
                </span>
                <span className="text-gray-400 text-xs">+50 XP</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                The Algorithm of Fire
              </h3>
              <p className="text-gray-400 text-sm max-w-md">
                Solve the "Binary Search" challenge efficiently to keep your
                streak alive!
              </p>
            </div>
          </div>
          <Button className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl px-8 py-6 shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95">
            Start Quest <Play className="w-4 h-4 ml-2 fill-current" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm dark:hover:shadow-white hover:shadow-md transition-shadow flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
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
