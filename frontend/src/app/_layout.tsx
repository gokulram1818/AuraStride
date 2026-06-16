import { Stack, usePathname } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      if (pathname !== '/auth/login' && pathname !== '/auth/register') {
        router.replace('/auth/login');
      }
    } else if (user && !user.profileCompleted) {
      if (pathname !== '/onboarding/survey') {
        router.replace('/onboarding/survey');
      }
    } else if (user && user.profileCompleted) {
      if (pathname === '/' || pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
        router.replace('/(tabs)/home');
      }
    }
  }, [isAuthenticated, isLoading, user?.profileCompleted, pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090A0F' }}>
        <ActivityIndicator size="large" color="#00A3FF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="onboarding/survey" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="exercise/select" />
      <Stack.Screen name="exercise/[id]" />
      <Stack.Screen name="workout/day-detail" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
