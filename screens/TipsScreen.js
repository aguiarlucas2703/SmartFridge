import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { tipsCategories } from '../data/tips';
import MenuDrawer from '../components/MenuDrawer';
import { useProfile } from '../context/ProfileContext';
import { useTips } from '../context/TipsContext';
import { getTipsMatchingPantry } from '../services/tipsMatcher';

export default function TipsScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { pantry } = useProfile();
  const { appliedTipIds, totalTipsCount } = useTips();

  const handleCategoryPress = (category) => {
    navigation.navigate('TipsDetail', { category });
  };
  
  const matchingTips = getTipsMatchingPantry(pantry, tipsCategories);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header com Menu Sanduíche */}
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
        <Text style={styles.title}>Dicas Anti-desperdício</Text>
        {/* Spacer to center title */}
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Pequenas mudanças no dia a dia podem reduzir drasticamente o desperdício de alimentos. Explore nossas dicas:
        </Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            🏆 Você já aplica {appliedTipIds.length} de {totalTipsCount} dicas
          </Text>
        </View>

        {matchingTips.length > 0 && (
          <View style={styles.contextualSection}>
            <Text style={styles.sectionTitle}>💡 Baseado na sua despensa agora</Text>
            <View style={styles.contextualList}>
              {matchingTips.map(tip => {
                // Descobre a categoria pai para poder navegar
                const parentCategory = tipsCategories.find(c => c.tips.some(t => t.id === tip.id));
                const isApplied = appliedTipIds.includes(tip.id);

                return (
                  <TouchableOpacity
                    key={tip.id}
                    style={styles.contextualCard}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(parentCategory)}
                  >
                    <View style={styles.contextualHeader}>
                      <Text style={styles.contextualTitle}>{tip.title}</Text>
                      {isApplied && <Text style={styles.appliedIcon}>✓</Text>}
                    </View>
                    <Text style={styles.contextualContent} numberOfLines={2}>
                      {tip.content}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Todas as categorias</Text>
        <View style={styles.categoriesContainer}>
          {tipsCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.8}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.iconContainer}>
                <Image source={isDark && category.iconDark ? category.iconDark : category.icon} style={styles.icon} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{category.title}</Text>
                <Text style={styles.cardDescription}>{category.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingTop: 24,
    paddingBottom: 16,
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
  title: {
    ...typography.styles.title,
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 8,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  categoriesContainer: {
    gap: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 16,
  },
  icon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.styles.subtitle,
    color: colors.primary,
    marginBottom: 4,
  },
  cardDescription: {
    ...typography.styles.body,
    color: colors.textMuted,
    fontSize: 14,
  },
  chevron: {
    fontSize: 24,
    color: colors.border,
    marginLeft: 8,
  },
  progressContainer: {
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 79, 219, 0.1)',
  },
  progressText: {
    ...typography.styles.label,
    color: colors.primary,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.styles.subtitle,
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  contextualSection: {
    marginBottom: 24,
  },
  contextualList: {
    gap: 12,
  },
  contextualCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  contextualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contextualTitle: {
    ...typography.styles.label,
    color: colors.primary,
    fontWeight: '700',
    flex: 1,
  },
  appliedIcon: {
    color: colors.success,
    fontWeight: '800',
    fontSize: 16,
    marginLeft: 8,
  },
  contextualContent: {
    ...typography.styles.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});


