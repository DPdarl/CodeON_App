// app/components/dashboardmodule/DashboardTabs.tsx
import { HomeTab } from "./HomeTab";
import { PlayTab } from "./PlayTab";
import { LeaderboardTab } from "./LeaderboardTab";
import { QuestTab } from "./QuestTab";
import { StreakTab } from "./StreakTaB";
import { SettingsTab } from "./SettingsTab";
import { AboutTab } from "./AboutTab";
import { StoreTab } from "./StoreTab";
import { ProfileTab } from "./ProfileTab";

interface DashboardTabsProps {
  activeTab: string;
  user: any;
  onSaveAvatar: (avatarConfig: any) => Promise<void>;
  onStartMultiplayerQuiz: () => void;
  onJoinMultiplayerQuiz: () => void;
}

export function DashboardTabs({
  activeTab,
  user,
  onSaveAvatar,
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
}: DashboardTabsProps) {
  return (
    <div className="w-full h-full relative">
      {/* Reverted to Conditional Rendering (&&) 
         This ensures components unmount/remount, triggering the animations.
      */}
      {activeTab === "home" && (
        <HomeTab
          onTabChange={(tab) => {
            /* logic to handle tab change */
          }}
        />
      )}
      {activeTab === "play" && (
        <PlayTab
          onStartMultiplayerQuiz={onStartMultiplayerQuiz}
          onJoinMultiplayerQuiz={onJoinMultiplayerQuiz}
        />
      )}
      {activeTab === "leaderboard" && <LeaderboardTab />}

      {activeTab === "progress" && <QuestTab />}

      {activeTab === "streak" && <StreakTab />}
      {activeTab === "store" && <StoreTab />}

      {activeTab === "profile" && (
        <ProfileTab user={user} onSaveAvatar={onSaveAvatar} />
      )}

      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "about" && <AboutTab />}
    </div>
  );
}
