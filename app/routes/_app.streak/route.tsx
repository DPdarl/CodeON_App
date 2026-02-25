import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { StreakTab } from "~/components/dashboardmodule/StreakTaB";

// 1. Meta Data
export const meta: MetaFunction = () => {
  return [
    { title: "Streak | CodeON" },
    { name: "description", content: "Keep the fire going!" },
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
    target: "streak-current-box",
    title: "Keep the Fire Burning",
    content: "Your streak shows your consistency. Don't let the fire go out!",
  },
  {
    target: "streak-calendar",
    title: "Activity Calendar",
    content: "Green days mean you're safe. Orange is today. Don't miss a day!",
    position: "top",
  },
  {
    target: "streak-freeze-box",
    title: "Streak Freeze",
    content:
      "Streak Freezes protect your streak if you miss a day. It auto-equips when needed!",
    position: "top",
  },
  {
    target: "streak-goal-roadmap",
    title: "Goal Roadmap",
    content:
      "Reach streak milestones to unlock special badges and earn coin rewards. Consistently coding pays off!",
    position: "top",
  },
];

export default function StreakPage() {
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
        tutorialId="streakTab"
        returnTo={isManual ? "/how-to" : undefined}
      />
      {/* Renders the complex logic component you created earlier */}
      <StreakTab />
    </div>
  );
}
