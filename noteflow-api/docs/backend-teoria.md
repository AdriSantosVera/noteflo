# Backend de NoteFlow Dev

## Por qué la app móvil no debe conectarse directamente a PostgreSQL

La app móvil no debería hablar con PostgreSQL de forma directa porque eso obligaría a incluir credenciales sensibles en el cliente. En una aplicación móvil, el código se distribuye al dispositivo del usuario y, por tanto, cualquier secreto incrustado puede terminar expuesto. Además, delegar toda la lógica en el cliente dificulta validar datos, aplicar reglas de negocio y proteger la base de datos frente a accesos indebidos.

La solución correcta es aplicar un patrón cliente-servidor: la app móvil actúa como cliente y un backend intermedio se encarga de validar, transformar y persistir la información. De ese modo, la base de datos queda aislada detrás de una API controlada.

## Patrón cliente-servidor

En este modelo existen dos partes principales:

- Cliente: la app Expo/React Native que muestra la interfaz y recoge acciones del usuario.
- Servidor: la API que recibe peticiones HTTP, valida datos y ejecuta operaciones sobre PostgreSQL.

Esta separación facilita escalar, mantener y securizar el sistema.

## Qué es una API REST

Una API REST es una interfaz basada en HTTP que expone recursos a través de rutas. En este proyecto, un recurso puede ser una nota o un item de checklist. Cada recurso tiene una URL y se manipula mediante métodos HTTP estándar.

## Métodos HTTP

- `GET`: lee información.
- `POST`: crea un recurso nuevo.
- `PATCH`: actualiza parcialmente un recurso existente.
- `DELETE`: elimina un recurso.

## Códigos de estado

- `200 OK`: la petición se resolvió correctamente.
- `201 Created`: se creó un recurso.
- `204 No Content`: la operación fue correcta y no devuelve cuerpo.
- `400 Bad Request`: los datos enviados no son válidos.
- `404 Not Found`: el recurso no existe.
- `500 Internal Server Error`: ocurrió un error inesperado en el servidor.

## Bases de datos relacionales

Una base de datos relacional organiza la información en tablas conectadas entre sí mediante claves. Esta estructura resulta adecuada cuando los datos tienen relaciones claras, como una nota y sus items de checklist o una nota y sus etiquetas.

## ACID

Las bases de datos relacionales modernas siguen propiedades ACID:

- Atomicidad: una operación se completa entera o no se aplica.
- Consistencia: los datos siempre respetan las reglas definidas.
- Aislamiento: varias operaciones concurrentes no se pisan entre sí.
- Durabilidad: una vez confirmados, los cambios persisten.

## Primary Key

La clave primaria identifica cada fila de manera única. En este backend se usan UUIDs para evitar colisiones y facilitar generación segura de identificadores.

## Foreign Key

La clave foránea conecta tablas entre sí. `checklist_items.note_id` apunta a `notes.id`, lo que permite saber a qué nota pertenece cada item.

## ON DELETE CASCADE

`ON DELETE CASCADE` hace que, al eliminar una nota, PostgreSQL borre automáticamente sus items y etiquetas relacionados. Esto evita datos huérfanos y simplifica el backend.

## DDL vs DML

- DDL: define la estructura de la base de datos. Ejemplos: `CREATE TABLE`, `ALTER TABLE`.
- DML: manipula datos ya existentes. Ejemplos: `SELECT`, `INSERT`, `UPDATE`, `DELETE`.

## INNER JOIN vs LEFT JOIN

- `INNER JOIN` devuelve solo filas que tienen coincidencia en ambas tablas.
- `LEFT JOIN` devuelve todas las filas de la tabla izquierda aunque no tengan relaciones.

En NoteFlow Dev interesa `LEFT JOIN` para que una nota siga apareciendo aunque aún no tenga items ni tags.

## Diagrama entidad-relación en texto

```text
notes
  id (PK)
  title
  type
  content
  color
  start_date
  end_date
  created_at
  updated_at

checklist_items
  id (PK)
  note_id (FK -> notes.id)
  text
  is_completed
  created_at
  updated_at

note_tags
  id (PK)
  note_id (FK -> notes.id)
  tag
  created_at
```

Relaciones:

- Una `note` puede tener muchos `checklist_items`.
- Una `note` puede tener muchos `note_tags`.
- Un `checklist_item` pertenece a una sola `note`.
- Un `note_tag` pertenece a una sola `note`.
