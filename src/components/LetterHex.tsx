import { cn } from "@/lib/utils";

interface LetterHexProps {
  letter: string;
  isCenter?: boolean;
  onClick: () => void;
  rotation?: number;
}

export const LetterHex = ({ letter, isCenter, onClick, rotation = 0 }: LetterHexProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-16 h-[72px] md:w-20 md:h-[90px] flex items-center justify-center font-bold text-2xl md:text-3xl uppercase transition-all duration-300 hover:scale-105 active:scale-95",
        "before:content-[''] before:absolute before:inset-0 before:bg-hex-bg before:transition-colors",
        "hover:before:bg-hex-hover",
        isCenter && "before:!bg-hex-center",
        "clip-hexagon animate-in fade-in"
      )}
      style={{
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <span 
        className="relative z-10 text-hex-text transition-transform duration-300"
        style={{ transform: `rotate(-${rotation}deg)` }}
      >
        {letter}
      </span>
    </button>
  );
};
