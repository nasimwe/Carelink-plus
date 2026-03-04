import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit2, UserX, UserCheck, Users, Mail, Lock, Building2, Phone, Stethoscope, Shield, X, User } from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { adminAPI } from '../../services/api';
import { User as UserType, Facility, UserRole } from '../../types';

export const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: '' as UserRole | '',
    facilityId: '',
    specialty: '',
    phone: '',
  });

  useEffect(() => {
    fetchData();
  }, [search, roleFilter]);

  const fetchData = async () => {
    try {
      const [usersRes, facilitiesRes] = await Promise.all([
        adminAPI.getUsers({ search: search || undefined, role: roleFilter || undefined, limit: 50 }),
        adminAPI.getFacilities({ limit: 100 }),
      ]);
      setUsers(usersRes.data.users);
      setFacilities(facilitiesRes.data.facilities);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role as UserRole,
          facilityId: parseInt(formData.facilityId),
          specialty: formData.specialty || undefined,
          phone: formData.phone || undefined,
        });
      } else {
        await adminAPI.createUser({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role as UserRole,
          facilityId: parseInt(formData.facilityId),
          specialty: formData.specialty || undefined,
          phone: formData.phone || undefined,
        });
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const handleToggleStatus = async (user: UserType) => {
    try {
      await adminAPI.toggleUserStatus(user.id);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const openEditModal = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      facilityId: user.facilityId.toString(),
      specialty: user.specialty || '',
      phone: user.phone || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: '',
      facilityId: '',
      specialty: '',
      phone: '',
    });
  };

  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case UserRole.SPECIALIST:
        return {
          label: 'Doctor',
          bgGradient: 'linear-gradient(135deg, #EBF5FF 0%, #DBEAFE 100%)',
          textColor: '#1E40AF',
          borderColor: '#93C5FD',
          icon: Stethoscope,
        };
      case UserRole.CLINICIAN:
        return {
          label: 'Clinical Officer',
          bgGradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          textColor: '#047857',
          borderColor: '#6EE7B7',
          icon: User,
        };
      case UserRole.ADMINISTRATOR:
        return {
          label: 'Admin',
          bgGradient: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
          textColor: '#6D28D9',
          borderColor: '#C4B5FD',
          icon: Shield,
        };
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

  return (
    <Layout>
      <div className="user-management-container">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          className="btn btn-ghost animate-fade-in back-btn"
          style={{ marginBottom: '16px' }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="animate-fade-in-down user-header" style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <h1 className="user-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              User Management
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8125rem',
                color: '#6B7280'
              }}>
                <Users size={14} />
                {users.length} total
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8125rem',
                color: '#10B981',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10B981',
                }}></span>
                {activeUsers} active
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8125rem',
                color: '#EF4444',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#EF4444',
                }}></span>
                {inactiveUsers} inactive
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary add-user-btn"
            style={{ width: '100%' }}
          >
            <Plus size={18} />
            Add New User
          </button>
        </div>

        {/* Filters */}
        <div
          className="card animate-fade-in-up filter-card"
          style={{
            padding: '14px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            {/* Search */}
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 40px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '18px',
                }}
              >
                <option value="">All Roles</option>
                <option value="specialist">Doctor</option>
                <option value="clinician">Clinical Officer</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List - Mobile Card Layout */}
        <div className="user-list">
          {users.length === 0 ? (
            <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Users size={24} style={{ color: '#9CA3AF' }} />
              </div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>No users found</p>
              <p style={{ fontSize: '0.8125rem', color: '#6B7280', marginTop: '4px' }}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map((user, index) => {
                const roleConfig = getRoleConfig(user.role);
                const RoleIcon = roleConfig.icon;

                return (
                  <div
                    key={user.id}
                    className="card animate-fade-in user-card"
                    style={{
                      padding: '14px',
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* User Header Row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: roleConfig.bgGradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${roleConfig.borderColor}`,
                            flexShrink: 0,
                          }}
                        >
                          <span style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: roleConfig.textColor
                          }}>
                            {user.firstName[0]}{user.lastName[0]}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', marginBottom: '2px' }}>
                            {user.firstName} {user.lastName}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: user.isActive
                            ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                            : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                          border: `1px solid ${user.isActive ? '#6EE7B7' : '#FECACA'}`,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: user.isActive ? '#047857' : '#DC2626',
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: user.isActive ? '#10B981' : '#EF4444',
                          }}
                        ></span>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* User Info Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {/* Role */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: roleConfig.bgGradient,
                          border: `1px solid ${roleConfig.borderColor}`,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: roleConfig.textColor,
                        }}
                      >
                        <RoleIcon size={10} />
                        {roleConfig.label}
                      </span>

                      {/* Specialty */}
                      {user.specialty && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6B7280',
                          background: '#F3F4F6',
                          padding: '4px 8px',
                          borderRadius: '6px',
                        }}>
                          {user.specialty}
                        </span>
                      )}

                      {/* Facility */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6B7280' }}>
                        <Building2 size={12} />
                        {user.facility?.name || 'N/A'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEditModal(user)}
                        className="btn btn-secondary"
                        style={{
                          flex: 1,
                          padding: '10px',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          border: `1px solid ${user.isActive ? '#FECACA' : '#6EE7B7'}`,
                          background: user.isActive ? '#FEF2F2' : '#ECFDF5',
                          color: user.isActive ? '#DC2626' : '#047857',
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '16px',
            }}
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <div
              className="card animate-scale-in"
              style={{
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  background: '#1E3A5F',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {editingUser ? <Edit2 size={22} color="white" /> : <Plus size={22} color="white" />}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {editingUser ? 'Update user information' : 'Create a new user account'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <X size={20} color="white" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Name Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        <User size={16} style={{ color: '#6B7280' }} />
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #E5E7EB',
                          borderRadius: '12px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E5E7EB';
                          e.target.style.boxShadow = 'none';
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        <User size={16} style={{ color: '#6B7280' }} />
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #E5E7EB',
                          borderRadius: '12px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E5E7EB';
                          e.target.style.boxShadow = 'none';
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Email & Password (only for new users) */}
                  {!editingUser && (
                    <>
                      <div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '8px',
                        }}>
                          <Mail size={16} style={{ color: '#6B7280' }} />
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="user@example.com"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3B82F6';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#374151',
                          marginBottom: '8px',
                        }}>
                          <Lock size={16} style={{ color: '#6B7280' }} />
                          Password
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                          placeholder="Minimum 8 characters"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #E5E7EB',
                            borderRadius: '12px',
                            fontSize: '0.9375rem',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#3B82F6';
                            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                          required={!editingUser}
                        />
                      </div>
                    </>
                  )}

                  {/* Role */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      <Shield size={16} style={{ color: '#6B7280' }} />
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '20px',
                      }}
                      required
                    >
                      <option value="">Select a role</option>
                      <option value="specialist">Doctor</option>
                      <option value="clinician">Clinical Officer</option>
                      <option value="administrator">Administrator</option>
                    </select>
                  </div>

                  {/* Facility */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      <Building2 size={16} style={{ color: '#6B7280' }} />
                      Facility
                    </label>
                    <select
                      value={formData.facilityId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, facilityId: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '20px',
                      }}
                      required
                    >
                      <option value="">Select a facility</option>
                      {facilities.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specialty (only for specialists) */}
                  {formData.role === UserRole.SPECIALIST && (
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '8px',
                      }}>
                        <Stethoscope size={16} style={{ color: '#6B7280' }} />
                        Specialty
                      </label>
                      <input
                        type="text"
                        value={formData.specialty}
                        onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
                        placeholder="e.g., Cardiology, Oncology"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid #E5E7EB',
                          borderRadius: '12px',
                          fontSize: '0.9375rem',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6';
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E5E7EB';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Phone */}
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '8px',
                    }}>
                      <Phone size={16} style={{ color: '#6B7280' }} />
                      Phone Number
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+250 788 000 000"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #E5E7EB',
                        borderRadius: '12px',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3B82F6';
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid #F3F4F6',
                }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '12px 20px', width: '100%' }}
                  >
                    {editingUser ? 'Save Changes' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '12px 20px',
                      width: '100%',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Responsive styles for User Management */}
      <style>{`
        @media (min-width: 640px) {
          .user-header {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .user-header > div:first-child {
            margin-bottom: 0 !important;
          }
          .add-user-btn {
            width: auto !important;
          }
          .user-title {
            font-size: 1.875rem !important;
          }
          .filter-card {
            padding: 20px !important;
          }
          .filter-card > div {
            flex-direction: row !important;
          }
          .filter-card input,
          .filter-card select {
            min-width: 200px;
          }
          .user-card {
            padding: 20px !important;
          }
          .modal-footer {
            flex-direction: row-reverse !important;
          }
          .modal-footer button {
            width: auto !important;
            flex: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};
