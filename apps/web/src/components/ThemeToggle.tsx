"use client";

import { useThemeStore } from "@/app/store/themeStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="top-4 right-4 z-50 px-4 py-2 rounded bg-white text-black dark:bg-black dark:text-white border"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
