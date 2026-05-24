# Seguridad de la API

## SQL injection

La inyección SQL ocurre cuando una aplicación construye consultas concatenando directamente datos controlados por el usuario. Si eso sucede, un atacante puede alterar la consulta original y leer, modificar o borrar información de la base de datos.

## Ejemplo vulnerable

```ts
const text = req.body.text;
const sql = `SELECT * FROM notes WHERE title = '${text}'`;
```

Si el usuario envía un valor malicioso, la consulta resultante puede romper la lógica prevista o ejecutar condiciones inesperadas.

## Ejemplo seguro con consultas parametrizadas

```ts
const text = req.body.text;
await query("SELECT * FROM notes WHERE title = $1", [text]);
```

Aquí el valor del usuario viaja separado de la estructura SQL. PostgreSQL lo trata como dato y no como parte del comando.

## Variables de entorno

Las credenciales y cadenas de conexión nunca deben escribirse directamente en el código fuente. En este proyecto, `DATABASE_URL` vive en `.env.local`, mientras que el repositorio solo comparte un `.env.example` vacío para indicar qué variable hace falta.

## Por qué DATABASE_URL nunca debe estar en la app móvil

La app móvil se distribuye al dispositivo del usuario. Si `DATABASE_URL` se incluyera en el cliente Expo, cualquier persona podría extraerla, conectarse a la base de datos y operar fuera del control del backend.

El backend actúa como barrera de seguridad:

- valida los datos antes de llegar a PostgreSQL,
- limita qué operaciones son posibles,
- centraliza reglas de negocio,
- evita exponer credenciales reales.

## Buenas prácticas aplicadas en NoteFlow API

- Todas las consultas se envían con parámetros.
- No se concatenan datos del usuario en sentencias SQL.
- Los errores internos de base de datos no se devuelven al cliente.
- La API responde con mensajes genéricos como `{ "error": "Error interno" }`.
- La lógica de acceso a datos se concentra en el servidor.
