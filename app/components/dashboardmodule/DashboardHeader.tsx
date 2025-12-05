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
} from "~/components/ui/dialog"; // Ensure these exist or use alert-dialog
import {
  PanelLeftOpen,
  PanelLeftClose,
  Flame,
  CircleDollarSign,
  Heart,
  Moon,
  LogOut,
} from "lucide-react";
import { AvatarDisplay } from "./AvatarDisplay";
import CodeOnLogo from "../ui/CodeOnLogo";
import HeartIcon from "../ui/HeartIcon";
import FlameIcon from "../ui/FlameIcon";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}
function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div
      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-lg font-medium transition-transform hover:scale-105"
      title={label}
    >
      {icon}
      <span className="text-gray-900 dark:text-gray-100">{value}</span>
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

  const confirmLogout = () => {
    // 1. Close the dialog visually
    setShowLogoutDialog(false);

    // 2. Use a timeout to wait for the close animation
    setTimeout(() => {
      // 3. NUCLEAR OPTION: Manually remove the locks.
      // This forces the browser to become interactive again,
      // regardless of whether Radix finished its cleanup.
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";

      // 4. Now perform the logout
      onLogout();
    }, 300); // Increased to 300ms to ensure animation clears
  };
  return (
    <>
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 transition-colors">
        <div className="px-6 py-4 flex items-center">
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

          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-4">
              <StatItem
                icon={<FlameIcon className="h-6 w-5" />}
                value={stats.streaks}
                label="Streak"
              />
              <StatItem
                icon={<CodeOnLogo className="h-6 w-6" />}
                value={stats.coins}
                label="Coins"
              />
              <StatItem
                icon={
                  <HeartIcon className="h-6  w-6 text-red-500 fill-red-500" />
                }
                value={stats.hearts}
                label="Hearts"
              />
            </div>
          </div>

          <div className="flex-none">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <AvatarDisplay config={user?.avatarConfig} headOnly />
                  </div>

                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
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
                  // Add this onSelect handler
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
