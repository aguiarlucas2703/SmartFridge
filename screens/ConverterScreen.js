import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';

const MEASURES = [
  { id: 'cup', name: 'Xícara de Chá (240ml)', multiplier: 240 },
  { id: 'copoReq', name: 'Copo de Requeijão (250ml)', multiplier: 250 },
  { id: 'copoAm', name: 'Copo Americano (200ml)', multiplier: 200 },
  { id: 'tbsp', name: 'Colher de Sopa (15ml)', multiplier: 15 },
  { id: 'sobremesa', name: 'Colher de Sobremesa (10ml)', multiplier: 10 },
  { id: 'tsp', name: 'Colher de Chá (5ml)', multiplier: 5 },
  { id: 'cafe', name: 'Colher de Café (2,5ml)', multiplier: 2.5 },
  { id: 'ml', name: 'Mililitro (ml)', multiplier: 1 },
];

const INGREDIENTS = [
  { id: 'sugar', name: 'Açúcar', density: 200 / 240 },
  { id: 'cornstarch', name: 'Amido de Milho / Polvilho', density: 150 / 240 },
  { id: 'rice', name: 'Arroz / Feijão', density: 200 / 240 },
  { id: 'oats', name: 'Aveia / Farinha de Rosca', density: 80 / 240 },
  { id: 'cocoa', name: 'Chocolate em Pó', density: 100 / 240 },
  { id: 'coconutF', name: 'Coco Ralado Fresco', density: 100 / 240 },
  { id: 'coconutS', name: 'Coco Ralado Seco', density: 80 / 240 },
  { id: 'flour', name: 'Farinha de Trigo', density: 165 / 240 },
  { id: 'mandioca', name: 'Farinha de Mandioca', density: 150 / 240 },
  { id: 'fuba', name: 'Fubá', density: 120 / 240 },
  { id: 'bakingpowder', name: 'Fermento em Pó', density: 10 / 15 },
  { id: 'butter', name: 'Manteiga / Gordura', density: 200 / 240 },
  { id: 'honey', name: 'Mel', density: 300 / 240 },
  { id: 'cheese', name: 'Queijo Ralado', density: 80 / 240 },
  { id: 'liquid', name: 'Água / Leite', density: 1.0 },
  { id: 'oil', name: 'Azeite / Óleo', density: 0.9 },
];

// Ordem alfabética para facilitar
INGREDIENTS.sort((a, b) => a.name.localeCompare(b.name));

export default function ConverterScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState('1');
  const [selectedMeasure, setSelectedMeasure] = useState(MEASURES[0]);
  const [selectedIngredient, setSelectedIngredient] = useState(INGREDIENTS.find(i => i.id === 'flour'));

  // Estado dos modais de seleção
  const [isMeasureModalOpen, setMeasureModalOpen] = useState(false);
  const [isIngredientModalOpen, setIngredientModalOpen] = useState(false);

  // Calcula o resultado (Volume -> Gramas)
  const calculateGrams = () => {
    const num = parseFloat(amount.replace(',', '.'));
    if (isNaN(num) || num <= 0) return 0;
    
    // Fórmula: Quantidade * Multiplicador de Volume (ml) * Densidade (g/ml)
    const result = num * selectedMeasure.multiplier * selectedIngredient.density;
    
    // Retorna arredondado
    return Math.round(result);
  };

  const renderSelectionModal = (visible, setVisible, data, selectedId, onSelect, title) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.modalItem, selectedId === item.id && styles.modalItemSelected]}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, selectedId === item.id && styles.modalItemTextSelected]}>
                  {item.name}
                </Text>
                {selectedId === item.id && <Text style={styles.modalCheck}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Home' })} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Início</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Conversor</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          <View style={styles.card}>
            <Text style={styles.label}>1. Medida de Origem</Text>
            <TouchableOpacity style={styles.selectorBtn} onPress={() => setMeasureModalOpen(true)}>
              <Text style={styles.selectorText}>{selectedMeasure.name}</Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>2. Qual Ingrediente?</Text>
            <TouchableOpacity style={styles.selectorBtn} onPress={() => setIngredientModalOpen(true)}>
              <Text style={styles.selectorText}>{selectedIngredient.name}</Text>
              <Text style={styles.selectorArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.label}>3. Quantidade em {selectedMeasure.name}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Ex: 1.5"
              placeholderTextColor={colors.textMuted}
              maxLength={6}
            />
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Equivalente em gramas:</Text>
            <Text style={styles.resultValue}>{calculateGrams()}g</Text>
            <Text style={styles.resultSub}>de {selectedIngredient.name}</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modais de Seleção */}
      {renderSelectionModal(isMeasureModalOpen, setMeasureModalOpen, MEASURES, selectedMeasure.id, setSelectedMeasure, 'Selecione a Medida')}
      {renderSelectionModal(isIngredientModalOpen, setIngredientModalOpen, INGREDIENTS, selectedIngredient.id, setSelectedIngredient, 'Selecione o Ingrediente')}
      
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    padding: 4,
  },
  backText: {
    ...typography.styles.label,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.styles.h2,
    color: colors.text,
  },
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.styles.h3,
    color: colors.text,
    marginBottom: 12,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  selectorText: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: '600',
  },
  selectorArrow: {
    color: colors.textMuted,
    fontSize: 12,
  },
  input: {
    ...typography.styles.h1,
    color: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    textAlign: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resultLabel: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  resultSub: {
    ...typography.styles.label,
    color: colors.text,
    fontStyle: 'italic',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.styles.h3,
    color: colors.text,
  },
  modalClose: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  modalItemText: {
    ...typography.styles.body,
    color: colors.text,
  },
  modalItemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  modalCheck: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  }
});
