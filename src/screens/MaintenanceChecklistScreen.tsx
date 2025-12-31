import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { useStore } from '../store';
import { Machine, MaintenanceItem, MaintenanceStatus } from '../types';

interface MaintenanceChecklistScreenProps {
  navigation: any;
  route: {
    params: {
      machine: Machine;
    };
  };
}

export default function MaintenanceChecklistScreen({
  route,
}: MaintenanceChecklistScreenProps) {
  const { machine } = route.params;
  const maintenanceItems = useStore((state) =>
    state.maintenanceItems.filter((item) => item.machineId === machine.id)
  );
  const updateMaintenanceItem = useStore((state) => state.updateMaintenanceItem);

  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [note, setNote] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleItemPress = (item: MaintenanceItem) => {
    if (item.status !== 'Done') {
      setSelectedItem(item);
      setNote('');
      setModalVisible(true);
    }
  };

  const handleComplete = async () => {
    if (!selectedItem) return;

    await updateMaintenanceItem(selectedItem.id, {
      status: 'Done',
      note,
      completedAt: Date.now(),
    });

    setModalVisible(false);
    setSelectedItem(null);
    setNote('');
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'Done':
        return '#4CAF50';
      case 'Due':
        return '#2196F3';
      case 'Overdue':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderItem = ({ item }: { item: MaintenanceItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
      disabled={item.status === 'Done'}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.note && (
        <Text style={styles.note} numberOfLines={2}>
          Note: {item.note}
        </Text>
      )}

      {item.completedAt && (
        <Text style={styles.timestamp}>
          Completed: {new Date(item.completedAt).toLocaleString()}
        </Text>
      )}

      {!item.synced && (
        <View style={styles.syncIndicator}>
          <Text style={styles.syncText}>Pending sync</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Maintenance Checklist</Text>
        <Text style={styles.subtitle}>{machine.name}</Text>
      </View>

      <FlatList
        data={maintenanceItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No maintenance items</Text>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Maintenance</Text>
            <Text style={styles.modalSubtitle}>{selectedItem?.title}</Text>

            <Text style={styles.inputLabel}>Add Note (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter maintenance notes..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.completeButton]}
                onPress={handleComplete}
              >
                <Text style={styles.completeButtonText}>Complete</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 32,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  syncIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  syncText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
