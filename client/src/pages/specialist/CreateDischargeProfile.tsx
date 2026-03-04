import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Pill,
  AlertTriangle,
  Clock,
  Calendar,
  Stethoscope,
  Copy,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { patientsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const SPECIALTIES = [
  'Cardiology',
  'Oncology',
  'Neurology',
  'General Surgery',
  'Orthopedics',
  'Pediatrics',
  'Internal Medicine',
  'Obstetrics & Gynecology',
  'Psychiatry',
  'Dermatology',
  'Nephrology',
  'Pulmonology',
  'Gastroenterology',
  'Endocrinology',
  'Infectious Disease',
];

interface FormData {
  diagnosisSummary: string;
  treatmentSummary: string;
  expectedSideEffects: string;
  warningSigns: string;
  followUpInstructions: string;
  dischargeDate: string;
  specialty: string;
  patientPhone: string;
}

export const CreateDischargeProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdPatientCode, setCreatedPatientCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    diagnosisSummary: '',
    treatmentSummary: '',
    expectedSideEffects: '',
    warningSigns: '',
    followUpInstructions: '',
    dischargeDate: new Date().toISOString().split('T')[0],
    specialty: user?.specialty || '',
    patientPhone: '',
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdPatientCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await patientsAPI.createDischargeProfile({
        diagnosisSummary: formData.diagnosisSummary,
        treatmentSummary: formData.treatmentSummary,
        expectedSideEffects: formData.expectedSideEffects || undefined,
        warningSigns: formData.warningSigns,
        followUpInstructions: formData.followUpInstructions,
        dischargeDate: formData.dischargeDate,
        specialty: formData.specialty,
        patientPhone: formData.patientPhone || undefined,
      });

      setCreatedPatientCode(response.data.patient.patientCode);
      setSmsSent(!!response.data.smsSent);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create discharge profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center' }}>
          <div className="animate-scale-in" style={{
            padding: '48px 40px',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircle size={52} style={{ color: '#10B981' }} />
              </div>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
              Discharge Profile Created
            </h1>

            {/* Patient Code Display */}
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.08) 0%, rgba(30, 58, 95, 0.03) 100%)',
              borderRadius: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Code</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <p style={{ fontSize: '22px', fontWeight: 700, color: '#1E3A5F', margin: 0, letterSpacing: '0.02em' }}>
                  {createdPatientCode}
                </p>
                <button
                  onClick={handleCopyCode}
                  style={{
                    padding: '8px',
                    background: copied ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copied ? (
                    <CheckCircle size={18} style={{ color: 'white' }} />
                  ) : (
                    <Copy size={18} style={{ color: '#6B7280' }} />
                  )}
                </button>
              </div>
            </div>

            {smsSent ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                marginBottom: '16px',
              }}>
                <MessageSquare size={18} style={{ color: '#059669', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', color: '#065F46', margin: 0 }}>
                  Patient code sent via SMS to the patient's phone.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                marginBottom: '16px',
              }}>
                <MessageSquare size={18} style={{ color: '#B45309', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', color: '#92400E', margin: 0 }}>
                  No phone number provided — remember to share the code with the patient manually.
                </p>
              </div>
            )}

            <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.7, marginBottom: '28px' }}>
              This code can be used by clinical officers nationwide to access the patient's care profile.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/specialist')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '16px 24px', fontSize: '15px' }}
              >
                Back to Dashboard
              </button>

              <button
                onClick={() => {
                  setSuccess(false);
                  setSmsSent(false);
                  setFormData({
                    diagnosisSummary: '',
                    treatmentSummary: '',
                    expectedSideEffects: '',
                    warningSigns: '',
                    followUpInstructions: '',
                    dischargeDate: new Date().toISOString().split('T')[0],
                    specialty: user?.specialty || '',
                    patientPhone: '',
                  });
                }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '16px 24px', fontSize: '15px' }}
              >
                Create Another
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="create-discharge-container">
        {/* Back button */}
        <button
          onClick={() => navigate('/specialist')}
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
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="animate-fade-in-down" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            Create Discharge Profile
          </h1>
          <p style={{ color: '#6B7280', fontSize: '15px', margin: 0 }}>
            Create a digital discharge summary for patients returning to their communities
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-scale-in" style={{ marginBottom: '24px' }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card animate-fade-in-up" style={{ padding: '32px', marginBottom: '24px' }}>
            {/* Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Stethoscope size={16} style={{ color: '#3B82F6' }} />
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Specialty <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                </div>
                <select
                  value={formData.specialty}
                  onChange={(e) => handleChange('specialty', e.target.value)}
                  required
                >
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Calendar size={16} style={{ color: '#F59E0B' }} />
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Discharge Date <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                </div>
                <input
                  type="date"
                  value={formData.dischargeDate}
                  onChange={(e) => handleChange('dischargeDate', e.target.value)}
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Phone size={16} style={{ color: '#10B981' }} />
                  <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                    Patient Phone
                    <span style={{ marginLeft: '6px', fontSize: '12px', fontWeight: 400, color: '#9CA3AF' }}>(optional — for SMS)</span>
                  </label>
                </div>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => handleChange('patientPhone', e.target.value)}
                  placeholder="e.g. 0788123456"
                />
              </div>
            </div>

            {/* Diagnosis Summary */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <FileText size={16} style={{ color: '#3B82F6' }} />
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Diagnosis Summary <span style={{ color: '#EF4444' }}>*</span>
                </label>
              </div>
              <textarea
                value={formData.diagnosisSummary}
                onChange={(e) => handleChange('diagnosisSummary', e.target.value)}
                placeholder="Provide a comprehensive diagnosis summary..."
                rows={4}
                style={{ resize: 'none' }}
                required
              />
            </div>

            {/* Treatment Summary */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Pill size={16} style={{ color: '#10B981' }} />
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Treatment Summary <span style={{ color: '#EF4444' }}>*</span>
                </label>
              </div>
              <textarea
                value={formData.treatmentSummary}
                onChange={(e) => handleChange('treatmentSummary', e.target.value)}
                placeholder="Describe the treatment provided and current medications..."
                rows={4}
                style={{ resize: 'none' }}
                required
              />
            </div>

            {/* Expected Side Effects */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Expected Side Effects
                </label>
              </div>
              <textarea
                value={formData.expectedSideEffects}
                onChange={(e) => handleChange('expectedSideEffects', e.target.value)}
                placeholder="List any expected side effects from medications or treatment..."
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>

            {/* Warning Signs */}
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)',
              borderRadius: '14px',
              border: '1px solid rgba(239, 68, 68, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#991B1B' }}>
                  Warning Signs <span style={{ color: '#EF4444' }}>*</span>
                  <span style={{ fontWeight: 400, marginLeft: '8px', color: '#B91C1C' }}>(Critical for patient safety)</span>
                </label>
              </div>
              <textarea
                value={formData.warningSigns}
                onChange={(e) => handleChange('warningSigns', e.target.value)}
                placeholder="List warning signs that require immediate medical attention..."
                rows={4}
                style={{
                  resize: 'none',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(239, 68, 68, 0.2)'
                }}
                required
              />
            </div>

            {/* Follow-up Instructions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Clock size={16} style={{ color: '#8B5CF6' }} />
                <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                  Follow-up Instructions <span style={{ color: '#EF4444' }}>*</span>
                </label>
              </div>
              <textarea
                value={formData.followUpInstructions}
                onChange={(e) => handleChange('followUpInstructions', e.target.value)}
                placeholder="Provide detailed follow-up care instructions..."
                rows={4}
                style={{ resize: 'none' }}
                required
              />
            </div>
          </div>

          <div className="animate-fade-in-up animation-delay-200" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/specialist')}
              className="btn btn-secondary"
              style={{ padding: '14px 28px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ padding: '14px 28px' }}
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
                  Creating...
                </>
              ) : (
                'Create Discharge Profile'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Responsive styles for Create Discharge Profile */}
      <style>{`
        .create-discharge-container {
          padding: 16px;
          max-width: 900px;
        }

        @media (min-width: 640px) {
          .create-discharge-container {
            padding: 20px;
          }
        }

        @media (min-width: 1024px) {
          .create-discharge-container {
            padding: 24px 32px;
          }
        }
      `}</style>
    </Layout>
  );
};
