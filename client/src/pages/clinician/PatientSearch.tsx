import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, User, Calendar, Building, ArrowRight, FileSearch } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { patientsAPI } from '../../services/api';
import { Patient } from '../../types';

export const PatientSearch = () => {
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await patientsAPI.search(searchCode);
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Search failed:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="patient-search-container" style={{ maxWidth: '900px' }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/clinician')}
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

        {/* Search header */}
        <div className="animate-fade-in-down" style={{ marginBottom: '24px' }}>
          <h1 className="search-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
            Search Patient
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>
            Enter the patient code to find their discharge profile
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="animate-fade-in-up search-form" style={{ marginBottom: '24px' }}>
          <div className="search-box" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '12px',
            background: 'white',
            borderRadius: '14px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF'
                }}
              />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Enter patient code"
                className="search-input"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  border: 'none',
                  background: 'transparent',
                  boxShadow: 'none',
                  fontSize: '16px',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchCode.trim()}
              className="btn btn-primary search-submit-btn"
              style={{ flexShrink: 0, width: '100%' }}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%'
                  }} />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <div className="loading-spinner" />
          </div>
        ) : hasSearched && patients.length === 0 ? (
          <div
            className="card animate-scale-in"
            style={{ padding: '40px 20px', textAlign: 'center' }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <FileSearch size={28} style={{ color: '#9CA3AF' }} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
              No Patient Found
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '6px', fontSize: '0.875rem' }}>
              We couldn't find a patient with the code "<span style={{ fontWeight: 600 }}>{searchCode}</span>".
            </p>
            <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', maxWidth: '400px', margin: '0 auto' }}>
              Please verify the patient code and try again.
            </p>
          </div>
        ) : patients.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {patients.map((patient, index) => (
              <div
                key={patient.id}
                onClick={() => navigate(`/clinician/patient/${patient.patientCode}`)}
                className="card animate-fade-in-up patient-result-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div className="patient-avatar" style={{
                      width: '44px',
                      height: '44px',
                      background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User size={20} style={{ color: 'white' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 className="patient-code" style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                        {patient.patientCode}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
                        color: '#2563EB',
                        borderRadius: '20px'
                      }}>
                        {patient.specialty}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: '#F3F4F6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ArrowRight size={16} style={{ color: '#6B7280' }} />
                  </div>
                </div>

                <div className="patient-meta-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4B5563' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Calendar size={14} style={{ color: '#F59E0B' }} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatDate(patient.dischargeDate)}</span>
                  </div>
                  <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4B5563' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Building size={14} style={{ color: '#A855F7' }} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.facility?.name}</span>
                  </div>
                  <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4B5563' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User size={14} style={{ color: '#10B981' }} />
                    </div>
                    <span style={{ fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {patient.specialist?.firstName} {patient.specialist?.lastName}</span>
                  </div>
                </div>

                <div style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                  borderRadius: '10px'
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2px', fontWeight: 500 }}>Diagnosis</p>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: '#374151',
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {patient.diagnosisSummary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Responsive styles for Patient Search */}
      <style>{`
        @media (min-width: 640px) {
          .search-title {
            font-size: 1.75rem !important;
          }
          .search-box {
            flex-direction: row !important;
            padding: 8px !important;
          }
          .search-submit-btn {
            width: auto !important;
          }
          .patient-result-card {
            padding: 24px !important;
          }
          .patient-avatar {
            width: 52px !important;
            height: 52px !important;
          }
          .patient-code {
            font-size: 1.125rem !important;
          }
        }
      `}</style>
    </Layout>
  );
};
