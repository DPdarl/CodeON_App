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

// Updated interface
export interface UserData {
  uid: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  avatarConfig?: any;
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
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signup: (e: string, p: string, n: string) => Promise<void>;
  login: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
  syncUser: (data: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
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
      displayName: dbUser.display_name || "Coder",
      photoURL: dbUser.photo_url,
      avatarConfig: dbUser.avatar_config,
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
    }),
    []
  );

  const mapUserToDB = useCallback((appUser: Partial<UserData>) => {
    const dbData: any = { ...appUser };
    if (appUser.activeDates !== undefined) {
      dbData.active_dates = appUser.activeDates;
      delete dbData.activeDates;
    }
    if (appUser.badges !== undefined) {
      dbData.badges = appUser.badges;
      delete dbData.badges;
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
    if (dbData.uid) delete dbData.uid;
    return dbData;
  }, []);

  const getDefaultUserData = useCallback(
    (authUser: User, nameOverride?: string) => ({
      id: authUser.id,
      email: authUser.email,
      display_name:
        nameOverride || authUser.user_metadata?.full_name || "Coder",
      photo_url: authUser.user_metadata?.avatar_url,
      xp: 0,
      level: 1,
      streaks: 0,
      coins: 0,
      hearts: 5,
      trophies: 0,
      league: "Novice",
      joined_at: new Date().toISOString(),
      role: "user",
      streak_freezes: 0,
      hints: 0,
      inventory: [],
      settings: {
        theme: "system",
        reduceMotion: false,
        highContrast: false,
        soundEnabled: true,
      },
      avatar_config: {
        body: "male",
        hair: "default",
        eyes: "nonchalant",
        mouth: "smile",
        top: "tshirt",
        bottom: "pants",
        shoes: "shoes",
        accessory: "none",
      },
    }),
    []
  );

  const fetchUserData = useCallback(
    async (authUser: User, forceLoading = false) => {
      if (forceLoading) setLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        if (error && error.code === "PGRST116") {
          const newUser = getDefaultUserData(authUser);
          await supabase.from("users").insert([newUser]);
          setUser(mapUserFromDB(newUser));
        } else if (data) {
          const mappedUser = mapUserFromDB(data);
          setUser(mappedUser);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        if (forceLoading) setLoading(false);
      }
    },
    [getDefaultUserData, mapUserFromDB]
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
        const currentId = userIdRef.current;
        const newId = session.user.id;
        if (currentId !== newId) {
          setUser(null);
          await fetchUserData(session.user, true);
        } else {
          await fetchUserData(session.user, false);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- STABLE ACTIONS ---
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
      let attempt = 0;
      const maxRetries = 3;
      let success = false;
      while (attempt < maxRetries && !success) {
        try {
          const { error } = await supabase
            .from("users")
            .update(dbUpdates)
            .eq("id", userIdRef.current);
          if (error) throw error;
          success = true;
        } catch (error) {
          attempt++;
          if (attempt >= maxRetries) throw error;
          await wait(1000 * attempt);
        }
      }
    },
    [mapUserToDB]
  );

  const signup = useCallback(
    async (e: string, p: string, n: string) => {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: e,
        password: p,
        options: { data: { full_name: n } },
      });
      if (error) {
        setLoading(false);
        throw error;
      }
      if (data.user) {
        const newUser = getDefaultUserData(data.user, n);
        await supabase.from("users").insert([newUser]);
        const mapped = mapUserFromDB(newUser);
        setUser(mapped);
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mapped));
      }
      setLoading(false);
    },
    [getDefaultUserData, mapUserFromDB]
  );

  const login = useCallback(async (e: string, p: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: e,
      password: p,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    localStorage.removeItem(USER_CACHE_KEY);
    await supabase.auth.signOut();
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) {
      setLoading(false);
      throw error;
    }
    return false;
  }, []);

  // Memoize the value to prevent unnecessary re-renders in children
  const value = useMemo(
    () => ({
      user,
      loading,
      signup,
      login,
      logout,
      signInWithGoogle,
      updateProfile,
      syncUser,
    }),
    [
      user,
      loading,
      signup,
      login,
      logout,
      signInWithGoogle,
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
