import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Stethoscope,
  Activity,
  MessageSquare,
  ClipboardCheck,
  Thermometer,
  Heart,
  Wind,
  AlertCircle,
  User
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { patientsAPI, consultationsAPI } from '../../services/api';
import { Patient, UrgencyLevel } from '../../types';

const COMMON_SYMPTOMS = [
  'Fever',
  'Headache',
  'Fatigue',
  'Nausea',
  'Vomiting',
  'Diarrhea',
  'Chest pain',
  'Shortness of breath',
  'Dizziness',
  'Abdominal pain',
  'Leg swelling',
  'Cough',
  'Loss of appetite',
  'Joint pain',
  'Skin rash',
];

interface FormData {
  symptoms: string[];
  symptomDescription: string;
  vitalSigns: {
    temperature: string;
    bloodPressureSystolic: string;
    bloodPressureDiastolic: string;
    pulseRate: string;
    respiratoryRate: string;
  };
  clinicalQuestion: string;
  urgencyLevel: UrgencyLevel;
}

const STEPS = [
  { number: 1, title: 'Symptoms', icon: Stethoscope },
  { number: 2, title: 'Vitals', icon: Activity },
  { number: 3, title: 'Question', icon: MessageSquare },
  { number: 4, title: 'Review', icon: ClipboardCheck },
];

export const NewConsultation = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    symptoms: [],
    symptomDescription: '',
    vitalSigns: {
      temperature: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      pulseRate: '',
      respiratoryRate: '',
    },
    clinicalQuestion: '',
    urgencyLevel: UrgencyLevel.ROUTINE,
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      try {
        const response = await patientsAPI.getById(parseInt(patientId));
        setPatient(response.data.patient);
      } catch (error) {
        console.error('Failed to fetch patient:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatient();
  }, [patientId]);

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const updateVitalSign = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await consultationsAPI.create({
        patientId: parseInt(patientId!),
        symptoms: formData.symptoms,
        symptomDescription: formData.symptomDescription || undefined,
        vitalSigns: {
          temperature: formData.vitalSigns.temperature ? parseFloat(formData.vitalSigns.temperature) : undefined,
          bloodPressureSystolic: formData.vitalSigns.bloodPressureSystolic ? parseInt(formData.vitalSigns.bloodPressureSystolic) : undefined,
          bloodPressureDiastolic: formData.vitalSigns.bloodPressureDiastolic ? parseInt(formData.vitalSigns.bloodPressureDiastolic) : undefined,
          pulseRate: formData.vitalSigns.pulseRate ? parseInt(formData.vitalSigns.pulseRate) : undefined,
          respiratoryRate: formData.vitalSigns.respiratoryRate ? parseInt(formData.vitalSigns.respiratoryRate) : undefined,
        },
        clinicalQuestion: formData.clinicalQuestion,
        urgencyLevel: formData.urgencyLevel,
      });

      navigate('/clinician/consultation/success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit consultation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.symptoms.length > 0;
      case 2:
        return true;
      case 3:
        return formData.clinicalQuestion.trim().length > 0;
      default:
        return true;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="loading-spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="new-consultation-container">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#4B5563',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            padding: '8px 0',
            marginBottom: '24px',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#1E3A5F'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#4B5563'}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="animate-fade-in-down" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            New Consultation
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {patient?.patientCode}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                {patient?.specialty}
              </p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="animate-fade-in-up progress-container">
          {STEPS.map((step, index) => (
            <div key={step.number} style={{ display: 'flex', alignItems: 'center', flex: index < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: step.number < currentStep
                    ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                    : step.number === currentStep
                    ? 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)'
                    : '#E5E7EB',
                  boxShadow: step.number === currentStep ? '0 4px 12px rgba(30, 58, 95, 0.3)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {step.number < currentStep ? (
                    <Check size={20} style={{ color: 'white' }} />
                  ) : (
                    <step.icon size={20} style={{ color: step.number === currentStep ? 'white' : '#9CA3AF' }} />
                  )}
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: step.number === currentStep ? 600 : 500,
                  color: step.number <= currentStep ? '#111827' : '#9CA3AF',
                  display: 'none'
                }} className="md-show">
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '3px',
                  margin: '0 16px',
                  borderRadius: '2px',
                  background: step.number < currentStep
                    ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                    : '#E5E7EB',
                  transition: 'all 0.3s ease'
                }} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error animate-scale-in" style={{ marginBottom: '24px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Step content */}
        <div className="card animate-fade-in-up step-card">
          {/* Step 1: Symptoms */}
          {currentStep === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Stethoscope size={22} style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Step 1: Symptoms
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                    Select all symptoms the patient is experiencing
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {COMMON_SYMPTOMS.map((symptom, index) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className="animate-scale-in"
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: formData.symptoms.includes(symptom) ? '#1E3A5F' : '#E5E7EB',
                      background: formData.symptoms.includes(symptom)
                        ? 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)'
                        : 'white',
                      color: formData.symptoms.includes(symptom) ? 'white' : '#374151',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      animationDelay: `${index * 30}ms`
                    }}
                  >
                    {symptom}
                  </button>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  Additional Description (Optional)
                </label>
                <textarea
                  value={formData.symptomDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, symptomDescription: e.target.value }))}
                  placeholder="Describe any additional symptoms or context..."
                  rows={4}
                  style={{ resize: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Step 2: Vital Signs */}
          {currentStep === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={22} style={{ color: '#EF4444' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Step 2: Vital Signs
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                    Record the patient's current vital signs
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(245, 158, 11, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Thermometer size={18} style={{ color: '#F59E0B' }} />
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                      Temperature (°C)
                    </label>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitalSigns.temperature}
                    onChange={(e) => updateVitalSign('temperature', e.target.value)}
                    placeholder="36.5"
                  />
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.02) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(239, 68, 68, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Heart size={18} style={{ color: '#EF4444' }} />
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                      Blood Pressure (mmHg)
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      value={formData.vitalSigns.bloodPressureSystolic}
                      onChange={(e) => updateVitalSign('bloodPressureSystolic', e.target.value)}
                      placeholder="120"
                    />
                    <span style={{ color: '#6B7280', fontSize: '18px', fontWeight: 500 }}>/</span>
                    <input
                      type="number"
                      value={formData.vitalSigns.bloodPressureDiastolic}
                      onChange={(e) => updateVitalSign('bloodPressureDiastolic', e.target.value)}
                      placeholder="80"
                    />
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(168, 85, 247, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Activity size={18} style={{ color: '#A855F7' }} />
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                      Pulse Rate (bpm)
                    </label>
                  </div>
                  <input
                    type="number"
                    value={formData.vitalSigns.pulseRate}
                    onChange={(e) => updateVitalSign('pulseRate', e.target.value)}
                    placeholder="72"
                  />
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(16, 185, 129, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Wind size={18} style={{ color: '#10B981' }} />
                    <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                      Respiratory Rate (/min)
                    </label>
                  </div>
                  <input
                    type="number"
                    value={formData.vitalSigns.respiratoryRate}
                    onChange={(e) => updateVitalSign('respiratoryRate', e.target.value)}
                    placeholder="16"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Clinical Question */}
          {currentStep === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.15) 0%, rgba(30, 58, 95, 0.05) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MessageSquare size={22} style={{ color: '#1E3A5F' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Step 3: Clinical Question
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                    Describe your clinical concern and question for the doctor
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  Clinical Question <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={formData.clinicalQuestion}
                  onChange={(e) => setFormData((prev) => ({ ...prev, clinicalQuestion: e.target.value }))}
                  placeholder="Describe your clinical concern and what guidance you need from the doctor..."
                  rows={6}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>
                  Urgency Level <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div className="urgency-grid">
                  {[
                    { value: UrgencyLevel.ROUTINE, label: 'Routine', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' },
                    { value: UrgencyLevel.URGENT, label: 'Urgent', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)' },
                    { value: UrgencyLevel.EMERGENCY, label: 'Emergency', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, urgencyLevel: option.value }))}
                      style={{
                        padding: '20px 16px',
                        borderRadius: '14px',
                        border: `2px solid ${formData.urgencyLevel === option.value ? option.color : '#E5E7EB'}`,
                        background: formData.urgencyLevel === option.value ? option.bgColor : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: formData.urgencyLevel === option.value ? option.color : '#4B5563'
                      }}>
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ClipboardCheck size={22} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Step 4: Review & Submit
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
                    Please review your consultation before submitting
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                  borderRadius: '14px'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Symptoms
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.symptoms.map((symptom) => (
                      <span key={symptom} style={{
                        padding: '8px 16px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#374151'
                      }}>
                        {symptom}
                      </span>
                    ))}
                  </div>
                  {formData.symptomDescription && (
                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#4B5563', lineHeight: 1.6 }}>
                      {formData.symptomDescription}
                    </p>
                  )}
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                  borderRadius: '14px'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Vital Signs
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    {formData.vitalSigns.temperature && (
                      <div style={{ padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Temperature</span>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>{formData.vitalSigns.temperature}°C</p>
                      </div>
                    )}
                    {formData.vitalSigns.bloodPressureSystolic && (
                      <div style={{ padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Blood Pressure</span>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>{formData.vitalSigns.bloodPressureSystolic}/{formData.vitalSigns.bloodPressureDiastolic} mmHg</p>
                      </div>
                    )}
                    {formData.vitalSigns.pulseRate && (
                      <div style={{ padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Pulse</span>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>{formData.vitalSigns.pulseRate} bpm</p>
                      </div>
                    )}
                    {formData.vitalSigns.respiratoryRate && (
                      <div style={{ padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Respiratory Rate</span>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>{formData.vitalSigns.respiratoryRate}/min</p>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.05) 0%, rgba(30, 58, 95, 0.02) 100%)',
                  borderRadius: '14px',
                  borderLeft: '4px solid #1E3A5F'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Clinical Question
                  </h3>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: 0 }}>
                    {formData.clinicalQuestion}
                  </p>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                  borderRadius: '14px'
                }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                    Urgency Level
                  </h3>
                  <span style={{
                    display: 'inline-flex',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: formData.urgencyLevel === UrgencyLevel.ROUTINE
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)'
                      : formData.urgencyLevel === UrgencyLevel.URGENT
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
                    color: formData.urgencyLevel === UrgencyLevel.ROUTINE
                      ? '#2563EB'
                      : formData.urgencyLevel === UrgencyLevel.URGENT
                      ? '#D97706'
                      : '#DC2626'
                  }}>
                    {formData.urgencyLevel.charAt(0).toUpperCase() + formData.urgencyLevel.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 1}
              className="btn btn-ghost"
              style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
                className="btn btn-primary"
              >
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin" style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%'
                    }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Submit Consultation
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Responsive styles for New Consultation */}
      <style>{`
        .new-consultation-container {
          padding: 16px;
          max-width: 1000px;
        }
        .progress-container {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding: 16px;
          background: linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%);
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          overflow-x: auto;
        }
        .step-card {
          padding: 16px;
        }
        .urgency-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        @media (min-width: 480px) {
          .urgency-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
        }

        @media (min-width: 640px) {
          .new-consultation-container {
            padding: 20px;
          }
          .progress-container {
            padding: 20px 24px;
            margin-bottom: 28px;
            border-radius: 16px;
          }
          .step-card {
            padding: 24px;
          }
        }

        @media (min-width: 1024px) {
          .new-consultation-container {
            padding: 24px 32px;
          }
          .progress-container {
            margin-bottom: 32px;
          }
          .step-card {
            padding: 32px;
          }
        }

        .md-show {
          display: none;
        }
        @media (min-width: 768px) {
          .md-show {
            display: block;
          }
        }
      `}</style>
    </Layout>
  );
};
