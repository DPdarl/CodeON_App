import { useState } from "react";
import { supabase } from "~/utils/supabase";
import { useAuth } from "~/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { KeyRound, Loader2, School, Users, Lock } from "lucide-react";

interface JoinClassroomPromptProps {
  /** Called after successfully joining a classroom */
  onJoined?: (classroomId: string, classroomName: string) => void;
  /** If compact=true, renders as a smaller inline card (e.g. in Profile) */
  compact?: boolean;
}

export function JoinClassroomPrompt({
  onJoined,
  compact = false,
}: JoinClassroomPromptProps) {
  const { user, updateProfile } = useAuth();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Enter a join code.");
      return;
    }
    if (!user?.uid) {
      toast.error("You must be logged in.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Look up classroom by join code
      const { data: classroom, error: lookupError } = await supabase
        .from("classrooms")
        .select("id, name, is_locked")
        .eq("join_code", trimmed)
        .single();

      if (lookupError || !classroom) {
        toast.error("Invalid join code. Please check and try again.");
        return;
      }

      // 2. Check lock
      if (classroom.is_locked) {
        toast.error(
          "This classroom is locked. Ask your instructor to unlock it.",
          {
            icon: "🔒",
            duration: 5000,
          },
        );
        return;
      }

      // 3. Enroll student
      const { error: updateError } = await supabase
        .from("users")
        .update({ classroom_id: classroom.id })
        .eq("id", user.uid);

      if (updateError) throw updateError;

      // 4. Update the local Auth context so the UI reflects the change immediately
      await updateProfile({ classroom_id: classroom.id } as any);

      toast.success(`Welcome to ${classroom.name}! 🎓`, { duration: 4000 });
      setCode("");
      onJoined?.(classroom.id, classroom.name);
    } catch (err: any) {
      toast.error("Failed to join: " + (err.message ?? err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleJoin} className="flex gap-2 items-center">
        <div className="relative flex-1">
          <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-amber-500" />
          <Input
            className="pl-9 font-mono tracking-widest uppercase text-sm"
            placeholder="JOIN CODE"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={isSubmitting}
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !code.trim()}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join"}
        </Button>
      </form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 p-6 text-center max-w-sm mx-auto"
    >
      <div className="mb-4 flex justify-center">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl">
          <School className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">
        Join a Classroom
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Enter the join code your instructor shared to see class-specific quests.
      </p>

      <form onSubmit={handleJoin} className="space-y-3">
        <div className="relative">
          <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-amber-500" />
          <Input
            className="pl-10 text-center font-mono tracking-[0.3em] text-lg uppercase font-bold h-12"
            placeholder="ABC123"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={isSubmitting}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !code.trim()}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Joining…
            </>
          ) : (
            <>
              <Users className="h-4 w-4" /> Join Classroom
            </>
          )}
        </Button>
      </form>

      <div className="mt-4 flex items-center gap-1.5 justify-center text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        Locked classrooms require instructor approval.
      </div>
    </motion.div>
  );
}
