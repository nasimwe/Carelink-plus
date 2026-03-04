import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { FacilityType } from '../types';

interface FacilityAttributes {
  id: number;
  name: string;
  type: FacilityType;
  district: string;
  province: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FacilityCreationAttributes extends Optional<FacilityAttributes, 'id' | 'isActive'> {}

class Facility extends Model<FacilityAttributes, FacilityCreationAttributes> implements FacilityAttributes {
  public id!: number;
  public name!: string;
  public type!: FacilityType;
  public district!: string;
  public province!: string;
  public address!: string;
  public phone!: string;
  public email!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Facility.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(FacilityType)),
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'facilities',
    timestamps: true,
  }
);

export default Facility;
