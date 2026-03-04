import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Support both connection string (Supabase) and individual params
const databaseUrl = process.env.DATABASE_URL;

let sequelize: Sequelize;

if (databaseUrl) {
  // Use connection string (Supabase, Railway, Render, etc.)
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Use individual params (local development)
  sequelize = new Sequelize(
    process.env.DB_NAME || 'carelink',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

export default sequelize;
