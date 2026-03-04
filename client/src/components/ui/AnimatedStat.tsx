import { useAnimatedCounter, formatNumber } from '../../hooks/useAnimatedCounter';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface AnimatedStatProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  delay?: number;
  format?: 'number' | 'percentage' | 'time';
}

export const AnimatedStat = ({
  icon: Icon,
  label,
  value,
  suffix = '',
  prefix = '',
  trend,
  color,
  delay = 0,
  format = 'number',
}: AnimatedStatProps) => {
  const animatedValue = useAnimatedCounter(value, { duration: 2000, delay });

  const getDisplayValue = () => {
    if (format === 'percentage') {
      return `${animatedValue}%`;
    }
    if (format === 'time') {
      return `${animatedValue}h`;
    }
    return formatNumber(animatedValue);
  };

  const colorStyles: Record<string, { gradient: string; bg: string; shadow: string; ring: string }> = {
    blue: {
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      bg: '#EFF6FF',
      shadow: 'rgba(59, 130, 246, 0.4)',
      ring: '#3B82F6',
    },
    emerald: {
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      bg: '#ECFDF5',
      shadow: 'rgba(16, 185, 129, 0.4)',
      ring: '#10B981',
    },
    amber: {
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      bg: '#FFFBEB',
      shadow: 'rgba(245, 158, 11, 0.4)',
      ring: '#F59E0B',
    },
    purple: {
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      bg: '#F5F3FF',
      shadow: 'rgba(139, 92, 246, 0.4)',
      ring: '#8B5CF6',
    },
    rose: {
      gradient: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
      bg: '#FFF1F2',
      shadow: 'rgba(244, 63, 94, 0.4)',
      ring: '#F43F5E',
    },
    navy: {
      gradient: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)',
      bg: '#EFF6FF',
      shadow: 'rgba(30, 58, 95, 0.4)',
      ring: '#1E3A5F',
    },
    teal: {
      gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
      bg: '#F0FDFA',
      shadow: 'rgba(20, 184, 166, 0.4)',
      ring: '#14B8A6',
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: 'white',
        borderRadius: '24px',
        padding: '28px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        animationDelay: `${delay}ms`,
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 20px 40px -10px ${style.shadow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)';
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: style.bg,
          borderRadius: '50%',
          opacity: 0.6,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon and Trend Row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: style.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 10px 30px -5px ${style.shadow}`,
            }}
          >
            <Icon size={26} style={{ color: 'white' }} />
          </div>

          {trend && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: trend.isPositive ? '#ECFDF5' : '#FEF2F2',
                color: trend.isPositive ? '#059669' : '#DC2626',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {trend.value}%
            </div>
          )}
        </div>

        {/* Value */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.025em',
              lineHeight: 1,
            }}
          >
            {prefix}{getDisplayValue()}{suffix}
          </span>
        </div>

        {/* Label */}
        <p
          style={{
            fontSize: '0.9375rem',
            fontWeight: 500,
            color: '#6B7280',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </p>

        {/* Progress ring indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: style.bg,
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            className="animate-progress-fill"
            style={{
              height: '100%',
              background: style.gradient,
              borderRadius: '2px',
              width: '100%',
              animation: 'progressFill 2s ease-out forwards',
              animationDelay: `${delay}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
