import { Bell, LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsAPI.getAll({ unreadOnly: true });
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const getRoleBadgeStyle = () => {
    switch (user?.role) {
      case 'specialist':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#93C5FD', borderColor: 'rgba(59, 130, 246, 0.3)' };
      case 'clinician':
        return { background: 'rgba(16, 185, 129, 0.2)', color: '#6EE7B7', borderColor: 'rgba(16, 185, 129, 0.3)' };
      case 'administrator':
        return { background: 'rgba(139, 92, 246, 0.2)', color: '#C4B5FD', borderColor: 'rgba(139, 92, 246, 0.3)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.2)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.3)' };
    }
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const roleBadgeStyle = getRoleBadgeStyle();

  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'specialist': return 'Doctor';
      case 'clinician': return 'Clinical Officer';
      case 'administrator': return 'Administrator';
      default: return user?.role || '';
    }
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'linear-gradient(to right, #1E3A5F, #234b75, #2C5282)',
          color: 'white',
          minHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'white' }}>C+</span>
            </div>
            <span className="hide-mobile" style={{ display: 'none', fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.025em' }}>CareLink+</span>
          </div>
          <p className="hide-mobile" style={{ display: 'none', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', margin: '4px 0 0 0' }}>Healthcare Platform</p>
        </div>

        {/* Desktop Actions */}
        <div
          className="hide-mobile"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            style={{
              position: 'relative',
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 6px',
                  background: '#EF4444',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #1E3A5F',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.2)' }} />

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <UserIcon size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <p style={{ fontWeight: 600, fontSize: '0.9375rem', margin: 0, lineHeight: 1.2 }}>
                {user?.firstName} {user?.lastName}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: roleBadgeStyle.background,
                  color: roleBadgeStyle.color,
                  border: `1px solid ${roleBadgeStyle.borderColor}`,
                  letterSpacing: '0.025em',
                }}
              >
                {getRoleDisplayName()}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={22} />
          </button>
        </div>

        {/* Mobile Actions */}
        <div
          className="show-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {/* Mobile Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            style={{
              position: 'relative',
              padding: '8px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 4px',
                  background: '#EF4444',
                  borderRadius: '8px',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #1E3A5F',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Mobile Logout Button - Always Visible */}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              padding: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#FCA5A5',
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} />
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div
        className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          right: isMobileMenuOpen ? 0 : '-100%',
          width: 'min(280px, 85vw)',
          height: '100vh',
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
          zIndex: 60,
          transition: 'right 0.3s ease',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          color: 'white',
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* User Info */}
        <div style={{ marginTop: '24px', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '16px',
            }}
          >
            <UserIcon size={24} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '1.125rem', margin: '0 0 8px 0' }}>
            {user?.firstName} {user?.lastName}
          </p>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '4px 12px',
              borderRadius: '20px',
              background: roleBadgeStyle.background,
              color: roleBadgeStyle.color,
              border: `1px solid ${roleBadgeStyle.borderColor}`,
            }}
          >
            {getRoleDisplayName()}
          </span>
          {user?.facility?.name && (
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', marginTop: '8px' }}>
              {user.facility.name}
            </p>
          )}
        </div>

        {/* Menu Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => handleNavigation('/notifications')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '0.9375rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.2s ease',
            }}
          >
            <Bell size={20} />
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  minWidth: '24px',
                  height: '24px',
                  padding: '0 8px',
                  background: '#EF4444',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px 16px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#FCA5A5',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 'auto',
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* CSS for responsive header */}
      <style>{`
        @media (min-width: 640px) {
          header {
            padding: 0 24px !important;
            min-height: 72px !important;
          }
          .hide-mobile {
            display: flex !important;
          }
          .show-mobile {
            display: none !important;
          }
        }
        @media (min-width: 1024px) {
          header {
            padding: 0 32px !important;
          }
        }
      `}</style>
    </>
  );
};
