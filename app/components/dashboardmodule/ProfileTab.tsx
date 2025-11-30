// app/components/dashboardmodule/ProfileTab.tsx
import { useState, useEffect } from "react";
import { useAuth, type UserData } from "~/contexts/AuthContext";
import { getUserRank } from "~/lib/leaderboard-logic"; // Import helper
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CustomizeAvatar } from "./CustomizeAvatar";
import { AvatarDisplay } from "./AvatarDisplay";
import {
  User,
  Calendar,
  Zap,
  Flame,
  Trophy,
  Sparkles,
  Medal,
} from "lucide-react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";

interface ProfileTabProps {
  user: UserData | null;
  onSaveAvatar: (avatarConfig: any) => Promise<void>;
}

export function ProfileTab({ user, onSaveAvatar }: ProfileTabProps) {
  const { updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [realRank, setRealRank] = useState<number | null>(null);

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);

    // Fetch Rank on Mount
    const fetchRank = async () => {
      if (user?.xp !== undefined) {
        const r = await getUserRank(user.xp);
        setRealRank(r);
      }
    };
    fetchRank();
  }, [user]);

  // Derived Stats
  const stats = {
    totalXp: user?.xp || 0,
    streak: user?.streaks || 0,
    // Use the stored league, or fallback to "Novice"
    league: user?.league || "Novice",
    rank: realRank ? `#${realRank}` : "Unranked",
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfile({ displayName });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const handleAvatarSaveWithToast = async (config: any) => {
    await onSaveAvatar(config);
    toast.success("Avatar updated! Looking good.");
  };

  const creationDate = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "N/A";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-pixelify">
      <Toaster position="top-center" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <AvatarDisplay config={(user as any)?.avatarConfig} headOnly />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {user?.displayName || "New Coder"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 mt-2">
                <Calendar className="w-4 h-4 mr-2" /> Joined: {creationDate}
              </div>
            </div>

            {/* Rank Badge (Visual Flair) */}
            <div className="hidden sm:flex ml-auto flex-col items-end">
              <div className="text-sm text-gray-500">Global Rank</div>
              <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {stats.rank}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatItem
          icon={Zap}
          value={stats.totalXp.toLocaleString()}
          label="Total XP"
          color="text-yellow-500"
        />
        <StatItem
          icon={Flame}
          value={stats.streak.toString()}
          label="Day Streak"
          color="text-orange-500"
        />
        <StatItem
          icon={Trophy}
          value={stats.league}
          label="League"
          color="text-purple-500"
        />
        <StatItem
          icon={Medal}
          value={stats.rank}
          label="Global Rank"
          color="text-blue-500"
        />
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto h-12 rounded-xl">
            <TabsTrigger value="profile" className="h-10 rounded-lg">
              <User className="w-4 h-4 mr-2" /> Edit Profile
            </TabsTrigger>
            <TabsTrigger value="avatar" className="h-10 rounded-lg">
              <Sparkles className="w-4 h-4 mr-2" /> Edit Avatar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card className="mt-4 bg-white dark:bg-gray-900 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleProfileUpdate}
                  className="w-full font-bold rounded-xl"
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="avatar">
            <div className="mt-4">
              <CustomizeAvatar
                user={user}
                initialConfig={(user as any)?.avatarConfig}
                onSave={handleAvatarSaveWithToast}
              />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function StatItem({ icon: Icon, value, label, color }: any) {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="text-center md:text-left">
        <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  );
}
