// SmartFridge — ProfileContext
// Fonte única de verdade para perfil do usuário e ingredientes da despensa.
// Toda leitura/escrita de AsyncStorage é centralizada aqui.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// === Chaves de storage ===
const STORAGE_KEYS = {
  PROFILE: '@smartfridge_profile',
  PANTRY: '@smartfridge_pantry',
};

// === Contexto ===
const ProfileContext = createContext(null);

// === Provider ===
export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);       // { name, avatarEmoji }
  const [pantry, setPantry] = useState([]);            // string[]
  const [isLoading, setIsLoading] = useState(true);   // controla splash/loading inicial

  // --- Carrega dados persistidos ao montar ---
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [storedProfile, storedPantry] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.PANTRY),
        ]);

        if (storedProfile) setProfile(JSON.parse(storedProfile));
        if (storedPantry) setPantry(JSON.parse(storedPantry));
      } catch (error) {
        console.error('[ProfileContext] Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // --- Criar perfil ---
  const createProfile = useCallback(async ({ name, avatarEmoji, photoUri = null }) => {
    const newProfile = { name: name.trim(), avatarEmoji, photoUri };
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('[ProfileContext] Erro ao salvar perfil:', error);
      throw error; // propaga para a tela tratar com feedback ao usuário
    }
  }, []);

  // --- Atualizar perfil ---
  const updateProfile = useCallback(async (data) => {
    setProfile(current => {
      const newProfile = { ...current, ...data };
      if (newProfile.name) newProfile.name = newProfile.name.trim();
      
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile)).catch(
        (e) => console.error('[ProfileContext] Erro ao atualizar perfil:', e)
      );
      
      return newProfile;
    });
  }, []);

  // --- Logout (limpa perfil mas mantém despensa) ---
  const logout = useCallback(async () => {
    try {
      if (profile) {
        await AsyncStorage.setItem('@smartfridge_last_profile', JSON.stringify(profile));
      }
      await AsyncStorage.removeItem(STORAGE_KEYS.PROFILE);
      setProfile(null);
    } catch (error) {
      console.error('[ProfileContext] Erro ao fazer logout:', error);
      throw error;
    }
  }, [profile]);

  // --- Salvar ingredientes da despensa ---
  const savePantry = useCallback(async (ingredients) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(ingredients));
      setPantry(ingredients);
    } catch (error) {
      console.error('[ProfileContext] Erro ao salvar despensa:', error);
      throw error;
    }
  }, []);

  // --- Adicionar ingrediente individual ---
  const addIngredient = useCallback(async (ingredient) => {
    const normalized = ingredient.trim().toLowerCase();
    if (!normalized) return;

    setPantry((current) => {
      if (current.includes(normalized)) return current;
      const updated = [...current, normalized];
      AsyncStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(updated)).catch(
        (e) => console.error('[ProfileContext] Erro ao adicionar ingrediente:', e)
      );
      return updated;
    });
  }, []);

  // --- Remover ingrediente individual ---
  const removeIngredient = useCallback(async (ingredient) => {
    setPantry((current) => {
      const updated = current.filter((i) => i !== ingredient);
      AsyncStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(updated)).catch(
        (e) => console.error('[ProfileContext] Erro ao remover ingrediente:', e)
      );
      return updated;
    });
  }, []);

  const value = {
    profile,
    pantry,
    isLoading,
    createProfile,
    updateProfile,
    logout,
    savePantry,
    addIngredient,
    removeIngredient,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

// === Hook de acesso ===
export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile deve ser usado dentro de um ProfileProvider');
  }
  return context;
}

