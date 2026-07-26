// SmartFridge — FavoritesScreen
// Lista de receitas salvas pelo usuário, com acesso rápido ao detalhe.

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import MenuDrawer from '../components/MenuDrawer';

function FavoriteCard({ recipe, onPress, onRemove }) {
  const detail = recipe.detail;
  const name = detail?.strMeal ?? recipe.strMeal;
  const thumb = detail?.strMealThumb ?? recipe.strMealThumb;
  const category = detail?.strCategory;
  const score = recipe.score;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardInner}>
        {/* Thumbnail */}
        {thumb ? (
          <Image source={{ uri: `${thumb}/preview` }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={{ fontSize: 32 }}>🍽️</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          {category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
          {score !== undefined && (
            <Text style={styles.score}>{score}% compatível com sua despensa</Text>
          )}
        </View>

        {/* Remover */}
        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.removeBtnText}>❤️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onGoToPantry }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🤍</Text>
      <Text style={styles.emptyTitle}>Sem favoritos ainda</Text>
      <Text style={styles.emptyText}>
        Explore receitas e toque no coração para salvar suas favoritas aqui.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onGoToPantry}>
        <Text style={styles.emptyBtnText}>Explorar Receitas 🍳</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FavoritesScreen({ navigation }) {
  const { favorites, toggleFavorite } = useFavorites();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleRemove = (recipe) => {
    Alert.alert(
      'Remover favorito',
      `Remover "${recipe.detail?.strMeal ?? recipe.strMeal}" dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => toggleFavorite(recipe),
        },
      ]
    );
  };

  const handlePress = (recipe) => {
    navigation.navigate('PantryTab', {
      screen: 'RecipeDetail',
      params: { recipe },
    });
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Meus Favoritos ❤️</Text>
          <Text style={styles.subtitle}>
            {favorites.length > 0
              ? `${favorites.length} receita${favorites.length > 1 ? 's' : ''} salva${favorites.length > 1 ? 's' : ''}`
              : 'Nenhuma receita salva'}
          </Text>
        </View>
      </View>

      {favorites.length === 0 ? (
        <EmptyState onGoToPantry={() => navigation.navigate('PantryTab')} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <FavoriteCard
              recipe={item}
              onPress={() => handlePress(item)}
              onRemove={() => handleRemove(item)}
            />
          )}
        />
      )}

      {/* Menu Sanduíche Global */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 5,
    marginRight: 16,
  },
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: colors.text,
    borderRadius: 2,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    ...typography.styles.title,
    color: colors.primary,
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  thumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  name: {
    ...typography.styles.body,
    fontWeight: '600',
    color: colors.text,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  score: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '500',
  },
  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: 22,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  emptyTitle: {
    ...typography.styles.subtitle,
    color: colors.primary,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.styles.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
});
