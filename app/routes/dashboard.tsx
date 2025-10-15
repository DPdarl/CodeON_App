import { useAuth } from "~/contexts/AuthContext";
import { PrivateRoute } from "~/components/PrivateRoute";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Trophy,
  BookOpen,
  Clock,
  Target,
  Zap,
  Star,
  Users,
  Crown,
  Swords,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import CodeOnLogo from "~/components/ui/CodeOnLogo";
import { Sidebar } from "~/components/SideBar";
import { CustomizeAvatar } from "~/components/CustomizeAvatar";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard | MyApp" },
    { name: "description", content: "Your app dashboard" },
  ];
};

// Avatar customization options
const skinTones = [
  "#FFDBAC",
  "#F5D0A9",
  "#E8BE99",
  "#D8AE8F",
  "#C99789",
  "#BA866A",
  "#AB7856",
  "#9D6B45",
  "#8E5E3A",
  "#7F512E",
];

const hairStyles = [
  { id: "short", name: "Short", emoji: "💇" },
  { id: "long", name: "Long", emoji: "💁" },
  { id: "curly", name: "Curly", emoji: "👩‍🦱" },
  { id: "afro", name: "Afro", emoji: "👨‍🦱" },
  { id: "bun", name: "Bun", emoji: "👱‍♀️" },
  { id: "ponytail", name: "Ponytail", emoji: "💁‍♀️" },
  { id: "bald", name: "Bald", emoji: "👨‍🦲" },
];

const hairColors = [
  "#2C2222",
  "#3D2B1F",
  "#5D4037",
  "#6D4C41",
  "#8D6E63",
  "#A1887F",
  "#BFA69F",
  "#D7CCC8",
  "#F5D0A9",
  "#FFB74D",
  "#FF9800",
  "#F57C00",
  "#E65100",
  "#8B4513",
  "#654321",
];

const eyeColors = [
  "#2E7D32",
  "#1B5E20",
  "#004D40",
  "#00695C",
  "#00796B",
  "#00897B",
  "#009688",
  "#26A69A",
  "#4DB6AC",
  "#80CBC4",
  "#01579B",
  "#0277BD",
  "#0288D1",
  "#039BE5",
  "#03A9F4",
  "#29B6F6",
  "#4FC3F7",
  "#81D4FA",
  "#B3E5FC",
  "#E1F5FE",
  "#311B92",
  "#4527A0",
  "#512DA8",
  "#5E35B1",
  "#673AB7",
  "#7E57C2",
  "#9575CD",
  "#B39DDB",
  "#D1C4E9",
  "#EDE7F6",
];

const clothingStyles = [
  { id: "casual", name: "Casual", emoji: "👕" },
  { id: "formal", name: "Formal", emoji: "👔" },
  { id: "hoodie", name: "Hoodie", emoji: "👚" },
  { id: "suit", name: "Suit", emoji: "🤵" },
  { id: "developer", name: "Developer", emoji: "💻" },
  { id: "sports", name: "Sports", emoji: "🎽" },
];

const clothingColors = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
  "#607D8B",
  "#000000",
];

const accessories = [
  { id: "none", name: "None", emoji: "❌" },
  { id: "glasses", name: "Glasses", emoji: "👓" },
  { id: "sunglasses", name: "Sunglasses", emoji: "🕶️" },
  { id: "hat", name: "Hat", emoji: "🧢" },
  { id: "headphones", name: "Headphones", emoji: "🎧" },
  { id: "earrings", name: "Earrings", emoji: "💎" },
];

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const [avatarConfig, setAvatarConfig] = useState({
    skinTone: skinTones[0],
    hairStyle: hairStyles[0].id,
    hairColor: hairColors[0],
    eyeColor: eyeColors[0],
    clothingStyle: clothingStyles[0].id,
    clothingColor: clothingColors[0],
    accessory: accessories[0].id,
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Multiplayer quiz logic
  const startMultiplayerQuiz = () => {
    // This would connect to your backend/matchmaking service
    console.log("Starting multiplayer quiz...");

    // For now, we'll simulate joining a game
    const gameId = Math.random().toString(36).substring(2, 8);
    navigate(`/multiplayer/${gameId}`);
  };

  const joinMultiplayerQuiz = () => {
    // Logic to join an existing game
    const gameCode = prompt("Enter game code:");
    if (gameCode) {
      navigate(`/multiplayer/${gameCode}`);
    }
  };

  const handleSaveAvatar = async (avatarConfig: any) => {
    try {
      console.log("Saving avatar configuration:", avatarConfig);

      await updateProfile({
        displayName: user?.displayName ?? undefined,
        photoURL: generateAvatarURL(avatarConfig), // You'll need to move this function or keep it in dashboard
        avatarConfig: avatarConfig,
      });

      alert("Avatar saved successfully!");
    } catch (error) {
      console.error("Error saving avatar:", error);
      alert("Error saving avatar. Please try again.");
    }
  };

  const handleResetAvatar = () => {
    setAvatarConfig({
      skinTone: skinTones[0],
      hairStyle: hairStyles[0].id,
      hairColor: hairColors[0],
      eyeColor: eyeColors[0],
      clothingStyle: clothingStyles[0].id,
      clothingColor: clothingColors[0],
      accessory: accessories[0].id,
    });
  };

  const generateAvatarURL = (config: typeof avatarConfig) => {
    // This is a simplified version. In a real app, you might use a service like:
    // - DiceBear Avatars (https://www.dicebear.com/)
    // - Multiavatar (https://multiavatar.com/)
    // - Or generate SVG avatars client-side

    const params = new URLSearchParams({
      skin: config.skinTone.replace("#", ""),
      hair: config.hairStyle,
      hairColor: config.hairColor.replace("#", ""),
      eyes: config.eyeColor.replace("#", ""),
      clothing: config.clothingStyle,
      clothingColor: config.clothingColor.replace("#", ""),
      accessory: config.accessory,
    });

    return `/api/avatar?${params.toString()}`;
  };

  const updateAvatarConfig = (
    key: keyof typeof avatarConfig,
    value: string
  ) => {
    setAvatarConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <PrivateRoute>
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-900 border-r shadow-sm flex flex-col">
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onLogout={handleLogout}
            user={user}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {activeTab === "home" && "Home"}
                {activeTab === "multiplayer" && "Multiplayer"}
                {activeTab === "leaderboard" && "Leaderboard"}
                {activeTab === "progress" && "Progress"}
                {activeTab === "streak" && "Streak"}
                {activeTab === "customize" && "Customize"}
              </h2>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
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
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="p-6">
            {activeTab === "home" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome back,{" "}
                    {user?.displayName?.split(" ")[0] || "Learner"}! 👋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ready to continue your C# learning journey?
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Lessons Completed
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">
                        +2 from last week
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Current Streak
                      </CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">5 days</div>
                      <p className="text-xs text-muted-foreground">
                        Keep it up! 🔥
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total XP
                      </CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,250</div>
                      <p className="text-xs text-muted-foreground">
                        Level 3 Developer
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Time Spent
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24h</div>
                      <p className="text-xs text-muted-foreground">
                        This month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                    <CardDescription>
                      What would you like to do today?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="w-full justify-start" size="lg">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="lg"
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      View Achievements
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      size="lg"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Practice Challenges
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "multiplayer" && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Multiplayer Challenges 🎮
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Test your C# knowledge against other developers in
                    real-time!
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
                        onClick={startMultiplayerQuiz}
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
                        onClick={joinMultiplayerQuiz}
                      >
                        Join Game
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Games</CardTitle>
                    <CardDescription>
                      Your recent multiplayer sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <div>
                            <p className="font-medium">C# Basics Challenge</p>
                            <p className="text-sm text-muted-foreground">
                              2 days ago
                            </p>
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
                            <p className="text-sm text-muted-foreground">
                              5 days ago
                            </p>
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
                            <p className="text-sm text-muted-foreground">
                              1 week ago
                            </p>
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
            )}

            {activeTab === "leaderboard" && (
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
                            <p className="text-sm text-muted-foreground">
                              Level 8
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">4,820 XP</p>
                          <p className="text-sm text-muted-foreground">
                            28 wins
                          </p>
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
                            <p className="text-sm text-muted-foreground">
                              Level 7
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">3,950 XP</p>
                          <p className="text-sm text-muted-foreground">
                            24 wins
                          </p>
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
                            <p className="text-sm text-muted-foreground">
                              Level 6
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">3,210 XP</p>
                          <p className="text-sm text-muted-foreground">
                            20 wins
                          </p>
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
                            <p className="font-medium">
                              {user?.displayName || "You"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Level 3
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">1,250 XP</p>
                          <p className="text-sm text-muted-foreground">
                            5 wins
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "progress" && (
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
                      <CardDescription>
                        Badges you've earned so far
                      </CardDescription>
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
            )}

            {activeTab === "streak" && (
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
            )}

            {activeTab === "customize" && ( // Changed from "customizer" to "customize"
              <CustomizeAvatar user={user} onSaveAvatar={handleSaveAvatar} />
            )}
          </main>
        </div>
      </div>
    </PrivateRoute>
  );
}
