# NoteFlow API

Backend independiente de **NoteFlow Dev**, construido con **Next.js**, **TypeScript**, **Neon PostgreSQL**, **Zod** y **AWS SDK v3**.

Su función es ofrecer:

- API REST para notas, ideas y checklists;
- ownership de datos por usuario (`user_id`);
- validación de entradas;
- generación de Presigned URLs para subida de avatar a AWS S3.

## Stack técnico

- Next.js App Router
- TypeScript
- Neon PostgreSQL
- Zod
- AWS SDK for JavaScript v3

## Responsabilidades del backend

- validar peticiones HTTP;
- consultar y mutar PostgreSQL;
- devolver datos estructurados al frontend;
- aplicar CORS para desarrollo;
- generar URLs firmadas para S3.

## Estructura

```text
noteflow-api/
├── app/
│   ├── api/
│   │   ├── checklist-items/
│   │   │   └── [itemId]/route.ts
│   │   ├── notes/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── checklist-items/route.ts
│   │   └── uploads/
│   │       └── avatar-url/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── docs/
├── lib/
│   ├── cors.ts
│   ├── db.ts
│   └── s3.ts
├── sql/
│   ├── queries.sql
│   └── schema.sql
├── .env.example
├── package.json
└── README.md
```

## Variables de entorno

Crear `.env.local` a partir de `.env.example`:

```env
DATABASE_URL=postgresql://...

AWS_REGION=
AWS_S3_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

ALLOWED_ORIGIN=http://localhost:8082
```

## Instalación

```bash
npm install
```

## Ejecución local

```bash
npm run dev
```

Servidor local:

- `http://localhost:3000`

## Preparar Neon

1. Crear proyecto en Neon.
2. Configurar `DATABASE_URL`.
3. Ejecutar `sql/schema.sql`.
4. Si la tabla ya existía, aplicar migraciones adicionales necesarias.

### Campos relevantes en `notes`

- `user_id`
- `start_date`
- `end_date`
- `latitude`
- `longitude`
- `location_name`

## Endpoints implementados

### Notas

- `GET /api/notes?user_id=...`
- `POST /api/notes`
- `GET /api/notes/:id?user_id=...`
- `PATCH /api/notes/:id`
- `DELETE /api/notes/:id?user_id=...`

### Checklist items

- `GET /api/notes/:id/checklist-items`
- `POST /api/notes/:id/checklist-items`
- `PATCH /api/checklist-items/:itemId`
- `DELETE /api/checklist-items/:itemId`

### Avatares

- `POST /api/uploads/avatar-url`

Body esperado:

```json
{
  "fileName": "avatar.jpg",
  "contentType": "image/jpeg",
  "userId": "firebase_uid"
}
```

Respuesta:

```json
{
  "signedUrl": "https://...",
  "publicUrl": "https://..."
}
```

## Modelo de datos

### `notes`

- contenido principal del usuario;
- filtrado por `user_id`;
- soporta notas, ideas y checklists.

### `checklist_items`

- elementos asociados a una nota tipo checklist.

### `note_tags`

- etiquetas para ideas o notas.

## Seguridad y validación

- validación con Zod;
- consultas parametrizadas;
- `DATABASE_URL` aislada del frontend;
- CORS configurado para desarrollo local;
- la seguridad fuerte basada en tokens Firebase sigue siendo una mejora futura.

## Despliegue

El backend está preparado para desplegarse en Vercel usando `noteflow-api` como raíz del proyecto.

Variables mínimas necesarias en producción:

- `DATABASE_URL`
- `AWS_REGION`
- `AWS_S3_BUCKET_NAME`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Relación con el frontend

El frontend Expo consume esta API mediante:

```env
EXPO_PUBLIC_API_URL=
```

Ejemplos:

- navegador local:
  - `http://localhost:3000/api`
- dispositivo físico:
  - `http://IP_LOCAL_DEL_MAC:3000/api`

## Documentación adicional

- [backend-teoria.md](./docs/backend-teoria.md)
- [seguridad-api.md](./docs/seguridad-api.md)
