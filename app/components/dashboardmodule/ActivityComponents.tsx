import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Check, RefreshCcw, AlertCircle, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

// --- SHARED HINT BUTTON COMPONENT ---
function HintButton({
  count,
  onClick,
  disabled,
}: {
  count: number;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-center pb-4">
      <Button
        variant="outline"
        size="sm"
        disabled={count <= 0 || disabled}
        onClick={onClick}
        className="gap-2 border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
      >
        <Lightbulb
          className={cn(
            "w-4 h-4",
            count > 0 ? "fill-yellow-500 text-yellow-500" : ""
          )}
        />
        <span>Use Hint</span>
        <Badge
          variant="secondary"
          className="ml-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
        >
          {count}
        </Badge>
      </Button>
    </div>
  );
}

// --- 1. QUIZ COMPONENT ---
export function QuizActivity({
  data,
  onComplete,
  hintCount, // NEW PROP
  onConsumeHint, // NEW PROP
}: {
  data: any;
  onComplete: (success: boolean) => void;
  hintCount: number;
  onConsumeHint: () => Promise<boolean>;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]); // Track removed options

  useEffect(() => {
    setSelected(null);
    setIsChecked(false);
    setDisabledOptions([]);
  }, [data]);

  if (!data || !data.options || !Array.isArray(data.options)) return null;

  const correctIndex = data.options.findIndex(
    (opt: string) => opt === data.answer
  );

  const handleSubmit = () => {
    setIsChecked(true);
    const isCorrect = selected === correctIndex;
    onComplete(isCorrect);
  };

  // --- HINT LOGIC: REMOVE 2 WRONG ANSWERS ---
  const handleUseHint = async () => {
    const success = await onConsumeHint();
    if (!success) return;

    // Find all wrong indices that aren't already disabled
    const wrongIndices = data.options
      .map((_: any, idx: number) => idx)
      .filter(
        (idx: number) => idx !== correctIndex && !disabledOptions.includes(idx)
      );

    // Shuffle and pick up to 2 to disable
    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    const toDisable = shuffled.slice(0, 2);

    setDisabledOptions((prev) => [...prev, ...toDisable]);
  };

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      {/* Hint Button */}
      <HintButton
        count={hintCount}
        onClick={handleUseHint}
        disabled={
          isChecked || disabledOptions.length >= data.options.length - 1
        }
      />

      {data.question && (
        <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
          <h3 className="text-xl md:text-2xl font-bold text-center text-foreground leading-snug">
            {data.question}
          </h3>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.options.map((opt: string, idx: number) => {
          const isDisabled = disabledOptions.includes(idx);
          let style =
            "border-2 border-transparent bg-secondary/50 hover:border-indigo-500";

          if (isDisabled) {
            style =
              "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-transparent scale-95";
          } else if (isChecked) {
            if (idx === correctIndex)
              style = "bg-green-500 text-white border-green-600 shadow-lg";
            else if (selected === idx)
              style = "bg-red-500 text-white border-red-600";
            else style = "opacity-50 grayscale";
          } else if (selected === idx) {
            style =
              "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/20 shadow-md transform scale-[1.02]";
          }

          return (
            <motion.div
              key={idx}
              whileTap={!isChecked && !isDisabled ? { scale: 0.98 } : {}}
              onClick={() => !isChecked && !isDisabled && setSelected(idx)}
              className={`p-5 rounded-xl cursor-pointer font-bold text-lg transition-all text-left ${style}`}
            >
              {opt}
            </motion.div>
          );
        })}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={selected === null || isChecked}
        className={cn(
          "w-full h-14 text-xl font-black rounded-xl transition-all shadow-xl",
          isChecked && selected === correctIndex
            ? "bg-green-500 hover:bg-green-600 text-white"
            : isChecked
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        )}
      >
        {isChecked
          ? selected === correctIndex
            ? "Correct! 🎉"
            : "Incorrect ❌"
          : "Check Answer"}
      </Button>
    </div>
  );
}

// --- 2. BUILDING BLOCKS COMPONENT ---
export function BuildingBlocksActivity({
  data,
  onComplete,
  hintCount, // NEW PROP
  onConsumeHint, // NEW PROP
}: {
  data: any;
  onComplete: (success: boolean) => void;
  hintCount: number;
  onConsumeHint: () => Promise<boolean>;
}) {
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);
  const [isWrong, setIsWrong] = useState(false);

  useEffect(() => {
    if (data && data.segments) {
      const scrambled = [...data.segments];
      scrambled.sort(() => Math.random() - 0.5);
      setPool(scrambled);
      setCurrentOrder([]);
      setIsWrong(false);
    }
  }, [data]);

  if (!data || !data.segments) return null;

  // --- HINT LOGIC: AUTO-PLACE NEXT BLOCK ---
  const handleUseHint = async () => {
    // 1. Identify the next correct block needed
    const nextIndexNeeded = currentOrder.length;

    // If completed, do nothing
    if (nextIndexNeeded >= data.correctOrder.length) return;

    // The index in the ORIGINAL segments array that corresponds to the correct answer for this position
    const correctOriginalIndex = data.correctOrder[nextIndexNeeded];
    const correctValue = data.segments[correctOriginalIndex];

    // 2. Check if it's available in the pool
    const isInPool = pool.includes(correctValue);

    if (!isInPool) {
      // Edge Case: If the user already placed the correct block but in the wrong earlier spot (rare if logic holds),
      // or if logic dictates resetting. For simplicity, if the pool doesn't have it, reset.
      handleReset();
      return; // User has to click hint again after reset
    }

    // 3. Consume Hint
    const success = await onConsumeHint();
    if (!success) return;

    // 4. Move block from Pool to Order
    setPool((prev) => {
      // Remove only the first instance of the correct value found
      const idx = prev.indexOf(correctValue);
      if (idx > -1) {
        const newPool = [...prev];
        newPool.splice(idx, 1);
        return newPool;
      }
      return prev;
    });

    setCurrentOrder((prev) => [...prev, correctValue]);
    setIsWrong(false);
  };

  const handleSelect = (segment: string) => {
    // Only allow manual select if no error state (optional UX choice)
    const index = pool.indexOf(segment);
    if (index > -1) {
      const newPool = [...pool];
      newPool.splice(index, 1);
      setPool(newPool);
      setCurrentOrder([...currentOrder, segment]);
      setIsWrong(false);
    }
  };

  const handleReset = () => {
    // Return everything to pool
    setPool([...pool, ...currentOrder]); // Simplified reset (might lose shuffle, but functional)
    setCurrentOrder([]);
    setIsWrong(false);
  };

  const handleCheck = () => {
    const expectedStringArray = data.correctOrder.map(
      (index: number) => data.segments[index]
    );
    const isCorrect =
      JSON.stringify(currentOrder) === JSON.stringify(expectedStringArray);

    if (isCorrect) {
      onComplete(true);
    } else {
      setIsWrong(true);
      const btn = document.getElementById("run-code-btn");
      if (btn) btn.classList.add("animate-shake");
      setTimeout(() => {
        if (btn) btn.classList.remove("animate-shake");
      }, 500);
      onComplete(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      {/* Hint Button */}
      <HintButton
        count={hintCount}
        onClick={handleUseHint}
        disabled={currentOrder.length === data.correctOrder.length} // Disable if full
      />

      {/* Code Area */}
      <div
        className={cn(
          "min-h-[140px] p-6 bg-zinc-950 rounded-2xl border-4 border-dashed flex flex-wrap gap-3 content-start transition-all shadow-inner",
          isWrong ? "border-red-500/50 bg-red-950/10" : "border-zinc-800"
        )}
      >
        {currentOrder.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-lg font-medium italic">
            Tap blocks below to build the code...
          </div>
        )}
        <AnimatePresence>
          {currentOrder.map((s, i) => (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={`${s}-${i}`}
              className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-mono text-lg font-bold shadow-lg border-b-4 border-indigo-800"
            >
              {s}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Block Pool */}
      <div className="flex flex-wrap gap-4 justify-center min-h-[80px]">
        <AnimatePresence>
          {pool.map((s, i) => (
            <motion.button
              key={`${s}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(s)}
              className="px-4 py-3 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm font-mono text-lg font-semibold hover:border-indigo-500 hover:text-indigo-500 hover:shadow-md transition-all border-b-4 active:border-b-2 active:translate-y-0.5"
            >
              {s}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-14 w-14 rounded-xl border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <RefreshCcw className="w-6 h-6" />
        </Button>
        <Button
          id="run-code-btn"
          onClick={handleCheck}
          className={cn(
            "flex-1 h-14 text-xl font-black rounded-xl shadow-xl transition-all",
            isWrong
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          )}
          disabled={currentOrder.length === 0}
        >
          {isWrong ? "Incorrect Code" : "Run Code ▶"}
        </Button>
      </div>
    </div>
  );
}

// --- 3. MATCHING COMPONENT ---
export function MatchingActivity({
  data,
  onComplete,
  hintCount, // NEW PROP
  onConsumeHint, // NEW PROP
}: {
  data: any;
  onComplete: (success: boolean) => void;
  hintCount: number;
  onConsumeHint: () => Promise<boolean>;
}) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [shuffledRight, setShuffledRight] = useState<any[]>([]);

  useEffect(() => {
    setSelectedLeft(null);
    setMatched([]);
    if (data && data.pairs) {
      const rights = [...data.pairs].map((p: any) => ({
        val: p.right,
        originalLeft: p.left,
      }));
      setShuffledRight(rights.sort(() => Math.random() - 0.5));
    }
  }, [data]);

  // --- HINT LOGIC: AUTO MATCH ONE PAIR ---
  const handleUseHint = async () => {
    const success = await onConsumeHint();
    if (!success) return;

    // Find the first unmatched pair
    const firstUnmatched = data.pairs.find(
      (p: any) => !matched.includes(p.left)
    );
    if (!firstUnmatched) return;

    const newMatched = [...matched, firstUnmatched.left];
    setMatched(newMatched);

    // Check win condition immediately
    if (newMatched.length === data.pairs.length) {
      setTimeout(() => onComplete(true), 500);
    }
  };

  if (!data || !data.pairs) return null;

  const handleLeftClick = (leftVal: string) => {
    if (matched.includes(leftVal)) return;
    setSelectedLeft(leftVal);
  };

  const handleRightClick = (rightObj: any) => {
    if (!selectedLeft) return;

    if (selectedLeft === rightObj.originalLeft) {
      const newMatched = [...matched, selectedLeft];
      setMatched(newMatched);
      setSelectedLeft(null);

      if (newMatched.length === data.pairs.length) {
        setTimeout(() => onComplete(true), 500);
      }
    } else {
      const grid = document.getElementById("matching-grid");
      if (grid) {
        grid.classList.add("animate-shake");
        setTimeout(() => grid.classList.remove("animate-shake"), 500);
      }
      setSelectedLeft(null);
      onComplete(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      <HintButton
        count={hintCount}
        onClick={handleUseHint}
        disabled={matched.length === data.pairs.length}
      />

      <div id="matching-grid" className="w-full grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          {data.pairs.map((pair: any, idx: number) => {
            const isMatched = matched.includes(pair.left);
            const isSelected = selectedLeft === pair.left;

            return (
              <motion.button
                key={`left-${idx}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLeftClick(pair.left)}
                disabled={isMatched}
                className={cn(
                  "h-24 p-4 rounded-2xl border-b-4 flex items-center justify-center text-base font-bold transition-all shadow-sm",
                  isMatched
                    ? "bg-green-100 border-green-400 text-green-800 opacity-60 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                    : isSelected
                    ? "bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900/40 dark:border-indigo-500 dark:text-indigo-300 transform scale-105 shadow-md"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                )}
              >
                {isMatched && <Check className="w-5 h-5 mr-2 text-green-600" />}
                {pair.left}
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          {shuffledRight.map((item: any, idx: number) => {
            const isMatched = matched.includes(item.originalLeft);

            return (
              <motion.button
                key={`right-${idx}`}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                onClick={() => handleRightClick(item)}
                disabled={isMatched}
                className={cn(
                  "h-24 p-4 rounded-2xl border-b-4 flex items-center justify-center text-base font-bold transition-all shadow-sm",
                  isMatched
                    ? "bg-green-100 border-green-400 text-green-800 opacity-60 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                )}
              >
                {item.val}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
