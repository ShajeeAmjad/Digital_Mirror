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

export type RootStackParamList = {
  Splash: undefined;
  FaceProfileSetup: undefined;
  GoalSelection: { object_key?: string } | undefined;
  Home: undefined;
  CameraUpload: undefined;
  CreationModeSelector: { object_key: string };
  Editor: { object_key: string; goals?: string[] };
  AICritique: undefined;
  ProductRecommendations: undefined;
  BeforeAfterExport: undefined;
  Paywall: undefined;
  TutorialOverview: undefined;
  TutorialStepDetail: undefined;
  Profile: undefined;
  TrendsFeed: undefined;
};
