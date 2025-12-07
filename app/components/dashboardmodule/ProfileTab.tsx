// app/components/dashboardmodule/ProfileTab.tsx
import { useState, useEffect } from "react";
import { useAuth, type UserData } from "~/contexts/AuthContext";
import { getUserRank } from "~/lib/leaderboard-logic";
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
  Flame,
  Trophy,
  Sparkles,
  Medal,
  Crown,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner"; // Ensure you have sonner installed or use your preferred toast lib

interface ProfileTabProps {
  user: UserData | null;
  onSaveAvatar: (avatarConfig: any) => Promise<void>;
}

export function ProfileTab({ user, onSaveAvatar }: ProfileTabProps) {
  const { updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [realRank, setRealRank] = useState<number | null>(null);

  // VALIDATION: Track if saving is in progress
  const [isSaving, setIsSaving] = useState(false);

  // VALIDATION: Check if name actually changed
  const isProfileChanged =
    displayName.trim() !== "" && displayName.trim() !== user?.displayName;

  useEffect(() => {
    // Sync local state if user updates externally
    if (user?.displayName) setDisplayName(user.displayName);

    // Fetch Rank (Safe Mode)
    const fetchRank = async () => {
      if (user?.trophies !== undefined) {
        try {
          const r = await getUserRank(user.trophies);
          setRealRank(r);
        } catch (e) {
          console.warn("Could not fetch rank (offline?)", e);
        }
      }
    };
    fetchRank();
  }, [user]);

  // Derived Stats
  const stats = {
    trophies: user?.trophies || 0,
    streak: user?.streaks || 0,
    league: user?.league || "Novice",
    rank: realRank ? `#${realRank}` : "Unranked",
  };

  const handleProfileUpdate = async () => {
    if (!isProfileChanged) return;

    setIsSaving(true);
    try {
      // This calls the robust retry logic in AuthContext
      await updateProfile({ displayName: displayName.trim() });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSaveWithToast = async (config: any) => {
    // CustomizeAvatar handles its own loading state, but we wrap the toast here
    await onSaveAvatar(config);
    toast.success("Avatar updated! Looking good.");
  };

  const creationDate = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString()
    : "N/A";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 font-pixelify">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <AvatarDisplay config={user?.avatarConfig} headOnly />
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

            {/* Rank Badge */}
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
          icon={Trophy}
          value={stats.trophies.toLocaleString()}
          label="Total Trophies"
          color="text-yellow-500"
        />
        <StatItem
          icon={Flame}
          value={stats.streak.toString()}
          label="Day Streak"
          color="text-orange-500"
        />
        <StatItem
          icon={Crown}
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
                    placeholder="Enter your coder name"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleProfileUpdate}
                  disabled={!isProfileChanged || isSaving}
                  className={`w-full font-bold rounded-xl transition-all ${
                    !isProfileChanged
                      ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {isSaving
                    ? "Saving..."
                    : isProfileChanged
                    ? "Save Changes"
                    : "No Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="avatar">
            <div className="mt-4">
              <CustomizeAvatar
                user={user}
                initialConfig={user?.avatarConfig}
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
    <div className="flex flex-col md:flex-row items-center md:items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:scale-[1.02]">
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
