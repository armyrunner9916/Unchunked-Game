import { create } from 'zustand';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface MusicState {
  musicEnabled: boolean;
  toggleMusic: () => void;
  startBackgroundMusic: () => Promise<void>;
  stopBackgroundMusic: () => Promise<void>;
}

let backgroundMusic: Audio.Sound | null = null;
let webAudioContext: AudioContext | null = null;
let webAudioBuffer: AudioBuffer | null = null;
let webAudioSource: AudioBufferSourceNode | null = null;
let isPlaying = false;

const initializeWebAudio = async () => {
  if (Platform.OS !== 'web' || webAudioContext || typeof window === 'undefined') return;

  try {
    webAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const response = await fetch('https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Background_Music.wav');
    const arrayBuffer = await response.arrayBuffer();
    webAudioBuffer = await webAudioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.warn('Failed to load background music:', error);
  }
};

const playWebMusic = () => {
  if (!webAudioContext || !webAudioBuffer || isPlaying || typeof window === 'undefined') return;

  try {
    stopWebMusic();
    
    webAudioSource = webAudioContext.createBufferSource();
    webAudioSource.buffer = webAudioBuffer;
    webAudioSource.loop = true;
    webAudioSource.connect(webAudioContext.destination);
    webAudioSource.start(0);
    isPlaying = true;
  } catch (error) {
    console.warn('Failed to play web music:', error);
  }
};

const stopWebMusic = () => {
  if (!isPlaying || typeof window === 'undefined') return;

  try {
    if (webAudioSource) {
      webAudioSource.stop();
      webAudioSource.disconnect();
      webAudioSource = null;
    }
    isPlaying = false;
  } catch (error) {
    console.warn('Failed to stop web music:', error);
  }
};

// Only initialize web audio if we're in a browser environment
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  initializeWebAudio();
}

export const useMusicStore = create<MusicState>((set, get) => ({
  musicEnabled: false,

  toggleMusic: () => {
    const newState = !get().musicEnabled;
    set({ musicEnabled: newState });
    
    if (newState) {
      get().startBackgroundMusic();
    } else {
      get().stopBackgroundMusic();
    }
  },

  startBackgroundMusic: async () => {
    if (!get().musicEnabled) return;

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        playWebMusic();
      } else {
        if (!backgroundMusic) {
          const { sound } = await Audio.Sound.createAsync(
            { uri: 'https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/Background_Music.wav' },
            { isLooping: true, shouldPlay: true }
          );
          backgroundMusic = sound;
        } else {
          await backgroundMusic.playAsync();
        }
      }
    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  },

  stopBackgroundMusic: async () => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        stopWebMusic();
      } else if (backgroundMusic) {
        const status = await backgroundMusic.getStatusAsync();
        if (status.isLoaded) {
          await backgroundMusic.stopAsync();
        }
      }
    } catch (error) {
      console.warn('Failed to stop background music:', error);
    }
  },
}));