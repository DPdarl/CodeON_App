// app/components/ui/CodeOnLogo.tsx
import React from "react";

interface LogoProps {
  className?: string;
}

/**
 * Renders the CodeON logo, automatically switching between
 * light and dark mode PNG versions based on the active theme.
 * It reads from the /public folder.
 */
export default function CodeOnLogo({ className = "h-8 w-8" }: LogoProps) {
  return (
    <>
      {/* Light Mode Logo:
        - Shown by default ("block")
        - Hidden when dark mode is active ("dark:hidden")
      */}
      <img
        src="/assets/icons/coinv2.png"
        alt="CodeON Logo"
        className={`block dark:hidden ${className}`}
      />
      {/* Dark Mode Logo:
        - Hidden by default ("hidden")
        - Shown when dark mode is active ("dark:block")
      */}
      <img
        src="/assets/icons/coinv2.png"
        alt="CodeON Logo"
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}
