import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "spelling-hive-session";

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const useGamePersistence = () => {
  const [sessionId] = useState(getSessionId());
  const [isLoaded, setIsLoaded] = useState(false);

  const loadProgress = async () => {
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

  const saveProgress = async (score: number, wordsFound: string[], pangramsFound: string[]) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('player_stats')
        .upsert({
          session_id: sessionId,
          score,
          words_found: wordsFound,
          pangrams_found: pangramsFound,
          game_date: today,
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

  return { loadProgress, saveProgress, isLoaded };
};
