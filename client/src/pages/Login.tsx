import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Heart, Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import bgImage from '../assets/BG1.jpeg';

type DemoRole = 'clinician' | 'specialist' | 'administrator';

const demoAccounts: Record<DemoRole, { email: string; password: string; label: string }> = {
  clinician: { email: 'm.uwimana@huye.rw', password: 'password123', label: 'Clinical Officer' },
  specialist: { email: 'jp.habimana@kuth.rw', password: 'password123', label: 'Doctor' },
  administrator: { email: 'admin@carelink.rw', password: 'admin123', label: 'Admin' },
};

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAccess = (role: DemoRole) => {
    const account = demoAccounts[role];
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="login-page">
      {/* Left Side - Hero Image Panel */}
      <div className="login-hero">
        <img
          src={bgImage}
          alt="Healthcare professionals forming a heart"
          className="login-hero-img"
        />
        <div className="login-hero-overlay" />

        {/* Animated floating orbs */}
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />

        <div className="login-hero-content">
          <div className="login-hero-badge animate-fade-in-down">
            <Heart size={14} style={{ fill: 'white' }} />
            <span>Trusted by 200+ facilities</span>
          </div>
          <h2 className="login-hero-title animate-fade-in-down">
            Follow Up Care,<br />
            <span className="login-hero-title-accent">Saving Lives</span>
          </h2>
          <p className="login-hero-subtitle animate-fade-in-up">
            Rwanda's premier post-referral continuity platform — bridging clinical officers,
            doctors, and administrators for seamless patient care.
          </p>

          {/* Feature pills */}
          <div className="login-hero-features animate-fade-in-up">
            <div className="login-feature-pill">
              <Shield size={16} />
              <span>Secure & HIPAA Compliant</span>
            </div>
            <div className="login-feature-pill">
              <Users size={16} />
              <span>Real-time Collaboration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-side">
        <div className="login-form-wrapper">
          {/* Logo */}
          <div className="animate-fade-in-down login-logo-section" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="login-logo">
              <span className="animate-float login-logo-text">C+</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <h1 className="login-title">CareLink+</h1>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>
              Post-Referral Continuity Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="animate-fade-in-up login-card">
            {/* Error Message */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.rw"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '2px solid #E5E7EB',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                    marginBottom: '8px',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 16px',
                      borderRadius: '12px',
                      border: '2px solid #E5E7EB',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#9CA3AF',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#1E3A5F' }}
                  />
                  <span style={{ fontSize: '14px', color: '#4B5563' }}>Remember me</span>
                </label>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1E3A5F',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '15px',
                  fontWeight: 600,
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo Access */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
              <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '13px', marginBottom: '12px' }}>
                Quick demo access
              </p>
              <div className="demo-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(Object.keys(demoAccounts) as DemoRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleQuickAccess(role)}
                    className="btn btn-secondary demo-btn"
                    style={{ flex: '1 1 auto', minWidth: '0', padding: '10px 8px', fontSize: '12px' }}
                  >
                    {demoAccounts[role].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '24px', textAlign: 'center' }}>
            Rwanda Ministry of Health &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ===== HERO IMAGE PANEL ===== */
        .login-hero {
          position: relative;
          height: 280px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .login-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .login-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(30, 58, 95, 0.88) 0%,
            rgba(44, 82, 130, 0.82) 50%,
            rgba(30, 58, 95, 0.90) 100%
          );
        }

        /* Floating animated orbs */
        .login-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }

        .login-orb-1 {
          width: 200px;
          height: 200px;
          top: -60px;
          right: -40px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%);
          animation: float 6s ease-in-out infinite;
        }

        .login-orb-2 {
          width: 150px;
          height: 150px;
          bottom: -30px;
          left: -30px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: float 8s ease-in-out infinite reverse;
        }

        .login-orb-3 {
          width: 100px;
          height: 100px;
          top: 40%;
          left: 60%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
          animation: float 7s ease-in-out infinite 1s;
        }

        .login-hero-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px;
          text-align: center;
        }

        .login-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 12px;
          color: white;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .login-hero-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin: 0 0 12px 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .login-hero-title-accent {
          background: linear-gradient(135deg, #60A5FA, #34D399);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-hero-subtitle {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.75);
          margin: 0;
          max-width: 500px;
          line-height: 1.6;
          display: none;
        }

        .login-hero-features {
          display: none;
        }

        .login-feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 10px 18px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 500;
        }

        /* ===== FORM SIDE ===== */
        .login-form-side {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 24px 16px;
          background: #FAFBFC;
          overflow-y: auto;
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 440px;
        }

        .login-logo {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          box-shadow: 0 10px 30px -8px rgba(30, 58, 95, 0.4);
        }

        .login-logo-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1E3A5F;
          margin: 0;
        }

        .login-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          border: 1px solid #E5E7EB;
        }

        /* ===== TABLET (640px+) ===== */
        @media (min-width: 640px) {
          .login-hero {
            height: 320px;
          }

          .login-hero-title {
            font-size: 2rem;
          }

          .login-hero-subtitle {
            display: block;
          }

          .login-form-side {
            padding: 32px 24px;
          }

          .login-card {
            padding: 32px;
          }

          .login-logo {
            width: 64px;
            height: 64px;
            border-radius: 20px;
          }

          .login-logo-text {
            font-size: 1.75rem;
          }

          .demo-btn {
            padding: 12px !important;
            font-size: 13px !important;
          }
        }

        /* ===== DESKTOP (1024px+) - Split Screen ===== */
        @media (min-width: 1024px) {
          .login-page {
            flex-direction: row;
          }

          .login-hero {
            width: 50%;
            height: 100vh;
            position: sticky;
            top: 0;
          }

          .login-hero-content {
            align-items: flex-start;
            text-align: left;
            padding: 60px;
          }

          .login-hero-title {
            font-size: 2.75rem;
          }

          .login-hero-subtitle {
            display: block;
            font-size: 1rem;
          }

          .login-hero-features {
            display: flex;
            gap: 12px;
            margin-top: 24px;
            flex-wrap: wrap;
          }

          .login-orb-1 {
            width: 400px;
            height: 400px;
            top: -100px;
            right: -80px;
          }

          .login-orb-2 {
            width: 300px;
            height: 300px;
            bottom: -80px;
            left: -60px;
          }

          .login-orb-3 {
            width: 200px;
            height: 200px;
          }

          .login-form-side {
            width: 50%;
            align-items: center;
            padding: 40px;
          }

          .login-card {
            padding: 40px;
            border-radius: 24px;
          }

          .login-logo {
            width: 72px;
            height: 72px;
            border-radius: 22px;
          }

          .login-logo-text {
            font-size: 2rem;
          }

          .login-title {
            font-size: 2rem;
          }
        }

        /* ===== LARGE DESKTOP (1280px+) ===== */
        @media (min-width: 1280px) {
          .login-hero-content {
            padding: 80px;
          }

          .login-hero-title {
            font-size: 3.25rem;
          }

          .login-hero-subtitle {
            font-size: 1.1rem;
          }
        }

        /* ===== SMALL MOBILE ===== */
        @media (max-width: 380px) {
          .demo-buttons {
            flex-direction: column !important;
          }
          .demo-btn {
            width: 100% !important;
          }
        }

        /* Floating animation keyframe */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};
