import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { fontSizes, spacing } from '../../../constants/theme';
import { EmptyState } from '../../../components/ui/EmptyState';
import { GlassPanel } from '../../../components/ui/GlassPanel';
import { ProgressCard } from '../../../components/ui/ProgressCard';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { useNotesStore } from '../../../store/notesStore';
import type { ChecklistItem, ChecklistNote } from '../../../types';

const SAMPLE_CHECKLISTS: ChecklistNote[] = [
  {
    id: 'sample-checklist-1',
    type: 'checklist',
    title: 'Corregir navegación Expo Router',
    items: [
      { id: '1', label: 'Revisar layout', completed: true },
      { id: '2', label: 'Ocultar rutas dinámicas', completed: true },
      { id: '3', label: 'Probar iPhone', completed: true },
      { id: '4', label: 'Limpiar warnings', completed: false },
    ],
    createdAt: '2026-05-10T09:30:00.000Z',
    updatedAt: '2026-05-12T09:30:00.000Z',
  },
  {
    id: 'sample-checklist-2',
    type: 'checklist',
    title: 'Preparar documentación',
    items: [
      { id: '1', label: 'Arquitectura', completed: true },
      { id: '2', label: 'Store', completed: true },
      { id: '3', label: 'Router', completed: true },
      { id: '4', label: 'Pantallas', completed: true },
      { id: '5', label: 'Flujos', completed: true },
      { id: '6', label: 'Diagramas', completed: false },
      { id: '7', label: 'QA final', completed: false },
    ],
    createdAt: '2026-05-10T11:20:00.000Z',
    updatedAt: '2026-05-11T11:20:00.000Z',
  },
  {
    id: 'sample-checklist-3',
    type: 'checklist',
    title: 'Pulir interfaz principal',
    items: [
      { id: '1', label: 'Espaciado', completed: true },
      { id: '2', label: 'Contraste', completed: true },
      { id: '3', label: 'Microcopy', completed: false },
      { id: '4', label: 'Animaciones', completed: false },
      { id: '5', label: 'QA visual', completed: false },
    ],
    createdAt: '2026-05-10T18:45:00.000Z',
    updatedAt: '2026-05-11T18:45:00.000Z',
  },
];

export default function ChecklistsIndexScreen() {
  const checklists = useNotesStore((state) => state.checklists);
  const toggleChecklistItem = useNotesStore((state) => state.toggleChecklistItem);
  const [sampleChecklists, setSampleChecklists] = useState<ChecklistNote[]>(SAMPLE_CHECKLISTS);
  const previousProgressRef = useRef<Record<string, number>>({});
  const visibleChecklists = (checklists.length > 0 ? checklists : sampleChecklists).slice(0, 3);
  const summary = useMemo(() => {
    const totalItems = visibleChecklists.reduce(
      (acc, checklist) => acc + checklist.items.length,
      0
    );
    const completedItems = visibleChecklists.reduce(
      (acc, checklist) =>
        acc + checklist.items.filter((item) => item.completed).length,
      0
    );

    return {
      totalItems,
      completedItems,
      progress: totalItems > 0 ? completedItems / totalItems : 0,
    };
  }, [visibleChecklists]);
  const completedChecklistCount = useMemo(
    () =>
      visibleChecklists.filter(
        (checklist) =>
          checklist.items.length > 0 &&
          checklist.items.every((item) => item.completed)
      ).length,
    [visibleChecklists]
  );

  useEffect(() => {
    if (checklists.length > 0) {
      setSampleChecklists(SAMPLE_CHECKLISTS);
    }
  }, [checklists.length]);

  useEffect(() => {
    visibleChecklists.forEach((checklist) => {
      const total = checklist.items.length;
      const completed = checklist.items.filter((item) => item.completed).length;
      const progress = total > 0 ? completed / total : 0;
      const previousProgress = previousProgressRef.current[checklist.id] ?? 0;

      if (progress === 1 && previousProgress < 1) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      previousProgressRef.current[checklist.id] = progress;
    });
  }, [visibleChecklists]);

  const handleToggleItem = async (checklistId: string, itemId: string) => {
    if (checklists.length > 0) {
      toggleChecklistItem(checklistId, itemId);
    } else {
      setSampleChecklists((current) =>
        current.map((checklist) =>
          checklist.id !== checklistId
            ? checklist
            : {
                ...checklist,
                updatedAt: new Date().toISOString(),
                items: checklist.items.map((item) =>
                  item.id === itemId
                    ? { ...item, completed: !item.completed }
                    : item
                ),
              }
        )
      );
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={['rgba(59, 130, 246, 0.18)', 'rgba(59, 130, 246, 0)']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.orb, styles.orbPrimary]} />
        <LinearGradient colors={['rgba(167, 139, 250, 0.16)', 'rgba(167, 139, 250, 0)']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.orb, styles.orbSecondary]} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SectionHeader
            eyebrow="Tareas"
            title="Controla tus entregas"
            subtitle="Divide tus proyectos DAM en pasos claros."
          />

          <ProgressCard
            eyebrow="Pendientes de hoy"
            hint="progreso diario"
            value={`${summary.totalItems - summary.completedItems} tareas`}
            detail={`${summary.completedItems}/${summary.totalItems} completadas · ${Math.round(summary.progress * 100)}%`}
            progress={summary.progress}
          >
            <View style={styles.summaryBadgesRow}>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeValue}>{completedChecklistCount}</Text>
                <Text style={styles.summaryBadgeLabel}>checklists completadas hoy</Text>
              </View>
              <View style={styles.summaryBadge}>
                <Text style={styles.summaryBadgeValue}>4 días</Text>
                <Text style={styles.summaryBadgeLabel}>racha de productividad</Text>
              </View>
            </View>
          </ProgressCard>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title="Checklists activas"
              subtitle="Pasos concretos para avanzar sin perder el foco."
            />
            {visibleChecklists.length > 0 ? (
              <View style={styles.cardsColumn}>
                {visibleChecklists.map((checklist) => {
                  const completed = checklist.items.filter((item) => item.completed).length;
                  const total = checklist.items.length;
                  const progress = total > 0 ? completed / total : 0;
                  const tag = resolveChecklistTag(checklist.title);

                  return (
                    <GlassPanel key={checklist.id} style={styles.checklistCard} contentStyle={styles.cardContent}>
                      <Pressable
                        onPress={() => router.push(`/(tabs)/checklists/${checklist.id}`)}
                        style={({ pressed }) => [styles.cardPressable, pressed ? styles.cardPressablePressed : null]}
                      >
                        <View style={styles.cardTopRow}>
                          <Text style={styles.checklistTitle}>{checklist.title}</Text>
                          <View style={styles.tagChip}>
                            <Text style={styles.tagChipText}>{tag}</Text>
                          </View>
                        </View>
                        <View style={styles.progressMetaRow}>
                          <Text style={styles.checklistMeta}>
                            {completed}/{total} tareas completadas
                          </Text>
                          <Text style={styles.checklistPercent}>{Math.round(progress * 100)}%</Text>
                        </View>
                        <ChecklistProgressBar progress={progress} />
                      </Pressable>

                      {progress === 1 ? (
                        <ChecklistCompletionBanner title={checklist.title} />
                      ) : null}

                      <View style={styles.itemsColumn}>
                        {checklist.items.map((item) => (
                          <ChecklistItemRow
                            key={item.id}
                            checklistId={checklist.id}
                            item={item}
                            onToggle={handleToggleItem}
                          />
                        ))}
                      </View>
                    </GlassPanel>
                  );
                })}
              </View>
            ) : (
              <EmptyState
                title="Todavía no hay tareas"
                description="Crea una checklist para dividir tu siguiente entrega técnica en pasos claros."
              />
            )}
          </View>
        </ScrollView>

        <Pressable accessibilityLabel="Crear nueva tarea" onPress={() => router.push('/nueva-nota')} style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}>
          <LinearGradient colors={['#6366F1', '#22D3EE']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.fabGradient}>
            <Text style={styles.fabLabel}>+</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function resolveChecklistTag(title: string) {
  let tag = 'Checklist';
  if (title.toLowerCase().includes('react')) {
    tag = 'React Native';
  } else if (title.toLowerCase().includes('document')) {
    tag = 'DAM';
  } else if (title.toLowerCase().includes('interfaz')) {
    tag = 'UI/UX';
  }
  return tag;
}

type ChecklistItemRowProps = {
  checklistId: string;
  item: ChecklistItem;
  onToggle: (checklistId: string, itemId: string) => void;
};

function ChecklistItemRow({
  checklistId,
  item,
  onToggle,
}: ChecklistItemRowProps) {
  const progressAnim = useRef(new Animated.Value(item.completed ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: item.completed ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [item.completed, progressAnim]);

  const borderColor = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(148, 163, 184, 0.16)', 'rgba(103, 232, 249, 0.34)'],
  });

  const backgroundColor = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(148, 163, 184, 0.03)', 'rgba(103, 232, 249, 0.10)'],
  });

  const textColor = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D5E0F4', '#8DB8C7'],
  });

  return (
    <Pressable onPress={() => onToggle(checklistId, item.id)}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.itemRow,
            { borderColor, backgroundColor, opacity: pressed ? 0.86 : 1 },
          ]}
        >
          <Animated.View style={[styles.checkbox, { borderColor, backgroundColor }]}>
            {item.completed ? <View style={styles.checkboxInner} /> : null}
          </Animated.View>
          <Animated.Text
            style={[
              styles.itemLabel,
              { color: textColor },
              item.completed ? styles.itemLabelCompleted : null,
            ]}
          >
            {item.label}
          </Animated.Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

function ChecklistProgressBar({ progress }: { progress: number }) {
  const widthAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  const animatedWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.cardProgressTrack}>
      <Animated.View style={[styles.cardProgressFillWrap, { width: animatedWidth }]}>
        <LinearGradient
          colors={['#67E8F9', '#60A5FA', '#A78BFA']}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={styles.cardProgressFill}
        />
      </Animated.View>
    </View>
  );
}

function ChecklistCompletionBanner({ title }: { title: string }) {
  const bannerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bannerAnim]);

  return (
    <Animated.View
      style={[
        styles.completionBanner,
        {
          opacity: bannerAnim,
          transform: [
            {
              translateY: bannerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
            {
              scale: bannerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.completionIconWrap}>
        <Text style={styles.completionIcon}>✓</Text>
      </View>
      <View style={styles.completionCopy}>
        <Text style={styles.completionTitle}>Checklist completada ✨</Text>
        <Text style={styles.completionSubtitle}>
          Buen trabajo. Has terminado todas las tareas de {title}.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070A12' },
  container: { flex: 1, backgroundColor: '#070A12' },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 140, gap: spacing.xl },
  orb: { position: 'absolute', borderRadius: 999 },
  orbPrimary: { top: -40, right: -30, width: 240, height: 240 },
  orbSecondary: { top: 280, left: -80, width: 210, height: 210 },
  summaryBadgesRow: { flexDirection: 'row', gap: spacing.sm },
  summaryBadge: {
    flex: 1,
    minHeight: 72,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: 'rgba(148, 163, 184, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.10)',
    gap: 6,
  },
  summaryBadgeValue: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  summaryBadgeLabel: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
    color: '#8FA2C1',
  },
  sectionBlock: { gap: spacing.md },
  cardsColumn: { gap: spacing.md },
  cardPressable: { borderRadius: 20 },
  cardPressablePressed: { opacity: 0.94 },
  checklistCard: { padding: spacing.lg, borderRadius: 24 },
  cardContent: { gap: spacing.md },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  checklistTitle: { flex: 1, fontSize: fontSizes.md, fontWeight: '600', color: '#F8FAFF' },
  progressMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  checklistMeta: { fontSize: fontSizes.sm, color: '#95A6C4' },
  checklistPercent: { fontSize: fontSizes.sm, fontWeight: '700', color: '#D8F6FF' },
  tagChip: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, backgroundColor: 'rgba(103, 232, 249, 0.08)', borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.14)' },
  tagChipText: { fontSize: fontSizes.xs, fontWeight: '600', color: '#CFE7FF' },
  cardProgressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    overflow: 'hidden',
    shadowColor: '#67E8F9',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardProgressFillWrap: { height: '100%' },
  cardProgressFill: { height: '100%', borderRadius: 999 },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: 'rgba(103, 232, 249, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.18)',
    shadowColor: '#67E8F9',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  completionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 22, 0.76)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.22)',
  },
  completionIcon: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
    color: '#67E8F9',
  },
  completionCopy: { flex: 1, gap: 4 },
  completionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  completionSubtitle: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
    color: '#BEE9F5',
  },
  itemsColumn: { gap: spacing.sm, marginTop: spacing.xs },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#67E8F9',
  },
  itemLabel: {
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 21,
    fontWeight: '500',
  },
  itemLabelCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, width: 68, height: 68, borderRadius: 34, overflow: 'hidden', shadowColor: '#4F46E5', shadowOpacity: 0.28, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  fabPressed: { opacity: 0.94, transform: [{ scale: 0.98 }] },
  fabGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 34 },
  fabLabel: { fontSize: 32, lineHeight: 34, fontWeight: '300', color: '#F8FAFF' },
});
