import { createConsultation, respondToConsultation, getConsultations, getConsultationById, closeConsultation, getDashboardStats } from '../controllers/consultationController';
import { UserRole, ConsultationStatus } from '../types';

jest.mock('../models', () => ({
  Consultation: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    count: jest.fn(),
    findAll: jest.fn(),
  },
  Patient: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
  },
  User: {},
  Facility: {},
  Notification: {
    create: jest.fn(),
  },
}));

import { Consultation, Patient, Notification } from '../models';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('consultationController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createConsultation', () => {
    it('should return 403 if user is not a clinician', async () => {
      const req: any = { user: { role: UserRole.SPECIALIST, userId: 1, facilityId: 1 }, body: {} };
      const res = mockResponse();

      await createConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only clinicians can submit consultations' });
    });

    it('should return 400 if required fields are missing', async () => {
      const req: any = {
        user: { role: UserRole.CLINICIAN, userId: 1, facilityId: 1 },
        body: { patientId: 1 },
      };
      const res = mockResponse();

      await createConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All required fields must be provided' });
    });

    it('should return 404 if patient not found', async () => {
      const req: any = {
        user: { role: UserRole.CLINICIAN, userId: 1, facilityId: 1 },
        body: {
          patientId: 999,
          symptoms: ['fever'],
          vitalSigns: { temp: 38 },
          clinicalQuestion: 'What to do?',
          urgencyLevel: 'urgent',
        },
      };
      const res = mockResponse();

      (Patient.findByPk as jest.Mock).mockResolvedValue(null);

      await createConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Patient not found' });
    });

    it('should create consultation and notify specialist', async () => {
      const mockSpecialist = { id: 10, firstName: 'Dr', lastName: 'Smith' };
      const mockPatient = {
        id: 1,
        patientCode: 'RW-001',
        get: jest.fn().mockReturnValue(mockSpecialist),
      };
      const mockConsultation = { id: 5 };
      const mockConsultationWithDetails = { id: 5, patient: mockPatient };

      const req: any = {
        user: { role: UserRole.CLINICIAN, userId: 2, facilityId: 1 },
        body: {
          patientId: 1,
          symptoms: ['fever', 'headache'],
          symptomDescription: 'High fever',
          vitalSigns: { temp: 39 },
          clinicalQuestion: 'What treatment?',
          urgencyLevel: 'urgent',
        },
      };
      const res = mockResponse();

      (Patient.findByPk as jest.Mock).mockResolvedValue(mockPatient);
      (Consultation.create as jest.Mock).mockResolvedValue(mockConsultation);
      (Notification.create as jest.Mock).mockResolvedValue({});
      (Consultation.findByPk as jest.Mock).mockResolvedValue(mockConsultationWithDetails);

      await createConsultation(req, res);

      expect(Consultation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 1,
          clinicianId: 2,
          facilityId: 1,
          status: ConsultationStatus.PENDING,
        }),
      );
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 10,
          title: 'New Consultation Request',
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('respondToConsultation', () => {
    it('should return 403 if user is not a specialist', async () => {
      const req: any = { user: { role: UserRole.CLINICIAN, userId: 1 }, params: { id: '1' }, body: {} };
      const res = mockResponse();

      await respondToConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 400 if carePathway or recommendations are missing', async () => {
      const req: any = {
        user: { role: UserRole.SPECIALIST, userId: 1 },
        params: { id: '1' },
        body: { carePathway: 'home_care' },
      };
      const res = mockResponse();

      await respondToConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Care pathway and recommendations are required' });
    });

    it('should return 404 if consultation not found', async () => {
      const req: any = {
        user: { role: UserRole.SPECIALIST, userId: 1 },
        params: { id: '999' },
        body: { carePathway: 'home_care', recommendations: 'Rest' },
      };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock).mockResolvedValue(null);

      await respondToConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if consultation is not pending', async () => {
      const mockConsultation = {
        id: 1,
        status: ConsultationStatus.RESPONDED,
        get: jest.fn(),
      };
      const req: any = {
        user: { role: UserRole.SPECIALIST, userId: 1 },
        params: { id: '1' },
        body: { carePathway: 'home_care', recommendations: 'Rest' },
      };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock).mockResolvedValue(mockConsultation);

      await respondToConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Consultation has already been responded to' });
    });

    it('should respond to consultation successfully', async () => {
      const mockClinician = { id: 2, firstName: 'Nurse', lastName: 'Jane' };
      const mockPatientObj = { patientCode: 'RW-001' };
      const mockConsultation = {
        id: 1,
        status: ConsultationStatus.PENDING,
        clinicianId: 2,
        update: jest.fn().mockResolvedValue(true),
        get: jest.fn((key: string) => {
          if (key === 'clinician') return mockClinician;
          if (key === 'patient') return mockPatientObj;
          return null;
        }),
      };
      const updatedConsultation = { id: 1, status: ConsultationStatus.RESPONDED };

      const req: any = {
        user: { role: UserRole.SPECIALIST, userId: 5 },
        params: { id: '1' },
        body: { carePathway: 'home_care', recommendations: 'Rest and fluids' },
      };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock)
        .mockResolvedValueOnce(mockConsultation)
        .mockResolvedValueOnce(updatedConsultation);
      (Notification.create as jest.Mock).mockResolvedValue({});

      await respondToConsultation(req, res);

      expect(mockConsultation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          carePathway: 'home_care',
          recommendations: 'Rest and fluids',
          status: ConsultationStatus.RESPONDED,
        }),
      );
      expect(Notification.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Response submitted successfully' }),
      );
    });
  });

  describe('getConsultationById', () => {
    it('should return 404 if consultation not found', async () => {
      const req: any = { user: { userId: 1 }, params: { id: '999' } };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock).mockResolvedValue(null);

      await getConsultationById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Consultation not found' });
    });

    it('should return consultation when found', async () => {
      const mockConsultation = { id: 1, status: 'pending' };
      const req: any = { user: { userId: 1 }, params: { id: '1' } };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock).mockResolvedValue(mockConsultation);

      await getConsultationById(req, res);

      expect(res.json).toHaveBeenCalledWith({ consultation: mockConsultation });
    });
  });

  describe('closeConsultation', () => {
    it('should return 404 if consultation not found', async () => {
      const req: any = { user: { role: UserRole.CLINICIAN, userId: 1 }, params: { id: '999' } };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock).mockResolvedValue(null);

      await closeConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if clinician tries to close another clinicians consultation', async () => {
      const mockConsultation = { id: 1, clinicianId: 99, status: ConsultationStatus.RESPONDED };
      const req: any = { user: { role: UserRole.CLINICIAN, userId: 1 }, params: { id: '1' } };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock).mockResolvedValue(mockConsultation);

      await closeConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'You can only close your own consultations' });
    });

    it('should return 400 if consultation is not in responded status', async () => {
      const mockConsultation = { id: 1, clinicianId: 1, status: ConsultationStatus.PENDING };
      const req: any = { user: { role: UserRole.CLINICIAN, userId: 1 }, params: { id: '1' } };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock).mockResolvedValue(mockConsultation);

      await closeConsultation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only responded consultations can be closed' });
    });

    it('should close consultation successfully', async () => {
      const mockConsultation = {
        id: 1,
        clinicianId: 1,
        status: ConsultationStatus.RESPONDED,
        update: jest.fn().mockResolvedValue(true),
      };
      const req: any = { user: { role: UserRole.CLINICIAN, userId: 1 }, params: { id: '1' } };
      const res = mockResponse();

      (Consultation.findByPk as jest.Mock).mockResolvedValue(mockConsultation);

      await closeConsultation(req, res);

      expect(mockConsultation.update).toHaveBeenCalledWith({ status: ConsultationStatus.CLOSED });
      expect(res.json).toHaveBeenCalledWith({ message: 'Consultation closed successfully' });
    });
  });

  describe('getDashboardStats', () => {
    it('should return clinician stats', async () => {
      const req: any = { user: { userId: 1, role: UserRole.CLINICIAN } };
      const res = mockResponse();

      (Consultation.count as jest.Mock)
        .mockResolvedValueOnce(3)   // pending
        .mockResolvedValueOnce(5)   // responded
        .mockResolvedValueOnce(2);  // closedThisWeek

      await getDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        stats: { pending: 3, responded: 5, closedThisWeek: 2 },
      });
    });

    it('should return specialist stats', async () => {
      const req: any = { user: { userId: 1, role: UserRole.SPECIALIST } };
      const res = mockResponse();

      (Patient.findAll as jest.Mock).mockResolvedValue([{ id: 1 }, { id: 2 }]);
      (Consultation.count as jest.Mock)
        .mockResolvedValueOnce(2)   // pending
        .mockResolvedValueOnce(1);  // respondedToday
      (Patient.count as jest.Mock).mockResolvedValue(5);
      (Consultation.findAll as jest.Mock).mockResolvedValue([]);

      await getDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        stats: { pending: 2, respondedToday: 1, totalPatients: 5, avgResponseTime: 0 },
      });
    });

    it('should calculate average response time for specialist', async () => {
      const now = Date.now();
      const req: any = { user: { userId: 1, role: UserRole.SPECIALIST } };
      const res = mockResponse();

      (Patient.findAll as jest.Mock).mockResolvedValue([{ id: 1 }]);
      (Consultation.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (Patient.count as jest.Mock).mockResolvedValue(1);
      (Consultation.findAll as jest.Mock).mockResolvedValue([
        { createdAt: new Date(now - 2 * 60 * 60 * 1000), respondedAt: new Date(now) },
      ]);

      await getDashboardStats(req, res);

      const stats = res.json.mock.calls[0][0].stats;
      expect(stats.avgResponseTime).toBe(2);
    });

    it('should return empty stats for administrator', async () => {
      const req: any = { user: { userId: 1, role: UserRole.ADMINISTRATOR } };
      const res = mockResponse();

      await getDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith({ stats: {} });
    });
  });
});
