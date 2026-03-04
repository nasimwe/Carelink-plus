import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Search } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { consultationsAPI } from '../../services/api';
import { Consultation, ConsultationStatus, UrgencyLevel } from '../../types';

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: ConsultationStatus.PENDING },
  { label: 'Responded', value: ConsultationStatus.RESPONDED },
  { label: 'Closed', value: ConsultationStatus.CLOSED },
];

export const AllConsultations = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchConsultations = async () => {
      setIsLoading(true);
      try {
        const res = await consultationsAPI.getAll({
          status: activeStatus || undefined,
          limit: 100,
        });
        setConsultations(res.data.consultations || []);
      } catch (error) {
        console.error('Failed to fetch consultations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConsultations();
  }, [activeStatus]);

  const getStatusConfig = (status: ConsultationStatus) => ({
    [ConsultationStatus.PENDING]:   { bg: '#FEF3C7', color: '#D97706',  label: 'Pending' },
    [ConsultationStatus.RESPONDED]: { bg: '#D1FAE5', color: '#059669',  label: 'Responded' },
    [ConsultationStatus.CLOSED]:    { bg: '#E0E7FF', color: '#4F46E5',  label: 'Closed' },
  }[status]);

  const getUrgencyConfig = (urgency: UrgencyLevel) => ({
    [UrgencyLevel.EMERGENCY]: { color: '#DC2626', border: '#EF4444', label: 'Emergency' },
    [UrgencyLevel.URGENT]:    { color: '#EA580C', border: '#F97316', label: 'Urgent' },
    [UrgencyLevel.ROUTINE]:   { color: '#2563EB', border: '#3B82F6', label: 'Routine' },
  }[urgency]);

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / 36e5);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const filtered = consultations.filter((c) => {
    if (!search) return true;
    return c.patient?.patientCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.clinicalQuestion?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/clinician')}
          className="btn btn-ghost group animate-fade-in"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Page header */}
        <div
          className="animate-fade-in-down"
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 4px 0' }}>All Consultations</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', margin: 0 }}>
              {consultations.length} total consultation{consultations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status tabs */}
          <div style={{ display: 'flex', background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '4px', gap: '2px' }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: activeStatus === tab.value ? '#1E3A5F' : 'transparent',
                  color: activeStatus === tab.value ? 'white' : '#6B7280',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient code or question..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                fontSize: '0.875rem',
                outline: 'none',
                background: 'white',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#1E3A5F'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; }}
            />
          </div>
        </div>

        {/* Consultations list */}
        <div
          className="animate-fade-in-up"
          style={{ background: 'white', borderRadius: '20px', border: '1px solid #E5E7EB', overflow: 'hidden' }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px' }}>
              <div className="loading-spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ width: '56px', height: '56px', background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Search size={24} style={{ color: '#9CA3AF' }} />
              </div>
              <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px 0' }}>No consultations found</p>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>
                {search ? 'Try a different search term' : 'No consultations match the selected filter'}
              </p>
            </div>
          ) : (
            filtered.map((consultation, index) => {
              const statusCfg = getStatusConfig(consultation.status);
              const urgencyCfg = getUrgencyConfig(consultation.urgencyLevel);
              return (
                <div
                  key={consultation.id}
                  onClick={() => navigate(`/clinician/consultation/${consultation.id}`)}
                  style={{
                    padding: '18px 24px',
                    borderBottom: index < filtered.length - 1 ? '1px solid #F3F4F6' : 'none',
                    borderLeft: `4px solid ${urgencyCfg.border}`,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Main content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {consultation.patient?.patientCode && (
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', fontWeight: 700, color: '#374151', background: '#F3F4F6', padding: '2px 8px', borderRadius: '5px' }}>
                          {consultation.patient.patientCode}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '2px 10px', borderRadius: '20px', background: statusCfg.bg, color: statusCfg.color }}>
                        {statusCfg.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: urgencyCfg.color }}>
                        {urgencyCfg.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9375rem', color: '#374151', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {consultation.clinicalQuestion}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: 0 }}>
                      {formatTimeAgo(consultation.createdAt)}
                      {consultation.status === ConsultationStatus.RESPONDED && consultation.carePathway && (
                        <span> · <span style={{ color: '#1E3A5F', fontWeight: 500 }}>{consultation.carePathway.replace(/_/g, ' ')}</span></span>
                      )}
                    </p>
                  </div>

                  <ChevronRight size={18} style={{ color: '#D1D5DB', flexShrink: 0 }} />
                </div>
              );
            })
          )}
        </div>

      </div>
    </Layout>
  );
};
