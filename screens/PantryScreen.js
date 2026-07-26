// SmartFridge — PantryScreen (Despensa)
// O usuário seleciona ingredientes pré-definidos e/ou adiciona ingredientes customizados.
// A seleção persiste via ProfileContext → AsyncStorage.

import React, { useState, useRef, useCallback } from 'react';
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
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { translateIngredient } from '../services/translator';

// === Ingredientes pré-definidos agrupados por categoria ===
// IMPORTANTE: as chaves são os nomes EXATOS que a TheMealDB aceita (validados via API).
// Os rótulos PT-BR são aplicados pela função translateIngredient() na renderização.
const PRESET_INGREDIENTS = {
  '🥩 Proteínas': [
    'chicken', 'chicken breast', 'ground beef', 'beef', 'pork',
    'egg', 'tuna', 'salmon', 'shrimp', 'bacon', 'lamb',
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
    'baking powder',
  ],
};

const ALL_PRESETS = Object.values(PRESET_INGREDIENTS).flat();

// Componente de chip animado
// label = chave em inglês (valor da API); exibe a tradução PT-BR para o usuário
function IngredientChip({ label, selected, onPress }) {
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
  const { pantry, savePantry } = useProfile();
  const [selected, setSelected] = useState(() => new Set(pantry));
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [customIngredients, setCustomIngredients] = useState(() =>
    pantry.filter((i) => !ALL_PRESETS.includes(i))
  );

  const toggleIngredient = useCallback((ingredient) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) next.delete(ingredient);
      else next.add(ingredient);
      return next;
    });
  }, []);

  const addCustomIngredient = () => {
    const value = customInput.trim().toLowerCase();
    if (!value) return;
    if (selected.has(value)) {
      Alert.alert('Já adicionado', `"${value}" já está na sua despensa.`);
      return;
    }
    setCustomIngredients((prev) => [...prev, value]);
    setSelected((prev) => new Set([...prev, value]));
    setCustomInput('');
  };

  const removeCustomIngredient = (ingredient) => {
    setCustomIngredients((prev) => prev.filter((i) => i !== ingredient));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(ingredient);
      return next;
    });
  };

  const handleSearch = () => {
    // Filtra todos os ingredientes pré-definidos pelo query
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
          <View>
            <Text style={styles.title}>Minha Despensa</Text>
            <Text style={styles.subtitle}>
              {selectedCount > 0
                ? `${selectedCount} ingrediente${selectedCount > 1 ? 's' : ''} selecionado${selectedCount > 1 ? 's' : ''}`
                : 'Selecione o que você tem em casa'}
            </Text>
          </View>
          <Text style={styles.pantryIcon}>🧺</Text>
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
                    <TouchableOpacity
                      style={[styles.chip, styles.chipSelected]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.chipTextSelected}>✓ {item}</Text>
                    </TouchableOpacity>
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
          {Object.entries(PRESET_INGREDIENTS).map(([category, items]) => {
            const filtered = getFilteredPresets(category, items);
            if (filtered.length === 0) return null;
            return (
              <View key={category} style={styles.section}>
                <Text style={styles.sectionLabel}>{category.toUpperCase()}</Text>
                <View style={styles.chipRow}>
                  {filtered.map((item) => (
                    <IngredientChip
                      key={item}
                      label={item}
                      selected={selected.has(item)}
                      onPress={() => toggleIngredient(item)}
                    />
                  ))}
                </View>
              </View>
            );
          })}

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
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
});
