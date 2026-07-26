// SmartFridge — RootNavigator
// Navegação condicional: sem perfil → fluxo de criação; com perfil → app principal.
// Usa Stack Navigator para o fluxo de onboarding e Bottom Tab para o app.

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useProfile } from '../context/ProfileContext';
import { colors } from '../theme/colors';

// === Screens ===
import CreateProfileScreen from '../screens/CreateProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import PantryScreen from '../screens/PantryScreen';
import ResultsScreen from '../screens/ResultsScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TipsScreen from '../screens/TipsScreen';
import TipsDetailScreen from '../screens/TipsDetailScreen';

// === Ícones customizados ===
import { Text, Image } from 'react-native';

function TabIcon({ source, emoji, focused }) {
  if (emoji) {
    return (
      <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>
        {emoji}
      </Text>
    );
  }
  return (
    <Image
      source={source}
      style={{
        width: focused ? 28 : 24,
        height: focused ? 28 : 24,
        opacity: focused ? 1 : 0.5,
        resizeMode: 'contain',
      }}
    />
  );
}

// === Navigators ===
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack interno da aba Início
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack interno do fluxo de Despensa → Resultados → Detalhe
function PantryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pantry" component={PantryScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack interno da aba de Favoritos
function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesScreen" component={FavoritesScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}

// Stack interno da aba de Dicas
function TipsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TipsHub" component={TipsScreen} />
      <Stack.Screen name="TipsDetail" component={TipsDetailScreen} />
    </Stack.Navigator>
  );
}

// Bottom Tab Navigator — app principal (após login)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../assets/icons/icon_home.png')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="PantryTab"
        component={PantryStack}
        options={{
          tabBarLabel: 'Despensa',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../assets/icons/icon_pantry.png')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TipsTab"
        component={TipsStack}
        options={{
          tabBarLabel: 'Dicas',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../assets/icons/icon_tips.png')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesStack}
        options={{
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({ focused }) => <TabIcon source={require('../assets/icons/icon_favorites.png')} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />, // Keep emoji since we only have 4 icons
        }}
      />
    </Tab.Navigator>
  );
}

// Tela de loading (enquanto lê AsyncStorage na inicialização)
function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// === Root Navigator — navegação condicional ===
export default function RootNavigator() {
  const { profile, isLoading } = useProfile();

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {profile ? (
          // Usuário autenticado → app principal
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          // Sem perfil → tela de criação
          <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: 8,
    height: 64,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});
