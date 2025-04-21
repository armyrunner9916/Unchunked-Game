import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../../store/gameStore';
import { Trash2 } from 'lucide-react-native';

export default function TopScoresScreen() {
  const { topScores, clearScores } = useGameStore();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClearScores = () => {
    setShowConfirmation(true);
  };

  const handleConfirmClear = () => {
    clearScores();
    setShowConfirmation(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>High Scores</Text>
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>Date</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Score</Text>
        </View>
        {topScores.length > 0 ? (
          topScores.map((score, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.cell, { flex: 2 }]}>{score.name}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{score.date}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{score.wordCount}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noScores}>No scores yet. Play a game to set a record!</Text>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        {topScores.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearScores}
            activeOpacity={0.8}
          >
            <Trash2 size={16} color="#fff" style={styles.clearIcon} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Clear High Scores</Text>
            <Text style={styles.modalText}>
              Are you sure you want to clear all high scores? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmClear}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tableContainer: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
  },
  headerCell: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    padding: 15,
  },
  cell: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  noScores: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    padding: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  clearButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    marginRight: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#ff4444',
  },
});