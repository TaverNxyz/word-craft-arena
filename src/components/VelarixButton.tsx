import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const VelarixButton = () => {
  return (
    <Button
      asChild
      className="fixed bottom-6 right-6 shadow-[var(--velarix-glow)] bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity z-50"
    >
      <a
        href="https://velarixsolutions.nl"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <span className="hidden sm:inline">Build And Scale Your Website With Velarix</span>
        <span className="sm:hidden">Build With Velarix</span>
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  );
};
