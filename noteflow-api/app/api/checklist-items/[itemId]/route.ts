import { NextResponse } from "next/server";
import { z } from "zod";

import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    itemId: string;
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

const updateChecklistItemSchema = z.object({
  is_completed: z.boolean(),
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    const body = await request.json();
    const result = updateChecklistItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Datos no válidos",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const rows = await query<ChecklistItemRow>(
      `
        UPDATE checklist_items
        SET
          is_completed = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING id, note_id, text, is_completed, created_at, updated_at
      `,
      [result.data.is_completed, itemId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Item de checklist no encontrado" },
        { status: 404 },
      );
    }

    await query(
      `
        UPDATE notes
        SET updated_at = NOW()
        WHERE id = $1
      `,
      [rows[0].note_id],
    );

    return NextResponse.json(mapChecklistItem(rows[0]));
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { itemId } = await context.params;
    const rows = await query<{ id: string; note_id: string }>(
      `
        DELETE FROM checklist_items
        WHERE id = $1
        RETURNING id, note_id
      `,
      [itemId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Item de checklist no encontrado" },
        { status: 404 },
      );
    }

    await query(
      `
        UPDATE notes
        SET updated_at = NOW()
        WHERE id = $1
      `,
      [rows[0].note_id],
    );

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
