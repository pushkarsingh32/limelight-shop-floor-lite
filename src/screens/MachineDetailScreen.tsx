import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { Machine } from '../types';

interface MachineDetailScreenProps {
  navigation: any;
  route: {
    params: {
      machine: Machine;
    };
  };
}

export default function MachineDetailScreen({
  navigation,
  route,
}: MachineDetailScreenProps) {
  const { machine } = route.params;
  const user = useStore((state) => state.user);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{machine.name}</Text>
          <Text style={styles.subtitle}>
            {machine.type} • {machine.id}
          </Text>
        </View>

        {user?.role === 'Operator' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.downtimeButton]}
              onPress={() =>
                navigation.navigate('DowntimeCapture', { machine })
              }
            >
              <Text style={styles.actionButtonText}>Start Downtime</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.maintenanceButton]}
              onPress={() =>
                navigation.navigate('MaintenanceChecklist', { machine })
              }
            >
              <Text style={styles.actionButtonText}>Maintenance</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Machine Status</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  machine.status === 'RUN'
                    ? '#4CAF50'
                    : machine.status === 'IDLE'
                    ? '#FF9800'
                    : '#F44336',
              },
            ]}
          >
            <Text style={styles.statusText}>{machine.status}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Machine ID:</Text>
            <Text style={styles.infoValue}>{machine.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{machine.type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tenant:</Text>
            <Text style={styles.infoValue}>{machine.tenantId}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  downtimeButton: {
    backgroundColor: '#F44336',
  },
  maintenanceButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
