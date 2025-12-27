// app/components/dashboardmodule/DashboardHeader.tsx
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { PanelLeftOpen, PanelLeftClose, Moon, LogOut } from "lucide-react";
import { AvatarDisplay } from "./AvatarDisplay";
import { calculateProgress } from "~/lib/leveling-system";
import { CoinIcon, FlameIcon, HeartIcon } from "../ui/Icons";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label?: string;
  color?: string;
}

function StatItem({ icon, value, color }: StatItemProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-lg font-medium transition-transform hover:scale-125 cursor-default">
      {icon}
      <span className={`text-gray-900 dark:text-gray-100 ${color || ""}`}>
        {value}
      </span>
    </div>
  );
}

interface DashboardHeaderProps {
  user: any;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  stats: {
    streaks: number;
    coins: number;
    hearts: number;
  };
  onSwitchTheme: () => void;
  onLogout: () => void;
}

const defaultStats = { streaks: 0, coins: 0, hearts: 0 };

export function DashboardHeader({
  user,
  sidebarCollapsed,
  onToggleSidebar,
  stats = defaultStats,
  onSwitchTheme,
  onLogout,
}: DashboardHeaderProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // --- 1. CALCULATE XP & LEVEL ---
  const { currentLevel, progressPercent } = calculateProgress(user?.xp || 0);

  // --- 2. UPDATED PROGRESS RING MATH (For w-16 / 64px) ---
  const radius = 28; // Increased radius for bigger ring
  const center = 32; // Center point (half of 64px)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  const confirmLogout = () => {
    setShowLogoutDialog(false);
    setTimeout(() => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
      onLogout();
    }, 300);
  };

  return (
    <>
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 transition-colors">
        <div className="px-4 py-2 flex items-center justify-between">
          {/* Left: Sidebar Toggle */}
          <div className="flex-none">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-9 w-9"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Center: Stats Bar */}
          <div className="flex-1 flex justify-center no-scrollbar mx-4">
            <div className="flex items-center space-x-3 md:space-x-6">
              {/* Level Stat (Text Only) */}
              <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full text-lg font-black text-yellow-600 dark:text-yellow-400 transition-transform hover:scale-125 cursor-default">
                Lvl {currentLevel}
              </div>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block" />

              <StatItem
                icon={<FlameIcon className="h-6 w-5" />}
                value={stats.streaks}
              />
              <StatItem
                icon={<CoinIcon className="h-6 w-6" />}
                value={stats.coins}
              />
              <StatItem
                icon={<HeartIcon className="h-6 w-6" />}
                value={stats.hearts}
              />
            </div>
          </div>

          {/* Right: User Profile & Menu */}
          <div className="flex-none">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none">
                  {/* --- 3. UPDATED AVATAR CONTAINER (w-16 h-16) --- */}
                  <div className="relative flex items-center justify-center w-16 h-16">
                    {/* Progress Ring SVG */}
                    <svg className="absolute w-full h-full transform -rotate-90">
                      {/* Background Track */}
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        className="stroke-gray-200 dark:stroke-gray-700"
                        strokeWidth="6"
                      />
                      {/* Progress Indicator */}
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        className="stroke-indigo-500 transition-all duration-1000 ease-out"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>

                    {/* Actual Avatar Image */}
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 z-10">
                      <AvatarDisplay config={user?.avatarConfig} headOnly />
                    </div>
                  </div>

                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {Math.floor(progressPercent)}% to Lvl {currentLevel + 1}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  My Account
                  <span className="ml-2 text-xs font-normal text-muted-foreground bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded capitalize">
                    {user?.role || "Student"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onSwitchTheme}
                  className="cursor-pointer"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Switch Theme</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  onClick={() => setShowLogoutDialog(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
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
