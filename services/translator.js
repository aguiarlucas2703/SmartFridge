// SmartFridge — Translator Service
// Tradução de conteúdo da TheMealDB (que retorna tudo em inglês) para PT-BR.
//
// IMPORTANTE: Os nomes de ingredientes aqui são os nomes EXATOS que a MealDB aceita.
// Foram validados diretamente contra a API em 2026-07-26.
// A MealDB é britânica — usa "Aubergine" e não "Eggplant", "Coriander" e não "Cilantro", etc.

import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================================================
// === 1. Mapa EN → PT-BR (para exibição ao usuário)
// Chaves = nomes exatos da MealDB. Valores = tradução PT-BR.
// =============================================================
export const INGREDIENT_TRANSLATIONS = {
  // Proteínas
  'chicken': 'Frango',
  'chicken breast': 'Peito de Frango',
  'beef': 'Carne Bovina',
  'ground beef': 'Carne Moída',
  'minced beef': 'Carne Moída',
  'pork': 'Porco',
  'egg': 'Ovo',
  'eggs': 'Ovos',
  'tuna': 'Atum',
  'salmon': 'Salmão',
  'shrimp': 'Camarão',
  'bacon': 'Bacon',
  'lamb': 'Cordeiro',
  'turkey': 'Peru',
  'duck': 'Pato',
  'fish': 'Peixe',
  // Leguminosas
  'kidney beans': 'Feijão',
  'black beans': 'Feijão Preto',
  'chickpeas': 'Grão-de-Bico',
  'lentils': 'Lentilha',
  'pinto beans': 'Feijão Carioca',
  // Vegetais
  'tomato': 'Tomate',
  'onion': 'Cebola',
  'garlic': 'Alho',
  'potatoes': 'Batata',
  'potato': 'Batata',
  'sweet potatoes': 'Batata Doce',
  'sweet potato': 'Batata Doce',
  'pumpkin': 'Abóbora',
  'squash': 'Abóbora',
  'butternut squash': 'Abóbora',
  'carrot': 'Cenoura',
  'broccoli': 'Brócolis',
  'spinach': 'Espinafre',
  'pepper': 'Pimenta',
  'red pepper': 'Pimentão Vermelho',
  'green pepper': 'Pimentão Verde',
  'spring onions': 'Cebolinha',
  'mushrooms': 'Cogumelo',
  'mushroom': 'Cogumelo',
  'cucumber': 'Pepino',
  'lettuce': 'Alface',
  'zucchini': 'Abobrinha',
  'aubergine': 'Berinjela',
  'cabbage': 'Repolho',
  'celery': 'Salsão',
  'leek': 'Alho-poró',
  'ginger': 'Gengibre',
  'cassava': 'Mandioca',
  'banana': 'Banana',
  'mango': 'Manga',
  'coconut': 'Coco',
  'pineapple': 'Abacaxi',  // não tem na MealDB mas mapeamos pra exibição
  // Carboidratos
  'rice': 'Arroz',
  'bread': 'Pão',
  'flour': 'Farinha',
  'oats': 'Aveia',
  'noodles': 'Macarrão',
  'tortilla': 'Tortilha',
  'yeast': 'Fermento Biológico',
  // Laticínios
  'milk': 'Leite',
  'cheese': 'Queijo',
  'cheddar cheese': 'Queijo Cheddar',
  'parmesan': 'Parmesão',
  'butter': 'Manteiga',
  'double cream': 'Creme de Leite',
  'heavy cream': 'Creme de Leite',
  'cream': 'Creme de Leite',
  'sour cream': 'Creme Azedo',
  'cream cheese': 'Cream Cheese',
  'yogurt': 'Iogurte',
  // Temperos e condimentos
  'salt': 'Sal',
  'olive oil': 'Azeite',
  'vegetable oil': 'Óleo Vegetal',
  'sunflower oil': 'Óleo de Girassol',
  'oil': 'Óleo',
  'soy sauce': 'Molho Shoyu',
  'vinegar': 'Vinagre',
  'sugar': 'Açúcar',
  'lemon': 'Limão',
  'lime': 'Lima',
  'honey': 'Mel',
  'cumin': 'Cominho',
  'paprika': 'Páprica',
  'cinnamon': 'Canela',
  'oregano': 'Orégano',
  'basil': 'Manjericão',
  'thyme': 'Tomilho',
  'rosemary': 'Alecrim',
  'parsley': 'Salsinha',
  'coriander': 'Coentro',
  'bay leaves': 'Louro',
  'black pepper': 'Pimenta-do-reino',
  'chili powder': 'Pimenta em Pó',
  'cayenne pepper': 'Pimenta Caiena',
  'turmeric': 'Cúrcuma',
  'baking powder': 'Fermento em Pó',
  'worcestershire sauce': 'Molho Inglês',
  'ketchup': 'Ketchup',
  'mustard': 'Mostarda',
  'mayonnaise': 'Maionese',
  'water': 'Água',
  'vanilla': 'Baunilha',
  // Chocolate e derivados
  'dark chocolate': 'Chocolate Amargo',
  'milk chocolate': 'Chocolate ao Leite',
  'white chocolate': 'Chocolate Branco',
  'chocolate chips': 'Gotas de Chocolate',
  'cocoa powder': 'Cacau em Pó',
};

// =============================================================
// === 2. Mapa de categorias da MealDB (EN → PT-BR)
// =============================================================
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

// =============================================================
// === 3. Tradutor via MyMemory API (EN → PT-BR)
// Usado para nomes e instruções de receitas
// =============================================================

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const CACHE_KEY_PREFIX = '@smartfridge_translation_';
const inMemoryCache = new Map();

/** Fetch com AbortController (compatível com React Native — AbortSignal.timeout não é suportado) */
function fetchWithAbort(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Traduz um texto EN → PT-BR usando cache em dois níveis e MyMemory API.
 * Falha silenciosa: retorna o original em caso de erro.
 */
export async function translateText(text) {
  if (!text || !text.trim()) return text;
  const cacheKey = text.trim().substring(0, 60);

  if (inMemoryCache.has(cacheKey)) return inMemoryCache.get(cacheKey);

  try {
    const stored = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${cacheKey}`);
    if (stored) {
      inMemoryCache.set(cacheKey, stored);
      return stored;
    }
  } catch (_) {}

  try {
    const chunks = splitIntoChunks(text, 490);
    const translatedChunks = await Promise.all(chunks.map(translateChunk));
    const result = translatedChunks.join(' ');
    inMemoryCache.set(cacheKey, result);
    AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${cacheKey}`, result).catch(() => {});
    return result;
  } catch (_) {
    return text;
  }
}

async function translateChunk(text) {
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=en|pt-BR`;
  // usa AbortController em vez de AbortSignal.timeout (compatibilidade RN)
  const response = await fetchWithAbort(url, 6000);
  const data = await response.json();
  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return data.responseData.translatedText;
  }
  return text;
}

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

// =============================================================
// === 4. Helpers de exibição
// =============================================================

/** Traduz ingrediente EN → PT-BR para exibição ao usuário */
export function translateIngredient(ingredient) {
  if (!ingredient) return '';
  const key = ingredient.trim().toLowerCase();
  return INGREDIENT_TRANSLATIONS[key] ?? capitalize(ingredient);
}

/** Traduz categoria da MealDB → PT-BR */
export function translateCategory(category) {
  if (!category) return '';
  return CATEGORY_TRANSLATIONS[category] ?? category;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================
// === 5. Normalização PT-BR → EN (para chamadas à API)
// Converte o que o usuário digita em português para o nome
// EXATO que a MealDB aceita (validado pela API real).
// =============================================================

// Mapeamento PT-BR → nome exato da MealDB
export const PT_TO_EN_INGREDIENTS = {
  // Proteínas
  'frango': 'chicken',
  'peito de frango': 'chicken breast',
  'carne': 'ground beef',
  'carne bovina': 'beef',
  'carne moída': 'ground beef',
  'carne moida': 'ground beef',
  'porco': 'pork',
  'ovo': 'egg',
  'ovos': 'egg',
  'atum': 'tuna',
  'salmão': 'salmon',
  // Leguminosas — nomes validados na API MealDB
  'feijão': 'kidney beans',        // feijão genérico → kidney beans (8 receitas)
  'feijao': 'kidney beans',
  'feijão preto': 'black beans',   // feijão preto → black beans (6 receitas)
  'feijao preto': 'black beans',
  'feijão carioca': 'pinto beans', // feijão carioca → pinto beans (1 receita)
  'feijao carioca': 'pinto beans',
  'feijão vermelho': 'kidney beans',
  'feijao vermelho': 'kidney beans',
  'grão-de-bico': 'chickpeas',     // chickpeas (13 receitas — o mais rico!)
  'grao de bico': 'chickpeas',
  'grao-de-bico': 'chickpeas',
  'lentilha': 'lentils',           // lentils (2 receitas)
  'lentilhas': 'lentils',

  'salmao': 'salmon',
  'camarão': 'shrimp',
  'camarao': 'shrimp',
  'bacon': 'bacon',
  'cordeiro': 'lamb',
  'peru': 'turkey',
  'pato': 'duck',
  'peixe': 'fish',
  // Vegetais — usando nomes exatos da MealDB
  'tomate': 'tomato',
  'cebola': 'onion',
  'alho': 'garlic',
  'batata': 'potatoes',     // MealDB usa plural
  'batatas': 'potatoes',
  'batata doce': 'sweet potatoes',
  'batata-doce': 'sweet potatoes',
  'abóbora': 'pumpkin',
  'abobora': 'pumpkin',
  'moranga': 'pumpkin',
  'cabotiá': 'pumpkin',
  'abóbora cabotiá': 'pumpkin',
  'abobora cabotia': 'pumpkin',
  'cenoura': 'carrot',
  'brócolis': 'broccoli',
  'brocolis': 'broccoli',
  'espinafre': 'spinach',
  'pimenta': 'pepper',
  'pimentão': 'red pepper',  // MealDB usa "red pepper" ou "green pepper"
  'pimentao': 'red pepper',
  'pimentão vermelho': 'red pepper',
  'pimentão verde': 'green pepper',
  'cebolinha': 'spring onions',
  'cogumelo': 'mushrooms',   // MealDB usa plural
  'cogumelos': 'mushrooms',
  'pepino': 'cucumber',
  'alface': 'lettuce',
  'abobrinha': 'zucchini',
  'berinjela': 'aubergine',  // MealDB é britânica
  'repolho': 'cabbage',
  'salsão': 'celery',
  'salsao': 'celery',
  'alho-poró': 'leek',
  'alho poro': 'leek',
  'gengibre': 'ginger',
  // Raízes regionais
  'mandioca': 'cassava',
  'macaxeira': 'cassava',
  'aipim': 'cassava',
  // Carboidratos
  'arroz': 'rice',
  'macarrão': 'noodles',
  'macarrao': 'noodles',
  'pão': 'bread',
  'pao': 'bread',
  'farinha': 'flour',
  'farinha de trigo': 'flour',
  'aveia': 'oats',
  'fermento': 'yeast',
  'fermento biológico': 'yeast',
  'fermento biologico': 'yeast',
  'fermento em pó': 'baking powder',
  'fermento em po': 'baking powder',
  // Laticínios
  'leite': 'milk',
  'queijo': 'cheese',
  'queijo cheddar': 'cheddar cheese',
  'parmesão': 'parmesan',
  'parmesan': 'parmesan',
  'manteiga': 'butter',
  'creme de leite': 'double cream',
  'iogurte': 'yogurt',
  'requeijão': 'cream cheese',
  'requeijao': 'cream cheese',
  // Temperos e condimentos
  'sal': 'salt',
  'azeite': 'olive oil',
  'óleo': 'vegetable oil',
  'oleo': 'vegetable oil',
  'óleo de girassol': 'sunflower oil',
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
  'coentro': 'coriander',   // MealDB usa "coriander", não "cilantro"
  'louro': 'bay leaves',
  'pimenta do reino': 'black pepper',
  'pimenta-do-reino': 'black pepper',
  'mostarda': 'mustard',
  'maionese': 'mayonnaise',
  'ketchup': 'ketchup',
  'molho inglês': 'worcestershire sauce',
  'molho ingles': 'worcestershire sauce',
  'água': 'water',
  'agua': 'water',
  'cúrcuma': 'turmeric',
  'curcuma': 'turmeric',
  'pimenta caiena': 'cayenne pepper',
  'baunilha': 'vanilla',
  // Chocolate — nomes exatos da MealDB (validado via API)
  'chocolate': 'dark chocolate',        // genérico → chocolate amargo (7 receitas)
  'chocolate amargo': 'dark chocolate',
  'chocolate ao leite': 'milk chocolate',
  'chocolate branco': 'white chocolate',
  'chocolate meio amargo': 'dark chocolate',
  'gotas de chocolate': 'chocolate chips',
  'cacau': 'cocoa powder',
  'cacau em pó': 'cocoa powder',
  'açaí': 'acai',
  'acai': 'acai',  // acai → 0 no MealDB, mas pelo menos não trava
  // Frutas
  'banana': 'banana',
  'manga': 'mango',
  'coco': 'coconut',
  'abacaxi': 'pineapple',
  'morango': 'strawberry',
  'maçã': 'apple',
  'maca': 'apple',
  'uva': 'grape',
  'maracujá': 'passion fruit',
  'maracuja': 'passion fruit',
  'goiaba': 'guava',
  // Palavras idênticas em PT e EN
  'curry': 'curry',
  'tofu': 'tofu',
  'tapioca': 'tapioca',
};

// Cache em memória para normalizações
const normalizationCache = new Map();

/** Fetch com AbortController (versão para normalização — timeout menor) */
function fetchWithTimeoutRN(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Normaliza um ingrediente para o nome exato que a MealDB aceita.
 * Camadas (em ordem de velocidade):
 *   1. Cache em memória
 *   2. Mapa PT→EN estático (com a key exata)
 *   3. Mapa EN→PT como chave (já está em inglês correto)
 *   4. Heurística: sem acentos → provavelmente inglês
 *   5. Strip de acentos + recheck no mapa
 *   6. MyMemory API (último recurso, não bloqueia)
 */
export async function normalizeIngredientForAPI(ingredient) {
  if (!ingredient) return ingredient;
  const key = ingredient.trim().toLowerCase();

  if (normalizationCache.has(key)) return normalizationCache.get(key);

  // Mapa PT→EN (inclui chocolate → dark chocolate, etc.)
  if (PT_TO_EN_INGREDIENTS[key]) {
    const en = PT_TO_EN_INGREDIENTS[key];
    normalizationCache.set(key, en);
    return en;
  }

  // Já é um nome inglês válido da MealDB (chave do mapa EN→PT)
  if (INGREDIENT_TRANSLATIONS[key]) {
    normalizationCache.set(key, key);
    return key;
  }

  // Sem acentos → provavelmente inglês
  if (/^[a-z0-9\s]+$/.test(key)) {
    normalizationCache.set(key, key);
    return key;
  }

  // Strip de acentos e re-check
  const stripped = key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();

  if (PT_TO_EN_INGREDIENTS[stripped]) {
    const en = PT_TO_EN_INGREDIENTS[stripped];
    normalizationCache.set(key, en);
    return en;
  }

  if (/^[a-z0-9\s]+$/.test(stripped) && stripped) {
    normalizationCache.set(key, stripped);
    return stripped;
  }

  // Último recurso: MyMemory PT→EN
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(key)}&langpair=pt-BR|en`;
    const response = await fetchWithTimeoutRN(url, 4000);
    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText.toLowerCase().trim();
      normalizationCache.set(key, translated);
      return translated;
    }
  } catch (_) {}

  const result = stripped || key;
  normalizationCache.set(key, result);
  return result;
}
