import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { LeaderboardTab } from "~/components/dashboardmodule/LeaderboardTab";

// 1. Meta Data
export const meta: MetaFunction = () => {
  return [
    { title: "Leaderboard | CodeON" },
    { name: "description", content: "Compete with other students" },
  ];
};

// 2. ✅ THE FIX: You must export a loader!
// Even if it returns nothing, it tells Remix "I can handle this GET request."
export async function loader() {
  return json({});
}

// 3. The Page Component
import { useState, useEffect } from "react"; // [NEW]
import { useSearchParams } from "@remix-run/react"; // [NEW]
import { OnboardingTour } from "~/components/ui/OnboardingTour"; // [NEW]
import type { TourStep } from "~/components/ui/OnboardingTour"; // [NEW]

const TOUR_STEPS: TourStep[] = [
  {
    target: "leaderboard-title",
    title: "Hall of Champions",
    content:
      "See who's top of the class! Compete with your peers for glory and rewards.",
  },
  {
    target: "leaderboard-filters",
    title: "Filter Rankings",
    content:
      "Sort by XP (Adventure), Stars (Challenges), or Trophies (Multiplayer). You can also filter by section!",
  },
  {
    target: "tour-podium",
    title: "Top Ranks",
    content:
      "The top 3 players get the spotlight on the podium, showing their rank and avatar. The rest of the players are listed below. Keep pushing to climb the ranks!",
    position: "top",
  },
  {
    target: "tour-current-user",
    title: "Your Rank & Profiles",
    content:
      "Your current rank is always pinned at the bottom so you can track your position. You can also click on any player's card or row to view their full profile and stats!",
    position: "top",
  },
];

export default function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTour, setShowTour] = useState(false);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (searchParams.get("tour") === "true") {
      setShowTour(true);
      setIsManual(true);
      setSearchParams((params) => {
        const newParams = new URLSearchParams(params);
        newParams.delete("tour");
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="h-full w-full overflow-y-auto p-4 md:p-6">
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
        tutorialId="leaderboardTab"
        returnTo={isManual ? "/how-to" : undefined}
      />
      {/* Renders the complex logic component you created earlier */}
      <LeaderboardTab />
    </div>
  );
}
