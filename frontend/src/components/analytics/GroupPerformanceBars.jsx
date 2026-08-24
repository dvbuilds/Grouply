import React from 'react';
import ProgressBar from '../ui/ProgressBar.jsx';

export default function GroupPerformanceBars({ groups = [] }) {
  if (!groups || groups.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#717973]">
        No group performance data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group, index) => {
        const pct = Number(group.completion) || 0;
        const barColor =
          index === 0
            ? 'success'
            : index === 1
            ? 'accent'
            : index === 2
            ? 'warning'
            : 'error';

        return (
          <div key={group.id || group.name} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#191c1d]">{group.name}</span>
              <span className="font-bold text-[#414844]">{pct}%</span>
            </div>
            <ProgressBar value={pct} color={barColor} size="md" />
          </div>
        );
      })}
    </div>
  );
}
