import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, Flame, Calendar } from "lucide-react";

const SESSION_KEY = "spelling-hive-session";

const getRank = (score: number, maxScore: number): string => {
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

interface Stats {
  gamesPlayed: number;
  averageScore: number;
  bestRank: string;
  currentStreak: number;
  bestStreak: number;
}

export default function Statistics() {
  const [stats, setStats] = useState<Stats>({
    gamesPlayed: 0,
    averageScore: 0,
    bestRank: "Beginner",
    currentStreak: 0,
    bestStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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
          .order("game_date", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const gamesPlayed = data.length;
          const totalScore = data.reduce((sum, game) => sum + game.score, 0);
          const averageScore = Math.round(totalScore / gamesPlayed);
          
          // Find best rank
          let bestRankValue = "Beginner";
          let bestPercentage = 0;
          data.forEach((game) => {
            // Assuming maxScore is roughly 500 for calculation
            const percentage = (game.score / 500) * 100;
            if (percentage > bestPercentage) {
              bestPercentage = percentage;
              bestRankValue = getRank(game.score, 500);
            }
          });

          // Get streak info from most recent game
          const latestGame = data[0];
          
          setStats({
            gamesPlayed,
            averageScore,
            bestRank: latestGame.best_rank || bestRankValue,
            currentStreak: latestGame.current_streak || 0,
            bestStreak: latestGame.best_streak || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Games Played",
      value: stats.gamesPlayed,
      icon: Calendar,
      color: "from-primary to-accent",
    },
    {
      title: "Average Score",
      value: stats.averageScore,
      icon: Target,
      color: "from-accent to-primary",
    },
    {
      title: "Best Rank",
      value: stats.bestRank,
      icon: Trophy,
      color: "from-primary to-accent",
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`,
      icon: Flame,
      color: "from-accent to-primary",
    },
    {
      title: "Best Streak",
      value: `${stats.bestStreak} ${stats.bestStreak === 1 ? "day" : "days"}`,
      icon: Flame,
      color: "from-primary to-accent",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-game-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Statistics
          </span>
        </h1>

        {stats.gamesPlayed === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground">
              No games played yet. Start playing to see your statistics!
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="p-6 shadow-[var(--velarix-glow)] hover:scale-105 transition-transform"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-sm text-muted-foreground mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
