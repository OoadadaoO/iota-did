"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeContextType = {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
});

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const [themeState, setThemeState] = useState<"light" | "dark" | "system">(
    "system",
  );

  function loadTheme() {
    if (localStorage.theme === "dark") {
      setThemeState("dark");
      document.documentElement.classList.add("dark");
    } else if (localStorage.theme === "light") {
      setThemeState("light");
      document.documentElement.classList.remove("dark");
    } else {
      setThemeState("system");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }

  function setTheme(theme: "light" | "dark" | "system") {
    if (theme === "system") {
      setThemeState("system");
      localStorage.removeItem("theme");
    } else {
      setThemeState(theme);
      localStorage.theme = theme;
    }
    loadTheme();
  }

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: themeState, setTheme }}>
      <script
        id="load-theme"
        dangerouslySetInnerHTML={{
          __html: themeLoader,
        }}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // if (!context) {
  //   throw new Error("useTheme must be used within a ThemeProvider");
  // }
  return context;
}

const themeLoader = `(function () {
  if (localStorage.theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (localStorage.theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}) ()`;
