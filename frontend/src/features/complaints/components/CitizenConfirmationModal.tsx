// frontend/src/features/complaints/components/CitizenConfirmationModal.tsx
import React, { useState } from 'react';
import { complaintsService } from '../services/complaintsService';
import type { Complaint } from '../../../core/types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface CitizenConfirmationModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CitizenConfirmationModal: React.FC<CitizenConfirmationModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [feedback, setFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolution = complaint.resolution;

  const handleConfirm = async (confirmed: boolean) => {
    setSubmitting(true);
    setError(null);
    try {
      await complaintsService.confirmResolution(complaint.id, confirmed, feedback);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-green-700 font-extrabold text-xs tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Citizen Resolution Sign-Off</span>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">Confirm Incident Repair</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Municipal technicians have completed work on this ticket. Review photographic evidence to certify completion.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Before / After Photo Comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">1. Before (Reported)</span>
            <img
              src={complaint.photoUrl}
              alt="Before"
              className="h-40 w-full object-cover rounded-xl border border-slate-200 bg-slate-100"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-green-700 uppercase">2. After (Repaired)</span>
            <img
              src={
                resolution?.afterPhotoUrl ||
                'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800'
              }
              alt="After Repair"
              className="h-40 w-full object-cover rounded-xl border border-green-300 bg-slate-100 shadow-sm"
            />
          </div>
        </div>

        {/* AI Confidence Meter */}
        {resolution?.aiSimilarityScore && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-blue-900">Gemini Vision AI Evaluation</div>
              <div className="text-blue-700 text-[11px]">Hazard removal probability confirmed</div>
            </div>
            <span className="text-base font-black text-blue-700">
              {Math.round(resolution.aiSimilarityScore * 100)}% Match
            </span>
          </div>
        )}

        {/* Feedback Notes Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Citizen Feedback &amp; Quality Notes</label>
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Add any comments about the repair quality or neighborhood observations..."
            className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleConfirm(false)}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            <span>Dispute / Not Fixed</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleConfirm(true)}
            className="btn-stitch-primary text-xs flex items-center justify-center gap-2 p-3 shadow-green-500/25"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Confirm &amp; Sign-Off</span>
          </button>
        </div>
      </div>
    </div>
  );
};
