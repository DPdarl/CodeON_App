import { useState, useEffect, useMemo } from "react";
import { supabase } from "~/utils/supabase";
import { useAuth } from "~/contexts/AuthContext";
import { useNavigate } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Search,
  MapPin,
  Map,
  Plus,
  BookOpen,
  ChevronDown,
  X,
  Play,
  Save,
} from "lucide-react";

import type { Activity, ActivityType } from "~/types/lesson.types";

import {
  QuizActivity,
  BuildingBlocksActivity,
  MatchingActivity,
} from "~/components/dashboardmodule/ActivityComponents";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Classroom {
  id: string;
  name: string;
  academic_year: string;
  join_code: string;
}

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
  order_index?: number;
}

export default function InstructorSideQuestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const ALLOWED_ROLES = ["instructor", "admin", "superadmin"];
  const isAllowed = user && ALLOWED_ROLES.includes(user.role ?? "");

  // --- STATE -----------------------------------------------------------------
  const [isLoading, setIsLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [coreLessons, setCoreLessons] = useState<CoreLesson[]>([]);
  const [sideQuests, setSideQuests] = useState<SideQuest[]>([]);
  const [isQuestsLoading, setIsQuestsLoading] = useState(true);

  // Modals
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [isQuestDeleteOpen, setIsQuestDeleteOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<SideQuest | null>(null);
  const [isQuestSubmitting, setIsQuestSubmitting] = useState(false);
  const [questActivities, setQuestActivities] = useState<Activity[]>([]);
  const [previewActivityIdx, setPreviewActivityIdx] = useState<number | null>(
    null,
  );

  const [questForm, setQuestForm] = useState({
    title: "",
    description: "",
    content_markdown: "",
    xp_reward: 30,
    parent_lesson_id: "",
  });

  useEffect(() => {
    if (user && !isAllowed) navigate("/dashboard");
  }, [user, isAllowed, navigate]);

  // --- FETCHING -------------------------------------------------------------
  const fetchClassrooms = async () => {
    if (!user?.uid) return;
    let query = supabase
      .from("classrooms")
      .select("id, name, academic_year, join_code")
      .order("created_at", { ascending: false });

    // Restrict instructors to their own classrooms; Admins see all
    if (user.role === "instructor") {
      query = query.eq("instructor_id", user.uid);
    }

    const { data, error } = await query;
    if (!error && data) {
      setClassrooms(data);
      if (data.length > 0 && !selectedClassroomId) {
        setSelectedClassroomId(data[0].id);
      }
    }
  };

  const fetchCoreLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, order_index")
      .eq("is_core_node", true)
      .order("order_index", { ascending: true });
    if (!error && data) {
      setCoreLessons(data);
    }
  };

  const fetchSideQuests = async () => {
    if (!selectedClassroomId) return;
    setIsQuestsLoading(true);
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("is_core_node", false)
      .eq("classroom_id", selectedClassroomId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load Side Quests.");
    } else {
      setSideQuests(data || []);
    }
    setIsQuestsLoading(false);
  };

  useEffect(() => {
    if (user?.uid) {
      fetchClassrooms();
      fetchCoreLessons();
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (selectedClassroomId) fetchSideQuests();
    else setSideQuests([]);
  }, [selectedClassroomId]);

  // --- HANDLERS -------------------------------------------------------------
  const openNewQuestModal = () => {
    setSelectedQuest(null);
    setQuestActivities([]);
    setQuestForm({
      title: "",
      description: "",
      content_markdown: "",
      xp_reward: 30,
      parent_lesson_id: coreLessons[0]?.id || "",
    });
    setIsQuestModalOpen(true);
  };

  const openEditQuestModal = async (q: SideQuest) => {
    setSelectedQuest(q);
    setQuestActivities([]); // Clear first
    setQuestForm({
      title: q.title,
      description: q.description || "",
      content_markdown: q.content_markdown || "",
      xp_reward: q.xp_reward || 30,
      parent_lesson_id: q.parent_lesson_id || "",
    });
    setIsQuestModalOpen(true);

    // Fetch existing activities for this quest
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("lesson_id", q.id);

      if (!error && data) {
        // Map database activity structure to frontend Activity type
        const mappedActivities: Activity[] = data.map((act) => ({
          id: act.id,
          type: act.type as ActivityType,
          title: act.title || "",
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
    if (
      !questForm.title.trim() ||
      !questForm.parent_lesson_id ||
      !selectedClassroomId
    ) {
      toast.error("Title, Core Lesson connection, and Classroom are required.");
      return;
    }

    setIsQuestSubmitting(true);
    try {
      const payload = {
        title: questForm.title.trim(),
        slug: questForm.title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        description: questForm.description.trim(),
        content_markdown: questForm.content_markdown.trim(),
        xp_reward: questForm.xp_reward,
        parent_lesson_id: questForm.parent_lesson_id,
        is_core_node: false,
        classroom_id: selectedClassroomId, // SCOPED
        order_index:
          selectedQuest?.order_index ??
          sideQuests.filter(
            (q) => q.parent_lesson_id === questForm.parent_lesson_id,
          ).length + 1,
      };

      let savedLessonId = "";

      if (selectedQuest) {
        // UPDATE
        const { error } = await supabase
          .from("lessons")
          .update(payload)
          .eq("id", selectedQuest.id);
        if (error) throw error;
        savedLessonId = selectedQuest.id;
        toast.success("Side quest updated!");
      } else {
        // INSERT
        const { data, error } = await supabase
          .from("lessons")
          .insert([payload])
          .select("id")
          .single();
        if (error) throw error;
        savedLessonId = data.id;
        toast.success("Side quest created!");
      }

      // --- HANDLE ACTIVITIES ---
      if (savedLessonId) {
        // 1. Delete existing activities for this lesson
        await supabase
          .from("activities")
          .delete()
          .eq("lesson_id", savedLessonId);

        // 2. Insert new activities if any exist
        if (questActivities.length > 0) {
          const insertPayload = questActivities.map((act) => ({
            lesson_id: savedLessonId,
            type: act.type,
            title: act.title || `${act.type} Activity`,
            data: act.data,
          }));

          const { error: actError } = await supabase
            .from("activities")
            .insert(insertPayload);

          if (actError)
            throw new Error("Activities failed to save: " + actError.message);
        }
      }

      setIsQuestModalOpen(false);
      fetchSideQuests();
    } catch (err: any) {
      toast.error("Failed: " + (err.message || "Unknown error"));
    } finally {
      setIsQuestSubmitting(false);
    }
  };

  // --- ACTIVITY BUILDER HELPERS ---
  const handleAddActivity = (type: ActivityType) => {
    const newActivity: Activity = {
      id:
        typeof window !== "undefined" && window.crypto
          ? window.crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15),
      type,
      title: `New ${type} Activity`,
      data: {},
    };

    if (type === "QUIZ") {
      newActivity.data = {
        question: "",
        options: ["", "", "", ""],
        answer: "",
      };
    } else if (type === "MATCHING") {
      newActivity.data = { pairs: [{ left: "", right: "" }] };
    } else if (type === "BUILDING_BLOCKS") {
      newActivity.data = { template: "", segments: [], correctOrder: [] };
    }

    setQuestActivities([...questActivities, newActivity]);
  };

  const handleRemoveActivity = (indexToRemove: number) => {
    setQuestActivities((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleUpdateActivityData = (index: number, newData: any) => {
    setQuestActivities((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], data: newData };
      return next;
    });
  };

  const handleDeleteQuest = async () => {
    if (!selectedQuest) return;
    setIsQuestSubmitting(true);
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", selectedQuest.id);
      if (error) throw error;
      toast.success("Side quest deleted.");
      setIsQuestDeleteOpen(false);
      fetchSideQuests();
    } catch (err: any) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setIsQuestSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-background">
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="text-pink-500 h-6 w-6" /> Adventure Side Quests
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Custom bonus lessons scoped to a specific classroom.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                fetchClassrooms();
                if (selectedClassroomId) fetchSideQuests();
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              onClick={openNewQuestModal}
              disabled={classrooms.length === 0}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" /> Create Side Quest
            </Button>
          </div>
        </div>

        {/* Classroom Tabs / Selector */}
        {classrooms.length === 0 ? (
          <Card className="border-dashed bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <BookOpen className="h-8 w-8 mb-3 text-muted-foreground/50" />
              <p>No classrooms yet.</p>
              <p className="text-xs mt-1">
                Create classrooms from the <strong>Sections</strong> page, then
                return here to add side quests.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {classrooms.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClassroomId(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedClassroomId === c.id
                    ? "bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20"
                    : "bg-background border hover:bg-muted text-muted-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Quest Table */}
        {classrooms.length > 0 && (
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Parent Chapter</th>
                    <th className="px-5 py-4">XP</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isQuestsLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        <Loader2 className="animate-spin w-4 h-4 mx-auto mb-2" />{" "}
                        Loading...
                      </td>
                    </tr>
                  ) : sideQuests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-muted-foreground"
                      >
                        No side quests for this classroom yet.
                      </td>
                    </tr>
                  ) : (
                    sideQuests.map((quest) => {
                      const parent = coreLessons.find(
                        (l) => l.id === quest.parent_lesson_id,
                      );
                      return (
                        <tr key={quest.id} className="hover:bg-muted/30">
                          <td className="px-5 py-4 font-medium text-foreground">
                            {quest.title}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {parent ? parent.title : "Unknown Branch"}
                          </td>
                          <td className="px-5 py-4">{quest.xp_reward || 0}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditQuestModal(quest)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => {
                                  setSelectedQuest(quest);
                                  setIsQuestDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* MODAL: CREATE/EDIT SIDE QUEST */}
        <Dialog open={isQuestModalOpen} onOpenChange={setIsQuestModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedQuest ? "Edit Side Quest" : "Create Side Quest"}
              </DialogTitle>
              <DialogDescription>
                Side quests branch off main chapters and reward students
                directly. This will be scoped to the currently selected
                classroom.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveQuest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quest Title *</Label>
                  <Input
                    required
                    placeholder="e.g. Advanced For Loops"
                    value={questForm.title}
                    onChange={(e) =>
                      setQuestForm({ ...questForm, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>XP Reward</Label>
                  <Input
                    type="number"
                    min={0}
                    value={questForm.xp_reward}
                    onChange={(e) =>
                      setQuestForm({
                        ...questForm,
                        xp_reward: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Parent Chapter (Core Node) *</Label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  value={questForm.parent_lesson_id}
                  onChange={(e) =>
                    setQuestForm({
                      ...questForm,
                      parent_lesson_id: e.target.value,
                    })
                  }
                >
                  <option value="" disabled>
                    Select a core lesson...
                  </option>
                  {coreLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.order_index}. {l.title}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  The side quest will branch off this core lesson node on the
                  map.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Short summary of this side quest..."
                  value={questForm.description}
                  onChange={(e) =>
                    setQuestForm({ ...questForm, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Content (Markdown) *</Label>
                <Textarea
                  required
                  placeholder="# Hello World\n\nExplain the content here..."
                  className="min-h-[200px] font-mono text-sm"
                  value={questForm.content_markdown}
                  onChange={(e) =>
                    setQuestForm({
                      ...questForm,
                      content_markdown: e.target.value,
                    })
                  }
                />
              </div>

              {/* --- ACTIVITY BUILDER SECTION --- */}
              <div className="pt-6 border-t mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      Interactive Activities
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Students must complete these to finish the quest.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                      onChange={(e) => {
                        handleAddActivity(e.target.value as ActivityType);
                        e.target.value = "";
                      }}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        + Add Activity...
                      </option>
                      <option value="QUIZ">Multiple Choice Quiz</option>
                      <option value="MATCHING">Matching Type</option>
                      <option value="BUILDING_BLOCKS">Code Builder</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  {questActivities.map((act, idx) => (
                    <Card
                      key={act.id || idx}
                      className="relative border-border shadow-sm"
                    >
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => setPreviewActivityIdx(idx)}
                        >
                          <Play className="h-3 w-3" /> Preview
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          onClick={() => handleRemoveActivity(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs">
                            #{idx + 1}
                          </span>
                          {act.type === "QUIZ" && "Quiz Question"}
                          {act.type === "MATCHING" && "Matching Pairs"}
                          {act.type === "BUILDING_BLOCKS" && "Code Builder"}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-4 pt-0 space-y-4">
                        {/* QUIZ FORM */}
                        {act.type === "QUIZ" && (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">
                                Question Prompt
                              </Label>
                              <Input
                                placeholder="e.g. What does console.log do?"
                                value={act.data.question || ""}
                                onChange={(e) =>
                                  handleUpdateActivityData(idx, {
                                    ...act.data,
                                    question: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {[0, 1, 2, 3].map((optIdx) => (
                                <div key={optIdx} className="space-y-1">
                                  <Label className="text-[10px] text-muted-foreground uppercase">
                                    Option {optIdx + 1}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`correct-opt-${idx}`}
                                      className="w-4 h-4 cursor-pointer"
                                      checked={
                                        act.data.answer ===
                                          (act.data.options?.[optIdx] || "") &&
                                        act.data.answer !== ""
                                      }
                                      onChange={() =>
                                        handleUpdateActivityData(idx, {
                                          ...act.data,
                                          answer: act.data.options[optIdx],
                                        })
                                      }
                                      title="Mark as Correct Answer"
                                    />
                                    <Input
                                      placeholder={`Option ${optIdx + 1}`}
                                      className="h-8 text-sm"
                                      value={act.data.options?.[optIdx] || ""}
                                      onChange={(e) => {
                                        const newOptions = [
                                          ...(act.data.options || [
                                            "",
                                            "",
                                            "",
                                            "",
                                          ]),
                                        ];
                                        const oldVal = newOptions[optIdx];
                                        newOptions[optIdx] = e.target.value;

                                        // If this was the correct answer, update the answer string too
                                        let newAnswer = act.data.answer;
                                        if (oldVal === newAnswer)
                                          newAnswer = e.target.value;

                                        handleUpdateActivityData(idx, {
                                          ...act.data,
                                          options: newOptions,
                                          answer: newAnswer,
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* MATCHING FORM */}
                        {act.type === "MATCHING" && (
                          <div className="space-y-3">
                            <div className="space-y-1 mb-2">
                              <Label className="text-xs font-semibold">
                                Question Prompt (Optional)
                              </Label>
                              <Input
                                placeholder="e.g. Match the given terms to their definitions."
                                value={act.data.question || ""}
                                onChange={(e) =>
                                  handleUpdateActivityData(idx, {
                                    ...act.data,
                                    question: e.target.value,
                                  })
                                }
                              />
                            </div>
                            {(act.data.pairs || []).map(
                              (pair: any, pairIdx: number) => (
                                <div
                                  key={pairIdx}
                                  className="flex items-center gap-2"
                                >
                                  <Input
                                    placeholder="Left Term (e.g. string)"
                                    className="h-8 text-sm"
                                    value={pair.left || ""}
                                    onChange={(e) => {
                                      const newPairs = [...act.data.pairs];
                                      newPairs[pairIdx].left = e.target.value;
                                      handleUpdateActivityData(idx, {
                                        ...act.data,
                                        pairs: newPairs,
                                      });
                                    }}
                                  />
                                  <span className="text-muted-foreground text-sm">
                                    →
                                  </span>
                                  <Input
                                    placeholder="Right Match (e.g. Text data)"
                                    className="h-8 text-sm"
                                    value={pair.right || ""}
                                    onChange={(e) => {
                                      const newPairs = [...act.data.pairs];
                                      newPairs[pairIdx].right = e.target.value;
                                      handleUpdateActivityData(idx, {
                                        ...act.data,
                                        pairs: newPairs,
                                      });
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                    onClick={() => {
                                      const newPairs = [...act.data.pairs];
                                      newPairs.splice(pairIdx, 1);
                                      handleUpdateActivityData(idx, {
                                        ...act.data,
                                        pairs: newPairs,
                                      });
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ),
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full border-dashed"
                              onClick={() => {
                                const newPairs = [
                                  ...(act.data.pairs || []),
                                  { left: "", right: "" },
                                ];
                                handleUpdateActivityData(idx, {
                                  ...act.data,
                                  pairs: newPairs,
                                });
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Pair
                            </Button>
                          </div>
                        )}

                        {/* CODE BUILDER FORM */}
                        {act.type === "BUILDING_BLOCKS" && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold">
                                Segments (In Correct Order)
                              </Label>
                              {(act.data.segments || []).map(
                                (seg: string, segIdx: number) => (
                                  <div
                                    key={segIdx}
                                    className="flex items-center gap-2"
                                  >
                                    <div className="bg-muted text-muted-foreground w-6 h-6 rounded flex items-center justify-center text-xs font-mono shrink-0">
                                      [{segIdx}]
                                    </div>
                                    <Input
                                      placeholder={`Segment ${segIdx}`}
                                      className="h-8 text-sm font-mono"
                                      value={seg}
                                      onChange={(e) => {
                                        const newSegments = [
                                          ...(act.data.segments || []),
                                        ];
                                        newSegments[segIdx] = e.target.value;
                                        const newOrder = newSegments.map(
                                          (_, i) => i,
                                        );
                                        handleUpdateActivityData(idx, {
                                          ...act.data,
                                          segments: newSegments,
                                          correctOrder: newOrder,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                                      onClick={() => {
                                        const newSegments = [
                                          ...(act.data.segments || []),
                                        ];
                                        newSegments.splice(segIdx, 1);
                                        const newOrder = newSegments.map(
                                          (_, i) => i,
                                        );
                                        handleUpdateActivityData(idx, {
                                          ...act.data,
                                          segments: newSegments,
                                          correctOrder: newOrder,
                                        });
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ),
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed mt-2"
                                onClick={() => {
                                  const newSegments = [
                                    ...(act.data.segments || []),
                                    "",
                                  ];
                                  const newOrder = newSegments.map((_, i) => i);
                                  handleUpdateActivityData(idx, {
                                    ...act.data,
                                    segments: newSegments,
                                    correctOrder: newOrder,
                                  });
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" /> Add Code
                                Segment
                              </Button>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold flex items-center justify-between">
                                Visual Template
                                <span className="text-[10px] font-normal text-muted-foreground lowercase bg-muted px-1.5 rounded">
                                  Optional
                                </span>
                              </Label>
                              <p className="text-[11px] text-muted-foreground leading-tight -mt-1 mb-2">
                                Use{" "}
                                <code className="bg-muted text-foreground px-1 rounded">
                                  [0]
                                </code>
                                ,{" "}
                                <code className="bg-muted text-foreground px-1 rounded">
                                  [1]
                                </code>{" "}
                                to format slots. Example:{" "}
                                <code className="bg-muted text-foreground px-1 rounded">
                                  [0][1][2]();
                                </code>
                              </p>
                              <Textarea
                                placeholder="[0].[1]([2]);"
                                className="h-20 font-mono text-sm"
                                value={act.data.template || ""}
                                onChange={(e) =>
                                  handleUpdateActivityData(idx, {
                                    ...act.data,
                                    template: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {questActivities.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        No activities added yet.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add activities above to make this quest interactive.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsQuestModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isQuestSubmitting}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                >
                  {isQuestSubmitting ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : selectedQuest ? (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Create Quest
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>

            {/* INLINE LIVE SIMULATION UI */}
            {previewActivityIdx !== null &&
              questActivities[previewActivityIdx] && (
                <div className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col rounded-lg overflow-hidden text-white border border-slate-800">
                  <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2 text-slate-200">
                        <Play className="text-pink-500 w-5 h-5" /> Live
                        Simulation
                      </h3>
                      <p className="text-xs text-slate-400">
                        Test the interactive component exactly as it will appear
                        to students.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPreviewActivityIdx(null)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex-1 p-6 bg-[#020617] flex items-center justify-center relative overflow-y-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                    <div className="w-full max-w-2xl relative z-10">
                      {questActivities[previewActivityIdx].type === "QUIZ" && (
                        <QuizActivity
                          data={questActivities[previewActivityIdx].data}
                          onComplete={(success) =>
                            toast(
                              success
                                ? "Simulation: Correct!"
                                : "Simulation: Incorrect",
                            )
                          }
                          onConsumeHint={async () => false}
                        />
                      )}
                      {questActivities[previewActivityIdx].type ===
                        "MATCHING" && (
                        <MatchingActivity
                          data={questActivities[previewActivityIdx].data}
                          onComplete={(success) =>
                            toast(
                              success
                                ? "Simulation: Correct!"
                                : "Simulation: Incorrect",
                            )
                          }
                          onConsumeHint={async () => false}
                        />
                      )}
                      {questActivities[previewActivityIdx].type ===
                        "BUILDING_BLOCKS" && (
                        <BuildingBlocksActivity
                          data={questActivities[previewActivityIdx].data}
                          onComplete={(success) =>
                            toast(
                              success
                                ? "Simulation: Correct!"
                                : "Simulation: Incorrect",
                            )
                          }
                          onConsumeHint={async () => false}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
          </DialogContent>
        </Dialog>

        {/* MODAL: DELETE QUEST */}
        <Dialog open={isQuestDeleteOpen} onOpenChange={setIsQuestDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" /> Delete Side Quest
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete
                <span className="font-bold text-foreground mx-1">
                  {selectedQuest?.title}
                </span>
                ? This action cannot be undone and will remove it from the
                students' maps.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsQuestDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteQuest}
                disabled={isQuestSubmitting}
              >
                {isQuestSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete Quest"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
