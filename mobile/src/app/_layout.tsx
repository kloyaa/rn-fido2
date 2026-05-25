import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

function AuthGuard() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  return <Slot />;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthGuard />
    </ErrorBoundary>
  );
}
