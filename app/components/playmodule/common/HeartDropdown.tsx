// app/components/playmodule/common/HeartDropdown.tsx
import React from "react";
import { Heart, Clock, Zap } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MAX_HEARTS, HEART_COST } from "~/hooks/useHeartSystem";

interface HeartDropdownProps {
  hearts: number;
  timeRemaining: string;
  buyHearts: () => void;
}

export function HeartDropdown({
  hearts,
  timeRemaining,
  buyHearts,
}: HeartDropdownProps) {
  const isFull = hearts >= MAX_HEARTS;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 hover:bg-transparent px-2"
        >
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <span className="font-bold text-red-500 text-lg">{hearts}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 p-2 bg-[#1E1E1E] border-gray-800 text-gray-200"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Lives</span>
          <Badge
            variant={isFull ? "default" : "outline"}
            className={
              isFull
                ? "bg-green-500 text-white hover:bg-green-600"
                : "text-orange-500 border-orange-500"
            }
          >
            {isFull ? "MAX" : "REGENERATING"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />

        <div className="p-3 bg-gray-800/50 rounded-md mb-2 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current Hearts</span>
            <span className="font-bold text-white">
              {hearts} / {MAX_HEARTS}
            </span>
          </div>
          {!isFull && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Next in
              </span>
              <span className="font-mono font-bold text-orange-500">
                {timeRemaining}
              </span>
            </div>
          )}
        </div>

        <Button
          className="w-full gap-2 font-bold bg-green-600 hover:bg-green-700 text-white border-0"
          size="lg"
          disabled={isFull}
          onClick={() => {
            if (isFull) return;
            buyHearts();
          }}
        >
          <Zap className="w-4 h-4 fill-white" />
          {isFull ? "Hearts are Full" : `Refill Full (${HEART_COST})`}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
