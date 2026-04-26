import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Routes, RootStackParamList } from '@/constants/routes';
import { Spacing } from '@/constants/spacing';
import { supabase } from '@/lib/supabase';

type Nav = NativeStackNavigationProp<RootStackParamList, typeof Routes.Home>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigation.replace(Routes.Splash);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Phase 7 — full implementation coming soon</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>SIGN OUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.stackLg,
    paddingHorizontal: Spacing.pageMargin,
  },
  title: {
    fontSize: 36,
    fontStyle: 'italic',
    color: Colors.charcoal,
  },
  subtitle: {
    fontSize: 16,
    color: '#5f5e5e',
    textAlign: 'center',
  },
  signOutButton: {
    paddingHorizontal: Spacing.stackLg,
    paddingVertical: Spacing.stackMd,
    borderWidth: 1,
    borderColor: Colors.neutral,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.charcoal,
  },
});
