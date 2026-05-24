# NoteFlow API

Backend independiente para **NoteFlow Dev**, construido con **Next.js App Router**, **TypeScript**, **Neon PostgreSQL** y **Zod**.

Este proyecto no toca la app móvil Expo. Su función es ofrecer una base de backend limpia, segura y preparada para crecer después con autenticación, sincronización y reglas de negocio más avanzadas.

## Stack técnico

- Next.js App Router
- TypeScript
- Neon PostgreSQL
- Zod

## Qué resuelve este backend

La API actúa como capa intermedia entre la app Expo y PostgreSQL. Su responsabilidad es:

- validar entradas con Zod
- ejecutar consultas SQL parametrizadas
- proteger la base de datos de exposición directa
- devolver datos estructurados para notas, checklists e ideas

## Estructura

```text
noteflow-api/
  app/
    api/
      notes/
        route.ts
        [id]/
          route.ts
          checklist-items/
            route.ts
      checklist-items/
        [itemId]/
          route.ts
  docs/
    backend-teoria.md
    seguridad-api.md
  lib/
    db.ts
  sql/
    schema.sql
    queries.sql
  .env.example
  README.md
  package.json
```

## Variables de entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

2. Añade tu cadena de conexión de Neon:

```env
DATABASE_URL=postgres://...
```

`.env.local` no debe subirse al repositorio. Ya está cubierto por `.gitignore`.

## Instalación rápida

```bash
npm install
cp .env.example .env.local
```

Después, define `DATABASE_URL` con tu cadena de conexión real de Neon.

## Ejecución local

```bash
npm run dev
```

Servidor por defecto:

- `http://localhost:3000`

Comprobación inicial:

- `GET http://localhost:3000/api/notes`

## Preparar la base de datos en Neon

1. Abre tu proyecto en Neon.
2. Entra en el SQL Editor.
3. Copia el contenido de `sql/schema.sql`.
4. Ejecuta el script para crear tablas, claves y relaciones.

Si la tabla `notes` ya existía antes de añadir fechas, ejecuta también:

```sql
ALTER TABLE notes ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
```

La consulta compleja de ejemplo para recuperar notas con items y tags está documentada en `sql/queries.sql`.

## Endpoints disponibles

### Notas

- `GET /api/notes`
- `POST /api/notes`
- `GET /api/notes/:id`
- `PATCH /api/notes/:id`
- `DELETE /api/notes/:id`

### Items de checklist

- `GET /api/notes/:id/checklist-items`
- `POST /api/notes/:id/checklist-items`
- `PATCH /api/checklist-items/:itemId`
- `DELETE /api/checklist-items/:itemId`

## Ejemplos de request/response

### Crear una nota

```http
POST /api/notes
Content-Type: application/json

{
  "title": "Preparar backend de NoteFlow",
  "type": "note",
  "content": "Levantar API REST con Next.js y Neon",
  "color": "#67D8FF",
  "start_date": "2026-05-24T08:00:00.000Z",
  "end_date": "2026-05-24T10:00:00.000Z"
}
```

Respuesta:

```json
{
  "id": "f3122e8c-5c0c-4409-8e61-e29cc5ef1bd9",
  "title": "Preparar backend de NoteFlow",
  "type": "note",
  "content": "Levantar API REST con Next.js y Neon",
  "color": "#67D8FF",
  "start_date": "2026-05-24T08:00:00.000Z",
  "end_date": "2026-05-24T10:00:00.000Z",
  "createdAt": "2026-05-19T17:00:00.000Z",
  "updatedAt": "2026-05-19T17:00:00.000Z",
  "checklistItems": [],
  "tags": []
}
```

### Crear un item de checklist

```http
POST /api/notes/:id/checklist-items
Content-Type: application/json

{
  "text": "Definir esquema SQL"
}
```

### Actualizar una nota

```http
PATCH /api/notes/:id
Content-Type: application/json

{
  "title": "Preparar backend actualizado",
  "start_date": "2026-05-24T09:00:00.000Z",
  "end_date": "2026-05-24T11:30:00.000Z"
}
```

### Eliminar una nota

```http
DELETE /api/notes/:id
```

Respuesta esperada:

```http
204 No Content
```

### Marcar un item como completado

```http
PATCH /api/checklist-items/:itemId
Content-Type: application/json

{
  "is_completed": true
}
```

## Validación y seguridad

- Las entradas se validan con Zod.
- Las consultas SQL son parametrizadas.
- Los errores internos no se exponen al cliente.
- `DATABASE_URL` nunca debe vivir en la app móvil.

Más detalle:

- [docs/backend-teoria.md](./docs/backend-teoria.md)
- [docs/seguridad-api.md](./docs/seguridad-api.md)

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Define la raíz del proyecto como `noteflow-api`.
3. Añade la variable de entorno `DATABASE_URL`.
4. Despliega.

Al estar construido con Next.js App Router, el proyecto es compatible con despliegue directo en Vercel sin cambios adicionales.

## Relación con el frontend Expo

Este backend está pensado para ser consumido por el frontend principal de NoteFlow Dev. En la app Expo, la variable:

```env
EXPO_PUBLIC_API_URL=
```

debe apuntar a esta API, por ejemplo:

- desarrollo web o simulador: `http://localhost:3000/api`
- iPhone físico con Expo Go: `http://IP_DEL_MAC:3000/api`
