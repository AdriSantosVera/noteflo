import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { fontSizes, spacing } from '../../../constants/theme';
import { EmptyState } from '../../../components/ui/EmptyState';
import { GlassPanel } from '../../../components/ui/GlassPanel';
import { MiniBarChart } from '../../../components/ui/MiniBarChart';
import { MiniCalendar } from '../../../components/ui/MiniCalendar';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { StatCard } from '../../../components/ui/StatCard';
import { useNotesStore } from '../../../store/notesStore';
import type { Note } from '../../../types';

type WeeklyBar = {
  label: string;
  value: number;
  accent?: boolean;
};

type CalendarDay = {
  key: string;
  label: string;
  dateNumber: number;
  isToday?: boolean;
  isActive?: boolean;
};

type CalendarGridDay = {
  key: string;
  value: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isActive: boolean;
};

type MetricCard = {
  id: string;
  title: string;
  value: string;
  detail: string;
  accent: string;
};

type ActivityItem = {
  id: string;
  title: string;
  type: string;
  time: string;
};

type AnalysisCard = {
  id: string;
  title: string;
  value: string;
  detail: string;
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type DistributionItem = {
  id: string;
  label: string;
  percent: number;
  accent: string;
};

type HeatmapItem = {
  label: string;
  level: 1 | 2 | 3 | 4;
};

type HourBar = {
  label: string;
  value: number;
};

type FocusOption = {
  id: string;
  title: string;
  detail: string;
};

type SessionOption = {
  id: string;
  label: string;
  minutes: number;
};

const FOCUS_TOTAL_MINUTES = 240;
const FOCUS_DONE_MINUTES = 155;
const FOCUS_PROGRESS = FOCUS_DONE_MINUTES / FOCUS_TOTAL_MINUTES;

const WEEKLY_DATA: WeeklyBar[] = [
  { label: 'L', value: 48 },
  { label: 'M', value: 62 },
  { label: 'X', value: 54 },
  { label: 'J', value: 82, accent: true },
  { label: 'V', value: 73 },
  { label: 'S', value: 31 },
  { label: 'D', value: 24 },
];

const METRICS: MetricCard[] = [
  { id: 'notes', title: 'Apuntes', value: '12', detail: 'guardados', accent: '#67E8F9' },
  { id: 'tasks', title: 'Tareas', value: '5', detail: 'pendientes', accent: '#60A5FA' },
  { id: 'ideas', title: 'Ideas', value: '8', detail: 'propuestas', accent: '#A78BFA' },
  { id: 'sprint', title: 'Sprint', value: '64%', detail: 'completado', accent: '#22D3EE' },
];

const ACTIVITY_FEED: ActivityItem[] = [
  { id: 'activity-1', title: 'Corregir navegación Expo Router', type: 'Tarea técnica', time: 'Hoy, 9:30' },
  { id: 'activity-2', title: 'Documentar Zustand', type: 'Apunte DAM', time: 'Ayer, 11:20' },
  { id: 'activity-3', title: 'Diseño dashboard', type: 'Idea de interfaz', time: 'Ayer, 18:45' },
];

const ANALYSIS_CARDS: AnalysisCard[] = [
  {
    id: 'focus-level',
    title: 'Nivel de enfoque',
    value: 'Alto',
    detail: 'Mantienes buena continuidad cuando trabajas sobre tareas técnicas.',
    accent: '#67E8F9',
    icon: 'flash-outline',
  },
  {
    id: 'current-pace',
    title: 'Ritmo actual',
    value: 'Constante',
    detail: 'Tu cadencia es estable y no hay caídas bruscas entre bloques.',
    accent: '#60A5FA',
    icon: 'pulse-outline',
  },
  {
    id: 'weekly-trend',
    title: 'Tendencia semanal',
    value: '+18%',
    detail: 'Respecto a la semana pasada, estás dedicando más tiempo útil.',
    accent: '#A78BFA',
    icon: 'trending-up-outline',
  },
  {
    id: 'dominant-work',
    title: 'Trabajo dominante',
    value: 'Desarrollo técnico',
    detail: 'La mayoría de tus sesiones se concentran en resolver y construir.',
    accent: '#22D3EE',
    icon: 'code-slash-outline',
  },
  {
    id: 'improvement',
    title: 'Punto a mejorar',
    value: 'Ideas sin convertir',
    detail: 'Tienes demasiadas ideas todavía sin pasar a tareas accionables.',
    accent: '#F59E0B',
    icon: 'bulb-outline',
  },
];

const DISTRIBUTION_DATA: DistributionItem[] = [
  { id: 'tasks', label: 'Tareas', percent: 45, accent: '#67E8F9' },
  { id: 'notes', label: 'Apuntes', percent: 30, accent: '#60A5FA' },
  { id: 'ideas', label: 'Ideas', percent: 25, accent: '#A78BFA' },
  { id: 'sprint', label: 'Sprint', percent: 64, accent: '#22D3EE' },
];

const INSIGHTS = [
  'Tu productividad aumenta más los miércoles.',
  'Las tareas técnicas tienen mejor tasa de finalización.',
  'Has creado más ideas que tareas esta semana.',
  'Tu ritmo bajó durante el fin de semana.',
];

const HEATMAP_DATA: HeatmapItem[] = [
  { label: 'L', level: 2 },
  { label: 'M', level: 3 },
  { label: 'X', level: 3 },
  { label: 'J', level: 4 },
  { label: 'V', level: 3 },
  { label: 'S', level: 1 },
  { label: 'D', level: 1 },
];

const HOURLY_DATA: HourBar[] = [
  { label: '08', value: 24 },
  { label: '10', value: 52 },
  { label: '12', value: 86 },
  { label: '14', value: 78 },
  { label: '16', value: 82 },
  { label: '18', value: 46 },
  { label: '20', value: 18 },
];

const FOCUS_OPTIONS: FocusOption[] = [
  { id: 'checklist', title: 'Checklist pendiente', detail: 'Resolver pasos pendientes antes de cambiar de contexto.' },
  { id: 'idea', title: 'Idea importante', detail: 'Convertir una idea relevante en una acción concreta.' },
  { id: 'note', title: 'Apunte técnico', detail: 'Ordenar decisiones y conceptos para avanzar con claridad.' },
  { id: 'sprint', title: 'Sprint actual', detail: 'Empujar lo más crítico de la entrega activa.' },
];

const SESSION_OPTIONS: SessionOption[] = [
  { id: '25m', label: '25 min', minutes: 25 },
  { id: '45m', label: '45 min', minutes: 45 },
  { id: '1h', label: '1h', minutes: 60 },
  { id: 'custom', label: 'Personalizado', minutes: 75 },
];

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
  {
    id: 'sample-note-3',
    type: 'note',
    title: 'Diseño dashboard',
    content: 'Definir métricas, jerarquías y sensación premium para NoteFlow Dev.',
    createdAt: '2026-05-10T18:45:00.000Z',
    updatedAt: '2026-05-11T18:45:00.000Z',
  },
];

export default function NotesIndexScreen() {
  const notes = useNotesStore((state) => state.notes);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);
  const [isFocusModalVisible, setIsFocusModalVisible] = useState(false);
  const [selectedFocusId, setSelectedFocusId] = useState(FOCUS_OPTIONS[0].id);
  const [selectedSessionId, setSelectedSessionId] = useState(SESSION_OPTIONS[1].id);
  const [activeFocusSession, setActiveFocusSession] = useState<{
    focusId: string;
    sessionId: string;
    totalSeconds: number;
    remainingSeconds: number;
    isPaused: boolean;
  } | null>(null);
  const [focusSessionOpacity] = useState(() => new Animated.Value(1));
  const noteSource = notes.length > 0 ? notes : SAMPLE_NOTES;
  const recentNotes = noteSource.slice(0, 3);
  const calendarDays = buildCurrentWeek({
    activeIndices: noteSource.length > 0 ? [0, 1, 3, 4, 6] : [1, 2, 4, 5],
  });
  const monthlyCalendar = useMemo(
    () =>
      buildCurrentMonthGrid({
        activeDates: calendarDays
          .filter((day) => day.isActive)
          .map((day) => day.dateNumber),
      }),
    [calendarDays]
  );

  const metrics = METRICS.map((metric) =>
    metric.id === 'notes' && notes.length > 0
      ? { ...metric, value: String(notes.length) }
      : metric
  );
  const focusRemainingMinutes = Math.max(0, FOCUS_TOTAL_MINUTES - FOCUS_DONE_MINUTES);
  const selectedFocus = FOCUS_OPTIONS.find((option) => option.id === selectedFocusId) ?? FOCUS_OPTIONS[0];
  const selectedSession = SESSION_OPTIONS.find((option) => option.id === selectedSessionId) ?? SESSION_OPTIONS[1];
  const activeFocus = activeFocusSession
    ? FOCUS_OPTIONS.find((option) => option.id === activeFocusSession.focusId) ?? null
    : null;
  const activeSession = activeFocusSession
    ? SESSION_OPTIONS.find((option) => option.id === activeFocusSession.sessionId) ?? null
    : null;
  const activeSessionProgress = activeFocusSession
    ? 1 - activeFocusSession.remainingSeconds / activeFocusSession.totalSeconds
    : 0;
  const dominantDistribution = useMemo(
    () =>
      DISTRIBUTION_DATA.reduce((current, item) =>
        item.percent > current.percent ? item : current
      ),
    []
  );

  useEffect(() => {
    if (!activeFocusSession || activeFocusSession.isPaused) {
      return;
    }

    if (activeFocusSession.remainingSeconds <= 0) {
      setActiveFocusSession(null);
      return;
    }

    const timer = setInterval(() => {
      setActiveFocusSession((current) => {
        if (!current || current.isPaused) {
          return current;
        }

        if (current.remainingSeconds <= 1) {
          return null;
        }

        return {
          ...current,
          remainingSeconds: current.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeFocusSession]);

  const handleStartFocus = () => {
    Animated.sequence([
      Animated.timing(focusSessionOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(focusSessionOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveFocusSession({
      focusId: selectedFocusId,
      sessionId: selectedSessionId,
      totalSeconds: selectedSession.minutes * 60,
      remainingSeconds: selectedSession.minutes * 60,
      isPaused: false,
    });
    setIsFocusModalVisible(false);
  };

  const handlePauseFocus = () => {
    setActiveFocusSession((current) =>
      current
        ? {
            ...current,
            isPaused: true,
          }
        : current
    );
  };

  const handleResumeFocus = () => {
    setActiveFocusSession((current) =>
      current
        ? {
            ...current,
            isPaused: false,
          }
        : current
    );
  };

  const handleCancelFocus = () => {
    setActiveFocusSession(null);
  };

  const handleChangeFocus = () => {
    setActiveFocusSession(null);
    setIsFocusModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={['rgba(59, 130, 246, 0.18)', 'rgba(59, 130, 246, 0)']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.orb, styles.orbPrimary]} />
        <LinearGradient colors={['rgba(167, 139, 250, 0.16)', 'rgba(167, 139, 250, 0)']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.orb, styles.orbSecondary]} />
        <LinearGradient colors={['rgba(34, 211, 238, 0.14)', 'rgba(34, 211, 238, 0)']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.orb, styles.orbTertiary]} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SectionHeader
            eyebrow="NoteFlow Dev"
            title="¿Qué quieres construir hoy?"
            subtitle="Organiza apuntes, tareas técnicas, ideas y tu ritmo de trabajo."
          />

          <Pressable
            onPress={() => setIsCalendarVisible(true)}
            style={({ pressed }) => [styles.interactiveCard, pressed ? styles.cardPressablePressed : null]}
          >
            <MiniCalendar days={calendarDays} />
            <View style={styles.interactionHintRow}>
              <Text style={styles.interactionHintText}>Ver calendario</Text>
              <Text style={styles.interactionHintArrow}>→</Text>
            </View>
          </Pressable>

          <View style={styles.interactiveCard}>
            <GlassPanel glow style={styles.focusCard} contentStyle={styles.focusCardContent}>
              <View style={styles.focusHeaderRow}>
                <View style={styles.focusCopy}>
                  <Text style={styles.focusEyebrow}>Plan de enfoque</Text>
                  <Text style={styles.focusTitle}>Organiza mejor tu sesión de hoy</Text>
                </View>
                <View style={styles.focusRingWrap}>
                  <View style={styles.focusRingOuter}>
                    <View style={styles.focusRingInner}>
                      <Text style={styles.focusRingValue}>{Math.round(FOCUS_PROGRESS * 100)}%</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.focusStatsRow}>
                <View style={styles.focusStatCard}>
                  <Text style={styles.focusStatLabel}>Objetivo de hoy</Text>
                  <Text style={styles.focusStatValue}>4h</Text>
                </View>
                <View style={styles.focusStatCard}>
                  <Text style={styles.focusStatLabel}>Tiempo trabajado</Text>
                  <Text style={styles.focusStatValue}>2h 35m</Text>
                </View>
                <View style={styles.focusStatCard}>
                  <Text style={styles.focusStatLabel}>Tiempo restante</Text>
                  <Text style={styles.focusStatValue}>{formatMinutes(focusRemainingMinutes)}</Text>
                </View>
              </View>

              <View style={styles.focusProgressTrack}>
                <LinearGradient
                  colors={['#60A5FA', '#67E8F9', '#A78BFA']}
                  end={{ x: 1, y: 0 }}
                  start={{ x: 0, y: 0 }}
                  style={[styles.focusProgressFill, { width: `${FOCUS_PROGRESS * 100}%` }]}
                />
              </View>

              <Text style={styles.focusRecommendation}>
                Prioriza las tareas pendientes antes de añadir nuevas ideas.
              </Text>

              <Animated.View style={[styles.focusRecommendationPanel, { opacity: focusSessionOpacity }]}>
                <Text style={styles.focusRecommendationTitle}>Enfoque actual</Text>
                <Text style={styles.focusRecommendationTextStrong}>
                  {activeFocus && activeSession
                    ? `${activeFocus.title} · ${activeSession.label}`
                    : 'Todavía no has iniciado una sesión'}
                </Text>
                <Text style={styles.focusRecommendationText}>
                  {activeFocus && activeSession
                    ? `Tiempo restante: ${formatSeconds(activeFocusSession?.remainingSeconds ?? 0)}. ${activeFocusSession?.isPaused ? 'La sesión está pausada.' : 'Mantén el contexto y evita abrir nuevas líneas de trabajo.'}`
                    : `Te faltan ${formatMinutes(focusRemainingMinutes)} para cumplir tu objetivo.`}
                </Text>
                {activeFocusSession ? (
                  <>
                    <View style={styles.focusLiveTrack}>
                      <LinearGradient
                        colors={['#60A5FA', '#67E8F9', '#A78BFA']}
                        end={{ x: 1, y: 0 }}
                        start={{ x: 0, y: 0 }}
                        style={[styles.focusLiveFill, { width: `${activeSessionProgress * 100}%` }]}
                      />
                    </View>
                    <View style={styles.focusControlsRow}>
                      {activeFocusSession.isPaused ? (
                        <Pressable
                          onPress={handleResumeFocus}
                          style={({ pressed }) => [
                            styles.focusControlButton,
                            styles.focusControlPrimary,
                            pressed ? styles.focusControlButtonPressed : null,
                          ]}
                        >
                          <Text style={styles.focusControlPrimaryLabel}>Reanudar</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={handlePauseFocus}
                          style={({ pressed }) => [
                            styles.focusControlButton,
                            styles.focusControlPrimary,
                            pressed ? styles.focusControlButtonPressed : null,
                          ]}
                        >
                          <Text style={styles.focusControlPrimaryLabel}>Pausar</Text>
                        </Pressable>
                      )}
                      <Pressable
                        onPress={handleCancelFocus}
                        style={({ pressed }) => [
                          styles.focusControlButton,
                          pressed ? styles.focusControlButtonPressed : null,
                        ]}
                      >
                        <Text style={styles.focusControlLabel}>Cancelar sesión</Text>
                      </Pressable>
                    </View>
                    <Pressable
                      onPress={handleChangeFocus}
                      style={({ pressed }) => [
                        styles.focusChangeButton,
                        pressed ? styles.focusControlButtonPressed : null,
                      ]}
                    >
                      <Text style={styles.focusChangeLabel}>Cambiar enfoque</Text>
                    </Pressable>
                  </>
                ) : null}
              </Animated.View>

              <View style={styles.interactionHintRow}>
                {activeFocusSession ? (
                  <View style={styles.focusStatusBadge}>
                    <Text style={styles.focusStatusLabel}>
                      {activeFocusSession.isPaused ? 'Sesión pausada' : 'Sesión en marcha'}
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => setIsFocusModalVisible(true)}
                    style={({ pressed }) => [
                      styles.focusActionButton,
                      pressed ? styles.focusActionButtonPressed : null,
                    ]}
                  >
                    <Text style={styles.focusActionLabel}>Iniciar sesión de enfoque</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setIsFocusModalVisible(true)}
                  hitSlop={12}
                  style={({ pressed }) => [styles.focusArrowButton, pressed ? styles.focusArrowButtonPressed : null]}
                >
                  <Text style={styles.interactionHintArrow}>→</Text>
                </Pressable>
              </View>
            </GlassPanel>
          </View>

          <Pressable
            onPress={() => setIsChartVisible(true)}
            style={({ pressed }) => [styles.interactiveCard, pressed ? styles.cardPressablePressed : null]}
          >
            <GlassPanel style={styles.weeklySummaryCard} contentStyle={styles.weeklySummaryContent}>
              <View style={styles.weeklySummaryTopRow}>
                <View style={styles.weeklySummaryCopy}>
                  <Text style={styles.weeklySummaryTitle}>Ritmo semanal</Text>
                  <Text style={styles.weeklySummaryTrend}>+18% esta semana</Text>
                  <Text style={styles.weeklySummaryCaption}>
                    Mejor pico: jueves
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIsChartVisible(true)}
                  style={({ pressed }) => [
                    styles.weeklySummaryCta,
                    pressed ? styles.weeklySummaryCtaPressed : null,
                  ]}
                >
                  <Text style={styles.weeklySummaryCtaLabel}>Ver análisis completo</Text>
                </Pressable>
              </View>

              <MiniBarChart data={WEEKLY_DATA} height={64} />
            </GlassPanel>
          </Pressable>

          <View style={styles.metricsGrid}>
            {metrics.map((metric) => (
              <StatCard
                key={metric.id}
                title={metric.title}
                value={metric.value}
                detail={metric.detail}
                accent={metric.accent}
                style={styles.metricCard}
              />
            ))}
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title="Apuntes recientes"
              subtitle="Accede rápido a lo último que estás organizando."
            />
            {recentNotes.length > 0 ? (
              <View style={styles.notesColumn}>
                {recentNotes.map((note) => (
                  <Pressable
                    key={note.id}
                    onPress={() => router.push(`/(tabs)/notas/${note.id}`)}
                    style={({ pressed }) => [styles.cardPressable, pressed ? styles.cardPressablePressed : null]}
                  >
                    <GlassPanel style={styles.noteCard} contentStyle={styles.noteCardContentWrap}>
                      <Text style={styles.noteCardTitle}>{note.title}</Text>
                      <Text numberOfLines={2} style={styles.noteCardContent}>
                        {note.content}
                      </Text>
                    </GlassPanel>
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState
                title="Todavía no hay apuntes"
                description="Empieza creando una entrada para que tu dashboard empiece a tener contexto real."
              />
            )}
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeader
              title="Último movimiento"
              subtitle="Actividad reciente para mantener el foco sin perder contexto."
            />
            <GlassPanel style={styles.activityPanel} contentStyle={styles.activityPanelContent}>
              {ACTIVITY_FEED.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.activityRow, index < ACTIVITY_FEED.length - 1 ? styles.activityRowBorder : null]}
                >
                  <View style={styles.activityCopy}>
                    <Text style={styles.activityItemTitle}>{item.title}</Text>
                    <Text style={styles.activityItemType}>{item.type}</Text>
                  </View>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
              ))}
            </GlassPanel>
          </View>
        </ScrollView>

        <Pressable accessibilityLabel="Crear nueva nota" onPress={() => router.push('/nueva-nota')} style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}>
          <LinearGradient colors={['#6366F1', '#22D3EE']} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.fabGradient}>
            <Text style={styles.fabLabel}>+</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isCalendarVisible}
        onRequestClose={() => setIsCalendarVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsCalendarVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTopBar}>
              <Pressable
                onPress={() => setIsCalendarVisible(false)}
                style={({ pressed }) => [
                  styles.inlineCloseButton,
                  pressed ? styles.inlineCloseButtonPressed : null,
                ]}
              >
                <Ionicons name="chevron-back" size={16} color="#CFE7FF" />
                <Text style={styles.inlineCloseLabel}>Cerrar</Text>
              </Pressable>
            </View>
            <SectionHeader
              eyebrow="Actividad"
              title="Calendario de productividad"
              subtitle="Resumen semanal y vista compacta del mes actual."
            />

            <GlassPanel style={styles.modalPanel} contentStyle={styles.modalPanelContent}>
              <Text style={styles.modalSectionTitle}>Semana actual</Text>
              <MiniCalendar days={calendarDays} />
            </GlassPanel>

            <GlassPanel style={styles.modalPanel} contentStyle={styles.modalPanelContent}>
              <Text style={styles.modalSectionTitle}>Mes actual</Text>
              <View style={styles.monthHeaderRow}>
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((label) => (
                  <Text key={label} style={styles.monthHeaderLabel}>
                    {label}
                  </Text>
                ))}
              </View>
              <View style={styles.monthGrid}>
                {monthlyCalendar.map((day) => (
                  <View
                    key={day.key}
                    style={[
                      styles.monthCell,
                      !day.isCurrentMonth ? styles.monthCellMuted : null,
                      day.isActive ? styles.monthCellActive : null,
                      day.isToday ? styles.monthCellToday : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthCellText,
                        !day.isCurrentMonth ? styles.monthCellTextMuted : null,
                        day.isToday ? styles.monthCellTextToday : null,
                      ]}
                    >
                      {day.value}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassPanel>

            <GlassPanel style={styles.modalPanel} contentStyle={styles.summaryPanelContent}>
              <Text style={styles.summaryLine}>3 tareas completadas esta semana</Text>
              <Text style={styles.summaryLine}>2 ideas registradas</Text>
            </GlassPanel>

            <Pressable onPress={() => setIsCalendarVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseLabel}>Cerrar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={isChartVisible}
        onRequestClose={() => setIsChartVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <ScrollView
              contentContainerStyle={styles.analysisScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHandle} />
              <View style={styles.modalTopBar}>
                <Pressable
                  onPress={() => setIsChartVisible(false)}
                  style={({ pressed }) => [
                    styles.inlineCloseButton,
                    pressed ? styles.inlineCloseButtonPressed : null,
                  ]}
                >
                  <Ionicons name="close" size={16} color="#CFE7FF" />
                  <Text style={styles.inlineCloseLabel}>Cerrar</Text>
                </Pressable>
              </View>
              <SectionHeader
                eyebrow="Análisis"
                title="Análisis de productividad"
                subtitle="Resumen visual de tu actividad durante los últimos 7 días."
              />

              <View style={styles.analysisCardsGrid}>
                {ANALYSIS_CARDS.map((card) => (
                  <GlassPanel key={card.id} style={styles.analysisCard} contentStyle={styles.analysisCardContent}>
                    <View style={styles.analysisCardTopRow}>
                      <View style={[styles.analysisIconBadge, { borderColor: `${card.accent}33`, backgroundColor: `${card.accent}14` }]}>
                        <Ionicons color={card.accent} name={card.icon} size={18} />
                      </View>
                      <View style={[styles.analysisAccent, { backgroundColor: card.accent }]} />
                    </View>
                    <Text style={styles.analysisCardTitle}>{card.title}</Text>
                    <Text style={styles.analysisCardValue}>{card.value}</Text>
                    <Text style={styles.analysisCardDetail}>{card.detail}</Text>
                  </GlassPanel>
                ))}
              </View>

              <GlassPanel style={styles.modalPanel} contentStyle={styles.chartModalContent}>
                <Text style={styles.modalSectionTitle}>Distribución del trabajo</Text>
                <Text style={styles.analysisSectionIntro}>
                  El trabajo dominante esta semana es {dominantDistribution.label.toLowerCase()} con un {dominantDistribution.percent}% del esfuerzo.
                </Text>
                <View style={styles.distributionGrid}>
                  {DISTRIBUTION_DATA.map((item) => (
                    <View key={item.id} style={styles.distributionCard}>
                      <View style={styles.distributionRingOuter}>
                        <View style={[styles.distributionRingArc, { borderColor: item.accent }]} />
                        <View style={styles.distributionRingInner}>
                          <Text style={styles.distributionPercent}>{item.percent}%</Text>
                        </View>
                      </View>
                      <Text style={styles.distributionLabel}>{item.label}</Text>
                      <View style={styles.distributionMiniTrack}>
                        <View
                          style={[
                            styles.distributionMiniFill,
                            { width: `${item.percent}%`, backgroundColor: item.accent },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
                <Text style={styles.distributionTotal}>Total: 7h 24m</Text>
              </GlassPanel>

              <GlassPanel style={styles.modalPanel} contentStyle={styles.chartModalContent}>
                <Text style={styles.modalSectionTitle}>Actividad semanal</Text>
                <View style={styles.heatmapRow}>
                  {HEATMAP_DATA.map((item) => (
                    <View key={item.label} style={styles.heatmapColumn}>
                      <View
                        style={[
                          styles.heatmapCell,
                          item.level === 1 ? styles.heatmapLevel1 : null,
                          item.level === 2 ? styles.heatmapLevel2 : null,
                          item.level === 3 ? styles.heatmapLevel3 : null,
                          item.level === 4 ? styles.heatmapLevel4 : null,
                        ]}
                      />
                      <Text style={styles.heatmapLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </GlassPanel>

              <GlassPanel style={styles.modalPanel} contentStyle={styles.chartModalContent}>
                <View style={styles.goalHeaderRow}>
                  <Text style={styles.modalSectionTitle}>Ritmo diario</Text>
                  <Text style={styles.dailyPeakLabel}>11:00 - 17:00</Text>
                </View>
                <View style={styles.hourlyChartRow}>
                  {HOURLY_DATA.map((item) => (
                    <View key={item.label} style={styles.hourlyColumn}>
                      <View style={styles.hourlyTrack}>
                        <LinearGradient
                          colors={['#60A5FA', '#67E8F9', '#A78BFA']}
                          end={{ x: 0, y: 0 }}
                          start={{ x: 0, y: 1 }}
                          style={[styles.hourlyFill, { height: `${item.value}%` }]}
                        />
                      </View>
                      <Text style={styles.hourlyLabel}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </GlassPanel>

              <GlassPanel style={styles.modalPanel} contentStyle={styles.chartModalContent}>
                <Text style={styles.modalSectionTitle}>Insights</Text>
                <View style={styles.insightsColumn}>
                  {INSIGHTS.map((insight) => (
                    <View key={insight} style={styles.insightRow}>
                      <View style={styles.insightDot} />
                      <Text style={styles.insightText}>{insight}</Text>
                    </View>
                  ))}
                </View>
              </GlassPanel>

              <GlassPanel style={styles.modalPanel} contentStyle={styles.chartModalContent}>
                <Text style={styles.modalSectionTitle}>Objetivo semanal</Text>
                <View style={styles.goalHeaderRow}>
                  <Text style={styles.goalTitle}>Completar 8 tareas</Text>
                  <Text style={styles.goalValue}>64%</Text>
                </View>
                <Text style={styles.goalHint}>
                  Vas bien encaminado, pero necesitas cerrar dos bloques más para cumplir el objetivo.
                </Text>
                <View style={styles.expandedBarTrack}>
                  <LinearGradient
                    colors={['#60A5FA', '#67E8F9', '#A78BFA']}
                    end={{ x: 1, y: 0 }}
                    start={{ x: 0, y: 0 }}
                    style={[styles.expandedBarFill, { width: '64%' }]}
                  />
                </View>
              </GlassPanel>

              <GlassPanel style={styles.modalPanel} contentStyle={styles.chartModalContent}>
                <Text style={styles.modalSectionTitle}>Resumen técnico</Text>
                {metrics.map((metric) => (
                  <View key={metric.id} style={styles.expandedBarBlock}>
                    <View style={styles.expandedBarHeader}>
                      <Text style={styles.expandedBarTitle}>{metric.title}</Text>
                      <Text style={styles.expandedBarValue}>{metric.value}</Text>
                    </View>
                    <View style={styles.expandedBarTrack}>
                      <View
                        style={[
                          styles.expandedBarFill,
                          {
                            width: `${resolveMetricProgress(metric.value)}%`,
                            backgroundColor: metric.accent,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.expandedBarDetail}>{metric.detail}</Text>
                  </View>
                ))}
              </GlassPanel>

              <Pressable onPress={() => setIsChartVisible(false)} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseLabel}>Cerrar</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={isFocusModalVisible}
        onRequestClose={() => setIsFocusModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTopBar}>
              <Pressable
                onPress={() => setIsFocusModalVisible(false)}
                style={({ pressed }) => [
                  styles.inlineCloseButton,
                  pressed ? styles.inlineCloseButtonPressed : null,
                ]}
              >
                <Ionicons name="chevron-back" size={16} color="#CFE7FF" />
                <Text style={styles.inlineCloseLabel}>Volver</Text>
              </Pressable>
            </View>
            <SectionHeader
              eyebrow="Enfoque"
              title="¿En qué quieres enfocarte?"
              subtitle="Selecciona una prioridad para esta sesión."
            />

            {activeFocus && activeSession ? (
              <GlassPanel style={styles.focusBackgroundPanel} contentStyle={styles.focusBackgroundPanelContent}>
                <Text style={styles.focusBackgroundTitle}>Sesión en curso</Text>
                <Text style={styles.focusBackgroundValue}>
                  {activeFocus.title} · {activeSession.label}
                </Text>
                <Text style={styles.focusBackgroundHint}>
                  {activeFocusSession?.isPaused
                    ? 'La sesión está pausada, pero se mantiene guardada en la tarjeta.'
                    : 'La sesión seguirá ejecutándose en segundo plano.'}
                </Text>
              </GlassPanel>
            ) : null}

            <View style={styles.focusOptionsColumn}>
              {FOCUS_OPTIONS.map((option) => {
                const isActive = option.id === selectedFocusId;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSelectedFocusId(option.id)}
                    style={({ pressed }) => [
                      styles.focusOptionCard,
                      isActive ? styles.focusOptionCardActive : null,
                      pressed ? styles.focusOptionCardPressed : null,
                    ]}
                  >
                    <Text style={[styles.focusOptionTitle, isActive ? styles.focusOptionTitleActive : null]}>
                      {option.title}
                    </Text>
                    <Text style={styles.focusOptionDetail}>{option.detail}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalSectionBlock}>
              <Text style={styles.modalSectionTitle}>Duración de la sesión</Text>
              <View style={styles.sessionOptionsRow}>
                {SESSION_OPTIONS.map((option) => {
                  const isActive = option.id === selectedSessionId;

                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setSelectedSessionId(option.id)}
                      style={({ pressed }) => [
                        styles.sessionChip,
                        isActive ? styles.sessionChipActive : null,
                        pressed ? styles.sessionChipPressed : null,
                      ]}
                    >
                      <Text style={[styles.sessionChipLabel, isActive ? styles.sessionChipLabelActive : null]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Pressable onPress={handleStartFocus} style={styles.modalPrimaryButton}>
              <LinearGradient
                colors={['#6366F1', '#22D3EE']}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={styles.modalPrimaryButtonGradient}
              >
                <Text style={styles.modalPrimaryButtonLabel}>Comenzar enfoque</Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => setIsFocusModalVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseLabel}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#070A12' },
  container: { flex: 1, backgroundColor: '#070A12' },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 140, gap: spacing.xl },
  orb: { position: 'absolute', borderRadius: 999 },
  orbPrimary: { top: -40, right: -30, width: 240, height: 240 },
  orbSecondary: { top: 250, left: -80, width: 210, height: 210 },
  orbTertiary: { bottom: 180, right: 20, width: 180, height: 180 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md },
  metricCard: { width: '47%' },
  sectionBlock: { gap: spacing.md },
  sectionHint: { fontSize: fontSizes.xs, fontWeight: '600', color: '#7B8BA8' },
  interactiveCard: { borderRadius: 28 },
  weeklySummaryCard: {
    padding: spacing.md,
  },
  weeklySummaryContent: {
    gap: spacing.sm,
  },
  weeklySummaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  weeklySummaryCopy: {
    flex: 1,
    gap: 4,
  },
  weeklySummaryTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  weeklySummaryTrend: {
    fontSize: fontSizes.md,
    lineHeight: 22,
    fontWeight: '600',
    color: '#AFC0DD',
  },
  weeklySummaryCaption: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
    color: '#8FA2C1',
  },
  weeklySummaryCta: {
    minHeight: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.16)',
  },
  weeklySummaryCtaPressed: {
    opacity: 0.88,
  },
  weeklySummaryCtaLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#8DD3FF',
  },
  focusCard: {
    padding: spacing.xl,
  },
  focusCardContent: {
    gap: spacing.lg,
  },
  focusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  focusCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  focusEyebrow: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#C7D5F0',
  },
  focusTitle: {
    fontSize: fontSizes.lg,
    lineHeight: 28,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  focusRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusRingOuter: {
    width: 76,
    height: 76,
    borderRadius: 999,
    padding: 5,
    backgroundColor: 'rgba(103, 232, 249, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.22)',
  },
  focusRingInner: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(8, 12, 22, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusRingValue: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  focusStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  focusStatCard: {
    flex: 1,
    borderRadius: 18,
    padding: spacing.md,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.10)',
    gap: 6,
  },
  focusStatLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: '#7B8BA8',
  },
  focusStatValue: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  focusProgressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    overflow: 'hidden',
  },
  focusProgressFill: {
    height: '100%',
    borderRadius: 999,
  },
  focusRecommendation: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#9AB0D0',
  },
  focusRecommendationPanel: {
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: 'rgba(99, 102, 241, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.20)',
    gap: spacing.sm,
  },
  focusRecommendationTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#DCE6FF',
  },
  focusRecommendationTextStrong: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  focusRecommendationText: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#B7C8E5',
  },
  focusLiveTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    overflow: 'hidden',
  },
  focusLiveFill: {
    height: '100%',
    borderRadius: 999,
  },
  focusControlsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  focusControlButton: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
  },
  focusControlPrimary: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: 'rgba(129, 140, 248, 0.24)',
  },
  focusControlButtonPressed: {
    opacity: 0.88,
  },
  focusControlLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#D8E4F8',
    textAlign: 'center',
  },
  focusControlPrimaryLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#F8FAFF',
    textAlign: 'center',
  },
  focusChangeButton: {
    minHeight: 40,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(103, 232, 249, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.18)',
  },
  focusChangeLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#D8F6FF',
  },
  focusActionButton: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.24)',
  },
  focusActionButtonPressed: {
    opacity: 0.9,
  },
  focusActionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  focusArrowButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.14)',
  },
  focusArrowButtonPressed: {
    opacity: 0.88,
  },
  focusStatusBadge: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.20)',
  },
  focusStatusLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#E0E7FF',
  },
  interactionHintRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  interactionHintText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#8DD3FF',
    letterSpacing: 0.3,
  },
  interactionHintArrow: {
    fontSize: fontSizes.md,
    color: '#8DD3FF',
  },
  notesColumn: { gap: spacing.md },
  cardPressable: { borderRadius: 22 },
  cardPressablePressed: { opacity: 0.94 },
  noteCard: { padding: spacing.lg, borderRadius: 22 },
  noteCardContentWrap: { gap: spacing.sm },
  noteCardTitle: { fontSize: fontSizes.md, fontWeight: '600', color: '#F8FAFF' },
  noteCardContent: { fontSize: fontSizes.sm, lineHeight: 22, color: '#95A6C4' },
  activityPanel: { padding: spacing.lg },
  activityPanelContent: {},
  activityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md },
  activityRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(148, 163, 184, 0.10)' },
  activityCopy: { flex: 1, gap: 6 },
  activityItemTitle: { fontSize: fontSizes.md, fontWeight: '600', color: '#F8FAFF' },
  activityItemType: { fontSize: fontSizes.sm, color: '#95A6C4' },
  activityTime: { fontSize: fontSizes.xs, fontWeight: '600', color: '#71809D', paddingTop: 2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 16, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    minHeight: '72%',
    maxHeight: '88%',
    backgroundColor: '#0A0F1C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.14)',
  },
  analysisScrollContent: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.24)',
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  inlineCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.16)',
  },
  inlineCloseButtonPressed: {
    opacity: 0.86,
  },
  inlineCloseLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#CFE7FF',
  },
  modalPanel: {
    padding: spacing.lg,
  },
  modalPanelContent: {
    gap: spacing.md,
  },
  analysisCardsGrid: {
    gap: spacing.md,
  },
  analysisCard: {
    padding: spacing.lg,
  },
  analysisCardContent: {
    gap: spacing.sm,
  },
  analysisCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  analysisAccent: {
    width: 34,
    height: 4,
    borderRadius: 999,
  },
  analysisCardTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#C7D5F0',
  },
  analysisCardValue: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  analysisCardDetail: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#8FA2C1',
  },
  modalSectionBlock: {
    gap: spacing.md,
  },
  modalSectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#D5E0F4',
  },
  analysisSectionIntro: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#8FA2C1',
  },
  distributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  distributionCard: {
    width: '47%',
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: 'rgba(148, 163, 184, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
    alignItems: 'center',
    gap: spacing.sm,
  },
  distributionRingOuter: {
    width: 82,
    height: 82,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 12, 22, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.10)',
  },
  distributionRingArc: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 999,
    borderWidth: 6,
    opacity: 0.95,
  },
  distributionRingInner: {
    width: 58,
    height: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1120',
  },
  distributionPercent: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  distributionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#D7E3F8',
  },
  distributionTotal: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#D7E3F8',
    textAlign: 'right',
  },
  distributionMiniTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.10)',
    overflow: 'hidden',
  },
  distributionMiniFill: {
    height: '100%',
    borderRadius: 999,
  },
  insightsColumn: {
    gap: spacing.md,
  },
  heatmapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heatmapColumn: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  heatmapCell: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  heatmapLevel1: {
    backgroundColor: 'rgba(103, 232, 249, 0.10)',
    borderColor: 'rgba(103, 232, 249, 0.14)',
  },
  heatmapLevel2: {
    backgroundColor: 'rgba(96, 165, 250, 0.18)',
    borderColor: 'rgba(96, 165, 250, 0.22)',
  },
  heatmapLevel3: {
    backgroundColor: 'rgba(167, 139, 250, 0.24)',
    borderColor: 'rgba(167, 139, 250, 0.28)',
  },
  heatmapLevel4: {
    backgroundColor: 'rgba(34, 211, 238, 0.30)',
    borderColor: 'rgba(34, 211, 238, 0.34)',
  },
  heatmapLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#8FA2C1',
  },
  insightRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  insightDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: '#67E8F9',
  },
  insightText: {
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#D0DBEF',
  },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  goalValue: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#67E8F9',
  },
  goalHint: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#8FA2C1',
  },
  dailyPeakLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#67E8F9',
  },
  hourlyChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  hourlyColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  hourlyTrack: {
    width: '100%',
    maxWidth: 28,
    height: 140,
    justifyContent: 'flex-end',
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.10)',
    padding: 3,
    overflow: 'hidden',
  },
  hourlyFill: {
    width: '100%',
    borderRadius: 999,
  },
  hourlyLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#8FA2C1',
  },
  focusOptionsColumn: {
    gap: spacing.md,
  },
  focusBackgroundPanel: {
    padding: spacing.lg,
  },
  focusBackgroundPanelContent: {
    gap: spacing.xs,
  },
  focusBackgroundTitle: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#8DD3FF',
  },
  focusBackgroundValue: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  focusBackgroundHint: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#9AB0D0',
  },
  focusOptionCard: {
    borderRadius: 20,
    padding: spacing.lg,
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.10)',
    gap: spacing.xs,
  },
  focusOptionCardActive: {
    backgroundColor: 'rgba(103, 232, 249, 0.10)',
    borderColor: 'rgba(103, 232, 249, 0.22)',
  },
  focusOptionCardPressed: {
    opacity: 0.9,
  },
  focusOptionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#D7E3F8',
  },
  focusOptionTitleActive: {
    color: '#F8FAFF',
  },
  focusOptionDetail: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
    color: '#8CA0C0',
  },
  sessionOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sessionChip: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.10)',
  },
  sessionChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: 'rgba(129, 140, 248, 0.24)',
  },
  sessionChipPressed: {
    opacity: 0.9,
  },
  sessionChipLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#A7B8D6',
  },
  sessionChipLabelActive: {
    color: '#F8FAFF',
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  monthHeaderLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#70809C',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  monthCell: {
    width: '13.2%',
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  monthCellMuted: {
    opacity: 0.38,
  },
  monthCellActive: {
    backgroundColor: 'rgba(103, 232, 249, 0.10)',
    borderColor: 'rgba(103, 232, 249, 0.18)',
  },
  monthCellToday: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: 'rgba(129, 140, 248, 0.24)',
  },
  monthCellText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  monthCellTextMuted: {
    color: '#66748E',
  },
  monthCellTextToday: {
    color: '#FFFFFF',
  },
  summaryPanelContent: {
    gap: spacing.sm,
  },
  summaryLine: {
    fontSize: fontSizes.md,
    color: '#CFE7FF',
    fontWeight: '600',
  },
  chartModalContent: {
    gap: spacing.lg,
  },
  expandedBarBlock: {
    gap: spacing.sm,
  },
  expandedBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandedBarTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#F8FAFF',
  },
  expandedBarValue: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#CFE7FF',
  },
  expandedBarTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    overflow: 'hidden',
  },
  expandedBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  expandedBarDetail: {
    fontSize: fontSizes.xs,
    color: '#7B8BA8',
  },
  modalCloseButton: {
    alignSelf: 'stretch',
    borderRadius: 18,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.24)',
  },
  modalPrimaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  modalPrimaryButtonGradient: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  modalPrimaryButtonLabel: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  modalCloseLabel: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, width: 68, height: 68, borderRadius: 34, overflow: 'hidden', shadowColor: '#4F46E5', shadowOpacity: 0.28, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
  fabPressed: { opacity: 0.94, transform: [{ scale: 0.98 }] },
  fabGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 34 },
  fabLabel: { fontSize: 32, lineHeight: 34, fontWeight: '300', color: '#F8FAFF' },
});

function buildCurrentWeek({ activeIndices }: { activeIndices: number[] }): CalendarDay[] {
  const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const now = new Date();
  const currentDay = now.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  return labels.map((label, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);

    return {
      key: `${label}-${day.toISOString()}`,
      label,
      dateNumber: day.getDate(),
      isToday: isSameDay(day, now),
      isActive: activeIndices.includes(index),
    };
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCurrentMonthGrid({
  activeDates,
}: {
  activeDates: number[];
}): CalendarGridDay[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(year, month, index - startOffset + 1);
    const isCurrentMonth = cellDate.getMonth() === month;

    return {
      key: cellDate.toISOString(),
      value: cellDate.getDate(),
      isCurrentMonth,
      isToday: isSameDay(cellDate, now),
      isActive: isCurrentMonth && activeDates.includes(cellDate.getDate()),
    };
  });
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
}

function formatSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function resolveMetricProgress(value: string) {
  if (value.endsWith('%')) {
    return Number.parseInt(value, 10);
  }

  const numeric = Number.parseInt(value, 10);
  return Math.min(100, numeric * 8);
}
