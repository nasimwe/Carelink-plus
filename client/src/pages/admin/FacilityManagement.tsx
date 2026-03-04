import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Edit2, Building2, Phone, Mail,
  MapPin, X, PowerOff, Power, Hospital,
} from 'lucide-react';
import { Layout } from '../../components/Layout/Layout';
import { adminAPI } from '../../services/api';
import { Facility, FacilityType } from '../../types';

export const FacilityManagement = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '' as FacilityType | '',
    district: '',
    province: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchData();
  }, [search, typeFilter]);

  const fetchData = async () => {
    try {
      const res = await adminAPI.getFacilities({
        search: search || undefined,
        type: typeFilter || undefined,
        limit: 100,
      });
      setFacilities(res.data.facilities);
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFacility) {
        await adminAPI.updateFacility(editingFacility.id, {
          name: formData.name,
          type: formData.type as FacilityType,
          district: formData.district,
          province: formData.province,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        });
      } else {
        await adminAPI.createFacility({
          name: formData.name,
          type: formData.type as FacilityType,
          district: formData.district,
          province: formData.province,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        });
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save facility:', error);
    }
  };

  const handleToggleStatus = async (facility: Facility) => {
    try {
      await adminAPI.updateFacility(facility.id, { isActive: !facility.isActive });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle facility status:', error);
    }
  };

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      type: facility.type,
      district: facility.district,
      province: facility.province,
      address: facility.address || '',
      phone: facility.phone || '',
      email: facility.email || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingFacility(null);
    setFormData({
      name: '',
      type: '',
      district: '',
      province: '',
      address: '',
      phone: '',
      email: '',
    });
  };

  const getTypeConfig = (type: FacilityType) => {
    switch (type) {
      case FacilityType.REFERRAL_HOSPITAL:
        return {
          label: 'Referral Hospital',
          bgGradient: 'linear-gradient(135deg, #EBF5FF 0%, #DBEAFE 100%)',
          textColor: '#1E40AF',
          borderColor: '#93C5FD',
          iconColor: '#3B82F6',
        };
      case FacilityType.DISTRICT_HOSPITAL:
        return {
          label: 'District Hospital',
          bgGradient: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
          textColor: '#6D28D9',
          borderColor: '#C4B5FD',
          iconColor: '#8B5CF6',
        };
      case FacilityType.HEALTH_CENTER:
        return {
          label: 'Health Center',
          bgGradient: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          textColor: '#047857',
          borderColor: '#6EE7B7',
          iconColor: '#10B981',
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

  const activeFacilities = facilities.filter((f) => f.isActive).length;
  const inactiveFacilities = facilities.filter((f) => !f.isActive).length;

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: 600 as const,
    color: '#374151',
    marginBottom: '8px',
  };

  return (
    <Layout>
      <div className="facility-management-container space-y-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          className="btn btn-ghost group animate-fade-in"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-down">
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>
              Facility Management
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#6B7280' }}>
                <Building2 size={16} />
                {facilities.length} total facilities
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#10B981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                {activeFacilities} active
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#EF4444' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
                {inactiveFacilities} inactive
              </span>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn btn-primary group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Add New Facility
          </button>
        </div>

        {/* Filters */}
        <div
          className="card animate-fade-in-up"
          style={{ padding: '20px', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}
        >
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
              <Search
                size={20}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by facility name..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 46px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#1E3A5F'; e.target.style.boxShadow = '0 0 0 3px rgba(30, 58, 95, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ minWidth: '200px' }}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '0.9375rem',
                  background: 'white',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px',
                }}
              >
                <option value="">All Types</option>
                <option value="referral_hospital">Referral Hospital</option>
                <option value="district_hospital">District Hospital</option>
                <option value="health_center">Health Center</option>
              </select>
            </div>
          </div>
        </div>

        {/* Facilities Table (Desktop) / Card Layout (Mobile) */}
        <div className="card animate-fade-in-up" style={{ overflow: 'hidden', animationDelay: '100ms' }}>
          {/* Table Header - Desktop Only */}
          <div className="facility-table-header">
            {['Name', 'Type', 'Location', 'Contact', 'Status', 'Actions'].map((header, i) => (
              <span
                key={header}
                style={{
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  textAlign: i === 5 ? 'right' : 'left',
                }}
              >
                {header}
              </span>
            ))}
          </div>

          {/* Facilities List */}
          <div>
            {facilities.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Building2 size={28} style={{ color: '#9CA3AF' }} />
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>No facilities found</p>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '4px' }}>
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              facilities.map((facility, index) => {
                const typeConfig = getTypeConfig(facility.type);
                return (
                  <div
                    key={facility.id}
                    className="animate-fade-in facility-row"
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Desktop Row Layout */}
                    <div className="facility-desktop-row">
                      {/* Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: typeConfig.bgGradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `1px solid ${typeConfig.borderColor}`,
                            flexShrink: 0,
                          }}
                        >
                          <Hospital size={18} style={{ color: typeConfig.iconColor }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', margin: 0 }}>
                            {facility.name}
                          </p>
                          {facility.address && (
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{facility.address}</p>
                          )}
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: typeConfig.bgGradient,
                            border: `1px solid ${typeConfig.borderColor}`,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: typeConfig.textColor,
                          }}
                        >
                          {typeConfig.label}
                        </span>
                      </div>

                      {/* Location */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <MapPin size={14} style={{ color: '#9CA3AF', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#4B5563', margin: 0, fontWeight: 500 }}>
                            {facility.district}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>{facility.province}</p>
                        </div>
                      </div>

                      {/* Contact */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {facility.phone ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={12} style={{ color: '#9CA3AF' }} />
                            <span style={{ fontSize: '0.8125rem', color: '#4B5563' }}>{facility.phone}</span>
                          </div>
                        ) : null}
                        {facility.email ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Mail size={12} style={{ color: '#9CA3AF' }} />
                            <span style={{ fontSize: '0.8125rem', color: '#4B5563' }}>{facility.email}</span>
                          </div>
                        ) : null}
                        {!facility.phone && !facility.email && (
                          <span style={{ fontSize: '0.8125rem', color: '#D1D5DB' }}>No contact info</span>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: facility.isActive
                              ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                              : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                            border: `1px solid ${facility.isActive ? '#6EE7B7' : '#FECACA'}`,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: facility.isActive ? '#047857' : '#DC2626',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: facility.isActive ? '#10B981' : '#EF4444',
                            }}
                          ></span>
                          {facility.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(facility); }}
                          className="facility-action-btn"
                          title="Edit facility"
                        >
                          <Edit2 size={16} style={{ color: '#1E3A5F' }} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(facility); }}
                          className="facility-action-btn"
                          title={facility.isActive ? 'Deactivate facility' : 'Activate facility'}
                        >
                          {facility.isActive ? (
                            <PowerOff size={16} style={{ color: '#EF4444' }} />
                          ) : (
                            <Power size={16} style={{ color: '#10B981' }} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="facility-mobile-card">
                      {/* Header with Name and Status */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              background: typeConfig.bgGradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${typeConfig.borderColor}`,
                              flexShrink: 0,
                            }}
                          >
                            <Hospital size={18} style={{ color: typeConfig.iconColor }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem', margin: 0 }}>
                              {facility.name}
                            </p>
                            {facility.address && (
                              <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{facility.address}</p>
                            )}
                          </div>
                        </div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            background: facility.isActive
                              ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                              : 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
                            border: `1px solid ${facility.isActive ? '#6EE7B7' : '#FECACA'}`,
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: facility.isActive ? '#047857' : '#DC2626',
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: facility.isActive ? '#10B981' : '#EF4444' }}></span>
                          {facility.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Info Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: typeConfig.bgGradient,
                            border: `1px solid ${typeConfig.borderColor}`,
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: typeConfig.textColor,
                          }}
                        >
                          {typeConfig.label}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6B7280' }}>
                          <MapPin size={12} />
                          {facility.district}, {facility.province}
                        </span>
                      </div>

                      {/* Contact Info */}
                      {(facility.phone || facility.email) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', fontSize: '0.75rem', color: '#6B7280' }}>
                          {facility.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Phone size={12} />
                              <span>{facility.phone}</span>
                            </div>
                          )}
                          {facility.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Mail size={12} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{facility.email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(facility); }}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '10px', fontSize: '0.8125rem' }}
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(facility); }}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: `1px solid ${facility.isActive ? '#FECACA' : '#6EE7B7'}`,
                            background: facility.isActive ? '#FEF2F2' : '#ECFDF5',
                            color: facility.isActive ? '#DC2626' : '#047857',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          {facility.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                          {facility.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div
            className="animate-fade-in"
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, padding: '16px',
            }}
            onClick={() => { setShowModal(false); resetForm(); }}
          >
            <div
              className="card animate-scale-in"
              style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', padding: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  background: '#1E3A5F',
                  padding: '24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {editingFacility ? <Edit2 size={22} color="white" /> : <Plus size={22} color="white" />}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', margin: 0 }}>
                      {editingFacility ? 'Edit Facility' : 'Add New Facility'}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                      {editingFacility ? 'Update facility information' : 'Register a new healthcare facility'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.2)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                >
                  <X size={20} color="white" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>
                      <Building2 size={16} style={{ color: '#6B7280' }} />
                      Facility Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Kigali University Teaching Hospital"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label style={labelStyle}>
                      <Hospital size={16} style={{ color: '#6B7280' }} />
                      Facility Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as FacilityType }))}
                      style={{
                        ...inputStyle,
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '20px',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                      required
                    >
                      <option value="">Select a type</option>
                      <option value="referral_hospital">Referral Hospital</option>
                      <option value="district_hospital">District Hospital</option>
                      <option value="health_center">Health Center</option>
                    </select>
                  </div>

                  {/* District & Province */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>
                        <MapPin size={16} style={{ color: '#6B7280' }} />
                        District
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData((prev) => ({ ...prev, district: e.target.value }))}
                        placeholder="e.g., Gasabo"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        <MapPin size={16} style={{ color: '#6B7280' }} />
                        Province
                      </label>
                      <input
                        type="text"
                        value={formData.province}
                        onChange={(e) => setFormData((prev) => ({ ...prev, province: e.target.value }))}
                        placeholder="e.g., Kigali City"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                        required
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label style={labelStyle}>
                      <MapPin size={16} style={{ color: '#6B7280' }} />
                      Address
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address or P.O. Box"
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Phone & Email */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>
                        <Phone size={16} style={{ color: '#6B7280' }} />
                        Phone
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+250 788 000 000"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        <Mail size={16} style={{ color: '#6B7280' }} />
                        Email
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="facility@example.com"
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div
                  style={{
                    display: 'flex', justifyContent: 'flex-end', gap: '12px',
                    marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F3F4F6',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '12px 24px' }}
                  >
                    {editingFacility ? 'Save Changes' : 'Create Facility'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Responsive styles for Facility Management */}
      <style>{`
        .facility-management-container {
          padding: 16px;
        }
        .facility-table-header {
          display: none;
        }
        .facility-desktop-row {
          display: none;
        }
        .facility-mobile-card {
          display: block;
          padding: 14px;
        }
        .facility-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .facility-action-btn:hover {
          background: #EFF6FF;
          border-color: #1E3A5F;
        }

        @media (min-width: 640px) {
          .facility-management-container {
            padding: 20px;
          }
        }

        @media (min-width: 1024px) {
          .facility-management-container {
            padding: 24px 32px;
          }
          .facility-table-header {
            display: grid;
            grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 1fr 120px;
            gap: 16px;
            align-items: center;
            background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%);
            padding: 16px 24px;
          }
          .facility-desktop-row {
            display: grid;
            grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 1fr 120px;
            gap: 16px;
            align-items: center;
            padding: 16px 24px;
            transition: all 0.2s ease;
          }
          .facility-desktop-row:hover {
            background: linear-gradient(90deg, #EFF6FF 0%, transparent 100%);
          }
          .facility-mobile-card {
            display: none;
          }
        }
      `}</style>
    </Layout>
  );
};
