import { useState, useEffect } from "react";
// ▼▼▼ FIX 1: Import 'app' (the FirebaseApp) and 'getFirestore' ▼▼▼
import app from "~/lib/firebase";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
// ▲▲▲ END OF FIX 1 ▲▲▲
import { useAuth } from "~/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Medal, Trophy, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

// Define the shape of user data we expect from Firestore
interface LeaderboardUser {
  id: string;
  displayName: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
}

// ▼▼▼ FIX 1 (Continued): Initialize the db instance from the app ▼▼▼
const db = getFirestore(app);
// ▲▲▲ END OF FIX 1 ▲▲▲

export function LeaderboardTab() {
  const { user } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function for Avatar fallbacks
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Query the 'users' collection, order by 'xp' descending, limit to 100
        const usersRef = collection(db, "users"); // This will now work
        const q = query(usersRef, orderBy("xp", "desc"), limit(100));

        const querySnapshot = await getDocs(q);
        const fetchedUsers: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
          // IMPORTANT: Assumes user data in Firestore has fields
          // 'displayName', 'photoURL', 'xp', and 'level'
          const data = doc.data();
          fetchedUsers.push({
            id: doc.id,
            displayName: data.displayName || "Anonymous User",
            photoURL: data.photoURL || null,
            xp: data.xp || 0,
            level: data.level || 1,
          });
        });

        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Separate top 3 from the rest
  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  // Find the current user's rank
  const currentUserRank = users.findIndex((u) => u.id === user?.uid);
  const currentUserData =
    currentUserRank !== -1 ? users[currentUserRank] : null;

  // Animation variants for items
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
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-4">
          Hall of Coders
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          See who's commanding the world of code!
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
            <motion.div variants={itemVariants} className="md:mt-8">
              {topThree[1] && (
                <PodiumCard
                  user={topThree[1]}
                  rank={2}
                  getInitials={getUserInitials}
                />
              )}
            </motion.div>

            {/* 1st Place */}
            <motion.div variants={itemVariants}>
              {topThree[0] && (
                <PodiumCard
                  user={topThree[0]}
                  rank={1}
                  getInitials={getUserInitials}
                />
              )}
            </motion.div>

            {/* 3rd Place */}
            <motion.div variants={itemVariants} className="md:mt-8">
              {topThree[2] && (
                <PodiumCard
                  user={topThree[2]}
                  rank={3}
                  getInitials={getUserInitials}
                />
              )}
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
                  getInitials={getUserInitials}
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
            Be the first to get on the board by completing a challenge!
          </p>
        </Card>
      )}

      {/* Current User's Sticky Rank */}
      {currentUserData && (
        <motion.div
          className="sticky bottom-6"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <UserRankRow
            user={currentUserData}
            rank={currentUserRank + 1}
            isCurrentUser={true}
            isSticky={true}
            getInitials={getUserInitials}
          />
        </motion.div>
      )}
    </div>
  );
}

// --- Sub-components ---

// Card for 1st, 2nd, 3rd place
function PodiumCard({
  user,
  rank,
  getInitials,
}: {
  user: LeaderboardUser;
  rank: number;
  getInitials: (name: string | null) => string;
}) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col items-center text-center shadow-lg transition-all hover:scale-[1.03]
      ${
        isFirst
          ? "bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-400"
          : ""
      }
      ${
        isSecond
          ? "bg-gray-50 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700"
          : ""
      }
      ${
        isThird
          ? "bg-orange-50 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-800"
          : ""
      }
    `}
    >
      {/* Medal Icon */}
      <div
        className={`absolute -top-5 w-10 h-10 rounded-full flex items-center justify-center border-4
        ${isFirst ? `bg-yellow-500 border-white dark:border-gray-900` : ""}
        ${isSecond ? `bg-gray-400 border-white dark:border-gray-900` : ""}
        ${isThird ? `bg-orange-600 border-white dark:border-gray-900` : ""}
      `}
      >
        <Medal className="w-5 h-5 text-white" />
      </div>

      <Avatar
        className={`w-20 h-20 mt-4 border-4 ${
          isFirst ? "border-yellow-400" : "border-transparent"
        }`}
      >
        <AvatarImage src={user.photoURL || undefined} />
        <AvatarFallback className="text-2xl">
          {getInitials(user.displayName)}
        </AvatarFallback>
      </Avatar>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4 truncate w-full px-2">
        {user.displayName}
      </h3>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Level {user.level}
      </span>

      <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1.5 text-lg font-black text-gray-900 dark:text-white flex items-center gap-1.5">
        <Zap
          className={`w-4 h-4 ${isFirst ? "text-yellow-500" : "text-gray-500"}`}
        />
        {user.xp} XP
      </div>
    </div>
  );
}

// Row for ranks 4+
function UserRankRow({
  user,
  rank,
  isCurrentUser,
  isSticky = false,
  getInitials,
}: {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser: boolean;
  isSticky?: boolean;
  getInitials: (name: string | null) => string;
}) {
  return (
    <div
      className={`flex items-center p-4 rounded-xl transition-colors
      ${
        isCurrentUser
          ? "bg-indigo-100 dark:bg-indigo-950/50 border-2 border-indigo-400"
          : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
      }
      ${isSticky ? "shadow-2xl" : "shadow-sm"}
    `}
    >
      {/* Rank */}
      <div
        className={`w-10 text-center text-lg font-black ${
          isCurrentUser
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        #{rank}
      </div>

      {/* User Info */}
      <div className="flex-1 flex items-center gap-3 ml-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user.photoURL || undefined} />
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">
            {user.displayName} {isCurrentUser && "(You)"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Level {user.level}
          </div>
        </div>
      </div>

      {/* XP */}
      <div className="text-right">
        <div
          className={`text-base font-bold ${
            isCurrentUser
              ? "text-indigo-700 dark:text-indigo-300"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {/* ▼▼▼ FIX 2: Removed my '... : img : ...' typo ▼▼▼ */}
          {user.xp} XP
        </div>
      </div>
    </div>
  );
}

// Skeleton loading component
function LeaderboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Top 3 Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:mt-8 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-6 w-3/4 mt-4" />
          {/* ▼▼▼ FIX 3: Corrected typo 'w-1/K;' to 'w-1/4' ▼▼▼ */}
          <Skeleton className="h-4 w-1/4 mt-2" />
          <Skeleton className="h-10 w-1/2 mt-4 rounded-full" />
        </div>
        <div className="p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-800 flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-6 w-3/4 mt-4" />
          <Skeleton className="h-4 w-1/4 mt-2" />
          <Skeleton className="h-10 w-1/2 mt-4 rounded-full" />
        </div>
        <div className="md:mt-8 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-6 w-3/4 mt-4" />
          <Skeleton className="h-4 w-1/4 mt-2" />
          <Skeleton className="h-10 w-1/2 mt-4 rounded-full" />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          >
            <Skeleton className="h-6 w-10 rounded" />
            <Skeleton className="w-10 h-10 rounded-full ml-3" />
            <div className="flex-1 ml-3 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
