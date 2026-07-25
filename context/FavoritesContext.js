// SmartFridge — FavoritesContext
// Gerencia receitas favoritas com persistência via AsyncStorage.
// Contexto separado do ProfileContext para manter responsabilidades claras.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@smartfridge_favorites';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]); // Recipe[]

  // --- Carrega favoritos do storage ao montar ---
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('[FavoritesContext] Erro ao carregar favoritos:', error);
      }
    };
    load();
  }, []);

  // --- Persiste a lista atualizada ---
  const persist = useCallback(async (list) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      console.error('[FavoritesContext] Erro ao salvar favoritos:', error);
    }
  }, []);

  // --- Adiciona ou remove favorito (toggle) ---
  const toggleFavorite = useCallback((recipe) => {
    setFavorites((current) => {
      const exists = current.some((r) => r.idMeal === recipe.idMeal);
      const updated = exists
        ? current.filter((r) => r.idMeal !== recipe.idMeal)
        : [recipe, ...current]; // insere no topo
      persist(updated);
      return updated;
    });
  }, [persist]);

  // --- Verifica se uma receita é favorita ---
  const isFavorite = useCallback(
    (idMeal) => favorites.some((r) => r.idMeal === idMeal),
    [favorites]
  );

  const value = { favorites, toggleFavorite, isFavorite };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// === Hook de acesso ===
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
}
