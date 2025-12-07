// app/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
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
  role?: "superadmin" | "admin" | "user";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for delay
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// CACHE KEY
const USER_CACHE_KEY = "codeon_user_cache";

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1. Initialize State from LocalStorage if available (Instant Load)
  const [user, setUser] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(USER_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(!user); // Only show loading if no cache
  const userIdRef = useRef<string | null>(user?.uid || null);

  useEffect(() => {
    userIdRef.current = user?.uid || null;
    // Update cache whenever user changes
    if (user) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
    } else if (user === null && !loading) {
      localStorage.removeItem(USER_CACHE_KEY);
    }
  }, [user, loading]);

  // --- Mappers ---
  const mapUserFromDB = (dbUser: any): UserData => ({
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
  });

  const mapUserToDB = (appUser: Partial<UserData>) => {
    const dbData: any = { ...appUser };
    // Remove app-specific fields before saving to DB
    if (appUser.activeDates !== undefined) {
      dbData.active_dates = appUser.activeDates;
      delete appUser.activeDates;
    }
    if (appUser.badges !== undefined) {
      dbData.badges = appUser.badges;
      delete appUser.badges;
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
    if (appUser.uid !== undefined) delete dbData.uid;
    return dbData;
  };

  const getDefaultUserData = (authUser: User, nameOverride?: string) => ({
    id: authUser.id,
    email: authUser.email,
    display_name: nameOverride || authUser.user_metadata?.full_name || "Coder",
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
  });

  const fetchUserData = async (authUser: User, forceLoading = false) => {
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
        // Update Cache Immediately
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(mappedUser));
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      if (forceLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // If we have cached data, don't show loading spinner, just refresh in background
        const hasCache = !!user;
        fetchUserData(session.user, !hasCache);
      } else {
        setLoading(false);
      }
    });

    // 2. Event Listener
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

        // If IDs differ, it's a real login change -> clear cache & load fresh
        if (currentId !== newId) {
          setUser(null); // Clear old user state first
          await fetchUserData(session.user, true);
        } else {
          // Same user (refresh/focus) -> Silent background update
          await fetchUserData(session.user, false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- SMART UPDATE PROFILE ---
  const updateProfile = async (data: Partial<UserData>) => {
    if (!user) throw new Error("No user is signed in");

    // 1. Optimistic Update: Update UI & Cache IMMEDIATELY
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updatedUser));

    // 2. Prepare DB Updates
    const dbUpdates = mapUserToDB(data);

    // 3. Robust Retry Loop (Solves the "Connection Cut" save issue)
    let attempt = 0;
    const maxRetries = 5; // Try harder
    let success = false;

    // Retry loop handles momentary disconnections
    while (attempt < maxRetries && !success) {
      try {
        const { error } = await supabase
          .from("users")
          .update(dbUpdates)
          .eq("id", user.uid);

        if (error) throw error;
        success = true;
      } catch (error) {
        attempt++;
        console.warn(`Profile save attempt ${attempt} failed. Retrying...`);
        // Exponential backoff: wait 1s, 2s, 4s...
        await wait(1000 * attempt);
      }
    }

    if (!success) {
      console.error("Final save failed. Data might be out of sync.");
      // Optional: You could revert state here or show a toast "Save failed, retrying later"
      // But keeping the optimistic state is usually better UX for minor glitches.
      throw new Error("Connection failed. Please check internet.");
    }
  };

  const signup = async (e: string, p: string, n: string) => {
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
  };

  const login = async (e: string, p: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: e,
      password: p,
    });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem(USER_CACHE_KEY);
    await supabase.auth.signOut();
  };

  const signInWithGoogle = async (): Promise<boolean> => {
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        signInWithGoogle,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth error");
  return context;
}
