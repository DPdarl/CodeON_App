import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";

export interface UserData {
  uid: string;
  email?: string;
  studentId?: string;
  section?: string;
  displayName: string;
  photoURL?: string;
  avatarConfig?: any;
  isOnboarded?: boolean;
  settings?: any;
  xp?: number;
  level?: number;
  streaks?: number;
  coins?: number;
  hearts?: number;
  trophies?: number;
  league?: string;
  joinedAt?: string;
  role?: "superadmin" | "admin" | "user" | "instructor";
  streakFreezes?: number;
  hints?: number;
  ownedCosmetics?: string[];
  inventory?: string[];
  activeDates?: string[];
  badges?: string[];
  googleBound?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  loginWithStudentId: (studentId: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  linkGoogleAccount: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  syncUser: (data: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_CACHE_KEY = "codeon_user_cache";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!user);
  const userIdRef = useRef<string | null>(user?.uid ?? null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // ------------------------
  // Utils
  // ------------------------

  const mapUserFromDB = useCallback(
    (db: any): UserData => ({
      uid: db.id,
      email: db.email,
      studentId: db.student_id,
      section: db.section,
      displayName: db.display_name ?? "Coder",
      photoURL: db.photo_url,
      avatarConfig: db.avatar_config,
      isOnboarded: db.is_onboarded,
      settings: db.settings,
      xp: db.xp,
      level: db.level,
      streaks: db.streaks,
      coins: db.coins,
      hearts: db.hearts,
      trophies: db.trophies,
      league: db.league,
      joinedAt: db.joined_at,
      role: db.role,
      streakFreezes: db.streak_freezes,
      hints: db.hints,
      ownedCosmetics: db.owned_cosmetics ?? [],
      inventory: db.inventory ?? [],
      activeDates: db.active_dates ?? [],
      badges: db.badges ?? [],
      googleBound: !!db.google_provider_id,
    }),
    []
  );

  const mapUserToDB = useCallback((data: Partial<UserData>) => {
    const db: any = { ...data };
    if ("displayName" in db) {
      db.display_name = db.displayName;
      delete db.displayName;
    }
    if ("photoURL" in db) {
      db.photo_url = db.photoURL;
      delete db.photoURL;
    }
    if ("isOnboarded" in db) {
      db.is_onboarded = db.isOnboarded;
      delete db.isOnboarded;
    }
    if ("streakFreezes" in db) {
      db.streak_freezes = db.streakFreezes;
      delete db.streakFreezes;
    }
    if ("ownedCosmetics" in db) {
      db.owned_cosmetics = db.ownedCosmetics;
      delete db.ownedCosmetics;
    }
    if ("activeDates" in db) {
      db.active_dates = db.activeDates;
      delete db.activeDates;
    }
    delete db.uid;
    delete db.studentId;
    delete db.googleBound;
    return db;
  }, []);

  // ------------------------
  // Fetch User
  // ------------------------

  const fetchUserData = useCallback(
    async (authUser: User) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error || !data) {
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      const mapped = mapUserFromDB(data);
      setUser(mapped);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mapped));
    },
    [mapUserFromDB]
  );

  // ------------------------
  // Realtime (Supabase v2)
  // ------------------------

  const setupRealtime = useCallback(() => {
    if (!user?.uid) return;

    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    channelRef.current = supabase
      .channel(`user:${user.uid}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${user.uid}`,
        },
        (payload: { new: any }) => {
          setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...mapUserFromDB(payload.new) };
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      )
      .subscribe();
  }, [user, mapUserFromDB]);

  // ------------------------
  // Visibility Re-sync (Duolingo behavior)
  // ------------------------

  useEffect(() => {
    if (!user) return;

    setupRealtime();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchUserData({ id: user.uid } as User);
        setupRealtime();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      channelRef.current?.unsubscribe();
    };
  }, [user, setupRealtime, fetchUserData]);

  // ------------------------
  // Auth Lifecycle
  // ------------------------

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        fetchUserData(data.session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem(USER_CACHE_KEY);
          setLoading(false);
        }
        if (session?.user) fetchUserData(session.user);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [fetchUserData]);

  // ------------------------
  // Actions
  // ------------------------

  const syncUser = useCallback((data: UserData) => {
    setUser(data);
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<UserData>) => {
      if (!user?.uid) return;
      syncUser({ ...user, ...data });
      await supabase.from("users").update(mapUserToDB(data)).eq("id", user.uid);
    },
    [user, mapUserToDB, syncUser]
  );

  const loginWithStudentId = async (studentId: string, p: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("users")
      .select("email")
      .eq("student_id", studentId)
      .single();

    if (!data?.email) throw new Error("Student ID not found");

    await supabase.auth.signInWithPassword({ email: data.email, password: p });
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem(USER_CACHE_KEY);
    await supabase.auth.signOut();
    setUser(null);
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    return false;
  };

  const linkGoogleAccount = async () => {
    await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard?linked=true",
      },
    });
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithStudentId,
      logout,
      signInWithGoogle,
      linkGoogleAccount,
      updateProfile,
      syncUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
