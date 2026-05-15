# Gestión del proyecto

## Flujo de trabajo con Trello

Para la organización del desarrollo de NoteFlow se utiliza un tablero en Trello basado en la metodología Kanban. Este sistema permite visualizar el estado de cada tarea y mantener un control claro del progreso del proyecto.

El tablero se estructura en las siguientes columnas:

- Backlog
- Todo
- In Progress
- Review
- Done

---

## Función de cada columna

### Backlog

Espacio destinado a ideas, mejoras, posibles funcionalidades futuras y deuda técnica que aún no han sido planificadas para su desarrollo inmediato.

### Todo

Incluye las tareas que ya han sido definidas con claridad y están listas para comenzar en el corto plazo.

### In Progress

Contiene las tareas que se encuentran en desarrollo. Es recomendable limitar el número de elementos en esta columna para evitar la dispersión y mantener un flujo de trabajo eficiente.

### Review

Fase de validación donde se revisa el trabajo realizado. Puede incluir comprobaciones de funcionamiento, revisión de código, pruebas de experiencia de usuario o ajustes técnicos.

### Done

Agrupa todas las tareas que han sido completadas y verificadas correctamente.

---

## Tarjetas recomendadas

Para estructurar el desarrollo del proyecto, se proponen las siguientes tarjetas principales:

- Inicialización del proyecto con Expo, TypeScript y Expo Router.
- Diseño de la navegación principal y estructura de pestañas.
- Desarrollo base del módulo de notas.
- Desarrollo base del módulo de checklists.
- Desarrollo base del módulo de ideas.
- Creación de componentes de interfaz reutilizables.
- Configuración del estado global con Zustand.
- Definición del sistema de diseño y tokens visuales.
- Implementación de persistencia local con AsyncStorage.
- Desarrollo del sistema de búsqueda y filtrado.
- Redacción de la documentación y decisiones de arquitectura.

---

## Subtareas técnicas sugeridas

Cada tarjeta puede dividirse en subtareas más concretas para facilitar su desarrollo:

- Definir una arquitectura de carpetas basada en funcionalidades.
- Crear y organizar las interfaces compartidas en TypeScript.
- Configurar las rutas base utilizando Expo Router.
- Establecer constantes globales para el sistema visual (tema).
- Implementar el store inicial con Zustand.
- Diseñar componentes reutilizables para los distintos tipos de contenido.
- Añadir `schemas` por funcionalidad para futuras validaciones.
- Preparar una capa de abstracción para la gestión del almacenamiento.
- Documentar las decisiones técnicas y el flujo de trabajo del proyecto.