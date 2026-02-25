import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Trophy,
  Loader2,
  Sparkles,
  Database,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import confetti from "canvas-confetti";
import { AvatarDisplay } from "../dashboardmodule/AvatarDisplay";
import { useAuth } from "~/contexts/AuthContext";
import { useGameProgress } from "~/hooks/useGameProgress";
import { useGameSound } from "~/hooks/useGameSound";
import { useIsMobile } from "~/hooks/use-mobile";
import { toast } from "sonner";

export interface TourStep {
  target: string; // ID of the target element
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  avatarConfig?: any;
  tutorialId?: string; // e.g., "homeTab", "playTab" for automatic reward tracking
  forceReward?: boolean; // Used to bypass the hasCompleted check for testing/manual triggers
  returnTo?: string; // URL to redirect to before showing the reward modal
  rewardOnly?: boolean; // Instantly jump to the reward modal
  onStepChange?: (stepIndex: number, step: TourStep) => void;
}

export function OnboardingTour({
  steps,
  isOpen,
  onComplete,
  onSkip,
  avatarConfig,
  tutorialId,
  forceReward,
  returnTo,
  rewardOnly,
  onStepChange,
}: OnboardingTourProps) {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { grantXP } = useGameProgress();
  const { playSound, stopSound } = useGameSound();
  const isMobile = useIsMobile();

  const [currentStep, setCurrentStep] = useState(0);
  const [showRewardView, setShowRewardView] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  // Suppresses the "element not found" error while tab-switch + positioning is settling
  const [isPositioning, setIsPositioning] = useState(true);

  const [positions, setPositions] = useState<
    {
      id: string;
      top: number;
      left: number;
      width: number;
      height: number;
    }[]
  >([]);

  const updatePosition = useCallback(() => {
    if (isOpen && steps[currentStep]) {
      const targetIds = steps[currentStep].target
        .split(",")
        .map((id) => id.trim());

      const newPositions: {
        id: string;
        top: number;
        left: number;
        width: number;
        height: number;
      }[] = [];
      let primaryElement: HTMLElement | null = null;

      targetIds.forEach((targetId, index) => {
        const element = document.getElementById(targetId);
        if (element) {
          if (index === 0) primaryElement = element as HTMLElement;
        }
      });

      if (primaryElement !== null) {
        // Scroll to the first element only
        (primaryElement as HTMLElement).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });

        setTimeout(() => {
          targetIds.forEach((targetId) => {
            const el = document.getElementById(targetId);
            if (el) {
              const rect = el.getBoundingClientRect();
              // Skip elements that are hidden (e.g. md:hidden pill tabs on desktop have zero size)
              if (rect.width === 0 && rect.height === 0) return;
              newPositions.push({
                id: targetId,
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
              });
            }
          });
          setPositions(newPositions);
        }, 400); // Wait for smooth scroll to finish
      } else {
        setPositions([]);
      }
    }
  }, [isOpen, currentStep, steps]);

  // Initial and step change update with delay to allow scroll/render
  useEffect(() => {
    // Mark positioning as in-progress so the error toast is hidden during the window
    setIsPositioning(true);

    // Immediate attempt
    updatePosition();

    // Retry after a longer delay for safety (gives the 400ms scroll+read time inside updatePosition room to breathe)
    const timer = setTimeout(updatePosition, 600);

    // Clear the guard after the full settling window (slightly longer than the last retry)
    const positioningTimer = setTimeout(() => setIsPositioning(false), 900);

    return () => {
      clearTimeout(timer);
      clearTimeout(positioningTimer);
    };
  }, [updatePosition]);

  // Window resize listener
  useEffect(() => {
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true); // Capture scroll events
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  // Reset state when tour closes
  useEffect(() => {
    if (!isOpen) {
      stopSound("tour_voice"); // Instantly cut the voice audio when modal exits
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setShowRewardView(false);
        setIsClaiming(false);
      }, 300); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Watch for 'rewardOnly' flag to skip directly to the end
  useEffect(() => {
    if (isOpen && rewardOnly) {
      setShowRewardView(true);
    }
  }, [isOpen, rewardOnly]);

  // Play dialogue sound when jumping to a new step
  useEffect(() => {
    if (isOpen && !showRewardView && !rewardOnly) {
      playSound("tour_voice");
    }
  }, [isOpen, currentStep, showRewardView, rewardOnly, playSound]);

  // Notify parent of step change (e.g. to switch tabs on mobile)
  useEffect(() => {
    if (isOpen && onStepChange) {
      onStepChange(currentStep, steps[currentStep] || steps[0]);
      // Short delay to allow parent DOM updates (like tab switching) to occur before recalculating highlighting
      setTimeout(updatePosition, 150);
    }
  }, [currentStep, isOpen, onStepChange, steps, updatePosition]);

  // Confetti and Sound Effect when Modal shows
  useEffect(() => {
    if (showRewardView) {
      playSound("complete"); // Celebration sound!

      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#22c55e", "#eab308", "#a855f7"], // Green, Yellow, Purple
          zIndex: 9999,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#22c55e", "#eab308", "#a855f7"],
          zIndex: 9999,
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [showRewardView]);

  if (!isOpen) return null;

  const step = steps[currentStep] || steps[0];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      stopSound("tour_voice"); // Stop the voice immediately on final step progression
      if (tutorialId && user) {
        // Force the DB update if they somehow aren't onboarded yet,
        // or if they just haven't completed this specific tutorial.
        const hasCompleted = user.settings?.tutorials?.[tutorialId];
        if (!user.isOnboarded || !hasCompleted || forceReward) {
          if (returnTo) {
            onComplete();
            navigate(`${returnTo}?reward=${tutorialId}`);
            return;
          }
          setShowRewardView(true);
          return;
        }
      }
      onComplete(); // Already completed before, no reward.
      if (returnTo) {
        navigate(returnTo);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleClaimReward = async () => {
    if (!user || !tutorialId) return;
    setIsClaiming(true);
    try {
      const currentSettings = user.settings || {};
      const updatedSettings = {
        ...currentSettings,
        tutorials: {
          ...currentSettings.tutorials,
          [tutorialId]: true,
        },
      };

      const updates: any = {
        settings: updatedSettings,
        isOnboarded: true, // Always enforce this to true when any tour reward is claimed
      };
      updates.coins = (user.coins || 0) + 50;

      await updateProfile(updates);

      toast.success("Reward Claimed! +50 Coins 🪙 & +50 XP ✨");
      setTimeout(() => grantXP(50, { isTutorial: true }), 1000);

      setShowRewardView(false);
      onComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to claim reward.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          {/* Full Screen SVG Masking for Spotlight */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 100 }}
          >
            <defs>
              <mask id="spotlight-mask">
                {/* Everything is white (solid) by default */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {/* Cut out black rectangles for our targets */}
                {positions.map((pos, index) => (
                  <motion.rect
                    key={index}
                    initial={{
                      x: pos.left - 8,
                      y: pos.top - 8,
                      width: pos.width + 16,
                      height: pos.height + 16,
                    }}
                    animate={{
                      x: pos.left - 8,
                      y: pos.top - 8,
                      width: pos.width + 16,
                      height: pos.height + 16,
                    }}
                    rx={8} // border radius equivalent
                    fill="black"
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                ))}
              </mask>
            </defs>
            {/* Dark overlay with the mask applied */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.75)"
              mask="url(#spotlight-mask)"
            />
            {/* Glowing borders for the highlighted areas */}
            {positions.map((pos, index) => (
              <motion.rect
                key={`border-${index}`}
                initial={{
                  x: pos.left - 8,
                  y: pos.top - 8,
                  width: pos.width + 16,
                  height: pos.height + 16,
                }}
                animate={{
                  x: pos.left - 8,
                  y: pos.top - 8,
                  width: pos.width + 16,
                  height: pos.height + 16,
                }}
                rx={8}
                fill="transparent"
                stroke="white"
                strokeWidth={2}
                opacity={0.5}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  boxShadow: "0 0 15px rgba(255,255,255,0.5) inset",
                }}
              />
            ))}
          </svg>

          {/* --- DIALOG RENDERER (Mobile vs Desktop Ternary) --- */}
          {showRewardView ? (
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-auto bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#0B0B15] border border-green-200 dark:border-green-900 rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm md:max-w-md relative flex flex-col items-center text-center z-[102]"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-500 shadow-inner">
                  <Trophy className="w-7 h-7 md:w-8 md:h-8 drop-shadow-md" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                  Tour Complete!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base font-medium">
                  You've successfully finished this tutorial. Claim your reward!
                </p>

                <div className="flex gap-3 md:gap-4 w-full mb-6 relative z-[103]">
                  <div className="flex-1 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center">
                    <Database className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mb-1" />
                    <span className="font-black text-xs md:text-sm text-yellow-600 dark:text-yellow-400">
                      +50 Coins
                    </span>
                  </div>
                  <div className="flex-1 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-500 mb-1" />
                    <span className="font-black text-xs md:text-sm text-purple-600 dark:text-purple-400">
                      +50 XP
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-lg shadow-lg shadow-green-500/20 active:scale-95 transition-all relative z-[103]"
                  onClick={handleClaimReward}
                  disabled={isClaiming}
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      Claiming...
                    </>
                  ) : (
                    "Claim Rewards"
                  )}
                </Button>
              </motion.div>
            </div>
          ) : isMobile ? (
            // MOBILE VIEW
            <div
              className={cn(
                "fixed left-4 right-4 z-[101] flex justify-center pointer-events-auto",
                step?.position === "center"
                  ? "top-1/2 -translate-y-1/2"
                  : step?.position === "top"
                  ? "top-16"
                  : "bottom-24",
              )}
            >
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white dark:bg-[#0B0B15] border border-indigo-200 dark:border-indigo-900/50 rounded-3xl shadow-2xl p-5 w-full relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Step {currentStep + 1} of{" "}
                    {steps.length > 0 ? steps.length : 1}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight leading-tight">
                  {step?.title || "Tutorial"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5">
                  {step?.content || "Completing tutorial..."}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === 0}
                    onClick={handlePrev}
                    className="mr-auto text-xs py-1 h-8"
                  >
                    <ChevronLeft className="w-3 h-3 mr-1" /> Back
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 font-bold shadow-lg shadow-indigo-500/20 text-xs py-1 h-8"
                    onClick={handleNext}
                  >
                    {isLastStep ? "Finish Tour" : "Next"}
                    {isLastStep ? (
                      <Check className="w-3 h-3 ml-2" />
                    ) : (
                      <ChevronRight className="w-3 h-3 ml-2" />
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          ) : (
            // DESKTOP VIEW: Left aligned, with Avatar character
            <div className="fixed bottom-0 left-0 p-6 z-[101] flex items-end gap-4 pointer-events-auto">
              {/* Animated Avatar Guide */}
              {avatarConfig && (
                <motion.div
                  layoutId="tour-avatar-guide"
                  className="relative w-32 h-32 lg:w-40 lg:h-40 overflow-visible flex-shrink-0"
                >
                  <div className="w-full h-full transform scale-[1.5] origin-bottom-left drop-shadow-2xl">
                    <AvatarDisplay config={avatarConfig} headOnly={false} />
                  </div>
                </motion.div>
              )}

              {/* Speech Bubble Dialog */}
              <motion.div
                layout
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-white dark:bg-[#0B0B15] border border-gray-200 dark:border-gray-800 rounded-tl-3xl rounded-tr-3xl rounded-br-3xl shadow-2xl p-6 max-w-md relative order-2 self-start"
              >
                {/* Arrow pointing left to avatar */}
                <div className="absolute -left-2 bottom-0 w-4 h-4 bg-white dark:bg-[#0B0B15] border-l border-b border-gray-200 dark:border-gray-800 transform rotate-45 translate-y-1/2" />
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Step {currentStep + 1} of{" "}
                    {steps.length > 0 ? steps.length : 1}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                  {step?.title || "Tutorial"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6">
                  {step?.content || "Completing tutorial..."}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === 0}
                    onClick={handlePrev}
                    className="mr-auto"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 font-bold shadow-lg shadow-indigo-500/20"
                    onClick={handleNext}
                  >
                    {isLastStep ? "Finish Tour" : "Next"}
                    {isLastStep ? (
                      <Check className="w-4 h-4 ml-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Missing Element Fallback — only shown after positioning has fully settled */}
          {positions.length === 0 && !isPositioning && !showRewardView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-4 py-2 rounded-full text-sm font-bold z-[102]"
            >
              Target element not visible. Please scroll or resize.
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
