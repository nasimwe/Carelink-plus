import { Response } from 'express';
import { Op } from 'sequelize';
import { Patient, User, Facility, Consultation } from '../models';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';
import { sendPatientCodeSMS } from '../services/smsService';

// Generate unique patient code
const generatePatientCode = (): string => {
  const prefix = 'RW';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const createDischargeProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== UserRole.SPECIALIST) {
      res.status(403).json({ message: 'Only specialists can create discharge profiles' });
      return;
    }

    const {
      diagnosisSummary,
      treatmentSummary,
      expectedSideEffects,
      warningSigns,
      followUpInstructions,
      dischargeDate,
      specialty,
      patientPhone,
    } = req.body;

    // Validation
    if (!diagnosisSummary || !treatmentSummary || !warningSigns || !followUpInstructions || !dischargeDate || !specialty) {
      res.status(400).json({ message: 'All required fields must be provided' });
      return;
    }

    const patient = await Patient.create({
      patientCode: generatePatientCode(),
      diagnosisSummary,
      treatmentSummary,
      expectedSideEffects,
      warningSigns,
      followUpInstructions,
      dischargeDate: new Date(dischargeDate),
      specialty,
      createdById: req.user.userId,
      facilityId: req.user.facilityId,
    });

    const patientWithDetails = await Patient.findByPk(patient.id, {
      include: [
        { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'specialty'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name', 'type'] },
      ],
    });

    let smsSent = false;
    if (patientPhone) {
      try {
        const facilityName = (patientWithDetails as any)?.facility?.name;
        await sendPatientCodeSMS(patientPhone, patient.patientCode, facilityName);
        smsSent = true;
      } catch (smsError) {
        // SMS failure should not block the response
        console.error('SMS sending failed:', smsError);
      }
    }

    res.status(201).json({
      message: 'Discharge profile created successfully',
      patient: patientWithDetails,
      smsSent,
    });
  } catch (error) {
    console.error('Create discharge profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const searchPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, page = 1, limit = 10 } = req.query;

    const where: any = { isActive: true };

    if (code) {
      where.patientCode = { [Op.iLike]: `%${code}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: patients } = await Patient.findAndCountAll({
      where,
      include: [
        { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'specialty'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name', 'type', 'district'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      patients,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPatientByCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const code = req.params.code as string;

    const patient = await Patient.findOne({
      where: { patientCode: code, isActive: true },
      include: [
        { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'specialty'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name', 'type', 'district'] },
        {
          model: Consultation,
          as: 'consultations',
          include: [
            { model: User, as: 'clinician', attributes: ['id', 'firstName', 'lastName'] },
            { model: User, as: 'respondedBy', attributes: ['id', 'firstName', 'lastName'] },
            { model: Facility, as: 'facility', attributes: ['id', 'name'] },
          ],
        },
      ],
    });

    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const patient = await Patient.findByPk(id, {
      include: [
        { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'specialty'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name', 'type', 'district'] },
      ],
    });

    if (!patient || !patient.isActive) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: patients } = await Patient.findAndCountAll({
      where: {
        createdById: req.user?.userId,
        isActive: true,
      },
      include: [
        { model: Facility, as: 'facility', attributes: ['id', 'name', 'type'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      patients,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get my patients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
