import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Home,
  Building,
  MapPin,
  Ambulance,
  Thermometer,
  Heart,
  Activity,
  Wind,
  Clock,
  User,
  FileText,
  Stethoscope,
  CheckCircle2,
  Calendar,
  XCircle
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { consultationsAPI } from '../../services/api';
import { Consultation, ConsultationStatus, UrgencyLevel, CarePathway } from '../../types';

export const ConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

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

  const handleCloseConsultation = async () => {
    if (!id || !consultation) return;

    if (!window.confirm('Are you sure you want to close this consultation? This action cannot be undone.')) {
      return;
    }

    setIsClosing(true);
    try {
      await consultationsAPI.close(parseInt(id));
      // Refresh the consultation data
      const response = await consultationsAPI.getById(parseInt(id));
      setConsultation(response.data.consultation);
    } catch (error: any) {
      console.error('Failed to close consultation:', error);
      alert(error.response?.data?.message || 'Failed to close consultation. Please try again.');
    } finally {
      setIsClosing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCarePathwayInfo = (pathway: CarePathway) => {
    switch (pathway) {
      case CarePathway.HOME_CARE:
        return {
          icon: Home,
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          label: 'Home Care',
          description: 'Patient can be managed at home with instructions'
        };
      case CarePathway.LOCAL_CLINIC:
        return {
          icon: Building,
          color: '#3B82F6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          label: 'Local Clinic',
          description: 'Continue management at your facility'
        };
      case CarePathway.DISTRICT_REFERRAL:
        return {
          icon: MapPin,
          color: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
          label: 'District Referral',
          description: 'Refer to district hospital for evaluation'
        };
      case CarePathway.URGENT_TRANSFER:
        return {
          icon: Ambulance,
          color: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          label: 'Urgent Transfer',
          description: 'Immediate return to referral hospital required'
        };
    }
  };

  const getStatusBadge = (status: ConsultationStatus) => {
    const styles: Record<ConsultationStatus, { bg: string; color: string; icon: React.ReactNode }> = {
      [ConsultationStatus.PENDING]: {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
        color: '#D97706',
        icon: <Clock size={12} />
      },
      [ConsultationStatus.RESPONDED]: {
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
        color: '#059669',
        icon: <CheckCircle2 size={12} />
      },
      [ConsultationStatus.CLOSED]: {
        bg: 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.1) 100%)',
        color: '#4B5563',
        icon: <FileText size={12} />
      },
    };
    return styles[status];
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    const styles: Record<UrgencyLevel, { bg: string; color: string }> = {
      [UrgencyLevel.ROUTINE]: {
        bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
        color: '#2563EB'
      },
      [UrgencyLevel.URGENT]: {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
        color: '#D97706'
      },
      [UrgencyLevel.EMERGENCY]: {
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
        color: '#DC2626'
      },
    };
    return styles[urgency];
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px'
        }}>
          <div className="loading-spinner" />
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
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
            The consultation you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/clinician')}
            className="btn btn-primary"
          >
            <ArrowLeft size={18} />
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const pathwayInfo = consultation.carePathway ? getCarePathwayInfo(consultation.carePathway) : null;
  const statusBadge = getStatusBadge(consultation.status);
  const urgencyBadge = getUrgencyBadge(consultation.urgencyLevel);

  return (
    <Layout>
      <div className="consultation-detail-container">
        {/* Back button */}
        <button
          onClick={() => navigate('/clinician')}
          className="animate-fade-in btn btn-ghost"
          style={{
            marginBottom: '16px',
            padding: '8px 0'
          }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Header Card */}
        <div
          className="card animate-fade-in-up consultation-header-card"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative element */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: consultation.urgencyLevel === UrgencyLevel.EMERGENCY
              ? 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)'
              : consultation.urgencyLevel === UrgencyLevel.URGENT
              ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)'
              : 'linear-gradient(90deg, #1E3A5F 0%, #3B82F6 100%)'
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#111827',
                  letterSpacing: '-0.02em'
                }}>
                  {consultation.patient?.patientCode}
                </h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '20px',
                    background: statusBadge.bg,
                    color: statusBadge.color,
                    textTransform: 'lowercase'
                  }}>
                    {statusBadge.icon}
                    {consultation.status}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '20px',
                    background: urgencyBadge.bg,
                    color: urgencyBadge.color,
                    textTransform: 'lowercase'
                  }}>
                    {consultation.urgencyLevel}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '14px' }}>
                <Calendar size={16} />
                <span>Submitted: {formatDate(consultation.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="consultation-grid">
          {/* Left column - Submission details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Symptoms Card */}
            <div
              className="card animate-fade-in-up animation-delay-100 consultation-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Stethoscope size={20} style={{ color: '#3B82F6' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Symptoms</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {consultation.symptoms.map((symptom, index) => (
                  <span
                    key={symptom}
                    className="animate-scale-in"
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#374151',
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    {symptom}
                  </span>
                ))}
              </div>
              {consultation.symptomDescription && (
                <p style={{
                  color: '#4B5563',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  padding: '16px',
                  background: '#F9FAFB',
                  borderRadius: '12px',
                  borderLeft: '3px solid #3B82F6'
                }}>
                  {consultation.symptomDescription}
                </p>
              )}
            </div>

            {/* Vital Signs Card */}
            <div
              className="card animate-fade-in-up animation-delay-200 consultation-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Activity size={20} style={{ color: '#EF4444' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Vital Signs</h3>
              </div>
              <div className="vitals-grid">
                {consultation.vitalSigns.temperature && (
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 158, 11, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Thermometer size={16} style={{ color: '#F59E0B' }} />
                      <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Temperature</span>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                      {consultation.vitalSigns.temperature}°C
                    </p>
                  </div>
                )}
                {consultation.vitalSigns.bloodPressureSystolic && (
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(239, 68, 68, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Heart size={16} style={{ color: '#EF4444' }} />
                      <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Blood Pressure</span>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                      {consultation.vitalSigns.bloodPressureSystolic}/{consultation.vitalSigns.bloodPressureDiastolic}
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280', marginLeft: '4px' }}>mmHg</span>
                    </p>
                  </div>
                )}
                {consultation.vitalSigns.pulseRate && (
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.03) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(168, 85, 247, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Activity size={16} style={{ color: '#A855F7' }} />
                      <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Pulse Rate</span>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                      {consultation.vitalSigns.pulseRate}
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280', marginLeft: '4px' }}>bpm</span>
                    </p>
                  </div>
                )}
                {consultation.vitalSigns.respiratoryRate && (
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.03) 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(16, 185, 129, 0.15)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Wind size={16} style={{ color: '#10B981' }} />
                      <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Respiratory Rate</span>
                    </div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                      {consultation.vitalSigns.respiratoryRate}
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280', marginLeft: '4px' }}>/min</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Question Card */}
            <div
              className="card animate-fade-in-up animation-delay-300 consultation-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.15) 0%, rgba(30, 58, 95, 0.05) 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={20} style={{ color: '#1E3A5F' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Clinical Question</h3>
              </div>
              <p style={{
                color: '#374151',
                fontSize: '15px',
                lineHeight: 1.8,
                padding: '20px',
                background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                borderRadius: '12px'
              }}>
                {consultation.clinicalQuestion}
              </p>
            </div>
          </div>

          {/* Right column - Response */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {consultation.status === ConsultationStatus.PENDING ? (
              <div
                className="animate-fade-in-up animation-delay-100 pending-response-card"
              >
                <div className="animate-bounce-subtle" style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <AlertTriangle size={40} style={{ color: '#F59E0B' }} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#92400E',
                  marginBottom: '12px'
                }}>
                  Awaiting Response
                </h3>
                <p style={{
                  color: '#B45309',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  maxWidth: '300px',
                  margin: '0 auto'
                }}>
                  The doctor has been notified and will respond as soon as possible.
                </p>
                <div style={{
                  marginTop: '24px',
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div className="animate-pulse-slow" style={{
                    width: '8px',
                    height: '8px',
                    background: '#F59E0B',
                    borderRadius: '50%'
                  }} />
                  <span style={{ fontSize: '13px', color: '#92400E', fontWeight: 500 }}>
                    Waiting for doctor...
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Care Pathway Card */}
                {pathwayInfo && (
                  <div
                    className="animate-fade-in-up animation-delay-100 care-pathway-card-detail"
                    style={{
                      background: pathwayInfo.bgColor,
                      border: `2px solid ${pathwayInfo.borderColor}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-50px',
                      right: '-50px',
                      width: '150px',
                      height: '150px',
                      background: pathwayInfo.bgColor,
                      borderRadius: '50%',
                      opacity: 0.5
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', position: 'relative' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        background: `linear-gradient(135deg, ${pathwayInfo.color}20 0%, ${pathwayInfo.color}10 100%)`,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <pathwayInfo.icon size={28} style={{ color: pathwayInfo.color }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginBottom: '4px' }}>Care Pathway</p>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: pathwayInfo.color }}>
                          {pathwayInfo.label}
                        </h3>
                      </div>
                    </div>
                    <p style={{
                      color: '#374151',
                      fontSize: '14px',
                      lineHeight: 1.7,
                      position: 'relative'
                    }}>
                      {pathwayInfo.description}
                    </p>
                  </div>
                )}

                {/* Specialist Response Card */}
                <div
                  className="card animate-fade-in-up animation-delay-200 consultation-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CheckCircle2 size={20} style={{ color: '#10B981' }} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Doctor Response</h3>
                  </div>

                  {/* Responder info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={22} style={{ color: 'white' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                        Dr. {consultation.respondedBy?.firstName} {consultation.respondedBy?.lastName}
                      </p>
                      {consultation.respondedAt && (
                        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                          {formatDate(consultation.respondedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '12px'
                    }}>
                      Recommendations
                    </h4>
                    <p style={{
                      color: '#374151',
                      fontSize: '14px',
                      lineHeight: 1.8,
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)',
                      borderRadius: '12px',
                      borderLeft: '3px solid #10B981'
                    }}>
                      {consultation.recommendations}
                    </p>
                  </div>

                  {/* Medication Instructions */}
                  {consultation.medicationInstructions && (
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '12px'
                      }}>
                        Medication Instructions
                      </h4>
                      <p style={{
                        color: '#374151',
                        fontSize: '14px',
                        lineHeight: 1.8,
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%)',
                        borderRadius: '12px',
                        borderLeft: '3px solid #3B82F6'
                      }}>
                        {consultation.medicationInstructions}
                      </p>
                    </div>
                  )}

                  {/* Follow-up Timeframe */}
                  {consultation.followUpTimeframe && (
                    <div style={{
                      padding: '20px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.03) 100%)',
                      borderRadius: '16px',
                      border: '1px solid rgba(168, 85, 247, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Clock size={22} style={{ color: '#A855F7' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginBottom: '4px' }}>
                          Follow-up Timeframe
                        </p>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#7C3AED' }}>
                          {consultation.followUpTimeframe}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Close Consultation Button - Only show for RESPONDED status */}
                {consultation.status === ConsultationStatus.RESPONDED && (
                  <div
                    className="card animate-fade-in-up animation-delay-300 consultation-card"
                    style={{ background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)' }}
                  >
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px'
                      }}>
                        Mark as Complete
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#6B7280',
                        lineHeight: 1.6
                      }}>
                        Once you've reviewed the doctor's response and taken appropriate action, you can close this consultation.
                      </p>
                    </div>
                    <button
                      onClick={handleCloseConsultation}
                      disabled={isClosing}
                      className="btn"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '14px 24px',
                        background: isClosing ? '#E5E7EB' : 'linear-gradient(135deg, #4B5563 0%, #374151 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: isClosing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isClosing ? 'none' : '0 4px 12px rgba(75, 85, 99, 0.3)',
                        opacity: isClosing ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isClosing) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(75, 85, 99, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isClosing) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 85, 99, 0.3)';
                        }
                      }}
                    >
                      <XCircle size={18} />
                      {isClosing ? 'Closing...' : 'Close Consultation'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Responsive styles for Consultation Detail */}
      <style>{`
        .consultation-detail-container {
          padding: 16px;
        }
        .consultation-header-card {
          padding: 16px;
          margin-bottom: 16px;
        }
        .consultation-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .consultation-card {
          padding: 16px;
        }
        .vitals-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .pending-response-card {
          padding: 32px 16px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%);
          border-radius: 16px;
          border: 2px solid rgba(245, 158, 11, 0.2);
          text-align: center;
        }
        .care-pathway-card-detail {
          padding: 20px 16px;
          border-radius: 16px;
        }

        @media (min-width: 640px) {
          .consultation-detail-container {
            padding: 20px;
          }
          .consultation-header-card {
            padding: 24px;
            margin-bottom: 20px;
          }
          .consultation-card {
            padding: 24px;
          }
          .vitals-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .pending-response-card {
            padding: 40px 24px;
          }
          .care-pathway-card-detail {
            padding: 24px;
          }
        }

        @media (min-width: 1024px) {
          .consultation-detail-container {
            padding: 24px 32px;
          }
          .consultation-header-card {
            padding: 28px 32px;
            margin-bottom: 24px;
          }
          .consultation-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          .consultation-card {
            padding: 28px 32px;
          }
          .pending-response-card {
            padding: 48px 32px;
          }
          .care-pathway-card-detail {
            padding: 28px 32px;
            border-radius: 20px;
          }
        }
      `}</style>
    </Layout>
  );
};
