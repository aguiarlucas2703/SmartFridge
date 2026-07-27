// SmartFridge — Design Tokens: Colors
// Paleta definida pelo usuário + tokens de suporte

export const lightColors = {
  // === Paleta principal ===
  background: '#edf1e2',   // Fundo geral
  primary: '#1F4B3F',      // Headers, botões principais, textos de destaque
  secondary: '#4C8C6B',    // Chips selecionados, badges, ícones
  accent: '#D9A441',       // % compatibilidade, favorito ativo, CTAs secundários
  text: '#16241D',         // Texto base

  // === Tokens de suporte ===
  surface: '#FFFFFF',      // Cards, modais, inputs
  border: '#DDE5D8',       // Divisores e bordas sutis
  error: '#C0392B',        // Estados de erro
  textMuted: '#6B8C7A',    // Textos secundários / placeholders
  textSecondary: '#3D5C4A', // Textos de suporte (mais escuro que muted)
  textOnPrimary: '#FFFFFF',// Texto sobre fundo verde escuro

  // === Transparências (úteis para overlays) ===
  primaryLight: 'rgba(31, 75, 63, 0.08)',
  accentLight: 'rgba(217, 164, 65, 0.15)',

  // === Feedback de ingredientes ===
  ingredientHas: '#4C8C6B',   // Ingrediente disponível
  ingredientMissing: '#C0392B', // Ingrediente faltando
};

export const darkColors = {
  // === Paleta principal ===
  background: '#121614',   // Fundo geral escuro
  primary: '#81C784',      // Headers, textos de destaque (verde claro para brilhar no escuro)
  secondary: '#4C8C6B',    // Chips selecionados, badges, ícones
  accent: '#E6C27A',       // % compatibilidade, favorito ativo
  text: '#E8ECEA',         // Texto base (branco gelo)

  // === Tokens de suporte ===
  surface: '#1C2420',      // Cards, modais, inputs
  border: '#2C3A33',       // Divisores e bordas sutis
  error: '#E57373',        // Estados de erro adaptados
  textMuted: '#8BA698',    // Textos secundários / placeholders
  textSecondary: '#A0B3A9', // Textos de suporte
  textOnPrimary: '#121614',// Texto escuro sobre o primary (que agora é claro)

  // === Transparências ===
  primaryLight: 'rgba(129, 199, 132, 0.15)',
  accentLight: 'rgba(230, 194, 122, 0.15)',

  // === Feedback de ingredientes ===
  ingredientHas: '#81C784',   
  ingredientMissing: '#E57373', 
};

// Export fallback para uso estático (onde hooks não alcançam)
export const colors = lightColors;
