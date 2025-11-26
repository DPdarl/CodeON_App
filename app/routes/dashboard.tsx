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
  return [{ title: "Dashboard | CodeON" }];
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

  // ▼▼▼ SAVE LOGIC (Database Ready) ▼▼▼
  const handleSaveAvatar = async (avatarConfig: any) => {
    try {
      console.log("Saving to DB:", avatarConfig);
      // This saves to Firestore AND updates the UI instantly
      await updateProfile({ avatarConfig });
      alert("Avatar saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving avatar.");
    }
  };

  // Layout Logic
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleLogout = async () => await logout();
  const handleTabChange = (tab: string) => {
    if (tab === "logout") {
      handleLogout();
      return;
    }
    setActiveTab(tab);
  };

  return (
    <PrivateRoute>
      {/* ▼▼▼ LAYOUT FIX: h-screen + overflow-hidden ▼▼▼ */}
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Fixed Sidebar */}
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

        {/* Scrollable Content Area */}
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

          <main className="p-6">
            <DashboardTabs
              activeTab={activeTab}
              user={user}
              onSaveAvatar={handleSaveAvatar} // Pass the save function
              onStartMultiplayerQuiz={() => {}}
              onJoinMultiplayerQuiz={() => {}}
            />
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
}
