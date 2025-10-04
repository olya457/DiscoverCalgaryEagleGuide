
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoaderScreen from '../screens/LoaderScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainTabs from './MainTabs';
import PlaceDetailsScreen from '../screens/PlaceDetailsScreen';
import type { Place } from '../screens/RecommendedPlacesScreen';

export type RootStackParamList = {
  Loader: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  PlaceDetails: { place: Place };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Tabs" component={MainTabs} />

      <Stack.Screen
        name="PlaceDetails"
        component={PlaceDetailsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
