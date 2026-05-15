import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { fontSizes, spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';
import type { Note } from '../../../types';

const SAMPLE_NOTES: Note[] = [
  {
    id: 'sample-note-1',
    type: 'note',
    title: 'Corregir navegación Expo Router',
    content: 'Ajustar stack, tabs y rutas dinámicas para que el flujo funcione en iPhone.',
    createdAt: '2026-05-10T09:30:00.000Z',
    updatedAt: '2026-05-12T09:30:00.000Z',
  },
  {
    id: 'sample-note-2',
    type: 'note',
    title: 'Documentar Zustand',
    content: 'Explicar cómo separar stores globales de la lógica visual por pantalla.',
    createdAt: '2026-05-10T11:20:00.000Z',
    updatedAt: '2026-05-11T11:20:00.000Z',
  },
];

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const notes = useNotesStore((state) => state.notes);
  const deleteNote = useNotesStore((state) => state.deleteNote);

  const note = notes.find((entry) => entry.id === id) ?? SAMPLE_NOTES.find((entry) => entry.id === id);

  const handleDelete = () => {
    if (!note || !notes.find((entry) => entry.id === id)) {
      router.back();
      return;
    }

    Alert.alert('Eliminar apunte', 'Esta acción borrará la entrada del store.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteNote(note.id);
          router.back();
        },
      },
    ]);
  };

  if (!note) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonLabel}>← Volver</Text>
          </Pressable>
          <Text style={styles.title}>Apunte no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonLabel}>← Volver</Text>
        </Pressable>

        <LinearGradient colors={['rgba(17, 26, 46, 0.96)', 'rgba(9, 14, 24, 0.88)']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.card}>
          <Text style={styles.eyebrow}>Apunte</Text>
          <Text style={styles.title}>{note.title}</Text>
          <Text style={styles.content}>{note.content}</Text>
          <Text style={styles.dateLabel}>Actualizado: {formatDate(note.updatedAt)}</Text>
        </LinearGradient>

        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070A12' },
  container: { padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg, backgroundColor: '#070A12' },
  backButton: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.16)', backgroundColor: 'rgba(15, 23, 42, 0.72)' },
  backButtonLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: '#CFE7FF' },
  card: { borderRadius: 28, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.14)', padding: spacing.xl, gap: spacing.md },
  eyebrow: { fontSize: fontSizes.xs, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: '#8DA1C8' },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.8, color: '#F8FAFF' },
  content: { fontSize: fontSizes.md, lineHeight: 24, color: '#95A6C4' },
  dateLabel: { fontSize: fontSizes.sm, color: '#7B8BA8' },
  deleteButton: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.20)', backgroundColor: 'rgba(127, 29, 29, 0.20)', paddingVertical: spacing.md, alignItems: 'center' },
  deleteButtonText: { fontSize: fontSizes.md, fontWeight: '700', color: '#FCA5A5' },
});
