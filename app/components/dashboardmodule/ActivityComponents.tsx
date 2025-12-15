import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

// --- QUIZ COMPONENT ---
export function QuizActivity({
  data,
  onComplete,
}: {
  data: any;
  onComplete: (success: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = () => {
    setIsChecked(true);
    const isCorrect = selected === data.correctIndex;
    if (isCorrect) {
      setTimeout(() => onComplete(true), 1000);
    } else {
      setTimeout(() => {
        setIsChecked(false);
        setSelected(null);
      }, 1000); // Retry logic
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {data.options.map((opt: string, idx: number) => {
          let style =
            "border-2 border-transparent bg-white dark:bg-gray-800 hover:border-indigo-500";
          if (isChecked && idx === data.correctIndex)
            style = "bg-green-500 text-white border-green-600";
          if (isChecked && selected === idx && idx !== data.correctIndex)
            style = "bg-red-500 text-white border-red-600";
          if (!isChecked && selected === idx)
            style = "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";

          return (
            <div
              key={idx}
              onClick={() => !isChecked && setSelected(idx)}
              className={`p-4 rounded-xl cursor-pointer font-medium transition-all ${style}`}
            >
              {opt}
            </div>
          );
        })}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={selected === null || isChecked}
        className="w-full"
      >
        {isChecked
          ? selected === data.correctIndex
            ? "Correct!"
            : "Try Again"
          : "Check Answer"}
      </Button>
    </div>
  );
}

// --- BUILDING BLOCKS (Drag/Sort Logic Simplified) ---
export function BuildingBlocksActivity({
  data,
  onComplete,
}: {
  data: any;
  onComplete: (success: boolean) => void;
}) {
  // Simplified version: Click in order
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>(data.segments);

  const handleSelect = (segment: string) => {
    setPool(pool.filter((s) => s !== segment));
    setCurrentOrder([...currentOrder, segment]);
  };

  const handleReset = () => {
    setPool(data.segments);
    setCurrentOrder([]);
  };

  const handleCheck = () => {
    const isCorrect =
      JSON.stringify(currentOrder) === JSON.stringify(data.correctOrder);
    if (isCorrect) onComplete(true);
    else {
      alert("Incorrect order! Resetting...");
      handleReset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="min-h-[100px] p-4 bg-gray-100 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-300">
        {currentOrder.length === 0 && (
          <p className="text-gray-400 text-center text-sm">
            Tap blocks below to build code
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {currentOrder.map((s, i) => (
            <span
              key={i}
              className="px-3 py-2 bg-indigo-600 text-white rounded font-mono text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {pool.map((s, i) => (
          <motion.button
            whileTap={{ scale: 0.95 }}
            key={i}
            onClick={() => handleSelect(s)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm font-mono text-sm hover:border-indigo-500"
          >
            {s}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleReset} className="flex-1">
          Reset
        </Button>
        <Button
          onClick={handleCheck}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          Run Code
        </Button>
      </div>
    </div>
  );
}

// --- MATCHING ---
export function MatchingActivity({
  data,
  onComplete,
}: {
  data: any;
  onComplete: (success: boolean) => void;
}) {
  // Placeholder for matching logic
  return (
    <div className="text-center space-y-4">
      <p className="text-gray-500">
        Match the following pairs (Demo: Auto-complete)
      </p>
      <div className="grid grid-cols-2 gap-4">
        {data.pairs.map((p: any, i: number) => (
          <div key={i} className="contents">
            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
              {p.term}
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border">
              {p.definition}
            </div>
          </div>
        ))}
      </div>
      <Button onClick={() => onComplete(true)} className="w-full mt-4">
        Simulate Success
      </Button>
    </div>
  );
}
