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
import { Alert, AlertStatus } from '../types';

export default function AlertManagementScreen() {
  const alerts = useStore((state) => state.alerts);
  const updateAlert = useStore((state) => state.updateAlert);
  const generateNewAlert = useStore((state) => state.generateNewAlert);
  const user = useStore((state) => state.user);
  const machines = useStore((state) => state.machines);

  useEffect(() => {
    // Simulate new alerts every 30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        generateNewAlert();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = (alert: Alert) => {
    updateAlert(alert.id, {
      status: 'Acknowledged',
      acknowledgedBy: user?.email,
      acknowledgedAt: Date.now(),
    });
  };

  const handleClear = (alert: Alert) => {
    updateAlert(alert.id, {
      status: 'Cleared',
      clearedAt: Date.now(),
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return '#F44336';
      case 'Medium':
        return '#FF9800';
      case 'Low':
        return '#FFC107';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusColor = (status: AlertStatus) => {
    switch (status) {
      case 'Created':
        return '#F44336';
      case 'Acknowledged':
        return '#FF9800';
      case 'Cleared':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getMachineName = (machineId: string) => {
    return machines.find((m) => m.id === machineId)?.name || machineId;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderAlert = ({ item }: { item: Alert }) => (
    <View style={styles.alertCard}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={styles.machineName}>{getMachineName(item.machineId)}</Text>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(item.severity) },
            ]}
          >
            <Text style={styles.badgeText}>{item.severity}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.alertMessage}>{item.message}</Text>

      <Text style={styles.timestamp}>
        Created: {formatTime(item.createdAt)}
      </Text>

      {item.acknowledgedBy && item.acknowledgedAt && (
        <Text style={styles.timestamp}>
          Acknowledged by {item.acknowledgedBy} at {formatTime(item.acknowledgedAt)}
        </Text>
      )}

      {item.clearedAt && (
        <Text style={styles.timestamp}>
          Cleared: {formatTime(item.clearedAt)}
        </Text>
      )}

      {item.status === 'Created' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleAcknowledge(item)}
        >
          <Text style={styles.actionButtonText}>Acknowledge</Text>
        </TouchableOpacity>
      )}

      {item.status === 'Acknowledged' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton]}
          onPress={() => handleClear(item)}
        >
          <Text style={styles.actionButtonText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const sortedAlerts = [...alerts].sort((a, b) => {
    // Sort by status priority first, then by timestamp
    const statusPriority = { Created: 3, Acknowledged: 2, Cleared: 1 };
    const aPriority = statusPriority[a.status];
    const bPriority = statusPriority[b.status];

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    return b.createdAt - a.createdAt;
  });

  const activeAlertCount = alerts.filter(
    (a) => a.status === 'Created' || a.status === 'Acknowledged'
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alert Management</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{activeAlertCount} Active</Text>
        </View>
      </View>

      <FlatList
        data={sortedAlerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No alerts</Text>
        }
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
  countBadge: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  alertCard: {
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
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  clearButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
