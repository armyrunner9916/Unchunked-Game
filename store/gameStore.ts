import { create } from 'zustand';
import { Platform } from 'react-native';
import { useSoundStore } from './soundStore';

interface Score {
  name: string;
  wordCount: number;
  date: string;
}

interface GameState {
  words: string[];
  chunks: string[];
  selectedChunks: number[];
  correctWords: string[];
  remainingGuesses: number;
  remainingHints: number;
  isGameOver: boolean;
  wordCount: number | null;
  incorrectGuess: boolean;
  noHintsLeft: boolean;
  playerName: string;
  topScores: Score[];
  hasSeenInstructions: boolean;
  setWordCount: (count: number | null) => void;
  setPlayerName: (name: string) => void;
  selectChunk: (index: number) => void;
  startNewGame: () => void;
  checkGuess: () => void;
  getHint: () => void;
  addScore: () => void;
  clearScores: () => void;
  handleQuit: () => void;
  setHasSeenInstructions: (seen: boolean) => void;
}

const storage = {
  getItem: (key: string): string | null => {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('Failed to get item from localStorage:', e);
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('Failed to set item in localStorage:', e);
      }
    }
  },
  removeItem: (key: string): void => {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Failed to remove item from localStorage:', e);
      }
    }
  }
};

export const useGameStore = create<GameState>((set, get) => ({
  words: [],
  chunks: [],
  selectedChunks: [],
  correctWords: [],
  remainingGuesses: 0,
  remainingHints: 0,
  isGameOver: false,
  wordCount: null,
  incorrectGuess: false,
  noHintsLeft: false,
  playerName: '',
  hasSeenInstructions: false,
  topScores: (() => {
    const savedScores = storage.getItem('topScores');
    return savedScores ? JSON.parse(savedScores) : [];
  })(),

  setHasSeenInstructions: (seen: boolean) => {
    set({ hasSeenInstructions: seen });
  },

  setPlayerName: (name: string) => {
    set({ playerName: name });
  },

  setWordCount: (count: number | null) => {
    set({ wordCount: count });
  },

  selectChunk: (index: number) => {
    const { selectedChunks, chunks } = get();
    const { playPop } = useSoundStore.getState();
    
    if (selectedChunks.includes(index)) {
      set({ selectedChunks: selectedChunks.filter(i => i !== index) });
      playPop();
      return;
    }
    
    if (selectedChunks.length >= 3) {
      return;
    }
    
    set({ 
      selectedChunks: [...selectedChunks, index],
      incorrectGuess: false,
      noHintsLeft: false
    });
    playPop();
  },

  clearScores: () => {
    set({ topScores: [] });
    storage.removeItem('topScores');
  },

  getHint: () => {
    const { words, chunks, selectedChunks, correctWords, remainingHints } = get();
    const { playPop } = useSoundStore.getState();
    
    if (remainingHints <= 0) {
      set({ noHintsLeft: true });
      return;
    }

    const remainingWords = words.filter(word => !correctWords.includes(word));
    if (remainingWords.length === 0) return;

    const targetWord = remainingWords[0];
    let hintIndex = -1;

    if (selectedChunks.length === 0) {
      const firstChunk = targetWord.slice(0, 3);
      hintIndex = chunks.findIndex(chunk => chunk === firstChunk);
    } else if (selectedChunks.length === 1) {
      const selectedChunk = chunks[selectedChunks[0]];
      const chunkPosition = targetWord.indexOf(selectedChunk);
      
      if (chunkPosition === 0) {
        const secondChunk = targetWord.slice(3, 6);
        hintIndex = chunks.findIndex(chunk => chunk === secondChunk);
      }
    }

    if (hintIndex !== -1) {
      set(state => ({
        selectedChunks: [...state.selectedChunks, hintIndex],
        remainingHints: state.remainingHints - 1,
        noHintsLeft: false,
      }));
      playPop();
    }
  },

  addScore: () => {
    const { playerName, correctWords, topScores } = get();
    if (!playerName) return;

    const newScore: Score = {
      name: playerName,
      wordCount: correctWords.length,
      date: new Date().toLocaleDateString(),
    };

    const newTopScores = [...topScores, newScore]
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 5);

    set({ topScores: newTopScores });
    storage.setItem('topScores', JSON.stringify(newTopScores));
  },

  handleQuit: () => {
    const { words, correctWords } = get();
    set({
      isGameOver: true,
      remainingGuesses: 0,
      selectedChunks: [],
    });
    const { playGameOver } = useSoundStore.getState();
    playGameOver();
  },

  startNewGame: async () => {
    const { wordCount, playerName } = get();
    if (!wordCount || !playerName) return;

    try {
      const response = await fetch('https://raw.githubusercontent.com/armyrunner9916/nine_letter_words.txt/main/word_list.txt');
      if (!response.ok) {
        throw new Error('Failed to fetch word list');
      }
      
      const text = await response.text();
      const allWords = text.split('\n')
        .map(word => word.trim().toUpperCase())
        .filter(word => word.length === 9 && /^[A-Z]+$/.test(word));
      
      if (allWords.length === 0) {
        throw new Error('No valid words found in word list');
      }

      const selectedWords = [];
      const wordsCopy = [...allWords];
      
      for (let i = 0; i < wordCount && wordsCopy.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * wordsCopy.length);
        selectedWords.push(wordsCopy[randomIndex]);
        wordsCopy.splice(randomIndex, 1);
      }

      const chunks: string[] = [];
      selectedWords.forEach(word => {
        chunks.push(word.slice(0, 3));
        chunks.push(word.slice(3, 6));
        chunks.push(word.slice(6, 9));
      });

      for (let i = chunks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
      }

      set({
        words: selectedWords,
        chunks,
        selectedChunks: [],
        correctWords: [],
        remainingGuesses: wordCount + 1,
        remainingHints: 4,
        isGameOver: false,
        incorrectGuess: false,
        noHintsLeft: false,
      });
    } catch (error) {
      console.error('Failed to fetch words:', error);
      const fallbackWords = ['CHALLENGE', 'ADVENTURE', 'DISCOVERY', 'KNOWLEDGE', 'BEAUTIFUL', 'STRENGTH', 'CREATIVE', 'JOURNEY', 'EXPLORE', 'WISDOM'];
      const selectedWords = fallbackWords.slice(0, wordCount);
      
      const chunks: string[] = [];
      selectedWords.forEach(word => {
        chunks.push(word.slice(0, 3));
        chunks.push(word.slice(3, 6));
        chunks.push(word.slice(6, 9));
      });

      for (let i = chunks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
      }

      set({
        words: selectedWords,
        chunks,
        selectedChunks: [],
        correctWords: [],
        remainingGuesses: wordCount + 1,
        remainingHints: 4,
        isGameOver: false,
        incorrectGuess: false,
        noHintsLeft: false,
      });
    }
  },

  checkGuess: () => {
    const { selectedChunks, chunks, words, correctWords, remainingGuesses } = get();
    const { playCorrect, playIncorrect } = useSoundStore.getState();
    
    if (selectedChunks.length !== 3) return;

    const guessedWord = selectedChunks
      .map(index => chunks[index])
      .join('');

    const isCorrect = words.some(word => word === guessedWord) && !correctWords.includes(guessedWord);

    const newRemainingGuesses = isCorrect ? remainingGuesses : remainingGuesses - 1;
    const newCorrectWords = isCorrect ? [...correctWords, guessedWord] : correctWords;
    
    let newChunks = [...chunks];
    if (isCorrect) {
      const sortedSelectedChunks = [...selectedChunks].sort((a, b) => b - a);
      sortedSelectedChunks.forEach(index => {
        newChunks = [...newChunks.slice(0, index), ...newChunks.slice(index + 1)];
      });
      playCorrect();
    } else {
      playIncorrect();
    }

    const isGameOver = newRemainingGuesses === 0 || newCorrectWords.length === words.length;

    set({
      chunks: newChunks,
      selectedChunks: [],
      correctWords: newCorrectWords,
      remainingGuesses: newRemainingGuesses,
      isGameOver,
      incorrectGuess: !isCorrect,
    });

    if (isGameOver) {
      const { playGameOver, playGameWin } = useSoundStore.getState();
      if (newCorrectWords.length === words.length) {
        playGameWin();
        get().addScore();
      } else {
        playGameOver();
      }
    }
  },
}));