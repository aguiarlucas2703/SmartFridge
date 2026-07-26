import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useTips } from '../context/TipsContext';

export default function TipsDetailScreen({ route, navigation }) {
  const { category } = route.params;
  const { appliedTipIds, toggleTipApplied } = useTips();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header com botão de voltar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backEmoji}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{category.title}</Text>
        {/* Spacer */}
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Image source={category.icon} style={styles.heroIcon} />
          <Text style={styles.heroDescription}>{category.description}</Text>
        </View>

        <View style={styles.tipsList}>
          {category.tips.map((tip, index) => {
            const isApplied = appliedTipIds.includes(tip.id);
            return (
              <View key={tip.id} style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                </View>
                <Text style={styles.tipContent}>{tip.content}</Text>

                <TouchableOpacity
                  style={[styles.applyBtn, isApplied && styles.applyBtnActive]}
                  activeOpacity={0.8}
                  onPress={() => toggleTipApplied(tip.id)}
                >
                  <Text style={[styles.applyBtnText, isApplied && styles.applyBtnTextActive]}>
                    {isApplied ? '✓ Já aplico essa' : 'Marcar como aplicada'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backEmoji: {
    fontSize: 24,
    color: colors.primary,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...typography.styles.subtitle,
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  heroDescription: {
    ...typography.styles.body,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  tipsList: {
    paddingHorizontal: 24,
    gap: 20,
  },
  tipCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  tipTitle: {
    flex: 1,
    ...typography.styles.subtitle,
    color: colors.primary,
    fontSize: 18,
  },
  tipContent: {
    ...typography.styles.body,
    color: colors.text,
    lineHeight: 24,
  },
  applyBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  applyBtnActive: {
    backgroundColor: colors.success + '1A', // transparent success background
    borderColor: colors.success,
  },
  applyBtnText: {
    ...typography.styles.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  applyBtnTextActive: {
    color: colors.success,
    fontWeight: '700',
  },
});
