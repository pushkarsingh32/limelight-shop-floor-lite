import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Machine,
  DowntimeEntry,
  MaintenanceItem,
  Alert,
  SyncQueueItem,
} from '../types';
import { MACHINES, INITIAL_MAINTENANCE_ITEMS, INITIAL_ALERTS } from '../constants/seedData';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: 'Operator' | 'Supervisor') => Promise<void>;
  logout: () => Promise<void>;

  // Machines
  machines: Machine[];
  setMachineStatus: (machineId: string, status: 'RUN' | 'IDLE' | 'OFF') => void;

  // Downtime
  downtimeEntries: DowntimeEntry[];
  addDowntimeEntry: (entry: DowntimeEntry) => Promise<void>;
  updateDowntimeEntry: (id: string, updates: Partial<DowntimeEntry>) => Promise<void>;

  // Maintenance
  maintenanceItems: MaintenanceItem[];
  updateMaintenanceItem: (id: string, updates: Partial<MaintenanceItem>) => Promise<void>;

  // Alerts
  alerts: Alert[];
  updateAlert: (id: string, updates: Partial<Alert>) => Promise<void>;
  generateNewAlert: () => void;

  // Sync
  syncQueue: SyncQueueItem[];
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  processSyncQueue: () => Promise<void>;

  // Initialize
  initialize: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,

  login: async (email: string, role: 'Operator' | 'Supervisor') => {
    const user: User = {
      email,
      role,
      token: `mock-jwt-${Date.now()}`,
      tenantId: 'tenant-001',
    };
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  // Machines
  machines: MACHINES,

  setMachineStatus: (machineId: string, status: 'RUN' | 'IDLE' | 'OFF') => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, status } : m
      ),
    }));
  },

  // Downtime
  downtimeEntries: [],

  addDowntimeEntry: async (entry: DowntimeEntry) => {
    const entries = [...get().downtimeEntries, entry];
    await AsyncStorage.setItem('downtimeEntries', JSON.stringify(entries));
    set({ downtimeEntries: entries });

    if (!entry.synced) {
      const queue = get().syncQueue;
      queue.push({
        id: entry.id,
        type: 'downtime',
        data: entry,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
      set({ syncQueue: queue });

      if (get().isOnline) {
        get().processSyncQueue();
      }
    }
  },

  updateDowntimeEntry: async (id: string, updates: Partial<DowntimeEntry>) => {
    const entries = get().downtimeEntries.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    await AsyncStorage.setItem('downtimeEntries', JSON.stringify(entries));
    set({ downtimeEntries: entries });

    const entry = entries.find((e) => e.id === id);
    if (entry && !entry.synced) {
      const queue = get().syncQueue;
      const existingIndex = queue.findIndex(q => q.id === id);
      if (existingIndex >= 0) {
        queue[existingIndex] = {
          id: entry.id,
          type: 'downtime',
          data: entry,
          timestamp: Date.now(),
        };
      } else {
        queue.push({
          id: entry.id,
          type: 'downtime',
          data: entry,
          timestamp: Date.now(),
        });
      }
      await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
      set({ syncQueue: queue });

      if (get().isOnline) {
        get().processSyncQueue();
      }
    }
  },

  // Maintenance
  maintenanceItems: INITIAL_MAINTENANCE_ITEMS,

  updateMaintenanceItem: async (id: string, updates: Partial<MaintenanceItem>) => {
    const items = get().maintenanceItems.map((item) =>
      item.id === id ? { ...item, ...updates, synced: false } : item
    );
    await AsyncStorage.setItem('maintenanceItems', JSON.stringify(items));
    set({ maintenanceItems: items });

    const item = items.find((i) => i.id === id);
    if (item) {
      const queue = get().syncQueue;
      queue.push({
        id: item.id,
        type: 'maintenance',
        data: item,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
      set({ syncQueue: queue });

      if (get().isOnline) {
        get().processSyncQueue();
      }
    }
  },

  // Alerts
  alerts: INITIAL_ALERTS,

  updateAlert: async (id: string, updates: Partial<Alert>) => {
    const alerts = get().alerts.map((alert) =>
      alert.id === id ? { ...alert, ...updates } : alert
    );
    await AsyncStorage.setItem('alerts', JSON.stringify(alerts));
    set({ alerts });

    const alert = alerts.find((a) => a.id === id);
    if (alert) {
      const queue = get().syncQueue;
      queue.push({
        id: alert.id,
        type: 'alert',
        data: alert,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
      set({ syncQueue: queue });

      if (get().isOnline) {
        get().processSyncQueue();
      }
    }
  },

  generateNewAlert: () => {
    const machines = get().machines;
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    const messages = [
      'Temperature threshold exceeded',
      'Vibration detected',
      'Pressure anomaly detected',
      'Speed variance detected',
      'Oil level low',
    ];
    const severities: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];

    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      machineId: randomMachine.id,
      message: messages[Math.floor(Math.random() * messages.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: 'Created',
      tenantId: 'tenant-001',
      createdAt: Date.now(),
    };

    const alerts = [...get().alerts, newAlert];
    AsyncStorage.setItem('alerts', JSON.stringify(alerts));
    set({ alerts });
  },

  // Sync
  syncQueue: [],
  isOnline: true,

  setIsOnline: (online: boolean) => {
    set({ isOnline: online });
    if (online) {
      get().processSyncQueue();
    }
  },

  processSyncQueue: async () => {
    const queue = get().syncQueue;
    if (queue.length === 0 || !get().isOnline) return;

    // Simulate API sync with 1 second delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mark all items as synced
    const downtimeEntries = get().downtimeEntries.map((e) => ({
      ...e,
      synced: true,
    }));
    const maintenanceItems = get().maintenanceItems.map((m) => ({
      ...m,
      synced: true,
    }));

    await AsyncStorage.setItem('downtimeEntries', JSON.stringify(downtimeEntries));
    await AsyncStorage.setItem('maintenanceItems', JSON.stringify(maintenanceItems));
    await AsyncStorage.setItem('syncQueue', JSON.stringify([]));

    set({
      downtimeEntries,
      maintenanceItems,
      syncQueue: [],
    });
  },

  // Initialize
  initialize: async () => {
    try {
      const [userStr, downtimeStr, maintenanceStr, alertsStr, syncQueueStr] =
        await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('downtimeEntries'),
          AsyncStorage.getItem('maintenanceItems'),
          AsyncStorage.getItem('alerts'),
          AsyncStorage.getItem('syncQueue'),
        ]);

      const user = userStr ? JSON.parse(userStr) : null;
      const downtimeEntries = downtimeStr ? JSON.parse(downtimeStr) : [];
      const maintenanceItems = maintenanceStr
        ? JSON.parse(maintenanceStr)
        : INITIAL_MAINTENANCE_ITEMS;
      const alerts = alertsStr ? JSON.parse(alertsStr) : INITIAL_ALERTS;
      const syncQueue = syncQueueStr ? JSON.parse(syncQueueStr) : [];

      set({
        user,
        isAuthenticated: !!user,
        downtimeEntries,
        maintenanceItems,
        alerts,
        syncQueue,
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  },
}));
