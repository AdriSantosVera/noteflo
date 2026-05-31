import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    clearAuthError();
    setLocalError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setLocalError('Debes completar nombre, correo y contraseña.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(email, password, name);
      router.replace('/(tabs)/notas');
    } catch {
      // El store ya refleja el error visible.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroBlock}>
            <Text style={styles.eyebrow}>Perfil personal</Text>
            <Text style={styles.title}>Crea tu cuenta en NoteFlow Dev.</Text>
            <Text style={styles.subtitle}>
              El registro crea el usuario en Firebase Auth y el perfil básico
              en Firestore.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Registro</Text>
            <Text style={styles.sectionSubtitle}>
              Necesitamos tu nombre, correo y una contraseña segura.
            </Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Tu nombre visible"
                placeholderTextColor="#667391"
                style={styles.input}
                value={name}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Correo</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="tu-correo@ejemplo.com"
                placeholderTextColor="#667391"
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="password-new"
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#667391"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            {localError ? <Text style={styles.errorText}>{localError}</Text> : null}
            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            <Pressable
              disabled={isSubmitting}
              onPress={() => {
                void handleRegister();
              }}
              style={styles.primaryAction}
            >
              <LinearGradient
                colors={['#6B6CFF', '#35D4F8']}
                end={{ x: 1, y: 0.5 }}
                start={{ x: 0, y: 0.5 }}
                style={styles.gradientButton}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#F5F7FF" />
                ) : (
                  <Text style={styles.primaryActionText}>Crear cuenta</Text>
                )}
              </LinearGradient>
            </Pressable>

            <Link href="/login" style={styles.secondaryLink}>
              Ya tengo cuenta
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070A12',
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#070A12',
  },
  heroBlock: {
    marginBottom: 24,
  },
  eyebrow: {
    color: '#8AA0D2',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F4F7FF',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    color: '#9AA9C8',
    fontSize: 17,
    lineHeight: 28,
    marginTop: 12,
  },
  card: {
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    borderColor: 'rgba(121, 140, 179, 0.18)',
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
  },
  sectionTitle: {
    color: '#F4F7FF',
    fontSize: 26,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#8D9BB9',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  fieldBlock: {
    marginTop: 18,
  },
  label: {
    color: '#DDE6FF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#090E1A',
    borderColor: 'rgba(121, 140, 179, 0.18)',
    borderRadius: 18,
    borderWidth: 1,
    color: '#F4F7FF',
    fontSize: 17,
    minHeight: 58,
    paddingHorizontal: 18,
  },
  errorText: {
    color: '#F5A6A6',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
  primaryAction: {
    marginTop: 22,
  },
  gradientButton: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 58,
  },
  primaryActionText: {
    color: '#F6FBFF',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryLink: {
    color: '#81C7FF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
});
