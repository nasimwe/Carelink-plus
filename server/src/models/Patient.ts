import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Facility from './Facility';

interface PatientAttributes {
  id: number;
  patientCode: string;
  diagnosisSummary: string;
  treatmentSummary: string;
  expectedSideEffects?: string;
  warningSigns: string;
  followUpInstructions: string;
  dischargeDate: Date;
  specialty: string;
  createdById: number;
  facilityId: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PatientCreationAttributes extends Optional<PatientAttributes, 'id' | 'isActive' | 'expectedSideEffects'> {}

class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: number;
  public patientCode!: string;
  public diagnosisSummary!: string;
  public treatmentSummary!: string;
  public expectedSideEffects?: string;
  public warningSigns!: string;
  public followUpInstructions!: string;
  public dischargeDate!: Date;
  public specialty!: string;
  public createdById!: number;
  public facilityId!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    diagnosisSummary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    treatmentSummary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expectedSideEffects: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    warningSigns: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    followUpInstructions: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dischargeDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    createdById: {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'patients',
    timestamps: true,
  }
);

// Associations
Patient.belongsTo(User, { foreignKey: 'createdById', as: 'specialist' });
Patient.belongsTo(Facility, { foreignKey: 'facilityId', as: 'facility' });

export default Patient;
