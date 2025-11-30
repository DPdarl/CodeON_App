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
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore"; // Import onSnapshot
import app from "~/lib/firebase";

const auth = getAuth(app);
const db = getFirestore(app);

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
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const getDefaultUserData = (
    firebaseUser: User,
    displayNameOverride?: string
  ) => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: displayNameOverride || firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    xp: 0,
    level: 1,
    streaks: 0,
    coins: 0,
    hearts: 5,
    trophies: 0,
    league: "Novice",
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
      // 1. Unsubscribe from previous user listener if it exists
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);

        // 2. Set up Real-time Listener
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              // Real-time update
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
  }) => {
    if (!user) throw new Error("No user is signed in");

    const { displayName, photoURL, avatarConfig, settings, xp, level, coins } =
      data;
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

    if (Object.keys(authData).length > 0) {
      await updateProfileAuth(user, authData);
    }

    if (Object.keys(firestoreData).length > 0) {
      await setDoc(userDocRef, firestoreData, { merge: true });
    }
    // No need to manually setUser here; the onSnapshot listener will handle it!
  };

  const signup = async (e: string, p: string, n: string) => {
    setLoading(true);
    const res = await createUserWithEmailAndPassword(auth, e, p);
    await updateProfileAuth(res.user, { displayName: n });
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
