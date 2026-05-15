import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { fontSizes, spacing } from '../../../constants/theme';
import { EmptyState } from '../../../components/ui/EmptyState';
import { GlassPanel } from '../../../components/ui/GlassPanel';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { useNotesStore } from '../../../store/notesStore';
import type { IdeaNote } from '../../../types';

const SAMPLE_IDEAS: IdeaNote[] = [
  { id: 'sample-idea-1', type: 'idea', title: 'Modo enfoque', summary: 'Bloquear distracciones y arrancar sesiones cortas de trabajo.', tags: ['#productividad', '#timer'], createdAt: '2026-05-10T09:30:00.000Z', updatedAt: '2026-05-12T09:30:00.000Z' },
  { id: 'sample-idea-2', type: 'idea', title: 'Resumen con IA', summary: 'Resumir apuntes técnicos al final del día con un tono de estudio.', tags: ['#ia', '#notas'], createdAt: '2026-05-10T11:20:00.000Z', updatedAt: '2026-05-11T11:20:00.000Z' },
  { id: 'sample-idea-3', type: 'idea', title: 'Vista sprint', summary: 'Agrupar tareas y entregas DAM en una vista semanal compacta.', tags: ['#dam', '#proyecto'], createdAt: '2026-05-10T18:45:00.000Z', updatedAt: '2026-05-11T18:45:00.000Z' },
];

export default function IdeasIndexScreen() {
  const ideas = useNotesStore((state) => state.ideas);
  const ideaSource = ideas.length > 0 ? ideas : SAMPLE_IDEAS;
  const featuredIdea = ideas.length > 0 ? ideas[0] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={['rgba(34, 211, 238, 0.16)', 'rgba(34, 211, 238, 0)']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.orb, styles.orbPrimary]} />
        <LinearGradient colors={['rgba(167, 139, 250, 0.16)', 'rgba(167, 139, 250, 0)']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.orb, styles.orbSecondary]} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SectionHeader
            eyebrow="Ideas"
            title="Guarda lo que podrías construir"
            subtitle="Funcionalidades, mejoras y conceptos para tus proyectos."
          />

          <Pressable onPress={() => router.push(`/(tabs)/ideas/${featuredIdea?.id ?? 'sample-featured-idea'}`)} style={({ pressed }) => [styles.cardPressable, pressed ? styles.cardPressablePressed : null]}>
            <GlassPanel glow style={styles.featuredCard} contentStyle={styles.featuredContent}>
              <Text style={styles.sectionEyebrow}>Idea destacada</Text>
              <Text style={styles.featuredTitle}>{featuredIdea?.title ?? 'Flow Analytics'}</Text>
              <Text style={styles.featuredDescription}>
                {featuredIdea?.summary ?? 'Medir tiempo, ritmo y progreso semanal del usuario.'}
              </Text>
            </GlassPanel>
          </Pressable>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title="Explorar ideas"
              subtitle="Conceptos rápidos para seguir construyendo sin perder impulso."
            />
            {ideaSource.length > 0 ? (
              <View style={styles.ideasGrid}>
                {ideaSource.slice(0, 3).map((idea) => (
                  <Pressable key={idea.id} onPress={() => router.push(`/(tabs)/ideas/${idea.id}`)} style={({ pressed }) => [styles.cardPressable, pressed ? styles.cardPressablePressed : null]}>
                    <GlassPanel style={styles.ideaCard} contentStyle={styles.ideaCardContent}>
                      <Text style={styles.ideaTitle}>{idea.title}</Text>
                      <Text numberOfLines={2} style={styles.ideaSummary}>
                        {idea.summary}
                      </Text>
                      <View style={styles.tagsWrap}>
                        {(idea.tags ?? []).map((tag) => (
                          <View key={tag} style={styles.tagChip}>
                            <Text style={styles.tagChipText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </GlassPanel>
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState
                title="Todavía no hay ideas"
                description="Guarda conceptos, mejoras o nuevas funciones para que el producto siga creciendo."
              />
            )}
          </View>
        </ScrollView>

        <Pressable accessibilityLabel="Crear nueva idea" onPress={() => router.push('/nueva-nota')} style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}>
          <LinearGradient colors={['#6366F1', '#22D3EE']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.fabGradient}>
            <Text style={styles.fabLabel}>+</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070A12' },
  container: { flex: 1, backgroundColor: '#070A12' },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 140, gap: spacing.xl },
  orb: { position: 'absolute', borderRadius: 999 },
  orbPrimary: { top: -40, right: -20, width: 220, height: 220 },
  orbSecondary: { top: 300, left: -80, width: 220, height: 220 },
  cardPressable: { borderRadius: 30 },
  cardPressablePressed: { opacity: 0.94 },
  featuredCard: { borderRadius: 30 },
  featuredContent: { gap: spacing.md },
  sectionEyebrow: { fontSize: fontSizes.sm, fontWeight: '700', color: '#C7D5F0', letterSpacing: 0.4 },
  featuredTitle: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.8, color: '#F8FAFF' },
  featuredDescription: { fontSize: fontSizes.md, lineHeight: 24, color: '#95A6C4', maxWidth: 300 },
  sectionBlock: { gap: spacing.md },
  ideasGrid: { gap: spacing.md },
  ideaCard: { padding: spacing.lg, borderRadius: 24 },
  ideaCardContent: { gap: spacing.md },
  ideaTitle: { fontSize: fontSizes.lg, fontWeight: '600', color: '#F8FAFF' },
  ideaSummary: { fontSize: fontSizes.sm, lineHeight: 22, color: '#95A6C4' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tagChip: { borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, backgroundColor: 'rgba(103, 232, 249, 0.08)', borderWidth: 1, borderColor: 'rgba(103, 232, 249, 0.14)' },
  tagChipText: { fontSize: fontSizes.xs, fontWeight: '600', color: '#CFE7FF' },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, width: 68, height: 68, borderRadius: 34, overflow: 'hidden', shadowColor: '#4F46E5', shadowOpacity: 0.28, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  fabPressed: { opacity: 0.94, transform: [{ scale: 0.98 }] },
  fabGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 34 },
  fabLabel: { fontSize: 32, lineHeight: 34, fontWeight: '300', color: '#F8FAFF' },
});
