import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, BarChart3, History, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export const Navigation = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              <h1 className="text-3xl md:text-4xl font-bold">Velarix</h1>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={isActive("/") ? "bg-muted" : ""}
            >
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={isActive("/statistics") ? "bg-muted" : ""}
            >
              <Link to="/statistics">
                <BarChart3 className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              asChild
              className={isActive("/history") ? "bg-muted" : ""}
            >
              <Link to="/history">
                <History className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
