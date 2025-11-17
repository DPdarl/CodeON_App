// app/routes/dashboard.tsx
import { useAuth } from "~/contexts/AuthContext";
import { PrivateRoute } from "~/components/PrivateRoute";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { Sidebar } from "~/components/dashboardmodule/SideBar";
import { DashboardTabs } from "~/components/dashboardmodule/DashboardTabs";
import { DashboardHeader } from "~/components/dashboardmodule/DashboardHeader";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | CodeON" },
    { name: "description", content: "Your CodeON dashboard" },
  ];
};

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Theme Logic
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleSwitchTheme = () => {
    const isDarkMode = document.documentElement.classList.toggle("dark");
    localStorage.theme = isDarkMode ? "dark" : "light";
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Multiplayer Quiz Logic
  const startMultiplayerQuiz = () => {
    const gameId = Math.random().toString(36).substring(2, 8);
    navigate(`/multiplayer/${gameId}`);
  };

  const joinMultiplayerQuiz = () => {
    const gameCode = prompt("Enter game code:");
    if (gameCode) {
      navigate(`/multiplayer/${gameCode}`);
    }
  };

  // Avatar Logic
  const handleSaveAvatar = async (avatarConfig: any) => {
    try {
      await updateProfile({
        displayName: user?.displayName ?? undefined,
        photoURL: generateAvatarURL(avatarConfig),
        avatarConfig: avatarConfig,
      });
      alert("Avatar saved successfully!");
    } catch (error) {
      console.error("Error saving avatar:", error);
      alert("Error saving avatar. Please try again.");
    }
  };

  const generateAvatarURL = (config: any) => {
    const params = new URLSearchParams({
      skin: config.skinTone.replace("#", ""),
      hair: config.hairStyle,
      hairColor: config.hairColor.replace("#", ""),
      eyes: config.eyeColor.replace("#", ""),
      clothing: config.clothingStyle,
      clothingColor: config.clothingColor.replace("#", ""),
      accessory: config.accessory,
    });
    return `/api/avatar?${params.toString()}`;
  };

  const handleTabChange = (tab: string) => {
    if (tab === "logout") {
      handleLogout();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <PrivateRoute>
      {/* ▼▼▼ SIDEBAR FIX ▼▼▼
        h-screen: sets height to 100% of the viewport.
        overflow-hidden: prevents the *whole page* from scrolling.
      */}
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sidebar Navigation */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? "w-24" : "w-64"
          } h-screen`} // Added h-screen
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            user={user}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* ▼▼▼ SCROLLING CONTENT FIX ▼▼▼
          flex-1: makes it take up the remaining space.
          overflow-y-auto: makes ONLY this div scrollable.
        */}
        <div className="flex-1 flex flex-col overflow-y-auto transition-all duration-300">
          <DashboardHeader
            user={user}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            stats={{ streaks: 5, coins: 1200, hearts: 3 }} // Mock stats
            onSwitchTheme={handleSwitchTheme}
            onLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="p-6">
            <DashboardTabs
              activeTab={activeTab}
              user={user}
              onSaveAvatar={handleSaveAvatar}
              onStartMultiplayerQuiz={startMultiplayerQuiz}
              onJoinMultiplayerQuiz={joinMultiplayerQuiz}
            />
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
}
