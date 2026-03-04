import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Search, Sparkles } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';

export const ConsultationSuccess = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={{
        maxWidth: '480px',
        margin: '40px auto',
        textAlign: 'center'
      }}>
        <div className="animate-scale-in" style={{
          padding: '48px 40px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E5E7EB'
        }}>
          {/* Success icon with animation */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '28px' }}>
            <div className="animate-bounce-subtle" style={{
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
            }}>
              <CheckCircle size={52} style={{ color: '#10B981' }} />
            </div>
            <div className="animate-float" style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
            }}>
              <Sparkles size={18} style={{ color: 'white' }} />
            </div>
          </div>

          <h1 className="animate-fade-in-up" style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '12px',
            animationDelay: '100ms'
          }}>
            Consultation Submitted!
          </h1>

          <p className="animate-fade-in-up" style={{
            color: '#6B7280',
            fontSize: '15px',
            lineHeight: 1.7,
            marginBottom: '32px',
            animationDelay: '200ms'
          }}>
            Your consultation has been successfully submitted. The doctor will be notified and will respond as soon as possible.
          </p>

          {/* Status indicator */}
          <div className="animate-fade-in-up" style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderRadius: '14px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            animationDelay: '300ms'
          }}>
            <div className="animate-pulse-slow" style={{
              width: '10px',
              height: '10px',
              background: '#3B82F6',
              borderRadius: '50%'
            }} />
            <span style={{ fontSize: '14px', color: '#1E40AF', fontWeight: 500 }}>
              Awaiting doctor response
            </span>
          </div>

          <div className="animate-fade-in-up" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animationDelay: '400ms'
          }}>
            <button
              onClick={() => navigate('/clinician')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px 24px', fontSize: '15px' }}
            >
              Back to Dashboard
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => navigate('/clinician/search')}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '16px 24px', fontSize: '15px' }}
            >
              <Search size={18} />
              Search Another Patient
            </button>
          </div>
        </div>

        {/* Help text */}
        <p className="animate-fade-in" style={{
          marginTop: '24px',
          fontSize: '13px',
          color: '#9CA3AF',
          animationDelay: '500ms'
        }}>
          You'll receive a notification when the doctor responds
        </p>
      </div>
    </Layout>
  );
};
