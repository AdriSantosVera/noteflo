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
