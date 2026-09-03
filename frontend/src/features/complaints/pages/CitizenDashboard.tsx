// frontend/src/features/complaints/pages/CitizenDashboard.tsx
import React, { useState, useEffect } from 'react';
import { complaintsService } from '../services/complaintsService';
import type { Complaint } from '../../../core/types';
import { CitizenConfirmationModal } from '../components/CitizenConfirmationModal';
import { CardSkeleton, MetricSkeleton } from '../../../core/components/LoadingSkeleton';
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
} from 'lucide-react';

interface CitizenDashboardProps {
  onOpenReportModal: () => void;
  onInspectComplaint?: (comp: Complaint) => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onOpenReportModal,
  onInspectComplaint,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintsService.getMyComplaints();
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data as any)?.complaints || [];
      setComplaints(list);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleOpenConfirm = (e: React.MouseEvent, comp: Complaint) => {
    e.stopPropagation();
    setSelectedComplaint(comp);
    setShowConfirmModal(true);
  };

  const safeComplaints = Array.isArray(complaints) ? complaints : [];

  const filtered = safeComplaints.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const activeCount = safeComplaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;
  const inProgressCount = safeComplaints.filter((c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
  const resolvedCount = safeComplaints.filter((c) => c.status === 'RESOLVED').length;

  const avgFixDays =
    resolvedCount > 0
      ? (
          safeComplaints
            .filter((c) => c.status === 'RESOLVED')
            .reduce(
              (acc, c) => acc + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()),
              0
            ) /
          resolvedCount /
          (1000 * 60 * 60 * 24)
        ).toFixed(1)
      : '1.4';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#eff4ff] p-6 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">My Reported Issues</h1>
            <span className="px-3 py-1 bg-white text-slate-700 text-xs rounded-full font-bold border border-slate-200">
              {complaints.length} Total Reports
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track live status, municipal dispatch updates, and resolution proofs for your tickets.
          </p>
        </div>

        <button onClick={onOpenReportModal} className="btn-stitch-primary text-xs shadow-green-500/20">
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </button>
      </div>

      {/* Quick Metrics Summary */}
      {loading ? (
        <MetricSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Active Reports</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{activeCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Hourglass className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">In Progress</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{inProgressCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Resolved</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{resolvedCount}</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">Avg. Fix Speed</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{avgFixDays} Days</div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keyword or address..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">Status: All Statuses</option>
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
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3 shadow-sm">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No reported issues found</h3>
          <p className="text-xs text-slate-500">Submit your first civic complaint to begin live tracking.</p>
          <button onClick={onOpenReportModal} className="btn-stitch-primary text-xs mx-auto">
            Report Issue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((comp) => (
            <div
              key={comp.id}
              onClick={() => onInspectComplaint && onInspectComplaint(comp)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 cursor-pointer"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={comp.photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800'}
                  alt="Issue"
                  className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
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

              <div className="flex items-center gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {comp.status === 'RESOLVED' && (
                  <button
                    onClick={(e) => handleOpenConfirm(e, comp)}
                    className="btn-stitch-primary text-xs w-full md:w-auto"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Review &amp; Confirm Repair Fix
                  </button>
                )}
              </div>
            </div>
          ))}
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
