import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "~/components/ui/button";
import { Check, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";
import { useGameSound } from "~/hooks/useGameSound";

// Interface for the Ref to trigger hints
export interface ActivityHandle {
  triggerHint: () => Promise<void>;
}

// --- 1. QUIZ COMPONENT ---
export const QuizActivity = forwardRef<
  ActivityHandle,
  {
    data: any;
    onComplete: (success: boolean) => void;
    onConsumeHint: () => Promise<boolean>;
    disabled?: boolean;
  }
>(({ data, onComplete, onConsumeHint, disabled = false }, ref) => {
  const { playSound } = useGameSound();
  const [selected, setSelected] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);

  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [correctShuffledIndex, setCorrectShuffledIndex] = useState<number>(-1);

  useEffect(() => {
    if (data && data.options) {
      const optionsWithOriginalIndex = data.options.map(
        (opt: string, index: number) => ({
          value: opt,
          originalIndex: index,
          isCorrect: opt === data.answer,
        }),
      );

      const shuffled = [...optionsWithOriginalIndex].sort(
        () => Math.random() - 0.5,
      );

      setShuffledOptions(shuffled.map((item) => item.value));
      setCorrectShuffledIndex(shuffled.findIndex((item) => item.isCorrect));

      setSelected(null);
      setIsChecked(false);
      setDisabledOptions([]);
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    triggerHint: async () => {
      const success = await onConsumeHint();
      if (!success) return;

      const wrongIndices = shuffledOptions
        .map((_, idx) => idx)
        .filter(
          (idx) =>
            idx !== correctShuffledIndex && !disabledOptions.includes(idx),
        );

      const shuffledWrong = wrongIndices.sort(() => 0.5 - Math.random());
      const toDisable = shuffledWrong.slice(0, 2);

      setDisabledOptions((prev) => [...prev, ...toDisable]);
    },
  }));

  if (!data || !data.options || !Array.isArray(data.options)) return null;

  const handleSubmit = () => {
    setIsChecked(true);
    const isCorrect = selected === correctShuffledIndex;
    if (isCorrect) playSound("correct");
    else playSound("wrong");
    onComplete(isCorrect);
  };

  const isInteractionDisabled = isChecked || disabled;

  const getOptionStyle = (idx: number): string => {
    const isOptionDisabled = disabledOptions.includes(idx);

    if (isOptionDisabled) {
      return "opacity-40 cursor-not-allowed border-2 border-transparent bg-muted text-muted-foreground scale-95";
    }

    if (isChecked) {
      if (idx === correctShuffledIndex) {
        return "bg-green-500 text-white border-2 border-green-600 shadow-lg";
      }
      if (selected === idx) {
        return "bg-red-500 text-white border-2 border-red-600";
      }
      return "opacity-40 grayscale border-2 border-transparent bg-muted text-muted-foreground";
    }

    if (selected === idx) {
      return "border-2 border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-400/30 shadow-md scale-[1.02]";
    }

    return "border-2 border-border bg-card text-foreground hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-900 dark:hover:text-indigo-200";
  };

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      {data.question && (
        <div className="bg-muted/60 p-6 rounded-2xl border border-border">
          <h3 className="text-xl md:text-2xl font-bold text-center text-foreground leading-snug">
            {data.question}
          </h3>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuffledOptions.map((opt: string, idx: number) => (
          <motion.div
            key={idx}
            whileTap={
              !isInteractionDisabled && !disabledOptions.includes(idx)
                ? { scale: 0.98 }
                : {}
            }
            onClick={() => {
              if (!isInteractionDisabled && !disabledOptions.includes(idx)) {
                playSound("click");
                setSelected(idx);
              }
            }}
            className={cn(
              "p-5 rounded-xl cursor-pointer font-bold text-lg transition-all text-left",
              getOptionStyle(idx),
              isInteractionDisabled && "cursor-default",
            )}
          >
            {opt}
          </motion.div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selected === null || isInteractionDisabled}
        className={cn(
          "w-full h-14 text-xl font-black rounded-xl transition-all shadow-xl text-white",
          isChecked && selected === correctShuffledIndex
            ? "bg-green-500 hover:bg-green-600"
            : isChecked
            ? "bg-red-500 hover:bg-red-600"
            : "bg-indigo-600 hover:bg-indigo-700",
        )}
      >
        {isChecked
          ? selected === correctShuffledIndex
            ? "Correct! 🎉"
            : "Incorrect ❌"
          : "Check Answer"}
      </Button>
    </div>
  );
});
QuizActivity.displayName = "QuizActivity";

// --- 2. BUILDING BLOCKS COMPONENT ---
export const BuildingBlocksActivity = forwardRef<
  ActivityHandle,
  {
    data: any;
    onComplete: (success: boolean) => void;
    onConsumeHint: () => Promise<boolean>;
    disabled?: boolean;
  }
>(({ data, onComplete, onConsumeHint, disabled = false }, ref) => {
  const { playSound } = useGameSound();

  // slots: fixed-length array, null = empty, string = placed block value
  const [slots, setSlots] = useState<(string | null)[]>([]);
  // pool: each item has a unique key to prevent duplicates
  const [pool, setPool] = useState<{ value: string; key: string }[]>([]);
  const [isWrong, setIsWrong] = useState(false);
  // Hint: which slot index + which pool value to highlight
  const [hintSlotIdx, setHintSlotIdx] = useState<number | null>(null);
  const [hintBlock, setHintBlock] = useState<string | null>(null);
  // Click-lock: prevents accidental double-fire from fast taps
  const clickLocked = useRef(false);

  useEffect(() => {
    if (data && data.segments && data.correctOrder) {
      setSlots(Array(data.correctOrder.length).fill(null));
      const scrambled = data.segments
        .map((val: string, i: number) => ({
          value: val,
          key: `${val}-${i}-${Date.now()}`,
        }))
        .sort(() => Math.random() - 0.5);
      setPool(scrambled);
      setIsWrong(false);
      setHintSlotIdx(null);
      setHintBlock(null);
      clickLocked.current = false;
    }
  }, [data]);

  const lockClick = () => {
    clickLocked.current = true;
    setTimeout(() => {
      clickLocked.current = false;
    }, 200);
  };

  useImperativeHandle(ref, () => ({
    triggerHint: async () => {
      const nextSlotIdx = slots.findIndex((s) => s === null);
      if (nextSlotIdx === -1) return;

      const success = await onConsumeHint();
      if (!success) return;

      const correctValue = data.segments[data.correctOrder[nextSlotIdx]];

      setHintSlotIdx(nextSlotIdx);
      setHintBlock(correctValue);

      // Clear hint after 3 seconds
      setTimeout(() => {
        setHintSlotIdx(null);
        setHintBlock(null);
      }, 3000);
    },
  }));

  if (!data || !data.segments) return null;

  const handlePoolClick = (item: { value: string; key: string }) => {
    if (disabled || clickLocked.current) return;
    const nextEmpty = slots.findIndex((s) => s === null);
    if (nextEmpty === -1) return;
    lockClick();
    playSound("click");
    if (hintBlock === item.value) {
      setHintSlotIdx(null);
      setHintBlock(null);
    }
    setSlots((prev) => {
      const next = [...prev];
      next[nextEmpty] = item.value;
      return next;
    });
    setPool((prev) => prev.filter((p) => p.key !== item.key));
    setIsWrong(false);
  };

  const handleSlotClick = (slotIdx: number) => {
    if (disabled || slots[slotIdx] === null || clickLocked.current) return;
    lockClick();
    playSound("click");
    const value = slots[slotIdx]!;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setPool((prev) => [...prev, { value, key: `${value}-ret-${Date.now()}` }]);
    setIsWrong(false);
  };

  const handleReset = () => {
    if (disabled || clickLocked.current) return;
    lockClick();
    playSound("click");
    const filled = slots.filter((s) => s !== null) as string[];
    setSlots(Array(slots.length).fill(null));
    setPool((prev) => [
      ...prev,
      ...filled.map((v, i) => ({
        value: v,
        key: `${v}-rst-${Date.now()}-${i}`,
      })),
    ]);
    setIsWrong(false);
    setHintSlotIdx(null);
    setHintBlock(null);
  };

  const handleCheck = () => {
    const expected = data.correctOrder.map((i: number) => data.segments[i]);
    const isCorrect = JSON.stringify(slots) === JSON.stringify(expected);
    if (isCorrect) {
      playSound("correct");
      onComplete(true);
    } else {
      playSound("wrong");
      setIsWrong(true);
      const btn = document.getElementById("run-code-btn");
      if (btn) {
        btn.classList.add("animate-shake");
        setTimeout(() => btn.classList.remove("animate-shake"), 500);
      }
      onComplete(false);
    }
  };

  const allFilled = slots.every((s) => s !== null);

  return (
    <div className="space-y-5 w-full max-w-2xl mx-auto">
      {/* ── IDE-style code editor panel ── */}
      <div
        className={cn(
          "rounded-2xl border overflow-hidden shadow-xl transition-colors",
          isWrong ? "border-red-500/60" : "border-zinc-700",
        )}
      >
        {/* File tab header */}
        <div className="flex items-center gap-2 bg-zinc-800 px-4 py-2 border-b border-zinc-700">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
          </div>
          <span className="text-xs text-zinc-400 font-mono ml-2">
            Program.cs
          </span>
        </div>

        {/* Code area with slots */}
        <div
          className={cn(
            "bg-zinc-950 min-h-[100px] p-5 flex flex-col gap-2 font-mono text-sm sm:text-base transition-colors",
            isWrong && "bg-red-950/10",
          )}
        >
          {slots.length === 0 && !data.template && (
            <span className="text-zinc-500 italic text-sm select-none">
              Tap blocks below…
            </span>
          )}

          <AnimatePresence mode="popLayout">
            {data.template ? (
              // Structured Template Rendering
              data.template.split("\n").map((line: string, lineIdx: number) => {
                const parts = line.split(/(\[\d+\])/g);
                return (
                  <div
                    key={lineIdx}
                    className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full min-h-[36px]"
                  >
                    {parts.map((part, partIdx) => {
                      if (part.startsWith("[") && part.endsWith("]")) {
                        const idx = parseInt(part.slice(1, -1), 10);
                        const val = slots[idx];
                        const isEmpty = val === null;
                        const isHintedSlot = hintSlotIdx === idx;

                        return (
                          <motion.button
                            key={`slot-${idx}`}
                            layout
                            animate={
                              isHintedSlot && isEmpty
                                ? {
                                    scale: [1, 1.08, 1, 1.08, 1],
                                    borderColor: [
                                      "rgba(251,191,36,0.4)",
                                      "rgba(251,191,36,1)",
                                      "rgba(251,191,36,0.4)",
                                    ],
                                  }
                                : { scale: 1 }
                            }
                            transition={
                              isHintedSlot
                                ? {
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                  }
                                : {
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  }
                            }
                            whileTap={
                              !isEmpty && !disabled ? { scale: 0.9, y: 2 } : {}
                            }
                            onClick={() => handleSlotClick(idx)}
                            disabled={isEmpty || disabled}
                            title={isEmpty ? undefined : "Tap to remove"}
                            className={cn(
                              "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-mono text-sm sm:text-base font-semibold transition-all select-none",
                              "border-2",
                              isEmpty
                                ? cn(
                                    "border-dashed min-w-[40px] sm:min-w-[52px] text-transparent cursor-default",
                                    isHintedSlot
                                      ? "border-amber-400 bg-amber-400/10"
                                      : "border-zinc-600 bg-zinc-800/50",
                                  )
                                : "bg-indigo-500 text-white border-indigo-700 border-b-4 hover:bg-red-500 hover:border-red-700 shadow-md cursor-pointer active:border-b-0 active:translate-y-[2px]",
                            )}
                          >
                            {isEmpty ? "\u00a0\u00a0\u00a0" : val}
                          </motion.button>
                        );
                      }

                      if (part) {
                        // Preserve whitespace for indentation
                        return (
                          <span
                            key={partIdx}
                            className="text-zinc-300 whitespace-pre"
                          >
                            {part}
                          </span>
                        );
                      }

                      return null;
                    })}
                  </div>
                );
              })
            ) : (
              // Fallback Inline Rendering
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {slots.map((val, idx) => {
                  const isEmpty = val === null;
                  const isHintedSlot = hintSlotIdx === idx;

                  return (
                    <motion.button
                      key={`slot-${idx}`}
                      layout
                      animate={
                        isHintedSlot && isEmpty
                          ? {
                              scale: [1, 1.08, 1, 1.08, 1],
                              borderColor: [
                                "rgba(251,191,36,0.4)",
                                "rgba(251,191,36,1)",
                                "rgba(251,191,36,0.4)",
                              ],
                            }
                          : { scale: 1 }
                      }
                      transition={
                        isHintedSlot
                          ? {
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "loop",
                            }
                          : { type: "spring", stiffness: 500, damping: 30 }
                      }
                      whileTap={
                        !isEmpty && !disabled ? { scale: 0.9, y: 2 } : {}
                      }
                      onClick={() => handleSlotClick(idx)}
                      disabled={isEmpty || disabled}
                      title={isEmpty ? undefined : "Tap to remove"}
                      className={cn(
                        "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-mono text-sm sm:text-base font-semibold transition-all select-none",
                        "border-2",
                        isEmpty
                          ? cn(
                              "border-dashed min-w-[40px] sm:min-w-[52px] text-transparent cursor-default",
                              isHintedSlot
                                ? "border-amber-400 bg-amber-400/10"
                                : "border-zinc-600 bg-zinc-800/50",
                            )
                          : "bg-indigo-500 text-white border-indigo-700 border-b-4 hover:bg-red-500 hover:border-red-700 shadow-md cursor-pointer active:border-b-0 active:translate-y-[2px]",
                      )}
                    >
                      {isEmpty ? "\u00a0\u00a0\u00a0" : val}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Block Pool ── */}
      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center min-h-[52px]">
        <AnimatePresence mode="popLayout">
          {pool.map((item) => {
            const isHinted = item.value === hintBlock;
            return (
              <motion.button
                layout
                key={item.key}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={
                  isHinted
                    ? {
                        scale: [1, 1.1, 1, 1.1, 1],
                        opacity: 1,
                        boxShadow: [
                          "0 3px 0 rgba(234,179,8,0.2)",
                          "0 3px 0 rgba(234,179,8,0.9)",
                          "0 3px 0 rgba(234,179,8,0.4)",
                        ],
                      }
                    : {
                        scale: 1,
                        opacity: 1,
                        boxShadow: "0 3px 0 rgba(0,0,0,0.3)",
                      }
                }
                transition={
                  isHinted
                    ? { duration: 1.2, repeat: Infinity, repeatType: "loop" }
                    : { type: "spring", stiffness: 400, damping: 28 }
                }
                exit={{ scale: 0.5, opacity: 0 }}
                whileTap={!disabled ? { scale: 0.88, y: 3 } : {}}
                onClick={() => handlePoolClick(item)}
                disabled={disabled}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-mono text-sm sm:text-base font-semibold select-none",
                  "border-b-4 active:border-b-0 active:translate-y-[3px] transition-colors",
                  isHinted
                    ? "bg-amber-300 text-amber-900 border-amber-600 ring-2 ring-amber-400/60"
                    : "bg-zinc-800 dark:bg-zinc-700 text-zinc-100 border-zinc-900",
                  "hover:border-indigo-500 hover:bg-indigo-600 hover:text-white",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {item.value}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={disabled || slots.every((s) => s === null)}
          className="h-12 sm:h-14 w-12 sm:w-14 rounded-xl border-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-300 disabled:opacity-40"
        >
          <RefreshCcw className="w-5 h-5" />
        </Button>
        <Button
          id="run-code-btn"
          onClick={handleCheck}
          className={cn(
            "flex-1 h-12 sm:h-14 text-base sm:text-xl font-black rounded-xl shadow-xl transition-all text-white",
            "border-b-4 active:border-b-0 active:translate-y-[3px]",
            isWrong
              ? "bg-red-500 hover:bg-red-600 border-red-800"
              : "bg-green-600 hover:bg-green-700 border-green-800",
          )}
          disabled={!allFilled || disabled}
        >
          {isWrong ? "Incorrect — Try Again ✗" : "Run Code ▶"}
        </Button>
      </div>
    </div>
  );
});
BuildingBlocksActivity.displayName = "BuildingBlocksActivity";

// --- 3. MATCHING COMPONENT ---
export const MatchingActivity = forwardRef<
  ActivityHandle,
  {
    data: any;
    onComplete: (success: boolean) => void;
    onConsumeHint: () => Promise<boolean>;
    disabled?: boolean;
  }
>(({ data, onComplete, onConsumeHint, disabled = false }, ref) => {
  const { playSound } = useGameSound();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);

  const [shuffledLeft, setShuffledLeft] = useState<any[]>([]);
  const [shuffledRight, setShuffledRight] = useState<any[]>([]);

  useEffect(() => {
    setSelectedLeft(null);
    setMatched([]);
    if (data && data.pairs) {
      const lefts = data.pairs.map((p: any) => ({
        val: p.left,
        pairId: p.left,
      }));
      setShuffledLeft(lefts.sort(() => Math.random() - 0.5));

      const rights = data.pairs.map((p: any) => ({
        val: p.right,
        originalLeft: p.left,
      }));
      setShuffledRight(rights.sort(() => Math.random() - 0.5));
    }
  }, [data]);

  useImperativeHandle(ref, () => ({
    triggerHint: async () => {
      const success = await onConsumeHint();
      if (!success) return;

      const firstUnmatched = data.pairs.find(
        (p: any) => !matched.includes(p.left),
      );
      if (!firstUnmatched) return;

      const newMatched = [...matched, firstUnmatched.left];
      setMatched(newMatched);
      playSound("correct");

      if (newMatched.length === data.pairs.length) {
        setTimeout(() => onComplete(true), 500);
      }
    },
  }));

  if (!data || !data.pairs) return null;

  const handleLeftClick = (leftVal: string) => {
    if (disabled || matched.includes(leftVal)) return;
    playSound("click");
    setSelectedLeft(leftVal);
  };

  const handleRightClick = (rightObj: any) => {
    if (disabled || !selectedLeft) return;

    if (selectedLeft === rightObj.originalLeft) {
      const newMatched = [...matched, selectedLeft];
      setMatched(newMatched);
      setSelectedLeft(null);
      playSound("correct");

      if (newMatched.length === data.pairs.length) {
        setTimeout(() => onComplete(true), 500);
      }
    } else {
      playSound("wrong");
      const grid = document.getElementById("matching-grid");
      if (grid) {
        grid.classList.add("animate-shake");
        setTimeout(() => grid.classList.remove("animate-shake"), 500);
      }
      setSelectedLeft(null);
      onComplete(false);
    }
  };

  // Base button — tall on desktop, compact on mobile
  const baseBtn =
    "min-h-[64px] sm:min-h-[80px] h-auto py-3 sm:py-4 px-3 sm:px-4 rounded-2xl border-b-4 flex items-center justify-center text-sm sm:text-base font-bold transition-all shadow-md text-center leading-snug";

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      <div
        id="matching-grid"
        className="w-full grid grid-cols-2 gap-4 sm:gap-6"
      >
        {/* Left Column — Indigo theme */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {shuffledLeft.map((item: any, idx: number) => {
            const isMatched = matched.includes(item.val);
            const isSelected = selectedLeft === item.val;

            return (
              <motion.button
                layout
                key={`left-${idx}`}
                whileTap={!disabled && !isMatched ? { scale: 0.97 } : {}}
                onClick={() => handleLeftClick(item.val)}
                disabled={isMatched || disabled}
                className={cn(
                  baseBtn,
                  isMatched
                    ? // Matched: vivid emerald both themes
                      "bg-emerald-500 dark:bg-emerald-600 border-emerald-700 text-white opacity-80 cursor-default"
                    : isSelected
                    ? // Active selection — strong indigo
                      "bg-indigo-500 dark:bg-indigo-600 border-indigo-700 text-white scale-[1.04] shadow-lg ring-2 ring-indigo-400/50"
                    : // Default — indigo-tinted chip
                      "bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-[1.02]",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {isMatched && (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-white flex-shrink-0" />
                )}
                {item.val}
              </motion.button>
            );
          })}
        </div>

        {/* Right Column — Violet theme */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {shuffledRight.map((item: any, idx: number) => {
            const isMatched = matched.includes(item.originalLeft);

            return (
              <motion.button
                layout
                key={`right-${idx}`}
                whileTap={!disabled && !isMatched ? { scale: 0.97 } : {}}
                onClick={() => handleRightClick(item)}
                disabled={isMatched || disabled}
                className={cn(
                  baseBtn,
                  isMatched
                    ? "bg-emerald-500 dark:bg-emerald-600 border-emerald-700 text-white opacity-80 cursor-default"
                    : "bg-violet-100 dark:bg-violet-900/50 border-violet-300 dark:border-violet-700 text-violet-900 dark:text-violet-100 hover:bg-violet-200 dark:hover:bg-violet-800/60 hover:border-violet-400 dark:hover:border-violet-500 hover:scale-[1.02]",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                {isMatched && (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-white flex-shrink-0" />
                )}
                {item.val}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
MatchingActivity.displayName = "MatchingActivity";
