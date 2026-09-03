// frontend/src/components/CitizenConfirmationModal.tsx
import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, MessageSquare, Loader2 } from 'lucide-react';
import { complaintsApi } from '../api/client';
import type { Complaint } from '../types';
import { AISimilarityViewer } from './AISimilarityViewer';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !complaint) return null;

  const resolution = complaint.resolution;

  const handleConfirm = async (confirmed: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await complaintsApi.confirmResolution(complaint.id, confirmed, feedback);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update resolution status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel border border-white/15 p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Confirm Issue Resolution</h3>
              <p className="text-xs text-slate-400">Did the municipal authority fix this issue to your satisfaction?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {resolution ? (
          <div className="mb-4">
            <AISimilarityViewer
              beforePhotoUrl={resolution.beforePhotoUrl || complaint.photoUrl}
              afterPhotoUrl={resolution.afterPhotoUrl}
              aiSimilarityScore={resolution.aiSimilarityScore}
              verificationMethod={resolution.verificationMethod}
              citizenConfirmed={resolution.citizenConfirmed}
            />
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-xl bg-slate-900 border border-white/10 text-center">
            <img src={complaint.photoUrl} alt="Complaint" className="w-full h-40 object-cover rounded-lg mb-2" />
            <p className="text-xs text-slate-400">Original report submitted on {new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            Citizen Feedback (Optional)
          </label>
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback on repair quality..."
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/70 border border-white/10 text-white focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleConfirm(false)}
            className="flex-1 btn-danger text-xs"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject Fix
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleConfirm(true)}
            className="flex-1 btn-primary text-xs shadow-emerald-500/25 bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Confirm Resolution
          </button>
        </div>
      </div>
    </div>
  );
};
