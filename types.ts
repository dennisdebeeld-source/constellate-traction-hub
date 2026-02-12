export type LeadType = 'LOI' | 'Paid Pilot' | null;

export interface Lead {
  id: string;
  name: string;
  type: LeadType;
  description: string;
  stage: number; // 1-6
  statusNote: string;
  isHighIntensity: boolean;
}

export interface StageInfo {
  id: number;
  label: string;
}

export interface Metric {
  label: string;
  value: string | number;
  subValue?: string;
}