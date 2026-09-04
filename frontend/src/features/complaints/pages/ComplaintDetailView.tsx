import React, { useState, useEffect } from 'react';
import type { Complaint } from '../../../core/types';
import { AISimilarityViewer } from '../../authority/components/AISimilarityViewer';
import { CitizenConfirmationModal } from '../components/CitizenConfirmationModal';
import { complaintsService } from '../services/complaintsService';
import {
  ArrowLeft,
  Share2,
  Printer,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface ComplaintDetailViewProps {
  complaint: Complaint;
  onBack: () => void;
  onRefresh?: () => void;
}

export const ComplaintDetailView: React.FC<ComplaintDetailViewProps> = ({
  complaint,
  onBack,
  onRefresh,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint>(complaint);

  useEffect(() => {
    setCurrentComplaint(complaint);
    complaintsService
      .getById(complaint.id)
      .then((res) => {
        if (res.data) {
          setCurrentComplaint(res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch refreshed complaint details:', err);
      });
  }, [complaint.id]);

  const resolution = currentComplaint.resolution;
  const isResolved = currentComplaint.status === 'RESOLVED';
  const assignedOfficer = currentComplaint.assignments?.[0]?.assignedTo;
  const isAssigned =
    Boolean(assignedOfficer) ||
    ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(currentComplaint.status);
  const assignedLabel = assignedOfficer
    ? `Assigned to ${assignedOfficer.name}`
    : isAssigned
    ? 'Assigned to Municipal Response Team'
    : 'Officer Assignment Pending';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Navigation & Action Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Complaints
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-200 text-slate-800 text-xs font-mono font-bold rounded-full">
              #CIV-{currentComplaint.id.slice(-4).toUpperCase()}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              {currentComplaint.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#eff4ff] p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl shrink-0 border border-slate-200">
              {currentComplaint.category === 'POTHOLE'
                ? '🕳️'
                : currentComplaint.category === 'STREETLIGHT'
                ? '💡'
                : currentComplaint.category === 'GARBAGE'
                ? '🗑️'
                : currentComplaint.category === 'WATER_LEAKAGE'
                ? '🚰'
                : '⚠️'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
                {currentComplaint.category.replace('_', ' ')} Incident
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{currentComplaint.address || 'Central Ward Sector'}</span>
                <span>•</span>
                <span>Public Works Infrastructure</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Incident link copied to clipboard!')}
              className="btn-stitch-secondary text-xs"
            >
              <Share2 className="w-4 h-4" />
              Share Ticket
            </button>
            <button
              onClick={() => window.print()}
              className="btn-stitch-primary text-xs"
            >
              <Printer className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Grid: Timeline & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 5-Step Resolution Timeline */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Resolution Progress Timeline</h2>

            <div className="relative pl-6 space-y-7 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {/* Step 1: Submitted */}
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Submitted by Citizen</div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(currentComplaint.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-6 top-0.5 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Under Municipal Review</div>
                  <div className="text-[11px] text-slate-500">Triage priority formula computed</div>
                </div>
              </div>

              {/* Step 3: Assigned */}
              <div className="relative flex items-start gap-4">
                <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${
                  isAssigned ? 'bg-green-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {assignedLabel}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isAssigned ? 'Field response crew dispatched' : 'Field response team notified'}
                  </div>
                </div>
              </div>

              {/* Step 4: In Progress */}
              <div className="relative flex items-start gap-4">
                <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${
                  currentComplaint.status === 'IN_PROGRESS' || currentComplaint.status === 'RESOLVED'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Maintenance In Progress</div>
                  <div className="text-[11px] text-slate-500">
                    {currentComplaint.status === 'IN_PROGRESS' || currentComplaint.status === 'RESOLVED'
                      ? 'On-site repairs underway or finalized'
                      : 'Awaiting crew arrival'}
                  </div>
                </div>
              </div>

              {/* Step 5: Resolved */}
              <div className="relative flex items-start gap-4">
                <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm ${
                  isResolved ? 'bg-green-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Resolved</span>
                    {isResolved && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-md font-bold">
                        Pending Citizen Validation
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isResolved ? 'Technician marked repair complete. Awaiting sign-off.' : 'Pending repair'}
                  </div>
                </div>
              </div>
            </div>

            {isResolved && (
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="btn-stitch-primary text-xs w-full shadow-green-500/25"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Review &amp; Confirm Repair Sign-Off
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Photo Verification & Metadata */}
        <div className="lg:col-span-6 space-y-6">
          {resolution?.beforePhotoUrl && resolution?.afterPhotoUrl ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Multimodal AI Repair Comparison</h2>
              <AISimilarityViewer
                beforePhotoUrl={resolution.beforePhotoUrl}
                afterPhotoUrl={resolution.afterPhotoUrl}
                aiSimilarityScore={resolution.aiSimilarityScore}
                verificationMethod={resolution.verificationMethod}
                citizenConfirmed={resolution.citizenConfirmed}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Incident Evidence Photo</h2>
              <img
                src={currentComplaint.photoUrl}
                alt="Evidence"
                className="w-full h-64 object-cover rounded-xl border border-slate-200"
              />
            </div>
          )}

          {/* Description & Location Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Incident Details &amp; Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{currentComplaint.description}</p>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Location Coordinates</span>
                <span className="font-mono text-slate-700">
                  {currentComplaint.lat.toFixed(4)}, {currentComplaint.lng.toFixed(4)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Cluster Urgency Score</span>
                <span className="font-bold text-green-700">
                  {Math.round(currentComplaint.cluster?.priorityScore || 50)} / 100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <CitizenConfirmationModal
          complaint={currentComplaint}
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onSuccess={() => {
            setShowConfirmModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};
