# NoteFlow Dev

NoteFlow Dev es una aplicación de productividad orientada a estudiantes DAM y desarrolladores junior. El proyecto separa con claridad un frontend móvil construido con Expo y un backend independiente con Next.js, pensado para evolucionar sin mezclar responsabilidades.

El frontend resuelve la experiencia diaria de trabajo: apuntes, checklists, ideas, sesiones de enfoque y paneles visuales de productividad. El backend se encarga de exponer una API REST limpia sobre PostgreSQL para la futura sincronización de datos.

## Stack

### Frontend móvil

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Zod
- AsyncStorage
- Expo Linear Gradient
- Expo Haptics

### Backend

- Next.js App Router
- TypeScript
- Neon PostgreSQL
- Zod

## Qué incluye el proyecto

- Creación de apuntes, tareas tipo checklist e ideas
- Persistencia remota contra una API REST real
- Gestión de checklist items desde el backend
- Fechas de inicio y fin persistidas en PostgreSQL
- Navegación móvil con Expo Router
- Estado global con Zustand y sincronización contra servidor

## Estructura del proyecto

```text
root/
├── app/                  # Rutas y pantallas Expo Router
├── assets/               # Recursos estáticos del frontend
├── components/           # Componentes reutilizables del frontend
├── constants/            # Tokens visuales y constantes
├── docs/                 # Documentación general del proyecto
├── lib/                  # Capa de acceso a la API del frontend
├── noteflow-api/         # Backend independiente con Next.js
├── store/                # Estado global con Zustand
├── types/                # Tipos TypeScript compartidos
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Frontend Expo

El cliente móvil está organizado con Expo Router y una navegación principal por pestañas:

- `Notas`: dashboard principal y acceso a apuntes
- `Checklists`: seguimiento de tareas y progreso
- `Ideas`: espacio para ideas y mejoras
- `Nueva nota`: flujo modal para crear entradas nuevas

El estado del frontend se gestiona con Zustand en [store/notesStore.ts](/Users/adri/Developer/noteflow/store/notesStore.ts). La fuente principal de verdad es la API. AsyncStorage queda únicamente como caché local opcional para mejorar el arranque y mantener cierta resiliencia.

### Variable de entorno del frontend

Crear un archivo local a partir de [.env.example](/Users/adri/Developer/noteflow/.env.example) y definir la URL base de la API:

```env
EXPO_PUBLIC_API_URL=
```

Valores recomendados:

- simulador o navegador local:
  - `http://localhost:3000/api`
- iPhone físico con Expo Go:
  - `http://192.168.1.X:3000/api`

### Instalar frontend

```bash
npm install
```

### Ejecutar frontend

```bash
npx expo start -c
```

La app necesita que el backend esté levantado y que `EXPO_PUBLIC_API_URL` apunte a la URL correcta de la API.

### Validar tipos del frontend

```bash
npx tsc --noEmit
```

## Backend Next.js

El backend vive exclusivamente en [noteflow-api](/Users/adri/Developer/noteflow/noteflow-api) y no forma parte del árbol de Expo Router. Su objetivo es proporcionar una API REST desacoplada, segura y preparada para crecimiento.

### Variables de entorno del backend

Crear [noteflow-api/.env.local](/Users/adri/Developer/noteflow/noteflow-api/.env.local) a partir de [noteflow-api/.env.example](/Users/adri/Developer/noteflow/noteflow-api/.env.example):

```env
DATABASE_URL=
```

Nunca debe incluirse la cadena real de Neon en el frontend móvil ni en el repositorio.

### Instalar backend

```bash
cd noteflow-api
npm install
```

### Ejecutar backend

```bash
cd noteflow-api
npm run dev
```

Servidor local por defecto:

- `http://localhost:3000`

### Endpoints principales

- `GET /api/notes`
- `POST /api/notes`
- `GET /api/notes/:id`
- `PATCH /api/notes/:id`
- `DELETE /api/notes/:id`
- `GET /api/notes/:id/checklist-items`
- `POST /api/notes/:id/checklist-items`
- `PATCH /api/checklist-items/:itemId`
- `DELETE /api/checklist-items/:itemId`

## Flujo recomendado de arranque local

1. Arrancar el backend:

```bash
cd /Users/adri/Developer/noteflow/noteflow-api
npm install
npm run dev
```

2. Configurar la URL de la API en el frontend:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

En iPhone físico con Expo Go, sustituir `localhost` por la IP local del Mac.

3. Arrancar el frontend:

```bash
cd /Users/adri/Developer/noteflow
npm install
npx expo start -c
```

## PostgreSQL con Neon

La base de datos del backend utiliza Neon PostgreSQL. El esquema SQL y las consultas de referencia viven en:

- [noteflow-api/sql/schema.sql](/Users/adri/Developer/noteflow/noteflow-api/sql/schema.sql)
- [noteflow-api/sql/queries.sql](/Users/adri/Developer/noteflow/noteflow-api/sql/queries.sql)

## Documentación disponible

### Proyecto general

- [docs/idea.md](/Users/adri/Developer/noteflow/docs/idea.md)
- [docs/project-management.md](/Users/adri/Developer/noteflow/docs/project-management.md)
- [docs/ai-setup.md](/Users/adri/Developer/noteflow/docs/ai-setup.md)
- [docs/react-native-teoria.md](/Users/adri/Developer/noteflow/docs/react-native-teoria.md)

### Backend

- [noteflow-api/README.md](/Users/adri/Developer/noteflow/noteflow-api/README.md)
- [noteflow-api/docs/backend-teoria.md](/Users/adri/Developer/noteflow/noteflow-api/docs/backend-teoria.md)
- [noteflow-api/docs/seguridad-api.md](/Users/adri/Developer/noteflow/noteflow-api/docs/seguridad-api.md)

## Puesta en marcha rápida

### Solo frontend

```bash
cd /Users/adri/Developer/noteflow
npx expo start -c
```

Con el backend local activo, Expo leerá `EXPO_PUBLIC_API_URL` para cargar y mutar datos reales.

### Solo backend

```bash
cd /Users/adri/Developer/noteflow/noteflow-api
npm run dev
```

## Estado actual

El proyecto ya separa claramente:

- cliente móvil Expo
- backend Next.js
- documentación funcional y técnica

La base ya está preparada para evaluación técnica, instalación en otro equipo y evolución futura sin mezclar frontend y backend en la misma capa.

## Repositorio

- [GitHub - AdriSantosVera/noteflo](https://github.com/AdriSantosVera/noteflo)
