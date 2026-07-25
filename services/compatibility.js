// SmartFridge — Compatibility Algorithm
// Algoritmo próprio: calcula o percentual de compatibilidade entre os
// ingredientes disponíveis na despensa do usuário e os que a receita exige.
// Arquivo isolado para facilitar explicação na apresentação.

// Importa o mapa PT→EN para normalizar ingredientes da despensa
// (o usuário pode ter digitado "feijão" mas a receita usa "beans")
import { PT_TO_EN_INGREDIENTS } from './translator';

/**
 * Normaliza uma string de ingrediente para comparação:
 * - Remove espaços extras e converte para lowercase
 * - Se for português (ex.: "feijão"), traduz para o inglês equivalente
 * - Remove acentos residuais e pontuação
 *
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  const cleaned = str
    .trim()
    .toLowerCase()
    .replace(/[^a-zà-ü0-9\s]/gi, '') // remove pontução mas mantém acentos por ora
    .replace(/\s+/g, ' ');

  // Traduz PT→EN se encontrar no mapa
  if (PT_TO_EN_INGREDIENTS && PT_TO_EN_INGREDIENTS[cleaned]) {
    return PT_TO_EN_INGREDIENTS[cleaned];
  }

  // Remove acentos para comparação mais tolerante ("feijao" == "feijão")
  return cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

/**
 * Verifica se um ingrediente da receita "bate" com algum ingrediente da despensa.
 * Usa correspondência parcial: "chicken breast" é coberto por "chicken".
 *
 * @param {string} recipeIngredient - Ingrediente da receita (já normalizado)
 * @param {string[]} pantryNormalized - Despensa do usuário (já normalizada)
 * @returns {boolean}
 */
function ingredientMatches(recipeIngredient, pantryNormalized) {
  // Correspondência exata primeiro
  if (pantryNormalized.includes(recipeIngredient)) return true;

  // Correspondência parcial: o usuário tem "chicken" e a receita pede "chicken breast"
  return pantryNormalized.some(
    (pantryItem) =>
      recipeIngredient.includes(pantryItem) || pantryItem.includes(recipeIngredient)
  );
}

/**
 * Calcula a compatibilidade de uma receita com a despensa do usuário.
 *
 * @param {string[]} recipeIngredients - Ingredientes extraídos da receita (via extractIngredients)
 * @param {string[]} pantryIngredients - Ingredientes da despensa do usuário
 * @returns {{
 *   score: number,          // 0-100, percentual de ingredientes disponíveis
 *   matching: string[],     // ingredientes que o usuário TEM
 *   missing: string[],      // ingredientes que FALTAM
 *   total: number           // total de ingredientes da receita
 * }}
 */
export function calculateCompatibility(recipeIngredients, pantryIngredients) {
  if (!recipeIngredients || recipeIngredients.length === 0) {
    return { score: 0, matching: [], missing: [], total: 0 };
  }

  const pantryNormalized = pantryIngredients.map(normalize);

  const matching = [];
  const missing = [];

  for (const ingredient of recipeIngredients) {
    const normalizedIngredient = normalize(ingredient);
    if (ingredientMatches(normalizedIngredient, pantryNormalized)) {
      matching.push(ingredient);
    } else {
      missing.push(ingredient);
    }
  }

  const score = Math.round((matching.length / recipeIngredients.length) * 100);

  return {
    score,
    matching,
    missing,
    total: recipeIngredients.length,
  };
}

/**
 * Enriquece uma lista de receitas com dados de compatibilidade e as ordena por score.
 *
 * @param {Array<{ idMeal: string, strMeal: string, strMealThumb: string, detail: object }>} recipes
 * @param {string[]} pantryIngredients
 * @returns {Array} Receitas com { ...recipe, score, matching, missing } ordenadas por score DESC
 */
export function rankRecipes(recipes, pantryIngredients) {
  return recipes
    .map((recipe) => {
      // Os ingredientes vêm do objeto `detail` (retorno do fetchRecipeDetail)
      const recipeIngredients = [];
      if (recipe.detail) {
        for (let i = 1; i <= 20; i++) {
          const ing = recipe.detail[`strIngredient${i}`];
          if (ing && ing.trim()) recipeIngredients.push(ing.trim().toLowerCase());
        }
      }

      const compatibility = calculateCompatibility(recipeIngredients, pantryIngredients);
      return { ...recipe, ...compatibility };
    })
    .sort((a, b) => b.score - a.score);
}
