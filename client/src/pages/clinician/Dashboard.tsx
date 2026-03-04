import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Clock, CheckCircle, FileText, Activity, ArrowRight, ChevronRight } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { consultationsAPI } from '../../services/api';
import { Consultation, DashboardStats, ConsultationStatus, UrgencyLevel } from '../../types';

export const ClinicianDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({});
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, consultationsRes] = await Promise.all([
          consultationsAPI.getStats(),
          consultationsAPI.getAll({ limit: 10 }),
        ]);
        setStats(statsRes.data.stats);
        setConsultations(consultationsRes.data.consultations);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusConfig = (status: ConsultationStatus) => {
    const configs = {
      [ConsultationStatus.PENDING]: { bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', color: '#D97706', label: 'Pending' },
      [ConsultationStatus.RESPONDED]: { bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)', color: '#059669', label: 'Responded' },
      [ConsultationStatus.CLOSED]: { bg: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', color: '#4F46E5', label: 'Closed' },
    };
    return configs[status];
  };

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
          className="animate-fade-in-down welcome-banner"
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
          }}
        >
          <h1 className="welcome-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Clinical Officer Dashboard</h1>
          <div className="welcome-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
              <span style={{ width: '6px', height: '6px', background: '#10B981', borderRadius: '50%' }}></span>
              {user?.facility?.name}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem' }}>Welcome back, {user?.firstName}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="animate-fade-in-up responsive-grid-2"
          style={{
            animationDelay: '100ms'
          }}
        >
          <button
            onClick={() => navigate('/clinician/search')}
            className="action-card quick-action-btn"
          >
            <div className="action-icon" style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px -5px rgba(59, 130, 246, 0.4)',
              flexShrink: 0,
            }}>
              <Search style={{ color: 'white' }} size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px 0', fontSize: '0.9375rem' }}>Search Patient</h3>
              <p className="hide-mobile" style={{ color: '#6B7280', margin: 0, fontSize: '0.8125rem' }}>Find a patient by code</p>
            </div>
            <ArrowRight className="hide-mobile" style={{ color: '#9CA3AF', flexShrink: 0 }} size={18} />
          </button>

          <button
            onClick={() => navigate('/clinician/search')}
            className="action-card quick-action-btn"
          >
            <div className="action-icon" style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.4)',
              flexShrink: 0,
            }}>
              <Plus style={{ color: 'white' }} size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px 0', fontSize: '0.9375rem' }}>New Consultation</h3>
              <p className="hide-mobile" style={{ color: '#6B7280', margin: 0, fontSize: '0.8125rem' }}>Submit a consultation request</p>
            </div>
            <ArrowRight className="hide-mobile" style={{ color: '#9CA3AF', flexShrink: 0 }} size={18} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="responsive-grid-3">
          {[
            { icon: Clock, label: 'Awaiting Response', value: stats.pending || 0, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', bgColor: '#FEF3C7' },
            { icon: CheckCircle, label: 'Responded', value: stats.responded || 0, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', bgColor: '#D1FAE5' },
            { icon: FileText, label: 'Closed This Week', value: stats.closedThisWeek || 0, gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', bgColor: '#DBEAFE' },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card animate-fade-in-up"
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                animationDelay: `${(index + 2) * 100}ms`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div className="stat-icon" style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: stat.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <stat.icon style={{ color: 'white' }} size={18} />
                </div>
              </div>
              <p className="stat-label" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 500, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{stat.label}</p>
              <p className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Consultations */}
        <div
          className="animate-fade-in-up"
          style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            animationDelay: '500ms'
          }}
        >
          {/* Header */}
          <div className="section-header" style={{
            padding: '16px',
            borderBottom: '1px solid #F3F4F6',
            background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 auto', minWidth: 0 }}>
              <div className="section-icon" style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileText style={{ color: 'white' }} size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 className="section-title" style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: '0 0 2px 0' }}>Recent Consultations</h3>
                <p className="hide-mobile section-subtitle" style={{ color: '#6B7280', fontSize: '0.8125rem', margin: 0 }}>Your latest consultation requests</p>
              </div>
            </div>
            {consultations.length > 0 && (
              <button
                onClick={() => navigate('/clinician/consultations')}
                className="btn btn-secondary view-all-btn"
                style={{ padding: '8px 12px', fontSize: '13px', flexShrink: 0 }}
              >
                View all
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Content */}
          <div>
            {consultations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <Activity size={24} style={{ color: '#9CA3AF' }} />
                </div>
                <p style={{ fontWeight: 600, color: '#374151', marginBottom: '4px', fontSize: '0.9375rem' }}>No consultations yet</p>
                <p style={{ color: '#6B7280', fontSize: '0.8125rem' }}>Search for a patient to submit your first consultation</p>
              </div>
            ) : (
              consultations.map((consultation) => {
                const statusConfig = getStatusConfig(consultation.status);
                const urgencyConfig = getUrgencyConfig(consultation.urgencyLevel);

                return (
                  <div
                    key={consultation.id}
                    onClick={() => navigate(`/clinician/consultation/${consultation.id}`)}
                    className="consultation-row"
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #F3F4F6',
                      cursor: 'pointer',
                      borderLeft: `3px solid ${urgencyConfig.border}`,
                      transition: 'all 0.2s ease',
                      background: consultation.urgencyLevel === UrgencyLevel.EMERGENCY
                        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, transparent 100%)'
                        : consultation.urgencyLevel === UrgencyLevel.URGENT
                        ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%)'
                        : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badges Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <span className="patient-code-badge" style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#374151',
                            background: '#F3F4F6',
                            padding: '3px 8px',
                            borderRadius: '4px',
                          }}>
                            {consultation.patient?.patientCode}
                          </span>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: statusConfig.bg,
                            color: statusConfig.color,
                          }}>
                            {statusConfig.label}
                          </span>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: urgencyConfig.bg,
                            color: urgencyConfig.color,
                          }}>
                            {urgencyConfig.label}
                          </span>
                        </div>

                        {/* Clinical Question */}
                        <p className="clinical-question" style={{
                          fontSize: '0.875rem',
                          color: '#4B5563',
                          margin: '0 0 6px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {consultation.clinicalQuestion}
                        </p>

                        {/* Timestamp */}
                        <p style={{ color: '#9CA3AF', fontSize: '0.75rem', margin: 0, fontWeight: 500 }}>
                          Submitted {formatTimeAgo(consultation.createdAt)}
                        </p>
                      </div>

                      {/* Care Pathway (if responded) - hidden on mobile */}
                      {consultation.status === ConsultationStatus.RESPONDED && consultation.carePathway && (
                        <div className="hide-mobile" style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ color: '#9CA3AF', fontSize: '0.6875rem', margin: '0 0 2px 0' }}>Care Pathway</p>
                          <p style={{
                            color: '#1E3A5F',
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            margin: 0,
                            textTransform: 'capitalize',
                          }}>
                            {consultation.carePathway.replace('_', ' ')}
                          </p>
                        </div>
                      )}

                      <ChevronRight size={16} style={{ color: '#D1D5DB', flexShrink: 0, marginTop: '2px' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Responsive styles for Clinician Dashboard */}
      <style>{`
        @media (min-width: 640px) {
          .welcome-banner {
            padding: 24px !important;
          }
          .welcome-title {
            font-size: 1.5rem !important;
          }
          .stat-card {
            padding: 20px !important;
            border-radius: 20px !important;
          }
          .stat-icon {
            width: 48px !important;
            height: 48px !important;
          }
          .stat-value {
            font-size: 2rem !important;
          }
          .section-header {
            padding: 20px !important;
          }
          .section-icon {
            width: 48px !important;
            height: 48px !important;
          }
          .section-title {
            font-size: 1.125rem !important;
          }
          .consultation-row {
            padding: 18px 20px !important;
          }
          .action-icon {
            width: 56px !important;
            height: 56px !important;
          }
        }
        @media (min-width: 1024px) {
          .section-header {
            padding: 24px !important;
          }
          .consultation-row {
            padding: 20px 24px !important;
          }
        }
      `}</style>
    </Layout>
  );
};
