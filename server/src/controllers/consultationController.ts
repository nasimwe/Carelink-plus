import { Response } from 'express';
import { Op } from 'sequelize';
import { Consultation, Patient, User, Facility, Notification } from '../models';
import { AuthRequest } from '../middleware/auth';
import { UserRole, ConsultationStatus, NotificationType } from '../types';

export const createConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== UserRole.CLINICIAN) {
      res.status(403).json({ message: 'Only clinicians can submit consultations' });
      return;
    }

    const {
      patientId,
      symptoms,
      symptomDescription,
      vitalSigns,
      clinicalQuestion,
      urgencyLevel,
    } = req.body;

    // Validation
    if (!patientId || !symptoms || !vitalSigns || !clinicalQuestion || !urgencyLevel) {
      res.status(400).json({ message: 'All required fields must be provided' });
      return;
    }

    // Check if patient exists
    const patient = await Patient.findByPk(patientId, {
      include: [{ model: User, as: 'specialist' }],
    });

    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }

    const consultation = await Consultation.create({
      patientId,
      clinicianId: req.user.userId,
      facilityId: req.user.facilityId,
      symptoms,
      symptomDescription,
      vitalSigns,
      clinicalQuestion,
      urgencyLevel,
      status: ConsultationStatus.PENDING,
    });

    // Create notification for the specialist
    const specialist = patient.get('specialist') as User;
    if (specialist) {
      await Notification.create({
        userId: specialist.id,
        type: NotificationType.NEW_CONSULTATION,
        title: 'New Consultation Request',
        message: `New ${urgencyLevel} consultation for patient ${patient.patientCode}`,
        data: { consultationId: consultation.id, patientCode: patient.patientCode },
      });
    }

    const consultationWithDetails = await Consultation.findByPk(consultation.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'clinician', attributes: ['id', 'firstName', 'lastName'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name'] },
      ],
    });

    res.status(201).json({
      message: 'Consultation submitted successfully',
      consultation: consultationWithDetails,
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const respondToConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== UserRole.SPECIALIST) {
      res.status(403).json({ message: 'Only specialists can respond to consultations' });
      return;
    }

    const id = parseInt(req.params.id as string, 10);
    const { carePathway, recommendations, medicationInstructions, followUpTimeframe } = req.body;

    if (!carePathway || !recommendations) {
      res.status(400).json({ message: 'Care pathway and recommendations are required' });
      return;
    }

    const consultation = await Consultation.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'clinician' },
      ],
    });

    if (!consultation) {
      res.status(404).json({ message: 'Consultation not found' });
      return;
    }

    if (consultation.status !== ConsultationStatus.PENDING) {
      res.status(400).json({ message: 'Consultation has already been responded to' });
      return;
    }

    await consultation.update({
      respondedById: req.user.userId,
      respondedAt: new Date(),
      carePathway,
      recommendations,
      medicationInstructions,
      followUpTimeframe,
      status: ConsultationStatus.RESPONDED,
    });

    // Notify the clinician
    const clinician = consultation.get('clinician') as User;
    const patient = consultation.get('patient') as Patient;

    await Notification.create({
      userId: clinician.id,
      type: NotificationType.CONSULTATION_RESPONSE,
      title: 'Consultation Response Received',
      message: `Response received for patient ${patient.patientCode}: ${carePathway.replace('_', ' ')}`,
      data: { consultationId: consultation.id, carePathway },
    });

    const updatedConsultation = await Consultation.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: User, as: 'clinician', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'respondedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name'] },
      ],
    });

    res.json({
      message: 'Response submitted successfully',
      consultation: updatedConsultation,
    });
  } catch (error) {
    console.error('Respond to consultation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getConsultations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, urgency, page = 1, limit = 10 } = req.query;
    const where: any = {};

    // Filter by role
    if (req.user?.role === UserRole.CLINICIAN) {
      where.clinicianId = req.user.userId;
    } else if (req.user?.role === UserRole.SPECIALIST) {
      // Specialists see consultations for patients they created
      const patientIds = await Patient.findAll({
        where: { createdById: req.user.userId },
        attributes: ['id'],
      });
      where.patientId = { [Op.in]: patientIds.map(p => p.id) };
    }

    if (status) {
      where.status = status;
    }

    if (urgency) {
      where.urgencyLevel = urgency;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: consultations } = await Consultation.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'patientCode', 'specialty', 'diagnosisSummary'] },
        { model: User, as: 'clinician', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'respondedBy', attributes: ['id', 'firstName', 'lastName'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name', 'district', 'province'] },
      ],
      order: [
        ['urgencyLevel', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: Number(limit),
      offset,
    });

    res.json({
      consultations,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getConsultationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [
            { model: User, as: 'specialist', attributes: ['id', 'firstName', 'lastName', 'specialty'] },
            { model: Facility, as: 'facility', attributes: ['id', 'name', 'type'] },
          ],
        },
        { model: User, as: 'clinician', attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'respondedBy', attributes: ['id', 'firstName', 'lastName', 'specialty'] },
        { model: Facility, as: 'facility', attributes: ['id', 'name', 'district'] },
      ],
    });

    if (!consultation) {
      res.status(404).json({ message: 'Consultation not found' });
      return;
    }

    res.json({ consultation });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const closeConsultation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const consultation = await Consultation.findByPk(id);

    if (!consultation) {
      res.status(404).json({ message: 'Consultation not found' });
      return;
    }

    // Only the clinician who created the consultation can close it
    if (req.user?.role === UserRole.CLINICIAN && consultation.clinicianId !== req.user.userId) {
      res.status(403).json({ message: 'You can only close your own consultations' });
      return;
    }

    if (consultation.status !== ConsultationStatus.RESPONDED) {
      res.status(400).json({ message: 'Only responded consultations can be closed' });
      return;
    }

    await consultation.update({ status: ConsultationStatus.CLOSED });

    res.json({ message: 'Consultation closed successfully' });
  } catch (error) {
    console.error('Close consultation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    let stats: any = {};

    if (role === UserRole.CLINICIAN) {
      const [pending, responded, closedThisWeek] = await Promise.all([
        Consultation.count({ where: { clinicianId: userId, status: ConsultationStatus.PENDING } }),
        Consultation.count({ where: { clinicianId: userId, status: ConsultationStatus.RESPONDED } }),
        Consultation.count({
          where: {
            clinicianId: userId,
            status: ConsultationStatus.CLOSED,
            updatedAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        }),
      ]);

      stats = { pending, responded, closedThisWeek };
    } else if (role === UserRole.SPECIALIST) {
      const patientIds = await Patient.findAll({
        where: { createdById: userId },
        attributes: ['id'],
      });
      const ids = patientIds.map(p => p.id);

      const [pending, respondedToday, totalPatients] = await Promise.all([
        Consultation.count({ where: { patientId: { [Op.in]: ids }, status: ConsultationStatus.PENDING } }),
        Consultation.count({
          where: {
            respondedById: userId,
            respondedAt: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        Patient.count({ where: { createdById: userId } }),
      ]);

      // Calculate average response time
      const respondedConsultations = await Consultation.findAll({
        where: { respondedById: userId, respondedAt: { [Op.ne]: null } },
        attributes: ['createdAt', 'respondedAt'],
        limit: 50,
        order: [['respondedAt', 'DESC']],
      });

      let avgResponseTime = 0;
      if (respondedConsultations.length > 0) {
        const totalTime = respondedConsultations.reduce((acc, c) => {
          const created = new Date(c.createdAt).getTime();
          const responded = new Date(c.respondedAt!).getTime();
          return acc + (responded - created);
        }, 0);
        avgResponseTime = Math.round(totalTime / respondedConsultations.length / (1000 * 60 * 60) * 10) / 10; // hours
      }

      stats = { pending, respondedToday, totalPatients, avgResponseTime };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
