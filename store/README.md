# store

Aquí vive el estado global de la aplicación.

Actualmente se usa Zustand con persistencia local para conservar:

- notas
- checklists
- ideas
- progreso de tareas

El estado de interfaz temporal que solo afecta a una pantalla concreta debería quedarse cerca de esa pantalla o feature.
