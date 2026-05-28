import { Alert, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { fontSizes, spacing } from '../../../constants/theme';
import { useNotesStore } from '../../../store/notesStore';

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const checklists = useNotesStore((state) => state.checklists);
  const deleteChecklist = useNotesStore((state) => state.deleteChecklist);
  const error = useNotesStore((state) => state.error);
  const checklist = checklists.find((entry) => entry.id === id);

  const confirmDelete = () => {
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      return Promise.resolve(globalThis.confirm('Esta acción borrará la checklist del store.'));
    }

    return new Promise<boolean>((resolve) => {
      Alert.alert('Eliminar tarea', 'Esta acción borrará la checklist del store.', [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ]);
    });
  };

  const handleDelete = async () => {
    if (!checklist || !checklists.find((entry) => entry.id === id)) {
      router.back();
      return;
    }

    const confirmed = await confirmDelete();

    if (!confirmed) {
      return;
    }

    const deleted = await deleteChecklist(checklist.id);

    if (deleted) {
      router.back();
      return;
    }

    Alert.alert(
      'No se pudo eliminar',
      useNotesStore.getState().error ?? error ?? 'Inténtalo de nuevo en unos segundos.'
    );
  };

  if (!checklist) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonLabel}>← Volver</Text>
          </Pressable>
          <Text style={styles.title}>Checklist no encontrada</Text>
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
          <Text style={styles.eyebrow}>Tarea</Text>
          <Text style={styles.title}>{checklist.title}</Text>
          <View style={styles.itemsColumn}>
            {checklist.items.map((item) => (
              <Text key={item.id} style={styles.itemRow}>
                {item.completed ? '✓' : '○'} {item.label}
              </Text>
            ))}
          </View>
          <Text style={styles.dateLabel}>Actualizado: {formatDate(checklist.updatedAt)}</Text>
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
  itemsColumn: { gap: spacing.sm },
  itemRow: { fontSize: fontSizes.md, lineHeight: 24, color: '#95A6C4' },
  dateLabel: { fontSize: fontSizes.sm, color: '#7B8BA8' },
  deleteButton: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.20)', backgroundColor: 'rgba(127, 29, 29, 0.20)', paddingVertical: spacing.md, alignItems: 'center' },
  deleteButtonText: { fontSize: fontSizes.md, fontWeight: '700', color: '#FCA5A5' },
});
