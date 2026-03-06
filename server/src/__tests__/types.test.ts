import {
  UserRole,
  FacilityType,
  ConsultationStatus,
  UrgencyLevel,
  CarePathway,
  NotificationType,
} from '../types';

describe('Enums', () => {
  describe('UserRole', () => {
    it('should have correct values', () => {
      expect(UserRole.SPECIALIST).toBe('specialist');
      expect(UserRole.CLINICIAN).toBe('clinician');
      expect(UserRole.ADMINISTRATOR).toBe('administrator');
    });

    it('should have exactly 3 roles', () => {
      const values = Object.values(UserRole);
      expect(values).toHaveLength(3);
    });
  });

  describe('FacilityType', () => {
    it('should have correct values', () => {
      expect(FacilityType.REFERRAL_HOSPITAL).toBe('referral_hospital');
      expect(FacilityType.DISTRICT_HOSPITAL).toBe('district_hospital');
      expect(FacilityType.HEALTH_CENTER).toBe('health_center');
    });

    it('should have exactly 3 types', () => {
      const values = Object.values(FacilityType);
      expect(values).toHaveLength(3);
    });
  });

  describe('ConsultationStatus', () => {
    it('should have correct values', () => {
      expect(ConsultationStatus.PENDING).toBe('pending');
      expect(ConsultationStatus.RESPONDED).toBe('responded');
      expect(ConsultationStatus.CLOSED).toBe('closed');
    });

    it('should have exactly 3 statuses', () => {
      const values = Object.values(ConsultationStatus);
      expect(values).toHaveLength(3);
    });
  });

  describe('UrgencyLevel', () => {
    it('should have correct values', () => {
      expect(UrgencyLevel.ROUTINE).toBe('routine');
      expect(UrgencyLevel.URGENT).toBe('urgent');
      expect(UrgencyLevel.EMERGENCY).toBe('emergency');
    });
  });

  describe('CarePathway', () => {
    it('should have correct values', () => {
      expect(CarePathway.HOME_CARE).toBe('home_care');
      expect(CarePathway.LOCAL_CLINIC).toBe('local_clinic');
      expect(CarePathway.DISTRICT_REFERRAL).toBe('district_referral');
      expect(CarePathway.URGENT_TRANSFER).toBe('urgent_transfer');
    });

    it('should have exactly 4 pathways', () => {
      const values = Object.values(CarePathway);
      expect(values).toHaveLength(4);
    });
  });

  describe('NotificationType', () => {
    it('should have correct values', () => {
      expect(NotificationType.NEW_CONSULTATION).toBe('new_consultation');
      expect(NotificationType.CONSULTATION_RESPONSE).toBe('consultation_response');
      expect(NotificationType.PATIENT_ASSIGNED).toBe('patient_assigned');
      expect(NotificationType.SYSTEM_ALERT).toBe('system_alert');
    });

    it('should have exactly 4 notification types', () => {
      const values = Object.values(NotificationType);
      expect(values).toHaveLength(4);
    });
  });
});
