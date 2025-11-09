import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SESSION_KEY = "spelling-hive-session";

interface GameHistory {
  game_date: string;
  score: number;
  words_found: string[];
  pangrams_found: string[];
}

const getRank = (score: number, maxScore: number = 500): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage === 0) return "Beginner";
  if (percentage < 5) return "Good Start";
  if (percentage < 10) return "Moving Up";
  if (percentage < 20) return "Good";
  if (percentage < 30) return "Solid";
  if (percentage < 40) return "Nice";
  if (percentage < 50) return "Great";
  if (percentage < 60) return "Amazing";
  if (percentage < 70) return "Genius";
  if (percentage < 100) return "Queen Bee";
  return "Perfect!";
};

export default function History() {
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("player_stats")
          .select("*")
          .eq("session_id", sessionId)
          .order("game_date", { ascending: false })
          .limit(30);

        if (error) throw error;

        if (data) {
          setHistory(data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Game History
          </span>
        </h1>

        {history.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground">
              No games played yet. Start playing to build your history!
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Words Found</TableHead>
                  <TableHead>Pangrams</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((game, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {format(new Date(game.game_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary">{game.score}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-accent/10">
                        {getRank(game.score)}
                      </Badge>
                    </TableCell>
                    <TableCell>{game.words_found?.length || 0}</TableCell>
                    <TableCell>
                      {game.pangrams_found?.length > 0 ? (
                        <Badge className="bg-gradient-to-r from-primary to-accent">
                          {game.pangrams_found.length} 🎉
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
