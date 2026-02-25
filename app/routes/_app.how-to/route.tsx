import { useNavigate, useSearchParams } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext"; // NEW
import { OnboardingTour } from "~/components/ui/OnboardingTour";

import {
  BookOpen,
  Trophy,
  Store,
  Flame,
  User,
  Gamepad2,
  HelpCircle,
  Code2,
} from "lucide-react";
import { motion } from "framer-motion";

const GUIDE_MODULES = [
  {
    id: "home",
    title: "Dashboard Tour",
    description: "Learn about your stats, progress, and daily overview.",
    icon: BookOpen,
    color: "bg-blue-500",
    link: "/dashboard?tour=true",
  },
  {
    id: "play",
    title: "Play & Practice",
    description: "Discover Adventure Mode and Multiplayer Arena.",
    icon: Gamepad2,
    color: "bg-indigo-500",
    link: "/play?tour=true",
  },
  {
    id: "challenges",
    title: "C#allenges",
    description:
      "Test your skills with raw machine problems and earn certificates.",
    icon: Code2,
    color: "bg-teal-500",
    link: "/play/challenges?tour=true",
    tutorialKey: "challengesTab",
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    description: "Understand rankings, leagues, and competition.",
    icon: Trophy,
    color: "bg-yellow-500",
    link: "/leaderboard?tour=true",
  },
  {
    id: "quests",
    title: "Quests & Rewards",
    description: "How to earn XP and rewards through daily tasks.",
    icon: HelpCircle, // Using generic icon as Quest icon might be custom
    color: "bg-green-500",
    link: "/quests?tour=true",
    tutorialKey: "questTab", // Explicit override since "questsTab" doesn't match the DB key
  },
  {
    id: "streak",
    title: "Streak System",
    description: "Maintain your coding streak and earn bonuses.",
    icon: Flame,
    color: "bg-orange-500",
    link: "/streak?tour=true",
  },
  {
    id: "store",
    title: "Item Store",
    description: "Spend your hard-earned coins on cool items.",
    icon: Store,
    color: "bg-purple-500",
    link: "/store?tour=true",
  },
  {
    id: "profile",
    title: "Profile & Avatar",
    description: "Customize your avatar and view your certificates.",
    icon: User,
    color: "bg-pink-500",
    link: "/profile?tour=true",
  },
];

export default function HowToPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth(); // NEW: Check if user has already completed the Home Tour

  const rewardTutorialId = searchParams.get("reward");

  return (
    <>
      <OnboardingTour
        steps={[]}
        isOpen={!!rewardTutorialId}
        onComplete={() => setSearchParams({})}
        onSkip={() => setSearchParams({})}
        tutorialId={rewardTutorialId || undefined}
        rewardOnly={true}
      />
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">How to CodeON</h1>
          <p className="text-muted-foreground">
            Select a module to start an interactive tour.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDE_MODULES.map((module, index) => {
            // Dynamically check completion based on module ID (e.g., "home" -> "homeTab")
            const tutorialKey = module.tutorialKey || `${module.id}Tab`;
            const hasCompletedTour = user?.settings?.tutorials?.[tutorialKey];

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => navigate(module.link)}
              >
                <div className="relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow transition-all hover:shadow-lg h-full">
                  <div className={`h-2 ${module.color}`} />
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`p-3 rounded-lg ${module.color} bg-opacity-10 dark:bg-opacity-20`}
                      >
                        <module.icon
                          className={`w-6 h-6 ${module.color.replace(
                            "bg-",
                            "text-",
                          )}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl">
                          {module.title}
                        </h3>
                        {!hasCompletedTour && (
                          <div className="flex items-center gap-2 mt-1 -ml-1">
                            <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 text-[10px] font-bold text-yellow-800 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20">
                              +50 Coins
                            </span>
                            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-300 ring-1 ring-inset ring-purple-600/20">
                              +50 XP
                            </span>
                          </div>
                        )}
                        {hasCompletedTour && (
                          <span className="mt-1 inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 flex-grow">
                      {module.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Tour <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
