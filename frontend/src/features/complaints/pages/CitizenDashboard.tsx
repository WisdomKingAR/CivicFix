// frontend/src/features/complaints/pages/CitizenDashboard.tsx
import React, { useState, useEffect } from 'react';
import { complaintsService } from '../services/complaintsService';
import type { Complaint } from '../../../core/types';
import { CitizenConfirmationModal } from '../components/CitizenConfirmationModal';
import { CardSkeleton, MetricSkeleton } from '../../../core/components/LoadingSkeleton';
import { NoPhoto } from '../../../core/components/NoPhoto';
import {
  FileText,
  PlusCircle,
  MapPin,
  ShieldCheck,
  Search,
  Clock,
  CheckCircle2,
  Hourglass,
  Wrench,
  Calendar,
  Sparkles,
  Building2,
} from 'lucide-react';

interface CitizenDashboardProps {
  onOpenReportModal: () => void;
  onInspectComplaint?: (comp: Complaint) => void;
}

const STATUS_TRAIL = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onOpenReportModal,
  onInspectComplaint,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintsService.getMyComplaints();
      const rawData = res.data;
      if (Array.isArray(rawData)) {
        setComplaints(rawData);
      } else if (rawData && Array.isArray((rawData as any).complaints)) {
        setComplaints((rawData as any).complaints);
      } else {
        setComplaints([]);
      }
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((comp) => {
    const matchesStatus = statusFilter === 'ALL' || comp.status === statusFilter;
    const matchesSearch =
      comp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.address && comp.address.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleOpenConfirm = (e: React.MouseEvent, comp: Complaint) => {
    e.stopPropagation();
    setSelectedComplaint(comp);
    setShowConfirmModal(true);
  };

  const submittedCount = complaints.filter((c) => c.status === 'SUBMITTED').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#eff4ff] p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-700" />
            Citizen Grievance Portal
          </h1>
          <p className="text-xs text-slate-500">
            Track reported issues, monitor municipal repair progress, and confirm verified fixes
          </p>
        </div>

        <button onClick={onOpenReportModal} className="btn-stitch-primary text-xs">
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </button>
      </div>

      {/* Metrics Overview Bar */}
      {loading ? (
        <MetricSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{complaints.length} Filed</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center border border-slate-200">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Under Triage</div>
              <div className="text-2xl font-black text-amber-600 mt-1">{submittedCount} Pending</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Hourglass className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Crews</div>
              <div className="text-2xl font-black text-blue-600 mt-1">{inProgressCount} In Repair</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmed Fixed</div>
              <div className="text-2xl font-black text-green-700 mt-1">{resolvedCount} Resolved</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by category, description, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER_REVIEW">UNDER REVIEW</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Complaints List Cards */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">You haven't filed a report yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your city is waiting. 60 seconds is all it takes to report a pothole, outage, or hazard and get it fixed.
          </p>
          <button onClick={onOpenReportModal} className="btn-stitch-primary text-xs mx-auto">
            <PlusCircle className="w-4 h-4" />
            Report Your First Issue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((comp) => {
            const currentStepIdx = STATUS_TRAIL.indexOf(comp.status);

            return (
              <div
                key={comp.id}
                onClick={() => onInspectComplaint && onInspectComplaint(comp)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 cursor-pointer"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {comp.photoUrl ? (
                      <img
                        src={comp.photoUrl}
                        alt="Issue"
                        className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                      />
                    ) : (
                      <div className="w-24 h-24 shrink-0">
                        <NoPhoto className="w-24 h-24" />
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-base text-slate-900">
                          {comp.category.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            comp.status === 'RESOLVED'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : comp.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {comp.status}
                        </span>

                        {comp.status === 'RESOLVED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black rounded-full border border-amber-200">
                            ✦ +10 Ratna Earned
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{comp.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-green-600" />
                          {comp.address || `Lat: ${comp.lat.toFixed(3)}, Lng: ${comp.lng.toFixed(3)}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(comp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    {comp.status === 'RESOLVED' && (
                      <button
                        onClick={(e) => handleOpenConfirm(e, comp)}
                        className="btn-stitch-primary text-xs w-full md:w-auto"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Confirm Fix &amp; Rate
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Progress Trail */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between max-w-lg text-[10px] font-bold text-slate-400">
                    {STATUS_TRAIL.map((step, idx) => {
                      const isCompleted = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;

                      return (
                        <div key={step} className="flex items-center gap-2 flex-1 last:flex-none">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                                isCurrent
                                  ? 'bg-green-600 ring-4 ring-green-100'
                                  : isCompleted
                                  ? 'bg-green-600'
                                  : 'bg-slate-300'
                              }`}
                            />
                            <span className={isCompleted ? 'text-slate-900' : 'text-slate-400'}>
                              {step.replace('_', ' ')}
                            </span>
                          </div>
                          {idx < STATUS_TRAIL.length - 1 && (
                            <div
                              className={`h-0.5 flex-1 mx-1.5 ${
                                currentStepIdx > idx ? 'bg-green-500' : 'bg-slate-200'
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedComplaint && (
        <CitizenConfirmationModal
          complaint={selectedComplaint}
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onSuccess={fetchComplaints}
        />
      )}
    </div>
  );
};
