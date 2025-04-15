import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";

  const stored = localStorage.getItem("theme") as Theme;
  if (stored) {
    applyTheme(stored);
    return stored;
  }

  // Device or Browser in dark theme or no
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(isDark ? "dark" : "light");
  return isDark ? "dark" : "light";
};

// Apply theme to document root
const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const body = document.body;
  let effectiveTheme = theme;

  if (theme === "system") {
    effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Remove existing theme classes
  body.classList.remove("dark-theme", "light-theme");
  // Add the current theme class
  body.classList.add(`${effectiveTheme}-theme`);

  const themeColors = {
    dark: {
      "--bg-dark": "#121212",
      "--sidebar-bg": "rgba(30, 30, 30, 0.6)",
      "--sidebar-glass": "rgba(30, 30, 30, 0.4)",
      "--sidebar-border": "rgba(255, 255, 255, 0.1)",
      "--card-bg": "rgba(46, 46, 46, 0.7)",
      "--card-bg-solid": "#2E2E2E",
      "--accent": "rgba(58, 58, 58, 0.8)",
      "--accent-hover": "rgba(70, 70, 70, 0.8)",
      "--text-light": "#E0E0E0",
      "--border-color": "rgba(68, 68, 68, 0.5)",
      "--glass-border": "rgba(255, 255, 255, 0.1)",
      "--glass-shadow": "0 8px 32px rgba(0, 0, 0, 0.3)",
      "--glass-glow": "0 0 15px rgba(255, 255, 255, 0.05)",
    },
    light: {
      "--bg-dark": "#ffffff",
      "--sidebar-bg": "rgba(255, 255, 255, 0.7)",
      "--sidebar-glass": "rgba(255, 255, 255, 0.6)",
      "--sidebar-border": "rgba(0, 0, 0, 0.05)",
      "--card-bg": "rgba(255, 255, 255, 0.8)",
      "--card-bg-solid": "#ffffff",
      "--accent": "rgba(240, 240, 240, 0.8)",
      "--accent-hover": "rgba(230, 230, 230, 0.8)",
      "--text-light": "#333333",
      "--border-color": "rgba(200, 200, 200, 0.5)",
      "--glass-border": "rgba(0, 0, 0, 0.05)",
      "--glass-shadow": "0 8px 32px rgba(0, 0, 0, 0.05)",
      "--glass-glow": "0 0 15px rgba(0, 0, 0, 0.02)",
    },
  };

  const colors =
    effectiveTheme === "dark" ? themeColors.dark : themeColors.light;
  Object.entries(colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

const initialTheme = getInitialTheme();

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme(theme);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
