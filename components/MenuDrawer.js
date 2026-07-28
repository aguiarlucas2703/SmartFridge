// SmartFridge — MenuDrawer
// Drawer lateral deslizante com identidade do app e seção "Sobre".
// Implementado com Animated puro — sem dependências adicionais.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';

const DRAWER_WIDTH = 300;

export default function MenuDrawer({ visible, onClose, navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const { pantry, profile } = useProfile();
  const { favorites } = useFavorites();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNav = (tab) => {
    onClose();
    setTimeout(() => navigation.navigate(tab), 250);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop escurecido */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Painel do drawer */}
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX }], paddingTop: insets.top + 16 },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* === Cabeçalho do app === */}
          <View style={styles.brandSection}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.missionBadge}>
              <Text style={styles.missionBadgeText}>♻️ Anti-desperdício</Text>
            </View>
          </View>

          {/* === Separador === */}
          <View style={styles.divider} />

          {/* === Navegação rápida === */}
          <Text style={styles.sectionLabel}>NAVEGAR</Text>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNav('Home')}>
            <Image source={require('../assets/icons/icon_home.png')} style={styles.navIcon} />
            <Text style={styles.navText}>Início</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNav('PantryTab')}>
            <Image source={require('../assets/icons/icon_pantry.png')} style={styles.navIcon} />
            <View style={styles.navRight}>
              <Text style={styles.navText}>Minha Despensa</Text>
              {pantry.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{pantry.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNav('TipsTab')}>
            <Image source={require('../assets/icons/icon_tips.png')} style={styles.navIcon} />
            <Text style={styles.navText}>Dicas Anti-desperdício</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNav('Favorites')}>
            <Image source={require('../assets/icons/icon_favorites.png')} style={styles.navIcon} />
            <View style={styles.navRight}>
              <Text style={styles.navText}>Favoritos</Text>
              {favorites.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{favorites.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNav('Profile')}>
            {profile?.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.navPhoto} />
            ) : (
              <Text style={styles.navEmoji}>{profile?.avatarEmoji || '👤'}</Text>
            )}
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>

          {/* === Separador === */}
          <View style={styles.divider} />

          {/* === Sobre o app === */}
          <Text style={styles.sectionLabel}>SOBRE O APP</Text>

          <View style={styles.sobreCard}>
            <Text style={styles.sobreTitle}>Por que o SmartFridge existe?</Text>
            <Text style={styles.sobreText}>
              Cerca de <Text style={styles.highlight}>1/3 de todo alimento</Text> produzido no
              mundo é desperdiçado. Muito disso acontece dentro de casa, quando não
              sabemos o que fazer com o que está na geladeira.
            </Text>
            <Text style={styles.sobreText}>
              O SmartFridge resolve isso de um jeito simples: você diz o que tem, o app
              encontra receitas reais que usam exatamente esses ingredientes
              <Text style={styles.highlight}> antes que estraguem</Text>.
            </Text>
          </View>

          {/* === Features === */}
          <View style={styles.featureList}>
            {[
              { iconImage: require('../assets/icons/icon_brain.png'), text: 'Algoritmo de compatibilidade próprio' },
              { iconImage: require('../assets/icons/icon_api.png'), text: 'Integração com TheMealDB API' },
              { iconImage: require('../assets/icons/icon_brazil_2.png'), text: 'Tradução automática para PT-BR' },
              { iconImage: require('../assets/icons/icon_offline.png'), text: 'Despensa salva offline' },
              { emoji: '❤️', text: 'Receitas favoritas persistidas' },
            ].map(({ iconImage, emoji, text }) => (
              <View key={text} style={styles.featureItem}>
                {iconImage ? (
                  <Image source={iconImage} style={styles.featureImageIcon} />
                ) : (
                  <Text style={styles.featureIcon}>{emoji}</Text>
                )}
                <Text style={styles.featureText}>{text}</Text>
              </View>
            ))}
          </View>

          {/* === Separador === */}
          <View style={styles.divider} />

          {/* === Autoria === */}
          <View style={styles.autoriaSection}>
            <Text style={styles.autoriaLabel}>Desenvolvido por</Text>
            <Text style={styles.autoriaName}>Lucas Aguiar</Text>
            <Text style={styles.autoriaCourse}>Desenvolvimento Híbrido · 2026</Text>
            <View style={styles.techRow}>
              {['React Native', 'Expo', 'TheMealDB'].map((t) => (
                <View key={t} style={styles.techBadge}>
                  <Text style={styles.techText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>

        {/* Botão fechar */}
        <TouchableOpacity style={[styles.closeBtn, { top: insets.top + 16 }]} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const getStyles = (colors) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  closeBtn: {
    position: 'absolute',
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  // Logo
  logoImage: {
    width: 220,
    height: 80,
  },

  // Branding
  brandSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  missionBadge: {
    marginTop: 8,
    backgroundColor: colors.primaryLight ?? '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  missionBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  // Navegação
  sectionLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 12,
  },
  navIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  navEmoji: {
    fontSize: 22,
    width: 24,
    textAlign: 'center',
    marginRight: 16,
  },
  navPhoto: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  navText: {
    ...typography.styles.body,
    color: colors.text,
    fontWeight: '500',
  },
  navRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Divisor
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
    marginVertical: 12,
  },

  // Sobre
  sobreCard: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: 12,
    gap: 8,
  },
  sobreTitle: {
    ...typography.styles.label,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  sobreText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  highlight: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Features
  featureList: {
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: { fontSize: 15 },
  featureImageIcon: { width: 16, height: 16, resizeMode: 'contain' },
  featureText: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    flex: 1,
  },

  // Autoria
  autoriaSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  autoriaLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginBottom: 4,
  },
  autoriaName: {
    ...typography.styles.subtitle,
    color: colors.text,
    fontWeight: '800',
  },
  autoriaCourse: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  techBadge: {
    backgroundColor: colors.primaryLight ?? '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  techText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
});


