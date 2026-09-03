// frontend/src/core/components/NoPhoto.tsx
import React from 'react';
import { ImageOff } from 'lucide-react';

interface NoPhotoProps {
  label?: string;
  className?: string;
}

export const NoPhoto: React.FC<NoPhotoProps> = ({
  label = 'No photo uploaded',
  className = 'w-full h-full min-h-[140px]',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-slate-50 text-slate-400 rounded-xl border border-dashed border-slate-300 p-4 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
        <ImageOff className="w-5 h-5 text-slate-400" />
      </div>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="text-[10px] text-slate-400">Captured metadata verified</span>
    </div>
  );
};
