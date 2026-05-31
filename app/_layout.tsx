import { useEffect } from 'react';
import { router, Stack, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthStore } from '../store/authStore';
import { useNotesStore } from '../store/notesStore';

export default function RootLayout() {
  const userId = useAuthStore((state) => state.user?.uid);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const fetchNotes = useNotesStore((state) => state.fetchNotes);
  const listenToAuth = useAuthStore((state) => state.listenToAuth);
  const segments = useSegments();

  useEffect(() => {
    const cleanup = listenToAuth();

    return cleanup;
  }, [listenToAuth]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes, userId]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const firstSegment = segments[0];
    const isPrivateRoute = firstSegment === '(tabs)' || firstSegment === 'nueva-nota';
    const isAuthRoute = firstSegment === 'login' || firstSegment === 'registro';
    const isRootRoute = firstSegment === undefined;

    if (!userId && isPrivateRoute) {
      router.replace('/');
      return;
    }

    if (userId && (isAuthRoute || isRootRoute)) {
      router.replace('/(tabs)/notas');
    }
  }, [isAuthLoading, segments, userId]);

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ headerShown: false }} />
        <Stack.Screen
          name="nueva-nota"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
