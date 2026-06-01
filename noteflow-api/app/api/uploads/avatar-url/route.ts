import { NextResponse } from "next/server";
import { z } from "zod";

import { corsPreflight, withCors } from "@/lib/cors";
import { createAvatarUploadUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

const avatarUploadSchema = z.object({
  fileName: z.string().trim().min(1, "Debes indicar el nombre del archivo"),
  contentType: z
    .string()
    .trim()
    .min(1, "Debes indicar el content type")
    .refine((value) => value.startsWith("image/"), {
      message: "Solo se permiten imágenes",
    }),
  userId: z.string().trim().min(1, "Debes indicar el usuario"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = avatarUploadSchema.safeParse(body);

    if (!result.success) {
      return withCors(
        NextResponse.json(
          {
            error: "Datos no válidos",
            details: result.error.flatten().fieldErrors,
          },
          { status: 400 }
        ),
        request
      );
    }

    const upload = await createAvatarUploadUrl(result.data);

    return withCors(
      NextResponse.json(
        {
          signedUrl: upload.signedUrl,
          publicUrl: upload.publicUrl,
        },
        { status: 201 }
      ),
      request
    );
  } catch (error) {
    console.error("POST /api/uploads/avatar-url error:", error);
    return withCors(
      NextResponse.json({ error: "Error interno" }, { status: 500 }),
      request
    );
  }
}

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}
