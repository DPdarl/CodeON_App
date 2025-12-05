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

  // Default to 'home', but we will update this immediately on client load
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // --- NEW: Load saved tab from LocalStorage on mount ---
  useEffect(() => {
    const savedTab = localStorage.getItem("active_dashboard_tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

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

  // Logout Logic
  const handleLogout = async () => {
    try {
      // Clear the saved tab so next login starts fresh at 'home'
      localStorage.removeItem("active_dashboard_tab");
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Sidebar Toggle Logic
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

  // Save Avatar Logic
  const handleSaveAvatar = async (avatarConfig: any) => {
    try {
      await updateProfile({
        avatarConfig: avatarConfig,
      });
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  // --- MODIFIED: Save to LocalStorage when tab changes ---
  const handleTabChange = (tab: string) => {
    if (tab === "logout") {
      handleLogout();
      return;
    }

    // 1. Update State
    setActiveTab(tab);

    // 2. Save to Browser Storage
    localStorage.setItem("active_dashboard_tab", tab);
  };

  return (
    <PrivateRoute>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sidebar Navigation */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? "w-24" : "w-64"
          } h-screen`}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            user={user}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto transition-all duration-300">
          <DashboardHeader
            user={user}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            stats={{
              streaks: user?.streaks || 0,
              coins: user?.coins || 0,
              hearts: user?.hearts || 5,
            }}
            onSwitchTheme={handleSwitchTheme}
            onLogout={handleLogout}
          />

          <main className="p-6 z-0">
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
