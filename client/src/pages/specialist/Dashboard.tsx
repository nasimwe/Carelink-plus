import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, CheckCircle, Users, AlertCircle, ArrowRight, FileText, Activity, ChevronRight, ChevronDown, X, MapPin, Calendar } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { consultationsAPI, patientsAPI } from '../../services/api';
import { Consultation, DashboardStats, ConsultationStatus, UrgencyLevel, Patient } from '../../types';

export const SpecialistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({});
  const [pendingConsultations, setPendingConsultations] = useState<Consultation[]>([]);
  const [recentResponses, setRecentResponses] = useState<Consultation[]>([]);
  const [myPatients, setMyPatients] = useState<Patient[]>([]);
  const [showPatients, setShowPatients] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pendingRes, respondedRes, patientsRes] = await Promise.all([
          consultationsAPI.getStats(),
          consultationsAPI.getAll({ status: ConsultationStatus.PENDING, limit: 10 }),
          consultationsAPI.getAll({ status: ConsultationStatus.RESPONDED, limit: 5 }),
          patientsAPI.getMyPatients(1, 50),
        ]);
        setStats(statsRes.data.stats);
        setPendingConsultations(pendingRes.data.consultations);
        setRecentResponses(respondedRes.data.consultations);
        setMyPatients(patientsRes.data.patients || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUrgencyConfig = (urgency: UrgencyLevel) => {
    const configs = {
      [UrgencyLevel.EMERGENCY]: { bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)', color: '#DC2626', border: '#EF4444', label: 'Emergency' },
      [UrgencyLevel.URGENT]: { bg: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)', color: '#EA580C', border: '#F97316', label: 'Urgent' },
      [UrgencyLevel.ROUTINE]: { bg: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', color: '#2563EB', border: '#3B82F6', label: 'Routine' },
    };
    return configs[urgency];
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  // Sort pending consultations by urgency
  const sortedPending = [...pendingConsultations].sort((a, b) => {
    const urgencyOrder = { [UrgencyLevel.EMERGENCY]: 0, [UrgencyLevel.URGENT]: 1, [UrgencyLevel.ROUTINE]: 2 };
    return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
  });

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Welcome Banner */}
        <div
          className="animate-fade-in-down specialist-welcome-banner"
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h1 className="specialist-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Doctor Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                }}
              >
                {user?.specialty}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem' }}>Welcome back, Dr. {user?.firstName}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/specialist/discharge/new')}
            className="discharge-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
            }}
          >
            <Plus size={16} />
            <span className="discharge-btn-text">Create Discharge Profile</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="responsive-grid-4">
          {[
            { icon: AlertCircle, label: 'Pending', value: stats.pending || 0, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', bgColor: '#FEF3C7', hasPulse: (stats.pending || 0) > 0, clickable: false },
            { icon: CheckCircle, label: 'Responded Today', value: stats.respondedToday || 0, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', bgColor: '#D1FAE5', clickable: false },
            { icon: Clock, label: 'Avg Response', value: `${stats.avgResponseTime || 0}h`, gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', bgColor: '#DBEAFE', clickable: false },
            { icon: Users, label: 'Total Patients', value: stats.totalPatients || 0, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', bgColor: '#EDE9FE', clickable: true },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card animate-fade-in-up specialist-stat-card"
              onClick={stat.clickable ? () => setShowPatients(!showPatients) : undefined}
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '14px',
                border: stat.clickable && showPatients ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                animationDelay: `${index * 50}ms`,
                cursor: stat.clickable ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div className="specialist-stat-icon" style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: stat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <stat.icon style={{ color: 'white' }} size={16} />
                </div>
                {stat.hasPulse && (
                  <span style={{
                    width: '8px',
                    height: '8px',
                    background: '#F59E0B',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                  }}></span>
                )}
                {stat.clickable && (
                  <ChevronDown
                    size={14}
                    style={{
                      color: '#8B5CF6',
                      transition: 'transform 0.2s ease',
                      transform: showPatients ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                )}
              </div>
              <p className="specialist-stat-label" style={{ color: '#6B7280', fontSize: '0.6875rem', fontWeight: 500, margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{stat.label}</p>
              <p className="specialist-stat-value" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* My Patients Panel */}
        {showPatients && (
          <div
            className="animate-fade-in-up"
            style={{
              background: 'white',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #F3F4F6',
              background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Users style={{ color: 'white' }} size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: '0 0 2px 0' }}>My Patients</h3>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Discharge profiles you have created</p>
                </div>
              </div>
              <button
                onClick={() => setShowPatients(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6B7280',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Patient List */}
            {myPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#F3F4F6', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <Users size={28} style={{ color: '#9CA3AF' }} />
                </div>
                <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px 0' }}>No patients yet</p>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Patients you create discharge profiles for will appear here</p>
              </div>
            ) : (
              myPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/specialist/patient/${patient.id}`)}
                  style={{
                    padding: '16px 24px',
                    borderBottom: index < myPatients.length - 1 ? '1px solid #F3F4F6' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    {/* Avatar */}
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)',
                      border: '1px solid #C4B5FD',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#7C3AED' }}>
                        {patient.patientCode.slice(-2)}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700,
                          color: '#374151', background: '#F3F4F6',
                          padding: '2px 8px', borderRadius: '6px',
                        }}>
                          {patient.patientCode}
                        </span>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 500, color: '#7C3AED',
                          background: '#EDE9FE', padding: '2px 8px', borderRadius: '20px',
                        }}>
                          {patient.specialty}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.875rem', color: '#6B7280', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {patient.diagnosisSummary}
                      </p>
                    </div>
                  </div>

                  <div className="patient-meta hide-mobile" style={{ display: 'none', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    {patient.facility && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9CA3AF', fontSize: '0.75rem' }}>
                        <MapPin size={12} />
                        <span>{patient.facility.name}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9CA3AF', fontSize: '0.75rem' }}>
                      <Calendar size={12} />
                      <span>{new Date(patient.dischargeDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                </div>
              ))
            )}
          </div>
        )}

        {/* Pending Consultations */}
        <div
          className="animate-fade-in-up pending-section"
          style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            animationDelay: '200ms'
          }}
        >
          <div className="pending-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertCircle style={{ color: 'white' }} size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>Pending Consultations</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Sorted by urgency level</p>
              </div>
            </div>
            {sortedPending.length > 0 && (
              <span className="pending-badge">
                <span style={{ width: '6px', height: '6px', background: '#F59E0B', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                {sortedPending.length} awaiting
              </span>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {sortedPending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <CheckCircle size={32} style={{ color: '#10B981' }} />
                </div>
                <p style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '1rem' }}>All caught up!</p>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>No pending consultations at the moment</p>
              </div>
            ) : (
              sortedPending.map((consultation) => {
                const urgencyConfig = getUrgencyConfig(consultation.urgencyLevel);
                return (
                  <div
                    key={consultation.id}
                    onClick={() => navigate(`/specialist/consultation/${consultation.id}`)}
                    className="pending-consultation-card"
                    style={{
                      borderLeft: `4px solid ${urgencyConfig.border}`,
                      background: consultation.urgencyLevel === UrgencyLevel.EMERGENCY
                        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)'
                        : consultation.urgencyLevel === UrgencyLevel.URGENT
                        ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)'
                        : 'transparent',
                    }}
                  >
                    <div className="pending-consultation-inner">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#374151',
                            background: '#F3F4F6',
                            padding: '4px 8px',
                            borderRadius: '6px',
                          }}>
                            {consultation.patient?.patientCode}
                          </span>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: urgencyConfig.bg,
                            color: urgencyConfig.color,
                          }}>
                            {urgencyConfig.label}
                          </span>
                        </div>
                        <p className="pending-question">
                          {consultation.clinicalQuestion}
                        </p>
                        <p className="pending-meta">
                          From: <span style={{ color: '#6B7280' }}>{consultation.facility?.name}</span> &bull; {formatTimeAgo(consultation.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/specialist/consultation/${consultation.id}/respond`);
                        }}
                        className="btn btn-primary respond-btn"
                      >
                        <span className="respond-text-full">Respond</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Responses */}
        <div
          className="animate-fade-in-up"
          style={{
            background: 'white',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            animationDelay: '300ms'
          }}
        >
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #F3F4F6',
            background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText style={{ color: 'white' }} size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>Recent Responses</h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Your latest consultations</p>
            </div>
          </div>

          <div>
            {recentResponses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Activity size={32} style={{ color: '#9CA3AF' }} />
                </div>
                <p style={{ fontWeight: 600, color: '#374151', marginBottom: '8px', fontSize: '1rem' }}>No recent responses</p>
                <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Your completed consultations will appear here</p>
              </div>
            ) : (
              recentResponses.map((consultation) => (
                <div
                  key={consultation.id}
                  onClick={() => navigate(`/specialist/consultation/${consultation.id}`)}
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={18} style={{ color: '#10B981' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#374151',
                            background: '#F3F4F6',
                            padding: '3px 8px',
                            borderRadius: '4px',
                          }}>
                            {consultation.patient?.patientCode}
                          </span>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                            color: '#059669',
                          }}>
                            Responded
                          </span>
                        </div>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize' }}>
                          <span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }}></span>
                          {consultation.carePathway?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#D1D5DB' }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Responsive styles for Specialist Dashboard */}
      <style>{`
        /* Mobile-first styles for pending consultations */
        .pending-section {
          border-radius: 16px;
        }
        .pending-header {
          padding: 16px;
          border-bottom: 1px solid #F3F4F6;
          background: linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pending-badge {
          display: flex;
          align-items: center;
          gap: '8px';
          padding: 6px 12px;
          border-radius: 20px;
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          color: #D97706;
          font-size: 12px;
          font-weight: 500;
          width: fit-content;
        }
        .pending-consultation-card {
          padding: 14px 16px;
          border-bottom: 1px solid #F3F4F6;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pending-consultation-inner {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pending-question {
          font-size: 0.875rem;
          color: #4B5563;
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pending-meta {
          color: #9CA3AF;
          font-size: 0.75rem;
          margin: 0;
          font-weight: 500;
        }
        .respond-btn {
          padding: 10px 14px;
          font-size: 13px;
          width: 100%;
          justify-content: center;
        }
        .respond-text-full {
          display: inline;
        }

        @media (min-width: 480px) {
          .pending-consultation-inner {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
          }
          .respond-btn {
            width: auto;
            flex-shrink: 0;
          }
        }

        @media (min-width: 640px) {
          .pending-section {
            border-radius: 24px;
          }
          .pending-header {
            padding: 20px 24px;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .pending-consultation-card {
            padding: 18px 24px;
          }
          .pending-question {
            font-size: 0.9375rem;
          }
          .pending-meta {
            font-size: 0.8125rem;
          }
          .specialist-welcome-banner {
            padding: 24px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .specialist-welcome-banner > div:first-child {
            margin-bottom: 0 !important;
          }
          .discharge-btn {
            width: auto !important;
            padding: 14px 24px !important;
          }
          .specialist-title {
            font-size: 1.5rem !important;
          }
          .specialist-stat-card {
            padding: 20px !important;
            border-radius: 20px !important;
          }
          .specialist-stat-icon {
            width: 44px !important;
            height: 44px !important;
          }
          .specialist-stat-value {
            font-size: 1.5rem !important;
          }
          .patient-meta {
            display: flex !important;
          }
          .respond-btn {
            padding: 10px 16px;
            font-size: 14px;
          }
        }

        @media (min-width: 1024px) {
          .pending-consultation-card {
            padding: 20px 24px;
          }
        }

        @media (max-width: 480px) {
          .discharge-btn-text {
            display: none;
          }
          .discharge-btn::after {
            content: 'New Discharge';
          }
        }
      `}</style>
    </Layout>
  );
};
