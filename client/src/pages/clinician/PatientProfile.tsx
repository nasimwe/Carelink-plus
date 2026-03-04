import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Pill,
  Activity,
  Clock,
  Stethoscope,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { patientsAPI } from '../../services/api';
import { Patient, ConsultationStatus } from '../../types';

export const PatientProfile = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    diagnosis: true,
    treatment: true,
    sideEffects: true,
    warnings: true,
    followUp: true,
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (!code) return;
      try {
        const response = await patientsAPI.getByCode(code);
        setPatient(response.data.patient);
      } catch (error) {
        console.error('Failed to fetch patient:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatient();
  }, [code]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (!patient) {
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
            <User size={28} style={{ color: '#EF4444' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
            Patient Not Found
          </h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
            The patient profile could not be loaded.
          </p>
          <button
            onClick={() => navigate('/clinician/search')}
            className="btn btn-primary"
          >
            <ArrowLeft size={18} />
            Return to Search
          </button>
        </div>
      </Layout>
    );
  }

  const sections = [
    {
      id: 'diagnosis',
      title: 'Diagnosis Summary',
      icon: FileText,
      content: patient.diagnosisSummary,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      id: 'treatment',
      title: 'Treatment Summary',
      icon: Pill,
      content: patient.treatmentSummary,
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    ...(patient.expectedSideEffects ? [{
      id: 'sideEffects',
      title: 'Expected Side Effects',
      icon: Activity,
      content: patient.expectedSideEffects,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    }] : []),
    {
      id: 'followUp',
      title: 'Follow-up Instructions',
      icon: Clock,
      content: patient.followUpInstructions,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  return (
    <Layout>
      <div className="patient-profile-container">
        {/* Back button */}
        <button
          onClick={() => navigate('/clinician/search')}
          className="animate-fade-in btn btn-ghost"
          style={{ marginBottom: '16px', padding: '8px 0' }}
        >
          <ArrowLeft size={20} />
          Back to Search
        </button>

        {/* Patient header */}
        <div
          className="card animate-fade-in-up patient-header-card"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top gradient bar */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #1E3A5F 0%, #3B82F6 100%)'
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(30, 58, 95, 0.25)'
              }}>
                <User size={30} style={{ color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  {patient.patientCode}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  padding: '6px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  color: '#2563EB',
                  borderRadius: '20px'
                }}>
                  {patient.specialty}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/clinician/consultation/new/${patient.id}`)}
              className="btn btn-primary patient-action-btn"
            >
              <Plus size={18} />
              <span className="action-text">Start New Consultation</span>
              <span className="action-text-short">New Consult</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={18} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Discharged</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{formatDate(patient.dischargeDate)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={18} style={{ color: '#10B981' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Doctor</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Dr. {patient.specialist?.firstName} {patient.specialist?.lastName}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building size={18} style={{ color: '#A855F7' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Facility</p>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{patient.facility?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="card animate-fade-in-up"
              style={{
                overflow: 'hidden',
                animationDelay: `${(index + 1) * 100}ms`
              }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px',
                  background: expandedSections[section.id] ? 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)' : 'white',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: section.bgColor,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <section.icon size={20} style={{ color: section.color }} />
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>{section.title}</h3>
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#F3F4F6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}>
                  {expandedSections[section.id] ? (
                    <ChevronUp size={18} style={{ color: '#6B7280' }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: '#6B7280' }} />
                  )}
                </div>
              </button>
              {expandedSections[section.id] && (
                <div style={{
                  padding: '0 24px 24px 24px',
                  color: '#4B5563',
                  fontSize: '14px',
                  lineHeight: 1.8
                }}>
                  <div style={{
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                    borderRadius: '12px',
                    borderLeft: `3px solid ${section.color}`
                  }}>
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Warning Signs - Special styling */}
          <div
            className="animate-fade-in-up"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(239, 68, 68, 0.15)',
              overflow: 'hidden',
              animationDelay: `${(sections.length + 1) * 100}ms`
            }}
          >
            <button
              onClick={() => toggleSection('warnings')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={20} style={{ color: '#EF4444' }} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#991B1B', margin: 0 }}>Warning Signs</h3>
              </div>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {expandedSections.warnings ? (
                  <ChevronUp size={18} style={{ color: '#EF4444' }} />
                ) : (
                  <ChevronDown size={18} style={{ color: '#EF4444' }} />
                )}
              </div>
            </button>
            {expandedSections.warnings && (
              <div style={{ padding: '0 24px 24px 24px' }}>
                <div style={{
                  padding: '16px 20px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '12px',
                  borderLeft: '3px solid #EF4444',
                  color: '#991B1B',
                  fontSize: '14px',
                  lineHeight: 1.8
                }}>
                  {patient.warningSigns}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Consultation History */}
        {patient.consultations && patient.consultations.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, rgba(30, 58, 95, 0.15) 0%, rgba(30, 58, 95, 0.05) 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Stethoscope size={20} style={{ color: '#1E3A5F' }} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Consultation History</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {patient.consultations.map((consultation, index) => (
                <div
                  key={consultation.id}
                  onClick={() => navigate(`/clinician/consultation/${consultation.id}`)}
                  className="card consultation-history-card"
                  style={{
                    cursor: 'pointer',
                    animationDelay: `${(index + 1) * 50}ms`
                  }}
                >
                  <div className="consultation-history-inner">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                        {formatDate(consultation.createdAt)}
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#374151',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {consultation.clinicalQuestion}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 500,
                        borderRadius: '16px',
                        background: consultation.status === ConsultationStatus.PENDING
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)'
                          : consultation.status === ConsultationStatus.RESPONDED
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.1) 100%)',
                        color: consultation.status === ConsultationStatus.PENDING
                          ? '#D97706'
                          : consultation.status === ConsultationStatus.RESPONDED
                          ? '#059669'
                          : '#4B5563'
                      }}>
                        {consultation.status}
                      </span>
                      <ArrowRight size={16} style={{ color: '#9CA3AF' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Responsive styles for Patient Profile */}
      <style>{`
        .patient-profile-container {
          padding: 16px;
        }
        .patient-header-card {
          padding: 16px;
          margin-bottom: 16px;
        }
        .patient-action-btn {
          padding: 10px 16px;
          width: 100%;
          margin-top: 16px;
        }
        .action-text {
          display: none;
        }
        .action-text-short {
          display: inline;
        }
        .consultation-history-card {
          padding: 14px 16px;
        }
        .consultation-history-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (min-width: 480px) {
          .action-text {
            display: inline;
          }
          .action-text-short {
            display: none;
          }
          .patient-action-btn {
            width: auto;
            margin-top: 0;
          }
          .consultation-history-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
        }

        @media (min-width: 640px) {
          .patient-profile-container {
            padding: 20px;
          }
          .patient-header-card {
            padding: 24px;
            margin-bottom: 20px;
          }
          .patient-action-btn {
            padding: 14px 24px;
          }
          .consultation-history-card {
            padding: 18px 20px;
          }
        }

        @media (min-width: 1024px) {
          .patient-profile-container {
            padding: 24px 32px;
          }
          .patient-header-card {
            padding: 28px 32px;
            margin-bottom: 24px;
          }
          .consultation-history-card {
            padding: 20px 24px;
          }
        }
      `}</style>
    </Layout>
  );
};
