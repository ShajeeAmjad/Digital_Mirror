import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { Routes, RootStackParamList } from '@/constants/routes';
import { Spacing } from '@/constants/spacing';

type Nav = NativeStackNavigationProp<RootStackParamList, typeof Routes.CreationModeSelector>;
type Route = RouteProp<RootStackParamList, typeof Routes.CreationModeSelector>;

// Secondary text color from wireframe
const COLOR_SECONDARY = '#5F5E5E';
// Surface container low from wireframe
const COLOR_SURFACE_CONTAINER_LOW = '#F7F3EC';
// Surface container (hover state) from wireframe
const COLOR_SURFACE_CONTAINER = '#F2EDE6';

const OPTIONS = [
  {
    id: 'ai',
    badge: 'AI GUIDED',
    title: 'Describe it',
    description: 'Use natural language to guide the AI towards your desired aesthetic.',
    cta: 'Begin description',
    color: '#D4C5BC',
  },
  {
    id: 'manual',
    badge: 'PRECISION',
    title: 'Design it',
    description: 'Use precision controls and category pickers to define every detail.',
    cta: 'Open workshop',
    color: '#C8C0B8',
  },
  {
    id: 'library',
    badge: 'LIBRARY',
    title: 'Start from a look',
    description: 'Choose from our curated library of high-end styles and signatures.',
    cta: 'Browse looks',
    color: '#BFB5AD',
  },
] as const;

export default function CreationModeSelectorScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { object_key } = route.params;

  const [pressedId, setPressedId] = useState<string | null>(null);

  function handleSelect(id: string) {
    if (id === 'ai') {
      navigation.navigate(Routes.GoalSelection, { object_key });
    } else {
      navigation.navigate(Routes.Editor, { object_key });
    }
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <Text style={styles.headerCloseText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Digital Mirror</Text>

        {/* Avatar placeholder */}
        <View style={styles.avatarPlaceholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Headline section */}
        <View style={styles.headlineSection}>
          <Text style={styles.headline}>How would you like{'\n'}to start?</Text>
          <Text style={styles.subtext}>
            Your portrait is ready. Select a transformation path to begin your aesthetic journey.
          </Text>
        </View>

        {/* Cards */}
        {OPTIONS.map((option) => {
          const isPressed = pressedId === option.id;
          return (
            <Pressable
              key={option.id}
              style={[
                styles.card,
                isPressed && styles.cardPressed,
              ]}
              onPressIn={() => setPressedId(option.id)}
              onPressOut={() => setPressedId(null)}
              onPress={() => handleSelect(option.id)}
              accessibilityRole="button"
              accessibilityLabel={option.title}
              accessibilityHint={option.description}
            >
              {/* Colored top area */}
              <View style={[styles.cardImageArea, { backgroundColor: option.color }]}>
                {/* Gradient overlay simulation using nested views */}
                <View style={styles.cardGradientOverlay} />

                {/* Badge chip */}
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{option.badge}</Text>
                  </View>
                </View>
              </View>

              {/* Text section */}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{option.title}</Text>
                <Text style={styles.cardDescription}>{option.description}</Text>

                {/* CTA row */}
                <View style={styles.ctaRow}>
                  <Text style={styles.ctaText}>{option.cta}</Text>
                  <Text style={styles.ctaArrow}> →</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* Recently used section */}
        <View style={styles.recentSection}>
          <Text style={styles.recentLabel}>Recently used looks</Text>
          <View style={styles.recentAvatarRow}>
            {[COLOR_SURFACE_CONTAINER, '#C8C0B8', '#BFB5AD'].map((color, idx) => (
              <View key={idx} style={[styles.recentAvatar, { backgroundColor: color }]} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.pageMargin,
    height: 64,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.neutral}99`, // ~60% opacity
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCloseText: {
    fontSize: 18,
    color: Colors.terracotta,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 22,
    fontStyle: 'italic',
    color: Colors.charcoal,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral,
    borderWidth: 1,
    borderColor: `${Colors.neutral}99`,
  },

  // ── Scroll ───────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: Spacing.sectionGap + 4,
    paddingBottom: 48,
    gap: Spacing.stackMd,
  },

  // ── Headline section ─────────────────────────────────────────────────────
  headlineSection: {
    alignItems: 'center',
    marginBottom: Spacing.sectionGap - Spacing.stackMd,
  },
  headline: {
    fontSize: 36,
    lineHeight: 43,
    fontStyle: 'italic',
    fontWeight: '400',
    color: Colors.charcoal,
    textAlign: 'center',
    letterSpacing: -0.36,
    marginBottom: Spacing.stackSm,
  },
  subtext: {
    fontSize: 16,
    lineHeight: 25.6,
    fontWeight: '400',
    color: COLOR_SECONDARY,
    textAlign: 'center',
    maxWidth: 320,
  },

  // ── Cards ────────────────────────────────────────────────────────────────
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral,
    backgroundColor: COLOR_SURFACE_CONTAINER_LOW,
    overflow: 'hidden',
    marginBottom: Spacing.stackMd,
  },
  cardPressed: {
    backgroundColor: COLOR_SURFACE_CONTAINER,
  },

  // Colored image area – 4:3 aspect ratio (wider than tall, fitting a portrait card)
  // The wireframe shows aspect-[4/5] (taller than wide) for the image portion
  cardImageArea: {
    aspectRatio: 4 / 5,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.stackMd,
    paddingLeft: Spacing.stackMd,
  },
  cardGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: Spacing.stackSm,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },

  // Card body
  cardBody: {
    padding: Spacing.stackLg,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 33.6,
    fontWeight: '400',
    fontStyle: 'italic',
    color: Colors.charcoal,
    marginBottom: Spacing.stackSm,
    letterSpacing: -0.24,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 25.6,
    fontWeight: '400',
    color: COLOR_SECONDARY,
    marginBottom: Spacing.stackLg - 4,
  },

  // CTA row
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.8,
    color: Colors.terracotta,
    textTransform: 'uppercase',
  },
  ctaArrow: {
    fontSize: 14,
    color: Colors.terracotta,
    fontWeight: '400',
  },

  // ── Recently used section ─────────────────────────────────────────────────
  recentSection: {
    marginTop: Spacing.sectionGap,
    paddingTop: Spacing.stackLg,
    borderTopWidth: 1,
    borderTopColor: `${Colors.neutral}50`,
    alignItems: 'center',
  },
  recentLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: COLOR_SECONDARY,
    marginBottom: Spacing.stackMd,
  },
  recentAvatarRow: {
    flexDirection: 'row',
    gap: Spacing.stackMd,
  },
  recentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${Colors.neutral}66`,
  },
});
