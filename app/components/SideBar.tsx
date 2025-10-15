// ~/components/Sidebar.tsx
import { User } from "firebase/auth";
import {
  Home,
  Users,
  Crown,
  BarChart3,
  Flame,
  Palette,
  Settings,
  HelpCircle,
  LogOut,
  Gamepad2,
} from "lucide-react";
import CodeOnLogo from "~/components/ui/CodeOnLogo";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  user?: User | null;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  user,
}: SidebarProps) {
  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "multiplayer", label: "Multiplayer", icon: Users },
    { id: "leaderboard", label: "Leaderboard", icon: Crown },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "streak", label: "Streak", icon: Flame },
    { id: "customize", label: "Customize", icon: Palette },
  ];

  const bottomNavigationItems = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help", icon: HelpCircle },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r shadow-sm flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <CodeOnLogo className="h-16 w-16" />
          <h1 className="text-xl font-bold">CodeON</h1>
        </div>
      </div>

      {/* Main Navigation - This will grow and take available space */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation - This stays at the bottom */}
      <div className="mt-auto border-t">
        <nav className="space-y-1 p-4">
          {bottomNavigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
