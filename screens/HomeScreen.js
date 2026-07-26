// SmartFridge — HomeScreen
// Tela inicial do app: saudação personalizada, stats rápidos e acesso rápido à despensa.

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import MenuDrawer from '../components/MenuDrawer';

export default function HomeScreen({ navigation }) {
  const { profile, pantry } = useProfile();
  const { favorites } = useFavorites();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Hora do dia para saudação contextual
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const recentFavorites = favorites.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header com avatar e saudação */}
        <View style={styles.header}>
          {/* Botão hamburger */}
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={() => setDrawerVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.hamburgerLine} />
            <View style={[styles.hamburgerLine, { width: 18 }]} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{profile?.name} {profile?.avatarEmoji}</Text>
          </View>

          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>{profile?.avatarEmoji}</Text>
          </View>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          O que vamos cozinhar{'\n'}hoje? 🍴
        </Text>

        {/* Cards de stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Image source={require('../assets/icons/icon_pantry.png')} style={styles.statIcon} />
            <Text style={styles.statValue}>{pantry.length}</Text>
            <Text style={styles.statLabel}>ingredientes{'\n'}na despensa</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.accent }]}>
            <Image source={require('../assets/icons/icon_favorites.png')} style={styles.statIcon} />
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>receitas{'\n'}favoritas</Text>
          </View>
        </View>

        {/* CTA principal */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('PantryTab')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaIcon}>🔍</Text>
          <View>
            <Text style={styles.ctaTitle}>Sugerir Receitas</Text>
            <Text style={styles.ctaSubtitle}>
              {pantry.length > 0
                ? `Com seus ${pantry.length} ingredientes`
                : 'Adicione ingredientes à despensa'}
            </Text>
          </View>
          <Text style={styles.ctaArrow}>›</Text>
        </TouchableOpacity>

        {/* Favoritos recentes */}
        {recentFavorites.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Favoritos Recentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentFavorites}
              keyExtractor={(item) => item.idMeal}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.favoriteCard}
                  onPress={() =>
                    navigation.navigate('PantryTab', {
                      screen: 'RecipeDetail',
                      params: { recipe: item },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.favoriteThumbnail}>🍽️</Text>
                  <Text style={styles.favoriteName} numberOfLines={2}>
                    {item.strMeal}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Dica do dia */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>
            Quanto mais ingredientes você adicionar à despensa, mais precisas serão as sugestões de receita.
          </Text>
        </View>
      </ScrollView>

      {/* Drawer lateral */}
      <MenuDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
      />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    ...typography.styles.body,
    color: colors.textMuted,
  },
  name: {
    ...typography.styles.title,
    color: colors.primary,
  },
  avatarBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadgeText: {
    fontSize: 28,
  },
  tagline: {
    ...typography.styles.hero,
    color: colors.text,
    marginTop: 4,
    marginBottom: 28,
    lineHeight: 42,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 4,
    tintColor: colors.surface,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(241, 218, 218, 0.8)',
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  ctaIcon: {
    fontSize: 32,
  },
  ctaTitle: {
    ...typography.styles.subtitle,
    color: colors.primary,
  },
  ctaSubtitle: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  ctaArrow: {
    marginLeft: 'auto',
    fontSize: 28,
    color: colors.textMuted,
    fontWeight: '300',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    ...typography.styles.subtitle,
    color: colors.text,
  },
  sectionLink: {
    ...typography.styles.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
  favoriteCard: {
    width: 130,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  favoriteThumbnail: {
    fontSize: 40,
  },
  favoriteName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.accentLight,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  tipEmoji: {
    fontSize: 22,
  },
  tipText: {
    flex: 1,
    ...typography.styles.caption,
    color: colors.text,
    lineHeight: 18,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
});
