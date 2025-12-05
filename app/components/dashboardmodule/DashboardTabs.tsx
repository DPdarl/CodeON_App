// app/components/dashboardmodule/DashboardTabs.tsx
import { HomeTab } from "./HomeTab";
import { PlayTab } from "./PlayTab";
import { LeaderboardTab } from "./LeaderboardTab";
// import { ProgressTab } from "./ProgressTab"; // <-- REMOVED
import { QuestTab } from "./QuestTab"; // <-- ADDED
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
    <>
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

      {/* ▼▼▼ REPLACED PROGRESS WITH QUESTS ▼▼▼ */}
      {activeTab === "progress" && <QuestTab />}
      {/* ▲▲▲ END REPLACEMENT ▲▲▲ */}

      {activeTab === "streak" && <StreakTab />}
      {activeTab === "store" && <StoreTab />}
      {activeTab === "profile" && (
        <ProfileTab user={user} onSaveAvatar={onSaveAvatar} />
      )}
      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "about" && <AboutTab />}
    </>
  );
}
