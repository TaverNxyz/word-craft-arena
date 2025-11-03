import { useState, useEffect } from "react";
import { LetterHex } from "./LetterHex";
import { GameControls } from "./GameControls";
import { ScorePanel } from "./ScorePanel";
import { WordsList } from "./WordsList";
import { shuffle } from "@/lib/gameUtils";
import { toast } from "sonner";
import { VALID_WORDS, PANGRAMS, MAX_SCORE } from "@/lib/wordList";
import { useGamePersistence } from "@/hooks/useGamePersistence";

const GAME_DATA = {
  centerLetter: "E",
  outerLetters: ["R", "T", "A", "C", "H", "S"],
  validWords: VALID_WORDS,
  pangrams: PANGRAMS,
  maxScore: MAX_SCORE,
};

export const GameBoard = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [outerLetters, setOuterLetters] = useState(GAME_DATA.outerLetters);
  const [rotation, setRotation] = useState(0);
  const { loadProgress, saveProgress, isLoaded } = useGamePersistence();
  const allLetters = [GAME_DATA.centerLetter, ...outerLetters];

  // Load saved progress on mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      const savedData = await loadProgress();
      if (savedData) {
        setScore(savedData.score);
        setFoundWords(savedData.words_found || []);
        toast.success("Progress restored!");
      }
    };
    loadSavedProgress();
  }, []);

  // Auto-save progress whenever score or words change
  useEffect(() => {
    if (isLoaded && (score > 0 || foundWords.length > 0)) {
      const pangramsFound = foundWords.filter(word => 
        GAME_DATA.pangrams.includes(word.toLowerCase())
      );
      saveProgress(score, foundWords, pangramsFound);
    }
  }, [score, foundWords, isLoaded]);

  const handleLetterClick = (letter: string) => {
    setCurrentWord((prev) => prev + letter);
  };

  const handleShuffle = () => {
    setOuterLetters(shuffle([...outerLetters]));
    setRotation(prev => prev + 360);
    toast.info("Letters shuffled!");
  };

  const handleDelete = () => {
    setCurrentWord((prev) => prev.slice(0, -1));
  };

  const calculateScore = (word: string) => {
    if (word.length === 4) return 1;
    if (GAME_DATA.pangrams.includes(word.toLowerCase())) return word.length + 7;
    return word.length;
  };

  const handleSubmit = () => {
    const word = currentWord.toLowerCase();
    
    if (word.length < 4) {
      toast.error("Word must be at least 4 letters!");
      return;
    }

    if (!word.includes(GAME_DATA.centerLetter.toLowerCase())) {
      toast.error(`Word must contain ${GAME_DATA.centerLetter}!`);
      return;
    }

    if (foundWords.includes(word)) {
      toast.error("Already found!");
      return;
    }

    if (!GAME_DATA.validWords.includes(word)) {
      toast.error("Not in word list!");
      return;
    }

    const wordScore = calculateScore(word);
    const isPangram = GAME_DATA.pangrams.includes(word);
    
    setFoundWords([...foundWords, word]);
    setScore(score + wordScore);
    setCurrentWord("");
    
    if (isPangram) {
      toast.success(`🎉 Pangram! +${wordScore} points!`, {
        duration: 3000,
      });
    } else {
      toast.success(`+${wordScore} points!`);
    }
  };

  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-game-text mb-2">Spelling Hive</h1>
          <p className="text-muted-foreground">Create words using the letters below</p>
        </header>

        <div className="grid md:grid-cols-[1fr_400px] gap-8">
          <div className="flex flex-col items-center gap-6">
            <ScorePanel score={score} maxScore={GAME_DATA.maxScore} foundWords={foundWords.length} />
            
            <div className="w-full max-w-md bg-card rounded-lg p-4 mb-4">
              <div className="text-center text-2xl md:text-3xl font-bold text-game-text min-h-[50px] flex items-center justify-center uppercase border-b-2 border-border pb-4">
                {currentWord || <span className="text-muted-foreground">Type or click letters</span>}
              </div>
            </div>

            <div className="relative w-full max-w-md h-[300px] md:h-[360px] flex items-center justify-center">
              {/* Center hexagon */}
              <div className="absolute">
                <LetterHex
                  letter={GAME_DATA.centerLetter}
                  isCenter
                  onClick={() => handleLetterClick(GAME_DATA.centerLetter)}
                  rotation={0}
                />
              </div>

              {/* Outer hexagons in circle */}
              {outerLetters.map((letter, index) => {
                const angle = (index * 60 - 90) * (Math.PI / 180);
                const radius = 85;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <div
                    key={`${letter}-${index}`}
                    className="absolute transition-transform duration-500"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <LetterHex
                      letter={letter}
                      onClick={() => handleLetterClick(letter)}
                      rotation={rotation}
                    />
                  </div>
                );
              })}
            </div>

            <GameControls
              onShuffle={handleShuffle}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
            />
          </div>

          <WordsList words={foundWords} pangrams={GAME_DATA.pangrams} />
        </div>
      </div>
    </div>
  );
};
