# Flujo de subida de avatar en NoteFlow Dev

## Objetivo

El avatar del usuario no se guarda como archivo dentro de Firestore. Firestore solo almacena la URL final (`avatarUrl`). El archivo real se sube a Amazon S3 mediante una `Presigned URL`.

## Tecnologías implicadas

- **Expo Go + expo-image-picker**
  - para seleccionar una imagen desde la galería
- **Next.js backend**
  - para generar una URL firmada temporal
- **Amazon S3**
  - para almacenar el archivo binario
- **Firebase Auth**
  - para identificar al usuario mediante `uid`
- **Firestore**
  - para guardar `users/{uid}.avatarUrl`

## Flujo completo

1. El usuario abre el panel de perfil desde la pantalla principal.
2. Pulsa `Cambiar foto de perfil`.
3. La app pide permiso para acceder a la galería.
4. El usuario elige una imagen y puede recortarla.
5. La app obtiene una `uri` local del archivo.
6. Al pulsar `Guardar avatar`, la app:
   - obtiene `fileName`
   - infiere `contentType`
   - usa el `uid` del usuario autenticado
7. La app llama al backend:

`POST /api/uploads/avatar-url`

Con:

- `fileName`
- `contentType`
- `userId`

8. El backend usa AWS SDK para generar:
   - `signedUrl`
   - `publicUrl`

9. La app convierte la `uri` local en `Blob`.
10. La app hace `PUT` directo a `signedUrl`.
11. Si la subida termina correctamente:
   - la app guarda `publicUrl` en Firestore dentro de `users/{uid}.avatarUrl`
12. La interfaz vuelve a renderizar el avatar usando esa `publicUrl`.

## Qué hace el backend

El backend no sube el archivo. Solo:

- valida los datos de entrada
- genera una clave única en S3
- firma temporalmente la subida
- devuelve la URL firmada y la URL pública esperada

Eso reduce carga en el servidor y mantiene el archivo fuera de PostgreSQL y fuera de Firestore.

## Consideraciones de AWS

Para que este flujo funcione correctamente, el bucket S3 debe tener:

- **CORS** para permitir `PUT` y `GET`
- **lectura pública** para que `publicUrl` pueda renderizarse en la app

Si la lectura pública no está permitida:

- la subida puede funcionar
- pero la imagen devolverá `403` al mostrarse

## Estado visual en la app

Durante esta fase:

- si el usuario no tiene avatar, se muestran iniciales
- si selecciona una imagen, se hace preview local
- tras subirla a S3 y guardar `publicUrl`, el avatar pasa a renderizarse desde la URL remota
