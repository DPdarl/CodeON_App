// ~/components/dashboard/DashboardHeader.tsx
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
  PanelLeftOpen,
  PanelLeftClose,
  Flame,
  CircleDollarSign,
  Heart,
  Moon,
  LogOut,
} from "lucide-react";

// (StatItem component is unchanged)
interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}
function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div
      className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-sm font-medium"
      title={label}
    >
      {icon}
      <span className="text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

// (Props interface is unchanged)
interface DashboardHeaderProps {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  } | null;
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

// ▼▼▼ THIS IS THE FIX ▼▼▼
// We provide a default value for the stats prop in case it's not sent.
const defaultStats = {
  streaks: 0,
  coins: 0,
  hearts: 0,
};
// ▲▲▲ END OF FIX ▲▲▲

export function DashboardHeader({
  user,
  sidebarCollapsed,
  onToggleSidebar,
  stats = defaultStats, // <-- We assign the default value here
  onSwitchTheme,
  onLogout,
}: DashboardHeaderProps) {
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center">
        {/* Left side - Toggle Button (unchanged) */}
        <div className="flex-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-9 w-9"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Middle - Stats (this is now safe) */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-4">
            <StatItem
              icon={<Flame className="h-4 w-4 text-orange-500" />}
              value={stats.streaks}
              label="Current Streak"
            />
            <StatItem
              icon={<CircleDollarSign className="h-4 w-4 text-yellow-500" />}
              value={stats.coins}
              label="Coins"
            />
            <StatItem
              icon={<Heart className="h-4 w-4 text-red-500" />}
              value={stats.hearts}
              label="Hearts"
            />
          </div>
        </div>

        {/* Right side - User Info Dropdown */}
        <div className="flex-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Account options"
              >
                <Avatar>
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>
                    {getUserInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                onClick={onLogout}
                className="cursor-pointer text-red-600 dark:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
