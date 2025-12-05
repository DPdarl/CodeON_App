// app/components/ui/CodeOnLogo.tsx
import React from "react";

interface IconProps {
  className?: string;
}

/**
 * Renders the CodeON logo, automatically switching between
 * light and dark mode PNG versions based on the active theme.
 * It reads from the /public folder.
 */
export default function TrophyIcon({ className = "h-8 w-8" }: IconProps) {
  return (
    <>
      {/* Light Mode Logo:
        - Shown by default ("block")
        - Hidden when dark mode is active ("dark:hidden")
      */}
      <img
        src="/assets/icons/trophy.png"
        alt="heart"
        className={`block dark:hidden ${className}`}
      />
      {/* Dark Mode Logo:
        - Hidden by default ("hidden")
        - Shown when dark mode is active ("dark:block")
      */}
      <img
        src="/assets/icons/trophy.png"
        alt="heart"
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}
