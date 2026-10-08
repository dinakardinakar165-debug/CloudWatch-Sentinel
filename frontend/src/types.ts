export interface CostRecord {
  date: string;
  service: string;
  amount: number;
  currency?: string;
}

export interface AnomalyRecord {
  anomalyId?: string;
  date: string;
  service: string;
  amount: number;
  baseline: number;
  zScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt?: string;
}

export interface NotificationRecord {
  notificationId: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  createdAt: string;
  read?: boolean | number;
}

export interface CloudAccount {
  userId?: string;
  accountName: string;
  roleArn: string;
  externalId: string;
  createdAt?: string;
}

export interface CloudResourceCategory {
  id: string;
  name: string;
  description: string;
  resourceCount: number;
  estimatedCost: number;
  status: 'Operational' | 'Warning' | 'Spike Detected';
  icon: string;
}

export interface TeamMember {
  name: string;
  rollNo: string;
  role: string;
}

export interface HealthStatus {
  status: string;
  latencyMs?: number;
  timestamp?: string;
}
