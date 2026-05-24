import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useNotesStore } from '../store/notesStore';

export default function RootLayout() {
  const fetchNotes = useNotesStore((state) => state.fetchNotes);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
