// frontend/src/features/authority/components/AISimilarityViewer.tsx
import React from 'react';
import type { VerificationMethod } from '../../../core/types';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface AISimilarityViewerProps {
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  aiSimilarityScore?: number | null;
  verificationMethod: VerificationMethod;
  citizenConfirmed?: boolean | null;
}

export const AISimilarityViewer: React.FC<AISimilarityViewerProps> = ({
  beforePhotoUrl,
  afterPhotoUrl,
  aiSimilarityScore,
  verificationMethod,
  citizenConfirmed,
}) => {
  const hasScore = aiSimilarityScore !== null && aiSimilarityScore !== undefined;
  const percentage = hasScore ? Math.round((aiSimilarityScore as number) * 100) : null;
  const isHighMatch = percentage !== null && percentage >= 75;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Multimodal AI Repair Auditor</h3>
            <p className="text-[11px] text-slate-400">Gemini 2.0 Flash Visual Similarity Analysis</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-mono font-bold rounded-full border border-green-500/20 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {verificationMethod}
        </span>
      </div>

      {/* Side by Side Photos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
            <span>BEFORE (Incident)</span>
            <span className="text-rose-400">Hazard Reported</span>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40">
            <img src={beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
            <span>AFTER (Resolution)</span>
            <span className="text-green-400">Repairs Applied</span>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/40">
            <img src={afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Score & Validation */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold">Visual Repair Confidence:</span>
            {percentage !== null ? (
              <span className={`text-lg font-black ${isHighMatch ? 'text-green-400' : 'text-amber-400'}`}>
                {percentage}%
              </span>
            ) : (
              <span className="text-sm font-black text-slate-400">
                Not calculated yet
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {percentage === null
              ? 'Upload an after-repair photo to run AI verification.'
              : isHighMatch
              ? 'AI confirmed high structural surface repair alignment and hazard mitigation.'
              : 'Moderate score. Requires field officer supervisor or citizen confirmation.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {citizenConfirmed === true ? (
            <div className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-green-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Citizen Verified</span>
            </div>
          ) : citizenConfirmed === false ? (
            <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-500/30">
              <AlertTriangle className="w-4 h-4" />
              <span>Citizen Disputed</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pending Citizen Review</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
