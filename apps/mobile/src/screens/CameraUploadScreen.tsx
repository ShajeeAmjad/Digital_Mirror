import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Platform, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';

import { api } from '@/api/client';
import { Colors } from '@/constants/colors';
import { Routes, RootStackParamList } from '@/constants/routes';
import { Spacing } from '@/constants/spacing';

type Nav = NativeStackNavigationProp<RootStackParamList, typeof Routes.CameraUpload>;

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB target after compression

export default function CameraUploadScreen() {
  const navigation = useNavigation<Nav>();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [mode, setMode] = useState<'camera' | 'gallery'>('camera');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function compressImage(uri: string): Promise<{ uri: string; size: number }> {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1920 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
    );
    return { uri: result.uri, size: result.width * result.height * 3 }; // rough estimate
  }

  async function uploadAndNavigate(uri: string) {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const compressed = await compressImage(uri);

      // Get presigned URL from backend
      const presignRes = await api.post<{ upload_url: string; object_key: string }>(
        '/api/v1/upload/presign',
        { filename: 'photo.jpg', content_type: 'image/jpeg', size_bytes: compressed.size },
      );
      if (presignRes.error || !presignRes.data) {
        Alert.alert('Upload failed', presignRes.error ?? 'Could not get upload URL');
        return;
      }

      const { upload_url, object_key } = presignRes.data;

      // Upload directly to R2 using XMLHttpRequest for progress events
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(e.loaded / e.total);
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', 'image/jpeg');
        xhr.send({ uri: compressed.uri, type: 'image/jpeg', name: 'photo.jpg' } as unknown as Document);
      });

      navigation.replace(Routes.CreationModeSelector, { object_key });
    } catch (err: unknown) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleCapture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    if (photo) await uploadAndNavigate(photo.uri);
  }

  async function handleGalleryPick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadAndNavigate(result.assets[0].uri);
    }
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is required to take a photo.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Mirror</Text>
        <TouchableOpacity onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}>
          <Text style={[styles.headerIcon, flash === 'on' && styles.flashActive]}>⚡</Text>
        </TouchableOpacity>
      </View>

      {/* Camera feed */}
      <View style={styles.cameraContainer}>
        {mode === 'camera' ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.galleryPlaceholder]}>
            <Text style={styles.galleryPlaceholderText}>Tap below to choose a photo</Text>
          </View>
        )}

        {/* Lighting chip */}
        <View style={styles.lightingChip} pointerEvents="none">
          <View style={styles.lightingDot} />
          <Text style={styles.lightingText}>LIGHTING LOOKS GOOD</Text>
        </View>

        {/* Oval guide */}
        <View style={styles.ovalGuide} pointerEvents="none" />

        {/* Upload progress overlay */}
        {isUploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.uploadText}>
              {uploadProgress > 0 ? `${Math.round(uploadProgress * 100)}%` : 'Preparing…'}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom controls */}
      <View style={styles.controls}>
        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeChip, mode === 'camera' && styles.modeChipActive]}
            onPress={() => setMode('camera')}
          >
            <Text style={[styles.modeChipText, mode === 'camera' && styles.modeChipTextActive]}>CAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeChip, mode === 'gallery' && styles.modeChipActive]}
            onPress={() => { setMode('gallery'); handleGalleryPick(); }}
          >
            <Text style={[styles.modeChipText, mode === 'gallery' && styles.modeChipTextActive]}>GALLERY</Text>
          </TouchableOpacity>
        </View>

        {/* Shutter row */}
        <View style={styles.shutterRow}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}
          >
            <Text style={styles.flipIcon}>↺</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterOuter} onPress={handleCapture} disabled={isUploading}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View style={styles.flipButton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c17' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  headerTitle: { fontSize: 20, fontStyle: 'italic', color: Colors.charcoal },
  headerIcon: { fontSize: 20, color: Colors.terracotta, width: 32, textAlign: 'center' },
  flashActive: { opacity: 1 },
  cameraContainer: { flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  galleryPlaceholder: { backgroundColor: '#1c1c17', alignItems: 'center', justifyContent: 'center' },
  galleryPlaceholderText: { color: Colors.white, fontSize: 16 },
  lightingChip: {
    position: 'absolute', top: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 9999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  lightingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  lightingText: { fontSize: 10, fontWeight: '600', color: Colors.white, letterSpacing: 1.5 },
  ovalGuide: {
    position: 'absolute',
    width: 256, height: 320,
    borderRadius: 128,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  uploadText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  controls: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.pageMargin,
    paddingTop: Spacing.stackLg,
    paddingBottom: 48,
    gap: Spacing.stackLg,
    alignItems: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E1DA',
    borderRadius: 9999,
    padding: 4,
  },
  modeChip: { paddingHorizontal: 24, paddingVertical: 6, borderRadius: 9999 },
  modeChipActive: { backgroundColor: Colors.terracotta },
  modeChipText: { fontSize: 11, fontWeight: '600', letterSpacing: 1.5, color: Colors.charcoal },
  modeChipTextActive: { color: Colors.white },
  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' },
  flipButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  flipIcon: { fontSize: 24, color: Colors.charcoal },
  shutterOuter: {
    flex: 1, alignItems: 'center',
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: Colors.terracotta,
    justifyContent: 'center',
  },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.terracotta },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.pageMargin,
    gap: Spacing.stackLg,
  },
  permissionText: { fontSize: 16, color: Colors.charcoal, textAlign: 'center' },
  permissionButton: {
    height: 48,
    paddingHorizontal: Spacing.stackLg,
    backgroundColor: Colors.terracotta,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonText: { fontSize: 12, fontWeight: '600', letterSpacing: 1.5, color: Colors.white },
});
