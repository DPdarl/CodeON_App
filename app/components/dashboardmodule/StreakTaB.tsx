import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export function StreakTab() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Study Streak 📅
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Plan your learning sessions and track your consistency
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Goals</CardTitle>
          <CardDescription>
            Set targets for your learning this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-6">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => (
                <div key={day} className="text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                      index < 5
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    }`}
                  >
                    {day}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs ${
                      index < 3
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {index < 3 ? "✓" : index + 1}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Daily Practice</p>
                <p className="text-sm text-muted-foreground">
                  Complete at least 1 lesson each day
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                3/7 days
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Multiplayer Matches</p>
                <p className="text-sm text-muted-foreground">
                  Participate in 3 multiplayer games
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
              >
                1/3 games
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Skill Mastery</p>
                <p className="text-sm text-muted-foreground">
                  Reach 80% in Basic Syntax
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
              >
                85% Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
