# Autenticación y perfil en NoteFlow Dev

## Por qué se usa Firebase JS SDK

En esta fase se usa la librería oficial `firebase` del JavaScript SDK porque es compatible con Expo Go sin necesidad de generar un Development Build. Esto permite desarrollar y probar el flujo de autenticación directamente con la app Expo estándar.

## Diferencia con @react-native-firebase

Las librerías `@react-native-firebase/app`, `@react-native-firebase/auth` y `@react-native-firebase/firestore` dependen de módulos nativos. Eso obliga a usar Development Build o compilación nativa específica. Como en esta etapa el objetivo es mantener compatibilidad directa con Expo Go, se evita esa opción.

## Firebase Auth

Firebase Authentication se utiliza para registrar e iniciar sesión con correo y contraseña. El flujo básico es:

1. El usuario rellena nombre, correo y contraseña en `registro`.
2. La app crea la cuenta en Firebase Auth.
3. La sesión queda persistida en el dispositivo.
4. El usuario autenticado puede entrar en las rutas principales de la app.

Para login, la app usa el mismo proveedor de correo y contraseña y restaura la sesión al reiniciar.

## Firestore

Además de crear el usuario en Auth, esta fase crea un documento en:

`users/{uid}`

Con el siguiente perfil básico:

- `uid`
- `name`
- `email`
- `createdAt`
- `avatarUrl: null`

Este documento desacopla el perfil de aplicación del proveedor de autenticación y deja preparada la evolución futura del sistema.

## Persistencia de sesión

En esta fase, la sesión se mantiene usando la persistencia local por defecto del Firebase JS SDK. Es la opción más segura para seguir siendo compatibles con Expo Go sin introducir dependencias nativas como `@react-native-firebase`.

## Asociación de notas con el usuario

Firebase Auth aporta el identificador único del usuario autenticado:

`uid`

Ese `uid` se envía al backend como `user_id` al crear, consultar o eliminar notas. El backend guarda ese valor en PostgreSQL dentro de la tabla `notes`, y las consultas posteriores filtran por ese mismo identificador.

De esta forma:

- cada nota queda asociada a un único usuario
- cada usuario solo carga sus propias notas
- al cerrar sesión, la app deja de mostrar notas privadas

Esta fase no protege todavía la API con tokens de Firebase, pero sí introduce la primera capa de ownership funcional usando el `uid` autenticado como criterio de aislamiento de datos.

## Protección de rutas

La protección se hace en `app/_layout.tsx`:

- si no hay usuario autenticado, la app redirige a `login`
- si hay usuario autenticado, la app permite el acceso a `/(tabs)` y `nueva-nota`

De esta forma, el dashboard principal y las pantallas funcionales quedan detrás de la sesión sin tocar todavía el backend ni proteger `/api/notes` con tokens.

## Alcance de esta fase

Esta fase solo cubre:

- registro
- login
- logout
- sesión persistida
- perfil básico en Firestore
- rutas protegidas

No cubre todavía:

- protección del backend con JWT o Firebase tokens
- control de ownership sobre notas
- subida de imágenes
- integración con AWS
