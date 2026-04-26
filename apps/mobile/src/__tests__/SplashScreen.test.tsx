import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

import SplashScreen from '@/screens/SplashScreen';

const mockReplace = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    replace: mockReplace,
    navigate: mockNavigate,
  }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe('SplashScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockNavigate.mockClear();
  });

  it('navigates to Home when session is active', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { access_token: 'valid-token' } },
    });

    render(<SplashScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('Home');
    });
  });

  it('stays on splash (no replace) when no session', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
    });

    render(<SplashScreen />);

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
