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
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import app from "~/lib/firebase";

const auth = getAuth(app);
const db = getFirestore(app);

// ▼▼▼ 1. UPDATE USER TYPE ▼▼▼
export interface UserData extends User {
  avatarConfig?: any;
  // New Settings Object
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
  signInWithGoogle: () => Promise<void>;
  // Updated signature to accept settings
  updateProfile: (data: {
    displayName?: string;
    photoURL?: string;
    avatarConfig?: any;
    settings?: UserData["settings"]; // Accept settings
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          try {
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              setUser({ ...firebaseUser, ...userDoc.data() } as UserData);
            } else {
              // New user defaults
              const newUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                xp: 0,
                level: 1,
                streaks: 0,
                coins: 0,
                hearts: 5,
                // Default Settings
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
              };
              await setDoc(userDocRef, newUser, { merge: true });
              setUser({ ...firebaseUser, ...newUser } as UserData);
            }
          } catch (firestoreError) {
            console.error("Firestore Error:", firestoreError);
            setUser(firebaseUser as UserData);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- UPDATE PROFILE FUNCTION ---
  const updateProfile = async (data: {
    displayName?: string;
    photoURL?: string;
    avatarConfig?: any;
    settings?: UserData["settings"];
  }) => {
    if (!user) throw new Error("No user is signed in");

    // ▼▼▼ 2. HANDLE SETTINGS SAVE ▼▼▼
    const { displayName, photoURL, avatarConfig, settings } = data;
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
    if (avatarConfig) {
      firestoreData.avatarConfig = avatarConfig;
    }
    // Save settings to Firestore
    if (settings) {
      firestoreData.settings = settings;
    }

    if (Object.keys(authData).length > 0) {
      await updateProfileAuth(user, authData);
    }

    if (Object.keys(firestoreData).length > 0) {
      await setDoc(userDocRef, firestoreData, { merge: true });
    }

    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...firestoreData } as UserData;
    });
  };

  // ... (signup, login, logout, signInWithGoogle remain the same)
  const signup = async (e: string, p: string, n: string) => {
    setLoading(true);
    const res = await createUserWithEmailAndPassword(auth, e, p);
    await updateProfileAuth(res.user, { displayName: n });
  };
  const login = async (e: string, p: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, e, p);
  };
  const logout = async () => {
    setLoading(true);
    await signOut(auth);
  };
  const signInWithGoogle = async () => {
    setLoading(true);
    await signInWithPopup(auth, new GoogleAuthProvider());
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
