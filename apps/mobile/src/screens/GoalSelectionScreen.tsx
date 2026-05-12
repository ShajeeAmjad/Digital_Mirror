import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { Routes, RootStackParamList } from '@/constants/routes';
import { Spacing } from '@/constants/spacing';

type Nav = NativeStackNavigationProp<RootStackParamList, typeof Routes.GoalSelection>;
type Route = RouteProp<RootStackParamList, typeof Routes.GoalSelection>;

const GOALS = ['Natural', 'Glam', 'Editorial', 'Office', 'Evening', 'Bold'];

export default function GoalSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const params = route.params;

  const [selected, setSelected] = useState<string[]>([]);

  function toggleGoal(goal: string) {
    setSelected(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal],
    );
  }

  function handleContinue() {
    const object_key = params?.object_key;
    if (object_key) {
      navigation.replace(Routes.Editor, { object_key, goals: selected });
    } else {
      navigation.replace(Routes.Home);
    }
  }

  const canContinue = selected.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Mirror</Text>
        {/* Spacer to balance the back button */}
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Heading block */}
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>What's your beauty goal?</Text>
          <Text style={styles.subtext}>
            Select all that apply — we'll personalise your experience.
          </Text>
        </View>

        {/* Chip grid */}
        <View style={styles.chipGrid}>
          {GOALS.map(goal => {
            const isSelected = selected.includes(goal);
            return (
              <TouchableOpacity
                key={goal}
                onPress={() => toggleGoal(goal)}
                style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                  {goal}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canContinue}
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.pageMargin,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.charcoal}1A`, // charcoal at ~10% opacity
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: Colors.terracotta,
    lineHeight: 26,
  },
  headerTitle: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '500',
    color: Colors.charcoal,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 32,
  },

  // ── ScrollView ───────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: Spacing.sectionGap,
    paddingBottom: Spacing.sectionGap,
    alignItems: 'center',
  },

  // ── Heading block ────────────────────────────────────────────────────────────
  headingBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.sectionGap,
  },
  heading: {
    fontSize: 36,
    fontWeight: '400',
    fontStyle: 'italic',
    color: Colors.charcoal,
    letterSpacing: -0.4,
    lineHeight: 43,
    textAlign: 'center',
    marginBottom: Spacing.stackSm,
  },
  subtext: {
    fontSize: 16,
    fontWeight: '400',
    color: '#5F5E5E',
    lineHeight: 25.6,
    textAlign: 'center',
  },

  // ── Chip grid ────────────────────────────────────────────────────────────────
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.stackSm, // gap: 8
    width: '100%',
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  chipSelected: {
    backgroundColor: Colors.terracotta,
  },
  chipUnselected: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.neutral,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  chipTextUnselected: {
    color: Colors.charcoal,
  },

  // ── Footer / Continue button ─────────────────────────────────────────────────
  footer: {
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: Spacing.stackMd,
    paddingBottom: Spacing.stackLg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: `${Colors.charcoal}1A`,
  },
  continueButton: {
    height: 56,
    backgroundColor: Colors.terracotta,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
