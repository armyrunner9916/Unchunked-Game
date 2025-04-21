import { create } from 'zustand';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface SoundState {
  soundEnabled: boolean;
  toggleSound: () => void;
  playCorrect: () => Promise<void>;
  playIncorrect: () => Promise<void>;
  playPop: () => Promise<void>;
  playGameOver: () => Promise<void>;
  playGameWin: () => Promise<void>;
}

// Web Audio Context and sounds
let audioContext: AudioContext | null = null;
const webSounds: { [key: string]: AudioBuffer } = {};

const initializeWebAudio = async () => {
  if (Platform.OS !== 'web' || audioContext || typeof window === 'undefined') return;

  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const soundUrls = {
      correct: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Clapping.aac',
      incorrect: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Error.aac',
      pop: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Click.aac',
      gameOver: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Game_over.aac',
      gameWin: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Cheer.aac'
    };

    await Promise.all(
      Object.entries(soundUrls).map(async ([key, url]) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        webSounds[key] = await audioContext.decodeAudioData(arrayBuffer);
      })
    );
  } catch (error) {
    console.warn('Failed to load web sounds:', error);
  }
};

const playWebSound = async (key: string) => {
  if (!audioContext || !webSounds[key] || typeof window === 'undefined') return;

  try {
    const source = audioContext.createBufferSource();
    source.buffer = webSounds[key];
    source.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.warn(`Failed to play web sound ${key}:`, error);
  }
};

// Native Sound Manager
class NativeSoundManager {
  private sounds: { [key: string]: Audio.Sound } = {};
  private initialized = false;

  async initialize() {
    if (this.initialized || Platform.OS === 'web') return;

    const soundUrls = {
      correct: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Clapping.aac',
      incorrect: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Error.aac',
      pop: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Click.aac',
      gameOver: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Game_over.aac',
      gameWin: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Cheer.aac'
    };

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      await Promise.all(
        Object.entries(soundUrls).map(async ([key, url]) => {
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: false }
          );
          this.sounds[key] = sound;
        })
      );

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize native sounds:', error);
    }
  }

  async playSound(key: string) {
    if (!this.initialized || !this.sounds[key]) return;

    try {
      const sound = this.sounds[key];
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.warn(`Error playing sound ${key}:`, error);
    }
  }

  async cleanup() {
    await Promise.all(
      Object.values(this.sounds).map(sound => sound.unloadAsync())
    );
    this.sounds = {};
    this.initialized = false;
  }
}

const nativeSoundManager = new NativeSoundManager();

// Initialize appropriate sound system
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  initializeWebAudio();
} else {
  nativeSoundManager.initialize();
}

export const useSoundStore = create<SoundState>((set, get) => ({
  soundEnabled: true,

  toggleSound: () => {
    set(state => ({ soundEnabled: !state.soundEnabled }));
  },

  playCorrect: async () => {
    if (!get().soundEnabled) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      await playWebSound('correct');
    } else {
      await nativeSoundManager.playSound('correct');
    }
  },

  playIncorrect: async () => {
    if (!get().soundEnabled) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      await playWebSound('incorrect');
    } else {
      await nativeSoundManager.playSound('incorrect');
    }
  },

  playPop: async () => {
    if (!get().soundEnabled) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      await playWebSound('pop');
    } else {
      await nativeSoundManager.playSound('pop');
    }
  },

  playGameOver: async () => {
    if (!get().soundEnabled) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      await playWebSound('gameOver');
    } else {
      await nativeSoundManager.playSound('gameOver');
    }
  },

  playGameWin: async () => {
    if (!get().soundEnabled) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      await playWebSound('gameWin');
    } else {
      await nativeSoundManager.playSound('gameWin');
    }
  }
}));