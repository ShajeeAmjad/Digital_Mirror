import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { Routes, RootStackParamList } from '@/constants/routes';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';

type Nav = NativeStackNavigationProp<RootStackParamList, typeof Routes.FaceProfileSetup>;
type AuthMode = 'signup' | 'signin';
type ScreenMode = 'auth' | 'camera';

export default function FaceProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { signUp, signIn, isLoading, error } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [screenMode, setScreenMode] = useState<ScreenMode>('auth');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    if (authMode === 'signup') {
      await signUp(email, password);
      if (!error) {
        await requestCameraPermission();
        setScreenMode('camera');
      }
    } else {
      await signIn(email, password);
      if (!error) {
        navigation.replace(Routes.Home);
      }
    }
  }

  function handleCapture() {
    navigation.replace(Routes.GoalSelection);
  }

  if (screenMode === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        {/* Header */}
        <View style={styles.cameraHeader}>
          <Text style={styles.cameraTitle}>Position your face in the frame</Text>
          <Text style={styles.cameraSubtitle}>
            Find a spot with natural, even lighting for the best results.
          </Text>
        </View>

        {/* Camera feed */}
        <View style={styles.cameraFeed}>
          {cameraPermission?.granted ? (
            <CameraView style={StyleSheet.absoluteFill} facing="front" />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.cameraFallback]}>
              <Text style={styles.cameraFallbackText}>Camera access required</Text>
            </View>
          )}

          {/* Oval face guide */}
          <View style={styles.ovalGuide} pointerEvents="none" />

          {/* Lighting indicator HUD */}
          <View style={styles.hudRow} pointerEvents="none">
            <View style={styles.hudChip}>
              <Text style={styles.hudText}>GOOD LIGHTING</Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.cameraControls}>
          <View style={styles.shutterRow}>
            <View style={styles.shutterSpacer} />
            <TouchableOpacity style={styles.shutterOuter} onPress={handleCapture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
            <View style={styles.shutterSpacer} />
          </View>
          <TouchableOpacity>
            <Text style={styles.galleryLink}>Upload from gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Auth mode
  return (
    <KeyboardAvoidingView
      style={styles.authContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.authInner}>
        <Text style={styles.authTitle}>
          {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
        </Text>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleChip, authMode === 'signup' && styles.toggleChipActive]}
            onPress={() => setAuthMode('signup')}
          >
            <Text style={[styles.toggleText, authMode === 'signup' && styles.toggleTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleChip, authMode === 'signin' && styles.toggleChipActive]}
            onPress={() => setAuthMode('signin')}
          >
            <Text style={[styles.toggleText, authMode === 'signin' && styles.toggleTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor="#88726d"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              placeholderTextColor="#88726d"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(v => !v)}
            >
              <Text style={styles.eyeButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Submit */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {authMode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Auth styles
  authContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  authInner: {
    flex: 1,
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: 80,
    gap: Spacing.stackLg,
  },
  authTitle: {
    fontSize: 36,
    lineHeight: 43,
    fontStyle: 'italic',
    color: Colors.charcoal,
    letterSpacing: -0.36,
    marginBottom: Spacing.stackSm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.stackSm,
  },
  toggleChip: {
    paddingHorizontal: Spacing.stackMd,
    paddingVertical: Spacing.stackSm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.neutral,
  },
  toggleChipActive: {
    backgroundColor: Colors.charcoal,
    borderColor: Colors.charcoal,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: Colors.charcoal,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  inputGroup: {
    gap: Spacing.stackSm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#55433e',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.neutral,
    borderRadius: 8,
    paddingHorizontal: Spacing.stackMd,
    fontSize: 16,
    color: Colors.charcoal,
    backgroundColor: Colors.white,
    flex: 1,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  passwordInput: {
    borderWidth: 0,
    borderRadius: 0,
  },
  eyeButton: {
    paddingHorizontal: Spacing.stackMd,
  },
  eyeButtonText: {
    fontSize: 12,
    color: '#55433e',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
  },
  primaryButton: {
    height: 56,
    backgroundColor: Colors.terracotta,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.stackSm,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
  },

  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cameraHeader: {
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: 64,
    paddingBottom: Spacing.stackLg,
    alignItems: 'center',
    gap: Spacing.stackSm,
  },
  cameraTitle: {
    fontSize: 24,
    lineHeight: 33,
    color: Colors.charcoal,
  },
  cameraSubtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: '#5f5e5e',
    textAlign: 'center',
    maxWidth: 280,
  },
  cameraFeed: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#1c1c17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1c17',
  },
  cameraFallbackText: {
    color: Colors.white,
    fontSize: 16,
  },
  ovalGuide: {
    position: 'absolute',
    width: 280,
    height: 380,
    borderRadius: 140,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  hudRow: {
    position: 'absolute',
    top: 32,
    flexDirection: 'row',
    gap: Spacing.stackMd,
  },
  hudChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  hudText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.6,
  },
  cameraControls: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: Spacing.stackLg,
    paddingBottom: 48,
    alignItems: 'center',
    gap: Spacing.stackLg,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 48,
  },
  shutterOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.terracotta,
  },
  shutterSpacer: {
    width: 40,
  },
  galleryLink: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.charcoal,
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
});
