// app/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
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
  inventory?: string[]; // New Inventory Field
  activeDates?: string[]; // Array of "YYYY-MM-DD" strings
  badges?: string[]; // Array of badge IDs
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // --- HELPER: Map Snake_Case DB -> CamelCase App ---
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
    inventory: dbUser.inventory || [], // Map Inventory
    trophies: dbUser.trophies,
    league: dbUser.league,
    joinedAt: dbUser.joined_at,
    role: dbUser.role,
    activeDates: dbUser.active_dates || [],
    badges: dbUser.badges || [],
  });

  // --- HELPER: Map CamelCase App -> Snake_Case DB ---
  const mapUserToDB = (appUser: Partial<UserData>) => {
    const dbData: any = { ...appUser };

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
    // Ensure inventory is passed through if updated
    // (Supabase handles 'inventory' -> 'inventory' mapping automatically)

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
    inventory: [], // Default empty inventory
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

  const fetchUserData = async (authUser: User) => {
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
        setUser(mapUserFromDB(data));
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchUserData(session.user);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        if (user?.uid !== session.user.id) {
          setLoading(true);
          await fetchUserData(session.user);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (data: Partial<UserData>) => {
    if (!user) throw new Error("No user is signed in");

    const dbUpdates = mapUserToDB(data);

    const { error } = await supabase
      .from("users")
      .update(dbUpdates)
      .eq("id", user.uid);

    if (error) throw error;

    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  // ... (signup, login, logout, signInWithGoogle implementation from previous steps remains the same)
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
      setUser(mapUserFromDB(newUser));
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
