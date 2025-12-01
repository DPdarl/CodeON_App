// app/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateProfileAuth,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import app from "~/lib/firebase";

const auth = getAuth(app);
const db = getFirestore(app);

// Updated UserData interface with Role
export interface UserData extends User {
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
  role?: "superadmin" | "admin" | "user"; // New Role Field
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
  updateProfile: (data: {
    displayName?: string;
    photoURL?: string;
    avatarConfig?: any;
    settings?: UserData["settings"];
    xp?: number;
    level?: number;
    coins?: number;
    role?: "superadmin" | "admin" | "user"; // Allow updating role
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to generate default data for ANY new user
  const getDefaultUserData = (
    firebaseUser: User,
    displayNameOverride?: string
  ) => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: displayNameOverride || firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    // --- Stats ---
    xp: 0,
    level: 1,
    streaks: 0,
    coins: 0,
    hearts: 5,
    trophies: 0,
    league: "Novice",
    // --- Meta ---
    joinedAt: new Date().toISOString(),
    role: "user", // Default Role
    // --- Settings ---
    settings: {
      theme: "system",
      reduceMotion: false,
      highContrast: false,
      soundEnabled: true,
    },
    avatarConfig: {
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

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);

        // Real-time listener for user data
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              setUser({ ...firebaseUser, ...docSnap.data() } as UserData);
            } else {
              // Create doc if missing (e.g. first Google login)
              const newUser = getDefaultUserData(firebaseUser);
              await setDoc(userDocRef, newUser, { merge: true });
              setUser({ ...firebaseUser, ...newUser } as UserData);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Firestore Listener Error:", error);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const updateProfile = async (data: {
    displayName?: string;
    photoURL?: string;
    avatarConfig?: any;
    settings?: UserData["settings"];
    xp?: number;
    level?: number;
    coins?: number;
    role?: "superadmin" | "admin" | "user";
  }) => {
    if (!user) throw new Error("No user is signed in");

    const {
      displayName,
      photoURL,
      avatarConfig,
      settings,
      xp,
      level,
      coins,
      role,
    } = data;
    const userDocRef = doc(db, "users", user.uid);

    let firestoreData: any = {};
    let authData: any = {};

    if (displayName) {
      firestoreData.displayName = displayName;
      authData.displayName = displayName;
    }
    if (photoURL) {
      firestoreData.photoURL = photoURL;
      authData.photoURL = photoURL;
    }
    if (avatarConfig) firestoreData.avatarConfig = avatarConfig;
    if (settings) firestoreData.settings = settings;
    if (xp !== undefined) firestoreData.xp = xp;
    if (level !== undefined) firestoreData.level = level;
    if (coins !== undefined) firestoreData.coins = coins;
    if (role !== undefined) firestoreData.role = role;

    if (Object.keys(authData).length > 0) {
      await updateProfileAuth(user, authData);
    }

    if (Object.keys(firestoreData).length > 0) {
      await setDoc(userDocRef, firestoreData, { merge: true });
    }
  };

  const signup = async (e: string, p: string, n: string) => {
    setLoading(true);
    const res = await createUserWithEmailAndPassword(auth, e, p);

    // 1. Update Auth Profile
    await updateProfileAuth(res.user, { displayName: n });

    // 2. Explicitly update Firestore with default data (role: 'user')
    const newUser = getDefaultUserData(res.user, n);
    const userDocRef = doc(db, "users", res.user.uid);
    await setDoc(userDocRef, newUser, { merge: true });
  };

  const login = async (e: string, p: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, e, p);
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const info = getAdditionalUserInfo(result);
    return info?.isNewUser ?? false;
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
