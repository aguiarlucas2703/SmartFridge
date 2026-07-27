import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../context/ProfileContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const AVATARS = ['🧑‍🍳', '👩‍🍳', '🧑', '👩', '👨', '🐱', '🦊', '🐸', '🌻', '🍕', '🥑', '🍜'];

export default function EditProfileScreen({ navigation }) {
  const { profile, updateProfile } = useProfile();
  
  const [name, setName] = useState(profile?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatarEmoji || AVATARS[0]);
  const [photoUri, setPhotoUri] = useState(profile?.photoUri || null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para escolher uma foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera para tirar uma foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ops!', 'Seu nome não pode ficar vazio.');
      return;
    }
    setIsLoading(true);
    try {
      await updateProfile({ name: name.trim(), avatarEmoji: selectedAvatar, photoUri });
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar seu perfil.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header com botão de voltar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backEmoji}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>Editar Perfil</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar / Foto Display */}
          <View style={styles.avatarDisplay}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarLarge}>{selectedAvatar}</Text>
            )}
          </View>
          
          <View style={styles.photoActionsRow}>
            <TouchableOpacity style={styles.photoActionBtn} onPress={handlePickImage}>
              <Text style={styles.photoActionText}>📸 Galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoActionBtn} onPress={handleTakePhoto}>
              <Text style={styles.photoActionText}>📷 Câmera</Text>
            </TouchableOpacity>
            {photoUri && (
              <TouchableOpacity style={styles.photoActionBtn} onPress={handleRemovePhoto}>
                <Text style={[styles.photoActionText, { color: colors.error }]}>✕ Remover</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Grid de avatares caso não tenha foto */}
          {!photoUri && (
            <>
              <Text style={styles.sectionLabel}>OU ESCOLHA SEU AVATAR</Text>
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
            </>
          )}

          {/* Input de nome */}
          <Text style={styles.sectionLabel}>COMO QUER SER CHAMADO?</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome..."
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            maxLength={25}
          />

          <View style={styles.spacer} />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backEmoji: {
    fontSize: 24,
    color: colors.primary,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...typography.styles.subtitle,
    color: colors.primary,
  },
  container: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  avatarDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarLarge: {
    fontSize: 64,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  photoActionBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoActionText: {
    ...typography.styles.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1.2,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  avatarOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    ...typography.styles.body,
  },
  spacer: {
    flex: 1,
    minHeight: 32,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
