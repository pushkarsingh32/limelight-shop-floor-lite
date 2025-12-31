import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useStore } from '../store';

export default function SummaryReportsScreen() {
  const machines = useStore((state) => state.machines);
  const downtimeEntries = useStore((state) => state.downtimeEntries);
  const maintenanceItems = useStore((state) => state.maintenanceItems);
  const alerts = useStore((state) => state.alerts);

  // Calculate current shift (last 8 hours)
  const shiftStartTime = Date.now() - 8 * 60 * 60 * 1000;

  const kpis = useMemo(() => {
    // Filter data for current shift
    const shiftDowntime = downtimeEntries.filter(
      (entry) => entry.createdAt >= shiftStartTime
    );
    const shiftAlerts = alerts.filter(
      (alert) => alert.createdAt >= shiftStartTime
    );

    // Total downtime duration in minutes
    const totalDowntimeMinutes = shiftDowntime.reduce((acc, entry) => {
      if (entry.endTime) {
        return acc + (entry.endTime - entry.startTime) / 60000;
      }
      return acc;
    }, 0);

    // Active downtime entries
    const activeDowntime = shiftDowntime.filter((entry) => !entry.endTime).length;

    // Machines running
    const runningMachines = machines.filter((m) => m.status === 'RUN').length;

    // Overdue maintenance
    const overdueMaintenance = maintenanceItems.filter(
      (item) => item.status === 'Overdue'
    ).length;

    // Pending maintenance
    const pendingMaintenance = maintenanceItems.filter(
      (item) => item.status === 'Due'
    ).length;

    // Critical alerts (High severity, not cleared)
    const criticalAlerts = shiftAlerts.filter(
      (alert) => alert.severity === 'High' && alert.status !== 'Cleared'
    ).length;

    // Alert resolution rate
    const totalShiftAlerts = shiftAlerts.length;
    const resolvedAlerts = shiftAlerts.filter(
      (alert) => alert.status === 'Cleared'
    ).length;
    const alertResolutionRate =
      totalShiftAlerts > 0
        ? Math.round((resolvedAlerts / totalShiftAlerts) * 100)
        : 0;

    // Most common downtime reason
    const reasonCounts: { [key: string]: number } = {};
    shiftDowntime.forEach((entry) => {
      const reason = entry.reasonLabel;
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    const mostCommonReason =
      Object.keys(reasonCounts).length > 0
        ? Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0][0]
        : 'None';

    // Uptime percentage (8 hour shift = 480 minutes)
    const totalShiftMinutes = 8 * 60;
    const uptimePercentage = Math.round(
      ((totalShiftMinutes - totalDowntimeMinutes) / totalShiftMinutes) * 100
    );

    return {
      totalDowntimeMinutes: Math.round(totalDowntimeMinutes),
      activeDowntime,
      runningMachines,
      totalMachines: machines.length,
      overdueMaintenance,
      pendingMaintenance,
      criticalAlerts,
      alertResolutionRate,
      mostCommonReason,
      uptimePercentage,
      totalShiftAlerts,
      resolvedAlerts,
    };
  }, [downtimeEntries, alerts, maintenanceItems, machines]);

  const KPICard = ({
    title,
    value,
    subtitle,
    color,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Shift Summary</Text>
          <Text style={styles.subtitle}>Last 8 Hours</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Performance</Text>
          <View style={styles.kpiGrid}>
            <KPICard
              title="Uptime"
              value={`${kpis.uptimePercentage}%`}
              color={kpis.uptimePercentage >= 90 ? '#4CAF50' : '#F44336'}
            />
            <KPICard
              title="Machines Running"
              value={`${kpis.runningMachines}/${kpis.totalMachines}`}
              color="#2196F3"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downtime Metrics</Text>
          <View style={styles.kpiGrid}>
            <KPICard
              title="Total Downtime"
              value={`${kpis.totalDowntimeMinutes}`}
              subtitle="minutes"
              color={kpis.totalDowntimeMinutes > 60 ? '#F44336' : '#FF9800'}
            />
            <KPICard
              title="Active Downtime"
              value={kpis.activeDowntime}
              subtitle="ongoing events"
              color={kpis.activeDowntime > 0 ? '#F44336' : '#4CAF50'}
            />
          </View>
          <View style={styles.fullWidthCard}>
            <KPICard
              title="Most Common Reason"
              value={kpis.mostCommonReason}
              color="#666"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance Status</Text>
          <View style={styles.kpiGrid}>
            <KPICard
              title="Overdue Tasks"
              value={kpis.overdueMaintenance}
              color={kpis.overdueMaintenance > 0 ? '#F44336' : '#4CAF50'}
            />
            <KPICard
              title="Pending Tasks"
              value={kpis.pendingMaintenance}
              color="#2196F3"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Management</Text>
          <View style={styles.kpiGrid}>
            <KPICard
              title="Critical Alerts"
              value={kpis.criticalAlerts}
              color={kpis.criticalAlerts > 0 ? '#F44336' : '#4CAF50'}
            />
            <KPICard
              title="Resolution Rate"
              value={`${kpis.alertResolutionRate}%`}
              subtitle={`${kpis.resolvedAlerts}/${kpis.totalShiftAlerts} resolved`}
              color={kpis.alertResolutionRate >= 80 ? '#4CAF50' : '#FF9800'}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            KPI Selection Rationale:
          </Text>
          <Text style={styles.footerDescription}>
            • Uptime % - Critical metric for production efficiency{'\n'}
            • Total/Active Downtime - Identifies productivity losses{'\n'}
            • Most Common Reason - Helps prioritize improvement efforts{'\n'}
            • Overdue Maintenance - Prevents equipment failures{'\n'}
            • Critical Alerts - Requires immediate supervisor attention{'\n'}
            • Alert Resolution Rate - Measures response effectiveness
          </Text>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  fullWidthCard: {
    marginTop: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  kpiSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  footerDescription: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
});
