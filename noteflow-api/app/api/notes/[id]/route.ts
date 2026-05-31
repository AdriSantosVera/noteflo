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

type NoteRow = {
  id: string;
  user_id: string | null;
  title: string;
  type: "note" | "checklist" | "idea";
  content: string | null;
  color: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  checklist_items: unknown[] | null;
  tags: string[] | null;
};

const updateNoteSchema = z
  .object({
    user_id: z.string().trim().min(1, "Debes indicar el usuario propietario"),
    title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres").optional(),
    content: z.string().trim().optional(),
    color: z.string().trim().min(1).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    startDate: z.string().trim().nullable().optional(),
    endDate: z.string().trim().nullable().optional(),
    start_date: z.string().trim().nullable().optional(),
    end_date: z.string().trim().nullable().optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.content !== undefined ||
      value.color !== undefined ||
      value.tags !== undefined ||
      value.startDate !== undefined ||
      value.endDate !== undefined ||
      value.start_date !== undefined ||
      value.end_date !== undefined,
    {
      message: "Debes enviar al menos un campo para actualizar.",
    },
  );

const noteByIdQuery = `
  SELECT
    n.id,
    n.user_id,
    n.title,
    n.type,
    n.content,
    n.color,
    n.start_date,
    n.end_date,
    n.created_at,
    n.updated_at,
    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'id', ci.id,
          'text', ci.text,
          'isCompleted', ci.is_completed,
          'createdAt', ci.created_at,
          'updatedAt', ci.updated_at
        )
      ) FILTER (WHERE ci.id IS NOT NULL),
      '[]'::json
    ) AS checklist_items,
    COALESCE(
      json_agg(DISTINCT nt.tag) FILTER (WHERE nt.id IS NOT NULL),
      '[]'::json
    ) AS tags
  FROM notes AS n
  LEFT JOIN checklist_items AS ci
    ON ci.note_id = n.id
  LEFT JOIN note_tags AS nt
    ON nt.note_id = n.id
  WHERE n.id = $1
    AND n.user_id = $2
  GROUP BY n.id
`;

function mapNote(row: NoteRow) {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    type: row.type,
    content: row.content,
    color: row.color,
    start_date: row.start_date,
    end_date: row.end_date,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    checklistItems: row.checklist_items ?? [],
    tags: row.tags ?? [],
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(_request.url);
    const userId = searchParams.get("user_id")?.trim();

    if (!userId) {
      return withCors(NextResponse.json({ error: "Falta user_id" }, { status: 400 }), _request);
    }

    const rows = await query<NoteRow>(noteByIdQuery, [id, userId]);

    if (rows.length === 0) {
      return withCors(NextResponse.json({ error: "Nota no encontrada" }, { status: 404 }), _request);
    }

    return withCors(NextResponse.json(mapNote(rows[0])), _request);
  } catch {
    return withCors(NextResponse.json({ error: "Error interno" }, { status: 500 }), _request);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    console.log(`PATCH /api/notes/${id} body:`, body);
    const result = updateNoteSchema.safeParse(body);

    if (!result.success) {
      return withCors(NextResponse.json(
        {
          error: "Datos no válidos",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      ), request);
    }

    const {
      user_id,
      title,
      content,
      color,
      tags,
      startDate,
      endDate,
      start_date,
      end_date,
    } = result.data;
    const normalizedStartDate = start_date ?? startDate;
    const normalizedEndDate = end_date ?? endDate;
    const rows = await query<{
      id: string;
      user_id: string | null;
      title: string;
      type: "note" | "checklist" | "idea";
      content: string | null;
      color: string | null;
      start_date: string | null;
      end_date: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `
        UPDATE notes
        SET
          title = COALESCE($1, title),
          content = COALESCE($2, content),
          color = COALESCE($3, color),
          start_date = COALESCE($4, start_date),
          end_date = COALESCE($5, end_date),
          updated_at = NOW()
        WHERE id = $6
          AND user_id = $7
        RETURNING id, user_id, title, type, content, color, start_date, end_date, created_at, updated_at
      `,
      [
        title ?? null,
        content ?? null,
        color ?? null,
        normalizedStartDate ?? null,
        normalizedEndDate ?? null,
        id,
        user_id,
      ],
    );

    if (rows.length === 0) {
      return withCors(NextResponse.json({ error: "Nota no encontrada" }, { status: 404 }), request);
    }

    const updated = rows[0];

    if (tags !== undefined) {
      await query(
        `
          DELETE FROM note_tags
          WHERE note_id = $1
        `,
        [id],
      );

      if (tags.length > 0) {
        await Promise.all(
          tags.map((tag) =>
            query(
              `
                INSERT INTO note_tags (note_id, tag)
                VALUES ($1, $2)
              `,
              [id, tag],
            ),
          ),
        );
      }
    }

    return withCors(NextResponse.json({
      id: updated.id,
      user_id: updated.user_id,
      title: updated.title,
      type: updated.type,
      content: updated.content,
      color: updated.color,
      start_date: updated.start_date,
      end_date: updated.end_date,
      startDate: updated.start_date,
      endDate: updated.end_date,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      tags: tags ?? [],
    }), request);
  } catch {
    return withCors(NextResponse.json({ error: "Error interno" }, { status: 500 }), request);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(_request.url);
    const userId = searchParams.get("user_id")?.trim();
    console.log(`DELETE /api/notes/${id}`);
    if (!userId) {
      return withCors(NextResponse.json({ error: "Falta user_id" }, { status: 400 }), _request);
    }
    const rows = await query<{ id: string }>(
      `
        DELETE FROM notes
        WHERE id = $1
          AND user_id = $2
        RETURNING id
      `,
      [id, userId],
    );

    if (rows.length === 0) {
      return withCors(NextResponse.json({ error: "Nota no encontrada" }, { status: 404 }), _request);
    }

    return withCors(new NextResponse(null, { status: 204 }), _request);
  } catch {
    return withCors(NextResponse.json({ error: "Error interno" }, { status: 500 }), _request);
  }
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
