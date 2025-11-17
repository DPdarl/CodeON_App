import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Flame,
  Calendar,
  Snowflake,
  Store,
  Award,
  Lock,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

// --- MOCK DATA ---
// TODO: Replace with real user data from Firestore
const MOCK_CURRENT_STREAK = 5;
const MOCK_FREEZE_COUNT = 2;
// Dates user was active. Format: YYYY-MM-DD
const MOCK_ACTIVE_DAYS = [
  "2025-11-11", // Note: This date is in the past for the current time
  "2025-11-12",
  "2025-11-13",
  "2025-11-14",
  // "2025-11-15", // Today - let's assume they haven't played yet
];

const MOCK_MILESTONES = [
  { name: "3-Day Streak", icon: Award, earned: true },
  { name: "7-Day Streak", icon: Award, earned: false },
  { name: "14-Day Streak", icon: Award, earned: false },
  { name: "30-Day Streak", icon: Award, earned: false },
];
// --- END MOCK DATA ---

// Animation variants for "popping" in elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// Helper to format date as YYYY-MM-DD
const getISODate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export function StreakTab() {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");

  interface CalendarDay {
    day: number;
    isPadding: boolean;
    isToday: boolean;
    isActive: boolean;
    isFuture: boolean;
  }

  // Generate the calendar days for the current month
  useEffect(() => {
    const today = new Date();
    // For testing, you can override 'today':
    // const today = new Date("2025-11-15T12:00:00"); // Use this to test

    const todayStr = getISODate(today);
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-11

    setCurrentMonth(today.toLocaleString("default", { month: "long" }));

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: CalendarDay[] = [];

    // 1. Add padding for days before the 1st
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({
        day: 0,
        isPadding: true,
        isToday: false,
        isActive: false,
        isFuture: false,
      });
    }

    // 2. Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = getISODate(date);

      const isToday = dateStr === todayStr;
      const isActive = MOCK_ACTIVE_DAYS.includes(dateStr);
      const isFuture = date > today;

      days.push({
        day,
        isPadding: false,
        isToday,
        isActive,
        isFuture,
      });
    }

    setCalendarDays(days);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Flame className="w-8 h-8 text-orange-500" />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Your Streak
        </h1>
      </motion.div>

      {/* Main Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Column 1: Current Streak & Calendar */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <CurrentStreakCard streak={MOCK_CURRENT_STREAK} />
          <StreakCalendarCard month={currentMonth} days={calendarDays} />
        </motion.div>

        {/* Column 2: Inventory & Milestones */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <StreakInventoryCard freezeCount={MOCK_FREEZE_COUNT} />
          <StreakMilestonesCard />
        </motion.div>
      </motion.div>
    </div>
  );
}

// --- Sub-components ---

function CurrentStreakCard({ streak }: { streak: number }) {
  return (
    <Card className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-3xl shadow-lg overflow-hidden">
      <CardContent className="p-8 flex items-center gap-6">
        <Flame className="w-24 h-24 drop-shadow-lg" fill="white" />
        <div>
          <p className="text-xl font-bold uppercase tracking-wider opacity-90">
            Current Streak
          </p>
          <p className="text-7xl font-black drop-shadow-md">{streak}</p>
          <p className="text-lg font-medium opacity-90">
            {streak > 0 ? "You're on fire!" : "Complete a lesson to start!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StreakCalendarCard({ month, days }: { month: string; days: any[] }) {
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Find "today's" status to show the message
  const today = days.find((d) => d.isToday);
  const isTodayActive = today?.isActive;

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <span>{month} Calendar</span>
          <Calendar className="w-6 h-6 text-gray-400" />
        </CardTitle>
        <CardDescription>
          {isTodayActive
            ? "Great job! You've secured your streak for today."
            : "Complete a challenge today to keep your streak!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayLabels.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            // The "Today" warning pulse
            const isWarning = day.isToday && !day.isActive;

            return (
              <div
                key={index}
                className={cn(
                  "relative aspect-square rounded-xl flex items-center justify-center font-bold",
                  // Padding
                  day.isPadding && "bg-transparent",

                  // Future
                  day.isFuture &&
                    "bg-gray-50 dark:bg-gray-800/20 text-gray-300 dark:text-gray-700",

                  // Past - Not Active
                  !day.isPadding &&
                    !day.isFuture &&
                    !day.isActive &&
                    !day.isToday &&
                    "bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600",

                  // Active
                  day.isActive &&
                    "bg-orange-400 text-white shadow-md shadow-orange-500/20",

                  // Today - Not Active (Warning!)
                  isWarning &&
                    "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-red-500",

                  // Today - Active
                  day.isToday &&
                    day.isActive &&
                    "border-2 border-blue-500 dark:border-blue-400"
                )}
              >
                {!day.isPadding && <span>{day.day}</span>}
                {isWarning && (
                  <div className="absolute inset-0 rounded-xl animate-pulse bg-red-500 opacity-30" />
                )}
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
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Inventory</CardTitle>
        <CardDescription>Power-ups to protect your hard work.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
          <Snowflake className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            Streak Freeze
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You have {freezeCount} equipped.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold rounded-xl">
          <Store className="w-4 h-4 mr-2" />
          Go to Store
        </Button>
      </CardFooter>
    </Card>
  );
}

function StreakMilestonesCard() {
  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Milestones</CardTitle>
        <CardDescription>Celebrate your consistency!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_MILESTONES.map((milestone) => {
          const Icon = milestone.icon;
          return (
            <div
              key={milestone.name}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all",
                milestone.earned
                  ? "bg-green-50 dark:bg-green-950/30"
                  : "bg-gray-100 dark:bg-gray-800/50 opacity-60"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  milestone.earned
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                )}
              >
                {milestone.earned ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {milestone.name}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
