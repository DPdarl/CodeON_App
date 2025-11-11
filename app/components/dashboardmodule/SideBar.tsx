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
  Store,
  UserCircle,
  MoreVertical,
  MoreHorizontal,
  Info,
} from "lucide-react";
import CodeOnLogo from "~/components/ui/CodeOnLogo";
import { useState, useRef, useEffect } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  user?: User | null;
  collapsed?: boolean;
}

export function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  user,
  collapsed = false,
}: SidebarProps) {
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "play", label: "Play", icon: Gamepad2 },
    { id: "leaderboard", label: "Leaderboard", icon: Crown },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "streak", label: "Streak", icon: Flame },
    { id: "store", label: "Store", icon: Store },
    { id: "customize", label: "Customize", icon: Palette },
    { id: "profile", label: "Profile", icon: UserCircle },
    { id: "more", label: "More", icon: MoreHorizontal, hasDropdown: true },
  ];

  const moreOptions = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
    { id: "logout", label: "Logout", icon: LogOut, action: onLogout },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsMoreDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMoreClick = () => {
    setIsMoreDropdownOpen(!isMoreDropdownOpen);
  };

  const handleMoreOptionClick = (option: (typeof moreOptions)[0]) => {
    if (option.action) {
      option.action();
    } else {
      onTabChange(option.id);
    }
    setIsMoreDropdownOpen(false);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 border-r shadow-sm flex flex-col h-full transition-all duration-300 ${
        collapsed ? "w-24" : "w-64"
      }`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "space-x-3"
          }`}
        >
          <CodeOnLogo className={collapsed ? "h-6 w-6" : "h-8 w-8"} />

          {!collapsed && (
            <div className="flex flex-col">
              <h1 className="text-xl font-bold leading-tight">CodeON</h1>
              <span className="text-xs text-muted-foreground leading-tight">
                Learn & Compete
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isMoreItem = item.id === "more";

            return (
              <div
                key={item.id}
                className="relative"
                ref={isMoreItem ? dropdownRef : null}
              >
                <button
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors group ${
                    activeTab === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  } ${collapsed ? "justify-center" : ""} ${
                    isMoreItem && isMoreDropdownOpen
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  onClick={
                    isMoreItem ? handleMoreClick : () => onTabChange(item.id)
                  }
                  title={collapsed ? item.label : ""}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span>{item.label}</span>}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>

                {/* More Dropdown */}
                {isMoreItem && isMoreDropdownOpen && (
                  <div
                    className={`absolute ${
                      collapsed
                        ? "left-full ml-4 top-0"
                        : "left-0 top-full mt-1 w-full"
                    } bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-48`}
                  >
                    {moreOptions.map((option) => {
                      const OptionIcon = option.icon;
                      return (
                        <button
                          key={option.id}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => handleMoreOptionClick(option)}
                        >
                          <OptionIcon className="h-4 w-4" />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
