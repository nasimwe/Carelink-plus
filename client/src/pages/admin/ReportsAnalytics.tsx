import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Download } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (params?: { startDate?: string; endDate?: string }) => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getAnalytics(params);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAnalytics({ startDate: startDate || undefined, endDate: endDate || undefined });
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchAnalytics();
  };

  const getMonthLabel = (isoMonth: string) => {
    const date = new Date(isoMonth);
    return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  };

  const maxMonthlyCount = analytics?.monthlyTrend.length
    ? Math.max(...analytics.monthlyTrend.map((m) => parseInt(m.count)))
    : 1;

  const totalUrgency = analytics?.consultationsByUrgency.reduce((acc, i) => acc + parseInt(i.count), 0) || 0;
  const totalPathway = analytics?.consultationsByCarePathway.reduce((acc, i) => acc + parseInt(i.count), 0) || 0;
  const totalRoles = analytics?.usersByRole.reduce((acc, i) => acc + parseInt(i.count), 0) || 0;

  const responseRate = analytics
    ? analytics.overview.totalConsultations > 0
      ? Math.round((analytics.overview.respondedConsultations / analytics.overview.totalConsultations) * 100)
      : 0
    : 0;

  const urgencyConfig: Record<string, { color: string; label: string }> = {
    emergency: { color: '#EF4444', label: 'Emergency' },
    urgent:    { color: '#F97316', label: 'Urgent' },
    routine:   { color: '#1E3A5F', label: 'Routine' },
  };

  const pathwayConfig: Record<string, { label: string }> = {
    home_care:        { label: 'Home Care' },
    local_clinic:     { label: 'Local Clinic' },
    district_referral:{ label: 'District Referral' },
    urgent_transfer:  { label: 'Urgent Transfer' },
  };

  const roleConfig: Record<string, { label: string }> = {
    specialist:    { label: 'Doctors' },
    clinician:     { label: 'Clinical Officers' },
    administrator: { label: 'Administrators' },
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
      <div className="reports-container">

        {/* Back button */}
        <button onClick={() => navigate('/admin')} className="btn btn-ghost group animate-fade-in">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="animate-fade-in-down reports-header">
          <div>
            <h1 className="reports-title">Reports & Analytics</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0 }}>
              System performance and usage insights
            </p>
          </div>
          <div className="reports-rate">
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Response Rate</p>
            <p className="rate-value">{responseRate}%</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="card animate-fade-in-up" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} style={{ color: '#6B7280' }} />
              <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>Date Range</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', color: '#6B7280' }}>From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: 'white', cursor: 'pointer' }}
                  onFocus={(e) => { e.target.style.borderColor = '#1E3A5F'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', color: '#6B7280' }}>To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: 'white', cursor: 'pointer' }}
                  onFocus={(e) => { e.target.style.borderColor = '#1E3A5F'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
                />
              </div>
              <button
                onClick={handleFilter}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.875rem' }}
              >
                Apply
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={handleClearFilter}
                  className="btn btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '0.875rem' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        {analytics && (
          <div className="reports-stats-grid">
            {[
              { label: 'Active Users',       value: analytics.overview.totalUsers },
              { label: 'Active Facilities',  value: analytics.overview.totalFacilities },
              { label: 'Total Patients',     value: analytics.overview.totalPatients },
              { label: 'Consultations',      value: analytics.overview.totalConsultations },
              { label: 'Pending',            value: analytics.overview.pendingConsultations },
              { label: 'Responded',          value: analytics.overview.respondedConsultations },
            ].map((card, i) => (
              <div
                key={card.label}
                className="card animate-fade-in-up"
                style={{ padding: '20px', animationDelay: `${i * 40}ms` }}
              >
                <p style={{ color: '#6B7280', fontSize: '0.6875rem', fontWeight: 600, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0 }}>{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Monthly Trend */}
        <div className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>
                Monthly Consultation Trend
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Last 6 months</p>
            </div>
            <button
              onClick={() => {
                const rows = analytics?.monthlyTrend.map(m => `${getMonthLabel(m.month)},${m.count}`).join('\n') || '';
                const csv = `Month,Consultations\n${rows}`;
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'monthly_trend.csv'; a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                background: 'white',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#9CA3AF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>

          <div style={{ padding: '28px 24px' }}>
            {analytics?.monthlyTrend && analytics.monthlyTrend.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px' }}>
                {analytics.monthlyTrend.map((item, index) => {
                  const count = parseInt(item.count);
                  const heightPercent = maxMonthlyCount > 0 ? (count / maxMonthlyCount) * 100 : 0;
                  return (
                    <div
                      key={item.month}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    >
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>{count}</span>
                      <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'flex-end', borderRadius: '6px', background: '#F3F4F6' }}>
                        <div
                          style={{
                            width: '100%',
                            height: `${Math.max(heightPercent, 3)}%`,
                            background: '#1E3A5F',
                            borderRadius: '6px',
                            transition: `height 0.5s ease ${index * 60}ms`,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {getMonthLabel(item.month)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#9CA3AF', padding: '32px 0', fontSize: '0.875rem' }}>No trend data available</p>
            )}
          </div>
        </div>

        {/* Urgency & Users by Role */}
        <div className="reports-two-col">

          {/* Consultations by Urgency */}
          <div className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>Consultations by Urgency</h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>{totalUrgency} total</p>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {analytics?.consultationsByUrgency.length ? (
                analytics.consultationsByUrgency.map((item) => {
                  const cfg = urgencyConfig[item.urgencyLevel] || { color: '#6B7280', label: item.urgencyLevel };
                  const pct = totalUrgency > 0 ? Math.round((parseInt(item.count) / totalUrgency) * 100) : 0;
                  return (
                    <div key={item.urgencyLevel}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ color: '#374151', fontWeight: 500, fontSize: '0.9375rem' }}>{cfg.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>{pct}%</span>
                          <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem', minWidth: '24px', textAlign: 'right' }}>{item.count}</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: '3px', transition: 'width 0.5s ease', opacity: 0.8 }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem', padding: '16px 0' }}>No data available</p>
              )}
            </div>
          </div>

          {/* Users by Role */}
          <div className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>Users by Role</h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>{totalRoles} active users</p>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {analytics?.usersByRole.length ? (
                analytics.usersByRole.map((item) => {
                  const cfg = roleConfig[item.role] || { label: item.role };
                  const pct = totalRoles > 0 ? Math.round((parseInt(item.count) / totalRoles) * 100) : 0;
                  return (
                    <div key={item.role}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: '#374151', fontWeight: 500, fontSize: '0.9375rem' }}>{cfg.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>{pct}%</span>
                          <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem', minWidth: '24px', textAlign: 'right' }}>{item.count}</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#1E3A5F', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem', padding: '16px 0' }}>No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Care Pathway Distribution */}
        <div className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>Care Pathway Distribution</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>{totalPathway} consultations with pathways assigned</p>
          </div>
          <div style={{ padding: '24px' }}>
            {analytics?.consultationsByCarePathway.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {analytics.consultationsByCarePathway.map((item) => {
                  const cfg = pathwayConfig[item.carePathway] || { label: item.carePathway.replace(/_/g, ' ') };
                  const pct = totalPathway > 0 ? Math.round((parseInt(item.count) / totalPathway) * 100) : 0;
                  return (
                    <div
                      key={item.carePathway}
                      style={{
                        padding: '20px',
                        background: '#F9FAFB',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      <p style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>{item.count}</p>
                      <p style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500, margin: '0 0 12px 0' }}>{cfg.label}</p>
                      <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#1E3A5F', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '6px 0 0 0' }}>{pct}% of total</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem', padding: '32px 0' }}>
                No care pathway data available — data will appear once consultations are responded to
              </p>
            )}
          </div>
        </div>

        {/* System Summary */}
        <div className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 2px 0' }}>System Summary</h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>Key performance indicators</p>
          </div>
          <div>
            {[
              {
                label: 'Consultation Response Rate',
                value: `${responseRate}%`,
                description: `${analytics?.overview.respondedConsultations || 0} of ${analytics?.overview.totalConsultations || 0} consultations responded`,
              },
              {
                label: 'Pending Consultation Rate',
                value: analytics && analytics.overview.totalConsultations > 0
                  ? `${Math.round((analytics.overview.pendingConsultations / analytics.overview.totalConsultations) * 100)}%`
                  : '0%',
                description: `${analytics?.overview.pendingConsultations || 0} consultations awaiting response`,
              },
              {
                label: 'Patients per Facility',
                value: analytics && analytics.overview.totalFacilities > 0
                  ? (analytics.overview.totalPatients / analytics.overview.totalFacilities).toFixed(1)
                  : '0',
                description: `Avg. patients across ${analytics?.overview.totalFacilities || 0} active facilities`,
              },
              {
                label: 'Users per Facility',
                value: analytics && analytics.overview.totalFacilities > 0
                  ? (analytics.overview.totalUsers / analytics.overview.totalFacilities).toFixed(1)
                  : '0',
                description: `Avg. active users per facility`,
              },
            ].map((row, index) => (
              <div
                key={row.label}
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: index < 3 ? '1px solid #F3F4F6' : 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div>
                  <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', margin: '0 0 2px 0' }}>{row.label}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>{row.description}</p>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A5F', minWidth: '80px', textAlign: 'right' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Responsive styles for Reports Analytics */}
      <style>{`
        .reports-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .reports-header {
          background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%);
          border-radius: 12px;
          padding: 16px;
          color: white;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .reports-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        .reports-rate {
          text-align: left;
        }
        .rate-value {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
        }
        .reports-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .reports-two-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 480px) {
          .reports-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 640px) {
          .reports-container {
            padding: 20px;
            gap: 24px;
          }
          .reports-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            border-radius: 16px;
          }
          .reports-title {
            font-size: 1.5rem;
          }
          .reports-rate {
            text-align: right;
          }
          .rate-value {
            font-size: 2rem;
          }
          .reports-stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .reports-two-col {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (min-width: 1024px) {
          .reports-container {
            padding: 24px 32px;
            gap: 28px;
          }
          .reports-header {
            padding: 24px;
          }
          .reports-stats-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          .reports-two-col {
            gap: 24px;
          }
        }
      `}</style>
    </Layout>
  );
};
