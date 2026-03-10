import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "@remix-run/react";
import {
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Lock,
  User,
  Zap,
  Book,
  Code,
  Award,
  Star,
  Terminal, // [NEW]
  Repeat, // [NEW]
  Layers, // [NEW]
  Wand2, // [NEW]
  Crown, // [NEW]
  PlayCircle, // [NEW]
  ArrowRight, // [NEW]
  Compass, // [NEW]
  MapPin, // [NEW]
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
// challenges are now fetched from DB via ChallengeContext — no static import needed
import { useAuth } from "~/contexts/AuthContext"; // Import Auth Context
import {
  useChallengeContext,
  ChallengeProvider,
} from "~/contexts/ChallengeContext"; // Import Challenge Context
import { AvatarDisplay } from "~/components/dashboardmodule/AvatarDisplay";
import { MODULES, type ModuleData } from "~/data/challenges"; // Import shared MODULES
import { OnboardingTour, type TourStep } from "~/components/ui/OnboardingTour";

// Update ModuleSection to accept an optional ID for the first module
const ModuleSection = ({
  module,
  isOpen,
  onToggle,
  isLocked,
  id,
  challenges, // [DB] received from parent
}: {
  module: ModuleData;
  isOpen: boolean;
  onToggle: () => void;
  isLocked: boolean;
  id?: string;
  challenges: any[];
}) => {
  // Filter challenges for this module
  const moduleChallenges = useMemo(
    () => challenges.filter((c) => c.moduleId === module.id),
    [module.id, challenges],
  );

  const { completed } = useChallengeContext();

  return (
    <div
      id={id} // [NEW] Apply ID here
      className={`relative pl-12 pb-8 ${
        isLocked ? "opacity-75 grayscale" : ""
      }`}
    >
      {/* Connector */}
      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-800" />

      {/* Number Badge */}
      <button
        onClick={isLocked ? undefined : onToggle}
        disabled={isLocked}
        className={`
                absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 transition-all duration-300
                ${
                  isLocked
                    ? "bg-[#0F172A] border-gray-700 text-gray-500 cursor-not-allowed"
                    : isOpen
                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] cursor-pointer"
                    : "bg-[#0F172A] border-blue-500 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                }
            `}
      >
        {isLocked ? <Lock size={12} /> : module.id}
      </button>

      {/* Card */}
      <div
        className={`bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 shadow-sm dark:shadow-none ${
          isLocked ? "opacity-80" : ""
        }`}
      >
        <div
          className={`p-5 flex items-center justify-between transition-colors ${
            isLocked
              ? "cursor-not-allowed"
              : "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
          onClick={isLocked ? undefined : onToggle}
        >
          <div>
            <h3
              className={`text-lg font-bold flex items-center gap-3 ${
                isLocked ? "text-gray-500" : "text-gray-900 dark:text-white"
              }`}
            >
              {module.title}
              {isLocked && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 border border-gray-200 dark:border-gray-700">
                  Locked
                </span>
              )}
            </h3>
            {isOpen && (
              <div className="mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {module.description}
                </p>
                <Badge
                  variant="outline"
                  className="mt-2 text-[10px] py-0 h-5 border-blue-500/20 text-blue-500 dark:text-blue-400 bg-blue-500/5"
                >
                  {module.csharpTopic}
                </Badge>
              </div>
            )}
          </div>
          <div className="text-gray-400">
            {isLocked ? null : isOpen ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
        </div>

        {/* Content */}
        {isOpen && !isLocked && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161b22] p-2">
            <div className="bg-white dark:bg-[#0F172A]/50 rounded-lg p-2 border border-gray-200 dark:border-transparent">
              {moduleChallenges.length > 0 ? (
                moduleChallenges.map((challenge, idx) => {
                  // Calculate if this specific challenge is locked
                  // A challenge is locked if:
                  // 1. It's not the first global challenge (index > 0)
                  // 2. The *previous* global challenge is NOT completed.

                  const globalIndex = challenges.findIndex(
                    (c) => c.id === challenge.id,
                  );
                  const isChallengeLocked =
                    globalIndex > 0 &&
                    !completed.includes(challenges[globalIndex - 1].id);

                  return (
                    <ChallengeRow
                      key={challenge.id}
                      challenge={challenge}
                      index={idx}
                      isLocked={isChallengeLocked}
                    />
                  );
                })
              ) : (
                <div className="py-4 text-center text-gray-500 text-sm italic">
                  Content coming soon...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Components ---

const StatusButton = ({
  status,
  onClick,
  label, // [NEW] Added optional label
}: {
  status: "completed" | "active" | "locked";
  onClick?: () => void;
  label?: string; // [NEW]
}) => {
  if (status === "completed") {
    return (
      <Button
        variant="outline"
        onClick={onClick} // [NEW] Keep it clickable if needed
        className={`border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 h-8 font-bold ${
          label ? "px-2 text-[10px]" : "w-24 text-xs"
        }`}
      >
        {label || "Done!"}
      </Button>
    );
  }
  if (status === "active") {
    return (
      <Button
        className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] w-24 h-8 text-xs font-bold animate-pulse-subtle"
        onClick={onClick}
      >
        Start
      </Button>
    );
  }
  return (
    <Button variant="ghost" disabled className="text-gray-600 w-24 h-8 text-xs">
      ???
    </Button>
  );
};

const isModuleLocked = (
  moduleId: number,
  completedIds: string[],
  challenges: any[],
) => {
  if (moduleId === 0) return false;

  const prevModuleChallenges = challenges.filter(
    (c) => c.moduleId === moduleId - 1,
  );
  if (prevModuleChallenges.length === 0) return true;

  const lastChallenge = prevModuleChallenges[prevModuleChallenges.length - 1];
  return !completedIds.includes(lastChallenge.id);
};

const ChallengeRow = ({
  challenge,
  index,
  isLocked,
}: {
  challenge: any;
  index: number;
  isLocked: boolean;
}) => {
  const navigate = useNavigate();
  const { stars, completed } = useChallengeContext();

  const isCompleted = completed.includes(challenge.id);
  // Status logic:
  // - Completed: In completed array
  // - Active: Not completed, not locked
  // - Locked: Locked
  const status = isCompleted ? "completed" : isLocked ? "locked" : "active";

  const earnedStars = stars[challenge.id] || 0;

  const handleStart = () => {
    if (status !== "locked") {
      // If it's the tutorial and it's already completed, replay the tour.
      if (status === "completed" && challenge.id === "0.1") {
        navigate(`/machine-problem?id=${challenge.id}&tour=true`);
      } else {
        navigate(`/machine-problem?id=${challenge.id}`);
      }
    }
  };

  return (
    <div
      className={`grid grid-cols-[1fr_auto] items-center gap-3 py-3 px-3 sm:px-4 border-b border-gray-100 dark:border-gray-800/50 last:border-0 rounded-lg transition-colors group ${
        status === "locked"
          ? "opacity-60 cursor-not-allowed bg-transparent"
          : "hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
      }`}
      onClick={handleStart} // Make whole row clickable if active
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
        <span className="text-gray-400 dark:text-gray-500 font-mono text-[10px] sm:text-xs flex items-center gap-1 sm:w-20 shrink-0 uppercase tracking-wide">
          {status === "locked" && <Lock size={10} />}
          MP {challenge.id}
        </span>
        <div className="flex flex-col min-w-0">
          <span
            className={`font-medium text-sm sm:text-base truncate pr-2 ${
              status === "locked"
                ? "text-gray-400 dark:text-gray-500"
                : "text-gray-900 dark:text-gray-200"
            }`}
          >
            {challenge.title}
          </span>

          {/* Rewards Row */}
          <div className="flex items-center gap-3 mt-1 sm:mt-1.5 flex-wrap">
            {/* Star Rating Display */}
            {challenge.moduleId !== 0 && (
              <div className="flex gap-0.5">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    size={13}
                    className={
                      isCompleted
                        ? star <= earnedStars
                          ? "text-yellow-400 fill-yellow-400" // Earned
                          : "text-gray-300 dark:text-gray-700" // Unearned but completed
                        : "text-gray-200 dark:text-gray-800" // Not yet completed (Hollow/Dim)
                    }
                  />
                ))}
              </div>
            )}

            {/* XP and Coin Badges */}
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[10px]">✨</span>
                {challenge.xpReward || 50} XP
              </span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 rounded text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[10px]">🪙</span>
                {challenge.coinsReward || 10}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <StatusButton
          status={status}
          onClick={handleStart}
          label={
            status === "completed" && challenge.id === "0.1"
              ? "Replay Tutorial"
              : undefined
          }
        />
      </div>
    </div>
  );
};

// --- Sidebar Widgets (Connected to Real Data) ---

const ProfileWidget = ({ user }: { user: any }) => (
  <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm dark:shadow-none">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12">
        {user.avatarConfig ? (
          <AvatarDisplay
            config={user.avatarConfig}
            className="w-full h-full border-2 border-blue-500 rounded-full bg-gray-100 dark:bg-gray-800"
            headOnly
          />
        ) : user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-full h-full rounded-full border-2 border-blue-500"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/10">
            {user.displayName?.charAt(0) || "U"}
          </div>
        )}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
          {user.displayName || "Coder"}
        </h3>
        <p className="text-sm text-blue-500 dark:text-blue-400 font-medium">
          Level {user.level || 1}
        </p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-800 flex flex-col items-center">
        <span className="text-xs text-gray-500 uppercase">Stars</span>
        <span className="text-lg font-bold text-yellow-500 flex items-center gap-1">
          {user.stars || 0} <span className="text-[10px]">⭐</span>
        </span>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-200 dark:border-gray-800 flex flex-col items-center">
        <span className="text-xs text-gray-500 uppercase">Coins</span>
        <span className="text-lg font-bold text-yellow-500 flex items-center gap-1">
          {user.coins || 0} <span className="text-[10px]">🪙</span>
        </span>
      </div>
    </div>
    <Link to="/profile">
      <Button className="w-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700 h-9 transition-colors">
        View Profile
      </Button>
    </Link>
  </div>
);

const ProgressWidget = ({
  user,
  completed,
  challenges,
}: {
  user: any;
  completed: string[];
  challenges: any[];
}) => {
  // Machine Problems Progress
  const totalChallenges = challenges.length;
  const completedCount = completed.length;
  const mpProgress =
    totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;

  // Stars Progress
  const scorableChallenges = challenges.filter((c) => c.moduleId !== 0).length;
  const totalPossibleStars = scorableChallenges * 3;
  const userStars = user.stars || 0;
  const starProgress =
    totalPossibleStars > 0 ? (userStars / totalPossibleStars) * 100 : 0;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm dark:shadow-none">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Award className="text-yellow-500" size={18} />
        Course Progress
      </h3>

      <div className="space-y-5">
        {/* Machine Problems Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
              <Code size={14} className="text-blue-500 dark:text-blue-400" />{" "}
              Machine Problems
            </span>
            <span className="text-gray-700 dark:text-gray-200 font-mono text-xs">
              {completedCount} / {totalChallenges}
            </span>
          </div>
          <Progress
            value={mpProgress}
            className="h-1.5 bg-gray-100 dark:bg-gray-800"
          />
        </div>

        {/* Stars Claimed Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
              <Star size={14} className="text-yellow-400" /> Stars Claimed
            </span>
            <span className="text-gray-700 dark:text-gray-200 font-mono text-xs">
              {userStars} / {totalPossibleStars}
            </span>
          </div>
          <Progress
            value={starProgress}
            className="h-1.5 bg-gray-100 dark:bg-gray-800 text-yellow-500"
          />
        </div>
      </div>
    </div>
  );
};

const BadgesWidget = ({ user }: { user: any }) => {
  const { completed, challenges } = useChallengeContext();

  // Define Badge Data with Titles
  const badges = [
    {
      moduleId: 1,
      title: "Console Commander",
      icon: Terminal,
      color: "text-blue-500",
    },
    { moduleId: 2, title: "Logic Lord", icon: Zap, color: "text-yellow-500" },
    {
      moduleId: 3,
      title: "Loop Legend",
      icon: Repeat,
      color: "text-green-500",
    }, // Need Repeat icon
    { moduleId: 4, title: "Array Ace", icon: Layers, color: "text-purple-500" }, // Need Layers icon
    {
      moduleId: 5,
      title: "Method Magician",
      icon: Wand2,
      color: "text-pink-500",
    }, // Need Wand2 icon
    {
      moduleId: 6,
      title: "Object Oriented Oracle",
      icon: Crown,
      color: "text-orange-500",
    }, // Need Crown icon
  ];

  // Helper to check if a module is fully completed
  // For now, simpler logic: verify if the *last* challenge of a module is in `completed`?
  // Or just check if ALL challenges of that module are in `completed`.
  const isModuleCompleted = (modId: number) => {
    const modChallenges = challenges.filter((c) => c.moduleId === modId);
    if (modChallenges.length === 0) return false;
    return modChallenges.every((c) => completed.includes(c.id));
  };

  const earnedBadges = badges.filter((b) =>
    isModuleCompleted(b.moduleId),
  ).length;

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">
          Certificates
        </h3>
        <span className="text-xs text-gray-500">{earnedBadges}/6</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge) => {
          const unlocked = isModuleCompleted(badge.moduleId);
          return (
            <div
              key={badge.moduleId}
              className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-2 text-center gap-2 transition-all duration-300 group relative
                ${
                  unlocked
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 grayscale opacity-60"
                }
              `}
              title={badge.title}
            >
              <badge.icon
                className={`w-6 h-6 ${
                  unlocked ? badge.color : "text-gray-400"
                } transition-transform group-hover:scale-110`}
              />
              <span className="text-[10px] font-bold leading-tight line-clamp-2">
                {badge.title}
              </span>

              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-[1px] rounded-lg">
                  <Lock size={12} className="text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TOUR_STEPS: TourStep[] = [
  {
    target: "play-title",
    title: "C#allenges",
    content:
      "Welcome to Machine Problems! This is where you test your knowledge with pure coding puzzles.",
  },
  {
    target: "play-module-1",
    title: "Learning Modules",
    content:
      "Challenges are grouped into modules. Start with the Module 0 Tutorial to learn the interface, unlock Module 1, and grab some easy rewards!",
  },
  {
    target: "play-stats",
    title: "Course Progress",
    content:
      "Use this sidebar to track your stats, certificates earned, and overall progression. Earn all 6 certificates to complete the course!",
  },
];

const CHAPTERS_REQUIRED = 5;

const ChallengesContent = () => {
  const { user } = useAuth();
  const { completed, challenges } = useChallengeContext();
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTour, setShowTour] = useState(false);
  const [isManual, setIsManual] = useState(false);

  const completedChaptersCount = user?.completedChapters?.length || 0;
  const isChallengesLocked = completedChaptersCount < CHAPTERS_REQUIRED;

  useEffect(() => {
    if (user) {
      const isManualTrigger = searchParams.get("tour") === "true";
      const hasSeenTour = user?.settings?.tutorials?.challengesTab;

      if (isManualTrigger) {
        setShowTour(true);
        setIsManual(true);
        setSearchParams((params) => {
          const newParams = new URLSearchParams(params);
          newParams.delete("tour");
          return newParams;
        });
      } else if (!hasSeenTour) {
        const timer = setTimeout(() => setShowTour(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, searchParams, setSearchParams]);

  const toggleModule = (id: number) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  if (!user) return null;

  // --- LOCK GATE ---
  if (isChallengesLocked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center ring-4 ring-orange-50 dark:ring-orange-900/10">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>
          {/* Text */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              C#allenges Locked
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Complete{" "}
              <span className="font-bold text-orange-500">
                {CHAPTERS_REQUIRED} Adventure Chapters
              </span>{" "}
              first to unlock Machine Problems.
            </p>
          </div>
          {/* Progress */}
          <div className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-gray-500">Adventure Progress</span>
              <span className="text-orange-500">
                {completedChaptersCount} / {CHAPTERS_REQUIRED} chapters
              </span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (completedChaptersCount / CHAPTERS_REQUIRED) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {CHAPTERS_REQUIRED - completedChaptersCount} more chapter
              {CHAPTERS_REQUIRED - completedChaptersCount !== 1 ? "s" : ""} to
              go!
            </p>
          </div>
          {/* CTA */}
          <button
            onClick={() => navigate("/play/adventure")}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all text-base"
          >
            <Compass className="w-5 h-5" />
            Go to C# Adventures
            <ArrowRight className="w-5 h-5" />
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors gap-1"
          >
            <ChevronDown className="rotate-90 w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white font-sans selection:bg-blue-500/30">
      <OnboardingTour
        steps={TOUR_STEPS}
        isOpen={showTour}
        onComplete={() => {
          setShowTour(false);
          setIsManual(false);
        }}
        onSkip={() => {
          setShowTour(false);
          setIsManual(false);
        }}
        avatarConfig={user?.avatarConfig}
        tutorialId="challengesTab"
      />
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="mb-12" id="play-title">
          {" "}
          {/* [NEW] Added ID */}
          {/* ... Header content ... */}
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ChevronDown className="rotate-90 mr-1 w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10 uppercase tracking-widest text-[10px]"
                >
                  Learning Path
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                C#allenges
              </h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl">
                From "Hello World" to advanced Software Architecture. Your
                journey to becoming a .NET Developer starts here.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsManual(true);
                setShowTour(true);
              }}
              className="gap-2 bg-white/5 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 w-fit"
            >
              <PlayCircle className="w-4 h-4 text-blue-500" />
              Replay Tutorial
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-0 max-w-2xl mx-auto">
              {MODULES.map((module, idx) => (
                <ModuleSection
                  key={module.id}
                  module={module}
                  isOpen={expandedModule === module.id}
                  onToggle={() => toggleModule(module.id)}
                  isLocked={isModuleLocked(module.id, completed, challenges)}
                  challenges={challenges}
                  id={idx === 0 ? "play-module-1" : undefined}
                />
              ))}
              <div className="relative pl-12 pt-4">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-800 to-transparent h-16" />
                <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-600 font-bold text-xs absolute left-0">
                  <Star size={14} />
                </div>
                <div className="text-gray-500 text-sm ml-4 pt-1 font-medium italic">
                  More modules coming soon...
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8" id="play-stats">
              {" "}
              {/* [NEW] ID for sidebar */}
              <ProfileWidget user={user} />
              <ProgressWidget
                user={user}
                completed={completed}
                challenges={challenges}
              />
              <BadgesWidget user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChallengesPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <ChallengeProvider>
      <ChallengesContent />
    </ChallengeProvider>
  );
}
