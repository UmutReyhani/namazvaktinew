import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from './types';

import PrayerTimes from '../screens/PrayerTimes';
import Quran from '../screens/Quran';
import Qibla from '../screens/Qibla';
import Surah from '../screens/Surah';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const QuranStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.text,
      }}
    >
      <Stack.Screen name="Quran" component={Quran} />
      <Stack.Screen name="Surah" component={Surah} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle-outline';

            if (route.name === 'Namaz Vakti') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Kuran') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Kıble') {
              iconName = focused ? 'compass' : 'compass-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.text,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: COLORS.primary,
            borderTopColor: COLORS.border,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Namaz Vakti" component={PrayerTimes} />
        <Tab.Screen name="Kuran" component={QuranStack} />
        <Tab.Screen name="Kıble" component={Qibla} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
