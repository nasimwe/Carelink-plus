import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ConsultationStatus, UrgencyLevel, CarePathway } from '../types';
import User from './User';
import Patient from './Patient';
import Facility from './Facility';

interface VitalSigns {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulseRate?: number;
  respiratoryRate?: number;
}

interface ConsultationAttributes {
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
  // Response fields
  respondedById?: number;
  respondedAt?: Date;
  carePathway?: CarePathway;
  recommendations?: string;
  medicationInstructions?: string;
  followUpTimeframe?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConsultationCreationAttributes extends Optional<ConsultationAttributes, 'id' | 'status' | 'attachments' | 'symptomDescription' | 'respondedById' | 'respondedAt' | 'carePathway' | 'recommendations' | 'medicationInstructions' | 'followUpTimeframe'> {}

class Consultation extends Model<ConsultationAttributes, ConsultationCreationAttributes> implements ConsultationAttributes {
  public id!: number;
  public patientId!: number;
  public clinicianId!: number;
  public facilityId!: number;
  public symptoms!: string[];
  public symptomDescription?: string;
  public vitalSigns!: VitalSigns;
  public clinicalQuestion!: string;
  public urgencyLevel!: UrgencyLevel;
  public attachments?: string[];
  public status!: ConsultationStatus;
  public respondedById?: number;
  public respondedAt?: Date;
  public carePathway?: CarePathway;
  public recommendations?: string;
  public medicationInstructions?: string;
  public followUpTimeframe?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Consultation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id',
      },
    },
    clinicianId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    facilityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'facilities',
        key: 'id',
      },
    },
    symptoms: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    symptomDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    vitalSigns: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    clinicalQuestion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    urgencyLevel: {
      type: DataTypes.ENUM(...Object.values(UrgencyLevel)),
      allowNull: false,
      defaultValue: UrgencyLevel.ROUTINE,
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ConsultationStatus)),
      allowNull: false,
      defaultValue: ConsultationStatus.PENDING,
    },
    respondedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    carePathway: {
      type: DataTypes.ENUM(...Object.values(CarePathway)),
      allowNull: true,
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    medicationInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    followUpTimeframe: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'consultations',
    timestamps: true,
  }
);

// Associations
Consultation.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Consultation.belongsTo(User, { foreignKey: 'clinicianId', as: 'clinician' });
Consultation.belongsTo(User, { foreignKey: 'respondedById', as: 'respondedBy' });
Consultation.belongsTo(Facility, { foreignKey: 'facilityId', as: 'facility' });

Patient.hasMany(Consultation, { foreignKey: 'patientId', as: 'consultations' });

export default Consultation;
