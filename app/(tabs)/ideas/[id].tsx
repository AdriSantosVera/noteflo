import { useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { fontSizes, spacing } from '../../../constants/theme';
import {
  buildReminderDate,
  cancelReminder,
  promptOpenSettings,
  REMINDER_PRESETS,
  requestNotificationPermissions,
  scheduleReminder,
} from '../../../lib/notifications';
import { useNotesStore } from '../../../store/notesStore';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ideas = useNotesStore((state) => state.ideas);
  const deleteIdea = useNotesStore((state) => state.deleteIdea);
  const error = useNotesStore((state) => state.error);
  const idea = ideas.find((entry) => entry.id === id);
  const [reminderId, setReminderId] = useState<string | null>(null);

  const handleReminder = () => {
    if (Platform.OS === 'web') return;

    if (reminderId !== null) {
      Alert.alert('Cancelar recordatorio', '¿Quieres cancelar el recordatorio programado?', [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancelar recordatorio',
          style: 'destructive',
          onPress: () => {
            void cancelReminder(reminderId).then(() => setReminderId(null));
          },
        },
      ]);
      return;
    }

    void (async () => {
      const granted = await requestNotificationPermissions();

      if (!granted) {
        promptOpenSettings();
        return;
      }

      Alert.alert(
        'Programar recordatorio',
        `¿Cuándo quieres que te recordemos "${idea?.title ?? 'esta idea'}"?`,
        [
          ...REMINDER_PRESETS.map((preset) => ({
            text: preset.label,
            onPress: () => {
              const triggerDate = buildReminderDate(preset.value);
              void scheduleReminder(idea?.id ?? '', idea?.title ?? 'Idea', triggerDate).then(
                (newId) => {
                  if (newId) {
                    setReminderId(newId);
                    Alert.alert('Recordatorio programado', `Te avisaremos el ${formatDate(triggerDate.toISOString())}.`);
                  }
                }
              );
            },
          })),
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    })();
  };

  const confirmDelete = () => {
    if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
      return Promise.resolve(globalThis.confirm('Esta acción borrará la idea del store.'));
    }

    return new Promise<boolean>((resolve) => {
      Alert.alert('Eliminar idea', 'Esta acción borrará la idea del store.', [
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
    if (!idea || !ideas.find((entry) => entry.id === id)) {
      router.back();
      return;
    }

    const confirmed = await confirmDelete();

    if (!confirmed) {
      return;
    }

    const deleted = await deleteIdea(idea.id);

    if (deleted) {
      router.back();
      return;
    }

    Alert.alert(
      'No se pudo eliminar',
      useNotesStore.getState().error ?? error ?? 'Inténtalo de nuevo en unos segundos.'
    );
  };

  if (!idea) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonLabel}>← Volver</Text>
          </Pressable>
          <Text style={styles.title}>Idea no encontrada</Text>
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
          <Text style={styles.eyebrow}>Idea</Text>
          <Text style={styles.title}>{idea.title}</Text>
          <Text style={styles.content}>{idea.summary}</Text>
          <View style={styles.tagsWrap}>
            {(idea.tags ?? []).map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>
          {idea.location_name ? (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text numberOfLines={1} style={styles.locationText}>{idea.location_name}</Text>
            </View>
          ) : null}
          <Text style={styles.dateLabel}>Actualizado: {formatDate(idea.updatedAt)}</Text>
        </LinearGradient>

        <Pressable
          onPress={handleReminder}
          style={[styles.reminderButton, reminderId !== null ? styles.reminderButtonActive : null]}
        >
          <Text style={styles.reminderButtonText}>
            {reminderId !== null ? '🔔 Recordatorio programado — cancelar' : 'Programar recordatorio'}
          </Text>
        </Pressable>

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
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tagChip: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, backgroundColor: 'rgba(103, 232, 249, 0.08)', borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.14)' },
  tagChipText: { fontSize: fontSizes.xs, fontWeight: '600', color: '#CFE7FF' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  locationIcon: { fontSize: fontSizes.sm },
  locationText: { flex: 1, fontSize: fontSizes.sm, color: '#7FBFD4', fontWeight: '500' },
  dateLabel: { fontSize: fontSizes.sm, color: '#7B8BA8' },
  reminderButton: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.24)', backgroundColor: 'rgba(99, 102, 241, 0.10)', paddingVertical: spacing.md, alignItems: 'center' },
  reminderButtonActive: { borderColor: 'rgba(103, 232, 249, 0.30)', backgroundColor: 'rgba(103, 232, 249, 0.10)' },
  reminderButtonText: { fontSize: fontSizes.sm, fontWeight: '700', color: '#C7D5FF' },
  deleteButton: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.20)', backgroundColor: 'rgba(127, 29, 29, 0.20)', paddingVertical: spacing.md, alignItems: 'center' },
  deleteButtonText: { fontSize: fontSizes.md, fontWeight: '700', color: '#FCA5A5' },
});
