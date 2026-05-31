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
  updateAvatarUrl: (avatarUrl: string | null) => Promise<void>;
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
  isAuthLoading: false,
  authError: null,

  clearAuthError: () => set({ authError: null }),

  login: async (email, password) => {
    console.log('login start');
    try {
      ensureFirebaseReady();
      set({ authError: null });

      const normalizedEmail = email.trim();
      const normalizedPassword = password.trim();

      if (!normalizedEmail || !normalizedPassword) {
        throw new Error('Debes introducir correo y contraseña.');
      }

      const credential = await signInWithEmailAndPassword(
        auth!,
        normalizedEmail,
        normalizedPassword
      );

      const profile = await loadProfile(credential.user);

      set({
        user: credential.user,
        profile,
        authError: null,
      });

      console.log('login success');
    } catch (error) {
      console.log('login error', error);
      if (error && typeof error === 'object') {
        console.log(
          'Firebase auth error code:',
          'code' in error ? error.code : undefined
        );
        console.log(
          'Firebase auth error message:',
          'message' in error ? error.message : undefined
        );
      }
      set({
        authError: formatAuthError(error),
      });
      throw error;
    } finally {
      console.log('login finally');
    }
  },

  register: async (email, password, name) => {
    try {
      ensureFirebaseReady();
      set({ authError: null });

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
        authError: null,
      });
    } catch (error) {
      if (error && typeof error === 'object') {
        console.log(
          'Firebase auth error code:',
          'code' in error ? error.code : undefined
        );
        console.log(
          'Firebase auth error message:',
          'message' in error ? error.message : undefined
        );
      }
      set({
        authError: formatAuthError(error),
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      ensureFirebaseReady();
      set({ authError: null });
      await signOut(auth!);
      set({
        user: null,
        profile: null,
      });
    } catch (error) {
      set({
        authError: formatAuthError(error),
      });
      throw error;
    }
  },

  updateAvatarUrl: async (avatarUrl) => {
    try {
      ensureFirebaseReady();
      const currentUser = auth!.currentUser;

      set({ authError: null });

      if (!currentUser) {
        throw new Error('No hay una sesión activa.');
      }

      const normalizedAvatarUrl = avatarUrl?.trim() || null;

      await setDoc(
        doc(db!, 'users', currentUser.uid),
        {
          avatarUrl: normalizedAvatarUrl,
        },
        { merge: true }
      );

      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              avatarUrl: normalizedAvatarUrl,
            }
          : state.profile,
        authError: null,
      }));
    } catch (error) {
      set({
        authError: formatAuthError(error),
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

    set({ isAuthLoading: true, authError: null });

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      console.log('listenToAuth change', firebaseUser ? firebaseUser.uid : null);
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
    }, (error) => {
      console.log('listenToAuth error', error);
      set({
        user: null,
        profile: null,
        authError: formatAuthError(error),
        isAuthLoading: false,
      });
    });

    authListenerCleanup = () => {
      unsubscribe();
      authListenerCleanup = null;
    };

    return authListenerCleanup;
  },
}));
