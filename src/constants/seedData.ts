import { Machine, DowntimeReason, MaintenanceItem, Alert } from '../types';

export const MACHINES: Machine[] = [
  { id: 'M-101', name: 'Cutter 1', type: 'cutter', status: 'RUN', tenantId: 'tenant-001' },
  { id: 'M-102', name: 'Roller A', type: 'roller', status: 'IDLE', tenantId: 'tenant-001' },
  { id: 'M-103', name: 'Packing West', type: 'packer', status: 'OFF', tenantId: 'tenant-001' },
];

export const DOWNTIME_REASONS: DowntimeReason[] = [
  {
    code: 'POWER',
    label: 'Power',
    children: [
      { code: 'GRID', label: 'Grid' },
      { code: 'INTERNAL', label: 'Internal' },
    ],
  },
  {
    code: 'CHANGEOVER',
    label: 'Changeover',
    children: [{ code: 'TOOLING', label: 'Tooling' }],
  },
];

export const INITIAL_MAINTENANCE_ITEMS: MaintenanceItem[] = [
  {
    id: 'maint-1',
    machineId: 'M-101',
    title: 'Blade Inspection',
    status: 'Due',
    tenantId: 'tenant-001',
    synced: true,
    createdAt: Date.now(),
  },
  {
    id: 'maint-2',
    machineId: 'M-101',
    title: 'Lubrication Check',
    status: 'Overdue',
    tenantId: 'tenant-001',
    synced: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'maint-3',
    machineId: 'M-102',
    title: 'Belt Tension',
    status: 'Due',
    tenantId: 'tenant-001',
    synced: true,
    createdAt: Date.now(),
  },
  {
    id: 'maint-4',
    machineId: 'M-102',
    title: 'Bearing Check',
    status: 'Done',
    tenantId: 'tenant-001',
    synced: true,
    createdAt: Date.now(),
    completedAt: Date.now() - 3600000,
  },
  {
    id: 'maint-5',
    machineId: 'M-103',
    title: 'Conveyor Alignment',
    status: 'Overdue',
    tenantId: 'tenant-001',
    synced: true,
    createdAt: Date.now() - 172800000,
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    machineId: 'M-101',
    message: 'Temperature threshold exceeded',
    severity: 'High',
    status: 'Created',
    tenantId: 'tenant-001',
    createdAt: Date.now() - 300000,
  },
  {
    id: 'alert-2',
    machineId: 'M-102',
    message: 'Vibration detected',
    severity: 'Medium',
    status: 'Created',
    tenantId: 'tenant-001',
    createdAt: Date.now() - 600000,
  },
];
