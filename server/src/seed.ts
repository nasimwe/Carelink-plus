import dotenv from 'dotenv';
dotenv.config();

import { sequelize, User, Facility, Patient, Consultation, Notification } from './models';
import { UserRole, FacilityType, ConsultationStatus, UrgencyLevel, CarePathway, NotificationType } from './types';

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync and clear
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // Create Facilities
    const facilities = await Facility.bulkCreate([
      {
        name: 'Kigali University Teaching Hospital (CHUK)',
        type: FacilityType.REFERRAL_HOSPITAL,
        district: 'Nyarugenge',
        province: 'Kigali',
        address: 'KN 4 Ave, Kigali',
        phone: '+250 788 000 001',
        email: 'info@chuk.rw',
      },
      {
        name: 'King Faisal Hospital',
        type: FacilityType.REFERRAL_HOSPITAL,
        district: 'Gasabo',
        province: 'Kigali',
        address: 'KG 544 St, Kigali',
        phone: '+250 788 000 002',
        email: 'info@kfh.rw',
      },
      {
        name: 'Huye District Hospital',
        type: FacilityType.DISTRICT_HOSPITAL,
        district: 'Huye',
        province: 'Southern',
        address: 'Huye Town',
        phone: '+250 788 000 003',
        email: 'info@huyehospital.rw',
      },
      {
        name: 'Rubavu District Hospital',
        type: FacilityType.DISTRICT_HOSPITAL,
        district: 'Rubavu',
        province: 'Western',
        address: 'Gisenyi Town',
        phone: '+250 788 000 004',
        email: 'info@rubavuhospital.rw',
      },
      {
        name: 'Tumba Health Center',
        type: FacilityType.HEALTH_CENTER,
        district: 'Huye',
        province: 'Southern',
        address: 'Tumba Sector',
        phone: '+250 788 000 005',
        email: 'tumba@health.rw',
      },
      {
        name: 'Nyamata Health Center',
        type: FacilityType.HEALTH_CENTER,
        district: 'Bugesera',
        province: 'Eastern',
        address: 'Nyamata Town',
        phone: '+250 788 000 006',
        email: 'nyamata@health.rw',
      },
    ]);

    console.log(`Created ${facilities.length} facilities.`);

    // Create Users (individualHooks: true ensures password hashing hook runs)
    const users = await User.bulkCreate([
      // Specialists
      {
        email: 'jp.habimana@kuth.rw',
        password: 'password123',
        firstName: 'Jean-Pierre',
        lastName: 'Habimana',
        role: UserRole.SPECIALIST,
        facilityId: facilities[0].id,
        specialty: 'Cardiology',
        phone: '+250 788 100 001',
      },
      {
        email: 'alice.mukamana@kfh.rw',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Mukamana',
        role: UserRole.SPECIALIST,
        facilityId: facilities[1].id,
        specialty: 'Oncology',
        phone: '+250 788 100 002',
      },
      // Clinicians
      {
        email: 'm.uwimana@huye.rw',
        password: 'password123',
        firstName: 'Marie',
        lastName: 'Uwimana',
        role: UserRole.CLINICIAN,
        facilityId: facilities[4].id,
        phone: '+250 788 200 001',
      },
      {
        email: 'eric.ndayisaba@nyamata.rw',
        password: 'password123',
        firstName: 'Eric',
        lastName: 'Ndayisaba',
        role: UserRole.CLINICIAN,
        facilityId: facilities[5].id,
        phone: '+250 788 200 002',
      },
      // Administrator
      {
        email: 'admin@carelink.rw',
        password: 'admin123',
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.ADMINISTRATOR,
        facilityId: facilities[0].id,
        phone: '+250 788 300 001',
      },
    ], { individualHooks: true });

    console.log(`Created ${users.length} users.`);

    // Create Patients (Discharge Profiles)
    const patients = await Patient.bulkCreate([
      {
        patientCode: 'RW-K7TH-2026-0156',
        diagnosisSummary: 'Congestive heart failure with preserved ejection fraction. Hypertensive heart disease. Type 2 diabetes mellitus.',
        treatmentSummary: 'Started on Furosemide 40mg daily, Lisinopril 10mg daily, Metformin 500mg twice daily. Cardiac rehabilitation recommended.',
        expectedSideEffects: 'Increased urination due to diuretic. Possible dizziness from blood pressure medication. Monitor blood sugar regularly.',
        warningSigns: 'Sudden weight gain (>2kg in 2 days), Severe shortness of breath, Chest pain, Swelling in legs/ankles, Persistent cough',
        followUpInstructions: 'Weekly blood pressure monitoring. Monthly cardiac review. HbA1c test in 3 months. Restrict salt intake. Daily weight monitoring.',
        dischargeDate: new Date('2026-02-10'),
        specialty: 'Cardiology',
        createdById: users[0].id,
        facilityId: facilities[0].id,
      },
      {
        patientCode: 'RW-CF6K-2026-0089',
        diagnosisSummary: 'Breast cancer stage IIA, post-mastectomy. Hormone receptor positive.',
        treatmentSummary: 'Completed adjuvant chemotherapy (4 cycles AC-T). Started on Tamoxifen 20mg daily for 5-year hormone therapy.',
        expectedSideEffects: 'Hot flashes, joint pain, mood changes from Tamoxifen. Fatigue may persist for several months post-chemotherapy.',
        warningSigns: 'New lumps in remaining breast or underarm, Bone pain, Persistent headaches, Vision changes, Unexplained weight loss',
        followUpInstructions: 'Monthly self-breast examination. Mammogram every 6 months for 2 years. Bone density scan annually. Report any new symptoms immediately.',
        dischargeDate: new Date('2026-02-05'),
        specialty: 'Oncology',
        createdById: users[1].id,
        facilityId: facilities[1].id,
      },
      {
        patientCode: 'RW-M9PL-2026-0234',
        diagnosisSummary: 'Acute appendicitis, post-appendectomy. Uncomplicated recovery.',
        treatmentSummary: 'Laparoscopic appendectomy performed. Completed 5-day course of Metronidazole and Ciprofloxacin.',
        expectedSideEffects: 'Mild pain at incision sites. Temporary digestive changes.',
        warningSigns: 'Fever >38.5°C, Increasing abdominal pain, Wound redness/discharge, Persistent nausea/vomiting',
        followUpInstructions: 'Wound care daily. Avoid heavy lifting for 2 weeks. Normal diet can resume. Return for wound check in 7 days.',
        dischargeDate: new Date('2026-02-14'),
        specialty: 'General Surgery',
        createdById: users[0].id,
        facilityId: facilities[0].id,
      },
    ]);

    console.log(`Created ${patients.length} patients.`);

    // Create Consultations
    const consultations = await Consultation.bulkCreate([
      {
        patientId: patients[0].id,
        clinicianId: users[2].id,
        facilityId: facilities[4].id,
        symptoms: ['Shortness of breath', 'Leg swelling', 'Fatigue'],
        symptomDescription: 'Patient presents with worsening shortness of breath over the past 3 days. Bilateral ankle swelling noted. Reports difficulty sleeping flat.',
        vitalSigns: {
          temperature: 36.8,
          bloodPressureSystolic: 158,
          bloodPressureDiastolic: 95,
          pulseRate: 92,
          respiratoryRate: 22,
        },
        clinicalQuestion: 'Patient showing signs of possible fluid retention despite medication. BP elevated. Should we increase diuretic dose or is urgent referral needed?',
        urgencyLevel: UrgencyLevel.URGENT,
        status: ConsultationStatus.PENDING,
      },
      {
        patientId: patients[1].id,
        clinicianId: users[3].id,
        facilityId: facilities[5].id,
        symptoms: ['Joint pain', 'Fatigue'],
        symptomDescription: 'Patient complains of moderate joint pain in knees and wrists. Fatigue persists. No new lumps detected on examination.',
        vitalSigns: {
          temperature: 36.5,
          bloodPressureSystolic: 125,
          bloodPressureDiastolic: 80,
          pulseRate: 78,
          respiratoryRate: 16,
        },
        clinicalQuestion: 'Is the joint pain a normal side effect of Tamoxifen or should we investigate further? Patient is concerned.',
        urgencyLevel: UrgencyLevel.ROUTINE,
        status: ConsultationStatus.RESPONDED,
        respondedById: users[1].id,
        respondedAt: new Date('2026-02-15'),
        carePathway: CarePathway.HOME_CARE,
        recommendations: 'Joint pain is a common side effect of Tamoxifen and usually manageable. Recommend over-the-counter pain relief (Paracetamol preferred). Encourage gentle exercise and stretching. If pain becomes severe or significantly impacts daily activities, consider rheumatology referral.',
        medicationInstructions: 'Continue Tamoxifen as prescribed. Can add Paracetamol 500mg up to 4 times daily as needed for pain. Avoid NSAIDs.',
        followUpTimeframe: '4 weeks',
      },
      {
        patientId: patients[0].id,
        clinicianId: users[2].id,
        facilityId: facilities[4].id,
        symptoms: ['Chest pain', 'Dizziness'],
        symptomDescription: 'Patient reports episodes of chest tightness and dizziness when standing up quickly. Occurred 3 times today.',
        vitalSigns: {
          temperature: 36.6,
          bloodPressureSystolic: 145,
          bloodPressureDiastolic: 88,
          pulseRate: 88,
          respiratoryRate: 18,
        },
        clinicalQuestion: 'New symptom of dizziness - possibly orthostatic hypotension from medications? Need guidance on management.',
        urgencyLevel: UrgencyLevel.EMERGENCY,
        status: ConsultationStatus.PENDING,
      },
    ]);

    console.log(`Created ${consultations.length} consultations.`);

    // Create Notifications
    await Notification.bulkCreate([
      {
        userId: users[0].id,
        type: NotificationType.NEW_CONSULTATION,
        title: 'New Urgent Consultation',
        message: 'New urgent consultation for patient RW-K7TH-2026-0156 from Tumba Health Center',
        data: { consultationId: consultations[0].id, patientCode: patients[0].patientCode },
        isRead: false,
      },
      {
        userId: users[0].id,
        type: NotificationType.NEW_CONSULTATION,
        title: 'Emergency Consultation',
        message: 'Emergency consultation for patient RW-K7TH-2026-0156 requires immediate attention',
        data: { consultationId: consultations[2].id, patientCode: patients[0].patientCode },
        isRead: false,
      },
      {
        userId: users[3].id,
        type: NotificationType.CONSULTATION_RESPONSE,
        title: 'Consultation Response Received',
        message: 'Response received for patient RW-CF6K-2026-0089: Home Care recommended',
        data: { consultationId: consultations[1].id, carePathway: CarePathway.HOME_CARE },
        isRead: true,
        readAt: new Date('2026-02-15'),
      },
    ]);

    console.log('Created notifications.');

    console.log('\n=== Seed completed successfully! ===\n');
    console.log('Demo accounts:');
    console.log('  Specialist: jp.habimana@kuth.rw / password123');
    console.log('  Clinician: m.uwimana@huye.rw / password123');
    console.log('  Admin: admin@carelink.rw / admin123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
