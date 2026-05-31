# Flujo de imagen de perfil en NoteFlow Dev

## Alcance de esta fase

En esta fase no se suben archivos a AWS S3 todavía. El objetivo es preparar la experiencia de selección de imagen en una aplicación compatible con Expo Go.

Actualmente el flujo cubre:

- solicitud de permiso a la galería
- selección de imagen desde el dispositivo
- recorte básico cuadrado
- previsualización local del avatar en la interfaz

## Por qué se usa expo-image-picker

Se usa `expo-image-picker` porque funciona con Expo Go y permite acceder a la galería sin introducir módulos nativos adicionales ni cambiar el flujo de desarrollo actual.

## Flujo actual

1. El usuario abre el panel de perfil desde la pantalla principal.
2. Pulsa `Cambiar foto de perfil`.
3. La app solicita permiso para acceder a la galería.
4. Si el permiso es concedido, se abre el selector de imágenes del sistema.
5. El usuario elige una imagen y puede recortarla.
6. La app recibe una `uri` local (`result.assets[0].uri`).
7. Esa `uri` se usa para mostrar una previsualización inmediata en el avatar.

## Estado actual del dato

En esta fase, la imagen elegida:

- se usa como **preview local**
- no se sube todavía a AWS S3
- no se persiste como archivo remoto

El campo `avatarUrl` en Firestore sigue reservado para la fase siguiente, donde se usará una URL pública real obtenida después de subir el archivo a S3.

## Fase siguiente

La siguiente iteración del flujo será:

1. La app selecciona la imagen con `expo-image-picker`.
2. La app pide una `presigned URL` al backend.
3. El backend firma la subida a S3.
4. La app sube el archivo directamente a AWS S3.
5. La app guarda la `publicUrl` resultante en Firestore.
6. La UI renderiza el avatar usando esa URL remota.
