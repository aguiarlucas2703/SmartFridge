// SmartFridge — Translator Service
// Tradução de conteúdo da TheMealDB (que retorna tudo em inglês) para PT-BR.
//
// Estratégia em três camadas:
//   1. Mapa estático de ingredientes e categorias (confiável, zero latência)
//   2. MyMemory API (gratuita, sem chave) para nomes e instruções de receitas
//   3. Cache em AsyncStorage: cada receita é traduzida apenas uma vez por sessão/app

import AsyncStorage from '@react-native-async-storage/async-storage';

// === 1. Mapa estático de ingredientes (EN → PT-BR) ===
export const INGREDIENT_TRANSLATIONS = {
  // Proteínas
  chicken: 'Frango',
  beef: 'Carne Bovina',
  pork: 'Porco',
  egg: 'Ovo',
  tuna: 'Atum',
  salmon: 'Salmão',
  shrimp: 'Camarão',
  bacon: 'Bacon',
  lamb: 'Cordeiro',
  turkey: 'Peru',
  duck: 'Pato',
  fish: 'Peixe',
  // Vegetais
  tomato: 'Tomate',
  onion: 'Cebola',
  garlic: 'Alho',
  potato: 'Batata',
  carrot: 'Cenoura',
  broccoli: 'Brócolis',
  spinach: 'Espinafre',
  pepper: 'Pimentão',
  mushroom: 'Cogumelo',
  corn: 'Milho',
  cucumber: 'Pepino',
  lettuce: 'Alface',
  zucchini: 'Abobrinha',
  eggplant: 'Berinjela',
  cabbage: 'Repolho',
  celery: 'Salsão',
  leek: 'Alho-poró',
  ginger: 'Gengibre',
  // Carboidratos
  rice: 'Arroz',
  pasta: 'Macarrão',
  bread: 'Pão',
  flour: 'Farinha',
  oats: 'Aveia',
  noodles: 'Macarrão',
  tortilla: 'Tortilha',
  // Laticínios
  milk: 'Leite',
  cheese: 'Queijo',
  butter: 'Manteiga',
  cream: 'Creme de Leite',
  yogurt: 'Iogurte',
  'sour cream': 'Creme Azedo',
  'cream cheese': 'Cream Cheese',
  // Temperos e molhos
  salt: 'Sal',
  'olive oil': 'Azeite',
  'soy sauce': 'Molho Shoyu',
  vinegar: 'Vinagre',
  sugar: 'Açúcar',
  lemon: 'Limão',
  lime: 'Lima',
  honey: 'Mel',
  cumin: 'Cominho',
  paprika: 'Páprica',
  cinnamon: 'Canela',
  oregano: 'Orégano',
  basil: 'Manjericão',
  thyme: 'Tomilho',
  rosemary: 'Alecrim',
  parsley: 'Salsinha',
  'bay leaves': 'Louro',
  'black pepper': 'Pimenta-do-reino',
  'chili powder': 'Pimenta em Pó',
  turmeric: 'Cúrcuma',
  'baking powder': 'Fermento em Pó',
  'baking soda': 'Bicarbonato de Sódio',
  'soy sauce': 'Molho Shoyu',
  'worcestershire sauce': 'Molho Inglês',
  ketchup: 'Ketchup',
  mustard: 'Mostarda',
  mayonnaise: 'Maionese',
  oil: 'Óleo',
  water: 'Água',
};

// === 2. Mapa estático de categorias da MealDB (EN → PT-BR) ===
export const CATEGORY_TRANSLATIONS = {
  Chicken: 'Frango',
  Beef: 'Carne Bovina',
  Pork: 'Porco',
  Lamb: 'Cordeiro',
  Seafood: 'Frutos do Mar',
  Vegetarian: 'Vegetariano',
  Vegan: 'Vegano',
  Breakfast: 'Café da Manhã',
  Dessert: 'Sobremesa',
  Pasta: 'Massas',
  Side: 'Acompanhamento',
  Starter: 'Entrada',
  Goat: 'Cabrito',
  Miscellaneous: 'Diversos',
  Unknown: 'Outros',
};

// === 3. Tradutor via MyMemory API ===

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const CACHE_KEY_PREFIX = '@smartfridge_translation_';
const inMemoryCache = new Map(); // cache em sessão (mais rápido que AsyncStorage)

/**
 * Traduz um texto EN → PT-BR usando a MyMemory API.
 * Primeiro verifica cache em memória, depois AsyncStorage, e só então chama a API.
 * Se a API falhar, retorna o texto original sem crashar o app.
 *
 * @param {string} text - Texto em inglês para traduzir
 * @returns {Promise<string>} Texto traduzido (ou original em caso de falha)
 */
export async function translateText(text) {
  if (!text || !text.trim()) return text;

  const cacheKey = text.trim().substring(0, 60); // chave baseada no início do texto

  // Verifica cache em memória primeiro (instantâneo)
  if (inMemoryCache.has(cacheKey)) {
    return inMemoryCache.get(cacheKey);
  }

  // Verifica AsyncStorage (persiste entre sessões)
  try {
    const stored = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${cacheKey}`);
    if (stored) {
      inMemoryCache.set(cacheKey, stored);
      return stored;
    }
  } catch (_) {}

  // Chama MyMemory API
  try {
    // MyMemory tem limite de ~500 chars por chamada — fatia se necessário
    const chunks = splitIntoChunks(text, 490);
    const translatedChunks = await Promise.all(
      chunks.map((chunk) => translateChunk(chunk))
    );
    const result = translatedChunks.join(' ');

    // Salva nos dois caches
    inMemoryCache.set(cacheKey, result);
    AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${cacheKey}`, result).catch(() => {});

    return result;
  } catch (error) {
    console.warn('[translator] Falha ao traduzir, usando texto original:', error.message);
    return text; // fallback: retorna original sem crashar
  }
}

/** Chama a MyMemory API para um chunk de texto */
async function translateChunk(text) {
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=en|pt-BR`;
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  const data = await response.json();

  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }
  return text; // fallback
}

/** Divide texto em chunks de no máximo maxLen caracteres, quebrando em frases */
function splitIntoChunks(text, maxLen) {
  if (text.length <= maxLen) return [text];

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

// === 4. Helpers de conveniência ===

/**
 * Traduz o nome de um ingrediente usando o mapa estático.
 * Fallback: retorna o original capitalizado.
 */
export function translateIngredient(ingredient) {
  if (!ingredient) return '';
  const key = ingredient.trim().toLowerCase();
  return INGREDIENT_TRANSLATIONS[key] ?? capitalize(ingredient);
}

/**
 * Traduz uma categoria da MealDB usando o mapa estático.
 */
export function translateCategory(category) {
  if (!category) return '';
  return CATEGORY_TRANSLATIONS[category] ?? category;
}

/** Capitaliza a primeira letra de uma string */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================
// === 5. Normalização PT-BR → EN para chamadas de API ===
// Resolve o problema de ingredientes digitados em português pelo usuário.
// A MealDB só entende inglês — este mapa converte os termos mais comuns.
// =============================================================

export const PT_TO_EN_INGREDIENTS = {
  // Proteínas
  'frango': 'chicken',
  'carne': 'beef',
  'carne bovina': 'beef',
  'carne moída': 'ground beef',
  'carne moida': 'ground beef',
  'porco': 'pork',
  'ovo': 'egg',
  'ovos': 'egg',
  'atum': 'tuna',
  'salmão': 'salmon',
  'salmao': 'salmon',
  'camarão': 'shrimp',
  'camarao': 'shrimp',
  'bacon': 'bacon',
  'cordeiro': 'lamb',
  'peru': 'turkey',
  'pato': 'duck',
  'peixe': 'fish',
  // Vegetais
  'tomate': 'tomato',
  'cebola': 'onion',
  'alho': 'garlic',
  'batata': 'potato',
  'cenoura': 'carrot',
  'brócolis': 'broccoli',
  'brocolis': 'broccoli',
  'espinafre': 'spinach',
  'pimentão': 'pepper',
  'pimentao': 'pepper',
  'cogumelo': 'mushroom',
  'milho': 'corn',
  'pepino': 'cucumber',
  'alface': 'lettuce',
  'abobrinha': 'zucchini',
  'berinjela': 'eggplant',
  'repolho': 'cabbage',
  'salsão': 'celery',
  'salsao': 'celery',
  'alho-poró': 'leek',
  'alho poro': 'leek',
  'gengibre': 'ginger',
  // Raízes regionais (muito importantes para evitar "não encontrou")
  'mandioca': 'cassava',
  'macaxeira': 'cassava',
  'aipim': 'cassava',
  'inhame': 'yam',
  'cará': 'yam',
  'cara': 'yam',
  'beterraba': 'beetroot',
  'nabo': 'turnip',
  // Carboidratos
  'arroz': 'rice',
  'macarrão': 'pasta',
  'macarrao': 'pasta',
  'pão': 'bread',
  'pao': 'bread',
  'farinha': 'flour',
  'farinha de trigo': 'flour',
  'aveia': 'oats',
  'tapioca': 'tapioca',
  'cuscuz': 'couscous',
  // Laticínios
  'leite': 'milk',
  'queijo': 'cheese',
  'manteiga': 'butter',
  'creme de leite': 'cream',
  'iogurte': 'yogurt',
  'requeijão': 'cream cheese',
  'requeijao': 'cream cheese',
  // Temperos
  'sal': 'salt',
  'azeite': 'olive oil',
  'óleo': 'oil',
  'oleo': 'oil',
  'molho de soja': 'soy sauce',
  'shoyu': 'soy sauce',
  'vinagre': 'vinegar',
  'açúcar': 'sugar',
  'acucar': 'sugar',
  'limão': 'lemon',
  'limao': 'lemon',
  'lima': 'lime',
  'mel': 'honey',
  'cominho': 'cumin',
  'páprica': 'paprika',
  'paprica': 'paprika',
  'canela': 'cinnamon',
  'orégano': 'oregano',
  'oregano': 'oregano',
  'manjericão': 'basil',
  'manjericao': 'basil',
  'tomilho': 'thyme',
  'alecrim': 'rosemary',
  'salsinha': 'parsley',
  'coentro': 'coriander',
  'louro': 'bay leaves',
  'pimenta do reino': 'black pepper',
  'pimenta-do-reino': 'black pepper',
  'fermento': 'baking powder',
  'bicarbonato': 'baking soda',
  'mostarda': 'mustard',
  'maionese': 'mayonnaise',
  'ketchup': 'ketchup',
  'molho inglês': 'worcestershire sauce',
  'molho ingles': 'worcestershire sauce',
  'água': 'water',
  'agua': 'water',
  'cúrcuma': 'turmeric',
  'curcuma': 'turmeric',
  'açafrão': 'saffron',
  'acafrao': 'saffron',
};

// Cache em memória para normalizações já feitas
const normalizationCache = new Map();

/**
 * Normaliza um ingrediente para o inglês que a MealDB entende.
 * Fluxo:
 *   1. Já está em inglês? (está no mapa EN→PT como chave) → retorna direto
 *   2. Está no mapa PT→EN? → retorna o equivalente em inglês
 *   3. Fallback: chama MyMemory (pt-BR → en) e cacheia o resultado
 *
 * @param {string} ingredient - Ingrediente digitado pelo usuário (PT ou EN)
 * @returns {Promise<string>} Ingrediente em inglês para a API
 */
export async function normalizeIngredientForAPI(ingredient) {
  if (!ingredient) return ingredient;
  const key = ingredient.trim().toLowerCase();

  // Cache hit
  if (normalizationCache.has(key)) return normalizationCache.get(key);

  // Já é inglês (chave do mapa EN→PT)?
  if (INGREDIENT_TRANSLATIONS[key]) {
    normalizationCache.set(key, key);
    return key;
  }

  // Mapa PT→EN estático
  if (PT_TO_EN_INGREDIENTS[key]) {
    const en = PT_TO_EN_INGREDIENTS[key];
    normalizationCache.set(key, en);
    return en;
  }

  // Heurística: sem caracteres acentuados ou especiais → provavelmente já é inglês
  if (/^[a-z0-9\s]+$/.test(key)) {
    normalizationCache.set(key, key);
    return key;
  }

  // Último recurso: MyMemory pt-BR → en
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(key)}&langpair=pt-BR|en`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText.toLowerCase().trim();
      normalizationCache.set(key, translated);
      return translated;
    }
  } catch (_) {}

  // Se tudo falhar, retorna o original (a API tentará de qualquer forma)
  normalizationCache.set(key, key);
  return key;
}
