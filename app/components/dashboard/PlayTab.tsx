import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Swords, Users } from "lucide-react";

interface PlayTabProps {
  onStartMultiplayerQuiz: () => void;
  onJoinMultiplayerQuiz: () => void;
}

export function PlayTab({
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
}: PlayTabProps) {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Multiplayer Challenges 🎮
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test your C# knowledge against other developers in real-time!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Swords className="h-5 w-5" />
              <span>Create a Game</span>
            </CardTitle>
            <CardDescription>
              Start a new multiplayer session and invite friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={onStartMultiplayerQuiz}
            >
              Create Game
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Join a Game</span>
            </CardTitle>
            <CardDescription>
              Enter a code to join an existing game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={onJoinMultiplayerQuiz}
            >
              Join Game
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
          <CardDescription>Your recent multiplayer sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium">C# Basics Challenge</p>
                  <p className="text-sm text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              >
                Won
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div>
                  <p className="font-medium">OOP Master Match</p>
                  <p className="text-sm text-muted-foreground">5 days ago</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              >
                Lost
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="font-medium">Algorithm Showdown</p>
                  <p className="text-sm text-muted-foreground">1 week ago</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
              >
                Draw
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
