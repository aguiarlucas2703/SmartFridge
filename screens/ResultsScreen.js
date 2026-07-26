// SmartFridge — ResultsScreen
// Busca receitas na MealDB com os ingredientes selecionados,
// calcula % de compatibilidade, ordena e exibe como lista de cards.

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRecipesByIngredients, fetchRecipeDetail } from '../services/mealdb';
import { rankRecipes } from '../services/compatibility';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { translateIngredient } from '../services/translator';

// === Barra de progresso animada para % de compatibilidade ===
function CompatibilityBar({ score }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: score,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const barColor =
    score >= 70 ? colors.secondary : score >= 40 ? colors.accent : colors.error;

  return (
    <View style={styles.barContainer}>
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: barColor,
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

// === Card de receita ===
function RecipeCard({ recipe, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPress());
  };

  const scoreColor =
    recipe.score >= 70
      ? colors.secondary
      : recipe.score >= 40
        ? colors.accent
        : colors.error;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <View style={styles.cardContent}>
          {/* Thumbnail */}
          {recipe.strMealThumb ? (
            <Image
              source={{ uri: `${recipe.strMealThumb}/preview` }}
              style={styles.thumbnail}
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Text style={{ fontSize: 36 }}>🍽️</Text>
            </View>
          )}

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.recipeName} numberOfLines={2}>
              {recipe.strMeal}
            </Text>

            <View style={styles.scoreRow}>
              <Text style={[styles.scoreText, { color: scoreColor }]}>
                {recipe.score}% compatível
              </Text>
              <Text style={styles.missingText}>
                {recipe.missing?.length > 0
                  ? `❌ ${recipe.missing.length} faltando`
                  : '✅ Tudo disponível!'}
              </Text>
            </View>

            <CompatibilityBar score={recipe.score} />

            <Text style={styles.ingredientCount}>
              {recipe.matching?.length ?? 0}/{recipe.total ?? '?'} ingredientes
            </Text>
          </View>

          {/* Seta */}
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// === Skeleton loading ===
function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, styles.skeleton, { opacity }]}>
      <View style={styles.skeletonThumb} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%' }]} />
        <View style={[styles.skeletonLine, { height: 6, marginTop: 4 }]} />
      </View>
    </Animated.View>
  );
}

export default function ResultsScreen({ route, navigation }) {
  const { ingredients } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecipes = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // 1. Busca lista de receitas por ingrediente
      const baseRecipes = await fetchRecipesByIngredients(ingredients);

      if (baseRecipes.length === 0) {
        setRecipes([]);
        return;
      }

      // 2. Busca detalhes de cada receita para calcular compatibilidade
      // Limita a 10 para não sobrecarregar (decisão técnica documentada)
      const TOP = Math.min(baseRecipes.length, 10);
      const detailedRecipes = await Promise.all(
        baseRecipes.slice(0, TOP).map(async (r) => ({
          ...r,
          detail: await fetchRecipeDetail(r.idMeal),
        }))
      );

      // 3. Calcula % de compatibilidade e ordena
      const ranked = rankRecipes(detailedRecipes, ingredients);
      setRecipes(ranked);
    } catch (err) {
      setError('Não foi possível carregar as receitas. Verifique sua conexão.');
      console.error('[ResultsScreen]', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecipes();
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Receitas para você</Text>
          <Text style={styles.subtitle}>
            {isLoading ? 'Buscando na MealDB...' : `${recipes.length} receita${recipes.length !== 1 ? 's' : ''} encontrada${recipes.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      {/* Ingredientes usados */}
      <View style={styles.ingredientBadges}>
        {ingredients.slice(0, 5).map((ing) => (
          <View key={ing} style={styles.badge}>
            <Text style={styles.badgeText}>{translateIngredient(ing)}</Text>
          </View>
        ))}
        {ingredients.length > 5 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>+{ingredients.length - 5}</Text>
          </View>
        )}
      </View>

      {/* Conteúdo */}
      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </View>
      ) : error ? (
        // Estado de erro
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📶</Text>
          <Text style={styles.emptyTitle}>Sem conexão</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadRecipes}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : recipes.length === 0 ? (
        // Estado vazio
        <View style={styles.emptyState}>
          {ingredients.some(ing => {
            const i = ing.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return ['acai', 'maracuja', 'passion fruit', 'mandioca', 'macaxeira', 'aipim', 'cassava', 'goiaba', 'guava', 'farofa', 'pao de queijo', 'cupuacu', 'pequi', 'jambu', 'tucupi', 'quiabo', 'jilo', 'jabuticaba', 'umbu', 'caju'].includes(i);
          }) ? (
            <>
              <Text style={styles.emptyEmoji}>🇧🇷</Text>
              <Text style={styles.emptyTitle}>Ingrediente Brasileiro faltante...</Text>
              <Text style={styles.emptyText}>
                Sentimos muito. Sabemos bem o quão rica e extensa é a culinária e os ingredientes brasileiros. Infelizmente o TheMealDB não possui em sua base receitas com esse tipo de ingrediente.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Nenhuma receita encontrada</Text>
              <Text style={styles.emptyText}>
                Tente adicionar mais ingredientes à sua despensa.
              </Text>
            </>
          )}
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Voltar à Despensa</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />
          )}
        />
      )}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    fontSize: 28,
    color: colors.primary,
    marginTop: -2,
  },
  title: {
    ...typography.styles.subtitle,
    color: colors.primary,
  },
  subtitle: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },
  ingredientBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  thumbnailPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  recipeName: {
    ...typography.styles.body,
    fontWeight: '600',
    color: colors.text,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
  missingText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  barContainer: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  ingredientCount: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },
  arrow: {
    fontSize: 28,
    color: colors.textMuted,
    fontWeight: '300',
  },
  skeleton: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
    alignItems: 'center',
  },
  skeletonThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: colors.border,
    borderRadius: 7,
    width: '80%',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 64,
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
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  retryText: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
});
