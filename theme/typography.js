// SmartFridge — Design Tokens: Typography

import { Platform } from 'react-native';

// Fontes do sistema com fallback para garantir compatibilidade cross-platform
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // === Família ===
  fontFamily,

  // === Tamanhos ===
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
  },

  // === Pesos ===
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // === Line heights ===
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // === Estilos compostos pré-definidos ===
  styles: {
    hero: {
      fontSize: 36,
      fontWeight: '800',
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    body: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '400',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
  },
};
