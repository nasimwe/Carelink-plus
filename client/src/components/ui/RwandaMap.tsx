import { useState } from 'react';
import { Building2, Users, Activity, MapPin, Star } from 'lucide-react';

interface ProvinceData {
  id: string;
  name: string;
  displayName: string;
  facilities: number;
  consultations: number;
  activeUsers: number;
}

interface RwandaMapProps {
  facilitiesByProvince?: Record<string, number>;
  consultationsByProvince?: Record<string, number>;
  usersByProvince?: Record<string, number>;
  totalFacilities?: number;
  totalConsultations?: number;
  totalUsers?: number;
  isLoading?: boolean;
}

// Province hotspot positions based on the actual Rwanda SVG map
// SVG viewBox is 682 x 598 - positions calculated as percentage of these dimensions
// Coordinates based on visual center of each province in the SVG
const provinceHotspots: Record<string, { x: number; y: number }> = {
  'Kigali City': { x: 54, y: 47 },       // Central, small province
  'Northern Province': { x: 56, y: 22 }, // Top center
  'Southern Province': { x: 40, y: 78 }, // Bottom center-left
  'Eastern Province': { x: 76, y: 52 },  // Right side
  'Western Province': { x: 18, y: 52 },  // Left side
};

// Get value from record trying multiple possible keys
const getValueForProvince = (record: Record<string, number>, displayName: string): number => {
  const keyVariants: Record<string, string[]> = {
    'Kigali City': ['Kigali City', 'Kigali', 'kigali', 'KIGALI'],
    'Northern Province': ['Northern Province', 'Northern', 'northern', 'North', 'north', 'NORTHERN'],
    'Southern Province': ['Southern Province', 'Southern', 'southern', 'South', 'south', 'SOUTHERN'],
    'Eastern Province': ['Eastern Province', 'Eastern', 'eastern', 'East', 'east', 'EASTERN'],
    'Western Province': ['Western Province', 'Western', 'western', 'West', 'west', 'WESTERN'],
  };

  const keys = keyVariants[displayName] || [displayName];
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }
  return 0;
};

export const RwandaMap = ({
  facilitiesByProvince = {},
  consultationsByProvince = {},
  usersByProvince = {},
  totalFacilities = 0,
  totalConsultations = 0,
  totalUsers = 0,
  isLoading = false,
}: RwandaMapProps) => {
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceData | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<ProvinceData | null>(null);

  // Build province data with normalized lookups
  const provinces: ProvinceData[] = Object.keys(provinceHotspots).map((displayName) => ({
    id: displayName.toLowerCase().replace(/\s+/g, '_'),
    name: displayName.toLowerCase().replace(/\s+/g, '_'),
    displayName,
    facilities: getValueForProvince(facilitiesByProvince, displayName),
    consultations: getValueForProvince(consultationsByProvince, displayName),
    activeUsers: getValueForProvince(usersByProvince, displayName),
  }));

  const handleProvinceClick = (province: ProvinceData) => {
    setSelectedProvince(selectedProvince?.id === province.id ? null : province);
  };

  if (isLoading) {
    return (
      <div
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '670px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280' }}>Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rwanda-map-container">
      {/* Header */}
      <div className="rwanda-map-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="rwanda-map-icon">
            <MapPin size={22} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 className="rwanda-map-title">
              Healthcare Coverage Map
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.8125rem', margin: 0 }}>
              Facility distribution across Rwanda
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="rwanda-map-legend">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '0.6875rem', color: '#6B7280' }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#D1D5DB' }} />
            <span style={{ fontSize: '0.6875rem', color: '#6B7280' }}>No Data</span>
          </div>
        </div>
      </div>

      {/* Map Container — centred, reduced size, pushed to bottom */}
      <div className="rwanda-map-wrapper">
        <div className="rwanda-map-inner">
        {/* Aspect ratio container exactly matching SVG viewBox 682×598 */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '87.68%', /* 598/682 × 100 */
          }}
        >
            {/* Real Rwanda Map Image — fill the container so hotspot % positions are accurate */}
            <img
              src="/rwanda-map.svg"
              alt="Map of Rwanda Provinces"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              }}
            />

            {/* Interactive Province Hotspots */}
            {provinces.map((province) => {
              const hotspot = provinceHotspots[province.displayName];
              const isHovered = hoveredProvince?.id === province.id;
              const isSelected = selectedProvince?.id === province.id;
              const hasData = province.facilities > 0;
              const isKigali = province.displayName === 'Kigali City';

              return (
                <div
                  key={province.id}
                  onClick={() => handleProvinceClick(province)}
                  onMouseEnter={() => setHoveredProvince(province)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  style={{
                    position: 'absolute',
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    zIndex: isHovered || isSelected ? 20 : 10,
                  }}
                >
                  {/* Facility count badge */}
                  <div
                    style={{
                      width: isKigali ? '42px' : '38px',
                      height: isKigali ? '42px' : '38px',
                      borderRadius: '50%',
                      background: hasData
                        ? isKigali
                          ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)'
                          : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
                      border: `3px solid ${isHovered || isSelected ? '#1E3A5F' : 'white'}`,
                      boxShadow: isHovered || isSelected
                        ? '0 8px 25px rgba(0, 0, 0, 0.35), 0 0 0 4px rgba(30, 58, 95, 0.25)'
                        : '0 4px 15px rgba(0, 0, 0, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      transform: isHovered || isSelected ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {isKigali && hasData && <Star size={11} style={{ color: 'white', marginBottom: '1px' }} />}
                    <span
                      style={{
                        fontSize: isKigali ? '0.6875rem' : '0.8125rem',
                        fontWeight: 800,
                        color: 'white',
                        lineHeight: 1,
                      }}
                    >
                      {province.facilities}
                    </span>
                  </div>

                  {/* Pulse animation for active provinces */}
                  {hasData && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: isKigali ? '42px' : '38px',
                        height: isKigali ? '42px' : '38px',
                        borderRadius: '50%',
                        background: isKigali
                          ? 'rgba(251, 191, 36, 0.4)'
                          : 'rgba(16, 185, 129, 0.4)',
                        animation: 'pulse 2s infinite',
                        zIndex: -1,
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Hover tooltip */}
            {hoveredProvince && (
              <div
                className="animate-fade-in"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '18px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #E5E7EB',
                  minWidth: '200px',
                  zIndex: 30,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: hoveredProvince.facilities > 0
                        ? hoveredProvince.displayName === 'Kigali City'
                          ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)'
                          : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {hoveredProvince.displayName === 'Kigali City' ? (
                      <Star size={18} style={{ color: 'white' }} />
                    ) : (
                      <MapPin size={18} style={{ color: hoveredProvince.facilities > 0 ? 'white' : '#6B7280' }} />
                    )}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: '0.9375rem' }}>
                      {hoveredProvince.displayName}
                    </p>
                    {hoveredProvince.displayName === 'Kigali City' && (
                      <p style={{ fontSize: '0.6875rem', color: '#F59E0B', margin: 0, fontWeight: 600 }}>
                        Capital City
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#F0FDF4', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} style={{ color: '#10B981' }} />
                      <span style={{ fontSize: '0.8125rem', color: '#166534' }}>Facilities</span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#166534' }}>
                      {hoveredProvince.facilities}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#EFF6FF', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} style={{ color: '#3B82F6' }} />
                      <span style={{ fontSize: '0.8125rem', color: '#1E40AF' }}>Consultations</span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1E40AF' }}>
                      {hoveredProvince.consultations}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#F5F3FF', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={16} style={{ color: '#8B5CF6' }} />
                      <span style={{ fontSize: '0.8125rem', color: '#5B21B6' }}>Active Users</span>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#5B21B6' }}>
                      {hoveredProvince.activeUsers}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Map attribution */}
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '8px',
                fontSize: '0.625rem',
                color: '#9CA3AF',
                background: 'rgba(255,255,255,0.9)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Source: Wikimedia Commons
            </div>
          </div>
        </div>
      </div>

      {/* Stats Panel — horizontal row below the map */}
      <div className="rwanda-stats-panel">

        {/* National Overview */}
        <div className="rwanda-national-overview">
          <p style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.7, margin: '0 0 10px 0' }}>
            National Overview
          </p>
          <p className="rwanda-national-value">{totalFacilities}</p>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: 0 }}>Healthcare Facilities</p>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
              <span style={{ opacity: 0.7 }}>Province Coverage</span>
              <span style={{ fontWeight: 700 }}>{provinces.filter(p => p.facilities > 0).length}/5</span>
            </div>
          </div>
        </div>

        {/* Province List */}
        <div className="rwanda-province-section">
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0' }}>
            By Province
          </p>
          <div className="rwanda-province-grid">
            {provinces.map((province) => {
              const isKigali = province.displayName === 'Kigali City';
              return (
                <button
                  key={province.id}
                  onClick={() => handleProvinceClick(province)}
                  onMouseEnter={() => setHoveredProvince(province)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: selectedProvince?.id === province.id ? '#EFF6FF' : '#F9FAFB',
                    border: selectedProvince?.id === province.id ? '2px solid #1E3A5F' : '1px solid #E5E7EB',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: province.facilities > 0
                          ? isKigali
                            ? 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)'
                            : 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                          : '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isKigali ? (
                        <Star size={16} style={{ color: 'white' }} />
                      ) : (
                        <span style={{ color: province.facilities > 0 ? 'white' : '#6B7280', fontWeight: 700, fontSize: '0.875rem' }}>
                          {province.facilities}
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.8125rem', margin: '0 0 1px 0' }}>
                        {province.displayName}
                      </p>
                      <p style={{ fontSize: '0.6875rem', color: '#6B7280', margin: 0 }}>
                        {province.facilities} {province.facilities === 1 ? 'facility' : 'facilities'}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: province.consultations > 0
                        ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                        : '#E5E7EB',
                      borderRadius: '20px',
                      color: province.consultations > 0 ? 'white' : '#6B7280',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      minWidth: '36px',
                      textAlign: 'center',
                    }}
                  >
                    {province.consultations}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consultations stat */}
        <div className="rwanda-stat-card rwanda-stat-green">
          <p className="rwanda-stat-value" style={{ color: '#059669' }}>
            {totalConsultations}
          </p>
          <p className="rwanda-stat-label" style={{ color: '#047857' }}>Consultations</p>
        </div>

        {/* Active Users stat */}
        <div className="rwanda-stat-card rwanda-stat-blue">
          <p className="rwanda-stat-value" style={{ color: '#2563EB' }}>
            {totalUsers}
          </p>
          <p className="rwanda-stat-label" style={{ color: '#1D4ED8' }}>Active Users</p>
        </div>

      </div>

      {/* Responsive Styles */}
      <style>{`
        .rwanda-map-container {
          background: white;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }
        .rwanda-map-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }
        .rwanda-map-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px -5px rgba(30, 58, 95, 0.4);
          flex-shrink: 0;
        }
        .rwanda-map-title {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 2px 0;
        }
        .rwanda-map-legend {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rwanda-map-wrapper {
          margin-top: auto;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        .rwanda-map-inner {
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%);
          border: 1px solid #E5E7EB;
          padding: 10px;
        }
        .rwanda-stats-panel {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }
        .rwanda-national-overview {
          background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%);
          border-radius: 14px;
          padding: 16px;
          color: white;
          box-shadow: 0 10px 30px -5px rgba(30, 58, 95, 0.3);
        }
        .rwanda-national-value {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 4px 0;
          line-height: 1;
        }
        .rwanda-province-section {
          display: flex;
          flex-direction: column;
        }
        .rwanda-province-grid {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .rwanda-stat-card {
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .rwanda-stat-green {
          background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
        }
        .rwanda-stat-blue {
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
        }
        .rwanda-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 4px 0;
        }
        .rwanda-stat-label {
          font-size: 0.625rem;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        @media (min-width: 480px) {
          .rwanda-stats-panel {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .rwanda-province-section {
            grid-column: span 2;
          }
          .rwanda-province-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
        }

        @media (min-width: 640px) {
          .rwanda-map-container {
            border-radius: 20px;
            padding: 24px;
          }
          .rwanda-map-header {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .rwanda-map-icon {
            width: 48px;
            height: 48px;
            border-radius: 14px;
          }
          .rwanda-map-title {
            font-size: 1.125rem;
          }
          .rwanda-map-wrapper {
            width: 85%;
          }
          .rwanda-map-inner {
            border-radius: 16px;
            padding: 14px;
          }
          .rwanda-stats-panel {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-top: 20px;
          }
          .rwanda-national-overview {
            border-radius: 16px;
            padding: 20px;
          }
          .rwanda-national-value {
            font-size: 2.25rem;
          }
          .rwanda-stat-card {
            border-radius: 14px;
            padding: 20px;
          }
          .rwanda-stat-value {
            font-size: 2rem;
          }
          .rwanda-stat-label {
            font-size: 0.6875rem;
          }
        }

        @media (min-width: 1024px) {
          .rwanda-map-container {
            border-radius: 24px;
            padding: 32px;
          }
          .rwanda-map-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
          }
          .rwanda-map-title {
            font-size: 1.25rem;
          }
          .rwanda-map-wrapper {
            width: 70%;
          }
          .rwanda-map-inner {
            border-radius: 20px;
            padding: 16px;
          }
          .rwanda-stats-panel {
            display: grid;
            grid-template-columns: 220px 1fr 180px 180px;
            gap: 16px;
            align-items: start;
          }
          .rwanda-province-section {
            grid-column: auto;
          }
          .rwanda-national-overview {
            border-radius: 20px;
            padding: 24px;
          }
          .rwanda-national-value {
            font-size: 2.75rem;
          }
          .rwanda-stat-card {
            border-radius: 16px;
            padding: 24px;
          }
          .rwanda-stat-value {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};
