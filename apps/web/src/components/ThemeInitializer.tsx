"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const defaultTheme = storedTheme || "dark";
    document.documentElement.classList.add(defaultTheme);
  }, []);

  return null;
}
