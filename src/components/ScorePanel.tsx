import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface ScorePanelProps {
  score: number;
  maxScore: number;
  foundWords: number;
}

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

export const ScorePanel = ({ score, maxScore, foundWords }: ScorePanelProps) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const rank = getRank(score, maxScore);

  return (
    <Card className="w-full max-w-md p-6 bg-card/80 backdrop-blur-sm shadow-[var(--velarix-glow)]">
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <div>
            <p className="text-sm text-muted-foreground">Your rank</p>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{rank}</h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{score}</p>
            <p className="text-sm text-muted-foreground">points</p>
          </div>
        </div>

        <Progress value={percentage} className="h-2" />

        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{foundWords} words found</span>
          <span>{score} / {maxScore}</span>
        </div>
      </div>
    </Card>
  );
};
