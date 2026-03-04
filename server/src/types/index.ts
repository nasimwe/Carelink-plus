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

export enum NotificationType {
  NEW_CONSULTATION = 'new_consultation',
  CONSULTATION_RESPONSE = 'consultation_response',
  PATIENT_ASSIGNED = 'patient_assigned',
  SYSTEM_ALERT = 'system_alert',
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  facilityId: number;
}
