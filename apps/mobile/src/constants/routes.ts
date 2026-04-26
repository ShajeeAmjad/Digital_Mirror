export const Routes = {
  Splash: 'Splash',
  FaceProfileSetup: 'FaceProfileSetup',
  GoalSelection: 'GoalSelection',
  Home: 'Home',
  CameraUpload: 'CameraUpload',
  CreationModeSelector: 'CreationModeSelector',
  Editor: 'Editor',
  AICritique: 'AICritique',
  ProductRecommendations: 'ProductRecommendations',
  BeforeAfterExport: 'BeforeAfterExport',
  Paywall: 'Paywall',
  TutorialOverview: 'TutorialOverview',
  TutorialStepDetail: 'TutorialStepDetail',
  Profile: 'Profile',
  TrendsFeed: 'TrendsFeed',
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];

// All params default to undefined; future phases add typed params per-screen.
export type RootStackParamList = {
  [K in RouteName]: undefined;
};
