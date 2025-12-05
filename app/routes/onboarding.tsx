import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { CustomizeAvatar } from "~/components/dashboardmodule/CustomizeAvatar";
import { PrivateRoute } from "~/components/PrivateRoute";
import CodeOnLogo from "~/components/ui/CodeOnLogo";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAvatar = async (avatarConfig: any) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await updateProfile({ avatarConfig });

      const audio = new Audio("/success.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#3b82f6"],
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Failed to save avatar:", error);
      alert("Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <CodeOnLogo className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white font-pixelify">
              Welcome, {user?.displayName || "Coder"}!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Let's design your character for the arena.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CustomizeAvatar
              user={user}
              initialConfig={user?.avatarConfig}
              onSave={handleSaveAvatar}
              saveLabel={isSaving ? "Saving..." : "Start Adventure"}
            />
          </motion.div>
        </div>
      </div>
    </PrivateRoute>
  );
}
