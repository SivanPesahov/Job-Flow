import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/themeContext.tsx";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-transform text-yellow-500 duration-300 ${
          isDarkMode ? "rotate-0 scale-0" : "rotate-[360deg] scale-100"
        }`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-transform text-indigo-300 duration-300 absolute ${
          isDarkMode ? "rotate-[360deg] scale-100" : "rotate-0 scale-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
