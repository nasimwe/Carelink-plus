import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Building2, Activity, TrendingUp, Clock,
  CheckCircle, Heart, Shield, Globe, Zap, Award, Target,
  BarChart3, Calendar,
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { AnimatedStat } from '../../components/ui/AnimatedStat';
import { RwandaMap } from '../../components/ui/RwandaMap';
import { ActivityFeed } from '../../components/ui/ActivityFeed';
import { adminAPI, consultationsAPI } from '../../services/api';

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
  usersByProvince: Record<string, number>;
  consultationsByUrgency: Array<{ urgencyLevel: string; count: string }>;
  consultationsByCarePathway: Array<{ carePathway: string; count: string }>;
}

interface Facility {
  id: number;
  name: string;
  province: string;
  type: string;
}

interface Consultation {
  id: number;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'responded' | 'closed';
  chiefComplaint: string;
  createdAt: string;
  respondedAt?: string;
  clinician?: {
    firstName: string;
    lastName: string;
  };
  facility?: {
    id: number;
    name: string;
    district: string;
    province: string;
  };
}

export const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [analyticsRes, facilitiesRes, consultationsRes] = await Promise.all([
          adminAPI.getAnalytics(),
          adminAPI.getFacilities({ limit: 100 }),
          consultationsAPI.getAll({ limit: 20 }),
        ]);

        setAnalytics(analyticsRes.data);
        setFacilities(facilitiesRes.data.facilities || []);
        setConsultations(consultationsRes.data.consultations || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Group facilities by province
  const facilitiesByProvince: Record<string, number> = {};
  facilities.forEach((facility) => {
    const province = facility.province || 'Unknown';
    facilitiesByProvince[province] = (facilitiesByProvince[province] || 0) + 1;
  });

  // Group consultations by province (based on the consultation's originating facility)
  const consultationsByProvince: Record<string, number> = {};
  consultations.forEach((consultation) => {
    const province = consultation.facility?.province || 'Unknown';
    consultationsByProvince[province] = (consultationsByProvince[province] || 0) + 1;
  });

  // Calculate response rate and average response time
  const responseRate = analytics
    ? analytics.overview.totalConsultations > 0
      ? Math.round((analytics.overview.respondedConsultations / analytics.overview.totalConsultations) * 100)
      : 0
    : 0;

  // Calculate average response time from responded consultations
  const respondedConsultations = consultations.filter(c => c.respondedAt);
  let avgResponseTime = 0;
  if (respondedConsultations.length > 0) {
    const totalHours = respondedConsultations.reduce((acc, c) => {
      const created = new Date(c.createdAt).getTime();
      const responded = new Date(c.respondedAt!).getTime();
      return acc + (responded - created) / (1000 * 60 * 60);
    }, 0);
    avgResponseTime = Math.round((totalHours / respondedConsultations.length) * 10) / 10;
  }

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
            <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Loading Executive Dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="executive-container">

        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          className="animate-fade-in back-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#4B5563',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            padding: '6px 0',
            marginBottom: '16px',
            transition: 'color 0.2s'
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Hero Section */}
        <div
          className="animate-fade-in-down executive-hero"
        >
          {/* Background decorations */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-50px', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '50%', left: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Top row */}
            <div className="executive-top-row">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>C+</span>
                  </div>
                  <div>
                    <h1 className="executive-title">
                      CareLink+ Executive Overview
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.8, margin: '4px 0 0 0' }}>
                      Rwanda's Post-Referral Healthcare Continuity Platform
                    </p>
                  </div>
                </div>
              </div>

              {/* Live Clock */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'right',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Calendar size={16} style={{ opacity: 0.7 }} />
                  <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    {currentTime.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
                  {currentTime.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Key Impact Metrics */}
            <div className="exec-key-metrics">
              {[
                {
                  icon: Heart,
                  value: analytics?.overview.totalPatients || 0,
                  label: 'Lives Impacted',
                  sublabel: 'Patients receiving continuous care',
                },
                {
                  icon: Building2,
                  value: analytics?.overview.totalFacilities || 0,
                  label: 'Connected Facilities',
                  sublabel: 'Across all provinces',
                },
                {
                  icon: CheckCircle,
                  value: responseRate,
                  label: 'Response Rate',
                  sublabel: 'Consultations addressed',
                  suffix: '%',
                },
                {
                  icon: Zap,
                  value: avgResponseTime || 0,
                  label: 'Avg Response Time',
                  sublabel: 'Hours to doctor feedback',
                  suffix: 'h',
                  isDecimal: true,
                },
              ].map((metric, index) => (
                <div
                  key={metric.label}
                  className="animate-fade-in-up exec-metric-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div className="exec-metric-icon">
                      <metric.icon size={20} />
                    </div>
                  </div>
                  <p className="exec-metric-value">
                    {metric.isDecimal ? metric.value : Math.floor(metric.value)}
                    {metric.suffix || ''}
                  </p>
                  <p className="exec-metric-label">
                    {metric.label}
                  </p>
                  <p className="exec-metric-sublabel">
                    {metric.sublabel}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid with Animated Counters */}
        <div>
          <h2 className="exec-section-title">
            System Performance Metrics
          </h2>
          <div className="exec-stats-grid">
            <AnimatedStat
              icon={Users}
              label="Active Healthcare Workers"
              value={analytics?.overview.totalUsers || 0}
              color="blue"
              delay={0}
              trend={{ value: 12, isPositive: true }}
            />
            <AnimatedStat
              icon={Activity}
              label="Total Consultations"
              value={analytics?.overview.totalConsultations || 0}
              color="emerald"
              delay={100}
              trend={{ value: 23, isPositive: true }}
            />
            <AnimatedStat
              icon={Clock}
              label="Pending Reviews"
              value={analytics?.overview.pendingConsultations || 0}
              color="amber"
              delay={200}
            />
            <AnimatedStat
              icon={Target}
              label="Successfully Resolved"
              value={analytics?.overview.respondedConsultations || 0}
              color="teal"
              delay={300}
              trend={{ value: 8, isPositive: true }}
            />
          </div>
        </div>

        {/* Healthcare Coverage Map — full width */}
        <RwandaMap
          facilitiesByProvince={facilitiesByProvince}
          consultationsByProvince={consultationsByProvince}
          usersByProvince={analytics?.usersByProvince || {}}
          totalFacilities={analytics?.overview.totalFacilities || 0}
          totalConsultations={analytics?.overview.totalConsultations || 0}
          totalUsers={analytics?.overview.totalUsers || 0}
          isLoading={false}
        />

        {/* Activity Feed */}
        <ActivityFeed
          consultations={consultations}
          isLoading={false}
        />

        {/* Impact Summary */}
        <div className="exec-impact-section">
          <div className="exec-impact-header">
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
              <Award size={26} style={{ color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                Platform Impact Summary
              </h3>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>
                Key achievements and system value proposition
              </p>
            </div>
          </div>

          <div className="exec-impact-grid">
            {[
              {
                icon: Shield,
                title: 'Continuity of Care',
                description: 'Ensures seamless post-referral follow-up between health centers and referral hospitals.',
                color: '#1E3A5F',
              },
              {
                icon: Globe,
                title: 'National Coverage',
                description: `Connects ${analytics?.overview.totalFacilities || 0} healthcare facilities across all 5 provinces of Rwanda.`,
                color: '#3B82F6',
              },
              {
                icon: BarChart3,
                title: 'Data-Driven Decisions',
                description: `${analytics?.overview.totalConsultations || 0} consultations processed with ${responseRate}% response rate.`,
                color: '#10B981',
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="animate-fade-in-up exec-impact-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="exec-impact-icon"
                  style={{ background: `${item.color}15` }}
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <h4 className="exec-impact-title">
                  {item.title}
                </h4>
                <p className="exec-impact-desc">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontSize: '0.875rem' }}>
          <p style={{ margin: '0 0 8px 0' }}>
            CareLink+ — Post-Referral Continuity Platform
          </p>
          <p style={{ margin: 0 }}>
            Rwanda Ministry of Health © {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Responsive styles for Executive Dashboard */}
      <style>{`
        .executive-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .executive-hero {
          background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 50%, #1E3A5F 100%);
          border-radius: 16px;
          padding: 20px;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(30, 58, 95, 0.4);
        }
        .executive-top-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 20px;
        }
        .executive-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.025em;
        }

        /* Key Metrics Grid */
        .exec-key-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .exec-metric-card {
          border-radius: 14px;
          padding: 16px;
        }
        .exec-metric-icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .exec-metric-value {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0 0 4px 0;
          line-height: 1;
        }
        .exec-metric-label {
          font-size: 0.8125rem;
          font-weight: 600;
          margin: 0 0 4px 0;
        }
        .exec-metric-sublabel {
          font-size: 0.6875rem;
          opacity: 0.7;
          margin: 0;
          display: none;
        }

        /* Stats Grid */
        .exec-section-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
        }
        .exec-stats-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Impact Section */
        .exec-impact-section {
          background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #E5E7EB;
        }
        .exec-impact-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .exec-impact-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .exec-impact-card {
          background: white;
          border-radius: 14px;
          padding: 20px;
          border: 1px solid #E5E7EB;
        }
        .exec-impact-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }
        .exec-impact-title {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 6px 0;
        }
        .exec-impact-desc {
          font-size: 0.875rem;
          color: #6B7280;
          margin: 0;
          line-height: 1.6;
        }

        @media (min-width: 640px) {
          .executive-container {
            padding: 20px;
            gap: 28px;
          }
          .executive-hero {
            border-radius: 24px;
            padding: 32px;
          }
          .executive-title {
            font-size: 1.75rem;
          }
          .exec-key-metrics {
            gap: 16px;
          }
          .exec-metric-card {
            border-radius: 18px;
            padding: 20px;
          }
          .exec-metric-icon {
            width: 42px;
            height: 42px;
          }
          .exec-metric-value {
            font-size: 2rem;
          }
          .exec-metric-label {
            font-size: 0.9375rem;
          }
          .exec-metric-sublabel {
            display: block;
            font-size: 0.75rem;
          }
          .exec-section-title {
            font-size: 1.25rem;
            margin-bottom: 20px;
          }
          .exec-stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .exec-impact-section {
            border-radius: 20px;
            padding: 28px;
          }
          .exec-impact-header {
            flex-direction: row;
            align-items: center;
            gap: 16px;
          }
          .exec-impact-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .exec-impact-card {
            border-radius: 16px;
            padding: 24px;
          }
        }

        @media (min-width: 1024px) {
          .executive-container {
            padding: 24px 32px;
            gap: 32px;
          }
          .executive-hero {
            border-radius: 32px;
            padding: 48px;
          }
          .executive-top-row {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 32px;
          }
          .executive-title {
            font-size: 2.5rem;
          }
          .exec-key-metrics {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
          .exec-metric-card {
            border-radius: 20px;
            padding: 24px;
          }
          .exec-metric-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
          }
          .exec-metric-value {
            font-size: 2.5rem;
          }
          .exec-metric-label {
            font-size: 1rem;
          }
          .exec-metric-sublabel {
            font-size: 0.8125rem;
          }
          .exec-section-title {
            font-size: 1.5rem;
          }
          .exec-stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
          .exec-impact-section {
            border-radius: 24px;
            padding: 32px;
          }
          .exec-impact-grid {
            gap: 24px;
          }
          .exec-impact-card {
            border-radius: 20px;
            padding: 28px;
          }
          .exec-impact-icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            margin-bottom: 20px;
          }
          .exec-impact-title {
            font-size: 1.125rem;
            margin-bottom: 8px;
          }
          .exec-impact-desc {
            font-size: 0.9375rem;
          }
        }
      `}</style>
    </Layout>
  );
};
