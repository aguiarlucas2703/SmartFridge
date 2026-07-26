import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tipsCategories } from '../data/tips';

const STORAGE_KEYS = {
  APPLIED_TIPS: '@smartfridge_applied_tips',
};

const TipsContext = createContext(null);

export function TipsProvider({ children }) {
  const [appliedTipIds, setAppliedTipIds] = useState([]);

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.APPLIED_TIPS);
        if (stored) {
          setAppliedTipIds(JSON.parse(stored));
        }
      } catch (error) {
        console.error('[TipsContext] Erro ao carregar dados:', error);
      }
    };
    loadStoredData();
  }, []);

  const toggleTipApplied = useCallback(async (tipId) => {
    setAppliedTipIds((current) => {
      let updated;
      if (current.includes(tipId)) {
        updated = current.filter((id) => id !== tipId);
      } else {
        updated = [...current, tipId];
      }
      
      AsyncStorage.setItem(STORAGE_KEYS.APPLIED_TIPS, JSON.stringify(updated)).catch(
        (e) => console.error('[TipsContext] Erro ao salvar dicas aplicadas:', e)
      );
      
      return updated;
    });
  }, []);

  const totalTipsCount = tipsCategories.flatMap(c => c.tips).length;

  return (
    <TipsContext.Provider value={{ appliedTipIds, toggleTipApplied, totalTipsCount }}>
      {children}
    </TipsContext.Provider>
  );
}

export function useTips() {
  const context = useContext(TipsContext);
  if (!context) {
    throw new Error('useTips deve ser usado dentro de um TipsProvider');
  }
  return context;
}
