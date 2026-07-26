// SmartFridge — App.js
// Ponto de entrada: monta os providers e o navigator principal.

import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// gesture-handler requer este import apenas em plataformas nativas
if (Platform.OS !== 'web') {
  require('react-native-gesture-handler');
}

import { ProfileProvider } from './context/ProfileContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { TipsProvider } from './context/TipsContext';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
  return (
    // GestureHandlerRootView obrigatório para react-native-gesture-handler
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* ProfileProvider envolve FavoritesProvider para que ambos sejam acessíveis */}
        <ProfileProvider>
          <FavoritesProvider>
            <TipsProvider>
              <StatusBar style="dark" backgroundColor="#254fdb" />
              <RootNavigator />
            </TipsProvider>
          </FavoritesProvider>
        </ProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
