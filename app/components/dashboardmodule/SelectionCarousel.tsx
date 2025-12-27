// app/components/dashboardmodule/SelectionCarousel.tsx
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Challenge } from "~/types/challenge.types";
import { Zap, Brain, Code2, Terminal, Cpu, ArrowRight } from "lucide-react";

// Helper functions to get styles based on challenge data
const getLanguageStyle = (lang: string) => {
  switch (lang.toLowerCase()) {
    case "python":
      return {
        icon: Terminal,
        gradient: "from-yellow-400 via-orange-500 to-orange-600",
        shadow: "shadow-orange-500/20",
      };
    case "javascript":
      return {
        icon: Code2,
        gradient: "from-yellow-300 via-yellow-400 to-yellow-500",
        shadow: "shadow-yellow-500/20",
      };
    case "html/css":
      return {
        icon: Code2,
        gradient: "from-orange-400 via-red-500 to-red-600",
        shadow: "shadow-red-500/20",
      };
    case "react":
      return {
        icon: Cpu,
        gradient: "from-cyan-400 via-blue-500 to-blue-600",
        shadow: "shadow-blue-500/20",
      };
    default:
      return {
        icon: Brain,
        gradient: "from-indigo-400 via-purple-500 to-purple-600",
        shadow: "shadow-purple-500/20",
      };
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900";
    case "Medium":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
    case "Hard":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800";
  }
};

interface SelectionCarouselProps {
  challenges: Challenge[];
  onSelectChallenge: (challenge: Challenge) => void;
}

export function SelectionCarousel({
  challenges,
  onSelectChallenge,
}: SelectionCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full py-4"
    >
      <CarouselContent className="-ml-4">
        {challenges.map((challenge, index) => (
          <CarouselItem
            key={index}
            className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/3"
          >
            <ChallengeCard
              challenge={challenge}
              onSelect={() => onSelectChallenge(challenge)}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 h-12 w-12 border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:bg-white dark:hover:bg-gray-700" />
      <CarouselNext className="-right-4 h-12 w-12 border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg hover:bg-white dark:hover:bg-gray-700" />
    </Carousel>
  );
}

// --- Enhanced Challenge Card ---
function ChallengeCard({
  challenge,
  onSelect,
}: {
  challenge: Challenge;
  onSelect: () => void;
}) {
  const {
    icon: Icon,
    gradient,
    shadow,
  } = getLanguageStyle(challenge.language || "General");

  const difficultyClass = getDifficultyColor(challenge.difficulty);

  return (
    <div className="group relative h-[400px] flex flex-col rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
      {/* --- Top Gradient Banner --- */}
      <div
        className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${gradient} opacity-90 transition-all duration-500`}
      />

      {/* --- Watermark Icon --- */}
      <div className="absolute -right-6 -top-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
        <Icon className="w-44 h-44 text-white opacity-20 mix-blend-overlay" />
      </div>

      {/* --- Content Container --- */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-auto">
          {/* Glassmorphic Language Badge */}
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-sm">
            {challenge.language || "General"}
          </span>

          {/* Difficulty Badge (Floats on white part in design, but here fits nicely on banner too) */}
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/20 backdrop-blur-md text-white border border-white/10 shadow-sm">
            {challenge.difficulty}
          </span>
        </div>

        {/* Main Text Content */}
        <div className="mt-16 space-y-3">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {challenge.title}
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
            {challenge.description}
          </p>
        </div>

        {/* Footer Area */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          {/* XP Reward */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Reward
            </span>
            <div className="flex items-center gap-1.5 text-yellow-500 font-black text-xl drop-shadow-sm">
              <Zap className="w-5 h-5 fill-current" />
              <span>{challenge.xp}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onSelect}
            className={`
              h-12 px-8 rounded-xl font-bold text-white shadow-lg transition-all duration-300
              bg-gradient-to-r ${gradient} ${shadow}
              hover:shadow-xl hover:scale-105 active:scale-95 border-0
            `}
          >
            Start
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
