---
name: Digital Mirror Foundation
colors:
  surface: '#fdf9f2'
  surface-dim: '#dddad3'
  surface-bright: '#fdf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ec'
  surface-container: '#f2ede6'
  surface-container-high: '#ece8e1'
  surface-container-highest: '#e6e2db'
  on-surface: '#1c1c17'
  on-surface-variant: '#55433e'
  inverse-surface: '#31302c'
  inverse-on-surface: '#f4f0e9'
  outline: '#88726d'
  outline-variant: '#dbc1ba'
  surface-tint: '#974730'
  primary: '#94452e'
  on-primary: '#ffffff'
  primary-container: '#b35d44'
  on-primary-container: '#fffdff'
  inverse-primary: '#ffb5a0'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#5d5c59'
  on-tertiary: '#ffffff'
  tertiary-container: '#767571'
  on-tertiary-container: '#feffeb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#78301b'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#fdf9f2'
  on-background: '#1c1c17'
  surface-variant: '#e6e2db'
typography:
  display-lg:
    fontFamily: newsreader
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-md:
    fontFamily: newsreader
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  page-margin: 20px
  section-gap: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  grid-gutter: 16px
---

## Brand & Style

This design system is anchored in a **Minimalist Editorial** aesthetic, specifically tailored for the intersection of high-end beauty and advanced AI. It evokes the feeling of a luxury print magazine—sophisticated, calm, and intentional. The experience prioritizes quiet confidence over loud interactions, utilizing expansive whitespace to create a sense of digital "breathing room."

The target audience seeks a premium, personalized skincare or cosmetic experience where technology feels invisible and organic. By stripping away standard UI patterns like heavy gradients or aggressive shadows, the interface retreats to the background, ensuring that the user’s portrait and product photography remain the central narrative.

## Colors

The palette is restrained and earthy, avoiding the artificiality often associated with AI.
- **Background:** A warm off-white (#FAF7F2) provides a soft, paper-like canvas that is easier on the eyes than pure white.
- **Typography:** Charcoal (#2D2D2D) is used for all text to maintain high legibility while appearing softer and more premium than pure black.
- **Accent:** Terracotta (#B35D44) is the sole muted accent color, used sparingly for primary actions, notifications, or critical brand moments.
- **Neutral:** Low-contrast greys/beiges (#E5E1DA) are reserved for subtle borders and secondary UI elements.

## Typography

Typography is the primary driver of hierarchy in this design system. 
- **Headlines:** Use **Newsreader** to capture the authoritative, literary feel of a Vogue editorial. Large display sizes should use tighter tracking to emphasize the serif's elegance.
- **UI & Body:** Use **Inter** for its utilitarian clarity. It balances the "traditional" serif with a modern, functional edge. 
- **Labels:** Small labels and captions use Inter with increased letter-spacing and uppercase styling to provide a clean, architectural look to meta-data.

## Layout & Spacing

The layout follows a **Fixed Grid** approach for desktop and a generous **Fluid Grid** for mobile. 
- **Margins:** 20px page margins ensure content never feels cramped against the device edges.
- **Sectioning:** Large 32px gaps separate major content blocks, creating clear "chapters" within the interface.
- **Internal Spacing:** Elements within cards or groups use an 8px base rhythm (8px, 16px, 24px) to maintain consistent alignment.
- **Rhythm:** Prioritize vertical stacks with centered or left-aligned text to mimic high-end magazine layouts.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layers** and **Low-contrast Outlines**. 
- **Flat Depth:** Depth is communicated through color blocking (e.g., a slightly darker cream surface on the warm white background) rather than physical elevation.
- **Borders:** Use thin, 1px charcoal or neutral borders at 10-15% opacity to define boundaries without adding visual "weight."
- **Overlays:** When modals or menus appear, use a slight dimming of the background color rather than a heavy drop shadow.

## Shapes

The shape language is "Softly Geometric."
- **Cards & Containers:** Use a 12px to 16px radius. This softens the high-tech AI aspects, making them feel more approachable and "organic."
- **Buttons & Inputs:** Use a 8px radius. This provides enough structure to look professional while remaining consistent with the overall softness of the system.
- **Photography:** Images should always feature the same roundedness as their containers to maintain a cohesive, "nested" look.

## Components

- **Buttons:** Primary buttons are solid Charcoal with White text or solid Terracotta for emphasis. Secondary buttons use a thin 1px outline. Minimum height is 48px to ensure a tactile, premium feel.
- **Input Fields:** Minimalist design with a subtle 1px border. Labels stay persistent above the field in the "label-sm" uppercase style.
- **Cards:** Use cards to frame AI results and product recommendations. Cards should have no shadow, relying on a 1px #E5E1DA border or a subtle tonal shift.
- **Chips/Tags:** Used for skin concerns or product categories. Small, pill-shaped with 1px charcoal borders and Inter Medium typography.
- **AI Mirror Interface:** A specialized component featuring a large, rounded-corner video feed or photo container, framed by generous white space and minimal floating controls.
- **Lists:** Clean, horizontal rules (1px) between items with ample vertical padding (16-20px) to maintain the editorial rhythm.