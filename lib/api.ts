import type {
  ApiChecklistItem,
  ApiNote,
  ChecklistItem,
  ChecklistNote,
  IdeaNote,
  Note,
} from '../types';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim()
  ? normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL)
  : '';

type ApiErrorPayload = {
  error?: string;
  details?: Record<string, string[] | undefined>;
};

type CreateNotePayload = {
  user_id: string;
  title: string;
  type: 'note' | 'checklist' | 'idea';
  content?: string;
  color?: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
};

type UpdateNotePayload = {
  user_id: string;
  title?: string;
  content?: string;
  color?: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
};

type AvatarUploadUrlPayload = {
  fileName: string;
  contentType: string;
  userId: string;
};

type AvatarUploadUrlResponse = {
  signedUrl: string;
  publicUrl: string;
};

async function parseErrorFromText(text: string): Promise<string> {
  try {
    const payload = JSON.parse(text) as ApiErrorPayload;
    return payload.error ?? 'Error inesperado en la API';
  } catch {
    return 'Error inesperado en la API';
  }
}

async function requestJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_URL no está configurada. Define la URL del backend en el entorno del frontend.'
    );
  }

  const url = `${BASE_URL}${path}`;
  console.log('API URL:', url);

  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const text = await response.text();

  console.log('status:', response.status);
  console.log('body:', text);

  if (!response.ok) {
    throw new Error(await parseErrorFromText(text));
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Respuesta JSON no válida en la API');
  }
}

async function requestVoid(path: string, init?: RequestInit): Promise<void> {
  if (!BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_URL no está configurada. Define la URL del backend en el entorno del frontend.'
    );
  }

  const url = `${BASE_URL}${path}`;
  console.log('API URL:', url);

  const response = await fetch(url, init);
  const text = await response.text();

  console.log('status:', response.status);
  console.log('body:', text);

  if (!response.ok) {
    throw new Error(await parseErrorFromText(text));
  }
}

export async function getNotes(userId: string): Promise<ApiNote[]> {
  const searchParams = new URLSearchParams({ user_id: userId });
  return requestJson<ApiNote[]>(`/notes?${searchParams.toString()}`);
}

export async function createNote(
  data: CreateNotePayload
): Promise<ApiNote> {
  return requestJson<ApiNote>('/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateNote(
  id: string,
  data: UpdateNotePayload
): Promise<ApiNote> {
  return requestJson<ApiNote>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteNote(id: string, userId: string): Promise<void> {
  const searchParams = new URLSearchParams({ user_id: userId });
  return requestVoid(`/notes/${id}?${searchParams.toString()}`, {
    method: 'DELETE',
  });
}

export async function getChecklistItems(
  noteId: string,
  userId: string
): Promise<ApiChecklistItem[]> {
  const searchParams = new URLSearchParams({ user_id: userId });
  return requestJson<ApiChecklistItem[]>(
    `/notes/${noteId}/checklist-items?${searchParams.toString()}`
  );
}

export async function createChecklistItem(
  noteId: string,
  text: string,
  userId: string
): Promise<ApiChecklistItem> {
  return requestJson<ApiChecklistItem>(`/notes/${noteId}/checklist-items`, {
    method: 'POST',
    body: JSON.stringify({ text, user_id: userId }),
  });
}

export async function updateChecklistItem(
  itemId: string,
  isCompleted: boolean
): Promise<ApiChecklistItem> {
  return requestJson<ApiChecklistItem>(`/checklist-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_completed: isCompleted }),
  });
}

export async function deleteChecklistItem(itemId: string): Promise<void> {
  return requestVoid(`/checklist-items/${itemId}`, {
    method: 'DELETE',
  });
}

export async function getAvatarUploadUrl(
  data: AvatarUploadUrlPayload
): Promise<AvatarUploadUrlResponse> {
  return requestJson<AvatarUploadUrlResponse>('/uploads/avatar-url', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function mapNoteToCreatePayload(
  note: Note,
  userId: string
): CreateNotePayload {
  return {
    user_id: userId,
    title: note.title,
    type: 'note',
    content: note.content,
    start_date: note.startDate,
    end_date: note.endDate,
  };
}

export function mapChecklistToCreatePayload(
  checklist: ChecklistNote,
  userId: string
): CreateNotePayload {
  return {
    user_id: userId,
    title: checklist.title,
    type: 'checklist',
    content: '',
    start_date: checklist.startDate,
    end_date: checklist.endDate,
  };
}

export function mapIdeaToCreatePayload(
  idea: IdeaNote,
  userId: string
): CreateNotePayload {
  return {
    user_id: userId,
    title: idea.title,
    type: 'idea',
    content: idea.summary,
    color: idea.color,
    tags: idea.tags,
    start_date: idea.startDate,
    end_date: idea.endDate,
  };
}

export function hasChecklistItems(
  items: ChecklistItem[]
): items is ChecklistItem[] {
  return items.length > 0;
}
