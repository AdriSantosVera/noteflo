import { NextResponse } from "next/server";
import { z } from "zod";

import { withCors, corsPreflight } from "@/lib/cors";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ChecklistItemRow = {
  id: string;
  note_id: string;
  text: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

const createChecklistItemSchema = z.object({
  text: z.string().trim().min(1, "El texto no puede estar vacío"),
});

function mapChecklistItem(row: ChecklistItemRow) {
  return {
    id: row.id,
    noteId: row.note_id,
    text: row.text,
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const notes = await query<{ id: string }>(
      `
        SELECT id
        FROM notes
        WHERE id = $1
      `,
      [id],
    );

    if (notes.length === 0) {
      return withCors(NextResponse.json({ error: "Nota no encontrada" }, { status: 404 }), request);
    }

    const rows = await query<ChecklistItemRow>(
      `
        SELECT id, note_id, text, is_completed, created_at, updated_at
        FROM checklist_items
        WHERE note_id = $1
        ORDER BY created_at ASC
      `,
      [id],
    );

    return withCors(NextResponse.json(rows.map(mapChecklistItem)), request);
  } catch {
    return withCors(NextResponse.json({ error: "Error interno" }, { status: 500 }), request);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = createChecklistItemSchema.safeParse(body);

    if (!result.success) {
      return withCors(NextResponse.json(
        {
          error: "Datos no válidos",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      ), request);
    }

    const notes = await query<{ id: string; type: string }>(
      `
        SELECT id, type
        FROM notes
        WHERE id = $1
      `,
      [id],
    );

    if (notes.length === 0) {
      return withCors(NextResponse.json({ error: "Nota no encontrada" }, { status: 404 }), request);
    }

    if (notes[0].type !== "checklist") {
      return withCors(NextResponse.json(
        { error: "La nota no es de tipo checklist" },
        { status: 400 },
      ), request);
    }

    const rows = await query<ChecklistItemRow>(
      `
        INSERT INTO checklist_items (note_id, text)
        VALUES ($1, $2)
        RETURNING id, note_id, text, is_completed, created_at, updated_at
      `,
      [id, result.data.text],
    );

    await query(
      `
        UPDATE notes
        SET updated_at = NOW()
        WHERE id = $1
      `,
      [id],
    );

    return withCors(NextResponse.json(mapChecklistItem(rows[0]), { status: 201 }), request);
  } catch {
    return withCors(NextResponse.json({ error: "Error interno" }, { status: 500 }), request);
  }
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
