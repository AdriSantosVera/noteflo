import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { z } from 'zod';

import { fontSizes, spacing } from '../constants/theme';
import { useNotesStore } from '../store/notesStore';
import type { ChecklistItem, ChecklistNote, IdeaNote, Note } from '../types';

type EntryType = 'note' | 'checklist' | 'idea';
type DateField = 'startDate' | 'endDate';

type FormErrors = {
  title?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  taskLines?: string;
  tags?: string;
};

type CalendarDay = {
  key: string;
  value: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

const ENTRY_TYPES: Array<{ label: string; value: EntryType }> = [
  { label: 'Apunte', value: 'note' },
  { label: 'Tarea', value: 'checklist' },
  { label: 'Idea', value: 'idea' },
];

const IDEA_COLORS = ['#67E8F9', '#60A5FA', '#A78BFA', '#34D399', '#F59E0B'];
const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const baseEntrySchema = z
  .object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres.'),
    content: z.string().min(1, 'Añade una descripción o contenido base.'),
    startDate: z.date({ error: 'Selecciona una fecha de inicio.' }),
    endDate: z.date({ error: 'Selecciona una fecha final.' }),
  })
  .refine(({ startDate, endDate }) => endDate.getTime() >= startDate.getTime(), {
    path: ['endDate'],
    message: 'La fecha final no puede ser anterior a la fecha de inicio.',
  });

const noteEntrySchema = baseEntrySchema;

const checklistEntrySchema = baseEntrySchema.extend({
  taskItems: z
    .array(z.string().min(1))
    .min(1, 'Añade al menos un item en líneas separadas.'),
});

const ideaEntrySchema = baseEntrySchema.extend({
  tags: z.array(z.string().min(1)).optional(),
});

export default function NuevaNotaScreen() {
  const addNote = useNotesStore((state) => state.addNote);
  const addChecklist = useNotesStore((state) => state.addChecklist);
  const addIdea = useNotesStore((state) => state.addIdea);

  const [entryType, setEntryType] = useState<EntryType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [taskLines, setTaskLines] = useState('');
  const [tags, setTags] = useState('');
  const [ideaColor, setIdeaColor] = useState(IDEA_COLORS[0]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarTarget, setCalendarTarget] = useState<DateField | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [errors, setErrors] = useState<FormErrors>({});

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const handleSave = () => {
    const normalizedTitle = title.trim();
    const normalizedContent = content.trim();
    const normalizedTaskItems = parseChecklistLines(taskLines);
    const normalizedTags = parseTags(tags);

    const nextErrors = validateForm({
      title: normalizedTitle,
      content: normalizedContent,
      startDate,
      endDate,
      entryType,
      taskItems: normalizedTaskItems,
      tags: normalizedTags,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const id = Date.now().toString();
    const now = new Date().toISOString();
    const startDateIso = startDate?.toISOString();
    const endDateIso = endDate?.toISOString();

    if (entryType === 'note') {
      const note: Note = {
        id,
        type: 'note',
        title: normalizedTitle,
        content: normalizedContent,
        createdAt: now,
        updatedAt: now,
        startDate: startDateIso,
        endDate: endDateIso,
      };

      addNote(note);
      router.replace(`/(tabs)/notas/${id}`);
      return;
    }

    if (entryType === 'checklist') {
      const checklist: ChecklistNote = {
        id,
        type: 'checklist',
        title: normalizedTitle,
        items: buildChecklistItems(normalizedTaskItems),
        createdAt: now,
        updatedAt: now,
        startDate: startDateIso,
        endDate: endDateIso,
      };

      addChecklist(checklist);
      router.replace(`/(tabs)/checklists/${id}`);
      return;
    }

    const idea: IdeaNote = {
      id,
      type: 'idea',
      title: normalizedTitle,
      summary: normalizedContent,
      tags: normalizedTags.length > 0 ? normalizedTags : undefined,
      color: ideaColor,
      createdAt: now,
      updatedAt: now,
      startDate: startDateIso,
      endDate: endDateIso,
    };

    addIdea(idea);
    router.replace(`/(tabs)/ideas/${id}`);
  };

  const openCalendar = (target: DateField) => {
    const seedDate = target === 'startDate' ? startDate : endDate;
    setCalendarMonth(startOfMonth(seedDate ?? new Date()));
    setCalendarTarget(target);
  };

  const closeCalendar = () => {
    setCalendarTarget(null);
  };

  const handleSelectDate = (selectedDate: Date) => {
    if (calendarTarget === 'startDate') {
      setStartDate(selectedDate);
      setErrors((current) => ({ ...current, startDate: undefined }));

      if (endDate && endDate.getTime() < selectedDate.getTime()) {
        setEndDate(null);
      }
    }

    if (calendarTarget === 'endDate') {
      setEndDate(selectedDate);
      setErrors((current) => ({ ...current, endDate: undefined }));
    }

    closeCalendar();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.18)', 'rgba(59, 130, 246, 0)']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[styles.orb, styles.orbPrimary]}
          />
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.16)', 'rgba(167, 139, 250, 0)']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[styles.orb, styles.orbSecondary]}
          />
          <LinearGradient
            colors={['rgba(34, 211, 238, 0.14)', 'rgba(34, 211, 238, 0)']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={[styles.orb, styles.orbTertiary]}
          />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerShell}>
              <View style={styles.headerTopRow}>
                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed ? styles.closeButtonPressed : null,
                  ]}
                >
                  <Ionicons name="close" size={18} color="#D8E4F8" />
                  <Text style={styles.closeButtonLabel}>Cerrar</Text>
                </Pressable>
              </View>

              <Text style={styles.eyebrow}>Nueva entrada</Text>
              <Text style={styles.title}>Planifica tu trabajo y registra lo importante.</Text>
              <Text style={styles.subtitle}>
                Crea apuntes, tareas o ideas con fechas claras y una estructura limpia para tu flujo de trabajo.
              </Text>
            </View>

            <LinearGradient
              colors={['rgba(17, 26, 46, 0.96)', 'rgba(9, 14, 24, 0.88)']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.card}
            >
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionLabel}>Tipo de entrada</Text>
                <Text style={styles.sectionHint}>Elige el formato que mejor encaja</Text>
              </View>

              <View style={styles.selectorRow}>
                {ENTRY_TYPES.map((option) => {
                  const isActive = option.value === entryType;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setEntryType(option.value)}
                      style={({ pressed }) => [
                        styles.selectorButton,
                        isActive ? styles.selectorButtonActive : null,
                        pressed ? styles.selectorButtonPressed : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectorButtonText,
                          isActive ? styles.selectorButtonTextActive : null,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <FieldShell
                label="Título"
                helper="Ponle un nombre corto y reconocible."
                error={errors.title}
              >
                <TextInput
                  onChangeText={(value) => {
                    setTitle(value);
                    setErrors((current) => ({ ...current, title: undefined }));
                  }}
                  placeholder="Ej. Preparar arquitectura de estado"
                  placeholderTextColor="#6F809B"
                  style={styles.input}
                  value={title}
                />
              </FieldShell>

              <FieldShell
                label={entryType === 'idea' ? 'Descripción de la idea' : 'Descripción / contenido'}
                helper="Describe lo esencial para retomarlo luego sin fricción."
                error={errors.content}
              >
                <TextInput
                  multiline
                  onChangeText={(value) => {
                    setContent(value);
                    setErrors((current) => ({ ...current, content: undefined }));
                  }}
                  placeholder="Escribe el contenido principal"
                  placeholderTextColor="#6F809B"
                  style={[styles.input, styles.multilineInput]}
                  textAlignVertical="top"
                  value={content}
                />
              </FieldShell>

              <View style={styles.dateRow}>
                <FieldShell
                  label="Fecha de inicio"
                  helper="Marca cuándo quieres empezar."
                  error={errors.startDate}
                  style={styles.dateField}
                  headerStyle={styles.dateFieldHeader}
                  helperStyle={styles.dateFieldHelper}
                >
                  <Pressable
                    onPress={() => openCalendar('startDate')}
                    style={({ pressed }) => [
                      styles.dateButton,
                      pressed ? styles.dateButtonPressed : null,
                    ]}
                  >
                    <Text style={startDate ? styles.dateValue : styles.datePlaceholder}>
                      {startDate ? formatDisplayDate(startDate) : 'Seleccionar fecha'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="#9FB2D1" />
                  </Pressable>
                </FieldShell>

                <FieldShell
                  label="Fecha final"
                  helper="Define el cierre previsto."
                  error={errors.endDate}
                  style={styles.dateField}
                  headerStyle={styles.dateFieldHeader}
                  helperStyle={styles.dateFieldHelper}
                >
                  <Pressable
                    onPress={() => openCalendar('endDate')}
                    style={({ pressed }) => [
                      styles.dateButton,
                      pressed ? styles.dateButtonPressed : null,
                    ]}
                  >
                    <Text style={endDate ? styles.dateValue : styles.datePlaceholder}>
                      {endDate ? formatDisplayDate(endDate) : 'Seleccionar fecha'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="#9FB2D1" />
                  </Pressable>
                </FieldShell>
              </View>

              {entryType === 'checklist' ? (
                <FieldShell
                  label="Items iniciales"
                  helper="Escribe una tarea por línea para crear la checklist."
                  error={errors.taskLines}
                >
                  <TextInput
                    multiline
                    onChangeText={(value) => {
                      setTaskLines(value);
                      setErrors((current) => ({ ...current, taskLines: undefined }));
                    }}
                    placeholder={'Revisar navegación\nCompletar store\nProbar en iPhone'}
                    placeholderTextColor="#6F809B"
                    style={[styles.input, styles.multilineInput]}
                    textAlignVertical="top"
                    value={taskLines}
                  />
                </FieldShell>
              ) : null}

              {entryType === 'idea' ? (
                <>
                  <FieldShell
                    label="Etiquetas"
                    helper="Sepáralas por comas para clasificar mejor."
                  >
                    <TextInput
                      onChangeText={setTags}
                      placeholder="ia, productividad, dashboard"
                      placeholderTextColor="#6F809B"
                      style={styles.input}
                      value={tags}
                    />
                  </FieldShell>

                  <FieldShell
                    label="Color de la idea"
                    helper="Elige un acento visual simple para identificarla."
                  >
                    <View style={styles.colorRow}>
                      {IDEA_COLORS.map((color) => {
                        const selected = ideaColor === color;

                        return (
                          <Pressable
                            key={color}
                            onPress={() => setIdeaColor(color)}
                            style={({ pressed }) => [
                              styles.colorSwatch,
                              { backgroundColor: color },
                              selected ? styles.colorSwatchSelected : null,
                              pressed ? styles.colorSwatchPressed : null,
                            ]}
                          >
                            {selected ? (
                              <Ionicons name="checkmark" size={16} color="#050814" />
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  </FieldShell>
                </>
              ) : null}

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed ? styles.secondaryButtonPressed : null,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Volver</Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed ? styles.primaryButtonPressed : null,
                  ]}
                >
                  <LinearGradient
                    colors={['#6366F1', '#22D3EE']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={styles.primaryButtonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Guardar</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent
        visible={calendarTarget !== null}
        onRequestClose={closeCalendar}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeCalendar}>
          <Pressable style={styles.modalSheet} onPress={() => undefined}>
            <View style={styles.modalHandle} />
            <View style={styles.calendarTopRow}>
              <Pressable
                onPress={() => setCalendarMonth((current) => addMonths(current, -1))}
                style={({ pressed }) => [
                  styles.calendarNavButton,
                  pressed ? styles.calendarNavButtonPressed : null,
                ]}
              >
                <Ionicons name="chevron-back" size={16} color="#D8E4F8" />
              </Pressable>

              <Text style={styles.calendarTitle}>
                {formatMonthLabel(calendarMonth)}
              </Text>

              <Pressable
                onPress={() => setCalendarMonth((current) => addMonths(current, 1))}
                style={({ pressed }) => [
                  styles.calendarNavButton,
                  pressed ? styles.calendarNavButtonPressed : null,
                ]}
              >
                <Ionicons name="chevron-forward" size={16} color="#D8E4F8" />
              </Pressable>
            </View>

            <View style={styles.calendarWeekdaysRow}>
              {WEEKDAY_LABELS.map((label) => (
                <Text key={label} style={styles.calendarWeekdayLabel}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day) => {
                const selectedDate = calendarTarget === 'startDate' ? startDate : endDate;
                const isSelected =
                  selectedDate !== null && isSameDay(day.date, selectedDate);

                return (
                  <Pressable
                    key={day.key}
                    disabled={!day.isCurrentMonth}
                    onPress={() => handleSelectDate(day.date)}
                    style={({ pressed }) => [
                      styles.calendarCell,
                      !day.isCurrentMonth ? styles.calendarCellMuted : null,
                      day.isToday ? styles.calendarCellToday : null,
                      isSelected ? styles.calendarCellSelected : null,
                      pressed && day.isCurrentMonth ? styles.calendarCellPressed : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarCellText,
                        !day.isCurrentMonth ? styles.calendarCellTextMuted : null,
                        day.isToday ? styles.calendarCellTextToday : null,
                        isSelected ? styles.calendarCellTextSelected : null,
                      ]}
                    >
                      {day.value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={closeCalendar}
              style={({ pressed }) => [
                styles.calendarCloseButton,
                pressed ? styles.calendarCloseButtonPressed : null,
              ]}
            >
              <Text style={styles.calendarCloseLabel}>Cerrar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

type FieldShellProps = {
  label: string;
  helper?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  helperStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

function FieldShell({
  label,
  helper,
  error,
  style,
  headerStyle,
  helperStyle,
  children,
}: FieldShellProps) {
  return (
    <View style={[styles.fieldBlock, style]}>
      <View style={[styles.fieldHeader, headerStyle]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {helper ? <Text style={[styles.fieldHelper, helperStyle]}>{helper}</Text> : null}
      </View>
      {children}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

function validateForm({
  title,
  content,
  startDate,
  endDate,
  entryType,
  taskItems,
  tags,
}: {
  title: string;
  content: string;
  startDate: Date | null;
  endDate: Date | null;
  entryType: EntryType;
  taskItems: string[];
  tags: string[];
}): FormErrors {
  const nextErrors: FormErrors = {};

  const result =
    entryType === 'checklist'
      ? checklistEntrySchema.safeParse({
          title,
          content,
          startDate,
          endDate,
          taskItems,
        })
      : entryType === 'idea'
        ? ideaEntrySchema.safeParse({
            title,
            content,
            startDate,
            endDate,
            tags,
          })
        : noteEntrySchema.safeParse({
            title,
            content,
            startDate,
            endDate,
          });

  if (result.success) {
    return nextErrors;
  }

  const flattened = result.error.flatten()
    .fieldErrors as Record<string, string[] | undefined>;

  nextErrors.title = flattened.title?.[0];
  nextErrors.content = flattened.content?.[0];
  nextErrors.startDate = flattened.startDate?.[0];
  nextErrors.endDate = flattened.endDate?.[0];
  nextErrors.taskLines = flattened.taskItems?.[0];
  nextErrors.tags = flattened.tags?.[0];

  return nextErrors;
}

function buildChecklistItems(lines: string[]): ChecklistItem[] {
  return lines.map((label, index) => ({
      id: `${Date.now()}-${index}`,
      label,
      completed: false,
    }));
}

function parseChecklistLines(rawText: string) {
  return rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseTags(rawTags: string) {
  return rawTags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;
  const today = new Date();

  return Array.from({ length: totalCells }, (_, index) => {
    const cellDate = new Date(year, month, index - startOffset + 1);
    return {
      key: cellDate.toISOString(),
      value: cellDate.getDate(),
      date: cellDate,
      isCurrentMonth: cellDate.getMonth() === month,
      isToday: isSameDay(cellDate, today),
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

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbPrimary: {
    top: -60,
    right: -30,
    width: 240,
    height: 240,
  },
  orbSecondary: {
    top: 280,
    left: -90,
    width: 220,
    height: 220,
  },
  orbTertiary: {
    bottom: 160,
    right: 10,
    width: 180,
    height: 180,
  },
  headerShell: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.16)',
  },
  closeButtonPressed: {
    opacity: 0.88,
  },
  closeButtonLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#D8E4F8',
  },
  eyebrow: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#8DA1C8',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#F8FAFF',
    maxWidth: 340,
  },
  subtitle: {
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: '#94A3B8',
    maxWidth: 360,
  },
  card: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#C7D5F0',
    letterSpacing: 0.4,
  },
  sectionHint: {
    fontSize: fontSizes.xs,
    color: '#7B8BA8',
    fontWeight: '600',
  },
  selectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectorButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  selectorButtonActive: {
    borderColor: 'rgba(103, 232, 249, 0.26)',
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
  },
  selectorButtonPressed: {
    opacity: 0.92,
  },
  selectorButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#8DA1C8',
  },
  selectorButtonTextActive: {
    color: '#F8FAFF',
  },
  fieldBlock: {
    gap: spacing.sm,
  },
  fieldHeader: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#D7E3F8',
  },
  fieldHelper: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
    color: '#7385A3',
  },
  fieldError: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
    color: '#FCA5A5',
  },
  input: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    backgroundColor: 'rgba(8, 12, 22, 0.72)',
    color: '#F8FAFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
  },
  multilineInput: {
    minHeight: 120,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  dateField: {
    flex: 1,
  },
  dateFieldHeader: {
    minHeight: 72,
    justifyContent: 'flex-start',
  },
  dateFieldHelper: {
    minHeight: 36,
  },
  dateButton: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.12)',
    backgroundColor: 'rgba(8, 12, 22, 0.72)',
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonPressed: {
    opacity: 0.92,
  },
  dateValue: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#F8FAFF',
  },
  datePlaceholder: {
    fontSize: fontSizes.sm,
    color: '#6F809B',
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  colorSwatchSelected: {
    transform: [{ scale: 1.04 }],
    borderColor: '#F8FAFF',
  },
  colorSwatchPressed: {
    opacity: 0.88,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.14)',
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#D7E3F8',
  },
  primaryButton: {
    flex: 1.2,
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryButtonPressed: {
    opacity: 0.94,
  },
  primaryButtonGradient: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  primaryButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 16, 0.76)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
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
  modalHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(148, 163, 184, 0.24)',
  },
  calendarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.16)',
  },
  calendarNavButtonPressed: {
    opacity: 0.86,
  },
  calendarTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#F8FAFF',
    textTransform: 'capitalize',
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  calendarWeekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: '#70809C',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  calendarCell: {
    width: '13.2%',
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.08)',
  },
  calendarCellMuted: {
    opacity: 0.35,
  },
  calendarCellToday: {
    borderColor: 'rgba(103, 232, 249, 0.28)',
    backgroundColor: 'rgba(103, 232, 249, 0.08)',
  },
  calendarCellSelected: {
    backgroundColor: 'rgba(99, 102, 241, 0.24)',
    borderColor: 'rgba(129, 140, 248, 0.34)',
  },
  calendarCellPressed: {
    opacity: 0.84,
  },
  calendarCellText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  calendarCellTextMuted: {
    color: '#66748E',
  },
  calendarCellTextToday: {
    color: '#F8FAFF',
  },
  calendarCellTextSelected: {
    color: '#FFFFFF',
  },
  calendarCloseButton: {
    minHeight: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.24)',
  },
  calendarCloseButtonPressed: {
    opacity: 0.9,
  },
  calendarCloseLabel: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: '#F8FAFF',
  },
});
