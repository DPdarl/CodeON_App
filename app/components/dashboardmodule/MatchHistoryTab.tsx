// app/components/dashboardmodule/MatchHistoryTab.tsx
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
  AlertCircle,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { exportToCSV } from "~/utils/exportHelper"; // Ensure this path is correct
import { toast } from "sonner";

interface Match {
  id: string;
  mode: string;
  played_at: string;
  winner_name: string;
  participants_count: number;
  results: any[]; // JSON data
}

export function MatchHistoryTab() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA FROM SUPABASE ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("match_history")
          .select("*")
          .order("played_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setMatches(data as Match[]);
        }
      } catch (err) {
        console.error("Error fetching match history:", err);
        toast.error("Failed to load match history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleExportMatch = (match: Match) => {
    if (!match.results || match.results.length === 0) {
      toast.error("No detailed results available for this match.");
      return;
    }

    // 1. Prepare Data
    const exportData = match.results.map((r: any) => ({
      Rank: r.rank,
      "Player Name": r.name,
      "Total Score": r.score,
      Accuracy: r.accuracy,
      "Game Mode": match.mode,
      "Date Played": new Date(match.played_at).toLocaleDateString(),
    }));

    // 2. Export
    exportToCSV(
      exportData,
      `Match_${match.mode.replace(/\s+/g, "_")}_${match.id.slice(0, 4)}`
    );
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
                    <td colSpan={5} className="p-12 text-center">
                      <Loader2 className="animate-spin mx-auto w-8 h-8 text-indigo-500" />
                      <p className="text-gray-500 mt-2">Loading matches...</p>
                    </td>
                  </tr>
                ) : matches.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 opacity-20" />
                        <p>No matches found.</p>
                      </div>
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
                              ID: {match.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(match.played_at).toLocaleDateString()}
                          <span className="text-xs opacity-70">
                            (
                            {new Date(match.played_at).toLocaleTimeString([], {
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
                        {match.winner_name ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 gap-1"
                          >
                            <Trophy className="w-3 h-3" /> {match.winner_name}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
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
