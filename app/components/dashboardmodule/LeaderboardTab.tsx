// app/components/dashboardmodule/LeaderboardTab.tsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Medal, Trophy, Award, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarDisplay } from "./AvatarDisplay";
import TrophyIcon from "../ui/TrophyIcon";

interface LeaderboardUser {
  id: string;
  displayName: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
  trophies: number;
  league: string;
  avatarConfig?: any;
}

const LEADERBOARD_CACHE_KEY = "codeon_leaderboard_cache";
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function LeaderboardTab() {
  const { user } = useAuth();

  // 1. Initialize from Cache if available
  const [users, setUsers] = useState<LeaderboardUser[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(LEADERBOARD_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return [];
  });

  const [loading, setLoading] = useState(users.length === 0);

  const fetchUsers = useCallback(async (isBackground = false) => {
    if (!isBackground && users.length === 0) setLoading(true);

    let attempt = 0;
    const maxRetries = 3;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("trophies", { ascending: false })
          .limit(100);

        if (error) throw error;

        const fetchedUsers: LeaderboardUser[] = (data || []).map((u: any) => ({
          id: u.id,
          displayName: u.display_name || "Anonymous User",
          photoURL: u.photo_url || null,
          xp: u.xp || 0,
          level: u.level || 1,
          trophies: u.trophies || 0,
          league: u.league || "Novice",
          avatarConfig: u.avatar_config || null,
        }));

        setUsers(fetchedUsers);
        // Update Cache
        localStorage.setItem(
          LEADERBOARD_CACHE_KEY,
          JSON.stringify(fetchedUsers)
        );
        success = true;
      } catch (error) {
        attempt++;
        console.warn(`Leaderboard fetch attempt ${attempt} failed.`);
        if (attempt < maxRetries) await wait(1000);
      }
    }

    if (!isBackground) setLoading(false);
  }, []); // Remove dependencies to keep stable

  useEffect(() => {
    // Initial Fetch (Background if we have data, Foreground if empty)
    fetchUsers(users.length > 0);

    // On Focus (Alt-Tab return)
    const onFocus = () => {
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          fetchUsers(true); // Silent update
        }
      }, 500);
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchUsers]);

  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  const currentUserRank = users.findIndex((u) => u.id === user?.uid);
  const currentUserData =
    currentUserRank !== -1 ? users[currentUserRank] : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <TrophyIcon className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-lg" />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4 font-pixelify tracking-wide">
          Hall of Champions
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Ranked by Trophies earned in the Arena
        </p>
      </motion.div>

      {/* Loading Skeleton */}
      {loading && <LeaderboardSkeleton />}

      {/* Leaderboard Content */}
      {!loading && users.length > 0 && (
        <>
          {/* Top 3 Podium */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 2nd Place */}
            <motion.div
              variants={itemVariants}
              className="md:mt-8 order-2 md:order-1"
            >
              {topThree[1] && <PodiumCard user={topThree[1]} rank={2} />}
            </motion.div>

            {/* 1st Place */}
            <motion.div variants={itemVariants} className="order-1 md:order-2">
              {topThree[0] && <PodiumCard user={topThree[0]} rank={1} />}
            </motion.div>

            {/* 3rd Place */}
            <motion.div variants={itemVariants} className="md:mt-8 order-3">
              {topThree[2] && <PodiumCard user={topThree[2]} rank={3} />}
            </motion.div>
          </motion.div>

          {/* Rest of the Leaderboard (Ranks 4+) */}
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {restOfUsers.map((leaderboardUser, index) => (
              <motion.div key={leaderboardUser.id} variants={itemVariants}>
                <UserRankRow
                  user={leaderboardUser}
                  rank={index + 4}
                  isCurrentUser={leaderboardUser.id === user?.uid}
                />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}

      {/* No Users Found */}
      {!loading && users.length === 0 && (
        <Card className="p-8 text-center bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <Award className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
            The Leaderboard is Empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Be the first to win a trophy!
          </p>
        </Card>
      )}

      {/* Current User's Sticky Rank */}
      {currentUserData && (
        <motion.div
          className="sticky bottom-6 z-20"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="mx-4 md:mx-0 shadow-2xl rounded-xl">
            <UserRankRow
              user={currentUserData}
              rank={currentUserRank + 1}
              isCurrentUser={true}
              isSticky={true}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ... (Sub-components PodiumCard, UserRankRow, LeaderboardSkeleton remain exactly the same as previous steps)
function PodiumCard({ user, rank }: { user: LeaderboardUser; rank: number }) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  return (
    <div
      className={`relative rounded-3xl p-6 flex flex-col items-center text-center shadow-lg transition-all hover:scale-[1.03]
      ${
        isFirst
          ? "bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-900 border-2 border-yellow-400"
          : ""
      }
      ${
        isSecond
          ? "bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/40 dark:to-gray-900 border border-gray-300 dark:border-gray-600"
          : ""
      }
      ${
        isThird
          ? "bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-900 border border-orange-300 dark:border-orange-700"
          : ""
      }
    `}
    >
      <div
        className={`absolute -top-6 w-12 h-12 rounded-full flex items-center justify-center border-4 shadow-md z-10
        ${isFirst ? `bg-yellow-400 border-white dark:border-gray-900` : ""}
        ${isSecond ? `bg-gray-300 border-white dark:border-gray-900` : ""}
        ${isThird ? `bg-orange-500 border-white dark:border-gray-900` : ""}
      `}
      >
        {isFirst ? (
          <Crown className="w-6 h-6 text-white fill-current" />
        ) : (
          <Medal className="w-6 h-6 text-white fill-current" />
        )}
      </div>

      <div
        className={`mt-6 w-24 h-24 rounded-full overflow-hidden border-4 bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative
          ${
            isFirst
              ? "border-yellow-400 ring-4 ring-yellow-400/20"
              : "border-gray-200 dark:border-gray-700"
          }
      `}
      >
        <AvatarDisplay config={user.avatarConfig} headOnly />
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4 truncate w-full px-2">
        {user.displayName}
      </h3>

      <div className="flex flex-col items-center mt-1 space-y-1">
        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {user.league}
        </span>
        <span className="text-xs text-indigo-500 font-semibold">
          Level {user.level}
        </span>
      </div>

      <div className="mt-4 bg-gray-900 dark:bg-white/10 rounded-xl px-4 py-2 text-xl font-black text-white flex items-center gap-2 shadow-inner">
        <TrophyIcon
          className={`w-5 h-5 ${isFirst ? "text-yellow-400" : "text-gray-300"}`}
        />
        {user.trophies}
      </div>
    </div>
  );
}

function UserRankRow({
  user,
  rank,
  isCurrentUser,
  isSticky = false,
}: {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser: boolean;
  isSticky?: boolean;
}) {
  let bgColor = "bg-white dark:bg-gray-900";
  let borderColor = "border-gray-100 dark:border-gray-800";
  let highlightClass = "";

  if (isCurrentUser) {
    if (rank === 1) {
      bgColor = "bg-yellow-50 dark:bg-yellow-900/40";
      borderColor = "border-yellow-400";
      highlightClass =
        "ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-gray-900";
    } else if (rank === 2) {
      bgColor = "bg-gray-100 dark:bg-gray-800";
      borderColor = "border-gray-400";
      highlightClass =
        "ring-2 ring-gray-400 ring-offset-2 dark:ring-offset-gray-900";
    } else if (rank === 3) {
      bgColor = "bg-orange-50 dark:bg-orange-900/40";
      borderColor = "border-orange-400";
      highlightClass =
        "ring-2 ring-orange-400 ring-offset-2 dark:ring-offset-gray-900";
    } else {
      bgColor = "bg-indigo-50 dark:bg-indigo-950/50";
      borderColor = "border-indigo-200 dark:border-indigo-800";
    }
  }

  return (
    <div
      className={`flex items-center p-4 rounded-xl transition-all border
      ${bgColor} ${borderColor} ${highlightClass}
      ${isSticky ? "shadow-2xl" : "shadow-sm"}
    `}
    >
      <div
        className={`w-10 text-center text-lg font-black italic
        ${
          rank <= 3
            ? "text-gray-900 dark:text-white scale-110"
            : "text-gray-400 dark:text-gray-500"
        }
      `}
      >
        #{rank}
      </div>

      <div className="flex-1 flex items-center gap-3 ml-3 overflow-hidden">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
          <AvatarDisplay config={user.avatarConfig} headOnly />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {user.displayName} {isCurrentUser && "(You)"}
            </div>
            {rank === 1 && (
              <Crown className="w-3 h-3 text-yellow-500 fill-current" />
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2">
            <span className="font-semibold text-indigo-500">{user.league}</span>
            <span>•</span>
            <span>Lvl {user.level}</span>
          </div>
        </div>
      </div>

      <div className="text-right pl-2">
        <div
          className={`flex items-center justify-end gap-1.5 text-base font-black ${
            isCurrentUser
              ? "text-indigo-700 dark:text-indigo-300"
              : "text-gray-900 dark:text-white"
          }`}
        >
          <TrophyIcon className="w-4 h-4 text-yellow-500 fill-current" />
          {user.trophies}
        </div>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col items-center ${
              i !== 2 ? "md:mt-8" : ""
            }`}
          >
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="h-6 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/3 mt-2" />
            <Skeleton className="h-10 w-1/2 mt-4 rounded-xl" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          >
            <Skeleton className="h-6 w-8 rounded" />
            <Skeleton className="w-10 h-10 rounded-full ml-3" />
            <div className="flex-1 ml-3 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
