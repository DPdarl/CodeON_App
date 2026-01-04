import { useEffect, useState, useRef } from "react";
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

// --- 1. DATA LOADER (Restored Logic) ---
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
    studentId: dbUser.student_id,
    displayName: dbUser.display_name || "Coder",
    photoURL: dbUser.photo_url,
    avatarConfig: dbUser.avatar_config,
    isOnboarded: dbUser.is_onboarded ?? false,
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
    googleBound: !!dbUser.google_provider_id,
  };

  return { user: mappedUser };
}

clientLoader.hydrate = true;

// --- 2. PREVENT AUTO-REFRESH ON TABS ---
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  defaultShouldRevalidate,
}) => {
  if (formMethod === "GET") {
    return false;
  }
  return defaultShouldRevalidate;
};

// --- 3. LOADING SCREEN (Themed Skeleton) ---
export function HydrateFallback() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Sidebar Skeleton */}
      <div className="w-64 h-screen border-r border-indigo-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 p-4 space-y-6 hidden md:block backdrop-blur-sm">
        <Skeleton className="h-12 w-40 mb-10 bg-indigo-200/50 dark:bg-gray-700" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full bg-indigo-100 dark:bg-gray-800" />
          <Skeleton className="h-10 w-full bg-indigo-100 dark:bg-gray-800" />
          <Skeleton className="h-10 w-full bg-indigo-100 dark:bg-gray-800" />
          <Skeleton className="h-10 w-full bg-indigo-100 dark:bg-gray-800" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 bg-indigo-200 dark:bg-gray-700" />
            <Skeleton className="h-4 w-48 bg-indigo-100 dark:bg-gray-800" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-10 rounded-full bg-indigo-200 dark:bg-gray-700" />
            <Skeleton className="h-10 w-10 rounded-full bg-indigo-200 dark:bg-gray-700" />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          <Skeleton className="h-48 w-full rounded-3xl bg-white/60 dark:bg-gray-800/60" />
          <Skeleton className="h-48 w-full rounded-3xl bg-white/60 dark:bg-gray-800/60" />
          <Skeleton className="h-48 w-full rounded-3xl bg-white/60 dark:bg-gray-800/60" />
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

  // Track initial sync
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    // Sync loader data to context ONLY ONCE on mount to avoid overwriting local updates
    if (loaderUser && !hasSyncedRef.current) {
      if (JSON.stringify(loaderUser) !== JSON.stringify(contextUser)) {
        console.log("Syncing fresh loader data...");
        syncUser(loaderUser);
      }
      hasSyncedRef.current = true;
    }
  }, [loaderUser, contextUser, syncUser]);

  // Use Context user for live updates, fallback to Loader user for initial paint
  const activeUser = contextUser || loaderUser;

  // --- REDIRECT CHECK ---
  useEffect(() => {
    if (activeUser && activeUser.isOnboarded === false) {
      navigate("/onboarding");
    }
  }, [activeUser, navigate]);

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

  // Prevent flash if redirecting
  if (activeUser && activeUser.isOnboarded === false) return null;

  return (
    <PrivateRoute>
      {/* Custom Scrollbar Styles injected here */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
            background: transparent; 
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.3); /* Gray-400 with opacity */
            border-radius: 9999px;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
            background-color: rgba(156, 163, 175, 0.5);
        }
        /* For Firefox */
        .scrollbar-hide {
            scrollbar-width: thin;
            scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div
          className={`flex-shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? "w-24" : "w-64"
          } h-screen hidden md:block`}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            user={activeUser}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* ✅ APPLIED 'scrollbar-hide' CLASS HERE */}
        <div className="flex-1 flex flex-col overflow-y-auto transition-all duration-300 scrollbar-hide">
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

          <main className="p-4 md:p-6 z-0">
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
