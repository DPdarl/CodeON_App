// app/hooks/usePendingRequests.ts
import { useState, useEffect } from "react";
import { supabase } from "~/utils/supabase";
import { useAuth } from "~/contexts/AuthContext";

const STAFF_ROLES = ["superadmin", "admin", "instructor"];

export function usePendingRequests() {
  const { user } = useAuth();
  const [hasPendingRequests, setHasPendingRequests] = useState(false);

  useEffect(() => {
    // Only fetch if the user is staff (admin/instructor)
    if (!user || !STAFF_ROLES.includes(user.role || "")) return;

    const checkPending = async () => {
      const { count } = await supabase
        .from("account_requests")
        .select("id", { count: "exact", head: true })
        .eq("is_approved", false);
      setHasPendingRequests((count ?? 0) > 0);
    };

    checkPending();

    // Also subscribe to real-time changes so the dot appears/disappears instantly
    const channel = supabase
      .channel("pending_requests_notif")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "account_requests" },
        () => checkPending(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.uid, user?.role]);

  return { hasPendingRequests };
}
