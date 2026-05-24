/**
 * Shared domain types for NoteFlow.
 * Cross-feature entities live here to keep contracts consistent across the app.
 */

export type EntityId = string;

export type ISODateString = string;

export interface BaseNote {
  id: EntityId;
  title: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  startDate?: ISODateString;
  endDate?: ISODateString;
}

export interface Note extends BaseNote {
  type: 'note';
  content: string;
}

export interface ChecklistItem {
  id: EntityId;
  label: string;
  completed: boolean;
}

export interface ApiChecklistItem {
  id: EntityId;
  noteId: EntityId;
  text: string;
  isCompleted: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ApiNote {
  id: EntityId;
  title: string;
  type: 'note' | 'checklist' | 'idea';
  content: string | null;
  color: string | null;
  start_date?: ISODateString | null;
  end_date?: ISODateString | null;
  startDate?: ISODateString | null;
  endDate?: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  checklistItems: ApiChecklistItem[];
  tags: string[];
}

export interface ChecklistNote extends BaseNote {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface IdeaNote extends BaseNote {
  type: 'idea';
  summary: string;
  tags?: string[];
  color?: string;
}

export type AnyNote = Note | ChecklistNote | IdeaNote;

export function mapApiChecklistItemToChecklistItem(
  item: ApiChecklistItem
): ChecklistItem {
  return {
    id: item.id,
    label: item.text,
    completed: item.isCompleted,
  };
}

export function mapApiNoteToNote(apiNote: ApiNote): AnyNote {
  if (apiNote.type === 'note') {
    return {
      id: apiNote.id,
      type: 'note',
      title: apiNote.title,
      content: apiNote.content ?? '',
      startDate: apiNote.start_date ?? apiNote.startDate ?? undefined,
      endDate: apiNote.end_date ?? apiNote.endDate ?? undefined,
      createdAt: apiNote.createdAt,
      updatedAt: apiNote.updatedAt,
    };
  }

  if (apiNote.type === 'checklist') {
    return {
      id: apiNote.id,
      type: 'checklist',
      title: apiNote.title,
      items: apiNote.checklistItems.map(mapApiChecklistItemToChecklistItem),
      startDate: apiNote.start_date ?? apiNote.startDate ?? undefined,
      endDate: apiNote.end_date ?? apiNote.endDate ?? undefined,
      createdAt: apiNote.createdAt,
      updatedAt: apiNote.updatedAt,
    };
  }

  return {
    id: apiNote.id,
    type: 'idea',
    title: apiNote.title,
    summary: apiNote.content ?? '',
    tags: apiNote.tags.length > 0 ? apiNote.tags : undefined,
    color: apiNote.color ?? undefined,
    startDate: apiNote.start_date ?? apiNote.startDate ?? undefined,
    endDate: apiNote.end_date ?? apiNote.endDate ?? undefined,
    createdAt: apiNote.createdAt,
    updatedAt: apiNote.updatedAt,
  };
}
