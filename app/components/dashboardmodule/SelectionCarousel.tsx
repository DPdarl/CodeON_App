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
        badge:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      };
    case "javascript":
      return {
        icon: Code2,
        gradient: "from-yellow-300 via-yellow-400 to-yellow-500",
        badge:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      };
    case "react":
      return {
        icon: Cpu,
        gradient: "from-cyan-400 via-blue-500 to-blue-600",
        badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      };
    default:
      return {
        icon: Brain,
        gradient: "from-indigo-400 via-purple-500 to-purple-600",
        badge:
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      };
  }
};

const getDifficultyStyle = (difficulty: "Easy" | "Medium" | "Hard") => {
  switch (difficulty) {
    case "Easy":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Hard":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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
      className="w-full"
    >
      <CarouselContent>
        {challenges.map((challenge, index) => (
          <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <ChallengeCard
                challenge={challenge}
                onSelect={() => onSelectChallenge(challenge)}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-10" />
      <CarouselNext className="mr-10" />
    </Carousel>
  );
}

// --- The New Redesigned Challenge Card ---
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
    badge: langBadge,
    // @ts-ignore
  } = getLanguageStyle(challenge.language || "General");
  const diffBadge = getDifficultyStyle(challenge.difficulty);

  return (
    <Card className="h-[350px] relative flex flex-col overflow-hidden rounded-3xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-gray-100 dark:border-gray-800">
      {/* Background Gradient & Icon */}
      <div
        className={`absolute inset-0 h-40 bg-gradient-to-br ${gradient} opacity-20 dark:opacity-30`}
      />
      <div className="absolute top-6 right-6 p-3 rounded-2xl bg-white/30 dark:bg-black/30 backdrop-blur-sm">
        <Icon className="w-8 h-8 text-gray-900 dark:text-white opacity-80" />
      </div>

      {/* Content */}
      <CardHeader className="relative z-10">
        <div className="flex gap-2 mb-2">
          <Badge className={diffBadge}>{challenge.difficulty}</Badge>
          <Badge className={langBadge}>
            {/* @ts-ignore */}
            {challenge.language || "General"}
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          {challenge.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 flex-1">
        <CardDescription className="text-base text-gray-600 dark:text-gray-400 line-clamp-3">
          {challenge.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="relative z-10 mt-auto p-6 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-1.5 text-lg font-bold text-green-600 dark:text-green-400">
            <Zap className="w-5 h-5 fill-current" />
            <span>{challenge.xp} XP</span>
          </div>
          <Button
            onClick={onSelect}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-indigo-600 dark:hover:bg-indigo-200 font-bold rounded-xl shadow-lg transition-all group"
          >
            Start{" "}
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
