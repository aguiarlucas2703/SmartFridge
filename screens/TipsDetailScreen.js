import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function TipsDetailScreen({ route, navigation }) {
  const { category } = route.params;

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
        <View style={{ width: 36 }} /> {/* Spacer */}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>{category.emoji}</Text>
          <Text style={styles.heroDescription}>{category.description}</Text>
        </View>

        <View style={styles.tipsList}>
          {category.tips.map((tip, index) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
              </View>
              <Text style={styles.tipContent}>{tip.content}</Text>
            </View>
          ))}
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
    ...typography.h3,
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
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroDescription: {
    ...typography.body,
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
    ...typography.h3,
    color: colors.primary,
    fontSize: 18,
  },
  tipContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
});
