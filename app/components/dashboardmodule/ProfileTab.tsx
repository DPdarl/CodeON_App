// app/components/dashboardmodule/ProfileTab.tsx
import { useState, useEffect } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { User as AuthUser } from "firebase/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CustomizeAvatar } from "./CustomizeAvatar";
import {
  User,
  Mail,
  Calendar,
  Zap,
  Flame,
  Trophy,
  Sparkles, // Added Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileTabProps {
  user: AuthUser | null;
  onSaveAvatar: (avatarConfig: any) => Promise<void>;
}

// Mock stats - TODO: Replace with real user data
const MOCK_STATS = {
  totalXp: 4500,
  streak: 5,
  league: "Gold",
};

export function ProfileTab({ user, onSaveAvatar }: ProfileTabProps) {
  const { updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    if (!updateProfile) {
      alert("Error: Update function not available.");
      return;
    }
    try {
      await updateProfile({ displayName });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const creationDate = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "N/A";

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    // ▼▼▼ THIS IS THE FIX ▼▼▼
    // Changed max-w-4xl to max-w-6xl
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* --- 1. Duolingo-style Profile Header --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-indigo-500 shadow-md">
              <AvatarImage src={user?.photoURL || undefined} />
              <AvatarFallback className="text-3xl">
                {getUserInitials(user?.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {user?.displayName || "New Coder"}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 dark:text-gray-400 mt-2">
                <Calendar className="w-4 h-4 mr-2" />
                Joined: {creationDate}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* --- 2. Duolingo-style Stats Grid --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <StatItem
              icon={Zap}
              value={MOCK_STATS.totalXp.toLocaleString()}
              label="Total XP"
              color="text-yellow-500"
            />
            <StatItem
              icon={Flame}
              value={MOCK_STATS.streak.toString()}
              label="Day Streak"
              color="text-orange-500"
            />
            <StatItem
              icon={Trophy}
              value={MOCK_STATS.league}
              label="Current League"
              color="text-amber-600"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* --- 3. Tabbed Edit Section --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto h-12 rounded-xl">
            <TabsTrigger value="profile" className="h-10 rounded-lg">
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </TabsTrigger>
            <TabsTrigger value="avatar" className="h-10 rounded-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Edit Avatar
            </TabsTrigger>
          </TabsList>

          {/* Edit Profile Tab */}
          <TabsContent value="profile">
            <Card className="mt-4 bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
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
                    className="text-base"
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

          {/* Edit Avatar Tab */}
          <TabsContent value="avatar">
            <div className="mt-4">
              <CustomizeAvatar
                user={user}
                // @ts-ignore
                initialConfig={user?.avatarConfig}
                onSave={onSaveAvatar}
              />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// --- Stat Item Sub-component ---
function StatItem({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
      <Icon className={`w-8 h-8 ${color}`} />
      <div>
        <div className="text-2xl font-black text-gray-900 dark:text-white">
          {value}
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </div>
      </div>
    </div>
  );
}
