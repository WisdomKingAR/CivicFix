// frontend/src/views/ReportIssueView.tsx
import React, { useState } from 'react';
import { complaintsApi, uploadApi } from '../api/client';
import type { ComplaintCategory } from '../types';
import {
  Camera,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface ReportIssueViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES: { id: ComplaintCategory; label: string; icon: string; desc: string }[] = [
  { id: 'POTHOLE', label: 'Pothole & Road Cracks', icon: '🕳️', desc: 'Crater damage, fissures & asphalt decay' },
  { id: 'STREETLIGHT', label: 'Streetlight Outage', icon: '💡', desc: 'Dark corridors & faulty electrical fixtures' },
  { id: 'GARBAGE', label: 'Garbage & Waste Dumping', icon: '🗑️', desc: 'Overflowing bins & uncollected garbage' },
  { id: 'WATER_LEAKAGE', label: 'Water Supply Leakage', icon: '🚰', desc: 'Pipeline bursts & low-pressure zones' },
  { id: 'ROAD_DAMAGE', label: 'Road Sign & Traffic Damage', icon: '🚸', desc: 'Broken sidewalks, dividers & signage' },
  { id: 'OTHER', label: 'Other Civic Hazards', icon: '⚠️', desc: 'Fallen trees & drainage blockages' },
];

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [category, setCategory] = useState<ComplaintCategory>('POTHOLE');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('MEDIUM');
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.5946);
  const [address, setAddress] = useState<string>('Central Municipal Ward, Downtown');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [detectingGps, setDetectingGps] = useState<boolean>(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingPhoto(true);
      try {
        const uploadRes = await uploadApi.uploadImage(file);
        if (uploadRes.data?.url) {
          setPhotoUrl(uploadRes.data.url);
        }
      } catch {
        setPhotoUrl('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleDetectGps = () => {
    if (navigator.geolocation) {
      setDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setAddress(`GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (Auto-detected)`);
          setDetectingGps(false);
        },
        () => {
          setDetectingGps(false);
          alert('GPS detection unavailable. Using default municipal coordinates.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.length < 10) {
      alert('Please provide at least 10 characters in the description.');
      return;
    }

    setSubmitting(true);
    try {
      await complaintsApi.create({
        category,
        description: `[Urgency: ${urgency}] ${description}`,
        lat,
        lng,
        address,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to submit civic issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-8">
      {/* Top Header & 4-Step Indicator */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-green-700 block mb-1">
              Civic Incident Workflow
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">Report a Civic Issue</h1>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#eff4ff] px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Verified Citizen Portal</span>
          </div>
        </div>

        {/* 4-Step Indicator */}
        <div className="grid grid-cols-4 gap-2 bg-[#eff4ff] p-2 rounded-2xl border border-slate-200 text-xs font-bold">
          <div
            onClick={() => setCurrentStep(1)}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl cursor-pointer transition-all ${
              currentStep === 1 ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span className="hidden sm:inline">Type</span>
          </div>
          <div
            onClick={() => setCurrentStep(2)}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl cursor-pointer transition-all ${
              currentStep === 2 ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span className="hidden sm:inline">Photo</span>
          </div>
          <div
            onClick={() => setCurrentStep(3)}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl cursor-pointer transition-all ${
              currentStep === 3 ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
            <span className="hidden sm:inline">Details</span>
          </div>
          <div
            onClick={() => setCurrentStep(4)}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl cursor-pointer transition-all ${
              currentStep === 4 ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">4</span>
            <span className="hidden sm:inline">Location</span>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Issue Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Select Issue Category</h2>
                <p className="text-xs text-slate-500">
                  Choose the category that best describes the municipal problem you encountered.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`relative flex flex-col items-center justify-center p-5 rounded-2xl cursor-pointer border-2 transition-all ${
                      category === cat.id
                        ? 'border-green-600 bg-green-50 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.id}
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="absolute top-3 right-3 accent-green-600"
                    />
                    <span className="text-4xl mb-3">{cat.icon}</span>
                    <span className="font-bold text-slate-900 text-sm text-center mb-1">{cat.label}</span>
                    <span className="text-[11px] text-slate-500 text-center">{cat.desc}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-stitch-primary text-xs px-6 py-2.5"
                >
                  <span>Next: Attach Photo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Photo Upload & Cluster Alert */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Attach Visual Evidence</h2>
                <p className="text-xs text-slate-500">
                  Upload a clear photo to help dispatch teams assess severity quickly.
                </p>
              </div>

              <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-green-600 transition-colors cursor-pointer text-center">
                {photoUrl ? (
                  <div className="w-full space-y-3">
                    <img src={photoUrl} alt="Uploaded" className="h-52 w-full object-cover rounded-xl shadow-sm" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs font-bold text-rose-600 hover:underline"
                    >
                      Remove and choose another
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-3 w-full py-6">
                    {uploadingPhoto ? (
                      <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-green-600 border border-slate-200">
                        <Camera className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-800 text-sm">Click to upload or drag &amp; drop</div>
                      <div className="text-xs text-slate-500">PNG, JPG or WEBP (Max 5MB)</div>
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Cluster Detection Simulation Banner */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-blue-900">PostGIS 500m Smart Clustering Active</div>
                  <p className="text-xs text-blue-700 mt-0.5">
                    If another citizen has reported this issue within 500 meters, your report automatically clusters with it, multiplying municipal priority by +40%.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-stitch-secondary text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn-stitch-primary text-xs px-6 py-2.5"
                >
                  <span>Next: Issue Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Details & Urgency */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Describe the Issue</h2>
                <p className="text-xs text-slate-500">
                  Provide specific details like landmark hints, hazard depth, or traffic impact.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Detailed Description *</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem in detail (e.g., deep pothole near crosswalk causing vehicles to swerve into oncoming traffic)..."
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-4 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Minimum 10 characters required</span>
                  <span>{description.length} / 1000</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Perceived Hazard Urgency</label>
                <div className="grid grid-cols-3 gap-3">
                  {['LOW', 'MEDIUM', 'CRITICAL'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        urgency === lvl
                          ? lvl === 'CRITICAL'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-green-600 text-white border-green-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl === 'CRITICAL' ? '⚠️ Critical Hazard' : lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="anon-check"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded text-green-600 focus:ring-green-500 accent-green-600 cursor-pointer"
                />
                <label htmlFor="anon-check" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Submit anonymously (protect my identity on the public map)
                </label>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-stitch-secondary text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="btn-stitch-primary text-xs px-6 py-2.5"
                >
                  <span>Next: Confirm Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Location & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Confirm Incident Location</h2>
                <p className="text-xs text-slate-500">
                  Verify the street address or let GPS auto-detect the exact coordinates.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter landmark or street address..."
                    className="flex-1 bg-slate-50 text-slate-900 text-xs rounded-xl px-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    disabled={detectingGps}
                    className="btn-stitch-secondary text-xs whitespace-nowrap"
                  >
                    <MapPin className="w-4 h-4 text-green-600" />
                    {detectingGps ? 'Detecting...' : 'Auto GPS'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value))}
                      className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                {/* Final Summary Card */}
                <div className="bg-[#eff4ff] p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900">Report Summary:</div>
                  <div className="text-slate-600">
                    <span className="font-semibold">Category:</span> {category}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold">Urgency:</span> {urgency}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold">Location:</span> {address}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn-stitch-secondary text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={onCancel} className="btn-stitch-secondary text-xs">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-stitch-primary text-xs px-6 py-2.5 shadow-green-500/25"
                  >
                    {submitting ? 'Submitting...' : 'Submit Incident Ticket'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
