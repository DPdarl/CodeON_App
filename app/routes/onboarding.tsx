// app/routes/onboarding.tsx
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { CustomizeAvatar } from "~/components/dashboardmodule/CustomizeAvatar";
import { PrivateRoute } from "~/components/PrivateRoute";
import CodeOnLogo from "~/components/ui/CodeOnLogo";
import { motion } from "framer-motion";

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleSaveAvatar = async (avatarConfig: any) => {
    try {
      // Save the avatar to Firestore
      await updateProfile({ avatarConfig });

      // After saving, redirect to the dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save avatar:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex justify-center">
              <CodeOnLogo className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
              Welcome, {user?.displayName || "Coder"}!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Before we start your coding journey, let's design your character.
              This is how other players will see you in the arena.
            </p>
          </motion.div>

          {/* Avatar Customizer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CustomizeAvatar
              user={user}
              // @ts-ignore
              initialConfig={user?.avatarConfig}
              onSave={handleSaveAvatar}
            />
          </motion.div>
        </div>
      </div>
    </PrivateRoute>
  );
}
