# Módulos nativos y permisos

Referencia de los módulos nativos instalados, los permisos que solicitan y cómo se gestionan los casos de denegación.

---

## expo-notifications (`~0.32`)

### Permisos solicitados
| Plataforma | Permiso |
|---|---|
| iOS | `NSUserNotificationUsageDescription` (gestionado por el plugin) |
| Android | `POST_NOTIFICATIONS` (API 33+, gestionado automáticamente) |

### Cuándo se pide
Al iniciar sesión (`app/_layout.tsx`) mediante `requestNotificationPermissions()`.

### Flujo
1. `requestNotificationPermissions()` → comprueba si ya está concedido.
2. Si no → lanza el diálogo del sistema.
3. Si el usuario deniega → `promptOpenSettings()` muestra un `Alert` con botón "Abrir ajustes" que llama a `Linking.openSettings()`.

### Canal Android
`setupAndroidChannel()` crea el canal `noteflow-reminders` con importancia `HIGH` antes de programar cualquier notificación.

### Archivos relevantes
- `lib/notifications.ts` — servicio completo
- `app/_layout.tsx` — solicitud de permisos al autenticarse
- `app/(tabs)/notas/[id].tsx` — botón "Programar recordatorio"
- `app/(tabs)/ideas/[id].tsx` — botón "Programar recordatorio"

---

## expo-location (`~19.0`)

### Permisos solicitados
| Plataforma | Permiso |
|---|---|
| iOS | `NSLocationWhenInUseUsageDescription` |
| Android | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` (gestionados por el plugin) |

### Cuándo se pide
Al pulsar "Añadir ubicación actual" en `nueva-nota.tsx`, solo cuando el usuario lo solicita explícitamente.

### Flujo
1. `requestLocationPermission()` → comprueba si ya está concedido (`getForegroundPermissionsAsync`).
2. Si no → lanza `requestForegroundPermissionsAsync()`.
3. Si el usuario deniega → `promptOpenLocationSettings()` muestra un `Alert` con botón "Abrir ajustes".
4. Si se concede → `getCurrentLocation()` obtiene coordenadas con `Accuracy.Balanced`.
5. `reverseGeocodeAsync()` convierte coordenadas en nombre legible (ciudad, región, país). Si falla, usa `"lat, lon"` como fallback.

### Datos guardados por nota
| Campo | Tipo SQL | Descripción |
|---|---|---|
| `latitude` | `DOUBLE PRECISION` | Latitud decimal |
| `longitude` | `DOUBLE PRECISION` | Longitud decimal |
| `location_name` | `TEXT` | Nombre legible (ej. "Madrid, Community of Madrid, Spain") |

Los tres campos son opcionales (`NULL` si la nota se creó sin ubicación).

### Migración aplicada en Neon
```sql
ALTER TABLE notes ADD COLUMN IF NOT EXISTS latitude      DOUBLE PRECISION;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS longitude     DOUBLE PRECISION;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS location_name TEXT;
```

### Archivos relevantes
- `lib/location.ts` — servicio completo
- `app/nueva-nota.tsx` — botón "Añadir ubicación actual"
- `app/(tabs)/notas/[id].tsx` — muestra `location_name` si existe
- `app/(tabs)/ideas/[id].tsx` — muestra `location_name` si existe
- `noteflow-api/app/api/notes/route.ts` — POST acepta y devuelve ubicación
- `noteflow-api/app/api/notes/[id]/route.ts` — PATCH acepta y devuelve ubicación
- `types/index.ts` — `BaseNote` y `ApiNote` incluyen los tres campos
- `lib/api.ts` — `CreateNotePayload` y `UpdateNotePayload` incluyen los tres campos

### Notas de prueba
- **Simulador iOS:** Features → Location → Custom Location → introducir coordenadas (ej. 40.4168, -3.7038 para Madrid).
- **Dispositivo físico:** cualquier ubicación real funciona directamente.
- **Permiso denegado:** revocar en Ajustes → NoteFlow → Ubicación → Nunca, luego pulsar el botón en la app.
- **Verificar en Neon:** `SELECT id, title, latitude, longitude, location_name FROM notes WHERE location_name IS NOT NULL ORDER BY created_at DESC LIMIT 5;`
