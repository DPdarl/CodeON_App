// app/routes/onboarding.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { CustomizeAvatar } from "~/components/dashboardmodule/CustomizeAvatar";
import { PrivateRoute } from "~/components/PrivateRoute";
import CodeOnLogo from "~/components/ui/CodeOnLogo";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner"; // Assuming you have this, otherwise use alert

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if ALREADY onboarded (Double check)
  useEffect(() => {
    if (user?.isOnboarded) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSaveAvatar = async (avatarConfig: any) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      console.log("Saving profile...");

      // 1. Attempt DB Update
      await updateProfile({
        avatarConfig,
        isOnboarded: true,
      });

      // 2. Success Feedback
      console.log("Profile saved! Redirecting...");

      const audio = new Audio("/success.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#3b82f6"],
      });

      // 3. Delay slightly for effect, then Force Navigation
      setTimeout(() => {
        // Force a hard navigation to ensure loaders re-run
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error: any) {
      console.error("Failed to save avatar:", error);
      alert(`Save failed: ${error.message || "Unknown error"}`);
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
              saveLabel={isSaving ? "Finalizing..." : "Start Adventure"}
            />
          </motion.div>
        </div>
      </div>
    </PrivateRoute>
  );
}
