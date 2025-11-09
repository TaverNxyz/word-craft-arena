import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "spelling-hive-session";

const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const useGamePersistence = () => {
  const [sessionId] = useState(() => getSessionId());
  const [isLoaded, setIsLoaded] = useState(false);

  const loadProgress = async () => {
    if (!sessionId) {
      setIsLoaded(true);
      return null;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('session_id', sessionId)
        .eq('game_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading progress:', error);
        setIsLoaded(true);
        return null;
      }

      setIsLoaded(true);
      return data;
    } catch (error) {
      console.error('Error loading progress:', error);
      setIsLoaded(true);
      return null;
    }
  };

  const saveProgress = async (score: number, wordsFound: string[], pangramsFound: string[], maxScore: number) => {
    if (!sessionId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate rank
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

      const currentRank = getRank(score, maxScore);

      // Get previous stats to calculate streak
      const { data: previousGames } = await supabase
        .from('player_stats')
        .select('*')
        .eq('session_id', sessionId)
        .order('game_date', { ascending: false })
        .limit(2);

      let currentStreak = 1;
      let bestStreak = 1;
      let bestRank = currentRank;

      if (previousGames && previousGames.length > 0) {
        const lastGame = previousGames[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if last game was yesterday for streak
        if (lastGame.game_date === yesterdayStr) {
          currentStreak = (lastGame.current_streak || 0) + 1;
        }

        // Update best streak
        bestStreak = Math.max(currentStreak, lastGame.best_streak || 0);

        // Compare ranks to keep the best
        const rankValue = (rank: string) => {
          const ranks = ["Beginner", "Good Start", "Moving Up", "Good", "Solid", "Nice", "Great", "Amazing", "Genius", "Queen Bee", "Perfect!"];
          return ranks.indexOf(rank);
        };
        
        if (rankValue(currentRank) > rankValue(lastGame.best_rank || "Beginner")) {
          bestRank = currentRank;
        } else {
          bestRank = lastGame.best_rank || currentRank;
        }
      }

      const { error } = await supabase
        .from('player_stats')
        .upsert({
          session_id: sessionId,
          score,
          words_found: wordsFound,
          pangrams_found: pangramsFound,
          game_date: today,
          best_rank: bestRank,
          games_played: (previousGames?.length || 0) + 1,
          current_streak: currentStreak,
          best_streak: bestStreak,
          last_played_date: today,
        }, {
          onConflict: 'session_id,game_date'
        });

      if (error) {
        console.error('Error saving progress:', error);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  return { loadProgress, saveProgress, isLoaded, sessionId };
};
