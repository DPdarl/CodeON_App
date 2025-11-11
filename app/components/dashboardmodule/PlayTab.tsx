// app/routes/dashboard/PlayTab.tsx

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  SelectionCarousel,
  type CarouselItem,
} from "~/components/dashboardmodule/SelectionCarousel";
import { MultiplayerModal } from "~/components/playmodule/MultiplayerModal";
// 1. Import the new SoloChallengeModal
import { SoloChallengeModal } from "~/components/playmodule/SoloChallengeModal";
import { useNavigate, useNavigation } from "@remix-run/react";
import { BookOpen, Target, Users } from "lucide-react";

interface PlayTabProps {
  // These are passed from the main dashboard route
  onStartMultiplayerQuiz: (gameMode: string) => void;
  onJoinMultiplayerQuiz: (gameCode: string) => void;
}

// Define the carousel items (unchanged)
const gameModes: CarouselItem[] = [
  {
    id: "multiplayer",
    title: "Multiplayer",
    description: "Challenge other C# developers",
    Icon: Users,
  },
  {
    id: "solo",
    title: "Solo Challenge",
    description: "Solve machine problems",
    Icon: Target,
  },
  {
    id: "basics",
    title: "Learn Basics",
    description: "Practice C# fundamentals",
    Icon: BookOpen,
  },
];

// 2. Define the shape of our mock progress data
interface SoloProgress {
  level: number;
  lastChallengeName: string;
  userProgress: number;
}

// 3. This is our mock data fetching function
const fetchSoloProgress = (): Promise<SoloProgress> => {
  return new Promise((resolve) => {
    // This simulates a network request to your database
    setTimeout(() => {
      resolve({
        level: 1, // You would fetch this from your DB
        lastChallengeName: "Volume of Sphere", // You would fetch this
        userProgress: 0, // You would fetch this
      });
    }, 500); // 500ms simulated network delay
  });
};

export function PlayTab({
  onStartMultiplayerQuiz,
  onJoinMultiplayerQuiz,
}: PlayTabProps) {
  const [isMultiplayerModalOpen, setIsMultiplayerModalOpen] = useState(false);
  // 4. Add state for the new Solo Challenge modal
  const [isSoloModalOpen, setIsSoloModalOpen] = useState(false);
  const [soloProgress, setSoloProgress] = useState<SoloProgress | null>(null);

  // 5. This loading state is for the CAROUSEL "Play" button
  const [isFetchingProgress, setIsFetchingProgress] = useState(false);

  const navigate = useNavigate();
  const navigation = useNavigation();

  // 6. Use the fetching state for the carousel button's loading spinner
  const loadingItemId = isFetchingProgress
    ? "solo"
    : navigation.state === "loading"
    ? "basics" // Keep loading for 'basics'
    : null;

  const handlePlay = async (item: CarouselItem) => {
    // Prevent clicking if we're already loading
    if (navigation.state !== "idle" || isFetchingProgress) return;

    switch (item.id) {
      case "multiplayer":
        setIsMultiplayerModalOpen(true);
        break;

      case "solo":
        // 7. Handle the "solo" card click
        setIsFetchingProgress(true); // Show spinner on carousel button
        const progress = await fetchSoloProgress(); // "Fetch" data
        setSoloProgress(progress); // Store the data
        setIsFetchingProgress(false); // Hide spinner on carousel button
        setIsSoloModalOpen(true); // Open the modal
        break;

      case "basics":
        // This still uses the simple delay
        setTimeout(() => navigate("/learn-basics"), 100);
        break;

      default:
        console.warn("Unknown play item:", item.id);
    }
  };

  // Handlers for the multiplayer modal (unchanged)
  const handleCreateGame = (gameMode: string) => {
    setIsMultiplayerModalOpen(false);
    onStartMultiplayerQuiz(gameMode);
  };

  const handleJoinGame = (gameCode: string) => {
    setIsMultiplayerModalOpen(false);
    onJoinMultiplayerQuiz(gameCode);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Play & Learn 🎮
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a mode to test your skills and have fun!
        </p>
      </div>

      <div className="my-12">
        <SelectionCarousel
          items={gameModes}
          onPlay={handlePlay}
          loadingItemId={loadingItemId}
        />
      </div>

      {/* Recent games card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Games</CardTitle>
          <CardDescription>Your recent multiplayer sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* ... your recent games items ... */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">C# Basics Challenge</p>
                <p className="text-sm text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiplayer Modal */}
      <MultiplayerModal
        open={isMultiplayerModalOpen}
        onOpenChange={setIsMultiplayerModalOpen}
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
      />

      {/* 8. Add the new Solo Challenge Modal */}
      <SoloChallengeModal
        open={isSoloModalOpen}
        onOpenChange={setIsSoloModalOpen}
        progress={soloProgress}
      />
    </div>
  );
}
