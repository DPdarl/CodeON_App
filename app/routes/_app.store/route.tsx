import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { StoreTab } from "~/components/dashboardmodule/StoreTab";
import { useAuth } from "~/contexts/AuthContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Store | CodeON" },
    { name: "description", content: "Spend your coins on power-ups!" },
  ];
};

export async function loader() {
  return json({});
}

import { useState, useEffect } from "react";
import { useSearchParams } from "@remix-run/react";
import { OnboardingTour } from "~/components/ui/OnboardingTour";

const TOUR_STEPS = [
  {
    target: "store-title",
    title: "Welcome to the Store",
    content:
      "Spend your hard-earned coins on power-ups to boost your learning journey.",
  },
  {
    target: "store-tabs",
    title: "Browse Items",
    content:
      "Switch between buying Power-Ups or viewing your current Inventory.",
  },
  {
    target: "powerup-streak-freeze",
    title: "Power-Ups",
    content:
      "Purchase items like Streak Freezes to protect your learning streak!",
    position: "top" as const,
  },
];

export default function StorePage() {
  const { user } = useAuth();

  if (!user) return null;

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
    <div className="h-full w-full overflow-y-auto p-4 md:p-6 custom-scrollbar">
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
        tutorialId="storeTab"
        returnTo={isManual ? "/how-to" : undefined}
      />
      <StoreTab />
    </div>
  );
}
