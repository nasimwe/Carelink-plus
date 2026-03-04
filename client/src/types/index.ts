export enum UserRole {
  SPECIALIST = 'specialist',
  CLINICIAN = 'clinician',
  ADMINISTRATOR = 'administrator',
}

export enum FacilityType {
  REFERRAL_HOSPITAL = 'referral_hospital',
  DISTRICT_HOSPITAL = 'district_hospital',
  HEALTH_CENTER = 'health_center',
}

export enum ConsultationStatus {
  PENDING = 'pending',
  RESPONDED = 'responded',
  CLOSED = 'closed',
}

export enum UrgencyLevel {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  EMERGENCY = 'emergency',
}

export enum CarePathway {
  HOME_CARE = 'home_care',
  LOCAL_CLINIC = 'local_clinic',
  DISTRICT_REFERRAL = 'district_referral',
  URGENT_TRANSFER = 'urgent_transfer',
}

export interface Facility {
  id: number;
  name: string;
  type: FacilityType;
  district: string;
  province: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  facilityId: number;
  specialty?: string;
  phone?: string;
  isActive: boolean;
  facility?: Facility;
}

export interface Patient {
  id: number;
  patientCode: string;
  diagnosisSummary: string;
  treatmentSummary: string;
  expectedSideEffects?: string;
  warningSigns: string;
  followUpInstructions: string;
  dischargeDate: string;
  specialty: string;
  createdById: number;
  facilityId: number;
  specialist?: User;
  facility?: Facility;
  consultations?: Consultation[];
}

export interface VitalSigns {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulseRate?: number;
  respiratoryRate?: number;
}

export interface Consultation {
  id: number;
  patientId: number;
  clinicianId: number;
  facilityId: number;
  symptoms: string[];
  symptomDescription?: string;
  vitalSigns: VitalSigns;
  clinicalQuestion: string;
  urgencyLevel: UrgencyLevel;
  attachments?: string[];
  status: ConsultationStatus;
  respondedById?: number;
  respondedAt?: string;
  carePathway?: CarePathway;
  recommendations?: string;
  medicationInstructions?: string;
  followUpTimeframe?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  clinician?: User;
  respondedBy?: User;
  facility?: Facility;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  pending?: number;
  responded?: number;
  closedThisWeek?: number;
  respondedToday?: number;
  totalPatients?: number;
  avgResponseTime?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
