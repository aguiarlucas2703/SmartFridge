// SmartFridge — RecipeDetailScreen
// Detalhe completo da receita: hero image com parallax, ingredientes
// divididos em "tem" vs "falta", instruções de preparo e botão de favoritar.

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../context/FavoritesContext';
import { useProfile } from '../context/ProfileContext';
import { calculateCompatibility } from '../services/compatibility';
import { extractIngredients, extractMeasures, fetchRecipeDetail } from '../services/mealdb';
import { translateText, translateIngredient, translateCategory } from '../services/translator';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';

const HERO_HEIGHT = 280;

export default function RecipeDetailScreen({ route, navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const { recipe: routeRecipe } = route.params;
  const { toggleFavorite, isFavorite } = useFavorites();
  const { pantry, addIngredient } = useProfile();
  const insets = useSafeAreaInsets();

  const [recipe, setRecipe] = useState(routeRecipe.detail ? routeRecipe : null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(!routeRecipe.detail);

  // Estado de tradução
  const [translatedName, setTranslatedName] = useState(null);
  const [translatedInstructions, setTranslatedInstructions] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Carrega detalhes se a tela for acessada sem detail (ex.: vindo de Favoritos)
  useEffect(() => {
    if (!routeRecipe.detail) {
      fetchRecipeDetail(routeRecipe.idMeal).then((detail) => {
        setRecipe({ ...routeRecipe, detail });
        setIsLoadingDetail(false);
      });
    }
  }, []);

  // Dispara tradução assim que o detail estiver disponível
  useEffect(() => {
    const detail = recipe?.detail ?? routeRecipe.detail;
    if (!detail || isTranslating || translatedInstructions) return;

    setIsTranslating(true);
    const name = detail.strMeal ?? '';
    const instructions = detail.strInstructions ?? '';

    Promise.all([
      translateText(name),
      translateText(instructions),
    ]).then(([tName, tInstructions]) => {
      setTranslatedName(tName);
      setTranslatedInstructions(tInstructions);
      setIsTranslating(false);
    }).catch(() => {
      setIsTranslating(false); // falha silenciosa — mantém inglês
    });
  }, [recipe, isLoadingDetail]);

  // Parallax do hero
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroTranslate = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [HERO_HEIGHT / 2, 0, -HERO_HEIGHT / 3],
    extrapolate: 'clamp',
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.8],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  // Animação do coração ao favoritar
  const heartScale = useRef(new Animated.Value(1)).current;
  const animateHeart = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 30 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const handleToggleFavorite = () => {
    animateHeart();
    const recipeToSave = recipe ?? routeRecipe;
    toggleFavorite(recipeToSave);
  };

  const handleShare = async () => {
    const name = recipe?.detail?.strMeal ?? routeRecipe.strMeal;
    try {
      await Share.share({
        message: `Olha essa receita que encontrei no SmartFridge: ${name}! 🍽️`,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar.');
    }
  };

  const mealId = routeRecipe.idMeal;
  const detail = recipe?.detail ?? routeRecipe.detail;
  const mealName = detail?.strMeal ?? routeRecipe.strMeal;
  const thumbUrl = detail?.strMealThumb ?? routeRecipe.strMealThumb;
  const instructions = detail?.strInstructions ?? '';
  const category = detail?.strCategory;
  const area = detail?.strArea;

  // Usa nome traduzido se disponível, senão o original
  const displayName = translatedName ?? (detail?.strMeal ?? routeRecipe.strMeal);
  const displayCategory = category ? translateCategory(category) : null;

  // Divide as instruções traduzidas em passos numerados
  const rawInstructions = translatedInstructions ?? instructions;
  const steps = rawInstructions
    ? rawInstructions
        .split(/\r\n|\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10)
    : [];

  // Ingredientes com medidas
  const recipeIngredients = detail ? extractIngredients(detail) : recipe?.matching?.concat(recipe?.missing ?? []) ?? [];
  const measures = detail ? extractMeasures(detail) : [];

  // Compatibilidade
  const compat = calculateCompatibility(recipeIngredients, pantry);

  const favorited = isFavorite(mealId);

  return (
    <View style={styles.root}>
      {/* Hero parallax */}
      <Animated.View
        style={[
          styles.hero,
          { transform: [{ translateY: heroTranslate }], opacity: heroOpacity },
        ]}
      >
        {thumbUrl ? (
          <Image source={{ uri: thumbUrl }} style={styles.heroImage} />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Text style={{ fontSize: 64 }}>🍽️</Text>
          </View>
        )}
        <View style={styles.heroOverlay} />
      </Animated.View>

      {/* Botões flutuantes sobre o hero */}
      <SafeAreaView edges={['top']} style={styles.floatingHeader}>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.floatingBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.floatingRight}>
          <TouchableOpacity style={styles.floatingBtn} onPress={handleShare}>
            <Image source={require('../assets/icons/icon_share.png')} style={{ width: 20, height: 20, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity
              style={[styles.floatingBtn, favorited && styles.floatingBtnFav]}
              onPress={handleToggleFavorite}
            >
              <Text style={styles.floatingBtnText}>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* Conteúdo scrollável */}
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Espaço para o hero */}
        <View style={{ height: HERO_HEIGHT - 60 }} />

        {/* Card principal */}
        <View style={styles.card}>
          {/* Nome + meta */}
          <Text style={styles.mealName}>{displayName}</Text>
          <View style={styles.metaRow}>
            {displayCategory && (
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>{displayCategory}</Text>
              </View>
            )}
            {area && (
              <View style={styles.metaBadge}>
                <Text style={styles.metaText}>🌍 {area}</Text>
              </View>
            )}
            {isTranslating && (
              <View style={[styles.metaBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.metaText, { color: colors.accent }]}>Traduzindo...</Text>
              </View>
            )}
            {translatedInstructions && !isTranslating && (
              <View style={[styles.metaBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.metaText, { color: colors.accent }]}>🇧🇷 Traduzido</Text>
              </View>
            )}
          </View>

          {/* Score de compatibilidade */}
          <View style={styles.scoreCard}>
            <View>
              <Text style={styles.scoreLabel}>Compatibilidade com sua despensa</Text>
              <Text style={styles.scoreValue}>{compat.score}%</Text>
            </View>
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreHas}>✅ {compat.matching.length} disponíveis</Text>
              <Text style={styles.scoreMissing}>❌ {compat.missing.length} faltando</Text>
            </View>
          </View>

          {/* Ingredientes */}
          <Text style={styles.sectionTitle}>Ingredientes</Text>

          {isLoadingDetail ? (
            <Text style={styles.loadingText}>Carregando...</Text>
          ) : (
            recipeIngredients.map((ing, index) => {
              const has = compat.matching.includes(ing);
              const ptLabel = translateIngredient(ing);
              return (
                <View key={`${ing}-${index}`} style={styles.ingredientRow}>
                  <View
                    style={[
                      styles.ingredientDot,
                      { backgroundColor: has ? colors.ingredientHas : colors.ingredientMissing },
                    ]}
                  />
                  <Text style={styles.ingredientName}>
                    {ptLabel}
                  </Text>
                  {measures[index] ? (
                    <Text style={styles.ingredientMeasure}>{measures[index]}</Text>
                  ) : null}
                  {has ? (
                    <Text style={styles.ingredientStatus}>✓</Text>
                  ) : (
                    <TouchableOpacity
                      onPress={() => addIngredient(ptLabel)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={[styles.ingredientStatus, { color: colors.primary }]}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}

          {/* Instruções */}
          {steps.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Modo de Preparo</Text>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </>
          )}

          {/* Botão favoritar */}
          <TouchableOpacity
            style={[styles.favButton, favorited && styles.favButtonActive]}
            onPress={handleToggleFavorite}
            activeOpacity={0.85}
          >
            <Text style={styles.favButtonText}>
              {favorited ? '❤️ Remover Favorito' : '🤍 Salvar Favorito'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    zIndex: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(22, 36, 29, 0.35)',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  floatingRight: {
    flexDirection: 'row',
    gap: 8,
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingBtnFav: {
    backgroundColor: 'rgba(255,220,220,0.95)',
  },
  floatingBtnText: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    zIndex: 5,
  },
  content: {
    paddingHorizontal: 0,
  },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    minHeight: 600,
  },
  mealName: {
    ...typography.styles.title,
    color: colors.primary,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metaBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreLabel: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreDetails: {
    gap: 4,
    alignItems: 'flex-end',
  },
  scoreHas: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ingredientHas,
  },
  scoreMissing: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ingredientMissing,
  },
  sectionTitle: {
    ...typography.styles.subtitle,
    color: colors.primary,
    marginBottom: 14,
    marginTop: 4,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  ingredientDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  ingredientName: {
    flex: 1,
    ...typography.styles.body,
    color: colors.text,
    textTransform: 'capitalize',
  },
  ingredientMeasure: {
    ...typography.styles.caption,
    color: colors.textMuted,
  },
  ingredientStatus: {
    fontSize: 14,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
    color: colors.text,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumberText: {
    color: colors.textOnPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    ...typography.styles.body,
    color: colors.text,
    lineHeight: 22,
  },
  favButton: {
    marginTop: 32,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  favButtonActive: {
    backgroundColor: 'rgba(217, 164, 65, 0.15)',
    borderColor: colors.accent,
  },
  favButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
});


