// app/components/dashboardmodule/DashboardTabs.tsx
import { User } from "firebase/auth";
import { HomeTab } from "./HomeTab";
import { PlayTab } from "./PlayTab";
import { LeaderboardTab } from "./LeaderboardTab";
import { ProgressTab } from "./ProgressTab";
import { StreakTab } from "./StreakTaB";
import { SettingsTab } from "./SettingsTab";
import { AboutTab } from "./AboutTab";
import { StoreTab } from "./StoreTab";
import { ProfileTab } from "./ProfileTab";

interface DashboardTabsProps {
  activeTab: string;
  user: any; // Using 'any' to support custom UserData type
  onSaveAvatar: (avatarConfig: any) => Promise<void>;
  onStartMultiplayerQuiz: () => void;
  onJoinMultiplayerQuiz: () => void;
  onTabChange: (tab: string) => void;
}

export function DashboardTabs({
  activeTab,
  user,
  onSaveAvatar,
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
  onTabChange,
}: DashboardTabsProps) {
  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab onTabChange={onTabChange} />;
      case "play":
        return (
          <PlayTab
            onStartMultiplayerQuiz={onStartMultiplayerQuiz}
            onJoinMultiplayerQuiz={onJoinMultiplayerQuiz}
          />
        );
      case "leaderboard":
        return <LeaderboardTab />;
      case "progress":
        return <ProgressTab />;
      case "streak":
        return <StreakTab />;
      case "store":
        return <StoreTab />;
      case "profile":
        return <ProfileTab user={user} onSaveAvatar={onSaveAvatar} />;
      case "settings":
        return <SettingsTab />;
      case "about":
        return <AboutTab />;
      default:
        return <HomeTab onTabChange={onTabChange} />;
    }
  };

  return <>{renderActiveTab()}</>;
}
