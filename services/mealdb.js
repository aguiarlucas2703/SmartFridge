// SmartFridge — MealDB Service
// Centraliza toda comunicação com a TheMealDB API (gratuita, sem chave).
// Isola a lógica de rede: se a API mudar, só este arquivo precisa ser alterado.

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Timeout em ms para cada requisição
const REQUEST_TIMEOUT = 8000;

// === Utilitários internos ===

/** Fetch com timeout para evitar requests pendurados */
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Pausa entre requests para não sobrecarregar a API */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// === Funções públicas ===

/**
 * Busca receitas que contêm pelo menos um dos ingredientes fornecidos.
 * Faz uma requisição por ingrediente e agrupa os resultados por idMeal.
 * Retorna até MAX_RESULTS receitas, ordenadas por número de ingredientes coincidentes.
 *
 * @param {string[]} ingredients - Lista de ingredientes normalizados (lowercase, trim)
 * @returns {Promise<{ idMeal: string, strMeal: string, strMealThumb: string, matchCount: number }[]>}
 */
export async function fetchRecipesByIngredients(ingredients) {
  if (!ingredients || ingredients.length === 0) return [];

  const MAX_RESULTS = 20; // Limite para não sobrecarregar a API (decisão técnica intencional)

  // Mapa: idMeal → { dados da receita, contagem de coincidências }
  const mealMap = new Map();

  for (const ingredient of ingredients) {
    try {
      const data = await fetchWithTimeout(
        `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`
      );
      if (data.meals) {
        for (const meal of data.meals) {
          if (mealMap.has(meal.idMeal)) {
            mealMap.get(meal.idMeal).matchCount += 1;
          } else {
            mealMap.set(meal.idMeal, {
              idMeal: meal.idMeal,
              strMeal: meal.strMeal,
              strMealThumb: meal.strMealThumb,
              matchCount: 1,
            });
          }
        }
      }
      // Pequena pausa entre requisições (throttle simples)
      await delay(150);
    } catch (error) {
      // Falha em um ingrediente não interrompe os outros
      console.warn(`[mealdb] Falha ao buscar "${ingredient}":`, error.message);
    }
  }

  // Ordena por matchCount (mais coincidências primeiro) e limita resultados
  return Array.from(mealMap.values())
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, MAX_RESULTS);
}

/**
 * Busca os detalhes completos de uma receita pelo ID.
 * Inclui todos os ingredientes/medidas e as instruções de preparo.
 *
 * @param {string} idMeal
 * @returns {Promise<object|null>} Objeto completo da receita ou null se não encontrado
 */
export async function fetchRecipeDetail(idMeal) {
  try {
    const data = await fetchWithTimeout(`${BASE_URL}/lookup.php?i=${idMeal}`);
    return data.meals?.[0] ?? null;
  } catch (error) {
    console.error(`[mealdb] Erro ao buscar detalhes de ${idMeal}:`, error.message);
    return null;
  }
}

/**
 * Extrai a lista de ingredientes de um objeto de receita da MealDB.
 * A API retorna ingredientes em campos strIngredient1..strIngredient20.
 *
 * @param {object} meal - Objeto completo da receita
 * @returns {string[]} Lista de ingredientes não-vazios, em lowercase
 */
export function extractIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push(ingredient.trim().toLowerCase());
    }
  }
  return ingredients;
}

/**
 * Extrai a lista de medidas (quantidade) de um objeto de receita.
 *
 * @param {object} meal
 * @returns {string[]}
 */
export function extractMeasures(meal) {
  const measures = [];
  for (let i = 1; i <= 20; i++) {
    const measure = meal[`strMeasure${i}`];
    const ingredient = meal[`strIngredient${i}`];
    if (ingredient && ingredient.trim()) {
      measures.push(measure ? measure.trim() : '');
    }
  }
  return measures;
}
