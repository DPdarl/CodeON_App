import { useState, useEffect } from "react";
import { supabase } from "~/utils/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Search, Download, Loader2, Filter } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { exportToCSV } from "~/utils/exportHelper";
import { toast } from "sonner";

const SECTIONS = ["All Sections", "BSIS", "BSCS", "BSAIS", "ACT"];

interface Classroom {
  id: string;
  name: string;
  academic_year: string;
}

export function UserReportTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("All Sections");

  // New filters
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomFilter, setClassroomFilter] = useState("all");
  const [schoolYearFilter, setSchoolYearFilter] = useState("all");

  // Derived: unique academic years from classrooms
  const schoolYears = [
    "all",
    ...Array.from(new Set(classrooms.map((c) => c.academic_year).filter(Boolean))).sort().reverse(),
  ];

  useEffect(() => {
    fetchClassrooms();
    fetchStudentProgress();
  }, []);

  const fetchClassrooms = async () => {
    const { data, error } = await supabase
      .from("classrooms")
      .select("id, name, academic_year")
      .order("name");
    if (!error && data) {
      setClassrooms(data as Classroom[]);
    }
  };

  const fetchStudentProgress = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "user")
      .order("display_name");

    if (error) {
      toast.error("Failed to load reports");
    } else {
      // Fetch core lesson IDs to filter out side quests from completed_chapters
      const { data: coreLessonsData } = await supabase
        .from("lessons")
        .select("id")
        .eq("is_core_node", true);
      const coreLessonIds = new Set(coreLessonsData?.map((l: any) => l.id) || []);

      const TOTAL_ADVENTURE_CHAPTERS = 10;

      const enhancedData = data.map((s) => {
        const filteredChapters = (s.completed_chapters || []).filter((id: string) =>
          coreLessonIds.size === 0 || coreLessonIds.has(id),
        );
        const completedCount = filteredChapters.length;
        const calculatedAdventureProgress = Math.min(
          100,
          Math.round((completedCount / TOTAL_ADVENTURE_CHAPTERS) * 100),
        );

        return {
          ...s,
          adventure_progress:
            s.settings?.adventure_progress ?? calculatedAdventureProgress,
          mp_wins: s.stats?.mp_wins || 0,
          challenge_stars: s.stars || s.stats?.stars || 0,
        };
      });
      setStudents(enhancedData || []);
    }
    setLoading(false);
  };

  // Classroom name helper (moved up so it can be used in handleExport)
  const getClassroomName = (id: string | null | undefined) => {
    if (!id) return "—";
    return classrooms.find((c) => c.id === id)?.name ?? "—";
  };

  const handleExport = () => {
    const exportData = filteredStudents.map((s) => ({
      "Student ID": s.student_id,
      Name: s.display_name,
      Email: s.email || "",
      Section: s.section,
      Classroom: getClassroomName(s.classroom_id),
      Level: Math.floor((s.xp || 0) / 1000) + 1,
      "Total XP": s.xp || 0,
      "Adventure Progress (%)": `${s.adventure_progress}%`,
      Multiplayer: "Coming Soon",
      "Challenge Stars": s.challenge_stars,
    }));

    const classroomLabel =
      classroomFilter === "all"
        ? "All_Classrooms"
        : (classrooms.find((c) => c.id === classroomFilter)?.name ?? classroomFilter).replace(/\s+/g, "_");

    const yearLabel = schoolYearFilter === "all" ? "All_Years" : schoolYearFilter.replace(/\s+/g, "_");

    exportToCSV(exportData, `Student_Report_${classroomLabel}_${yearLabel}`);
    toast.success("Report downloaded successfully");
  };

  // ─── Filter Logic ────────────────────────────────────────────────────────────
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSection =
      sectionFilter === "All Sections" || s.section === sectionFilter;

    const matchesClassroom =
      classroomFilter === "all" || s.classroom_id === classroomFilter;

    // Match school year via the classroom's academic_year
    const studentClassroom = classrooms.find((c) => c.id === s.classroom_id);
    const matchesSchoolYear =
      schoolYearFilter === "all" ||
      (studentClassroom?.academic_year === schoolYearFilter);

    return matchesSearch && matchesSection && matchesClassroom && matchesSchoolYear;
  });



  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Student Progress Report</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={loading || filteredStudents.length === 0}
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 mt-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search student name or ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Classroom Filter */}
          <div className="w-full md:w-52">
            <Select value={classroomFilter} onValueChange={setClassroomFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="All Classrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classrooms</SelectItem>
                {classrooms.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Filter */}
          <div className="w-full md:w-44">
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* School Year Filter */}
          <div className="w-full md:w-44">
            <Select value={schoolYearFilter} onValueChange={setSchoolYearFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="All School Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All School Years</SelectItem>
                {schoolYears.slice(1).map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter summary badge */}
        {(classroomFilter !== "all" || sectionFilter !== "All Sections" || schoolYearFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mt-2">
            {classroomFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Classroom: {getClassroomName(classroomFilter)}
                <button
                  className="ml-1 text-gray-400 hover:text-gray-600"
                  onClick={() => setClassroomFilter("all")}
                >
                  ×
                </button>
              </Badge>
            )}
            {sectionFilter !== "All Sections" && (
              <Badge variant="secondary" className="gap-1">
                Section: {sectionFilter}
                <button
                  className="ml-1 text-gray-400 hover:text-gray-600"
                  onClick={() => setSectionFilter("All Sections")}
                >
                  ×
                </button>
              </Badge>
            )}
            {schoolYearFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Year: {schoolYearFilter}
                <button
                  className="ml-1 text-gray-400 hover:text-gray-600"
                  onClick={() => setSchoolYearFilter("all")}
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Classroom</th>
                  <th className="p-3">Level / XP</th>
                  <th className="p-3">Adventure</th>
                  <th className="p-3">Multiplayer</th>
                  <th className="p-3">Challenges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="p-3">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {s.display_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.student_id} • {s.section}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {s.email || "—"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {getClassroomName(s.classroom_id)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          Lvl {Math.floor((s.xp || 0) / 1000) + 1}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.xp?.toLocaleString()} XP
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[80px]">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${s.adventure_progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">
                            {s.adventure_progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 italic"
                        >
                          Coming Soon
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-medium">
                          ★ {s.challenge_stars}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin mx-auto" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed">
              No records found.
            </div>
          ) : (
            filteredStudents.map((s) => (
              <div
                key={s.id}
                className="p-4 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {s.display_name}
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      {s.student_id} • {s.section}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {getClassroomName(s.classroom_id)}
                    </div>
                    <div className="text-xs font-mono text-gray-400 mt-0.5 truncate">
                      {s.email || ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      Lvl {Math.floor((s.xp || 0) / 1000) + 1}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.xp?.toLocaleString()} XP
                    </div>
                  </div>
                </div>

                {/* Vertical Stats */}
                <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  {/* Adventure */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Adventure</span>
                      <span className="font-medium">
                        {s.adventure_progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${s.adventure_progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* MP & Stars */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 flex items-center justify-between border border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Multiplayer
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase italic">
                        Soon
                      </span>
                    </div>
                    <div className="flex-1 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-2 flex items-center justify-between border border-yellow-100 dark:border-yellow-900/30">
                      <span className="text-xs text-yellow-700 dark:text-yellow-500">
                        Stars
                      </span>
                      <span className="font-bold text-yellow-700 dark:text-yellow-500">
                        {s.challenge_stars}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
