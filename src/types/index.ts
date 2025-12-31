export type UserRole = 'Operator' | 'Supervisor';

export interface User {
  email: string;
  role: UserRole;
  token: string;
  tenantId: string;
}

export type MachineStatus = 'RUN' | 'IDLE' | 'OFF';

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: MachineStatus;
  tenantId: string;
}

export interface DowntimeReason {
  code: string;
  label: string;
  children?: DowntimeReason[];
}

export interface DowntimeEntry {
  id: string;
  machineId: string;
  startTime: number;
  endTime?: number;
  reasonCode: string;
  reasonLabel: string;
  subReasonCode?: string;
  subReasonLabel?: string;
  photo?: string;
  tenantId: string;
  synced: boolean;
  createdAt: number;
}

export type MaintenanceStatus = 'Due' | 'Overdue' | 'Done';

export interface MaintenanceItem {
  id: string;
  machineId: string;
  title: string;
  status: MaintenanceStatus;
  note?: string;
  completedAt?: number;
  tenantId: string;
  synced: boolean;
  createdAt: number;
}

export type AlertStatus = 'Created' | 'Acknowledged' | 'Cleared';

export interface Alert {
  id: string;
  machineId: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High';
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  clearedAt?: number;
  tenantId: string;
  createdAt: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'downtime' | 'maintenance' | 'alert';
  data: any;
  timestamp: number;
}
