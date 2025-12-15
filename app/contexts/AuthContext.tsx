// app/contexts/AuthContext.tsx
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
  settings?: {
    theme?: "light" | "dark" | "system";
    reduceMotion?: boolean;
    highContrast?: boolean;
    soundEnabled?: boolean;
  };
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
        } catch (e) {
          console.error(e);
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!user);
  const userIdRef = useRef<string | null>(user?.uid || null);

  useEffect(() => {
    userIdRef.current = user?.uid || null;
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else if (user === null && !loading) {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  }, [user, loading]);

  const mapUserFromDB = useCallback(
    (dbUser: any): UserData => ({
      uid: dbUser.id,
      email: dbUser.email,
      studentId: dbUser.student_id,
      section: dbUser.section,
      displayName: dbUser.display_name || "Coder",
      photoURL: dbUser.photo_url,
      avatarConfig: dbUser.avatar_config,
      isOnboarded: dbUser.is_onboarded || false,
      settings: dbUser.settings,
      xp: dbUser.xp,
      level: dbUser.level,
      streaks: dbUser.streaks,
      coins: dbUser.coins,
      hearts: dbUser.hearts,
      streakFreezes: dbUser.streak_freezes || 0,
      hints: dbUser.hints || 0,
      ownedCosmetics: dbUser.owned_cosmetics || [],
      inventory: dbUser.inventory || [],
      trophies: dbUser.trophies,
      league: dbUser.league,
      joinedAt: dbUser.joined_at,
      role: dbUser.role,
      activeDates: dbUser.active_dates || [],
      badges: dbUser.badges || [],
      googleBound: !!dbUser.google_provider_id,
    }),
    []
  );

  // --- FIX: RESTORED MAPPING LOGIC ---
  const mapUserToDB = useCallback((appUser: Partial<UserData>) => {
    const dbData: any = { ...appUser };

    // 1. Map camelCase to snake_case for DB
    if (appUser.isOnboarded !== undefined) {
      dbData.is_onboarded = appUser.isOnboarded;
      delete dbData.isOnboarded;
    }
    if (appUser.displayName !== undefined) {
      dbData.display_name = appUser.displayName;
      delete dbData.displayName;
    }
    if (appUser.photoURL !== undefined) {
      dbData.photo_url = appUser.photoURL;
      delete dbData.photoURL;
    }
    if (appUser.avatarConfig !== undefined) {
      dbData.avatar_config = appUser.avatarConfig;
      delete dbData.avatarConfig;
    }
    if (appUser.streakFreezes !== undefined) {
      dbData.streak_freezes = appUser.streakFreezes;
      delete dbData.streakFreezes;
    }
    if (appUser.ownedCosmetics !== undefined) {
      dbData.owned_cosmetics = appUser.ownedCosmetics;
      delete dbData.ownedCosmetics;
    }
    if (appUser.activeDates !== undefined) {
      dbData.active_dates = appUser.activeDates;
      delete dbData.activeDates;
    }
    if (appUser.section !== undefined) {
      dbData.section = appUser.section;
      delete dbData.section;
    }

    // 2. Remove fields that don't exist in DB or are read-only
    if (dbData.uid) delete dbData.uid;
    delete dbData.googleBound;
    delete dbData.studentId;

    return dbData;
  }, []);

  const fetchUserData = useCallback(
    async (authUser: User, forceLoading = false) => {
      if (forceLoading) setLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (data) {
          const { data: identities } = await supabase.auth.getUser();
          const isGoogleBound = identities.user?.identities?.some(
            (id) => id.provider === "google"
          );

          const mappedUser = mapUserFromDB(data);
          mappedUser.googleBound = isGoogleBound;
          setUser(mappedUser);
        } else {
          console.error(
            "User authenticated but no record found in public.users"
          );
          await supabase.auth.signOut();
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        if (forceLoading) setLoading(false);
      }
    },
    [mapUserFromDB]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const hasCache = !!user;
        fetchUserData(session.user, !hasCache);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        localStorage.removeItem(USER_CACHE_KEY);
        setLoading(false);
        return;
      }
      if (session?.user) {
        await fetchUserData(session.user, false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- ACTIONS ---

  const syncUser = useCallback((data: UserData) => {
    setUser(data);
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<UserData>) => {
      if (!userIdRef.current) throw new Error("No user is signed in");

      // 1. Optimistic Update
      setUser((prev) => {
        if (!prev) return null;
        const updated = { ...prev, ...data };
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });

      // 2. DB Update
      const dbUpdates = mapUserToDB(data);

      const { error } = await supabase
        .from("users")
        .update(dbUpdates)
        .eq("id", userIdRef.current);

      if (error) {
        console.error("DB Update Failed:", error.message);
        throw error;
      }
    },
    [mapUserToDB]
  );

  const loginWithStudentId = useCallback(
    async (studentId: string, p: string) => {
      setLoading(true);
      try {
        const { data: userRecord, error: findError } = await supabase
          .from("users")
          .select("email")
          .eq("student_id", studentId)
          .single();

        if (findError || !userRecord) {
          throw new Error("Student ID not found.");
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: userRecord.email,
          password: p,
        });

        if (error) throw error;
      } catch (err) {
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setLoading(true);
    localStorage.removeItem(USER_CACHE_KEY);
    await supabase.auth.signOut();
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setLoading(false);
      throw error;
    }
    return false;
  }, []);

  const linkGoogleAccount = useCallback(async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard?linked=true",
      },
    });
    if (error) throw error;
  }, []);

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
    [
      user,
      loading,
      loginWithStudentId,
      logout,
      signInWithGoogle,
      linkGoogleAccount,
      updateProfile,
      syncUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth error");
  return context;
}
