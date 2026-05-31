import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';

import {
  createChecklistItem,
  createNote,
  deleteNote as deleteNoteRequest,
  getNotes,
  mapChecklistToCreatePayload,
  mapIdeaToCreatePayload,
  mapNoteToCreatePayload,
  updateChecklistItem,
} from '../lib/api';
import { auth } from '../lib/firebase';
import { useAuthStore } from './authStore';
import type { AnyNote, ChecklistNote, IdeaNote, Note } from '../types';
import { mapApiChecklistItemToChecklistItem, mapApiNoteToNote } from '../types';

type PersistedNotesState = {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
};

type NotesStore = PersistedNotesState & {
  hasHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  fetchNotes: () => Promise<void>;
  addNote: (entry: Note) => Promise<Note | null>;
  addChecklist: (entry: ChecklistNote) => Promise<ChecklistNote | null>;
  addIdea: (entry: IdeaNote) => Promise<IdeaNote | null>;
  deleteNote: (id: string) => Promise<boolean>;
  deleteChecklist: (id: string) => Promise<boolean>;
  deleteIdea: (id: string) => Promise<boolean>;
  toggleChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
};

const STORAGE_KEY = 'noteflow-storage';

function getPersistedSlice(state: NotesStore): PersistedNotesState {
  return {
    notes: state.notes,
    checklists: state.checklists,
    ideas: state.ideas,
  };
}

async function persistSlice(slice: PersistedNotesState, userId: string | null) {
  if (!userId) {
    return;
  }

  try {
    await AsyncStorage.setItem(getStorageKeyForUser(userId), JSON.stringify(slice));
  } catch {
    // Cache opcional: la fuente principal de verdad es el servidor.
  }
}

function splitNotesByType(entries: AnyNote[]): PersistedNotesState {
  return {
    notes: entries.filter((entry): entry is Note => entry.type === 'note'),
    checklists: entries.filter(
      (entry): entry is ChecklistNote => entry.type === 'checklist'
    ),
    ideas: entries.filter((entry): entry is IdeaNote => entry.type === 'idea'),
  };
}

function getCurrentUserId(): string | null {
  return useAuthStore.getState().user?.uid ?? auth?.currentUser?.uid ?? null;
}

function getStorageKeyForUser(userId: string) {
  return `${STORAGE_KEY}:${userId}`;
}

async function syncServerState(
  set: (partial: Partial<NotesStore>) => void
): Promise<PersistedNotesState> {
  const userId = getCurrentUserId();

  if (!userId) {
    const emptySlice: PersistedNotesState = {
      notes: [],
      checklists: [],
      ideas: [],
    };

    set({
      ...emptySlice,
      hasHydrated: true,
      error: null,
    });

    return emptySlice;
  }

  const apiNotes = await getNotes(userId);
  const nextSlice = splitNotesByType(apiNotes.map(mapApiNoteToNote));

  set({
    ...nextSlice,
    hasHydrated: true,
    error: null,
  });
  await persistSlice(nextSlice, userId);

  return nextSlice;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  checklists: [],
  ideas: [],
  hasHydrated: false,
  isLoading: false,
  error: null,
  hydrate: async () => {
    const userId = getCurrentUserId();

    if (!userId) {
      set({
        notes: [],
        checklists: [],
        ideas: [],
        hasHydrated: true,
      });
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(getStorageKeyForUser(userId));

      if (!raw) {
        set({ hasHydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedNotesState>;

      set({
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        checklists: Array.isArray(parsed.checklists) ? parsed.checklists : [],
        ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
        hasHydrated: true,
      });
    } catch {
      set({ hasHydrated: true });
    }
  },
  fetchNotes: async () => {
    set({ isLoading: true, error: null });

    try {
      await syncServerState(set);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar las notas.',
      });
    }
  },
  addNote: async (entry) => {
    set({ isLoading: true, error: null });

    try {
      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error('Debes iniciar sesión para crear una nota.');
      }

      const created = mapApiNoteToNote(
        await createNote(mapNoteToCreatePayload(entry, userId))
      );

      if (created.type !== 'note') {
        throw new Error('La API devolvió un tipo de nota inesperado.');
      }

      await syncServerState(set);
      set({ isLoading: false });
      return created;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudo crear la nota.',
      });
      return null;
    }
  },
  addChecklist: async (entry) => {
    set({ isLoading: true, error: null });

    try {
      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error('Debes iniciar sesión para crear una checklist.');
      }

      const createdChecklistBase = mapApiNoteToNote(
        await createNote(mapChecklistToCreatePayload(entry, userId))
      );

      if (createdChecklistBase.type !== 'checklist') {
        throw new Error('La API devolvió un tipo de checklist inesperado.');
      }

      const createdItems = await Promise.all(
        entry.items.map((item) =>
          createChecklistItem(createdChecklistBase.id, item.label, userId)
        )
      );

      const createdChecklist: ChecklistNote = {
        ...createdChecklistBase,
        items: createdItems.map(mapApiChecklistItemToChecklistItem),
      };

      await syncServerState(set);
      set({ isLoading: false });
      return createdChecklist;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo crear la checklist.',
      });
      return null;
    }
  },
  addIdea: async (entry) => {
    set({ isLoading: true, error: null });

    try {
      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error('Debes iniciar sesión para crear una idea.');
      }

      const created = mapApiNoteToNote(
        await createNote(mapIdeaToCreatePayload(entry, userId))
      );

      if (created.type !== 'idea') {
        throw new Error('La API devolvió un tipo de idea inesperado.');
      }

      await syncServerState(set);
      set({ isLoading: false });
      return created;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'No se pudo crear la idea.',
      });
      return null;
    }
  },
  deleteNote: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error('Debes iniciar sesión para eliminar una nota.');
      }

      await deleteNoteRequest(id, userId);
      await syncServerState(set);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'No se pudo eliminar la nota.',
      });
      return false;
    }
  },
  deleteChecklist: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error('Debes iniciar sesión para eliminar una checklist.');
      }

      await deleteNoteRequest(id, userId);
      await syncServerState(set);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar la checklist.',
      });
      return false;
    }
  },
  deleteIdea: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const userId = getCurrentUserId();

      if (!userId) {
        throw new Error('Debes iniciar sesión para eliminar una idea.');
      }

      await deleteNoteRequest(id, userId);
      await syncServerState(set);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'No se pudo eliminar la idea.',
      });
      return false;
    }
  },
  toggleChecklistItem: async (checklistId, itemId) => {
    const checklist = get().checklists.find((entry) => entry.id === checklistId);
    const item = checklist?.items.find((entry) => entry.id === itemId);

    if (!checklist || !item) {
      return;
    }

    try {
      const updatedItem = await updateChecklistItem(itemId, !item.completed);

      const nextState = {
        ...get(),
        checklists: get().checklists.map((entry) =>
          entry.id !== checklistId
            ? entry
            : {
                ...entry,
                updatedAt: updatedItem.updatedAt,
                items: entry.items.map((currentItem) =>
                  currentItem.id === itemId
                    ? mapApiChecklistItemToChecklistItem(updatedItem)
                    : currentItem
                ),
              }
        ),
        error: null,
      };

      set(nextState);
      await persistSlice(getPersistedSlice(nextState), getCurrentUserId());
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo actualizar el item de checklist.',
      });
    }
  },
}));

if (!(Platform.OS === 'web' && typeof window === 'undefined')) {
  void useNotesStore.getState().hydrate();
}
