import { Redirect } from 'expo-router';

import { NotesIndexScreen } from './(tabs)/notas';
import { useAuthStore } from '../store/authStore';

export default function Index() {
  const userId = useAuthStore((state) => state.user?.uid);

  if (userId) {
    return <Redirect href="/(tabs)/notas" />;
  }

  return <NotesIndexScreen isPublicView />;
}
