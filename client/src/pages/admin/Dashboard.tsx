import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, FileText, Activity, TrendingUp, ArrowRight, BarChart3, PieChart } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';

interface Analytics {
  overview: {
    totalUsers: number;
    totalFacilities: number;
    totalPatients: number;
    totalConsultations: number;
    pendingConsultations: number;
    respondedConsultations: number;
  };
  usersByRole: Array<{ role: string; count: string }>;
  consultationsByUrgency: Array<{ urgencyLevel: string; count: string }>;
  consultationsByCarePathway: Array<{ carePathway: string; count: string }>;
  monthlyTrend: Array<{ month: string; count: string }>;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await adminAPI.getAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'specialist': return { bg: '#3B82F6', light: '#EFF6FF' };
      case 'clinician': return { bg: '#10B981', light: '#ECFDF5' };
      case 'administrator': return { bg: '#8B5CF6', light: '#F5F3FF' };
      default: return { bg: '#6B7280', light: '#F9FAFB' };
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return { bg: '#EF4444', light: '#FEF2F2' };
      case 'urgent': return { bg: '#F59E0B', light: '#FFFBEB' };
      case 'routine': return { bg: '#3B82F6', light: '#EFF6FF' };
      default: return { bg: '#6B7280', light: '#F9FAFB' };
    }
  };

  const getCarePathwayLabel = (pathway: string) => {
    const labels: Record<string, string> = {
      'home_care': 'Home Care',
      'local_clinic': 'Local Clinic',
      'district_referral': 'District Referral',
      'urgent_transfer': 'Urgent Transfer',
    };
    return labels[pathway] || pathway;
  };

  const getCarePathwayColor = (pathway: string) => {
    switch (pathway) {
      case 'home_care': return '#10B981';
      case 'local_clinic': return '#3B82F6';
      case 'district_referral': return '#F59E0B';
      case 'urgent_transfer': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
          <div className="loading-spinner" />
        </div>
      </Layout>
    );
  }

  const stats = [
    { icon: Users, label: 'Users', value: analytics?.overview.totalUsers || 0, color: '#2563EB', bgColor: '#EFF6FF' },
    { icon: Building2, label: 'Facilities', value: analytics?.overview.totalFacilities || 0, color: '#7C3AED', bgColor: '#F5F3FF' },
    { icon: FileText, label: 'Patients', value: analytics?.overview.totalPatients || 0, color: '#059669', bgColor: '#ECFDF5' },
    { icon: Activity, label: 'Consultations', value: analytics?.overview.totalConsultations || 0, color: '#4F46E5', bgColor: '#EEF2FF' },
    { icon: TrendingUp, label: 'Pending', value: analytics?.overview.pendingConsultations || 0, color: '#D97706', bgColor: '#FFFBEB' },
    { icon: PieChart, label: 'Responded', value: analytics?.overview.respondedConsultations || 0, color: '#0D9488', bgColor: '#F0FDFA' },
  ];

  const quickActions = [
    { icon: Users, title: 'User Management', desc: 'Add, edit, or deactivate users', path: '/admin/users', color: '#1E3A5F' },
    { icon: Building2, title: 'Facility Management', desc: 'Manage healthcare facilities', path: '/admin/facilities', color: '#2C5282' },
    { icon: Activity, title: 'Reports & Analytics', desc: 'View detailed reports', path: '/admin/reports', color: '#1E3A5F' },
  ];

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Welcome Banner */}
        <div
          className="animate-fade-in-down admin-welcome-banner"
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
            borderRadius: '16px',
            padding: '20px',
            color: 'white',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <h1 className="admin-title" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Administrator Dashboard</h1>
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
                System Admin
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem' }}>Welcome back, {user?.firstName}</span>
            </div>
          </div>

          {/* Executive Dashboard Button */}
          <button
            onClick={() => navigate('/admin/executive')}
            className="exec-btn"
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
            Executive Overview
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="responsive-grid-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="card animate-fade-in-up admin-stat-card"
              style={{
                padding: '14px',
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: stat.bgColor,
                    color: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <stat.icon size={16} />
                </div>
              </div>
              <p style={{ fontSize: '0.6875rem', color: '#6B7280', marginBottom: '2px' }}>{stat.label}</p>
              <p className="admin-stat-value" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div
          className="animate-fade-in-up responsive-grid-3"
          style={{
            animationDelay: '300ms',
          }}
        >
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.path)}
                className="card admin-action-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  width: '100%',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  className="admin-action-icon"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: action.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <action.icon size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 600, color: '#111827', marginBottom: '2px', fontSize: '0.9375rem' }}>{action.title}</h3>
                  <p className="hide-mobile" style={{ fontSize: '0.8125rem', color: '#6B7280' }}>{action.desc}</p>
                </div>
                <ArrowRight size={16} style={{ color: '#D1D5DB', flexShrink: 0 }} />
              </button>
            ))}
        </div>

        {/* Charts Grid */}
        <div className="responsive-grid-2">
          {/* Users by Role */}
          <div
            className="card animate-fade-in-up"
            style={{ overflow: 'hidden', animationDelay: '400ms' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px',
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, color: '#111827' }}>Users by Role</h3>
                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Distribution across roles</p>
              </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {analytics?.usersByRole.map((item) => {
                const total = analytics.usersByRole.reduce((acc, i) => acc + parseInt(i.count), 0);
                const percentage = total > 0 ? (parseInt(item.count) / total) * 100 : 0;
                const colors = getRoleColor(item.role);
                return (
                  <div key={item.role}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>{item.role}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{item.count}</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: colors.light, borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: colors.bg,
                          borderRadius: '9999px',
                          transition: 'all 0.5s ease',
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consultations by Urgency */}
          <div
            className="card animate-fade-in-up"
            style={{ overflow: 'hidden', animationDelay: '500ms' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px',
                borderBottom: '1px solid #F3F4F6',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#F59E0B',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, color: '#111827' }}>Consultations by Urgency</h3>
                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Priority level breakdown</p>
              </div>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {analytics?.consultationsByUrgency.map((item) => {
                const total = analytics.consultationsByUrgency.reduce((acc, i) => acc + parseInt(i.count), 0);
                const percentage = total > 0 ? (parseInt(item.count) / total) * 100 : 0;
                const colors = getUrgencyColor(item.urgencyLevel);
                return (
                  <div key={item.urgencyLevel}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>{item.urgencyLevel}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{item.count}</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: colors.light, borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: colors.bg,
                          borderRadius: '9999px',
                          transition: 'all 0.5s ease',
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Care Pathway Distribution */}
        <div
          className="card animate-fade-in-up"
          style={{ overflow: 'hidden', animationDelay: '600ms' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '20px',
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#10B981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PieChart size={18} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, color: '#111827' }}>Care Pathway Distribution</h3>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Recommendations by pathway type</p>
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <div className="responsive-grid-4">
              {analytics?.consultationsByCarePathway.map((item, index) => (
                <div
                  key={item.carePathway}
                  className="animate-fade-in-up care-pathway-card"
                  style={{
                    textAlign: 'center',
                    padding: '14px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '10px',
                    animationDelay: `${600 + index * 100}ms`,
                    transition: 'background-color 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <div
                    className="care-pathway-icon"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: getCarePathwayColor(item.carePathway),
                      borderRadius: '10px',
                      margin: '0 auto 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>{item.count}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>{getCarePathwayLabel(item.carePathway)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive styles for Admin Dashboard */}
      <style>{`
        @media (min-width: 640px) {
          .admin-welcome-banner {
            padding: 24px !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .admin-welcome-banner > div:first-child {
            margin-bottom: 0 !important;
          }
          .exec-btn {
            width: auto !important;
            padding: 14px 24px !important;
          }
          .admin-title {
            font-size: 1.5rem !important;
          }
          .admin-stat-card {
            padding: 20px !important;
          }
          .admin-stat-value {
            font-size: 1.25rem !important;
          }
          .admin-action-card {
            padding: 20px !important;
          }
          .admin-action-icon {
            width: 48px !important;
            height: 48px !important;
          }
          .care-pathway-card {
            padding: 16px !important;
          }
          .care-pathway-icon {
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </Layout>
  );
};
