import { useState, useEffect } from "react";
import { supabase } from "~/utils/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Play, Save, Trash2, X, Plus, ChevronUp, ChevronDown } from "lucide-react";
import type { Activity, ActivityType } from "~/types/lesson.types";
import {
  QuizActivity,
  BuildingBlocksActivity,
  MatchingActivity,
} from "~/components/dashboardmodule/ActivityComponents";

interface CoreLesson {
  id: string;
  title: string;
  order_index: number;
}

interface SideQuest {
  id: string;
  title: string;
  description: string;
  content_markdown: string;
  xp_reward: number;
  parent_lesson_id: string;
  classroom_id: string;
  is_core_node: boolean;
  is_published: boolean;
  order_index?: number;
}

interface FullSideQuestMakerProps {
  classroomId: string;
  coreLessons: CoreLesson[];
  selectedQuest: SideQuest | null;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function FullSideQuestMaker({
  classroomId,
  coreLessons,
  selectedQuest,
  onSave,
  onCancel,
  onDelete,
}: FullSideQuestMakerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [questActivities, setQuestActivities] = useState<Activity[]>([]);
  const [previewActivityIdx, setPreviewActivityIdx] = useState<number | null>(null);

  const [questForm, setQuestForm] = useState({
    title: "",
    description: "",
    content_markdown: "",
    xp_reward: 30,
    parent_lesson_id: coreLessons.length > 0 ? coreLessons[0].id : "",
    is_published: true,
    allow_retake: "once" as "once" | "always",
  });

  // Load selected quest into form
  useEffect(() => {
    if (selectedQuest) {
      setQuestForm({
        title: selectedQuest.title || "",
        description: selectedQuest.description || "",
        content_markdown: selectedQuest.content_markdown || "",
        xp_reward: selectedQuest.xp_reward || 30,
        parent_lesson_id: selectedQuest.parent_lesson_id || (coreLessons.length > 0 ? coreLessons[0].id : ""),
        is_published: selectedQuest.is_published ?? true,
        allow_retake: (selectedQuest as any).allow_retake || "once",
      });
      fetchActivities(selectedQuest.id);
    } else {
      setQuestForm({
        title: "",
        description: "",
        content_markdown: "",
        xp_reward: 30,
        parent_lesson_id: coreLessons.length > 0 ? coreLessons[0].id : "",
        is_published: true,
        allow_retake: "once",
      });
      setQuestActivities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuest]); // ⚠️ coreLessons deliberately omitted — including it causes fetchActivities to re-run on every parent re-render

  const fetchActivities = async (questId: string) => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("lesson_id", questId);

      if (!error && data) {
        const mappedActivities: Activity[] = data.map((act) => ({
          id: act.id,
          type: act.type as ActivityType,
          title: act.prompt || "",
          data: act.data || {},
        }));
        setQuestActivities(mappedActivities);
      }
    } catch (err) {
      console.error("Failed to load activities", err);
    }
  };

  const handleSaveQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questForm.title.trim() || !questForm.parent_lesson_id || !classroomId) {
      toast.error("Title, Core Lesson connection, and Classroom are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: questForm.title.trim(),
        slug: `${questForm.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${
          typeof window !== "undefined" && window.crypto
            ? window.crypto.randomUUID().slice(0, 8)
            : Math.random().toString(36).substring(2, 10)
        }`,
        description: questForm.description.trim(),
        content_markdown: questForm.content_markdown.trim(),
        xp_reward: questForm.xp_reward,
        parent_lesson_id: questForm.parent_lesson_id,
        is_core_node: false,
        is_published: questForm.is_published,
        allow_retake: questForm.allow_retake,
        classroom_id: classroomId,
        order_index: selectedQuest?.order_index || 999,
      };

      let savedLessonId = "";

      if (selectedQuest) {
        // UPDATE
        const { slug, ...updatePayload } = payload;
        const { error } = await supabase
          .from("lessons")
          .update(updatePayload)
          .eq("id", selectedQuest.id);
        if (error) throw error;
        savedLessonId = selectedQuest.id;
        toast.success("Special quest updated!");
      } else {
        // INSERT
        const { data, error } = await supabase
          .from("lessons")
          .insert([payload])
          .select("id")
          .single();
        if (error) throw error;
        savedLessonId = data.id;
        toast.success("Special quest created!");
      }

      // --- HANDLE ACTIVITIES ---
      if (savedLessonId) {
        // 1. Delete existing activities
        await supabase.from("activities").delete().eq("lesson_id", savedLessonId);

        // 2. Insert new activities
        if (questActivities.length > 0) {
          const insertPayload = questActivities.map((act) => ({
            lesson_id: savedLessonId,
            type: act.type,
            prompt: act.title || `${act.type} Activity`,
            data: act.data,
          }));

          const { error: actError } = await supabase.from("activities").insert(insertPayload);
          if (actError) throw new Error("Activities failed to save: " + actError.message);
        }
      }

      onSave(); // Refresh parent
    } catch (err: any) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuest = async () => {
    if (!selectedQuest) return;
    if (!confirm(`Are you sure you want to delete "${selectedQuest.title}"?`)) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", selectedQuest.id);
      if (error) throw error;
      toast.success("Special quest deleted.");
      if (onDelete) onDelete();
      onSave(); // trigger refresh
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- ACTIVITY BUILDER HELPERS ---
  const handleAddActivity = (type: ActivityType) => {
    const newActivity: Activity = {
      id: typeof window !== "undefined" && window.crypto ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      type,
      title: `New ${type} Activity`,
      data: {},
    };

    if (type === "QUIZ") {
      newActivity.data = { question: "", options: ["", "", "", ""], answer: "" };
    } else if (type === "MATCHING") {
      newActivity.data = { pairs: [{ left: "", right: "" }] };
    } else if (type === "BUILDING_BLOCKS") {
      newActivity.data = { question: "", template: "", segments: [], correctOrder: [] };
    }

    setQuestActivities([...questActivities, newActivity]);
  };

  const handleUpdateActivityData = (index: number, newData: any) => {
    setQuestActivities((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], data: newData };
      return next;
    });
  };

  return (
    <Card className="h-full max-h-[calc(100vh-120px)] border-indigo-100 dark:border-indigo-900 shadow-md flex flex-col bg-white/80 dark:bg-[#1E1E1E]/90 backdrop-blur-md">
      <CardHeader className="py-4 px-5 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between shrink-0">
        <div>
          <CardTitle className="text-lg font-bold text-indigo-700 dark:text-indigo-400">
            {selectedQuest ? "Edit Special Quest" : "Create Special Quest"}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Details will auto-update in the middle timeline.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-full">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-5">
            <form id="quest-form" onSubmit={handleSaveQuest} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Quest Title *</Label>
                <Input
                    required
                    placeholder="e.g. Adv. For Loops"
                    value={questForm.title}
                    onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })}
                    className="h-9"
                />
                </div>
                <div className="space-y-1.5">
                <Label className="text-xs font-semibold">XP Reward</Label>
                <Input
                    type="number"
                    min={0}
                    value={questForm.xp_reward}
                    onChange={(e) => setQuestForm({ ...questForm, xp_reward: parseInt(e.target.value, 10) || 0 })}
                    className="h-9"
                />
                </div>
            </div>

            <div className="flex items-center gap-3 py-2">
                <input
                    type="checkbox"
                    id="published-toggle"
                    checked={questForm.is_published}
                    onChange={(e) => setQuestForm({ ...questForm, is_published: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <Label htmlFor="published-toggle" className="text-sm cursor-pointer select-none">
                    Visible to Students
                </Label>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Retake Policy</Label>
                <div className="flex gap-2">
                  {(["once", "always"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setQuestForm({ ...questForm, allow_retake: v })}
                      className={`flex-1 py-1.5 text-xs rounded-md border font-semibold transition-colors ${
                        questForm.allow_retake === v
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-background text-muted-foreground border-input hover:border-indigo-400"
                      }`}
                    >
                      {v === "once" ? "Once Only" : "Allow Retake"}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {questForm.allow_retake === "once"
                    ? "Students can only attempt this quest once."
                    : "Students can retake this quest as many times as they want."}
                </p>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Connect to Chapter *</Label>
                <select
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={questForm.parent_lesson_id}
                onChange={(e) => setQuestForm({ ...questForm, parent_lesson_id: e.target.value })}
                >
                <option value="" disabled>Select a core lesson...</option>
                {coreLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                    {l.title}
                    </option>
                ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Input
                placeholder="Short summary..."
                value={questForm.description}
                onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })}
                className="h-9"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Content (Markdown) *</Label>
                <Textarea
                required
                placeholder="# Introduction\nExplain the content..."
                className="min-h-[120px] font-mono text-sm resize-y"
                value={questForm.content_markdown}
                onChange={(e) => setQuestForm({ ...questForm, content_markdown: e.target.value })}
                />
            </div>
            </form>

            {/* --- ACTIVITY BUILDER SECTION --- */}
            <div className="pt-6 border-t mt-6 border-dashed">
            <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-bold text-foreground">Interactive Activities</Label>
                <select
                className="h-7 text-xs rounded-md border border-input bg-background px-2 py-0.5 shadow-sm"
                onChange={(e) => {
                    handleAddActivity(e.target.value as ActivityType);
                    e.target.value = "";
                }}
                defaultValue=""
                >
                <option value="" disabled>+ Add...</option>
                <option value="QUIZ">Quiz</option>
                <option value="MATCHING">Matching</option>
                <option value="BUILDING_BLOCKS">Code Builder</option>
                </select>
            </div>

            <div className="space-y-4">
                {questActivities.map((act, idx) => (
                <Card key={act.id || idx} className="relative shadow-sm py-2 px-3 border-gray-200 dark:border-gray-800">
                    <div className="absolute right-2 top-2 flex items-center gap-0.5">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={idx === 0} onClick={() => {
                        setQuestActivities(prev => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
                    }}>
                        <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" disabled={idx === questActivities.length - 1} onClick={() => {
                        setQuestActivities(prev => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; });
                    }}>
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-indigo-600" onClick={() => setPreviewActivityIdx(idx)}>
                        <Play className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setQuestActivities(prev => prev.filter((_, i) => i !== idx))}>
                        <X className="h-3 w-3" />
                    </Button>
                    </div>

                    <h4 className="text-xs font-bold mb-3 flex items-center gap-2 pr-12">
                     <span className="bg-muted px-1.5 rounded">#{idx + 1}</span>
                     {act.type}
                    </h4>

                    {/* QUIZ */}
                    {act.type === "QUIZ" && (
                    <div className="space-y-2">
                        <Input
                        placeholder="Question Prompt"
                        className="h-8 text-xs"
                        value={act.data.question || ""}
                        onChange={(e) => handleUpdateActivityData(idx, { ...act.data, question: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].map((optIdx) => (
                            <div key={optIdx} className="flex items-center gap-1.5">
                            <input
                                type="radio"
                                name={`correct-opt-${idx}`}
                                className="w-3 h-3"
                                checked={act.data.answer === (act.data.options?.[optIdx] || "") && act.data.answer !== ""}
                                onChange={() => handleUpdateActivityData(idx, { ...act.data, answer: act.data.options[optIdx] })}
                            />
                            <Input
                                placeholder={`Option ${optIdx + 1}`}
                                className="h-7 text-xs"
                                value={act.data.options?.[optIdx] || ""}
                                onChange={(e) => {
                                const newOptions = [...(act.data.options || ["", "", "", ""])];
                                const oldVal = newOptions[optIdx];
                                newOptions[optIdx] = e.target.value;
                                let newAnswer = act.data.answer;
                                if (oldVal === newAnswer) newAnswer = e.target.value;
                                handleUpdateActivityData(idx, { ...act.data, options: newOptions, answer: newAnswer });
                                }}
                            />
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* MATCHING */}
                    {act.type === "MATCHING" && (
                    <div className="space-y-2">
                        <Input
                        placeholder="Question Prompt"
                        className="h-8 text-xs"
                        value={act.data.question || ""}
                        onChange={(e) => handleUpdateActivityData(idx, { ...act.data, question: e.target.value })}
                        />
                        {(act.data.pairs || []).map((pair: any, pairIdx: number) => (
                        <div key={pairIdx} className="flex items-center gap-1">
                            <Input
                            placeholder="Left Term"
                            className="h-7 text-xs"
                            value={pair.left || ""}
                            onChange={(e) => {
                                const newPairs = [...act.data.pairs];
                                newPairs[pairIdx].left = e.target.value;
                                handleUpdateActivityData(idx, { ...act.data, pairs: newPairs });
                            }}
                            />
                            <span className="text-muted-foreground text-xs">→</span>
                            <Input
                            placeholder="Right Match"
                            className="h-7 text-xs"
                            value={pair.right || ""}
                            onChange={(e) => {
                                const newPairs = [...act.data.pairs];
                                newPairs[pairIdx].right = e.target.value;
                                handleUpdateActivityData(idx, { ...act.data, pairs: newPairs });
                            }}
                            />
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => {
                                const newPairs = [...act.data.pairs];
                                newPairs.splice(pairIdx, 1);
                                handleUpdateActivityData(idx, { ...act.data, pairs: newPairs });
                            }}>
                             <X className="h-3 w-3" />
                            </Button>
                        </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="w-full border-dashed h-7 text-xs mt-1" onClick={() => {
                        const newPairs = [...(act.data.pairs || []), { left: "", right: "" }];
                        handleUpdateActivityData(idx, { ...act.data, pairs: newPairs });
                        }}>
                        + Add Pair
                        </Button>
                    </div>
                    )}

                    {/* CODE BUILDER — Visual Drag & Drop IDE */}
                    {act.type === "BUILDING_BLOCKS" && (() => {
                        const segments: string[] = act.data.segments || [];
                        const template: string = act.data.template || "";
                        const correctOrder: number[] = act.data.correctOrder || [];

                        // Parse template to find slot placeholders (support both [slot] and [0],[1] etc.)
                        const slotRegex = /(\[slot\]|\[\d+\])/g;
                        const templateSlots = template.match(slotRegex) || [];
                        const slotCount = templateSlots.length;

                        // Which segments have been placed into which slot
                        const placedSegmentIndices: (number | null)[] = Array(slotCount).fill(null);
                        correctOrder.forEach((segIdx, slotIdx) => {
                            if (slotIdx < slotCount) placedSegmentIndices[slotIdx] = segIdx;
                        });

                        // Pool = segments NOT yet placed in any slot
                        const placedSet = new Set(placedSegmentIndices.filter(v => v !== null) as number[]);
                        const availablePool = segments.map((seg, i) => ({ value: seg, index: i })).filter(s => !placedSet.has(s.index));

                        const handlePlaceBlock = (segmentIndex: number) => {
                            const nextEmpty = placedSegmentIndices.findIndex(v => v === null);
                            if (nextEmpty === -1) return;
                            const newOrder = [...correctOrder];
                            while (newOrder.length <= nextEmpty) newOrder.push(0);
                            newOrder[nextEmpty] = segmentIndex;
                            handleUpdateActivityData(idx, { ...act.data, correctOrder: newOrder });
                        };

                        const handleRemoveFromSlot = (slotIdx: number) => {
                            const newOrder = [...correctOrder];
                            newOrder.splice(slotIdx, 1);
                            handleUpdateActivityData(idx, { ...act.data, correctOrder: newOrder });
                        };

                        const handleResetSlots = () => {
                            handleUpdateActivityData(idx, { ...act.data, correctOrder: [] });
                        };

                        return (
                    <div className="space-y-4 pt-1">
                        {/* Step 1: Prompt */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 1 · Question Prompt</Label>
                            <Input
                                placeholder="e.g. Build a loop that prints numbers from 1 to 10..."
                                className="h-8 text-xs font-medium"
                                value={act.data.question || ""}
                                onChange={(e) => handleUpdateActivityData(idx, { ...act.data, question: e.target.value })}
                            />
                        </div>

                        {/* Step 2: Segment Pool */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 2 · Code Blocks</Label>
                            <p className="text-[10px] text-muted-foreground">Add all the code fragments students can choose from.</p>
                            <div className="flex flex-wrap gap-2">
                                {segments.map((seg, segIdx) => (
                                    <div key={segIdx} className="flex items-center bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg overflow-hidden group">
                                        <span className="bg-indigo-100 dark:bg-indigo-900 border-r border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 px-2 py-1.5 text-[10px] font-mono select-none font-bold">
                                            {segIdx}
                                        </span>
                                        <input
                                            className="bg-transparent text-xs font-mono w-24 px-2 py-1.5 outline-none text-indigo-900 dark:text-indigo-100"
                                            value={seg}
                                            placeholder="code..."
                                            onChange={(e) => {
                                                const ns = [...segments]; ns[segIdx] = e.target.value;
                                                handleUpdateActivityData(idx, { ...act.data, segments: ns });
                                            }}
                                        />
                                        <button type="button" className="px-1.5 py-1.5 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                            const ns = [...segments]; ns.splice(segIdx, 1);
                                            const cleanedOrder = correctOrder.filter(ci => ci !== segIdx).map(ci => ci > segIdx ? ci - 1 : ci);
                                            handleUpdateActivityData(idx, { ...act.data, segments: ns, correctOrder: cleanedOrder });
                                        }}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" className="h-[30px] border-dashed text-[10px] rounded-lg" onClick={() => {
                                    handleUpdateActivityData(idx, { ...act.data, segments: [...segments, ""] });
                                }}>
                                    <Plus className="h-3 w-3 mr-1" /> Add Block
                                </Button>
                            </div>
                        </div>

                        {/* Step 3: Template */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 3 · Code Template</Label>
                            <p className="text-[10px] text-muted-foreground">
                                Type code and use <code className="bg-zinc-800 text-emerald-400 px-1 rounded font-mono">{"[slot]"}</code> or <code className="bg-zinc-800 text-emerald-400 px-1 rounded font-mono">{"[0]"}</code>,<code className="bg-zinc-800 text-emerald-400 px-1 rounded font-mono">{"[1]"}</code> to mark where students drop blocks.
                            </p>
                            <Textarea
                                placeholder={"[slot][slot]([slot]);"}
                                className="min-h-[70px] text-xs font-mono resize-y p-3 bg-zinc-950 text-emerald-400 border-zinc-800 placeholder:text-zinc-700 leading-relaxed rounded-lg"
                                value={template}
                                onChange={(e) => {
                                    handleUpdateActivityData(idx, { ...act.data, template: e.target.value, correctOrder: [] });
                                }}
                            />
                        </div>

                        {/* Step 4: Live IDE Preview — Click-to-place correct answer */}
                        {slotCount > 0 && segments.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step 4 · Set Correct Answer</Label>
                                {correctOrder.length > 0 && (
                                    <button type="button" onClick={handleResetSlots} className="text-[10px] text-red-400 hover:text-red-500 font-medium">
                                        Reset
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">Click a block from the pool, then it fills the next empty slot. Click a filled slot to remove it.</p>

                            {/* Mini IDE Preview */}
                            <div className="rounded-xl border border-zinc-700 overflow-hidden shadow-lg">
                                {/* File tab header */}
                                <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 border-b border-zinc-700">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 rounded-full bg-red-500 opacity-70" />
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 opacity-70" />
                                        <span className="w-2 h-2 rounded-full bg-green-500 opacity-70" />
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-mono ml-1">Program.cs</span>
                                </div>

                                {/* Code area with slots */}
                                <div className="bg-zinc-950 min-h-[60px] p-4 flex flex-col gap-1.5 font-mono text-xs">
                                    {template.split("\n").map((line, lineIdx) => {
                                        // Count slots in previous lines to get global slot index
                                        let slotCounter = 0;
                                        for (let li = 0; li < lineIdx; li++) {
                                            const prevLine = template.split("\n")[li];
                                            slotCounter += (prevLine.match(slotRegex) || []).length;
                                        }

                                        const parts = line.split(slotRegex);
                                        let localSlotIdx = slotCounter;

                                        return (
                                            <div key={lineIdx} className="flex flex-wrap items-center gap-1 min-h-[28px]">
                                                {parts.map((part, partIdx) => {
                                                    // Check if this part is a slot marker
                                                    if (part === "[slot]" || /^\[\d+\]$/.test(part)) {
                                                        const globalIdx = localSlotIdx;
                                                        localSlotIdx++;
                                                        const placedIdx = placedSegmentIndices[globalIdx];
                                                        const isEmpty = placedIdx === null || placedIdx === undefined;

                                                        return (
                                                            <button
                                                                key={`slot-${globalIdx}`}
                                                                type="button"
                                                                onClick={() => {
                                                                    if (!isEmpty) handleRemoveFromSlot(globalIdx);
                                                                }}
                                                                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold border-2 transition-all select-none min-w-[48px] text-center ${
                                                                    isEmpty
                                                                        ? "border-dashed border-zinc-600 bg-zinc-800/50 text-transparent cursor-default"
                                                                        : "bg-indigo-500 text-white border-indigo-700 border-b-[3px] hover:bg-red-500 hover:border-red-700 shadow-md cursor-pointer"
                                                                }`}
                                                                title={isEmpty ? "Click a block below to place here" : `${segments[placedIdx]} — click to remove`}
                                                            >
                                                                {isEmpty ? "\u00a0\u00a0\u00a0" : segments[placedIdx]}
                                                            </button>
                                                        );
                                                    }
                                                    if (part) return <span key={partIdx} className="text-zinc-300 whitespace-pre">{part}</span>;
                                                    return null;
                                                })}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Available blocks to click-to-place */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {availablePool.length > 0 ? availablePool.map((block) => (
                                    <button
                                        key={block.index}
                                        type="button"
                                        onClick={() => handlePlaceBlock(block.index)}
                                        className="px-3 py-1 rounded-lg font-mono text-xs font-semibold bg-indigo-500 text-white border-2 border-indigo-700 border-b-[3px] hover:bg-indigo-400 active:border-b-2 active:translate-y-[1px] shadow-md transition-all select-none cursor-pointer"
                                    >
                                        {block.value || "(empty)"}
                                    </button>
                                )) : (
                                    <span className="text-[10px] text-emerald-500 font-medium">✓ All blocks placed!</span>
                                )}
                            </div>
                        </div>
                        )}
                    </div>
                        );
                    })()}
                </Card>
                ))}

                {questActivities.length === 0 && (
                <div className="text-center py-4 rounded bg-muted/30 border border-dashed text-xs text-muted-foreground">
                    No activities. Quest will only show markdown content.
                </div>
                )}
            </div>
            </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 shrink-0 flex items-center justify-end gap-2">
         {selectedQuest && (
          <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 mr-auto" disabled={isSubmitting || isDeleting} onClick={handleDeleteQuest}>
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />} Delete
          </Button>
         )}
         <Button type="button" variant="ghost" disabled={isSubmitting} onClick={onCancel}>
          Cancel
         </Button>
         <Button type="submit" form="quest-form" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
           {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
           {selectedQuest ? "Save Changes" : "Create Quest"}
         </Button>
      </div>

      {/* INLINE PREVIEW OVERLAY */}
      {previewActivityIdx !== null && questActivities[previewActivityIdx] && (
        <div className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col rounded-lg overflow-hidden text-white border border-slate-800">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-200">
                <Play className="text-pink-500 w-4 h-4" /> Live Preview
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setPreviewActivityIdx(null)} className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                <X className="w-4 h-4" />
            </Button>
            </div>
            <div className="flex-1 p-4 bg-[#020617] flex items-center justify-center relative overflow-y-auto">
             <div className="w-full max-w-xl scale-90 transform-gpu origin-center relative z-10">
                {questActivities[previewActivityIdx].type === "QUIZ" && <QuizActivity data={questActivities[previewActivityIdx].data} onComplete={() => toast("Preview interaction tracked!")} onConsumeHint={async () => false} />}
                {questActivities[previewActivityIdx].type === "MATCHING" && <MatchingActivity data={questActivities[previewActivityIdx].data} onComplete={() => toast("Preview interaction tracked!")} onConsumeHint={async () => false} />}
                {questActivities[previewActivityIdx].type === "BUILDING_BLOCKS" && <BuildingBlocksActivity data={questActivities[previewActivityIdx].data} onComplete={() => toast("Preview interaction tracked!")} onConsumeHint={async () => false} />}
             </div>
            </div>
        </div>
      )}
    </Card>
  );
}
