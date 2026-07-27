// SmartFridge — CreateProfileScreen
// Primeiro fluxo do app: criação de perfil com nome e avatar emoji.
// Persiste via ProfileContext → AsyncStorage.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';

const AVATARS = ['🧑‍🍳', '👩‍🍳', '🧑', '👩', '👨', '🐱', '🦊', '🐸', '🌻', '🍕', '🥑', '🍜'];

export default function CreateProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const { createProfile } = useProfile();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Animação de escala no botão
  const buttonScale = useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Ops!', 'Digite seu nome para continuar.');
      return;
    }
    animateButton();
    setIsLoading(true);
    try {
      await createProfile({ name: name.trim(), avatarEmoji: selectedAvatar });
      // RootNavigator detecta o profile e redireciona automaticamente
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar seu perfil. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🌿 SmartFridge</Text>
            <Text style={styles.title}>Boas-vindas!</Text>
            <Text style={styles.subtitle}>
              Vamos criar seu perfil para começar a descobrir receitas incríveis.
            </Text>
          </View>

          {/* Avatar selecionado */}
          <View style={styles.avatarDisplay}>
            <Text style={styles.avatarLarge}>{selectedAvatar}</Text>
          </View>

          {/* Grid de avatares */}
          <Text style={styles.sectionLabel}>ESCOLHA SEU AVATAR</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => setSelectedAvatar(emoji)}
                style={[
                  styles.avatarOption,
                  selectedAvatar === emoji && styles.avatarOptionSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.avatarEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input de nome */}
          <Text style={styles.sectionLabel}>SEU NOME</Text>
          <TextInput
            style={styles.input}
            placeholder="Como quer ser chamado?"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={30}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />

          {/* Botão CTA */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Salvando...' : 'Começar a Cozinhar 🍳'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  title: {
    ...typography.styles.hero,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  avatarDisplay: {
    alignItems: 'center',
    marginVertical: 16,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  avatarLarge: {
    fontSize: 52,
  },
  sectionLabel: {
    ...typography.styles.label,
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarOption: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});


