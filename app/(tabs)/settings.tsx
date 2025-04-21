import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Instructions from '../../components/Instructions';
import { useSoundStore } from '../../store/soundStore';
import { useMusicStore } from '../../store/musicStore';

export default function SettingsScreen() {
  const [showInstructions, setShowInstructions] = React.useState(false);
  const { soundEnabled, toggleSound } = useSoundStore();
  const { musicEnabled, toggleMusic } = useMusicStore();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.option} 
          onPress={() => setShowInstructions(true)}
        >
          <Text style={styles.optionText}>Instructions</Text>
        </TouchableOpacity>

        <View style={styles.option}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Sound Effects</Text>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.option}>
          <View style={styles.optionRow}>
            <Text style={styles.optionText}>Background Music</Text>
            <Switch
              value={musicEnabled}
              onValueChange={toggleMusic}
              trackColor={{ false: '#666', true: '#4CAF50' }}
              thumbColor={musicEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
      {showInstructions && (
        <Instructions onClose={() => setShowInstructions(false)} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  option: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});