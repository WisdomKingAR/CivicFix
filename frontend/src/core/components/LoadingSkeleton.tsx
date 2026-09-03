// frontend/src/core/components/LoadingSkeleton.tsx
import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 w-full md:w-auto flex-1">
            <div className="w-20 h-20 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-4/5" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
          <div className="w-28 h-8 bg-slate-200 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );
};

export const MetricSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm animate-pulse flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-20" />
            <div className="h-7 bg-slate-200 rounded w-12" />
          </div>
          <div className="w-11 h-11 bg-slate-200 rounded-xl" />
        </div>
      ))}
    </div>
  );
};
