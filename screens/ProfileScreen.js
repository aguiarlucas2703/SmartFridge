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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import MenuDrawer from '../components/MenuDrawer';
import ConfirmModal from '../components/ConfirmModal';

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const { profile, pantry, logout } = useProfile();
  const { favorites } = useFavorites();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.hamburgerBtn}
          onPress={() => setDrawerVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.hamburgerLine} />
          <View style={[styles.hamburgerLine, { width: 18 }]} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.title}>Meu Perfil</Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Image source={require('../assets/icons/icon_darkmode_2.png')} style={styles.themeIcon} /></TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar e nome */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, profile?.photoUri && { borderWidth: 0 }]}>
            {profile?.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarEmoji}>{profile?.avatarEmoji}</Text>
            )}
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.userTag}>Usuário SmartFridge</Text>

          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editProfileText}>Editar Perfil</Text>
          </TouchableOpacity>
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

      {/* Menu Sanduíche Global */}
      <MenuDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 5,
  },
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  themeBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-end' },
  themeIcon: { width: 24, height: 24, resizeMode: 'contain' },
  title: {
    ...typography.styles.title,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editProfileBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editProfileText: {
    ...typography.styles.caption,
    color: colors.primary,
    fontWeight: '600',
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






