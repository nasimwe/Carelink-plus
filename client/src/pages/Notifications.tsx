import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Check, Trash2, AlertCircle,
  MessageSquare, FileText, CheckCheck, BellOff,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { notificationsAPI } from '../services/api';
import { Notification } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getAll({ limit: 50 });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    const data = notification.data as { consultationId?: number };
    if (data?.consultationId) {
      const basePath = user?.role === 'specialist' ? '/specialist' : '/clinician';
      navigate(`${basePath}/consultation/${data.consultationId}`);
    }
  };

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'new_consultation':
        return {
          icon: AlertCircle,
          bg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          iconColor: '#EA580C',
          accent: '#F97316',
          label: 'New Consultation',
        };
      case 'consultation_response':
        return {
          icon: MessageSquare,
          bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          iconColor: '#059669',
          accent: '#10B981',
          label: 'Response Received',
        };
      case 'patient_assigned':
        return {
          icon: FileText,
          bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          iconColor: '#2563EB',
          accent: '#3B82F6',
          label: 'Patient Assigned',
        };
      default:
        return {
          icon: Bell,
          bg: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
          iconColor: '#6B7280',
          accent: '#9CA3AF',
          label: 'Notification',
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
            <p style={{ color: '#6B7280', fontSize: '0.9375rem' }}>Loading notifications...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="notifications-container">

        {/* Back button */}
        <button
          onClick={() => {
            const path = user?.role === 'specialist' ? '/specialist' : user?.role === 'administrator' ? '/admin' : '/clinician';
            navigate(path);
          }}
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

        {/* Hero Header */}
        <div
          className="animate-fade-in-down"
          style={{
            background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 50%, #1E3A5F 100%)',
            borderRadius: '28px',
            padding: '40px 48px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(30, 58, 95, 0.4)',
          }}
        >
          {/* Background decorations */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                }}
              >
                <Bell size={28} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      minWidth: '22px',
                      height: '22px',
                      padding: '0 6px',
                      background: '#EF4444',
                      borderRadius: '11px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #1E3A5F',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.025em' }}>
                  Notifications
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.85, fontSize: '0.9375rem' }}>
                  {unreadCount > 0 ? (
                    <>
                      <span style={{ width: '8px', height: '8px', background: '#60A5FA', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                      {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                    </>
                  ) : (
                    <>
                      <CheckCheck size={16} style={{ color: '#34D399' }} />
                      All caught up — no unread notifications
                    </>
                  )}
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div
            className="animate-scale-in"
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '64px 32px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <BellOff size={32} style={{ color: '#9CA3AF' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 8px 0' }}>
              No notifications yet
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.9375rem', margin: 0, lineHeight: 1.6 }}>
              You're all caught up! We'll notify you when something new happens.
            </p>
          </div>
        ) : (
          <div
            className="animate-fade-in-up"
            style={{
              background: 'white',
              borderRadius: '24px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}
          >
            {notifications.map((notification, index) => {
              const config = getNotificationConfig(notification.type);
              const Icon = config.icon;
              const isUnread = !notification.isRead;

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="animate-fade-in-up"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '20px 24px',
                    background: isUnread
                      ? 'linear-gradient(to right, #EFF6FF, #F8FAFF)'
                      : 'white',
                    borderBottom: index < notifications.length - 1 ? '1px solid #F3F4F6' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    position: 'relative',
                    animationDelay: `${index * 40}ms`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = isUnread ? '#EFF6FF' : '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = isUnread
                      ? 'linear-gradient(to right, #EFF6FF, #F8FAFF)'
                      : 'white';
                  }}
                >
                  {/* Unread indicator bar */}
                  {isUnread && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '4px',
                        background: 'linear-gradient(180deg, #1E3A5F, #2C5282)',
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: config.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: `1px solid ${config.accent}20`,
                    }}
                  >
                    <Icon size={22} style={{ color: config.iconColor }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <p
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: isUnread ? 700 : 500,
                            color: isUnread ? '#111827' : '#374151',
                            margin: 0,
                            lineHeight: 1.3,
                          }}
                        >
                          {notification.title}
                        </p>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: config.bg,
                            color: config.iconColor,
                            border: `1px solid ${config.accent}30`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          color: '#9CA3AF',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        margin: 0,
                        lineHeight: 1.6,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div
                    className="notification-actions"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        title="Mark as read"
                        style={{
                          width: '34px',
                          height: '34px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          color: '#6B7280',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ECFDF5';
                          e.currentTarget.style.color = '#059669';
                          e.currentTarget.style.borderColor = '#A7F3D0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#6B7280';
                          e.currentTarget.style.borderColor = '#E5E7EB';
                        }}
                      >
                        <Check size={15} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      title="Delete"
                      style={{
                        width: '34px',
                        height: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        color: '#6B7280',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEF2F2';
                        e.currentTarget.style.color = '#DC2626';
                        e.currentTarget.style.borderColor = '#FECACA';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6B7280';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        div:hover > .notification-actions,
        div:focus-within > .notification-actions {
          opacity: 1 !important;
        }

        .notifications-container {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 860px;
        }

        @media (min-width: 640px) {
          .notifications-container {
            padding: 20px;
            gap: 28px;
          }
        }

        @media (min-width: 1024px) {
          .notifications-container {
            padding: 24px 32px;
            gap: 32px;
          }
        }
      `}</style>
    </Layout>
  );
};
