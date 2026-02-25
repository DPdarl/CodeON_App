import React, { useEffect, useState } from "react";
import { useChallengeContext } from "~/contexts/ChallengeContext";
import { Link } from "@remix-run/react";
import { Clock } from "lucide-react";
import { Button } from "~/components/ui/button";

interface MachineProblemHeaderProps {
  activeTab: "learn" | "code" | "output";
  onTabChange: (tab: "learn" | "code" | "output") => void;
}

const MachineProblemHeader = ({
  activeTab,
  onTabChange,
}: MachineProblemHeaderProps) => {
  const { startTime, reviewTime, currentChallenge } = useChallengeContext();
  const [elapsedTime, setElapsedTime] = useState("00:00");

  useEffect(() => {
    // If in review mode, show static time
    if (reviewTime !== null && reviewTime !== undefined) {
      const seconds = Math.floor(reviewTime / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setElapsedTime(
        `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
      return;
    }

    const interval = setInterval(() => {
      if (!startTime) return;
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 1000); // seconds

      const m = Math.floor(diff / 60);
      const s = diff % 60;

      setElapsedTime(
        `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, reviewTime]);

  return (
    <header className="h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-4 z-50 select-none sticky top-0">
      {/* Left: Branding */}
      <div className="flex items-center gap-4">
        <Link
          to="/play/challenges"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <img
            src="/assets/icons/coinv2.png"
            alt="CodeON"
            className="w-8 h-8 block md:hidden"
          />
          <img
            src="/assets/icons/CodeONTextLogo.png"
            alt="CodeON"
            className="hidden md:block dark:hidden h-6 w-auto"
          />
          <img
            src="/assets/icons/CodeONTextLogoDark.png"
            alt="CodeON"
            className="hidden dark:md:block h-6 w-auto"
          />
        </Link>
      </div>

      {/* Center: Mobile Tabs */}
      <div
        id="tour-mobile-tabs"
        className="flex md:hidden items-center bg-muted/50 p-1 rounded-lg border border-border"
      >
        {(["learn", "code", "output"] as const).map((tab) => (
          <button
            key={tab}
            id={`tour-mobile-tab-${tab}`}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
              activeTab === tab
                ? "bg-background shadow-sm text-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Right: Runtime Timer & Tools */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground font-mono bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50">
          <Clock size={16} className="text-primary" />
          <span className="text-sm font-bold text-foreground tracking-wide">
            {elapsedTime}
          </span>
        </div>
      </div>
    </header>
  );
};

export default MachineProblemHeader;
