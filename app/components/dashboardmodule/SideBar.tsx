// app/components/dashboardmodule/SideBar.tsx
import {
  Home,
  Users,
  Crown,
  Scroll,
  Flame,
  Settings,
  LogOut,
  Gamepad2,
  Store,
  UserCircle,
  MoreHorizontal,
  Info,
} from "lucide-react";
import CodeOnLogo from "~/components/ui/CodeOnLogo";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { UserData } from "~/contexts/AuthContext";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  // CHANGED: Updated type to UserData
  user?: UserData | null;
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
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "play", label: "Play", icon: Gamepad2 },
    { id: "leaderboard", label: "Leaderboard", icon: Crown },
    // ▼▼▼ Progress -> Quests ▼▼▼
    { id: "progress", label: "Quests", icon: Scroll },
    // ▲▲▲ Note: ID stays 'progress' to match DashboardTabs logic
    { id: "streak", label: "Streak", icon: Flame },
    { id: "store", label: "Store", icon: Store },
    { id: "profile", label: "Profile", icon: UserCircle },
    { id: "more", label: "More", icon: MoreHorizontal, hasDropdown: true },
  ];

  const moreOptions = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "about", label: "About", icon: Info },
    // Special ID "logout-trigger" to differentiate logic
    { id: "logout-trigger", label: "Logout", icon: LogOut },
  ];

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
    if (option.id === "logout-trigger") {
      setShowLogoutDialog(true);
    } else {
      onTabChange(option.id);
    }
    setIsMoreDropdownOpen(false);
  };

  // Inside Sidebar.tsx

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    setTimeout(() => {
      onLogout();
    }, 100);
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-900 border-r shadow-sm flex flex-col h-full transition-all duration-300 ${
          collapsed ? "w-24" : "w-64"
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <CodeOnLogo className="h-8 w-8" />
            {!collapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold leading-tight font-pixelify dark:text-white">
                  CodeON
                </h1>
                <span className="text-xs text-muted-foreground leading-tight">
                  Learn & Compete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
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
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
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
                        const isLogout = option.id === "logout-trigger";
                        return (
                          <button
                            key={option.id}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                              isLogout
                                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
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

      {/* Sidebar Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You will need to log back in to
              access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
