// app/routes/dashboard.tsx
import { useEffect, useState } from "react";
import {
  useNavigate,
  useLoaderData,
  type ClientLoaderFunctionArgs,
  type ShouldRevalidateFunction,
} from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { Sidebar } from "~/components/dashboardmodule/SideBar";
import { DashboardTabs } from "~/components/dashboardmodule/DashboardTabs";
import { DashboardHeader } from "~/components/dashboardmodule/DashboardHeader";
import { PrivateRoute } from "~/components/PrivateRoute";
import { useAuth, type UserData } from "~/contexts/AuthContext";
import { supabase } from "~/lib/supabase";
import { Skeleton } from "~/components/ui/skeleton";

// ... (Keep your existing clientLoader code exactly as is) ...
export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { user: null };

  const { data: dbUser, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !dbUser) return { user: null };

  const mappedUser: UserData = {
    uid: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.display_name || "Coder",
    photoURL: dbUser.photo_url,
    avatarConfig: dbUser.avatar_config,
    settings: dbUser.settings,
    xp: dbUser.xp,
    level: dbUser.level,
    streaks: dbUser.streaks,
    coins: dbUser.coins,
    hearts: dbUser.hearts,
    streakFreezes: dbUser.streak_freezes || 0,
    hints: dbUser.hints || 0,
    ownedCosmetics: dbUser.owned_cosmetics || [],
    inventory: dbUser.inventory || [],
    trophies: dbUser.trophies,
    league: dbUser.league,
    joinedAt: dbUser.joined_at,
    role: dbUser.role,
    activeDates: dbUser.active_dates || [],
    badges: dbUser.badges || [],
  };

  return { user: mappedUser };
}

clientLoader.hydrate = true;

// --- 1. NEW: STOP AUTO-RELOADING ON TAB SWITCH ---
export const shouldRevalidate: ShouldRevalidateFunction = ({
  actionResult,
  defaultShouldRevalidate,
  formMethod,
}) => {
  // Only revalidate if we explicitly submitted a form (mutation)
  // This prevents "focusRevalidation" (switching tabs) from firing
  if (formMethod === "GET") {
    return false;
  }
  return defaultShouldRevalidate;
};

// ... (Keep HydrateFallback exactly as is) ...
export function HydrateFallback() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-64 h-screen border-r border-white/20 bg-white/50 dark:bg-gray-800/50 p-4 space-y-4 hidden md:block">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | CodeON" },
    { name: "description", content: "Your CodeON dashboard" },
  ];
};

export default function Dashboard() {
  const { user: loaderUser } = useLoaderData<typeof clientLoader>();
  const { user: contextUser, logout, updateProfile, syncUser } = useAuth();
  const navigate = useNavigate();

  // --- 2. UPDATE SYNC LOGIC ---
  const loaderUserString = JSON.stringify(loaderUser);
  const contextUserString = JSON.stringify(contextUser);

  useEffect(() => {
    // We strictly trust the loader ONLY if it's genuinely different and valid.
    // Because we added shouldRevalidate, this will now only fire on initial load
    // or explicit navigations, NOT on Alt-Tab.
    if (loaderUser && loaderUserString !== contextUserString) {
      console.log("Syncing fresh loader data...");
      syncUser(loaderUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderUserString, syncUser]);

  const activeUser = contextUser || loaderUser;

  const [activeTab, setActiveTab] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem("active_dashboard_tab");
    if (savedTab) setActiveTab(savedTab);
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

  const handleLogout = async () => {
    try {
      localStorage.removeItem("active_dashboard_tab");
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const startMultiplayerQuiz = () => {
    const gameId = Math.random().toString(36).substring(2, 8);
    navigate(`/multiplayer/${gameId}`);
  };

  const joinMultiplayerQuiz = () => {
    const gameCode = prompt("Enter game code:");
    if (gameCode) navigate(`/multiplayer/${gameCode}`);
  };

  const handleSaveAvatar = async (avatarConfig: any) => {
    try {
      await updateProfile({ avatarConfig });
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "logout") {
      handleLogout();
      return;
    }
    setActiveTab(tab);
    localStorage.setItem("active_dashboard_tab", tab);
  };

  return (
    <PrivateRoute>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div
          className={`flex-shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? "w-24" : "w-64"
          } h-screen`}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            user={activeUser}
            collapsed={sidebarCollapsed}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto transition-all duration-300">
          <DashboardHeader
            user={activeUser}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
            stats={{
              streaks: activeUser?.streaks || 0,
              coins: activeUser?.coins || 0,
              hearts: activeUser?.hearts || 5,
            }}
            onSwitchTheme={handleSwitchTheme}
            onLogout={handleLogout}
          />

          <main className="p-6 z-0">
            <DashboardTabs
              activeTab={activeTab}
              user={activeUser}
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
