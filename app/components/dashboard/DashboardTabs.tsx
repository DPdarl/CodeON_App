import { HomeTab } from "./HomeTab";
import { PlayTab } from "./PlayTab";
import { LeaderboardTab } from "./LeaderboardTab";
import { ProgressTab } from "./ProgressTab";
import { StreakTab } from "./StreakTaB";
import { CustomizeAvatar } from "~/components/dashboard/CustomizeAvatar";
import { SettingsTab } from "./SettingsTab";
import { AboutTab } from "./AboutTab";

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
      {activeTab === "home" && <HomeTab user={user} />}
      {activeTab === "play" && (
        <PlayTab
          onStartMultiplayerQuiz={onStartMultiplayerQuiz}
          onJoinMultiplayerQuiz={onJoinMultiplayerQuiz}
        />
      )}
      {activeTab === "leaderboard" && <LeaderboardTab user={user} />}
      {activeTab === "progress" && <ProgressTab />}
      {activeTab === "streak" && <StreakTab />}
      {activeTab === "customize" && (
        <CustomizeAvatar user={user} onSaveAvatar={onSaveAvatar} />
      )}
      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "about" && <AboutTab />}
    </>
  );
}
