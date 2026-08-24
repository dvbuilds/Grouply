import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  color = 'auto', // 'auto', 'primary', 'success', 'warning', 'error', 'accent'
  showLabel = false,
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const getColorClass = () => {
    if (color === 'primary') return 'bg-[#012d1d]';
    if (color === 'success') return 'bg-[#2D6A4F]';
    if (color === 'warning') return 'bg-[#FB8500]';
    if (color === 'error') return 'bg-[#D90429]';
    if (color === 'accent') return 'bg-[#4361EE]';
    if (color === 'gold') return 'bg-[#ffb702]';

    // Auto calculate by percentage
    if (percentage >= 80) return 'bg-[#2D6A4F]';
    if (percentage >= 40) return 'bg-[#4361EE]';
    if (percentage > 0) return 'bg-[#FB8500]';
    return 'bg-[#717973]';
  };

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="font-medium text-[#414844]">Progress</span>
          <span className="font-bold text-[#191c1d]">{percentage}%</span>
        </div>
      )}
      <div
        className={`w-full bg-[#e1e3e4] rounded-full overflow-hidden ${
          heightStyles[size] || heightStyles.md
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
