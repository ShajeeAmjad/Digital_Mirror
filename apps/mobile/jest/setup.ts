jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: jest.fn(() => [
    { granted: false },
    jest.fn().mockResolvedValue({ granted: true }),
  ]),
}));

jest.mock('react-native-purchases', () => ({
  Purchases: {
    configure: jest.fn(),
    getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
  },
}));

const mockSession = null;

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
      signUp: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      refreshSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
  })),
}));
