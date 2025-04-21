import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View } from 'react-native';
import Instructions from '../components/Instructions';
import { useGameStore } from '../store/gameStore';

export default function RootLayout() {
  useFrameworkReady();
  const { hasSeenInstructions } = useGameStore();

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {!hasSeenInstructions ? (
        <Instructions onClose={() => {}} />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      )}
      <StatusBar style="light" />
    </View>
  );
}