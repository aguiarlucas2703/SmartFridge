// SmartFridge — PantryScreen (Despensa)
// O usuário seleciona ingredientes pré-definidos e/ou adiciona ingredientes customizados.
// A seleção persiste via ProfileContext → AsyncStorage.

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { translateIngredient } from '../services/translator';
import MenuDrawer from '../components/MenuDrawer';

// === Ingredientes pré-definidos agrupados por categoria ===
// IMPORTANTE: as chaves são os nomes EXATOS que a TheMealDB aceita (validados via API).
// Os rótulos PT-BR são aplicados pela função translateIngredient() na renderização.
const PRESET_INGREDIENTS = {
  '🥩 Proteínas': [
    'chicken', 'chicken breast', 'ground beef', 'beef', 'pork',
    'egg', 'tuna', 'salmon', 'shrimp', 'fish', 'bacon', 'lamb',
  ],
  '🫘 Leguminosas': [
    'kidney beans', 'black beans', 'chickpeas', 'lentils', 'pinto beans',
  ],
  '🥦 Vegetais': [
    'tomato', 'onion', 'garlic', 'potatoes', 'carrot', 'broccoli',
    'spinach', 'red pepper', 'green pepper', 'mushrooms', 'cucumber',
    'lettuce', 'zucchini', 'aubergine', 'celery', 'leek', 'spring onions',
  ],
  '🌾 Grãos & Carboidratos': [
    'rice', 'bread', 'flour', 'oats', 'noodles', 'yeast',
  ],
  '🧀 Laticínios': [
    'milk', 'cheese', 'parmesan', 'cheddar cheese',
    'butter', 'double cream', 'sour cream', 'yogurt',
  ],
  '🍫 Chocolate & Doces': [
    'dark chocolate', 'milk chocolate', 'chocolate chips', 'cocoa powder',
    'vanilla', 'sugar', 'honey',
  ],
  '🫙 Temperos & Molhos': [
    'salt', 'black pepper', 'olive oil', 'vegetable oil',
    'soy sauce', 'vinegar', 'lemon', 'ginger', 'cinnamon',
    'cumin', 'paprika', 'turmeric', 'cayenne pepper', 'oregano',
    'basil', 'thyme', 'rosemary', 'parsley', 'coriander',
    'baking powder'
  ],
};

const ALL_PRESETS = Object.values(PRESET_INGREDIENTS).flat();

// Componente de chip animado
// label = chave em inglês (valor da API); exibe a tradução PT-BR para o usuário
function IngredientChip({ label, selected, onPress, styles }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 70, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.chip, selected && styles.chipSelected]}
      >
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {selected ? '✓ ' : ''}{translateIngredient(label)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PantryScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const { pantry, savePantry, addIngredient, removeIngredient } = useProfile();

  // Estados do drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  
  const selected = useMemo(() => new Set(pantry), [pantry]);
  const customIngredients = useMemo(() => pantry.filter((i) => !ALL_PRESETS.includes(i)), [pantry]);

  const toggleIngredient = useCallback((ingredient) => {
    if (pantry.includes(ingredient)) {
      removeIngredient(ingredient);
    } else {
      addIngredient(ingredient);
    }
  }, [pantry, removeIngredient, addIngredient]);

  const addCustomIngredient = () => {
    const value = customInput.trim().toLowerCase();
    if (!value) return;
    if (selected.has(value)) {
      Alert.alert('Já adicionado', `"${value}" já está na sua despensa.`);
      return;
    }
    addIngredient(value);
    setCustomInput('');
  };

  const removeCustomIngredient = (ingredient) => {
    removeIngredient(ingredient);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Desmarcar todos',
      'Tem certeza que deseja desmarcar todos os ingredientes selecionados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desmarcar',
          style: 'destructive',
          onPress: async () => {
            await savePantry([]);
          },
        },
      ]
    );
  };


  const handleFindRecipes = async () => {
    const ingredients = Array.from(selected);
    if (ingredients.length === 0) {
      Alert.alert('Despensa vazia', 'Selecione pelo menos um ingrediente para buscar receitas.');
      return;
    }
    // Persiste seleção atual
    await savePantry(ingredients);
    navigation.navigate('Results', { ingredients });
  };

  // Filtra ingredientes pré-definidos pelo search
  // Compara contra o nome em inglês (chave da API) E o rótulo PT-BR exibido ao usuário.
  // Ex.: digitar "frango" encontra "chicken", "feijão" encontra "kidney beans".
  const getFilteredPresets = (category, items) => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((i) => {
      const ptLabel = translateIngredient(i).toLowerCase();
      return i.toLowerCase().includes(q) || ptLabel.includes(q);
    });
  };

  const selectedCount = selected.size;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header fixo */}
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
            <Text style={styles.title}>Minha Despensa</Text>
            <Text style={styles.subtitle}>
              {selectedCount > 0
                ? `${selectedCount} ingrediente${selectedCount > 1 ? 's' : ''} selecionado${selectedCount > 1 ? 's' : ''}`
                : 'Selecione o que você tem em casa'}
            </Text>
          </View>
          {selectedCount > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearAllBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.clearAllText}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Barra de busca */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Filtrar ingredientes..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Ingredientes customizados */}
          {customIngredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>✏️ ADICIONADOS POR VOCÊ</Text>
              <View style={styles.chipRow}>
                {customIngredients.map((item) => (
                  <View key={item} style={styles.customChipWrapper}>
                    <IngredientChip
                      styles={styles}
                      label={item}
                      selected={selected.has(item)}
                      onPress={() => toggleIngredient(item)}
                    />
                    <TouchableOpacity
                      onPress={() => removeCustomIngredient(item)}
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Adicionar ingrediente customizado */}
          <View style={styles.customInputRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Adicionar ingrediente..."
              placeholderTextColor={colors.textMuted}
              value={customInput}
              onChangeText={setCustomInput}
              returnKeyType="done"
              onSubmitEditing={addCustomIngredient}
            />
            <TouchableOpacity
              onPress={addCustomIngredient}
              style={styles.addBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Categorias de ingredientes pré-definidos */}
          {(() => {
            let hasResults = false;
            const sections = Object.entries(PRESET_INGREDIENTS).map(([category, items]) => {
              const filtered = getFilteredPresets(category, items);
              if (filtered.length === 0) return null;
              hasResults = true;
              return (
                <View key={category} style={styles.section}>
                  <Text style={styles.sectionLabel}>{category.toUpperCase()}</Text>
                  <View style={styles.chipRow}>
                    {filtered.map((item) => (
                      <IngredientChip
                        styles={styles}
                        key={item}
                        label={item}
                        selected={selected.has(item)}
                        onPress={() => toggleIngredient(item)}
                      />
                    ))}
                  </View>
                </View>
              );
            });

            if (!hasResults && searchQuery.length > 0) {
              return (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyTitle}>
                    Nenhum ingrediente encontrado para "{searchQuery}"
                  </Text>
                </View>
              );
            }
            return sections;
          })()}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* CTA flutuante */}
        {selectedCount > 0 && (
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleFindRecipes}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>
                Encontrar Receitas ({selectedCount}) 🍽️
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

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
    padding: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.surface,
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
  clearAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    marginLeft: 12,
  },
  clearAllText: {
    ...typography.styles.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  pantryIcon: {
    fontSize: 36,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginHorizontal: 24,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    height: 46,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 20,
    marginTop: 8,
  },
  sectionLabel: {
    ...typography.styles.label,
    color: colors.textMuted,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  customChipWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  removeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    marginTop: -14,
  },
  removeBtnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.textOnPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.styles.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});




