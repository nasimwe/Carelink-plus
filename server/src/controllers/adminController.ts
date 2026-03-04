import { Response } from 'express';
import { Op } from 'sequelize';
import { User, Facility, Consultation, Patient } from '../models';
import { AuthRequest } from '../middleware/auth';
import { ConsultationStatus } from '../types';

// User Management
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, facilityId, search, page = 1, limit = 10 } = req.query;
    const where: any = {};

    if (role) where.role = role;
    if (facilityId) where.facilityId = facilityId;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Facility, as: 'facility', attributes: ['id', 'name', 'type'] }],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, facilityId, specialty, phone } = req.body;

    if (!email || !password || !firstName || !lastName || !role || !facilityId) {
      res.status(400).json({ message: 'All required fields must be provided' });
      return;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
      facilityId,
      specialty,
      phone,
    });

    const userWithFacility = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Facility, as: 'facility' }],
    });

    res.status(201).json({ message: 'User created successfully', user: userWithFacility });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { firstName, lastName, role, facilityId, specialty, phone, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await user.update({
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      role: role ?? user.role,
      facilityId: facilityId ?? user.facilityId,
      specialty: specialty ?? user.specialty,
      phone: phone ?? user.phone,
      isActive: isActive ?? user.isActive,
    });

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Facility, as: 'facility' }],
    });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await user.update({ isActive: !user.isActive });

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Facility Management
export const getFacilities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, district, search, page = 1, limit = 10 } = req.query;
    const where: any = {};

    if (type) where.type = type;
    if (district) where.district = district;
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows: facilities } = await Facility.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: Number(limit),
      offset,
    });

    res.json({
      facilities,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createFacility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, district, province, address, phone, email } = req.body;

    if (!name || !type || !district || !province) {
      res.status(400).json({ message: 'Name, type, district, and province are required' });
      return;
    }

    const facility = await Facility.create({
      name,
      type,
      district,
      province,
      address,
      phone,
      email,
    });

    res.status(201).json({ message: 'Facility created successfully', facility });
  } catch (error) {
    console.error('Create facility error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateFacility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { name, type, district, province, address, phone, email, isActive } = req.body;

    const facility = await Facility.findByPk(id);
    if (!facility) {
      res.status(404).json({ message: 'Facility not found' });
      return;
    }

    await facility.update({
      name: name ?? facility.name,
      type: type ?? facility.type,
      district: district ?? facility.district,
      province: province ?? facility.province,
      address: address ?? facility.address,
      phone: phone ?? facility.phone,
      email: email ?? facility.email,
      isActive: isActive ?? facility.isActive,
    });

    res.json({ message: 'Facility updated successfully', facility });
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Analytics
export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate as string);
    if (endDate) dateFilter[Op.lte] = new Date(endDate as string);

    const whereDate = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Overall stats
    const [
      totalUsers,
      totalFacilities,
      totalPatients,
      totalConsultations,
      pendingConsultations,
      respondedConsultations,
    ] = await Promise.all([
      User.count({ where: { isActive: true } }),
      Facility.count({ where: { isActive: true } }),
      Patient.count({ where: { isActive: true, ...whereDate } }),
      Consultation.count({ where: whereDate }),
      Consultation.count({ where: { status: ConsultationStatus.PENDING, ...whereDate } }),
      Consultation.count({ where: { status: ConsultationStatus.RESPONDED, ...whereDate } }),
    ]);

    // Users by role
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count'],
      ],
      where: { isActive: true },
      group: ['role'],
    });

    // Active users by province (via their facility)
    const usersByProvinceRaw = await User.findAll({
      attributes: [
        [User.sequelize!.fn('COUNT', User.sequelize!.col('User.id')), 'count'],
      ],
      include: [{
        model: Facility,
        as: 'facility',
        attributes: ['province'],
        required: true,
      }],
      where: { isActive: true },
      group: ['facility.province', 'facility.id'],
    });

    const usersByProvince: Record<string, number> = {};
    usersByProvinceRaw.forEach((row: any) => {
      const province = row.facility?.province;
      if (province) {
        usersByProvince[province] = (usersByProvince[province] || 0) + parseInt(row.get('count') as string, 10);
      }
    });

    // Consultations by urgency
    const consultationsByUrgency = await Consultation.findAll({
      attributes: [
        'urgencyLevel',
        [Consultation.sequelize!.fn('COUNT', Consultation.sequelize!.col('id')), 'count'],
      ],
      where: whereDate,
      group: ['urgencyLevel'],
    });

    // Consultations by care pathway
    const consultationsByCarePathway = await Consultation.findAll({
      attributes: [
        'carePathway',
        [Consultation.sequelize!.fn('COUNT', Consultation.sequelize!.col('id')), 'count'],
      ],
      where: { carePathway: { [Op.not]: null }, ...whereDate },
      group: ['carePathway'],
    });

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Consultation.findAll({
      attributes: [
        [Consultation.sequelize!.fn('DATE_TRUNC', 'month', Consultation.sequelize!.col('createdAt')), 'month'],
        [Consultation.sequelize!.fn('COUNT', Consultation.sequelize!.col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      group: [Consultation.sequelize!.fn('DATE_TRUNC', 'month', Consultation.sequelize!.col('createdAt'))],
      order: [[Consultation.sequelize!.fn('DATE_TRUNC', 'month', Consultation.sequelize!.col('createdAt')), 'ASC']],
    });

    res.json({
      overview: {
        totalUsers,
        totalFacilities,
        totalPatients,
        totalConsultations,
        pendingConsultations,
        respondedConsultations,
      },
      usersByRole,
      usersByProvince,
      consultationsByUrgency,
      consultationsByCarePathway,
      monthlyTrend,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
