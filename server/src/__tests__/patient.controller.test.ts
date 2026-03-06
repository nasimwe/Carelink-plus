import { createDischargeProfile, searchPatients, getPatientByCode, getPatientById, getMyPatients } from '../controllers/patientController';
import { UserRole } from '../types';

jest.mock('../models', () => ({
  Patient: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
  },
  User: {},
  Facility: {},
  Consultation: {},
}));

jest.mock('../services/smsService', () => ({
  sendPatientCodeSMS: jest.fn(),
}));

import { Patient } from '../models';
import { sendPatientCodeSMS } from '../services/smsService';

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('patientController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createDischargeProfile', () => {
    it('should return 403 if user is not a specialist', async () => {
      const req: any = { user: { role: UserRole.CLINICIAN, userId: 1, facilityId: 1 }, body: {} };
      const res = mockResponse();

      await createDischargeProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Only specialists can create discharge profiles' });
    });

    it('should return 400 if required fields are missing', async () => {
      const req: any = {
        user: { role: UserRole.SPECIALIST, userId: 1, facilityId: 1 },
        body: { diagnosisSummary: 'test' },
      };
      const res = mockResponse();

      await createDischargeProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All required fields must be provided' });
    });

    it('should create discharge profile successfully without SMS', async () => {
      const mockPatient = { id: 1, patientCode: 'RW-TEST-1234' };
      const mockPatientWithDetails = { ...mockPatient, facility: { name: 'Test Hospital' } };
      const req: any = {
        user: { role: UserRole.SPECIALIST, userId: 1, facilityId: 1 },
        body: {
          diagnosisSummary: 'Malaria',
          treatmentSummary: 'Antimalarials',
          expectedSideEffects: 'Nausea',
          warningSigns: 'Fever > 39C',
          followUpInstructions: 'Return in 2 weeks',
          dischargeDate: '2025-01-15',
          specialty: 'Internal Medicine',
        },
      };
      const res = mockResponse();

      (Patient.create as jest.Mock).mockResolvedValue(mockPatient);
      (Patient.findByPk as jest.Mock).mockResolvedValue(mockPatientWithDetails);

      await createDischargeProfile(req, res);

      expect(Patient.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Discharge profile created successfully',
        patient: mockPatientWithDetails,
        smsSent: false,
      });
    });

    it('should create discharge profile and send SMS when phone is provided', async () => {
      const mockPatient = { id: 1, patientCode: 'RW-TEST-1234' };
      const mockPatientWithDetails = { ...mockPatient, facility: { name: 'Test Hospital' } };
      const req: any = {
        user: { role: UserRole.SPECIALIST, userId: 1, facilityId: 1 },
        body: {
          diagnosisSummary: 'Malaria',
          treatmentSummary: 'Antimalarials',
          expectedSideEffects: 'Nausea',
          warningSigns: 'Fever > 39C',
          followUpInstructions: 'Return in 2 weeks',
          dischargeDate: '2025-01-15',
          specialty: 'Internal Medicine',
          patientPhone: '0781234567',
        },
      };
      const res = mockResponse();

      (Patient.create as jest.Mock).mockResolvedValue(mockPatient);
      (Patient.findByPk as jest.Mock).mockResolvedValue(mockPatientWithDetails);
      (sendPatientCodeSMS as jest.Mock).mockResolvedValue(undefined);

      await createDischargeProfile(req, res);

      expect(sendPatientCodeSMS).toHaveBeenCalledWith('0781234567', 'RW-TEST-1234', 'Test Hospital');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ smsSent: true }),
      );
    });

    it('should still succeed if SMS fails', async () => {
      const mockPatient = { id: 1, patientCode: 'RW-TEST-1234' };
      const mockPatientWithDetails = { ...mockPatient, facility: { name: 'Test Hospital' } };
      const req: any = {
        user: { role: UserRole.SPECIALIST, userId: 1, facilityId: 1 },
        body: {
          diagnosisSummary: 'Malaria',
          treatmentSummary: 'Antimalarials',
          expectedSideEffects: 'Nausea',
          warningSigns: 'Fever > 39C',
          followUpInstructions: 'Return in 2 weeks',
          dischargeDate: '2025-01-15',
          specialty: 'Internal Medicine',
          patientPhone: '0781234567',
        },
      };
      const res = mockResponse();

      (Patient.create as jest.Mock).mockResolvedValue(mockPatient);
      (Patient.findByPk as jest.Mock).mockResolvedValue(mockPatientWithDetails);
      (sendPatientCodeSMS as jest.Mock).mockRejectedValue(new Error('SMS failed'));

      await createDischargeProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ smsSent: false }),
      );
    });
  });

  describe('searchPatients', () => {
    it('should return patients with pagination', async () => {
      const mockPatients = [{ id: 1, patientCode: 'RW-001' }];
      const req: any = { user: { userId: 1 }, query: { page: 1, limit: 10 } };
      const res = mockResponse();

      (Patient.findAndCountAll as jest.Mock).mockResolvedValue({ count: 1, rows: mockPatients });

      await searchPatients(req, res);

      expect(res.json).toHaveBeenCalledWith({
        patients: mockPatients,
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('should filter by patient code when provided', async () => {
      const req: any = { user: { userId: 1 }, query: { code: 'RW-001', page: 1, limit: 10 } };
      const res = mockResponse();

      (Patient.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

      await searchPatients(req, res);

      expect(Patient.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            patientCode: expect.any(Object),
          }),
        }),
      );
    });

    it('should use default pagination values', async () => {
      const req: any = { user: { userId: 1 }, query: {} };
      const res = mockResponse();

      (Patient.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });

      await searchPatients(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({ page: 1, limit: 10 }),
        }),
      );
    });
  });

  describe('getPatientByCode', () => {
    it('should return 404 if patient not found', async () => {
      const req: any = { user: { userId: 1 }, params: { code: 'RW-NOTFOUND' } };
      const res = mockResponse();

      (Patient.findOne as jest.Mock).mockResolvedValue(null);

      await getPatientByCode(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Patient not found' });
    });

    it('should return patient when found', async () => {
      const mockPatient = { id: 1, patientCode: 'RW-001' };
      const req: any = { user: { userId: 1 }, params: { code: 'RW-001' } };
      const res = mockResponse();

      (Patient.findOne as jest.Mock).mockResolvedValue(mockPatient);

      await getPatientByCode(req, res);

      expect(res.json).toHaveBeenCalledWith({ patient: mockPatient });
    });
  });

  describe('getPatientById', () => {
    it('should return 404 if patient not found', async () => {
      const req: any = { user: { userId: 1 }, params: { id: '999' } };
      const res = mockResponse();

      (Patient.findByPk as jest.Mock).mockResolvedValue(null);

      await getPatientById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Patient not found' });
    });

    it('should return 404 if patient is inactive', async () => {
      const req: any = { user: { userId: 1 }, params: { id: '1' } };
      const res = mockResponse();

      (Patient.findByPk as jest.Mock).mockResolvedValue({ id: 1, isActive: false });

      await getPatientById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return patient when found and active', async () => {
      const mockPatient = { id: 1, isActive: true };
      const req: any = { user: { userId: 1 }, params: { id: '1' } };
      const res = mockResponse();

      (Patient.findByPk as jest.Mock).mockResolvedValue(mockPatient);

      await getPatientById(req, res);

      expect(res.json).toHaveBeenCalledWith({ patient: mockPatient });
    });
  });

  describe('getMyPatients', () => {
    it('should return patients belonging to the specialist', async () => {
      const mockPatients = [{ id: 1, patientCode: 'RW-001' }];
      const req: any = { user: { userId: 5 }, query: { page: 1, limit: 10 } };
      const res = mockResponse();

      (Patient.findAndCountAll as jest.Mock).mockResolvedValue({ count: 1, rows: mockPatients });

      await getMyPatients(req, res);

      expect(Patient.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { createdById: 5, isActive: true },
        }),
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ patients: mockPatients }),
      );
    });
  });
});
