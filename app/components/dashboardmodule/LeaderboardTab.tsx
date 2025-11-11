import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Crown } from "lucide-react";

interface LeaderboardTabProps {
  user: any;
}

export function LeaderboardTab({ user }: LeaderboardTabProps) {
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
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Leaderboard 🏆
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          See how you rank against other C# learners
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Players</CardTitle>
          <CardDescription>
            Global ranking based on XP and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Top 3 players with special styling */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cleo" />
                  <AvatarFallback>CT</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Cleo Turner</p>
                  <p className="text-sm text-muted-foreground">Level 8</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">4,820 XP</p>
                <p className="text-sm text-muted-foreground">28 wins</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Max" />
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Max Rodriguez</p>
                  <p className="text-sm text-muted-foreground">Level 7</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">3,950 XP</p>
                <p className="text-sm text-muted-foreground">24 wins</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jasmine" />
                  <AvatarFallback>JW</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Jasmine Wu</p>
                  <p className="text-sm text-muted-foreground">Level 6</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">3,210 XP</p>
                <p className="text-sm text-muted-foreground">20 wins</p>
              </div>
            </div>

            {/* Current user ranking */}
            <div className="flex items-center justify-between p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  15
                </div>
                <Avatar>
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback>
                    {getUserInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.displayName || "You"}</p>
                  <p className="text-sm text-muted-foreground">Level 3</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">1,250 XP</p>
                <p className="text-sm text-muted-foreground">5 wins</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
