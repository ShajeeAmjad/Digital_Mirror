// Design tokens from docs/design-system.md
// Note: task specifies #FAF7F2 for background; design-system.md YAML shows #fdf9f2 — using #FAF7F2 per task
export const Colors = {
  background: '#FAF7F2',
  charcoal: '#2D2D2D',
  terracotta: '#B35D44',
  neutral: '#E5E1DA',
  white: '#FFFFFF',
  onPrimary: '#FFFFFF',
  error: '#B3261E',
} as const;

export type ColorKey = keyof typeof Colors;
