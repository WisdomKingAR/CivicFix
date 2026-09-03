// frontend/src/features/authority/pages/AuthorityTriage.tsx
import React, { useState, useEffect } from 'react';
import { authorityService } from '../services/authorityService';
import { complaintsService } from '../../complaints/services/complaintsService';
import type { Complaint, User } from '../../../core/types';
import { toast } from '../../../core/components/Toast';
import {
  ShieldCheck,
  UserCheck,
  MapPin,
  Clock,
  Camera,
  Upload,
  Loader2,
  Sparkles,
  Filter,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const AuthorityTriage: React.FC = () => {
  const [queue, setQueue] = useState<Complaint[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>('');
  const [uploadingAfterPhoto, setUploadingAfterPhoto] = useState<boolean>(false);
  const [resolveNotes, setResolveNotes] = useState<string>('');
  const [resolving, setResolving] = useState<boolean>(false);

  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignedToId, setAssignedToId] = useState<string>('officer-101');
  const [assigning, setAssigning] = useState<boolean>(false);

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const [queueRes, staffRes] = await Promise.all([
        authorityService.getQueue({
          category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        }),
        authorityService.getStaff().catch(() => ({ data: [] })),
      ]);
      const list = Array.isArray(queueRes.data)
        ? queueRes.data
        : (queueRes.data as any)?.complaints || [];
      setQueue(list);

      const staffList = Array.isArray(staffRes.data)
        ? staffRes.data
        : (staffRes.data as any)?.users || [];
      setStaffUsers(staffList);
    } catch {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [categoryFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await authorityService.updateStatus(id, newStatus);
      toast.success(`Complaint status changed to ${newStatus}`);
      fetchQueue();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleAfterPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingAfterPhoto(true);
      try {
        const uploadRes = await complaintsService.uploadImage(file);
        if (uploadRes.data?.url) {
          setAfterPhotoUrl(uploadRes.data.url);
          toast.success('Verification photo uploaded successfully');
        }
      } catch (err: any) {
        toast.error(err.message || 'Image upload failed. Please try again.');
      } finally {
        setUploadingAfterPhoto(false);
      }
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!afterPhotoUrl) {
      toast.error('Please upload a repair verification photo before resolving this complaint.');
      return;
    }

    setResolving(true);
    try {
      await authorityService.resolveComplaint(selectedComplaint.id, afterPhotoUrl, resolveNotes);
      toast.success('Complaint successfully marked as RESOLVED.');
      setShowResolveModal(false);
      fetchQueue();
    } catch (err: any) {
      toast.error(err.message || 'Resolution failed');
    } finally {
      setResolving(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setAssigning(true);
    try {
      await authorityService.assignStaff(selectedComplaint.id, assignedToId);
      toast.success('Complaint assigned to staff officer.');
      setShowAssignModal(false);
      fetchQueue();
    } catch (err: any) {
      toast.error(err.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const resolvedCount = queue.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Crew Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#eff4ff] p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-green-500 text-white font-bold flex items-center justify-center text-xl shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900">Crew Alpha-4 Dispatch</span>
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                Active Duty
              </span>
            </div>
            <p className="text-xs text-slate-500">Public Works &amp; Infrastructure Division • Municipal Ward 84</p>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex flex-col min-w-[120px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Assigned Orders</span>
            <span className="font-black text-slate-900 text-lg">{queue.length} Tasks</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex flex-col min-w-[120px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Resolved</span>
            <span className="font-black text-green-700 text-lg">{resolvedCount} Fixes</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 flex flex-col min-w-[120px]">
            <span className="text-[10px] text-slate-500 font-bold uppercase">Route Efficiency</span>
            <span className="font-black text-blue-600 text-lg">94% Optimal</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Priority Assigned Field Tasks</h2>
          <p className="text-xs text-slate-500">PostGIS 500m cluster deduplicated triage queue</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">All Categories</option>
            <option value="POTHOLE">Pothole</option>
            <option value="STREETLIGHT">Streetlight</option>
            <option value="GARBAGE">Garbage</option>
            <option value="WATER_LEAKAGE">Water Leakage</option>
            <option value="ROAD_DAMAGE">Road Damage</option>
          </select>
        </div>
      </div>

      {/* Queue List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs">Fetching triage queue...</div>
      ) : queue.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-900">All Field Orders Clear!</h3>
          <p className="text-xs text-slate-500">No pending work orders assigned in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((comp) => {
            const score = comp.cluster?.priorityScore || 50;
            const isUrgent = score > 70;

            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 flex-1">
                  {comp.photoUrl ? (
                    <img
                      src={comp.photoUrl}
                      alt="Complaint"
                      className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 text-center p-2 shrink-0 bg-slate-50">
                      No Photo
                    </div>
                  )}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                        isUrgent ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isUrgent ? 'Urgent P1' : 'High P2'} • Score: {Math.round(score)}/100
                      </span>
                      <span className="font-bold text-base text-slate-900">
                        {comp.category.replace('_', ' ')}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        comp.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {comp.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{comp.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-green-600" />
                        {comp.address || 'Central Zone'}
                      </span>
                      <span className="flex items-center gap-1 text-purple-600 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        {comp.cluster?.complaintCount || 1} Duplicate Reports
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(comp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 w-full md:w-auto">
                  <select
                    value={comp.status}
                    onChange={(e) => handleStatusChange(comp.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200 outline-none"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="UNDER_REVIEW">UNDER REVIEW</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>

                  <button
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setShowAssignModal(true);
                    }}
                    className="btn-stitch-secondary text-xs py-1.5 px-3"
                  >
                    <UserCheck className="w-4 h-4" />
                    Assign
                  </button>

                  <button
                    onClick={() => {
                      setSelectedComplaint(comp);
                      setShowResolveModal(true);
                    }}
                    className="btn-stitch-primary text-xs py-1.5 px-3 shadow-green-500/20"
                  >
                    <Camera className="w-4 h-4" />
                    Upload Fix &amp; Verify
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Modal with AI Verification */}
      {showResolveModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Submit Repair Photo &amp; Trigger AI Verification
            </h3>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  After-Repair Photo (On-Site Repair Proof)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                  {afterPhotoUrl ? (
                    <img src={afterPhotoUrl} alt="After Fix" className="h-36 w-full object-cover rounded-lg" />
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                      {uploadingAfterPhoto ? (
                        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6 text-green-600" />
                      )}
                      <span className="text-xs text-green-600 font-bold">Upload Repair Photo</span>
                      <input type="file" accept="image/*" onChange={handleAfterPhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Notes</label>
                <textarea
                  rows={2}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Completed pothole patching work..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowResolveModal(false)} className="btn-stitch-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={resolving} className="btn-stitch-primary text-xs shadow-green-500/25">
                  {resolving ? 'AI Evaluating...' : 'Verify & Resolve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Assign Field Officer</h3>
            <form onSubmit={handleAssignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Officer</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200"
                >
                  {staffUsers.length > 0 ? (
                    staffUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.jurisdiction || 'Field Officer'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="officer-101">Officer Ramesh (Road Works)</option>
                      <option value="officer-102">Officer Priya (Electrical)</option>
                      <option value="officer-103">Officer Kumar (Sanitation)</option>
                    </>
                  )}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn-stitch-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={assigning} className="btn-stitch-primary text-xs">
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
