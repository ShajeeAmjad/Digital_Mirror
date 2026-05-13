import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { createSessionFromUrl } from '@/lib/oauth';
import RootNavigator from '@/navigation/RootNavigator';

// Required: tells expo-web-browser to close the auth tab once the redirect arrives.
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      createSessionFromUrl(url).catch(() => {/* non-fatal: ignore malformed deep links */});
    }
  }, [url]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
