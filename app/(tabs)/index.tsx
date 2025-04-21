import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lightbulb } from 'lucide-react-native';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useSoundStore } from '../../store/soundStore';
import { useMusicStore } from '../../store/musicStore';
import { useIsFocused } from '@react-navigation/native';

const isDesktopBrowser = () => {
  if (Platform.OS !== 'web') return false;
  const userAgent = window.navigator.userAgent || window.navigator.vendor;
  return !/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

export default function GameScreen() {
  const {
    chunks,
    selectedChunks,
    correctWords,
    remainingGuesses,
    remainingHints,
    isGameOver,
    incorrectGuess,
    noHintsLeft,
    playerName,
    words,
    wordCount,
    setWordCount,
    setPlayerName,
    selectChunk,
    startNewGame,
    checkGuess,
    getHint,
    handleQuit,
  } = useGameStore();

  const { startBackgroundMusic, stopBackgroundMusic } = useMusicStore();
  const isFocused = useIsFocused();

  const [inputValue, setInputValue] = useState('');
  const [nameInput, setNameInput] = useState(playerName || '');
  const [showNotification, setShowNotification] = useState(false);
  const titleColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const isDesktop = isDesktopBrowser();

  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  useEffect(() => {
    if (isFocused && wordCount && !isGameOver) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    
    return () => {
      stopBackgroundMusic();
    };
  }, [isFocused, wordCount, isGameOver]);

  useEffect(() => {
    if (incorrectGuess) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [incorrectGuess]);

  const handlePlayAgain = () => {
    setWordCount(null);
    setInputValue('');
  };

  const calculateCellSize = () => {
    const numColumns = 3;
    const numRows = Math.ceil(chunks.length / numColumns);
    
    // Fixed sizes for different word counts
    const baseSize = isDesktop ? 80 : 50;
    const sizes = {
      1: baseSize,      // 3 chunks
      2: baseSize * 0.9, // 6 chunks
      3: baseSize * 0.8, // 9 chunks
      4: baseSize * 0.7, // 12 chunks
      5: baseSize * 0.6, // 15 chunks
      6: baseSize * 0.5, // 18 chunks
      7: baseSize * 0.45, // 21 chunks
      8: baseSize * 0.4, // 24 chunks
      9: baseSize * 0.35, // 27 chunks
      10: baseSize * 0.3, // 30 chunks
    };

    return sizes[wordCount || 1] || baseSize;
  };

  if (!fontsLoaded) {
    return null;
  }

  if (!wordCount) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <Text style={styles.subtitle}>Enter your name and choose how many words to descramble!</Text>
          <TextInput
            style={styles.input}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter your name"
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="number-pad"
            placeholder="Enter number (1-10)"
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={[styles.button, (!nameInput || !inputValue) && styles.disabledButton]}
            disabled={!nameInput || !inputValue}
            onPress={() => {
              const count = parseInt(inputValue, 10);
              if (count > 0 && count <= 10) {
                setPlayerName(nameInput);
                setWordCount(count);
                startNewGame();
              }
            }}>
            <Text style={styles.buttonText}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cellSize = calculateCellSize();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>Player: {playerName}</Text>
          <Text style={styles.statsText}>Remaining Guesses: {remainingGuesses}</Text>
          <Text style={styles.statsText}>Remaining Hints: {remainingHints}</Text>
          <Text style={styles.statsText}>Score: {correctWords.length}/{wordCount}</Text>
        </View>
      </View>

      <View style={[styles.gameContainer, !isDesktop && styles.mobileGameContainer]}>
        <View style={[styles.matrixContainer, !isDesktop && styles.mobileMatrixContainer]}>
          <View style={[styles.matrix, !isDesktop && styles.mobileMatrix]}>
            {chunks.length > 0 && Array.from({ length: Math.ceil(chunks.length / 3) }).map((_, rowIndex) => (
              <View key={rowIndex} style={[styles.matrixRow, !isDesktop && styles.mobileMatrixRow]}>
                {Array.from({ length: 3 }).map((_, colIndex) => {
                  const chunkIndex = rowIndex * 3 + colIndex;
                  if (chunkIndex >= chunks.length) return null;
                  
                  return (
                    <TouchableOpacity
                      key={chunkIndex}
                      style={[
                        styles.chunk,
                        {
                          width: cellSize,
                          height: cellSize,
                          marginRight: colIndex < 2 ? (isDesktop ? 10 : 6) : 0,
                          marginBottom: rowIndex < Math.ceil(chunks.length / 3) - 1 ? (isDesktop ? 10 : 6) : 0,
                        },
                        selectedChunks.includes(chunkIndex) && styles.selectedChunk,
                      ]}
                      onPress={() => selectChunk(chunkIndex)}>
                      <Text style={[
                        styles.chunkText,
                        { fontSize: Math.min(cellSize * 0.4, 24) }
                      ]}>{chunks[chunkIndex]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {isDesktop && (
          <View style={styles.correctWordsContainer}>
            <Text style={styles.correctWordsTitle}>Correct Words:</Text>
            {correctWords.map((word, index) => (
              <Text key={index} style={styles.correctWord}>
                {word}
              </Text>
            ))}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {selectedChunks.length === 3 ? (
          <>
            <TouchableOpacity style={styles.submitButton} onPress={checkGuess}>
              <Text style={styles.buttonText}>Submit Guess</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
              <Text style={styles.buttonText}>Give Up</Text>
            </TouchableOpacity>
          </>
        ) : remainingHints > 0 && selectedChunks.length <= 1 ? (
          <>
            <TouchableOpacity 
              style={[styles.hintButton, remainingHints === 0 && styles.disabledButton]} 
              onPress={getHint}
              disabled={remainingHints === 0}>
              <Lightbulb size={24} color="#fff" style={styles.hintIcon} />
              <Text style={styles.buttonText}>Get Hint</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
              <Text style={styles.buttonText}>Give Up</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.buttonText}>Give Up</Text>
          </TouchableOpacity>
        )}
      </View>

      {showNotification && (
        <View style={styles.notificationOverlay}>
          <View style={styles.notificationBox}>
            <Text style={styles.notificationText}>
              That is not correct. Try again.
            </Text>
          </View>
        </View>
      )}

      {isGameOver && (
        <View style={styles.gameOverContainer}>
          <View style={styles.gameOverContent}>
            <Text style={styles.gameOverText}>
              {correctWords.length === words.length ? 'Congratulations!' : (
                <Text style={styles.gameOverFailText}>
                  Sorry, better luck next time!
                </Text>
              )}
            </Text>
            <View style={styles.wordList}>
              <Text style={styles.wordListTitle}>Complete Word List:</Text>
              {words.map((word, index) => (
                <View key={index} style={styles.wordListRow}>
                  <Text style={[
                    styles.wordListItem,
                    correctWords.includes(word) ? styles.wordListItemCorrect : styles.wordListItemIncorrect
                  ]}>
                    {word} {correctWords.includes(word) ? '✓' : '✗'}
                  </Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handlePlayAgain}>
              <Text style={styles.buttonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  header: {
    padding: 15,
    backgroundColor: '#111',
  },
  statsContainer: {
    gap: 8,
  },
  statsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  gameContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  mobileGameContainer: {
    flexDirection: 'column',
    padding: 10,
  },
  matrixContainer: {
    flex: isDesktopBrowser() ? 2 : undefined,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  mobileMatrixContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  matrix: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mobileMatrix: {
    gap: 4,
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mobileMatrixRow: {
    gap: 4,
  },
  chunk: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedChunk: {
    backgroundColor: '#4CAF50',
  },
  chunkText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 2,
  },
  correctWordsContainer: {
    flex: isDesktopBrowser() ? 1 : undefined,
    padding: 15,
    backgroundColor: '#111',
    borderRadius: 8,
    marginLeft: isDesktopBrowser() ? 20 : 0,
    marginTop: isDesktopBrowser() ? 0 : 10,
    maxHeight: 120,
  },
  correctWordsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  correctWord: {
    color: '#4CAF50',
    fontSize: 16,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    padding: 15,
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    maxWidth: 200,
  },
  hintButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 200,
    gap: 10,
  },
  quitButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hintIcon: {
    marginRight: 5,
  },
  notificationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  notificationBox: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 8,
    maxWidth: '80%',
  },
  notificationText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameOverContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 2000,
  },
  gameOverContent: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  gameOverText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  gameOverFailText: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  wordList: {
    width: '100%',
    marginVertical: 20,
  },
  wordListTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  wordListRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  wordListItem: {
    fontSize: 16,
    textAlign: 'center',
  },
  wordListItemCorrect: {
    color: '#4CAF50',
  },
  wordListItemIncorrect: {
    color: '#ff4444',
  },
});