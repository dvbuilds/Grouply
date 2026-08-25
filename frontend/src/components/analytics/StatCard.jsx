import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon: Icon,
  variant = 'white',
  className = '',
}) {
  if (variant === 'primary') {
    return (
      <div
        className={`bg-[#012d1d] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 relative overflow-hidden text-white ${className}`}
      >
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <div className="flex justify-between items-start relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {title}
          </p>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          {subtitle && (
            <div className="w-full mt-2">
              <p className="text-xs text-white/80 truncate">{subtitle}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'gold') {
    return (
      <div
        className={`bg-[#ffb702] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 relative overflow-hidden text-[#6b4b00] ${className}`}
      >
        <div className="flex justify-between items-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6b4b00]/90">
            {title}
          </p>
          {Icon && <Icon className="w-5 h-5 text-[#6b4b00]" />}
        </div>
        <div>
          <div className="flex items-end gap-2 mb-1">
            <h3 className="text-3xl font-bold tracking-tight text-[#271900]">{value}</h3>
            {trend && (
              <span className="bg-white/60 text-[#6b4b00] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 mb-1">
                <ArrowUpRight className="w-3 h-3" />
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#6b4b00]/80">{subtitle}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'accent') {
    return (
      <div
        className={`bg-[#4361EE] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 relative overflow-hidden text-white ${className}`}
      >
        <div className="flex justify-between items-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {title}
          </p>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        <div>
          <div className="flex items-end gap-2 mb-1">
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {trend && (
              <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 mb-1">
                <ArrowUpRight className="w-3 h-3" />
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'tertiary') {
    return (
      <div
        className={`bg-[#453268] rounded-2xl p-5 soft-shadow hover-lift flex flex-col justify-between h-36 relative overflow-hidden text-white ${className}`}
      >
        <div className="flex justify-between items-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {title}
          </p>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        <div>
          <div className="flex items-end gap-2 mb-1">
            <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
            {trend && (
              <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 mb-1">
                <ArrowUpRight className="w-3 h-3" />
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-white/80">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl p-5 soft-shadow hover-lift border border-[#e1e3e4] flex flex-col justify-between h-36 relative overflow-hidden ${className}`}
    >
      <div className="flex justify-between items-start">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#717973]">
          {title}
        </p>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-[#f3f4f5] text-[#012d1d] flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-[#191c1d] tracking-tight">{value}</h3>
        {trend ? (
          <p
            className={`text-xs font-semibold flex items-center gap-1 mt-1 ${
              trendPositive ? 'text-[#2D6A4F]' : 'text-[#D90429]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {trend}
          </p>
        ) : subtitle ? (
          <p className="text-xs text-[#717973] mt-1">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
