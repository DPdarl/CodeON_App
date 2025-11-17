// app/components/dashboardmodule/DashboardTabs.tsx
import { HomeTab } from "./HomeTab";
import { PlayTab } from "./PlayTab";
import { LeaderboardTab } from "./LeaderboardTab";
import { ProgressTab } from "./ProgressTab";
import { StreakTab } from "./StreakTaB";
// import { CustomizeAvatar } from "~/components/dashboardmodule/CustomizeAvatar"; // No longer imported here
import { SettingsTab } from "./SettingsTab";
import { AboutTab } from "./AboutTab";
import { StoreTab } from "./StoreTab";
import { ProfileTab } from "./ProfileTab"; // <-- 1. IMPORT THE NEW TAB

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
      {/* FIX: Removed 'user={user}' prop. Our new HomeTab gets 
        the user via the useAuth() hook, which caused the error.
      */}
      {activeTab === "home" && <HomeTab />}
      {activeTab === "play" && (
        <PlayTab
          onStartMultiplayerQuiz={onStartMultiplayerQuiz}
          onJoinMultiplayerQuiz={onJoinMultiplayerQuiz}
        />
      )}
      {/* FIX: Removed 'user={user}' prop from LeaderboardTab as well.
       */}
      {activeTab === "leaderboard" && <LeaderboardTab />}
      {activeTab === "progress" && <ProgressTab />}
      {activeTab === "streak" && <StreakTab />}
      {activeTab === "store" && <StoreTab />}

      {/* ▼▼▼ 2. MERGED TABS ▼▼▼ */}
      {/* This one "profile" tab now renders the new ProfileTab component,
        which contains both profile info and the avatar customizer.
      */}
      {activeTab === "profile" && (
        <ProfileTab user={user} onSaveAvatar={onSaveAvatar} />
      )}
      {/* ▲▲▲ END MERGE ▲▲▲ */}

      {/* 3. REMOVED old "customize" tab */}
      {/* {activeTab === "customize" && (
        <CustomizeAvatar user={user} onSaveAvatar={onSaveAvatar} />
      )} */}

      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "about" && <AboutTab />}
    </>
  );
}
