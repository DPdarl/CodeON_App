import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Trophy, Zap, Users, Crown } from "lucide-react";

export function ProgressTab() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Your Progress 📊
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track your learning journey and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Skills Mastery</CardTitle>
            <CardDescription>
              Your proficiency in different C# concepts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Basic Syntax</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Object-Oriented Programming</span>
                <span className="font-medium">70%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>LINQ</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Async Programming</span>
                <span className="font-medium">30%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{ width: "30%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Badges you've earned so far</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2 dark:bg-yellow-900/20">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="font-medium text-sm">First Steps</p>
                <p className="text-xs text-muted-foreground">
                  Complete first lesson
                </p>
              </div>

              <div className="flex flex-col items-center p-4 border rounded-lg text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 dark:bg-blue-900/20">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-medium text-sm">3-Day Streak</p>
                <p className="text-xs text-muted-foreground">
                  Practice for 3 days straight
                </p>
              </div>

              <div className="flex flex-col items-center p-4 border rounded-lg text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 dark:bg-green-900/20">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium text-sm">Social Coder</p>
                <p className="text-xs text-muted-foreground">
                  Win a multiplayer match
                </p>
              </div>

              <div className="flex flex-col items-center p-4 border rounded-lg text-center opacity-50">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 dark:bg-purple-900/20">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-medium text-sm">C# Master</p>
                <p className="text-xs text-muted-foreground">
                  Complete all advanced lessons
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
