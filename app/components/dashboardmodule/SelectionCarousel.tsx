// app/components/dashboard/SelectionCarousel.tsx
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
// Import Loader2 for the spinner
import { ChevronLeft, ChevronRight, Play, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Define the shape of an item for the carousel
 */
export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

/**
 * Props for the main SelectionCarousel component
 */
interface SelectionCarouselProps {
  items: CarouselItem[];
  onPlay: (item: CarouselItem) => void;
  loadingItemId: string | null; // Prop to indicate which item is loading
}

/**
 * A reusable component for the carousel card itself.
 */
interface CarouselCardProps {
  item: CarouselItem;
  onPlayClick: () => void;
  isFocused: boolean;
  isLoading: boolean; // Prop to show loading state
}

function CarouselCard({
  item,
  onPlayClick,
  isFocused,
  isLoading,
}: CarouselCardProps) {
  const { Icon, title, description } = item;
  return (
    <Card className="w-64 h-80 flex flex-col justify-between">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-3">
          <Icon className="w-12 h-12" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {/* Update the button to show a loading state */}
        {isFocused && (
          <Button onClick={onPlayClick} disabled={isLoading} className="w-28">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Loading..." : "Play"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Animation variants for the main (center) card
 */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
};

/**
 * Animation variants for the side cards
 */
const sideVariants = {
  initial: {
    scale: 0.9,
    opacity: 0,
    filter: "blur(4px)",
  },
  animate: {
    scale: 0.9,
    opacity: 0.5,
    filter: "blur(4px)",
    transition: { duration: 0.3 },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.2 },
  },
};

/**
 * The main carousel component
 */
export function SelectionCarousel({
  items,
  onPlay,
  loadingItemId,
}: SelectionCarouselProps) {
  const [[activeIndex, direction], setPage] = useState([0, 0]);

  const length = items.length;
  const prevIndex = (activeIndex - 1 + length) % length;
  const nextIndex = (activeIndex + 1) % length;

  // --- Event Handlers ---
  const handlePrev = () => {
    setPage([prevIndex, -1]);
  };

  const handleNext = () => {
    setPage([nextIndex, 1]);
  };

  const handlePlay = () => {
    onPlay(items[activeIndex]);
  };

  // --- (edge case logic for < 3 items) ---
  if (length < 3) {
    const isLoading = items[0].id === loadingItemId;
    return (
      <div className="flex justify-center items-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <CarouselCard
            item={items[0]}
            isFocused={true}
            onPlayClick={handlePlay}
            isLoading={isLoading} // Pass loading state
          />
        </motion.div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="flex items-center justify-center gap-4 w-full">
      {/* 1. Previous Button (with tap animation) */}
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button variant="outline" size="icon" onClick={handlePrev}>
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">Previous</span>
        </Button>
      </motion.div>

      {/* 2. Carousel Cards Container */}
      <div className="flex items-center justify-center w-[60rem] overflow-hidden relative h-[350px]">
        {/* Side Card: Previous */}
        <motion.div
          key={prevIndex}
          variants={sideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute"
          style={{ x: -200 }}
        >
          <CarouselCard
            item={items[prevIndex]}
            isFocused={false}
            onPlayClick={() => {}}
            isLoading={false}
          />
        </motion.div>

        {/* Center Card: Active (with sliding animation) */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute z-10"
          >
            {/* Pass the isLoading prop */}
            <CarouselCard
              item={items[activeIndex]}
              isFocused={true}
              onPlayClick={handlePlay}
              isLoading={items[activeIndex].id === loadingItemId}
            />
          </motion.div>
        </AnimatePresence>

        {/* Side Card: Next */}
        <motion.div
          key={nextIndex}
          variants={sideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute"
          style={{ x: 200 }}
        >
          <CarouselCard
            item={items[nextIndex]}
            isFocused={false}
            onPlayClick={() => {}}
            isLoading={false}
          />
        </motion.div>
      </div>

      {/* 3. Next Button (with tap animation) */}
      <motion.div whileTap={{ scale: 0.9 }}>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">Next</span>
        </Button>
      </motion.div>
    </div>
  );
}
