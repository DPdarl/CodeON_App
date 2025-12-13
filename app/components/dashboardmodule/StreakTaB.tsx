// app/components/dashboardmodule/StreakTab.tsx
import { useState, useEffect } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Flame,
  Calendar,
  Snowflake,
  Store,
  Award,
  Check,
  Lock,
  Crown,
  Zap, // Added for test button
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { STREAK_MILESTONES, calculateStreakUpdate } from "~/lib/streak-logic"; // Connected Logic

// --- HELPERS (Visuals only) ---

const getPhDate = () => {
  const now = new Date();
  const phTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  return new Date(phTimeStr);
};

const getPhISODate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export function StreakTab() {
  const { user, updateProfile } = useAuth();
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal State
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);

  const currentStreak = user?.streaks || 0;
  const freezeCount = (user as any)?.streakFreezes || 0;
  const activeDatesRaw = (user as any)?.activeDates;

  // Generate Dynamic Milestones List
  const milestonesList = Object.entries(STREAK_MILESTONES)
    .map(([days, reward]) => ({
      days: parseInt(days),
      ...reward,
      earned: currentStreak >= parseInt(days),
    }))
    .sort((a, b) => a.days - b.days);

  // --- LOGIC INTEGRATION: Calendar Generation ---
  useEffect(() => {
    const activeDays = activeDatesRaw || [];
    const today = getPhDate();
    const todayStr = getPhISODate(today);

    setCurrentMonth(today.toLocaleString("default", { month: "long" }));

    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: 0, isPadding: true });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = getPhISODate(date);
      const isToday = dateStr === todayStr;

      let isActive = activeDays.includes(dateStr);
      // Visual fix: If local streak > 0 and it's today, assume active visually
      if (isToday && currentStreak > 0 && activeDays.includes(todayStr))
        isActive = true;

      const isFuture = date.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0);

      days.push({
        day,
        isPadding: false,
        isToday,
        isActive,
        isFuture,
      });
    }

    setCalendarDays(days);
  }, [currentStreak, activeDatesRaw]);

  // --- HANDLER: Manual Test Button ---
  const handleTestStreak = async () => {
    if (!user || isProcessing) return;
    setIsProcessing(true);

    try {
      console.log("--- Running Streak Logic ---");
      const result = calculateStreakUpdate(user);
      console.log("Result:", result);

      if (result.shouldUpdate) {
        // Update DB via Context
        await updateProfile({
          streaks: result.newStreak,
          activeDates: result.newActiveDates,
          coins: result.newCoins,
          streakFreezes: result.newFreezes,
          badges: result.newBadges,
        });

        const msg =
          result.messages.length > 0
            ? result.messages.join("\n")
            : "Streak maintained!";
        alert(`✅ Success!\n${msg}`);
      } else {
        console.log("No update needed (Already active today)");
        alert("📅 You have already extended your streak today!");
      }
    } catch (error) {
      console.error("Streak Test Failed:", error);
      alert("❌ Error updating streak. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Your Streak
          </h1>
        </div>

        {/* TEST BUTTON */}
        <Button
          variant="outline"
          onClick={handleTestStreak}
          disabled={isProcessing}
          className="gap-2 border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-400"
        >
          {isProcessing ? (
            <span className="animate-pulse">Processing...</span>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" /> Test Streak
            </>
          )}
        </Button>
      </motion.div>

      {/* Main Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <CurrentStreakCard streak={currentStreak} />
          <StreakCalendarCard month={currentMonth} days={calendarDays} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <StreakInventoryCard freezeCount={freezeCount} />
          <StreakMilestonesCard
            milestones={milestonesList}
            onViewMilestone={setSelectedMilestone}
          />
        </motion.div>
      </motion.div>

      {/* --- MILESTONE MODAL --- */}
      <Dialog
        open={!!selectedMilestone}
        onOpenChange={(open) => !open && setSelectedMilestone(null)}
      >
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex flex-col items-center gap-2">
              <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-2">
                <TrophyIcon className="w-12 h-12 text-yellow-500" />
              </div>
              {selectedMilestone?.title}
            </DialogTitle>
            <DialogDescription className="text-center text-lg">
              You hit a {selectedMilestone?.days} day streak!
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Reward Box */}
            <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase font-bold text-gray-400">
                  Reward
                </span>
                <div className="flex items-center gap-2 text-xl font-black text-yellow-500">
                  <img
                    src="/assets/icons/coinv2.png"
                    className="w-6 h-6"
                    alt="Coin"
                  />
                  +{selectedMilestone?.coins}
                </div>
              </div>

              {selectedMilestone?.badge && (
                <>
                  <div className="w-[1px] h-10 bg-gray-300 dark:bg-gray-600" />
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase font-bold text-gray-400">
                      Badge
                    </span>
                    <div className="flex items-center gap-2 text-lg font-bold text-purple-500">
                      <Award className="w-5 h-5" />
                      Unlocked
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
              onClick={() => setSelectedMilestone(null)}
            >
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub-components ---

function CurrentStreakCard({ streak }: { streak: number }) {
  return (
    <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-3xl shadow-lg overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

      <CardContent className="p-8 flex items-center gap-6 relative z-10">
        <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm shadow-inner">
          <Flame className="w-16 h-16 drop-shadow-md animate-pulse text-white fill-white" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">
            Current Streak
          </p>
          <p className="text-6xl font-black drop-shadow-sm leading-none mb-2">
            {streak}
          </p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">
            {streak > 0 ? "🔥 You're on fire!" : "🌱 Start your streak today!"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StreakCalendarCard({ month, days }: { month: string; days: any[] }) {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <span>{month}</span>
          {/* Note: This simplistic check assumes if ANY day is active, streak is saved. 
              Ideally, check if *today* is active. */}
          <div
            className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 ${
              days.find((d) => d.isToday)?.isActive
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-800"
            }`}
          >
            {days.find((d) => d.isToday)?.isActive ? (
              <Check className="w-3 h-3" />
            ) : (
              <Calendar className="w-3 h-3" />
            )}
            {days.find((d) => d.isToday)?.isActive ? "Streak Saved" : "Pending"}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayLabels.map((label) => (
            <div
              key={label}
              className="text-center text-[10px] font-bold text-gray-400 uppercase"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isWarning = day.isToday && !day.isActive;
            return (
              <div
                key={index}
                className={cn(
                  "relative aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all",
                  day.isPadding && "bg-transparent",
                  day.isFuture &&
                    "bg-gray-50 dark:bg-gray-800/20 text-gray-300 dark:text-gray-700",
                  !day.isPadding &&
                    !day.isFuture &&
                    !day.isActive &&
                    !day.isToday &&
                    "bg-gray-100 dark:bg-gray-800/50 text-gray-400",
                  day.isActive &&
                    "bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-105 border-2 border-white dark:border-gray-900",
                  isWarning &&
                    "bg-transparent text-gray-900 dark:text-white border-2 border-dashed border-red-300 dark:border-red-700",
                  day.isToday &&
                    day.isActive &&
                    "ring-2 ring-offset-2 ring-orange-500 dark:ring-offset-gray-900"
                )}
              >
                {!day.isPadding && <span>{day.day}</span>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function StreakInventoryCard({ freezeCount }: { freezeCount: number }) {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Power-Ups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-blue-900 rounded-xl shadow-sm">
              <Snowflake className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="font-bold text-blue-900 dark:text-blue-100">
                Streak Freeze
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300">
                Auto-equips on miss
              </div>
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            x{freezeCount}
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full mt-2 text-indigo-600 hover:text-indigo-700 h-auto py-2 text-xs"
        >
          <Store className="w-3 h-3 mr-1" /> Get more in Store
        </Button>
      </CardContent>
    </Card>
  );
}

function StreakMilestonesCard({
  milestones,
  onViewMilestone,
}: {
  milestones: any[];
  onViewMilestone: (m: any) => void;
}) {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Next Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {milestones.map((milestone: any) => {
          return (
            <div
              key={milestone.days}
              onClick={() => milestone.earned && onViewMilestone(milestone)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all border",
                milestone.earned
                  ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 cursor-pointer hover:scale-[1.02]"
                  : "bg-gray-50 dark:bg-gray-800/50 border-transparent opacity-70"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    milestone.earned
                      ? "bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                  )}
                >
                  {milestone.earned ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div
                    className={cn(
                      "font-bold text-sm",
                      milestone.earned
                        ? "text-yellow-900 dark:text-yellow-100"
                        : "text-gray-500"
                    )}
                  >
                    {milestone.days}-Day Streak
                  </div>
                  {milestone.earned && (
                    <div className="text-[10px] font-bold text-yellow-600 uppercase">
                      Completed
                    </div>
                  )}
                </div>
              </div>

              {/* Reward Pill */}
              <div className="flex items-center gap-1 bg-white dark:bg-black/20 px-2 py-1 rounded-lg text-xs font-bold text-gray-500">
                <img src="/assets/icons/coinv2.png" className="w-3 h-3" />
                {milestone.coins}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Simple Trophy Icon for Modal
function TrophyIcon({ className }: { className?: string }) {
  return <Award className={className} />;
}
