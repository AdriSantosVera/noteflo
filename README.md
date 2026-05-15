# NoteFlow Dev

Aplicación móvil creada con Expo, React Native y TypeScript para ayudar a estudiantes DAM y desarrolladores junior a organizar apuntes, tareas técnicas, ideas y sesiones de enfoque dentro de una experiencia visual clara, moderna y orientada a productividad.

## Estado actual

La base funcional del proyecto ya permite:

- crear apuntes, tareas e ideas
- guardar datos con persistencia local usando Zustand + AsyncStorage
- gestionar checklists con progreso interactivo
- abrir vistas de detalle
- usar un panel de enfoque con sesión activa, pausa, reanudación y cancelación
- navegar por tabs con Expo Router

## Stack principal

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Zod
- AsyncStorage
- Expo Linear Gradient
- Expo Haptics

## Estructura principal

```text
app/
components/
constants/
store/
types/
docs/
assets/
```

## Navegación

- `app/_layout.tsx` configura el `Stack` raíz.
- `app/(tabs)/_layout.tsx` configura las tabs principales.
- `app/nueva-nota.tsx` centraliza la creación de apuntes, tareas e ideas.

## Estado global

El estado global vive en [store/notesStore.ts](/Users/adri/Developer/noteflow/store/notesStore.ts) y actualmente persiste:

- notas
- checklists
- ideas
- progreso de checklist

## Documentación

La carpeta `docs/` contiene la base teórica y organizativa del proyecto:

- `idea.md`
- `project-management.md`
- `ai-setup.md`
- `react-native-teoria.md`

## Limpieza del repositorio

- Los restos de proyectos web y backend anteriores se han movido a `_backup_limpieza/`.
- El repositorio activo queda centrado en el entregable React Native + Expo.
