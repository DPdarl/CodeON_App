import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Zap,
  Star,
  Map,
  Code2,
  Terminal,
  Cpu,
  ArrowRight,
  Play,
  Brain,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Link, useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "~/lib/firebase";
import { Challenge } from "~/types/challenge.types";

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

export function HomeTab() {
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

  // 2. Calculate Stats from Real User Data
  const stats = {
    level: user?.level || 1,
    rank: "Novice", // You could calculate this based on Level (e.g., >Lvl10 = "Intermediate")
    xp: user?.xp || 0,
    maxXp: (user?.level || 1) * 1000, // Example: Level 1 = 1000 max, Level 2 = 2000 max
    streak: user?.streaks || 0,
  };

  // 3. Group Challenges into "Courses" (Dynamic from DB)
  const getCourseGroups = () => {
    const groups: Record<string, Challenge[]> = {};

    challenges.forEach((challenge) => {
      const lang = (challenge as any).language;
      const key =
        typeof lang === "string" && lang.trim() !== "" ? lang : "General";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(challenge);
    });

    return Object.entries(groups).map(([title, items]) => ({
      title,
      count: items.length,
      // TODO: Calculate real progress based on user.completedChallenges
      progress: 0,
      color: getColorForLanguage(title),
      icon: getIconForLanguage(title),
    }));
  };

  const courses = getCourseGroups();

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
                  <Trophy className="w-3 h-3" />
                  Rank: {stats.rank}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
                Welcome back, {user?.displayName || "Traveler"}!
              </h1>
              <p className="text-indigo-100 max-w-lg text-lg">
                Ready to continue your coding adventure? The world of code
                awaits your command.
              </p>
            </div>

            {/* Level / XP Card */}
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 min-w-[280px] border border-white/10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-2xl font-black">Lvl {stats.level}</span>
                <span className="text-sm text-indigo-200 font-mono">
                  {stats.xp}/{stats.maxXp} XP
                </span>
              </div>
              <Progress
                value={(stats.xp / stats.maxXp) * 100}
                className="h-3 bg-black/30"
                indicatorClassName="bg-gradient-to-r from-yellow-300 to-yellow-500"
              />
              <p className="text-xs text-indigo-200 mt-3 text-right">
                {stats.maxXp - stats.xp} XP to Level {stats.level + 1}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Stats Row (Inventory/Status) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Day Streak"
          value={stats.streak.toString()}
          color="text-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-950/30"
        />
        <StatCard
          icon={Zap}
          label="Total XP"
          value={stats.xp.toString()}
          color="text-yellow-500"
          bgColor="bg-yellow-50 dark:bg-yellow-950/30"
        />
        <StatCard
          icon={Star}
          label="Challenges"
          value={challenges.length.toString()}
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
        />
        <StatCard
          icon={Trophy}
          label="Badges"
          value="3" // TODO: Fetch real badges length
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      {/* --- My Journey (Courses) --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Map className="w-6 h-6 text-indigo-500" />
            Your Journey
          </h2>
          <Button
            variant="ghost"
            className="text-indigo-600 dark:text-indigo-400 font-semibold"
            onClick={() => navigate("/dashboard/play")} // Link to Play tab
          >
            View Map <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Loading your courses...</p>
          ) : (
            courses.map((course) => (
              <motion.div key={course.title} variants={itemVariants}>
                <CourseCard course={course} />
              </motion.div>
            ))
          )}

          {/* "Coming Soon" Card */}
          <motion.div
            variants={itemVariants}
            className="group relative h-full min-h-[200px] rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center p-6 text-center hover:border-indigo-300 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Code2 className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-500 dark:text-gray-400">
              Discover New Lands
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              More courses coming soon!
            </p>
          </motion.div>
        </div>
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

// --- Sub-components ---

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">
          {value}
        </div>
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const Icon = course.icon;

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div
        className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-br ${course.color} opacity-10 group-hover:opacity-20 transition-opacity`}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg text-white`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {course.progress === 100 && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold">
              Completed
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {course.count} Challenges
        </p>

        <div className="mt-auto space-y-2">
          <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
            <span>Progress</span>
            <span>{course.progress}%</span>
          </div>
          <Progress
            value={course.progress}
            className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800"
            indicatorClassName={`bg-gradient-to-r ${course.color}`}
          />

          <div className="pt-4">
            <Button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-indigo-600 dark:hover:bg-indigo-200 font-bold rounded-xl transition-colors">
              {course.progress > 0 ? "Continue" : "Start Adventure"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
