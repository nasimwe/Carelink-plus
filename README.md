# CareLink+

**Post-Referral Healthcare Continuity Platform for Rwanda**

CareLink+ is a comprehensive healthcare referral management system designed to facilitate seamless communication between Clinical Officers and Doctors across different healthcare facilities in Rwanda. The platform enables patient discharge profile creation, consultation requests, and Doctor responses, ensuring continuity of care for patients after hospital discharge.

---

## Important Links 

[Live Demo](https://youtu.be/yaByhICucIo)

[Deployed Application](https://carelinkplus.netlify.app/login)

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [Application Workflow](#application-workflow)
- [Testing Results Analysis](#testing-results-analysis)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Features

- **Patient Discharge Profiles**: Doctors create comprehensive discharge profiles with diagnosis, treatment, and follow-up instructions
- **Unique Patient Codes**: Auto-generated patient codes (format: `RW-XXXXX-XXXX`) for easy patient lookup across facilities
- **Consultation Requests**: Clinical Officers can request Doctor consultations for discharged patients
- **Care Pathway Recommendations**: Doctors provide structured care pathway guidance (Home Care, Local Clinic, District Referral, Urgent Transfer)
- **Real-time Notifications**: In-app notifications for consultation requests and responses
- **SMS Integration**: Patient codes sent via SMS using Twilio
- **Role-Based Access Control**: Three distinct user roles with specific permissions

### Dashboard Features

- **Clinical Officer Dashboard**: View pending consultations, recent responses, and patient search
- **Doctor Dashboard**: Manage consultations, create discharge profiles, track response metrics
- **Admin Dashboard**: User management, facility management, system analytics
- **Executive Dashboard**: High-level overview with Rwanda map visualization and key metrics

### Additional Features

- **Responsive Design**: Fully responsive UI optimized for desktop, tablet, and mobile devices
- **Healthcare Coverage Map**: Interactive Rwanda map showing facility distribution by province
- **Analytics & Reports**: System-wide analytics for administrators
- **Multi-facility Support**: Support for Referral Hospitals, District Hospitals, and Health Centers

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Library |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.3.1 | Build Tool & Dev Server |
| React Router DOM | 7.13.0 | Client-side Routing |
| TanStack React Query | 5.90.21 | Server State Management |
| Axios | 1.13.5 | HTTP Client |
| TailwindCSS | 4.1.18 | Styling |
| Lucide React | 0.564.0 | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.2.1 | Web Framework |
| TypeScript | 5.9.3 | Type Safety |
| Sequelize | 6.37.7 | ORM |
| PostgreSQL | - | Database |
| JSON Web Tokens | 9.0.3 | Authentication |
| bcryptjs | 3.0.3 | Password Hashing |
| Twilio | 5.12.2 | SMS Service |

---

## Project Structure

```
CareLink+/
├── client/                      # React Frontend
│   ├── src/
│   │   ├── assets/              # Static assets (images, fonts)
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Layout/          # Layout components (Header, Layout)
│   │   │   ├── ui/              # UI components (RwandaMap, AnimatedStat)
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/            # React Contexts
│   │   │   └── AuthContext.tsx  # Authentication state management
│   │   ├── hooks/               # Custom React hooks
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Administrator pages
│   │   │   ├── Clinical Officer/       # Clinical Officerpages
│   │   │   ├── Doctor/      # Doctor pages
│   │   │   ├── Login.tsx
│   │   │   └── Notifications.tsx
│   │   ├── services/            # API client services
│   │   │   └── api.ts
│   │   ├── types/               # TypeScript interfaces & enums
│   │   ├── App.tsx              # Main application with routing
│   │   ├── main.tsx             # Application entry point
│   │   └── index.css            # Global styles
│   ├── public/                  # Public static files
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── netlify.toml             # Netlify deployment config
│
├── server/                      # Node.js Backend
│   ├── src/
│   │   ├── config/              # Configuration files
│   │   │   └── database.ts      # Sequelize database config
│   │   ├── controllers/         # Route handlers
│   │   │   ├── authController.ts
│   │   │   ├── patientController.ts
│   │   │   ├── consultationController.ts
│   │   │   ├── notificationController.ts
│   │   │   └── adminController.ts
│   │   ├── middleware/          # Express middleware
│   │   │   └── auth.ts          # JWT authentication & authorization
│   │   ├── models/              # Sequelize models
│   │   │   ├── User.ts
│   │   │   ├── Patient.ts
│   │   │   ├── Consultation.ts
│   │   │   ├── Facility.ts
│   │   │   ├── Notification.ts
│   │   │   └── index.ts
│   │   ├── routes/              # API route definitions
│   │   │   ├── auth.ts
│   │   │   ├── patients.ts
│   │   │   ├── consultations.ts
│   │   │   ├── notifications.ts
│   │   │   ├── admin.ts
│   │   │   └── index.ts
│   │   ├── services/            # Business logic services
│   │   │   └── smsService.ts    # Twilio SMS integration
│   │   ├── types/               # TypeScript types
│   │   ├── index.ts             # Server entry point
│   │   └── seed.ts              # Database seeding script
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md                    # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **PostgreSQL** >= 14.0 (or Supabase account)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/carelink-plus.git
   cd carelink-plus
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Environment Configuration

#### Server Environment (`.env`)

Create a `.env` file in the `/server` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://username:password@host:5432/database_name

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Twilio SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### Client Environment (`.env`)

Create a `.env` file in the `/client` directory:

```env
VITE_API_URL=http://localhost:5001/api
```

### Database Setup

1. **Create PostgreSQL Database**
   ```sql
   CREATE DATABASE carelink_plus;
   ```

2. **Run Database Migrations**

   The application uses Sequelize with `sync({ alter: true })` which automatically creates/updates tables based on models.

3. **Seed Initial Data** (Optional)
   ```bash
   cd server
   npm run seed
   ```

   This creates:
   - Sample facilities (hospitals, health centers)
   - Demo users for each role
   - Sample patients and consultations

### Running the Application

#### Development Mode

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5001`

**Terminal 2 - Start Frontend Development Server:**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

#### Production Build

**Build Backend:**
```bash
cd server
npm run build
npm start
```

**Build Frontend:**
```bash
cd client
npm run build
npm run preview  # Preview production build
```

---

## User Roles

### Doctor
Healthcare Doctors at referral or district hospitals who:
- Create discharge profiles for patients
- Respond to consultation requests from Clinical Officers
- Provide care pathway recommendations
- Track their patient outcomes

### Clinical Officer
Healthcare workers at health centers or local clinics who:
- Search for patients using unique patient codes
- View patient discharge profiles
- Create consultation requests for Doctor guidance
- Implement care recommendations
- Close consultations after completing care

### Administrator
System administrators who:
- Manage user accounts (create, update, activate/deactivate)
- Manage healthcare facilities
- View system-wide analytics and reports
- Monitor platform usage and performance

---

## Application Workflow

### Patient Referral Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Doctor    │     │    PATIENT      │     │   Clinical Officer    │
│  (Hospital)     │     │                 │     │  (Health Center)│
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ 1. Create Discharge   │                       │
         │    Profile            │                       │
         ├───────────────────────┤                       │
         │                       │                       │
         │ 2. Patient Code       │                       │
         │    Generated          │                       │
         │    (SMS sent)         │                       │
         │                       ├──────────────────────►│
         │                       │ 3. Patient visits     │
         │                       │    local clinic       │
         │                       │                       │
         │                       │                       │ 4. Clinical Officersearches
         │                       │                       │    patient by code
         │                       │                       │
         │                       │                       │ 5. Views discharge
         │                       │                       │    profile
         │                       │                       │
         │◄──────────────────────┼───────────────────────┤
         │ 6. Consultation       │                       │
         │    Request received   │                       │
         │                       │                       │
         │ 7. Doctor         │                       │
         │    responds with      │                       │
         │    care pathway       │                       │
         ├───────────────────────┼──────────────────────►│
         │                       │                       │
         │                       │                       │ 8. Clinical Officerimplements
         │                       │                       │    recommendations
         │                       │                       │
         │                       │                       │ 9. Closes consultation
         │                       │                       │
└─────────────────────────────────────────────────────────┘
```

### Care Pathways

| Pathway | Description | Urgency |
|---------|-------------|---------|
| **Home Care** | Patient can be managed at home with medications/instructions | Low |
| **Local Clinic** | Continue treatment at local health center | Medium |
| **District Referral** | Refer to district hospital for further care | High |
| **Urgent Transfer** | Immediate transfer to referral hospital required | Critical |

---
## Testing Results

In this Folder You can Find the Testing Results Screenshots[Screenshots](screenshots/)

# Result Analysis

The testing results demonstrate that the CareLink+ platform was successfully implemented in alignment with the functional and non-functional requirements defined in the project proposal. The automated test suite recorded a 100% pass rate across 88 tests in 7 suites, covering the full scope of backend functionality including authentication, consultation workflows, patient management, notifications, SMS integration, and type definitions. This outcome confirms that the core development objective  designing and implementing a secure, role-based platform for structured doctor-to-doctor clinical consultations was fully achieved at the system level.

Security and role enforcement were consistently validated across all tested components, confirming their correct implementation as high-priority requirements in the proposal. The system accurately restricted access based on user roles, rejected invalid credentials, and preserved audit-trail integrity throughout the full consultation lifecycle  directly reflecting the proposal's emphasis on clinical accountability and compliance with Rwanda's Data Protection and Privacy Law. Additionally, type definition testing confirmed that all core system enums were correctly implemented with accurate values and expected counts, ensuring data model consistency across the entire platform.

Resilience testing through edge cases including SMS failure, inactive users, missing records, and unexpected server errors — confirmed that the system behaves predictably under adverse conditions, which is particularly significant given Rwanda's variable connectivity environment identified as a contextual constraint in the proposal. The SMS integration tests further validated that the system handles all real-world Rwandan phone number formats correctly and propagates errors appropriately, confirming the reliability of the notification delivery mechanism central to the consultation workflow.

The responsiveness testing conducted across a physical iPhone, Google Chrome, and Microsoft Edge confirmed that the non-functional requirement of mobile accessibility was met, ensuring the platform is usable by healthcare providers at all facility levels, from referral hospitals to local health centers.

However, the testing phase was limited to internal unit testing and did not produce empirical evidence for Specific Objective 3; evaluating effectiveness through healthcare outcome metrics such as reduced re-referrals and decreased tertiary hospital congestion. This objective remains partially unmet, as it requires pilot deployment with real clinical data, which falls outside the current development phase as acknowledged in the project scope.

---

## API Documentation

### Base URL
- Development: `http://localhost:5001/api`
- Production: `https://your-api-domain.com/api`

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | No |
| GET | `/auth/profile` | Get current user profile | Yes |
| PUT | `/auth/change-password` | Change password | Yes |

**Login Request:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Clinical Officer",
    "specialty": "General Medicine",
    "facility": {
      "id": 1,
      "name": "Kigali Health Center"
    }
  }
}
```

#### Patients (`/api/patients`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/patients/search?code=XXX` | Search patients by code | Yes | All |
| GET | `/patients/code/:code` | Get patient by code | Yes | All |
| GET | `/patients/:id` | Get patient by ID | Yes | All |
| GET | `/patients/my-patients` | Get Doctor's patients | Yes | Doctor |
| POST | `/patients/discharge` | Create discharge profile | Yes | Doctor |

**Create Discharge Profile:**
```json
POST /api/patients/discharge
{
  "diagnosisSummary": "Type 2 Diabetes Mellitus with hypertension",
  "treatmentSummary": "Metformin 500mg twice daily, Lisinopril 10mg daily",
  "expectedSideEffects": "Possible nausea with Metformin, dizziness with Lisinopril",
  "warningSigns": "Severe hypoglycemia, chest pain, swelling of extremities",
  "followUpInstructions": "Check blood glucose weekly, BP monitoring daily",
  "dischargeDate": "2024-01-15",
  "specialty": "Internal Medicine",
  "patientPhone": "+250788123456"
}
```

#### Consultations (`/api/consultations`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/consultations` | List consultations | Yes | All |
| GET | `/consultations/:id` | Get consultation details | Yes | All |
| GET | `/consultations/stats` | Get dashboard statistics | Yes | All |
| POST | `/consultations` | Create consultation | Yes | Clinical Officer|
| PUT | `/consultations/:id/respond` | Respond to consultation | Yes | Doctor |
| PUT | `/consultations/:id/close` | Close consultation | Yes | All |

**Create Consultation:**
```json
POST /api/consultations
{
  "patientId": 1,
  "symptoms": ["fatigue", "frequent urination", "blurred vision"],
  "symptomDescription": "Patient reports increased fatigue over 2 weeks",
  "vitalSigns": {
    "temperature": 37.2,
    "bloodPressureSystolic": 145,
    "bloodPressureDiastolic": 92,
    "pulseRate": 88,
    "respiratoryRate": 18
  },
  "clinicalQuestion": "Blood glucose readings consistently above 200mg/dL despite medication. Should we adjust dosage or add insulin?",
  "urgencyLevel": "urgent"
}
```

**Respond to Consultation:**
```json
PUT /api/consultations/:id/respond
{
  "carePathway": "local_clinic",
  "recommendations": "Increase Metformin to 1000mg twice daily. Add Glimepiride 2mg before breakfast. Continue BP medication.",
  "medicationInstructions": "Take Metformin with meals. Monitor for hypoglycemia symptoms.",
  "followUpTimeframe": "Review in 2 weeks"
}
```

#### Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications` | Get user notifications | Yes |
| PUT | `/notifications/:id/read` | Mark as read | Yes |
| PUT | `/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/notifications/:id` | Delete notification | Yes |

#### Admin (`/api/admin`)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/admin/users` | List all users | Admin |
| POST | `/admin/users` | Create user | Admin |
| PUT | `/admin/users/:id` | Update user | Admin |
| PATCH | `/admin/users/:id/toggle-status` | Toggle user active status | Admin |
| GET | `/admin/facilities` | List facilities | Admin |
| POST | `/admin/facilities` | Create facility | Admin |
| PUT | `/admin/facilities/:id` | Update facility | Admin |
| GET | `/admin/analytics` | Get system analytics | Admin |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Facility  │       │    User     │       │ Notification│
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │───┬──►│ id (PK)     │
│ name        │   │   │ email       │   │   │ userId (FK) │
│ type        │   │   │ password    │   │   │ type        │
│ district    │   │   │ firstName   │   │   │ title       │
│ province    │   │   │ lastName    │   │   │ message     │
│ address     │   └───│ facilityId  │   │   │ data (JSON) │
│ phone       │       │ role        │   │   │ isRead      │
│ email       │       │ specialty   │   │   │ readAt      │
│ isActive    │       │ phone       │   │   │ createdAt   │
│ createdAt   │       │ isActive    │   │   └─────────────┘
│ updatedAt   │       │ lastLogin   │   │
└─────────────┘       │ createdAt   │   │
                      └─────────────┘   │
                            │           │
              ┌─────────────┴───────────┘
              │             │
              ▼             ▼
┌─────────────────┐   ┌─────────────────┐
│     Patient     │   │  Consultation   │
├─────────────────┤   ├─────────────────┤
│ id (PK)         │◄──│ id (PK)         │
│ patientCode     │   │ patientId (FK)  │
│ diagnosisSummary│   │ Clinical OfficerId(FK) │
│ treatmentSummary│   │ facilityId (FK) │
│ expectedSideEff │   │ symptoms[]      │
│ warningSigns    │   │ symptomDesc     │
│ followUpInstr   │   │ vitalSigns{}    │
│ dischargeDate   │   │ clinicalQuestion│
│ specialty       │   │ urgencyLevel    │
│ createdById(FK) │   │ attachments[]   │
│ facilityId (FK) │   │ status          │
│ isActive        │   │ respondedById   │
│ createdAt       │   │ respondedAt     │
│ updatedAt       │   │ carePathway     │
└─────────────────┘   │ recommendations │
                      │ medicationInstr │
                      │ followUpTime    │
                      │ createdAt       │
                      │ updatedAt       │
                      └─────────────────┘
```

### Enums

**UserRole:**
- `Doctor` - Hospital Doctors
- `Clinical Officer` - Health center Clinical Officers
- `administrator` - System administrators

**FacilityType:**
- `referral_hospital` - National referral hospitals
- `district_hospital` - District-level hospitals
- `health_center` - Local health centers/clinics

**ConsultationStatus:**
- `pending` - Awaiting Doctor response
- `responded` - Doctor has provided guidance
- `closed` - Consultation completed

**UrgencyLevel:**
- `routine` - Non-urgent, can wait
- `urgent` - Needs attention within 24-48 hours
- `emergency` - Immediate attention required

**CarePathway:**
- `home_care` - Manage at home
- `local_clinic` - Continue at local facility
- `district_referral` - Refer to district hospital
- `urgent_transfer` - Immediate hospital transfer

**NotificationType:**
- `new_consultation` - New consultation request
- `consultation_response` - Doctor response received
- `patient_assigned` - New patient assigned
- `system_alert` - System notification

---

## Deployment

### Frontend (Netlify)

The frontend is configured for Netlify deployment:

1. **Connect Repository** to Netlify
2. **Build Settings:**
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

3. **Environment Variables:**
   - Add `VITE_API_URL` with your backend API URL

4. **SPA Routing:** Handled automatically via `netlify.toml`

### Backend

Deploy to any Node.js hosting platform:

#### Heroku
```bash
cd server
heroku create carelink-plus-api
heroku config:set DATABASE_URL=<your-database-url>
heroku config:set JWT_SECRET=<your-jwt-secret>
heroku config:set NODE_ENV=production
git push heroku main
```

#### Railway / Render
1. Connect GitHub repository
2. Set root directory to `server`
3. Configure environment variables
4. Deploy

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5001
CMD ["node", "dist/index.js"]
```

### Database (Supabase)

1. Create Supabase project at https://supabase.com
2. Get connection string from Settings > Database
3. Set `DATABASE_URL` environment variable

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint for linting
- Write meaningful commit messages
- Add comments for complex logic


**Built with care for Rwanda's healthcare system**
