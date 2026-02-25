import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { CustomizeAvatar } from "~/components/dashboardmodule/CustomizeAvatar";
import { PrivateRoute } from "~/components/PrivateRoute";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Stars } from "lucide-react";
import { LoadingScreen } from "~/components/ui/LoadingScreen";

import { OnboardingTour, type TourStep } from "~/components/ui/OnboardingTour";

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const isCompletingRef = useRef(false);

  // Editable Name State
  const [displayName, setDisplayName] = useState(user?.displayName || "Coder");

  // Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);

  const tourSteps: TourStep[] = [
    {
      target: "onboarding-name-input",
      title: "What's your name?",
      content:
        "Enter the display name you want other coders to see in the arena.",
    },
    {
      target: "onboarding-avatar-customizer",
      title: "Customize Your Avatar",
      content:
        "Design your character for your coding adventure! Click 'Enter CodeON' when you're ready to face the challenges.",
    },
  ];

  // Trigger Tour on Mount
  useEffect(() => {
    const timer = setTimeout(() => setIsTourOpen(true), 1200); // Wait for entrance animations
    return () => clearTimeout(timer);
  }, []);

  // Redirect if ALREADY onboarded (Double check)
  useEffect(() => {
    // If they are actively completing it right now, do not bounce them!
    if (user?.isOnboarded && !isCompletingRef.current) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSaveAvatar = async (avatarConfig: any) => {
    if (isSaving) return;
    setIsSaving(true);
    isCompletingRef.current = true; // Lock navigation

    try {
      console.log("Saving profile..."); // 1. Attempt DB Update

      await updateProfile({
        avatarConfig,
        displayName,
      }); // 2. Success Feedback

      toast.success("Welcome to CodeON!"); // Using sonner for consistent UI

      const audio = new Audio("/success.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#ec4899", "#3b82f6"],
      }); // 3. Navigate

      // Try React Router navigation first. If issues persist, revert to window.location
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2500); // Increased timeout slightly to let confetti run better
    } catch (error: any) {
      console.error("Failed to save avatar:", error);
      toast.error(`Save failed: ${error.message || "Unknown error"}`);
      setIsSaving(false);
      isCompletingRef.current = false; // Unlock on error
    }
  };

  return (
    <PrivateRoute>
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-50 dark:bg-[#050510] relative overflow-hidden py-10 px-4 flex flex-col justify-center transition-colors duration-500">
        {/* Dynamic Background Elements - Now with Breathing Animation */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 dark:bg-indigo-600/30 rounded-full blur-[100px] md:blur-[120px] mix-blend-multiply dark:mix-blend-screen"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 dark:bg-purple-600/30 rounded-full blur-[100px] md:blur-[120px] mix-blend-multiply dark:mix-blend-screen"
          />
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-[40%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] md:blur-[150px] mix-blend-multiply dark:mix-blend-screen"
          />
        </div>

        <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center space-y-4 md:space-y-6"
          >
            <div className="flex justify-center relative">
              <div className="absolute inset-0 bg-yellow-500/20 dark:bg-yellow-500/30 blur-2xl rounded-full h-24 w-24 mx-auto" />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative p-2"
              >
                <img
                  src="/assets/icons/coinv2.png"
                  alt="Coin"
                  className="h-20 w-20 object-contain drop-shadow-xl filter"
                />
              </motion.div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white font-pixelify tracking-tight flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
              <span>Welcome,</span>
              <input
                id="onboarding-name-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={20}
                className="bg-white/50 dark:bg-black/20 border-b-4 border-indigo-500 text-center focus:outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-black/50 transition-all rounded-t-xl px-4 py-1 w-[280px] md:w-[350px] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent drop-shadow-sm font-pixelify caret-indigo-600 dark:caret-indigo-400"
                placeholder="Coder"
              />
              <span>!</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              Your coding adventure begins here. Let's design your character for
              CodeON.
            </p>
          </motion.div>

          <motion.div
            id="onboarding-avatar-customizer"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="relative"
          >
            {/* Breathing soft glow behind the card */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.98, 1.05, 0.98] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur-2xl -z-10"
            />
            <CustomizeAvatar
              user={user}
              initialConfig={user?.avatarConfig}
              onSave={handleSaveAvatar}
              saveLabel={isSaving ? "Finalizing..." : "Enter CodeON"}
            />
          </motion.div>
        </div>
      </div>

      <OnboardingTour
        steps={tourSteps}
        isOpen={isTourOpen}
        onComplete={() => setIsTourOpen(false)}
        onSkip={() => setIsTourOpen(false)}
        avatarConfig={user?.avatarConfig}
        // Notice we do NOT pass a `tutorialId`.
        // This ensures saving the reward doesn't happen here on the onboarding screen.
      />
    </PrivateRoute>
  );
}
