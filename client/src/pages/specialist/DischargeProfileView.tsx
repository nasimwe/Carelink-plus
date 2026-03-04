import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Building, User,
  AlertTriangle, ChevronDown, ChevronUp,
  FileText, Pill, Activity, Clock,
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { patientsAPI } from '../../services/api';
import { Patient } from '../../types';

export const DischargeProfileView = () => {
  const { id } = useParams<{ id: string }>();
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
      if (!id) return;
      try {
        const response = await patientsAPI.getById(parseInt(id, 10));
        setPatient(response.data.patient);
      } catch (error) {
        console.error('Failed to fetch patient:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

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
        <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center', padding: '48px 32px', background: 'white', borderRadius: '20px', border: '1px solid #E5E7EB' }}>
          <User size={32} style={{ color: '#9CA3AF', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Patient Not Found</h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '24px' }}>The discharge profile could not be loaded.</p>
          <button onClick={() => navigate('/specialist')} className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const sections = [
    { id: 'diagnosis', title: 'Diagnosis Summary', icon: FileText, content: patient.diagnosisSummary },
    { id: 'treatment', title: 'Treatment Summary', icon: Pill, content: patient.treatmentSummary },
    ...(patient.expectedSideEffects
      ? [{ id: 'sideEffects', title: 'Expected Side Effects', icon: Activity, content: patient.expectedSideEffects }]
      : []),
    { id: 'followUp', title: 'Follow-up Instructions', icon: Clock, content: patient.followUpInstructions },
  ];

  return (
    <Layout>
      <div className="discharge-view-container">

        {/* Back button */}
        <button
          onClick={() => navigate('/specialist')}
          className="btn btn-ghost group animate-fade-in"
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header card */}
        <div
          className="card animate-fade-in-down discharge-header-card"
          style={{ overflow: 'hidden', position: 'relative' }}
        >
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #1E3A5F 0%, #2C5282 100%)' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Patient Code</p>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0', fontFamily: 'monospace' }}>
                {patient.patientCode}
              </h1>
              <span style={{
                display: 'inline-flex',
                padding: '4px 14px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                background: '#EFF6FF',
                color: '#1E3A5F',
                borderRadius: '20px',
                border: '1px solid #BFDBFE',
              }}>
                {patient.specialty}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '20px', borderTop: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>Discharge Date</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>{formatDate(patient.dischargeDate)}</p>
              </div>
            </div>
            {patient.specialist && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>Doctor</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>
                    Dr. {patient.specialist.firstName} {patient.specialist.lastName}
                  </p>
                </div>
              </div>
            )}
            {patient.facility && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building size={16} style={{ color: '#6B7280', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>Facility</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827', margin: 0 }}>{patient.facility.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discharge sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sections.map((section, index) => (
            <div key={section.id} className="card animate-fade-in-up" style={{ overflow: 'hidden', animationDelay: `${index * 80}ms` }}>
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '18px 24px',
                  background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <section.icon size={18} style={{ color: '#1E3A5F', flexShrink: 0 }} />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', margin: 0 }}>{section.title}</h3>
                </div>
                {expandedSections[section.id]
                  ? <ChevronUp size={16} style={{ color: '#9CA3AF' }} />
                  : <ChevronDown size={16} style={{ color: '#9CA3AF' }} />}
              </button>
              {expandedSections[section.id] && (
                <div style={{ padding: '0 24px 20px 24px' }}>
                  <div style={{
                    padding: '14px 18px',
                    background: '#F9FAFB',
                    borderRadius: '10px',
                    borderLeft: '3px solid #1E3A5F',
                    color: '#374151',
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                  }}>
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Warning Signs */}
          <div
            className="animate-fade-in-up card"
            style={{ overflow: 'hidden', border: '1px solid #FECACA', animationDelay: `${sections.length * 80}ms` }}
          >
            <button
              onClick={() => toggleSection('warnings')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '18px 24px',
                background: 'white', border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#991B1B', margin: 0 }}>Warning Signs</h3>
              </div>
              {expandedSections.warnings
                ? <ChevronUp size={16} style={{ color: '#EF4444' }} />
                : <ChevronDown size={16} style={{ color: '#EF4444' }} />}
            </button>
            {expandedSections.warnings && (
              <div style={{ padding: '0 24px 20px 24px' }}>
                <div style={{
                  padding: '14px 18px',
                  background: '#FEF2F2',
                  borderRadius: '10px',
                  borderLeft: '3px solid #EF4444',
                  color: '#991B1B',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                }}>
                  {patient.warningSigns}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Responsive styles for Discharge Profile View */}
      <style>{`
        .discharge-view-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .discharge-header-card {
          padding: 16px;
        }

        @media (min-width: 640px) {
          .discharge-view-container {
            padding: 20px;
            gap: 20px;
          }
          .discharge-header-card {
            padding: 24px;
          }
        }

        @media (min-width: 1024px) {
          .discharge-view-container {
            padding: 24px 32px;
            gap: 24px;
          }
          .discharge-header-card {
            padding: 28px 32px;
          }
        }
      `}</style>
    </Layout>
  );
};
