import { NextResponse } from "next/server";
import { z } from "zod";

import { withCors, corsPreflight } from "@/lib/cors";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

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
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
};

const createNoteSchema = z.object({
  user_id: z.string().trim().min(1, "Debes indicar el usuario propietario"),
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
  type: z.enum(["note", "checklist", "idea"]),
  content: z.string().trim().optional(),
  color: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  startDate: z.string().trim().nullable().optional(),
  endDate: z.string().trim().nullable().optional(),
  start_date: z.string().trim().nullable().optional(),
  end_date: z.string().trim().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  location_name: z.string().trim().nullable().optional(),
});

const notesListQuery = `
  SELECT
    n.id,
    n.user_id,
    n.title,
    n.type,
    n.content,
    n.color,
    n.start_date,
    n.end_date,
    n.latitude,
    n.longitude,
    n.location_name,
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
  WHERE n.user_id = $1
  GROUP BY n.id
  ORDER BY n.created_at DESC
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
    latitude: row.latitude,
    longitude: row.longitude,
    location_name: row.location_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    checklistItems: row.checklist_items ?? [],
    tags: row.tags ?? [],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id")?.trim();

    if (!userId) {
      return withCors(NextResponse.json([]), request);
    }

    const rows = await query<NoteRow>(notesListQuery, [userId]);
    return withCors(NextResponse.json(rows.map(mapNote)), request);
  } catch (error) {
    console.error("GET /api/notes error:", error);
    return withCors(NextResponse.json({ error: "Error interno" }, { status: 500 }), request);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createNoteSchema.safeParse(body);

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
      type,
      content,
      color,
      tags,
      startDate,
      endDate,
      start_date,
      end_date,
      latitude,
      longitude,
      location_name,
    } = result.data;
    const normalizedStartDate = start_date ?? startDate ?? null;
    const normalizedEndDate = end_date ?? endDate ?? null;

    const rows = await query<{
      id: string;
      user_id: string | null;
      title: string;
      type: "note" | "checklist" | "idea";
      content: string | null;
      color: string | null;
      start_date: string | null;
      end_date: string | null;
      latitude: number | null;
      longitude: number | null;
      location_name: string | null;
      created_at: string;
      updated_at: string;
    }>(
      `
        INSERT INTO notes (user_id, title, type, content, color, start_date, end_date, latitude, longitude, location_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, user_id, title, type, content, color, start_date, end_date, latitude, longitude, location_name, created_at, updated_at
      `,
      [
        user_id,
        title,
        type,
        content ?? null,
        color ?? null,
        normalizedStartDate,
        normalizedEndDate,
        latitude ?? null,
        longitude ?? null,
        location_name ?? null,
      ],
    );

    const created = rows[0];

    if (type === "idea" && tags && tags.length > 0) {
      await Promise.all(
        tags.map((tag) =>
          query(
            `
              INSERT INTO note_tags (note_id, tag)
              VALUES ($1, $2)
            `,
            [created.id, tag],
          ),
        ),
      );
    }

    return withCors(NextResponse.json(
      {
        id: created.id,
        user_id: created.user_id,
        title: created.title,
        type: created.type,
        content: created.content,
        color: created.color,
        start_date: created.start_date,
        end_date: created.end_date,
        startDate: created.start_date,
        endDate: created.end_date,
        latitude: created.latitude,
        longitude: created.longitude,
        location_name: created.location_name,
        createdAt: created.created_at,
        updatedAt: created.updated_at,
        checklistItems: [],
        tags: tags ?? [],
      },
      { status: 201 },
    ), request);
  } catch (error) {
    console.error("POST /api/notes error:", error);
    return withCors(NextResponse.json({ error: "Error interno" }, { status: 500 }), request);
  }
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
