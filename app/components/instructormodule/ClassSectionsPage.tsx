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
import { Badge } from "~/components/ui/badge";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  Search,
  GraduationCap,
  BookOpen,
  Zap,
  ChevronRight,
  School,
  User,
  CalendarDays,
  Copy,
  Lock,
  Unlock,
  KeyRound,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Classroom {
  id: string;
  name: string;
  academic_year: string;
  join_code: string;
  is_locked: boolean;
  instructor_id: string;
  created_at: string;
  student_count?: number;
}

interface SectionStudent {
  id: string;
  display_name: string;
  student_id: string;
  email: string;
  xp: number;
  completed_chapters: string[];
}

// Generates a 6-char alphanumeric join code client-side (also mirrored by SQL function)
function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function ClassSectionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const ALLOWED_ROLES = ["instructor", "admin", "superadmin"];
  const isAllowed = user && ALLOWED_ROLES.includes(user.role ?? "");

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState<Classroom | null>(null);

  const emptyForm = {
    name: "",
    join_code: generateJoinCode(),
    academic_year: "2025-2026",
    description: "",
  };
  const [form, setForm] = useState(emptyForm);

  // Roster sheet
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [rosterClassroom, setRosterClassroom] = useState<Classroom | null>(
    null,
  );
  const [rosterStudents, setRosterStudents] = useState<SectionStudent[]>([]);
  const [isRosterLoading, setIsRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState("");

  useEffect(() => {
    if (user && !isAllowed) navigate("/dashboard");
  }, [user, isAllowed, navigate]);

  // ─── FETCH ─────────────────────────────────────────────────────────────────
  const fetchClassrooms = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load classrooms.");
    } else if (data) {
      // Count enrolled students per classroom via classroom_id FK
      const { data: students } = await supabase
        .from("users")
        .select("classroom_id")
        .eq("role", "user");

      const countMap: Record<string, number> = {};
      (students ?? []).forEach((s) => {
        if (s.classroom_id)
          countMap[s.classroom_id] = (countMap[s.classroom_id] ?? 0) + 1;
      });

      setClassrooms(
        data.map((c) => ({ ...c, student_count: countMap[c.id] ?? 0 })),
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAllowed) fetchClassrooms();
  }, [isAllowed]);

  // ─── HANDLERS ──────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("classrooms").insert([
        {
          name: form.name.trim(),
          join_code: form.join_code.toUpperCase(),
          academic_year: form.academic_year.trim() || "2025-2026",
          instructor_id: user?.uid ?? null,
          is_locked: false,
        },
      ]);
      if (error) throw error;
      toast.success(
        `Classroom "${form.name}" created! Join code: ${form.join_code}`,
      );
      setIsCreateOpen(false);
      setForm(emptyForm);
      fetchClassrooms();
    } catch (err: any) {
      toast.error("Failed: " + (err.message ?? err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("classrooms")
        .update({
          name: form.name.trim(),
          academic_year: form.academic_year.trim(),
        })
        .eq("id", selected.id);
      if (error) throw error;
      toast.success("Classroom updated.");
      setIsEditOpen(false);
      fetchClassrooms();
    } catch (err: any) {
      toast.error("Update failed: " + (err.message ?? err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("classrooms")
        .delete()
        .eq("id", selected.id);
      if (error) throw error;
      toast.success("Classroom deleted.");
      setIsDeleteOpen(false);
      fetchClassrooms();
    } catch (err: any) {
      toast.error("Delete failed: " + (err.message ?? err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (classroom: Classroom) => {
    const newLocked = !classroom.is_locked;
    const { error } = await supabase
      .from("classrooms")
      .update({ is_locked: newLocked })
      .eq("id", classroom.id);
    if (error) {
      toast.error("Failed to update lock.");
    } else {
      toast.success(
        newLocked ? "Classroom locked 🔒" : "Classroom unlocked 🔓",
      );
      setClassrooms((prev) =>
        prev.map((c) =>
          c.id === classroom.id ? { ...c, is_locked: newLocked } : c,
        ),
      );
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Join code "${code}" copied!`);
  };

  // ─── ROSTER ────────────────────────────────────────────────────────────────
  const openRoster = async (classroom: Classroom) => {
    setRosterClassroom(classroom);
    setRosterStudents([]);
    setRosterSearch("");
    setIsRosterOpen(true);
    setIsRosterLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, display_name, student_id, email, xp, completed_chapters")
      .eq("role", "user")
      .eq("classroom_id", classroom.id)
      .order("display_name", { ascending: true });

    if (error) toast.error("Failed to load students.");
    else setRosterStudents(data ?? []);
    setIsRosterLoading(false);
  };

  const openCreate = () => {
    setForm({ ...emptyForm, join_code: generateJoinCode() });
    setIsCreateOpen(true);
  };

  // ─── FILTERING ─────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      classrooms.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.join_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.academic_year.includes(searchQuery),
      ),
    [classrooms, searchQuery],
  );

  const filteredRoster = useMemo(
    () =>
      rosterStudents.filter(
        (s) =>
          s.display_name?.toLowerCase().includes(rosterSearch.toLowerCase()) ||
          s.student_id?.toLowerCase().includes(rosterSearch.toLowerCase()),
      ),
    [rosterStudents, rosterSearch],
  );

  if (!user) return null;
  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Access denied.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
            <School className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Classrooms
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Create classrooms, share join codes, and manage student rosters.
            </p>
          </div>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            onClick={fetchClassrooms}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2"
            onClick={openCreate}
          >
            <Plus className="w-4 h-4" />
            New Classroom
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Classrooms",
            value: classrooms.length,
            icon: BookOpen,
            color: "text-indigo-600",
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
          },
          {
            label: "Total Students",
            value: classrooms.reduce((a, c) => a + (c.student_count ?? 0), 0),
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
          {
            label: "Locked",
            value: classrooms.filter((c) => c.is_locked).length,
            icon: Lock,
            color: "text-red-600",
            bg: "bg-red-50 dark:bg-red-900/20",
          },
          {
            label: "Avg. Size",
            value:
              classrooms.length > 0
                ? Math.round(
                    classrooms.reduce((a, c) => a + (c.student_count ?? 0), 0) /
                      classrooms.length,
                  )
                : 0,
            icon: GraduationCap,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TABLE */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">All Classrooms</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, join code, year…"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3">Classroom</th>
                  <th className="px-5 py-3">Join Code</th>
                  <th className="px-5 py-3">Academic Year</th>
                  <th className="px-5 py-3">Students</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <Loader2 className="animate-spin mx-auto h-6 w-6 mb-2" />
                      Loading classrooms…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <School className="mx-auto h-8 w-8 mb-2 text-muted-foreground/40" />
                      {searchQuery
                        ? "No classrooms match."
                        : "No classrooms yet."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((cls) => (
                    <motion.tr
                      key={cls.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-muted/30 cursor-pointer group transition-colors"
                      onClick={() => openRoster(cls)}
                    >
                      <td className="px-5 py-4 font-semibold text-foreground">
                        {cls.name}
                      </td>
                      <td className="px-5 py-4">
                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="font-mono text-xs px-2 py-1 rounded bg-muted font-bold tracking-widest">
                            {cls.join_code}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => copyJoinCode(cls.join_code)}
                            title="Copy join code"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {cls.academic_year}
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                          <Users className="w-4 h-4" /> {cls.student_count ?? 0}
                        </span>
                      </td>
                      <td
                        className="px-5 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 gap-1.5 text-xs font-semibold ${
                            cls.is_locked
                              ? "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          }`}
                          onClick={() => handleToggleLock(cls)}
                        >
                          {cls.is_locked ? (
                            <>
                              <Lock className="h-3.5 w-3.5" /> Locked
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5" /> Open
                            </>
                          )}
                        </Button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelected(cls);
                              setForm({
                                name: cls.name,
                                join_code: cls.join_code,
                                academic_year: cls.academic_year,
                                description: "",
                              });
                              setIsEditOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => {
                              setSelected(cls);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-border">
            {isLoading ? (
              <div className="py-10 text-center text-muted-foreground">
                <Loader2 className="animate-spin mx-auto mb-2" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <School className="mx-auto h-8 w-8 mb-2 text-muted-foreground/40" />
                {searchQuery ? "No classrooms match." : "No classrooms yet."}
              </div>
            ) : (
              filtered.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/30 active:bg-muted/50"
                  onClick={() => openRoster(cls)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {cls.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted font-bold tracking-widest">
                        {cls.join_code}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {cls.academic_year}
                      </span>
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3" /> {cls.student_count ?? 0}
                      </span>
                      {cls.is_locked && (
                        <span className="text-[10px] text-red-500">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleLock(cls)}
                    >
                      {cls.is_locked ? (
                        <Lock className="h-4 w-4 text-red-500" />
                      ) : (
                        <Unlock className="h-4 w-4 text-emerald-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyJoinCode(cls.join_code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => {
                        setSelected(cls);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" /> Create Classroom
            </DialogTitle>
            <DialogDescription>
              Share the join code with students so they can enroll.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>
                Classroom Name <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                placeholder="e.g. BSIT 2-A"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Join Code
              </Label>
              <div className="flex gap-2">
                <Input
                  value={form.join_code}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      join_code: e.target.value.toUpperCase().slice(0, 8),
                    })
                  }
                  className="font-mono tracking-widest font-bold"
                  maxLength={8}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      join_code: generateJoinCode(),
                    }))
                  }
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Students enter this code to join. Click{" "}
                <RefreshCw className="inline h-3 w-3" /> to regenerate.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input
                placeholder="2025-2026"
                value={form.academic_year}
                onChange={(e) =>
                  setForm({ ...form, academic_year: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Create Classroom"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-indigo-500" /> Edit Classroom
            </DialogTitle>
            <DialogDescription>
              Join code cannot be changed after creation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label>
                Classroom Name <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Join Code</Label>
              <Input
                value={form.join_code}
                disabled
                className="font-mono tracking-widest bg-muted text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input
                value={form.academic_year}
                onChange={(e) =>
                  setForm({ ...form, academic_year: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Classroom?
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-1">
              <p>
                Permanently delete <strong>{selected?.name}</strong>?
              </p>
              {(selected?.student_count ?? 0) > 0 && (
                <p className="text-amber-600 font-medium">
                  ⚠️ {selected?.student_count} student
                  {selected?.student_count === 1 ? " is" : "s are"} enrolled.
                  Their <code>classroom_id</code> will be set to NULL
                  automatically (CASCADE SET NULL).
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ROSTER SHEET */}
      <Sheet open={isRosterOpen} onOpenChange={setIsRosterOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle>{rosterClassroom?.name ?? "Roster"}</SheetTitle>
                <SheetDescription className="flex items-center gap-2 mt-0.5">
                  <button
                    className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-bold tracking-widest flex items-center gap-1 hover:bg-muted/80"
                    onClick={() =>
                      rosterClassroom && copyJoinCode(rosterClassroom.join_code)
                    }
                  >
                    <KeyRound className="h-3 w-3" />
                    {rosterClassroom?.join_code}
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  </button>
                  {rosterClassroom?.is_locked && (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  )}
                </SheetDescription>
              </div>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 text-sm"
                placeholder="Search name or ID…"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
              />
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isRosterLoading ? (
              <div className="py-16 text-center text-muted-foreground">
                <Loader2 className="animate-spin mx-auto mb-2 h-6 w-6" />{" "}
                Loading students…
              </div>
            ) : filteredRoster.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                {rosterSearch
                  ? "No students match."
                  : "No students enrolled yet."}
                {!rosterSearch && (
                  <p className="text-xs mt-1">
                    Share join code{" "}
                    <span className="font-mono font-bold">
                      {rosterClassroom?.join_code}
                    </span>{" "}
                    with students.
                  </p>
                )}
              </div>
            ) : (
              <AnimatePresence>
                {filteredRoster.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center gap-3 px-6 py-3.5 border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {student.display_name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {student.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {student.student_id}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-blue-600 font-bold justify-end">
                        <Zap className="w-3 h-3 fill-blue-500" />
                        {student.xp ?? 0} XP
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {Array.isArray(student.completed_chapters)
                          ? student.completed_chapters.length
                          : 0}{" "}
                        ch.
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          {!isRosterLoading && (
            <div className="px-6 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
              {filteredRoster.length} student
              {filteredRoster.length !== 1 ? "s" : ""}
              {rosterSearch ? " found" : " enrolled"}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
