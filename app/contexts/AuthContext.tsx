import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  updateProfile as updateFirebaseProfile,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "~/lib/firebase";

interface UpdateProfileData {
  displayName?: string;
  photoURL?: string;
  avatarConfig?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  updateEmailAddress: (email: string) => Promise<void>;
  updateUserPassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      // Update Firebase profile
      await updateFirebaseProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });

      // Update local state
      setUser({
        ...auth.currentUser,
        displayName: data.displayName || auth.currentUser.displayName,
        photoURL: data.photoURL || auth.currentUser.photoURL,
      } as User);

      // If you want to store additional data like avatarConfig,
      // you would need to save it to your database here
      if (data.avatarConfig) {
        console.log("Saving avatar config to database:", data.avatarConfig);
        // Example: Save to your backend or Firestore
        // await saveUserAvatarConfig(auth.currentUser.uid, data.avatarConfig);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const updateEmailAddress = async (email: string) => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      await updateEmail(auth.currentUser, email);
      // Update local state
      setUser({
        ...auth.currentUser,
        email: email,
      } as User);
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  };

  const updateUserPassword = async (password: string) => {
    if (!auth.currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      await updatePassword(auth.currentUser, password);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    logout,
    updateProfile,
    updateEmailAddress,
    updateUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
