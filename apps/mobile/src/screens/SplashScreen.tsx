import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Routes, RootStackParamList } from '@/constants/routes';
import { Spacing } from '@/constants/spacing';
import { supabase } from '@/lib/supabase';

type Nav = NativeStackNavigationProp<RootStackParamList, typeof Routes.Splash>;

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigation.replace(Routes.Home);
      }
      // No session or network error → stay on splash, let user tap CTA
    }).catch(() => {
      // Supabase not yet configured (placeholder env vars) — stay on splash
    });
  }, [navigation]);

  function handleBeginJourney() {
    navigation.replace(Routes.FaceProfileSetup);
  }

  function handleSignIn() {
    // Navigate to FaceProfileSetup; the screen will detect this and show sign-in mode
    navigation.navigate(Routes.FaceProfileSetup);
  }

  return (
    <View style={styles.container}>
      {/* Brand identity */}
      <View style={styles.header}>
        <Text style={styles.appName}>Digital Mirror</Text>
        <Text style={styles.tagline}>YOUR BEAUTY, REIMAGINED BY AI</Text>
      </View>

      {/* Hero placeholder — replaced with image asset when available */}
      <View style={styles.heroContainer}>
        <ActivityIndicator size="small" color={Colors.terracotta} />
        <Text style={styles.heroSubtext}>
          Discover a personalised path to skin health and cosmetic elegance through
          precision analysis and data-driven recommendations.
        </Text>
      </View>

      {/* CTAs */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleBeginJourney}>
          <Text style={styles.primaryButtonText}>BEGIN YOUR JOURNEY</Text>
        </TouchableOpacity>
        <View style={styles.secondaryRow}>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.secondaryLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: 64,
    paddingBottom: 48,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  appName: {
    fontSize: 44,
    lineHeight: 50,
    fontFamily: 'Playfair Display',
    // fontWeight: '700',
    fontStyle: 'italic',
    color: '#55433e',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12,
    letterSpacing: 2,
    color: '#55433e',
    fontWeight: '600',
  },
  heroContainer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sectionGap,
    paddingVertical: Spacing.sectionGap,
  },
  heroSubtext: {
    fontSize: 18,
    lineHeight: 28,
    color: '#5f5e5e',
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.stackLg,
  },
  primaryButton: {
    width: '100%',
    maxWidth: 384,
    height: 56,
    backgroundColor: Colors.terracotta,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: Spacing.stackLg,
    alignItems: 'center',
  },
  secondaryLink: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '600',
    color: '#55433e',
  },
});
