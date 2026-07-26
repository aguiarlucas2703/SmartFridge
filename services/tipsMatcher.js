import { normalize } from './compatibility';

/**
 * Retorna uma lista de dicas que dão match com a despensa do usuário.
 * 
 * @param {string[]} pantryIngredients Ingredientes da despensa (podem ser em inglês ou digitados manualmente em PT-BR)
 * @param {object[]} tipsCategories Categorias de dicas contendo o array 'tips'
 * @returns {object[]} Array flat com as dicas correspondentes
 */
export function getTipsMatchingPantry(pantryIngredients, tipsCategories) {
  if (!pantryIngredients || pantryIngredients.length === 0) return [];

  // Normaliza a despensa (ex: "cenoura" -> "carrot", "Tomate " -> "tomato")
  const normalizedPantry = new Set(pantryIngredients.map(normalize));

  const matchingTips = [];

  for (const category of tipsCategories) {
    for (const tip of category.tips) {
      if (!tip.relatedIngredients || tip.relatedIngredients.length === 0) {
        continue;
      }
      
      // Checa se algum dos relatedIngredients (já estão em inglês na base) bate com a despensa normalizada
      const hasMatch = tip.relatedIngredients.some(related => {
        // Os relatedIngredients da base já estão em inglês puro, mas normalizar garante segurança
        const normalizedRelated = normalize(related);
        return normalizedPantry.has(normalizedRelated);
      });

      if (hasMatch) {
        matchingTips.push(tip);
      }
    }
  }

  return matchingTips;
}
