import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db, firebaseConfigError } from '../lib/firebase';
import type { UserProfile } from '../types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  listenToAuth: () => () => void;
  clearAuthError: () => void;
}

let authListenerCleanup: (() => void) | null = null;

function ensureFirebaseReady() {
  if (!auth || !db) {
    throw new Error(
      firebaseConfigError ??
        'Firebase no está configurado correctamente en el frontend.'
    );
  }
}

function formatAuthError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('auth/email-already-in-use')) {
      return 'Ese correo ya está registrado.';
    }

    if (
      error.message.includes('auth/invalid-credential') ||
      error.message.includes('auth/invalid-login-credentials') ||
      error.message.includes('auth/wrong-password') ||
      error.message.includes('auth/user-not-found')
    ) {
      return 'Credenciales no válidas.';
    }

    if (error.message.includes('auth/weak-password')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (error.message.includes('auth/invalid-email')) {
      return 'El correo no tiene un formato válido.';
    }

    return error.message;
  }

  return 'Ha ocurrido un error de autenticación.';
}

async function loadProfile(user: User): Promise<UserProfile> {
  ensureFirebaseReady();

  const snapshot = await getDoc(doc(db!, 'users', user.uid));

  if (!snapshot.exists()) {
    const fallbackProfile: UserProfile = {
      uid: user.uid,
      name: user.displayName ?? 'Usuario',
      email: user.email ?? '',
      createdAt: new Date().toISOString(),
      avatarUrl: null,
    };

    await setDoc(doc(db!, 'users', user.uid), fallbackProfile, { merge: true });
    return fallbackProfile;
  }

  const data = snapshot.data() as Partial<UserProfile>;

  return {
    uid: user.uid,
    name: data.name ?? user.displayName ?? 'Usuario',
    email: data.email ?? user.email ?? '',
    createdAt:
      typeof data.createdAt === 'string'
        ? data.createdAt
        : new Date().toISOString(),
    avatarUrl: data.avatarUrl ?? null,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthLoading: true,
  authError: null,

  clearAuthError: () => set({ authError: null }),

  login: async (email, password) => {
    try {
      ensureFirebaseReady();
      set({ isAuthLoading: true, authError: null });
      await signInWithEmailAndPassword(auth!, email.trim(), password);
    } catch (error) {
      set({
        authError: formatAuthError(error),
        isAuthLoading: false,
      });
      throw error;
    }
  },

  register: async (email, password, name) => {
    try {
      ensureFirebaseReady();
      set({ isAuthLoading: true, authError: null });

      const credential = await createUserWithEmailAndPassword(
        auth!,
        email.trim(),
        password
      );

      const profile: UserProfile = {
        uid: credential.user.uid,
        name: name.trim(),
        email: credential.user.email ?? email.trim(),
        createdAt: new Date().toISOString(),
        avatarUrl: null,
      };

      await updateProfile(credential.user, {
        displayName: profile.name,
      });

      await setDoc(doc(db!, 'users', credential.user.uid), profile, {
        merge: true,
      });

      set({
        user: credential.user,
        profile,
      });
    } catch (error) {
      set({
        authError: formatAuthError(error),
        isAuthLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      ensureFirebaseReady();
      set({ isAuthLoading: true, authError: null });
      await signOut(auth!);
    } catch (error) {
      set({
        authError: formatAuthError(error),
        isAuthLoading: false,
      });
      throw error;
    }
  },

  listenToAuth: () => {
    if (firebaseConfigError) {
      set({
        user: null,
        profile: null,
        authError: firebaseConfigError,
        isAuthLoading: false,
      });

      return () => undefined;
    }

    if (authListenerCleanup) {
      return authListenerCleanup;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      if (!firebaseUser) {
        set({
          user: null,
          profile: null,
          authError: null,
          isAuthLoading: false,
        });
        return;
      }

      try {
        const profile = await loadProfile(firebaseUser);

        set({
          user: firebaseUser,
          profile,
          authError: null,
          isAuthLoading: false,
        });
      } catch (error) {
        set({
          user: firebaseUser,
          profile: null,
          authError: formatAuthError(error),
          isAuthLoading: false,
        });
      }
    });

    authListenerCleanup = () => {
      unsubscribe();
      authListenerCleanup = null;
    };

    return authListenerCleanup;
  },
}));
