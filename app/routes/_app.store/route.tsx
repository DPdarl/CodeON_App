import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { ProfileTab } from "~/components/dashboardmodule/ProfileTab";
import { useAuth } from "~/contexts/AuthContext";

export const meta: MetaFunction = () => {
  return [
    { title: "My Profile | CodeON" },
    { name: "description", content: "View and edit your profile" },
  ];
};

export async function loader() {
  return json({});
}

// 3. Pass the required props to the component
import { useState, useEffect } from "react"; // [NEW]
import { useSearchParams } from "@remix-run/react"; // [NEW]
import { OnboardingTour } from "~/components/ui/OnboardingTour"; // [NEW]

const TOUR_STEPS = [
  {
    target: "profile-card",
    title: "Your ID Card",
    content: "View your stats, level, and XP progress at a glance.",
  },
  {
    target: "profile-stats",
    title: "Detailed Stats",
    content: "Check your global rank, league, and total trophies.",
    position: "top" as const,
  },
  {
    target: "profile-tabs",
    title: "Customize & Edit",
    content:
      "Update your name, link your Google account, or customize your avatar!",
    position: "center" as const,
  },
];

export default function ProfilePage() {
  // 1. Get user data and update function from Auth Context
  const { user, updateProfile } = useAuth();

  // 2. Define the handler for saving the avatar
  const handleSaveAvatar = async (avatarConfig: any) => {
    if (!user) return;
    try {
      // This calls Supabase to update the 'avatar_config' column
      await updateProfile({ avatarConfig });
      // You can add a toast notification here if you have one
      console.log("Avatar updated successfully!");
    } catch (error) {
      console.error("Failed to save avatar", error);
    }
  };

  // Prevent rendering if user is still loading (optional, but safer)
  if (!user) return null;

  // [NEW] Tour Logic
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
        tutorialId="profileTab"
        returnTo={isManual ? "/how-to" : undefined}
      />
      {/* 3. Pass the required props to the component */}
      <ProfileTab user={user} onSaveAvatar={handleSaveAvatar} />
    </div>
  );
}
