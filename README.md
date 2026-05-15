# NoteFlow Dev

NoteFlow Dev es una aplicación móvil desarrollada con Expo, React Native y TypeScript para organizar apuntes, tareas técnicas e ideas dentro de una experiencia de productividad enfocada en estudiantes DAM y desarrolladores junior.

La aplicación combina una interfaz visual moderna con una base funcional sólida: creación de contenido, checklists interactivas, sesiones de enfoque y paneles de análisis de actividad.

## Características principales

- Dashboard principal con resumen semanal de productividad
- Gestión de apuntes técnicos
- Gestión de checklists con progreso dinámico
- Gestión de ideas con organización visual
- Creación de contenido desde un formulario unificado
- Validación de formularios con Zod
- Persistencia local con Zustand + AsyncStorage
- Sesiones de enfoque con selección de prioridad y duración
- Paneles visuales de análisis y calendario

## Stack tecnológico

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand
- Zod
- AsyncStorage
- Expo Linear Gradient
- Expo Haptics

## Arquitectura

El proyecto sigue una organización orientada a escalabilidad, con separación clara entre rutas, estado global, tipos compartidos y componentes reutilizables.

```text
app/
  _layout.tsx
  nueva-nota.tsx
  (tabs)/
    _layout.tsx
    notas/
    checklists/
    ideas/

components/
  ui/
  layout/
  items/

store/
types/
constants/
docs/
assets/
```

## Navegación

La navegación se construye con Expo Router.

- `Notas`: dashboard principal y acceso a apuntes
- `Checklists`: seguimiento de tareas y progreso
- `Ideas`: exploración y gestión de ideas
- `Nueva nota`: formulario modal para crear apuntes, tareas o ideas

## Estado y persistencia

El estado global se gestiona con Zustand en `store/notesStore.ts`.

Actualmente se persisten de forma local:

- notas
- checklists
- ideas
- progreso de checklist

## Experiencia de usuario

La interfaz está diseñada con una línea visual oscura y premium, usando gradientes suaves, paneles tipo glassmorphism y una jerarquía visual limpia.

Entre los comportamientos destacados:

- feedback visual al completar tareas
- progreso animado en checklists
- modales integrados para análisis y enfoque
- sesión de enfoque con pausa, reanudación, cancelación y cambio de prioridad

## Requisitos

- Node.js
- npm
- Expo CLI a través de `npx`

## Puesta en marcha

Instalar dependencias:

```bash
npm install
```

Iniciar el entorno de desarrollo:

```bash
npx expo start
```

Comprobar tipos:

```bash
npx tsc --noEmit
```

## Documentación complementaria

La carpeta `docs/` recoge la documentación base del proyecto:

- `idea.md`
- `project-management.md`
- `ai-setup.md`
- `react-native-teoria.md`

## Repositorio

- [GitHub - AdriSantosVera/noteflo](https://github.com/AdriSantosVera/noteflo)
