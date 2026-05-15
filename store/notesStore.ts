import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ChecklistNote, IdeaNote, Note } from '../types';

type NotesStore = {
  notes: Note[];
  checklists: ChecklistNote[];
  ideas: IdeaNote[];
  addNote: (entry: Note) => void;
  addChecklist: (entry: ChecklistNote) => void;
  addIdea: (entry: IdeaNote) => void;
  deleteNote: (id: string) => void;
  deleteChecklist: (id: string) => void;
  deleteIdea: (id: string) => void;
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
};

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      checklists: [],
      ideas: [],
      addNote: (entry) =>
        set((state) => ({
          notes: [entry, ...state.notes],
        })),
      addChecklist: (entry) =>
        set((state) => ({
          checklists: [entry, ...state.checklists],
        })),
      addIdea: (entry) =>
        set((state) => ({
          ideas: [entry, ...state.ideas],
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),
      deleteChecklist: (id) =>
        set((state) => ({
          checklists: state.checklists.filter((checklist) => checklist.id !== id),
        })),
      deleteIdea: (id) =>
        set((state) => ({
          ideas: state.ideas.filter((idea) => idea.id !== id),
        })),
      toggleChecklistItem: (checklistId, itemId) =>
        set((state) => ({
          checklists: state.checklists.map((checklist) =>
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
          ),
        })),
    }),
    {
      name: 'noteflow-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
