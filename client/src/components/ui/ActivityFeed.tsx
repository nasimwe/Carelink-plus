import { useState, useEffect } from 'react';
import { Activity, CheckCircle, Clock, AlertTriangle, Send, Building2 } from 'lucide-react';
import { consultationsAPI } from '../../services/api';

interface Consultation {
  id: number;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'responded' | 'closed';
  chiefComplaint: string;
  createdAt: string;
  respondedAt?: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  clinician?: {
    firstName: string;
    lastName: string;
    facility?: {
      name: string;
    };
  };
  specialist?: {
    firstName: string;
    lastName: string;
  };
}

interface ActivityItem {
  id: string;
  type: 'consultation_submitted' | 'consultation_responded' | 'emergency';
  title: string;
  description: string;
  time: string;
  facility?: string;
  urgency?: 'routine' | 'urgent' | 'emergency';
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'consultation_submitted':
      return { icon: Send, color: '#3B82F6', bg: '#EFF6FF' };
    case 'consultation_responded':
      return { icon: CheckCircle, color: '#10B981', bg: '#ECFDF5' };
    case 'emergency':
      return { icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' };
    default:
      return { icon: Activity, color: '#6B7280', bg: '#F3F4F6' };
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

interface ActivityFeedProps {
  consultations?: Consultation[];
  isLoading?: boolean;
}

export const ActivityFeed = ({ consultations: propConsultations, isLoading: propIsLoading }: ActivityFeedProps) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(propIsLoading ?? true);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (propConsultations) {
      setConsultations(propConsultations);
      setIsLoading(false);
      return;
    }

    const fetchConsultations = async () => {
      try {
        const response = await consultationsAPI.getAll({ limit: 10 });
        setConsultations(response.data.consultations || []);
      } catch (error) {
        console.error('Failed to fetch consultations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultations();

    // Poll for updates if live
    if (isLive) {
      const interval = setInterval(fetchConsultations, 30000);
      return () => clearInterval(interval);
    }
  }, [propConsultations, isLive]);

  // Transform consultations to activity items
  const activities: ActivityItem[] = consultations.map((consultation) => {
    const isResponded = consultation.status === 'responded' || consultation.status === 'closed';
    const isEmergency = consultation.urgencyLevel === 'emergency';

    return {
      id: consultation.id.toString(),
      type: isEmergency ? 'emergency' : isResponded ? 'consultation_responded' : 'consultation_submitted',
      title: isResponded ? 'Consultation Responded' : isEmergency ? 'Emergency Case' : 'New Consultation',
      description: consultation.chiefComplaint || 'Healthcare consultation',
      time: formatTimeAgo(isResponded && consultation.respondedAt ? consultation.respondedAt : consultation.createdAt),
      facility: consultation.clinician?.facility?.name,
      urgency: consultation.urgencyLevel,
    };
  });

  if (isLoading) {
    return (
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          padding: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280' }}>Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '24px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px -5px rgba(30, 58, 95, 0.4)',
            }}
          >
            <Activity size={26} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
              Recent Activity
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>
              Latest consultations
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <button
          onClick={() => setIsLive(!isLive)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: isLive ? '#ECFDF5' : '#F3F4F6',
            border: `2px solid ${isLive ? '#10B981' : '#D1D5DB'}`,
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isLive ? '#10B981' : '#9CA3AF',
              animation: isLive ? 'pulse 2s infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isLive ? '#059669' : '#6B7280' }}>
            {isLive ? 'Live' : 'Paused'}
          </span>
        </button>
      </div>

      {/* Activity List */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Activity size={48} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
            <p style={{ color: '#6B7280', fontWeight: 500 }}>No recent activity</p>
            <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Consultations will appear here</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const { icon: Icon, color, bg } = getActivityIcon(activity.type);

            return (
              <div
                key={activity.id}
                className={index === 0 ? 'animate-slide-in' : ''}
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  transition: 'background 0.2s ease',
                  background: index === 0 ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' : 'transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = index === 0 ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' : 'transparent'; }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} style={{ color }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', margin: 0 }}>
                      {activity.title}
                    </p>
                    {activity.urgency === 'emergency' && (
                      <span
                        style={{
                          padding: '2px 8px',
                          background: '#FEF2F2',
                          border: '1px solid #FECACA',
                          borderRadius: '10px',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: '#DC2626',
                          textTransform: 'uppercase',
                        }}
                      >
                        Emergency
                      </span>
                    )}
                    {activity.urgency === 'urgent' && (
                      <span
                        style={{
                          padding: '2px 8px',
                          background: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          borderRadius: '10px',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: '#D97706',
                          textTransform: 'uppercase',
                        }}
                      >
                        Urgent
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      color: '#4B5563',
                      fontSize: '0.875rem',
                      margin: '0 0 8px 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {activity.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {activity.facility && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6B7280' }}>
                        <Building2 size={12} />
                        {activity.facility}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#9CA3AF' }}>
                      <Clock size={12} />
                      {activity.time}
                    </span>
                  </div>
                </div>

                {/* New indicator */}
                {index === 0 && (
                  <div
                    style={{
                      padding: '4px 10px',
                      background: '#ECFDF5',
                      borderRadius: '12px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#059669',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}
                  >
                    Latest
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px 24px',
          background: '#F9FAFB',
          borderTop: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: 0 }}>
          Showing {activities.length} recent consultations
        </p>
      </div>
    </div>
  );
};
