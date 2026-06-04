# NoteFlow Dev

NoteFlow Dev es una aplicación móvil de productividad orientada a estudiantes DAM y perfiles junior de desarrollo. El proyecto combina una app Expo con una API independiente en Next.js para gestionar apuntes, ideas, checklists, autenticación de usuarios y perfil con avatar.

## Descripción del proyecto

La aplicación permite organizar trabajo personal en tres tipos de contenido:

- `Notas`: apuntes y contenido libre.
- `Checklists`: tareas con items completables.
- `Ideas`: propuestas, mejoras o conceptos pendientes de desarrollar.

El sistema incorpora autenticación con Firebase, perfil de usuario en Firestore, persistencia de datos en PostgreSQL (Neon) y subida de avatar a Amazon S3 mediante Presigned URL.

## Tecnologías utilizadas

### Frontend

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Firebase JS SDK
- Firestore
- AsyncStorage
- Expo Image Picker
- Expo Linear Gradient
- Expo Haptics

### Backend

- Next.js App Router
- TypeScript
- Neon PostgreSQL
- Zod
- AWS SDK for JavaScript v3

### Infraestructura y servicios

- Firebase Authentication
- Cloud Firestore
- Amazon S3
- Neon
- Vercel (preparado para despliegue del backend)

## Arquitectura general

El proyecto está dividido en dos capas principales:

1. **Frontend Expo**
   - interfaz móvil/web
   - navegación con Expo Router
   - estado global con Zustand
   - autenticación con Firebase
   - perfil de usuario y avatar

2. **Backend Next.js**
   - API REST para notas y checklist items
   - generación de Presigned URLs para subida de avatar
   - conexión a PostgreSQL en Neon

### Flujo general

```text
Expo App
  ├─ Firebase Auth → identidad del usuario
  ├─ Firestore → perfil (users/{uid})
  ├─ Next.js API → notas, checklists, ideas, presigned URL
  ├─ Neon PostgreSQL → persistencia de datos funcionales
  └─ AWS S3 → almacenamiento del avatar
```

## Estructura de carpetas

```text
noteflow/
├── app/                     # Rutas y pantallas Expo Router
├── assets/                  # Recursos gráficos
├── components/              # Componentes reutilizables UI y cards
├── constants/               # Tema visual y constantes
├── docs/                    # Documentación funcional y técnica
├── lib/                     # Firebase y cliente HTTP del frontend
├── store/                   # Estado global con Zustand
├── types/                   # Tipos de dominio y API
├── noteflow-api/            # Backend Next.js independiente
│   ├── app/api/             # Endpoints REST y subida de avatar
│   ├── docs/                # Documentación backend
│   ├── lib/                 # DB, CORS y utilidades S3
│   └── sql/                 # Esquema y consultas SQL
├── .env.example             # Variables de entorno del frontend
├── app.json
├── package.json
└── README.md
```

## Variables de entorno necesarias

### Frontend (`/.env.local`)

Basado en [/.env.example](/Users/adri/Developer/noteflow/.env.example):

```env
EXPO_PUBLIC_API_URL=

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Valores habituales:

- navegador local:
  - `EXPO_PUBLIC_API_URL=http://localhost:3000/api`
- dispositivo físico con Expo Go:
  - `EXPO_PUBLIC_API_URL=http://IP_LOCAL_DEL_MAC:3000/api`

### Backend (`/noteflow-api/.env.local`)

Basado en [/Users/adri/Developer/noteflow/noteflow-api/.env.example](/Users/adri/Developer/noteflow/noteflow-api/.env.example):

```env
DATABASE_URL=

AWS_REGION=
AWS_S3_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

ALLOWED_ORIGIN=http://localhost:8082
```

## Configuración Firebase

La implementación actual usa **Firebase JS SDK**, lo que permite mantener compatibilidad con **Expo Go** sin generar un Development Build nativo.

### Servicios necesarios

- Authentication
  - proveedor `Email/Password`
- Firestore Database

### Flujo implementado

1. Registro con correo, contraseña y nombre.
2. Creación de usuario en Firebase Auth.
3. Creación de documento en `users/{uid}` en Firestore.
4. Restauración de sesión al reabrir la app.
5. Carga del perfil desde Firestore.

### Documento de perfil

```json
{
  "uid": "user_uid",
  "name": "Nombre del usuario",
  "email": "correo@dominio.com",
  "createdAt": "ISO date",
  "avatarUrl": "https://..."
}
```

## Configuración AWS S3

El avatar no se guarda en Firestore como archivo binario. Solo se guarda la URL final.

### Requisitos

- bucket S3 creado
- credenciales AWS configuradas en `noteflow-api/.env.local`
- CORS del bucket para permitir `PUT` desde desarrollo local
- lectura pública para `avatars/*` si se usa `publicUrl` directa

### Flujo implementado

1. El frontend selecciona una imagen con `expo-image-picker`.
2. El frontend solicita `POST /api/uploads/avatar-url`.
3. El backend genera:
   - `signedUrl`
   - `publicUrl`
4. El frontend sube el archivo con `PUT` directo a S3.
5. La app guarda `publicUrl` en Firestore.
6. El avatar se renderiza con `Image`.

Más detalle en:

- [/Users/adri/Developer/noteflow/docs/image-upload-flow.md](/Users/adri/Developer/noteflow/docs/image-upload-flow.md)

## Instalación paso a paso

### 1. Clonar el proyecto

```bash
git clone https://github.com/AdriSantosVera/noteflo.git
cd noteflo
```

### 2. Instalar dependencias del frontend

```bash
npm install
```

### 3. Instalar dependencias del backend

```bash
cd noteflow-api
npm install
cd ..
```

### 4. Configurar variables de entorno

- crear `/.env.local`
- crear `/noteflow-api/.env.local`

### 5. Arrancar backend

```bash
cd noteflow-api
npm run dev
```

### 6. Arrancar frontend

```bash
cd /Users/adri/Developer/noteflow
npx expo start -c
```

## Validación técnica

### Frontend

```bash
cd /Users/adri/Developer/noteflow
npx tsc --noEmit
```

### Backend

```bash
cd /Users/adri/Developer/noteflow/noteflow-api
npx tsc --noEmit
npm run lint
npm run build
```

## Características implementadas

- Firebase Authentication
- Registro/Login
- Persistencia de sesión
- Firestore Profile
- Gestión de notas
- Gestión de ideas
- Gestión de checklists
- Selección de imágenes
- Subida de imágenes a AWS S3
- Renderizado de avatares
- PostgreSQL (Neon)
- API Next.js

## Funcionalidades implementadas

- Creación de notas, ideas y checklists
- Edición y eliminación de notas
- Gestión de checklist items
- Fechas de inicio y fin persistidas
- Asociación de datos por usuario autenticado
- Rutas públicas y privadas
- Perfil de usuario con avatar
- Carga de avatar desde galería
- Almacenamiento remoto de avatar en S3

## Capturas de pantalla

Sección preparada para añadir material visual antes de la entrega:

- `Login`
- `Registro`
- `Dashboard principal`
- `Nueva nota`
- `Checklists`
- `Ideas`
- `Perfil con avatar`
- `Flujo de subida de imagen`

## Documentación adicional

### Proyecto

- [/Users/adri/Developer/noteflow/docs/idea.md](/Users/adri/Developer/noteflow/docs/idea.md)
- [/Users/adri/Developer/noteflow/docs/project-management.md](/Users/adri/Developer/noteflow/docs/project-management.md)
- [/Users/adri/Developer/noteflow/docs/ai-setup.md](/Users/adri/Developer/noteflow/docs/ai-setup.md)
- [/Users/adri/Developer/noteflow/docs/react-native-teoria.md](/Users/adri/Developer/noteflow/docs/react-native-teoria.md)
- [/Users/adri/Developer/noteflow/docs/auth-profile.md](/Users/adri/Developer/noteflow/docs/auth-profile.md)
- [/Users/adri/Developer/noteflow/docs/image-upload-flow.md](/Users/adri/Developer/noteflow/docs/image-upload-flow.md)

### Backend

- [/Users/adri/Developer/noteflow/noteflow-api/README.md](/Users/adri/Developer/noteflow/noteflow-api/README.md)
- [/Users/adri/Developer/noteflow/noteflow-api/docs/backend-teoria.md](/Users/adri/Developer/noteflow/noteflow-api/docs/backend-teoria.md)
- [/Users/adri/Developer/noteflow/noteflow-api/docs/seguridad-api.md](/Users/adri/Developer/noteflow/noteflow-api/docs/seguridad-api.md)

## Pendiente / Futuras mejoras

- Protección real del backend con verificación de tokens Firebase
- Reglas de seguridad más estrictas en Firestore
- Gestión avanzada de errores y estados offline
- Caché y placeholders mejorados para imágenes remotas
- Soporte de cámara además de galería
- Migración a `@react-native-firebase` si se exige stack nativo
- Despliegue estable de frontend web y backend en producción
- Tests automatizados unitarios e integración
- Mejora del flujo multiusuario y permisos de datos

## Posibles mejoras futuras

- Sincronización en tiempo real
- Etiquetas avanzadas y filtros
- Búsqueda global
- Archivado y restauración
- Notificaciones y recordatorios
- Métricas personales más avanzadas

## Estado de entrega

El proyecto está preparado como base académica profesional:

- frontend funcional con Expo
- backend independiente con Next.js
- autenticación con Firebase
- datos persistidos en Neon
- avatar subido a AWS S3
- documentación técnica preparada para evaluación

## Repositorio

- [GitHub - AdriSantosVera/noteflo](https://github.com/AdriSantosVera/noteflo)
