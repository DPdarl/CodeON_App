// app/components/dashboardmodule/ProfileTab.tsx
import { useState, useEffect } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { User as AuthUser } from "firebase/auth";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CustomizeAvatar } from "./CustomizeAvatar";
import { AvatarDisplay } from "./AvatarDisplay";
import { User, Calendar, Zap, Flame, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
// ▼▼▼ IMPORT TOAST ▼▼▼
import { Toaster, toast } from "sonner";

interface ProfileTabProps {
  user: AuthUser | null;
  onSaveAvatar: (avatarConfig: any) => Promise<void>;
}

const MOCK_STATS = { totalXp: 4500, streak: 5, league: "Gold" };

export function ProfileTab({ user, onSaveAvatar }: ProfileTabProps) {
  const { updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  useEffect(() => {
    if (user?.displayName) setDisplayName(user.displayName);
  }, [user]);

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
          </CardContent>
        </Card>
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
