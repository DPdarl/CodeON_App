// app/components/dashboardmodule/DashboardHeader.tsx
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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
import {
  PanelLeftOpen,
  PanelLeftClose,
  Moon,
  LogOut,
  Clock,
  Zap,
  Heart,
} from "lucide-react";
import { AvatarDisplay } from "./AvatarDisplay";
import { calculateProgress } from "~/lib/leveling-system";
import { CoinIcon, FlameIcon, HeartIcon } from "../ui/Icons";

// --- NEW IMPORTS ---
import { useHeartSystem, MAX_HEARTS, HEART_COST } from "~/hooks/useHeartSystem";

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

// --- NEW HEART DROPDOWN COMPONENT ---
function HeartDropdown({ hearts, timeRemaining, buyHearts }: any) {
  const isFull = hearts >= MAX_HEARTS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Styled to match StatItem */}
        <button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-lg font-medium transition-transform hover:scale-125 cursor-pointer outline-none focus:ring-2 ring-red-200 dark:ring-red-900">
          <HeartIcon className="h-6 w-6 text-red-500 fill-red-500" />
          <span className="text-gray-900 dark:text-gray-100">{hearts}</span>
          {!isFull && (
            // Tiny timer next to number if regenerating
            <span className="text-[10px] text-gray-400 font-mono ml-1">
              {timeRemaining}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 p-2">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Lives</span>
          <Badge
            variant={isFull ? "default" : "outline"}
            className={
              isFull ? "bg-green-500" : "text-orange-500 border-orange-500"
            }
          >
            {isFull ? "MAX" : "REGENERATING"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Status Section */}
        <div className="p-3 bg-secondary/30 rounded-md mb-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Hearts</span>
            <span className="font-bold">
              {hearts} / {MAX_HEARTS}
            </span>
          </div>
          {!isFull && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Next in
              </span>
              <span className="font-mono font-bold text-orange-500">
                {timeRemaining}
              </span>
            </div>
          )}
        </div>

        {/* Refill Button */}
        <Button
          className="w-full gap-2 font-bold bg-green-500 hover:bg-green-600 text-white"
          size="lg"
          disabled={isFull}
          onClick={() => {
            if (isFull) return;
            buyHearts();
          }}
        >
          <Zap className="w-4 h-4 fill-white" />
          {isFull ? "Hearts are Full" : `Refill Full (${HEART_COST})`}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
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

  // --- 2. INIT HEART SYSTEM ---
  // Using the hook ensures the timer runs live in the header
  const { hearts, timeRemaining, buyHearts } = useHeartSystem(user);

  // --- 3. PROGRESS RING MATH ---
  const radius = 28;
  const center = 32;
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

              {/* --- REPLACED STATIC HEART WITH DROPDOWN --- */}
              <HeartDropdown
                hearts={hearts}
                timeRemaining={timeRemaining}
                buyHearts={buyHearts}
              />
            </div>
          </div>

          {/* Right: User Profile & Menu */}
          <div className="flex-none">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group select-none">
                  {/* Avatar Container */}
                  <div className="relative flex items-center justify-center w-16 h-16">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        className="stroke-gray-200 dark:stroke-gray-700"
                        strokeWidth="6"
                      />
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
