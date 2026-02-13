# CareLink+

A doctor-to-doctor post-referral continuity platform designed for Rwanda's tiered healthcare system.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

## Overview

CareLink+ enables structured, asynchronous doctor-to-doctor consultations between referral hospital specialists, district hospital clinicians, and local health center providers. The platform addresses post-referral continuity of care challenges by creating a seamless communication channel for patient follow-up care.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Redux Toolkit, React Router v6, Tailwind CSS, Axios |
| **Backend** | Node.js 20 LTS, Express.js 4.x, JWT Authentication, Joi Validation |
| **Database** | PostgreSQL 15, Sequelize ORM, Redis (session caching) |
| **Infrastructure** | Docker, AWS EC2/RDS, GitHub Actions CI/CD, Nginx |
| **External Services** | Africa's Talking SMS, SendGrid Email, AWS S3 |

## Project Structure

```
carelink-plus/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Reusable UI primitives
│   │   │   ├── layout/        # Page structure components
│   │   │   └── consultation/  # Domain-specific components
│   │   ├── pages/             # Route components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Redux slices
│   │   └── services/          # API layer
│   └── package.json
│
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Database, Redis configuration
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── routes/            # API route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Sequelize models
│   │   └── utils/             # Logger, SMS, Email services
│   ├── tests/
│   ├── migrations/
│   └── seeders/
│
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 15
- Redis
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/carelink-plus.git
   cd carelink-plus
   ```

2. **Set up environment variables**
   ```bash
   # Server
   cp server/.env.example server/.env
   
   # Client
   cp client/.env.example client/.env
   ```

3. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

4. **Run database migrations**
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend
   cd client && npm start
   ```

### Docker Setup

```bash
docker-compose up -d
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | Public | User authentication |
| `POST` | `/api/auth/logout` | Protected | Session termination |
| `POST` | `/api/care-profiles` | Specialist | Create discharge profile |
| `GET` | `/api/care-profiles` | Protected | List care profiles |
| `POST` | `/api/consultations` | Clinician | Submit consultation request |
| `GET` | `/api/consultations` | Protected | List consultations |
| `POST` | `/api/consultations/:id/respond` | Specialist | Respond to consultation |

## Database Schema

```
┌──────────────────┐       ┌──────────────────┐
│  health_facilities│       │      users       │
├──────────────────┤       ├──────────────────┤
│ id               │◄──────│ facility_id      │
│ name             │       │ id               │
│ level            │       │ role             │
│ district         │       │ email            │
└──────────────────┘       └────────┬─────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         ┌──────────────────┐           ┌──────────────────┐
         │   care_profiles  │           │  consultations   │
         ├──────────────────┤           ├──────────────────┤
         │ id               │◄──────────│ care_profile_id  │
         │ patient_name     │           │ id               │
         │ diagnosis        │           │ status           │
         │ specialist_id    │           │ submitted_by_id  │
         └──────────────────┘           └────────┬─────────┘
                                                 │
                                                 ▼
                                    ┌──────────────────────┐
                                    │consultation_responses│
                                    ├──────────────────────┤
                                    │ id                   │
                                    │ consultation_id      │
                                    │ care_pathway         │
                                    │ recommendations      │
                                    └──────────────────────┘
```

## Key Features

- **Role-Based Access Control**: Specialists, clinicians, and administrators have tailored permissions
- **Asynchronous Consultations**: Structured request/response workflow for post-referral care
- **SMS Notifications**: Real-time alerts via Africa's Talking integration
- **Secure Authentication**: JWT tokens with Redis-backed session management
- **Audit Logging**: Complete tracking of all consultation activities

## Environment Variables

### Server

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/carelink
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
AFRICASTALKING_API_KEY=your-api-key
AFRICASTALKING_USERNAME=your-username
SENDGRID_API_KEY=your-sendgrid-key
AWS_S3_BUCKET=your-bucket-name
```

### Client

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test

# Run with coverage
npm run test:coverage
```

## Deployment

The project includes a GitHub Actions CI/CD pipeline that:

1. Runs the test suite
2. Builds the Docker image
3. Pushes to Amazon ECR
4. Deploys to Amazon ECS

```yaml
# Trigger deployment
git push origin main
```

## Future Roadmap

- [ ] OpenMRS/HMIS integration via HL7 FHIR APIs
- [ ] Offline-first PWA with background sync
- [ ] Real-time WebSocket notifications
- [ ] AI-assisted clinical triage suggestions

## License

This project is part of a software engineering capstone portfolio.

---

*Built to improve post-referral continuity of care in Rwanda's healthcare system*