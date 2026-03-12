import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  ChevronUp,
  ChevronDown,
  Loader2,
  Plus,
  CheckCircle2,
  School,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { useAuth } from "~/contexts/AuthContext";
import { supabase } from "~/utils/supabase";
import { JoinClassroomPrompt } from "~/components/dashboardmodule/JoinClassroomPrompt";
import { toast } from "sonner";
import { CSHARP_LESSONS, CHAPTER_VISUALS } from "~/data/adventureContent";
import { FullSideQuestMaker } from "~/components/instructormodule/FullSideQuestMaker";
import { ClassroomSkeleton } from "~/components/dashboardmodule/ClassroomSkeleton";

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
  allow_retake: "once" | "always";
  order_index?: number;
  parent?: any;
}

interface Classroom {
  id: string;
  name: string;
  join_code: string;
  student_count?: number;
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================
const getChapterVisual = (id: number) => {
  return CHAPTER_VISUALS.find((v) => v.id === id) || CHAPTER_VISUALS[0];
};

const StatusButton = ({
  status,
  onClick,
  label,
}: {
  status: "completed" | "active";
  onClick?: () => void;
  label?: string;
}) => {
  if (status === "completed") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-bold select-none">
        <CheckCircle2 className="w-3 h-3" />
        Done!
      </div>
    );
  }
  return (
    <Button
      className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)] w-24 h-8 text-xs font-bold"
      onClick={onClick}
    >
      <PlayCircle className="w-3 h-3 mr-1" /> Start
    </Button>
  );
};

const QuestRow = ({
  quest,
  isCompleted,
  onStart,
  isInstructor = false,
  isSelected = false,
}: {
  quest: SideQuest;
  isCompleted?: boolean;
  onStart?: () => void;
  isInstructor?: boolean;
  isSelected?: boolean;
}) => {
  return (
    <div
      className={`grid grid-cols-[1fr_auto] items-center gap-3 py-3 px-3 sm:px-4 border-b border-gray-100 dark:border-gray-800/50 last:border-0 rounded-lg transition-colors ${
        isCompleted && quest.allow_retake !== "always"
          ? "opacity-70 cursor-default"
          : isSelected
          ? "bg-indigo-50 dark:bg-indigo-950/30 border-l-2 border-l-indigo-600 cursor-pointer"
          : "hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
      }`}
      onClick={
        isCompleted && quest.allow_retake !== "always" ? undefined : onStart
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
        <span className="text-gray-400 dark:text-gray-500 font-mono text-[10px] sm:text-xs flex items-center gap-1 sm:w-24 shrink-0 uppercase tracking-wide">
          <BookOpen size={10} /> Special Quest
        </span>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm sm:text-base truncate pr-2 text-gray-900 dark:text-gray-200">
            {quest.title}
          </span>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {quest.description || "No description provided."}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-orange-600 dark:text-amber-400 border border-orange-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <span className="text-[10px]">✨</span>
              {quest.xp_reward} XP
            </span>
            {isInstructor && !quest.is_published && (
              <Badge
                variant="outline"
                className="text-[10px] text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-none"
              >
                <EyeOff className="w-3 h-3 mr-1 opacity-70" /> Hidden
              </Badge>
            )}
          </div>
        </div>
      </div>
      {!isInstructor && (
        <div className="shrink-0">
          {isCompleted && quest.allow_retake !== "always" ? (
            // Locked — no retake allowed
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-xs font-bold select-none">
              <CheckCircle2 className="w-3 h-3" />
              Done!
            </div>
          ) : (
            <StatusButton
              status={isCompleted ? "completed" : "active"}
              onClick={onStart}
              label={isCompleted ? "Play Again" : undefined}
            />
          )}
        </div>
      )}
      {isInstructor && (
        <Badge
          variant={isSelected ? "default" : "outline"}
          className={`text-[10px] ${
            isSelected ? "bg-indigo-600 text-white" : "text-muted-foreground"
          }`}
        >
          {isSelected ? "Editing" : "Assigned"}
        </Badge>
      )}
    </div>
  );
};

// ============================================================================
// STUDENT & INSTRUCTOR BRANCH SECTION
// ============================================================================
const BranchSection = ({
  chapterId,
  chapterTitle,
  chapterDesc,
  quests,
  isOpen,
  onToggle,
  completedChapters,
  isInstructor = false,
  onAddQuestClicked,
  onQuestClicked,
  selectedQuestId,
}: {
  chapterId: number;
  chapterTitle: string;
  chapterDesc?: string;
  quests: SideQuest[];
  isOpen: boolean;
  onToggle: () => void;
  completedChapters: string[];
  isInstructor?: boolean;
  onAddQuestClicked?: () => void;
  onQuestClicked?: (q: SideQuest) => void;
  selectedQuestId?: string;
}) => {
  const navigate = useNavigate();
  const hasQuests = quests.length > 0;
  const uncompletedCount = quests.filter(
    (q) => !completedChapters.includes(q.id),
  ).length;
  const visual = getChapterVisual(chapterId);
  const Icon = visual.icon;

  return (
    <div className="relative pl-12 pb-8">
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
      <button
        onClick={onToggle}
        className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 border-2 transition-all duration-300 ${
          isOpen
            ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]"
            : "bg-white dark:bg-[#0F172A] border-indigo-200 dark:border-indigo-900 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
        }`}
      >
        {chapterId}
      </button>

      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-none">
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
        <div
          className="p-4 sm:p-5 flex items-start justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          onClick={onToggle}
        >
          <div className="flex gap-4">
            <div
              className={`mt-1 flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm ${visual.color}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {chapterTitle}
                </h3>
                {!isInstructor && uncompletedCount > 0 && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 animate-bounce-subtle pointer-events-none">
                    {uncompletedCount} Pending
                  </Badge>
                )}
                {isInstructor && hasQuests && (
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  >
                    {quests.length} Assigned
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {chapterDesc}
              </p>
            </div>
          </div>
          <div className="text-gray-400 shrink-0 ml-2 mt-1">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#161b22] p-3">
            <div className="bg-white dark:bg-[#0F172A]/50 rounded-lg p-2 border border-gray-200 dark:border-transparent min-h-[80px]">
              {hasQuests ? (
                quests.map((quest) => (
                  <QuestRow
                    key={quest.id}
                    quest={quest}
                    isCompleted={completedChapters.includes(quest.id)}
                    isInstructor={isInstructor}
                    isSelected={selectedQuestId === quest.id}
                    onStart={() => {
                      if (isInstructor && onQuestClicked) {
                        onQuestClicked(quest);
                      } else if (!isInstructor) {
                        navigate(`/play/special-quest?lessonId=${quest.id}`);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 opacity-40" />
                  </div>
                  <p className="text-sm font-medium">
                    {isInstructor
                      ? "You haven't assigned any special quests here."
                      : "No special quests available for this chapter yet."}
                  </p>
                </div>
              )}

              {/* Instructor Create Button */}
              {isInstructor && (
                <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 dashed border border-dashed border-indigo-200 dark:border-indigo-900"
                    onClick={onAddQuestClicked}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Special Quest
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// INSTRUCTOR VIEW CONTAINER
// ============================================================================

const InstructorClassroomView = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(
    null,
  );

  const [sideQuests, setSideQuests] = useState<SideQuest[]>([]);
  const [coreLessons, setCoreLessons] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [openChapter, setOpenChapter] = useState<number | null>(1);

  // Maker Panel State
  const [showMakerPanel, setShowMakerPanel] = useState(false);
  const [editingQuest, setEditingQuest] = useState<SideQuest | null>(null);

  const fetchClassrooms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select("id, name, join_code")
        .eq("instructor_id", user?.uid)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClassrooms(data || []);
      if (data && data.length > 0) {
        setSelectedClassroomId((prev) => (prev ? prev : data[0].id));
      }
    } catch (err: any) {
      toast.error("Error loading classrooms");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoreLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("id, title, order_index")
      .eq("is_core_node", true)
      .order("order_index", { ascending: true });
    if (!error && data) setCoreLessons(data);
  };

  const fetchQuests = async (classroomId: string) => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select(
          "id, title, description, content_markdown, xp_reward, parent_lesson_id, classroom_id, order_index, is_core_node, is_published, allow_retake, parent:parent_lesson_id(title)",
        )
        .eq("is_core_node", false)
        .eq("classroom_id", classroomId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      setSideQuests(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      // Fire classrooms and core lessons in parallel
      Promise.all([fetchClassrooms(), fetchCoreLessons()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const prevClassroomId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedClassroomId) {
      fetchQuests(selectedClassroomId);
      if (prevClassroomId.current !== selectedClassroomId) {
        setShowMakerPanel(false);
        setEditingQuest(null);
      }
      prevClassroomId.current = selectedClassroomId;
    }
  }, [selectedClassroomId]);

  const getQuestsForChapter = (lessonTitle: string): SideQuest[] => {
    return sideQuests.filter((quest) => {
      const parentObj = quest.parent as any;
      const parentTitle = parentObj
        ? Array.isArray(parentObj)
          ? parentObj[0]?.title
          : parentObj.title
        : null;
      return parentTitle === lessonTitle;
    });
  };

  if (isLoading) {
    return <ClassroomSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
          Special Quest Manager
        </h1>
        <p className="text-muted-foreground">
          Create and assign custom interactive missions to your classrooms.
        </p>
      </div>

      {classrooms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <School className="w-12 h-12 mb-4 opacity-20" />
            <h3 className="font-bold text-lg text-foreground">
              No Classrooms Found
            </h3>
            <p className="max-w-md mt-2">
              You need to create a classroom in the "Classrooms" page first
              before assigning special quests.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start justify-center transition-all duration-500 overflow-hidden">
          {/* Column 1: Classes Sidebar */}
          <div className="w-full lg:w-[250px] shrink-0 flex flex-col gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
              My Classes
            </h3>
            {classrooms.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassroomId(cls.id)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  selectedClassroomId === cls.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "bg-white dark:bg-card border-border hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                }`}
              >
                <div className="font-bold truncate">{cls.name}</div>
                <div
                  className={`text-xs mt-1 ${
                    selectedClassroomId === cls.id
                      ? "text-indigo-100"
                      : "text-muted-foreground"
                  }`}
                >
                  Code: {cls.join_code}
                </div>
              </button>
            ))}
          </div>

          {/* Column 2: Timeline View */}
          <div
            className={`transition-all duration-500 space-y-0 h-[calc(100vh-120px)] overflow-y-auto pr-4 custom-scrollbar flex-1 w-full ${
              !showMakerPanel ? "max-w-4xl" : ""
            }`}
          >
            {CSHARP_LESSONS.map((lesson, idx) => {
              const chapterQuests = getQuestsForChapter(lesson.title);
              const isOpen =
                openChapter === null ? idx === 0 : openChapter === lesson.id;

              return (
                <BranchSection
                  key={lesson.id}
                  chapterId={lesson.id}
                  chapterTitle={lesson.title}
                  chapterDesc={lesson.description}
                  quests={chapterQuests}
                  isOpen={isOpen}
                  onToggle={() => setOpenChapter(isOpen ? -1 : lesson.id)}
                  completedChapters={[]}
                  isInstructor={true}
                  selectedQuestId={editingQuest?.id}
                  onAddQuestClicked={() => {
                    setEditingQuest(null);
                    setShowMakerPanel(true);
                  }}
                  onQuestClicked={(q) => {
                    setEditingQuest(q);
                    setShowMakerPanel(true);
                  }}
                />
              );
            })}
          </div>

          {/* Column 3: The Full Side Quest Maker Panel */}
          <div
            className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden shrink-0 ${
              showMakerPanel
                ? "w-full lg:flex-1 opacity-100 translate-x-0"
                : "w-0 opacity-0 translate-x-12 pointer-events-none"
            }`}
          >
            <div className="w-full h-[calc(100vh-120px)] pr-2">
              <FullSideQuestMaker
                classroomId={selectedClassroomId!}
                coreLessons={coreLessons}
                selectedQuest={editingQuest}
                onSave={() => fetchQuests(selectedClassroomId!)}
                onCancel={() => {
                  setShowMakerPanel(false);
                  setEditingQuest(null);
                }}
                onDelete={() => fetchQuests(selectedClassroomId!)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STUDENT VIEW CONTAINER
// ============================================================================

const StudentClassroomView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [sideQuests, setSideQuests] = useState<SideQuest[]>([]);
  const [classroomName, setClassroomName] = useState("");
  const [openChapter, setOpenChapter] = useState<number | null>(1);

  const fetchClassroomData = async (classroomId: string) => {
    try {
      setIsLoading(true);
      const { data: classroomData } = await supabase
        .from("classrooms")
        .select("name")
        .eq("id", classroomId)
        .single();

      if (classroomData) setClassroomName(classroomData.name);

      const { data: questsData, error: questsError } = await supabase
        .from("lessons")
        .select(
          "id, title, description, content_markdown, xp_reward, classroom_id, parent_lesson_id, is_core_node, is_published, allow_retake, parent:parent_lesson_id(title)",
        )
        .eq("is_core_node", false)
        .eq("classroom_id", classroomId)
        .eq("is_published", true)
        .order("created_at", { ascending: true });

      if (questsError) throw questsError;
      setSideQuests(questsData || []);
    } catch (err: any) {
      toast.error("Failed to load special quests.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid && user.classroom_id) {
      fetchClassroomData(user.classroom_id);
    } else {
      setIsLoading(false);
    }
    // Use stable primitives (uid + classroom_id) instead of the entire user object
    // so that alt-tabbing (which recreates the user object via visibilitychange)
    // does NOT re-trigger a full classroom data reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.classroom_id]);

  const handleJoinedClassroom = (classroomId: string, name: string) => {
    setClassroomName(name);
    fetchClassroomData(classroomId);
  };

  const getQuestsForChapter = (lessonTitle: string): SideQuest[] => {
    return sideQuests.filter((quest) => {
      const parentObj = quest.parent as any;
      const parentTitle = parentObj
        ? Array.isArray(parentObj)
          ? parentObj[0]?.title
          : parentObj.title
        : null;
      return parentTitle === lessonTitle;
    });
  };

  if (isLoading) {
    return <ClassroomSkeleton />;
  }

  if (!user?.classroom_id) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center">
        <div className="text-center mb-10 max-w-md">
          <h1 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
            Classroom Access
          </h1>
          <p className="text-muted-foreground">
            Join a classroom to unlock exclusive special quests given by your
            instructor.
          </p>
        </div>
        <JoinClassroomPrompt onJoined={handleJoinedClassroom} />
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
          {classroomName
            ? `${classroomName} — Special Quests`
            : "Special Quests"}
        </h1>
        <p className="text-muted-foreground">
          Instructor-assigned bonus missions, unlocked by chapters.
        </p>
      </div>

      <div className="space-y-0">
        {CSHARP_LESSONS.map((lesson, idx) => {
          const chapterQuests = getQuestsForChapter(lesson.title);
          const isOpen =
            openChapter === null ? idx === 0 : openChapter === lesson.id;

          return (
            <BranchSection
              key={lesson.id}
              chapterId={lesson.id}
              chapterTitle={lesson.title}
              chapterDesc={lesson.description}
              quests={chapterQuests}
              isOpen={isOpen}
              onToggle={() => setOpenChapter(isOpen ? -1 : lesson.id)}
              completedChapters={user?.completedChapters || []}
              isInstructor={false}
            />
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE ROUTE
// ============================================================================

export default function ClassroomSideQuestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user === null) {
    if (typeof window !== "undefined") {
      navigate("/login");
    }
    return null;
  }

  const ALLOWED_ROLES = ["instructor", "admin", "superadmin"];
  const isInstructor = ALLOWED_ROLES.includes(user.role ?? "");

  return (
    <div
      className={`min-h-screen bg-background p-6 flex flex-col items-center ${
        isInstructor ? "px-4 lg:px-8" : "justify-start"
      }`}
    >
      <div
        className={`w-full ${isInstructor ? "max-w-[1800px]" : "max-w-4xl"}`}
      >
        <Button
          variant="outline"
          className="mb-8 gap-2"
          onClick={() => navigate("/dashboard?tab=play")}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>

        {isInstructor ? <InstructorClassroomView /> : <StudentClassroomView />}
      </div>
    </div>
  );
}
