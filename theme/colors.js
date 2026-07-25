// SmartFridge — Design Tokens: Colors
// Paleta definida pelo usuário + tokens de suporte

export const colors = {
  // === Paleta principal ===
  background: '#F4F6EF',   // Fundo geral
  primary: '#1F4B3F',      // Headers, botões principais, textos de destaque
  secondary: '#4C8C6B',    // Chips selecionados, badges, ícones
  accent: '#D9A441',       // % compatibilidade, favorito ativo, CTAs secundários
  text: '#16241D',         // Texto base

  // === Tokens de suporte ===
  surface: '#FFFFFF',      // Cards, modais, inputs
  border: '#DDE5D8',       // Divisores e bordas sutis
  error: '#C0392B',        // Estados de erro
  textMuted: '#6B8C7A',    // Textos secundários / placeholders
  textOnPrimary: '#FFFFFF',// Texto sobre fundo verde escuro

  // === Transparências (úteis para overlays) ===
  primaryLight: 'rgba(31, 75, 63, 0.08)',
  accentLight: 'rgba(217, 164, 65, 0.15)',

  // === Feedback de ingredientes ===
  ingredientHas: '#4C8C6B',   // Ingrediente disponível
  ingredientMissing: '#C0392B', // Ingrediente faltando
};
