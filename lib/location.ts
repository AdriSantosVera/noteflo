import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

export type LocationData = {
  latitude: number;
  longitude: number;
  location_name: string;
};

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: current } = await Location.getForegroundPermissionsAsync();

  if (current === 'granted') return true;

  const { status } = await Location.requestForegroundPermissionsAsync();

  return status === 'granted';
}

export function promptOpenLocationSettings(): void {
  Alert.alert(
    'Permisos de ubicación',
    'La ubicación está desactivada. Abre los ajustes de la app para habilitarla.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abrir ajustes', onPress: () => void Linking.openSettings() },
    ]
  );
}

export async function getCurrentLocation(): Promise<LocationData | null> {
  if (Platform.OS === 'web') return null;

  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    const location_name = await resolveLocationName(latitude, longitude);

    return { latitude, longitude, location_name };
  } catch {
    return null;
  }
}

async function resolveLocationName(lat: number, lon: number): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });

    const place = results[0];

    if (!place) return formatCoords(lat, lon);

    const parts = [place.city ?? place.district, place.region, place.country]
      .filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : formatCoords(lat, lon);
  } catch {
    return formatCoords(lat, lon);
  }
}

function formatCoords(lat: number, lon: number): string {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}
