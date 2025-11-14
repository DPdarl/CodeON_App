import { useAuth } from "~/contexts/AuthContext";
import { PrivateRoute } from "~/components/PrivateRoute";
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { Sidebar } from "~/components/dashboardmodule/SideBar";
import { DashboardTabs } from "~/components/dashboardmodule/DashboardTabs";
import { DashboardHeader } from "~/components/dashboardmodule/DashboardHeader";
import { HomeTab } from "~/components/dashboardmodule/HomeTab";
import { PlayTab } from "~/components/dashboardmodule/PlayTab";

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

  // --- Theme Logic ---
  // This effect runs once on component load to set the theme
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

  // This is the function the header button will call
  const handleSwitchTheme = () => {
    // Check if 'dark' class is on the <html> tag
    const isDarkMode = document.documentElement.classList.toggle("dark");
    // Save the preference to localStorage
    localStorage.theme = isDarkMode ? "dark" : "light";
  };

  // --- Logout Logic ---
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // --- Sidebar Toggle Logic ---
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // --- Multiplayer Quiz Logic ---
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

  // --- Avatar Logic ---
  const handleSaveAvatar = async (avatarConfig: any) => {
    try {
      console.log("Saving avatar configuration:", avatarConfig);

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

  // --- Tab Change Logic ---
  const handleTabChange = (tab: string) => {
    // Handle special cases for more dropdown options
    if (tab === "logout") {
      handleLogout();
      return;
    }

    if (tab === "settings" || tab === "about") {
      // You can implement settings and about pages here
      console.log(`Navigating to ${tab}`);
      // For now, just set the active tab
      setActiveTab(tab);
      return;
    }

    setActiveTab(tab);
  };
  return (
    <PrivateRoute>
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sidebar Navigation */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? "w-24" : "w-64"
          }`}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            user={user}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto transition-all duration-300">
          <DashboardHeader
            user={user}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            stats={{
              streaks: 0,
              coins: 0,
              hearts: 0,
            }}
            // ▼▼▼ THIS IS THE FIX ▼▼▼
            onSwitchTheme={handleSwitchTheme}
            onLogout={handleLogout}
            // ▲▲▲ END OF FIX ▲▲▲
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
