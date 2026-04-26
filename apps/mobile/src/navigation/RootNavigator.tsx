import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { Routes, type RootStackParamList } from '@/constants/routes';
import AICritiqueScreen from '@/screens/AICritiqueScreen';
import BeforeAfterExportScreen from '@/screens/BeforeAfterExportScreen';
import CameraUploadScreen from '@/screens/CameraUploadScreen';
import CreationModeSelectorScreen from '@/screens/CreationModeSelectorScreen';
import EditorScreen from '@/screens/EditorScreen';
import FaceProfileSetupScreen from '@/screens/FaceProfileSetupScreen';
import GoalSelectionScreen from '@/screens/GoalSelectionScreen';
import HomeScreen from '@/screens/HomeScreen';
import PaywallScreen from '@/screens/PaywallScreen';
import ProductRecommendationsScreen from '@/screens/ProductRecommendationsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import SplashScreen from '@/screens/SplashScreen';
import TrendsFeedScreen from '@/screens/TrendsFeedScreen';
import TutorialOverviewScreen from '@/screens/TutorialOverviewScreen';
import TutorialStepDetailScreen from '@/screens/TutorialStepDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Routes.Splash}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name={Routes.Splash} component={SplashScreen} />
        <Stack.Screen name={Routes.FaceProfileSetup} component={FaceProfileSetupScreen} />
        <Stack.Screen name={Routes.GoalSelection} component={GoalSelectionScreen} />
        <Stack.Screen name={Routes.Home} component={HomeScreen} />
        <Stack.Screen name={Routes.CameraUpload} component={CameraUploadScreen} />
        <Stack.Screen name={Routes.CreationModeSelector} component={CreationModeSelectorScreen} />
        <Stack.Screen name={Routes.Editor} component={EditorScreen} />
        <Stack.Screen name={Routes.AICritique} component={AICritiqueScreen} />
        <Stack.Screen name={Routes.ProductRecommendations} component={ProductRecommendationsScreen} />
        <Stack.Screen name={Routes.BeforeAfterExport} component={BeforeAfterExportScreen} />
        <Stack.Screen name={Routes.Paywall} component={PaywallScreen} />
        <Stack.Screen name={Routes.TutorialOverview} component={TutorialOverviewScreen} />
        <Stack.Screen name={Routes.TutorialStepDetail} component={TutorialStepDetailScreen} />
        <Stack.Screen name={Routes.Profile} component={ProfileScreen} />
        <Stack.Screen name={Routes.TrendsFeed} component={TrendsFeedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
