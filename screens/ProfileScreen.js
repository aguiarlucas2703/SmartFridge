// SmartFridge — ProfileScreen
// Exibe os dados do perfil e permite logout.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function ProfileScreen() {
  const { profile, pantry, logout } = useProfile();
  const { favorites } = useFavorites();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza? Seus ingredientes e favoritos serão mantidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
              // RootNavigator detecta profile null e redireciona automaticamente
            } catch {
              Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar e nome */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{profile?.avatarEmoji}</Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.userTag}>Usuário SmartFridge</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pantry.length}</Text>
            <Text style={styles.statLabel}>Ingredientes{'\n'}na Despensa</Text>
            <Text style={styles.statEmoji}>🧺</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Receitas{'\n'}Favoritas</Text>
            <Text style={styles.statEmoji}>❤️</Text>
          </View>
        </View>

        {/* Sobre o app */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sobre o SmartFridge</Text>
          <Text style={styles.infoText}>
            SmartFridge sugere receitas com base nos ingredientes que você já tem em casa.
            Conectado à TheMealDB para receitas reais do mundo todo.
          </Text>
          <View style={styles.divider} />
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>API</Text>
            <Text style={styles.techValue}>TheMealDB (gratuita)</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Storage</Text>
            <Text style={styles.techValue}>AsyncStorage (offline-first)</Text>
          </View>
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Framework</Text>
            <Text style={styles.techValue}>React Native + Expo</Text>
          </View>
        </View>

        {/* Botão de logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, isLoggingOut && styles.logoutBtnDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>
            {isLoggingOut ? 'Saindo...' : '🚪 Sair da Conta'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>SmartFridge v1.0 · N1-2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 12,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarEmoji: {
    fontSize: 52,
  },
  name: {
    ...typography.styles.title,
    color: colors.primary,
  },
  userTag: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  statEmoji: {
    fontSize: 22,
    marginTop: 2,
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  infoTitle: {
    ...typography.styles.subtitle,
    color: colors.primary,
    marginBottom: 2,
  },
  infoText: {
    ...typography.styles.body,
    color: colors.textMuted,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  techValue: {
    ...typography.styles.caption,
    color: colors.text,
    fontWeight: '500',
  },
  logoutBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.error,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutBtnDisabled: {
    opacity: 0.5,
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },
});
