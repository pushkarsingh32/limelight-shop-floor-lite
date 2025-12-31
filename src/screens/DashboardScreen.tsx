import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { Machine } from '../types';
import * as Network from 'expo-network';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const machines = useStore((state) => state.machines);
  const user = useStore((state) => state.user);
  const syncQueue = useStore((state) => state.syncQueue);
  const setIsOnline = useStore((state) => state.setIsOnline);
  const logout = useStore((state) => state.logout);

  useEffect(() => {
    const checkConnection = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setIsOnline(networkState.isConnected ?? true);
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUN':
        return '#4CAF50';
      case 'IDLE':
        return '#FF9800';
      case 'OFF':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderMachine = ({ item }: { item: Machine }) => (
    <TouchableOpacity
      style={styles.machineCard}
      onPress={() => navigation.navigate('MachineDetail', { machine: item })}
    >
      <View style={styles.machineHeader}>
        <Text style={styles.machineName}>{item.name}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.machineType}>Type: {item.type}</Text>
      <Text style={styles.machineId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Shop Floor</Text>
          <Text style={styles.subtitle}>
            {user?.role} - {user?.email}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {syncQueue.length > 0 && (
        <View style={styles.syncBanner}>
          <Text style={styles.syncText}>
            {syncQueue.length} item(s) pending sync
          </Text>
        </View>
      )}

      <FlatList
        data={machines}
        renderItem={renderMachine}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  syncBanner: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    alignItems: 'center',
  },
  syncText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  machineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  machineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  machineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  machineType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  machineId: {
    fontSize: 12,
    color: '#999',
  },
});
