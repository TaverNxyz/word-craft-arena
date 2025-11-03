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

  const saveProgress = async (score: number, wordsFound: string[], pangramsFound: string[]) => {
    if (!sessionId) return;

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

  return { loadProgress, saveProgress, isLoaded, sessionId };
};
