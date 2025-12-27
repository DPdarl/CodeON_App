import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Download,
  Gamepad2,
  Trophy,
  Users,
  Calendar,
  Loader2,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { exportToCSV } from "~/utils/exportHelper";
import { toast } from "sonner";

// Mock Data Structure for Matches (Replace with DB fetch later)
const MOCK_MATCHES = [
  {
    id: "match-101",
    mode: "Battle Royale",
    date: "2023-12-25T14:30:00",
    winner: "Juan Dela Cruz",
    participants_count: 24,
    // Detailed results for export
    results: [
      { rank: 1, name: "Juan Dela Cruz", score: 1500, accuracy: "95%" },
      { rank: 2, name: "Maria Clara", score: 1450, accuracy: "92%" },
      { rank: 3, name: "Jose Rizal", score: 1300, accuracy: "88%" },
    ],
  },
  {
    id: "match-102",
    mode: "Team Duel",
    date: "2023-12-26T09:15:00",
    winner: "Team Alpha (BSIT-1A)",
    participants_count: 12,
    results: [
      { rank: 1, name: "Team Alpha", score: 50, accuracy: "100%" },
      { rank: 2, name: "Team Beta", score: 40, accuracy: "80%" },
    ],
  },
];

export function MatchHistoryTab() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      setMatches(MOCK_MATCHES);
      setLoading(false);
    }, 800);
  }, []);

  const handleExportMatch = (match: any) => {
    // 1. Prepare Data "Kahoot Style" (Rank, Name, Score, Accuracy)
    const exportData = match.results.map((r: any) => ({
      Rank: r.rank,
      "Player Name": r.name,
      "Total Score": r.score,
      Accuracy: r.accuracy,
      "Game Mode": match.mode,
      "Date Played": new Date(match.date).toLocaleDateString(),
    }));

    // 2. Export
    exportToCSV(exportData, `Match_Results_${match.id}`);
    toast.success(`Exported results for ${match.mode}`);
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle>Multiplayer Match History</CardTitle>
        <CardDescription>
          Review past game sessions and export results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            {/* ✅ FIXED: Replaced ui/table with standard HTML table */}
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4">Game Session</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Participants</th>
                  <th className="p-4">Winner</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Loader2 className="animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : (
                  matches.map((match) => (
                    <tr
                      key={match.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                            <Gamepad2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {match.mode}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              ID: {match.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(match.date).toLocaleDateString()}
                          <span className="text-xs opacity-70">
                            (
                            {new Date(match.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            )
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{match.participants_count} Players</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 gap-1"
                        >
                          <Trophy className="w-3 h-3" /> {match.winner}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportMatch(match)}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" /> Results
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
