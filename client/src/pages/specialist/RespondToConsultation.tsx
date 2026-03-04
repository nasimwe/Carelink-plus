import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Building,
  MapPin,
  Ambulance,
  AlertTriangle,
  CheckCircle,
  User,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  Send,
  Sparkles
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { consultationsAPI } from '../../services/api';
import { Consultation, CarePathway, UrgencyLevel } from '../../types';

const CARE_PATHWAYS = [
  {
    value: CarePathway.HOME_CARE,
    label: 'Home Care',
    description: 'Patient can be managed at home with instructions',
    icon: Home,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    value: CarePathway.LOCAL_CLINIC,
    label: 'Local Clinic',
    description: 'Continue management at submitting facility',
    icon: Building,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    value: CarePathway.DISTRICT_REFERRAL,
    label: 'District Referral',
    description: 'Refer to district hospital for further evaluation',
    icon: MapPin,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  {
    value: CarePathway.URGENT_TRANSFER,
    label: 'Urgent Transfer',
    description: 'Immediate return to referral hospital required',
    icon: Ambulance,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
];

const FOLLOW_UP_OPTIONS = ['1 week', '2 weeks', '1 month', '3 months', '6 months', 'As needed'];

export const RespondToConsultation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    carePathway: '' as CarePathway | '',
    recommendations: '',
    medicationInstructions: '',
    followUpTimeframe: '',
  });

  useEffect(() => {
    const fetchConsultation = async () => {
      if (!id) return;
      try {
        const response = await consultationsAPI.getById(parseInt(id));
        setConsultation(response.data.consultation);
      } catch (error) {
        console.error('Failed to fetch consultation:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConsultation();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.carePathway || !formData.recommendations) {
      setError('Please select a care pathway and provide recommendations');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await consultationsAPI.respond(parseInt(id!), {
        carePathway: formData.carePathway,
        recommendations: formData.recommendations,
        medicationInstructions: formData.medicationInstructions || undefined,
        followUpTimeframe: formData.followUpTimeframe || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
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
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '28px' }}>
              <div className="animate-bounce-subtle" style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                borderRadius: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
              }}>
                <CheckCircle size={52} style={{ color: '#10B981' }} />
              </div>
              <div className="animate-float" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              }}>
                <Sparkles size={18} style={{ color: 'white' }} />
              </div>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
              Response Submitted
            </h1>

            <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
              The clinical officer has been notified of your response and care pathway recommendation.
            </p>

            <button
              onClick={() => navigate('/specialist')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px 24px', fontSize: '15px' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!consultation) {
    return (
      <Layout>
        <div className="animate-fade-in" style={{
          maxWidth: '400px',
          margin: '80px auto',
          textAlign: 'center',
          padding: '48px 32px',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <FileText size={28} style={{ color: '#EF4444' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            Consultation Not Found
          </h2>
          <button
            onClick={() => navigate('/specialist')}
            className="btn btn-primary"
            style={{ marginTop: '24px' }}
          >
            <ArrowLeft size={18} />
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const urgencyStyles: Record<UrgencyLevel, { bg: string; color: string }> = {
    [UrgencyLevel.EMERGENCY]: { bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)', color: '#DC2626' },
    [UrgencyLevel.URGENT]: { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)', color: '#D97706' },
    [UrgencyLevel.ROUTINE]: { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)', color: '#2563EB' },
  };

  return (
    <Layout>
      <div className="respond-consultation-container">
        {/* Back button */}
        <button
          onClick={() => navigate('/specialist')}
          className="animate-fade-in btn btn-ghost"
          style={{ marginBottom: '16px', padding: '8px 0' }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="animate-fade-in-down" style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
            Respond to Consultation
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#374151' }}>
              {consultation.patient?.patientCode}
            </span>
            <span style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '20px',
              background: urgencyStyles[consultation.urgencyLevel].bg,
              color: urgencyStyles[consultation.urgencyLevel].color
            }}>
              {consultation.urgencyLevel}
            </span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error animate-scale-in" style={{ marginBottom: '24px' }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="respond-grid">
          {/* Left column - Consultation details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Discharge Profile */}
            <div className="card animate-fade-in-up respond-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.15) 0%, rgba(30, 58, 95, 0.05) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={20} style={{ color: '#1E3A5F' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Discharge Profile</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Diagnosis</p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{consultation.patient?.diagnosisSummary}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Treatment</p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{consultation.patient?.treatmentSummary}</p>
                </div>
                {consultation.patient?.expectedSideEffects && (
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Side Effects</p>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{consultation.patient?.expectedSideEffects}</p>
                  </div>
                )}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(239, 68, 68, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Warning Signs</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#991B1B', lineHeight: 1.6, margin: 0 }}>{consultation.patient?.warningSigns}</p>
                </div>
              </div>
            </div>

            {/* Current Consultation */}
            <div className="card animate-fade-in-up animation-delay-100 respond-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Stethoscope size={20} style={{ color: '#3B82F6' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>Current Consultation</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Symptoms</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {consultation.symptoms.map((symptom) => (
                      <span key={symptom} style={{
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#374151'
                      }}>
                        {symptom}
                      </span>
                    ))}
                  </div>
                  {consultation.symptomDescription && (
                    <p style={{ marginTop: '12px', fontSize: '14px', color: '#4B5563', lineHeight: 1.6 }}>{consultation.symptomDescription}</p>
                  )}
                </div>

                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vital Signs</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {consultation.vitalSigns.temperature && (
                      <div style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Temp:</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginLeft: '6px' }}>{consultation.vitalSigns.temperature}°C</span>
                      </div>
                    )}
                    {consultation.vitalSigns.bloodPressureSystolic && (
                      <div style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>BP:</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginLeft: '6px' }}>{consultation.vitalSigns.bloodPressureSystolic}/{consultation.vitalSigns.bloodPressureDiastolic}</span>
                      </div>
                    )}
                    {consultation.vitalSigns.pulseRate && (
                      <div style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Pulse:</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginLeft: '6px' }}>{consultation.vitalSigns.pulseRate} bpm</span>
                      </div>
                    )}
                    {consultation.vitalSigns.respiratoryRate && (
                      <div style={{ padding: '10px 14px', background: '#F9FAFB', borderRadius: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>RR:</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginLeft: '6px' }}>{consultation.vitalSigns.respiratoryRate}/min</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Question</p>
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
                    borderRadius: '12px',
                    borderLeft: '3px solid #3B82F6'
                  }}>
                    <p style={{ fontSize: '14px', color: '#1E40AF', lineHeight: 1.7, margin: 0 }}>{consultation.clinicalQuestion}</p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  background: '#F9FAFB',
                  borderRadius: '10px',
                  fontSize: '13px',
                  color: '#6B7280'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} />
                    <span>{consultation.facility?.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} />
                    <span>Dr. {consultation.clinician?.firstName} {consultation.clinician?.lastName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Response form */}
          <div>
            <form onSubmit={handleSubmit} className="card animate-fade-in-up animation-delay-200 respond-form-card">
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
                  <Activity size={22} style={{ color: '#10B981' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Care Pathway Decision</h3>
              </div>

              {/* Care Pathway Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>
                  Select Care Pathway <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div className="care-pathway-grid">
                  {CARE_PATHWAYS.map((pathway) => (
                    <button
                      key={pathway.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, carePathway: pathway.value }))}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: `2px solid ${formData.carePathway === pathway.value ? pathway.color : '#E5E7EB'}`,
                        background: formData.carePathway === pathway.value ? pathway.bgColor : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <pathway.icon size={18} style={{ color: pathway.color }} />
                        <span style={{ fontSize: '14px', fontWeight: 600, color: formData.carePathway === pathway.value ? pathway.color : '#374151' }}>
                          {pathway.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{pathway.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  Recommendations <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => setFormData((prev) => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Provide detailed clinical recommendations for the local clinical officer..."
                  rows={5}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              {/* Medication Instructions */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  Medication Instructions
                </label>
                <textarea
                  value={formData.medicationInstructions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, medicationInstructions: e.target.value }))}
                  placeholder="Any medication changes or specific instructions..."
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Follow-up Timeframe */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  Follow-up Timeframe
                </label>
                <select
                  value={formData.followUpTimeframe}
                  onChange={(e) => setFormData((prev) => ({ ...prev, followUpTimeframe: e.target.value }))}
                >
                  <option value="">Select timeframe</option>
                  {FOLLOW_UP_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.carePathway || !formData.recommendations}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: (isSubmitting || !formData.carePathway || !formData.recommendations) ? 'not-allowed' : 'pointer',
                  opacity: (isSubmitting || !formData.carePathway || !formData.recommendations) ? 0.6 : 1,
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
                    <Send size={18} />
                    Submit Response
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Responsive styles for Respond to Consultation */}
      <style>{`
        .respond-consultation-container {
          padding: 16px;
        }
        .respond-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .respond-card {
          padding: 16px;
        }
        .respond-form-card {
          padding: 20px;
        }
        .care-pathway-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        @media (min-width: 640px) {
          .respond-consultation-container {
            padding: 20px;
          }
          .respond-grid {
            gap: 20px;
          }
          .respond-card {
            padding: 20px;
          }
          .respond-form-card {
            padding: 24px;
          }
          .care-pathway-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        @media (min-width: 1024px) {
          .respond-consultation-container {
            padding: 24px 32px;
          }
          .respond-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          .respond-card {
            padding: 24px;
          }
          .respond-form-card {
            padding: 28px;
          }
        }
      `}</style>
    </Layout>
  );
};
