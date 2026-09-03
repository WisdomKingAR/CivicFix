// frontend/src/features/complaints/components/CreateComplaintModal.tsx
import React, { useState } from 'react';
import { complaintsService } from '../services/complaintsService';
import type { ComplaintCategory } from '../../../core/types';
import {
  X,
  Camera,
  MapPin,
  Sparkles,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface CreateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { label: string; value: ComplaintCategory; icon: string }[] = [
  { label: 'Pothole & Roads', value: 'POTHOLE', icon: '🕳️' },
  { label: 'Streetlight Outages', value: 'STREETLIGHT', icon: '💡' },
  { label: 'Garbage & Waste Overflow', value: 'GARBAGE', icon: '🗑️' },
  { label: 'Water Leakage & Drainage', value: 'WATER_LEAKAGE', icon: '💧' },
  { label: 'Road Sign & Traffic Damage', value: 'ROAD_DAMAGE', icon: '🛣️' },
  { label: 'Other Hazards', value: 'OTHER', icon: '⚠️' },
];

export const CreateComplaintModal: React.FC<CreateComplaintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState<ComplaintCategory>('POTHOLE');
  const [description, setDescription] = useState<string>('');
  const [address, setAddress] = useState<string>('Central Ward, Bangalore');
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.5946);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingPhoto(true);
      setError(null);
      try {
        const uploadRes = await complaintsService.uploadImage(file);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of the issue.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await complaintsService.create({
        category,
        description,
        lat,
        lng,
        address,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-green-700 font-extrabold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Instant Civic Dispatch</span>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">Report a Civic Problem</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit photographic evidence and GPS coordinates for immediate municipal dispatch.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Issue Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    category === cat.value
                      ? 'border-green-600 bg-green-50/70 text-green-900 font-bold shadow-sm'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Issue Photo Evidence</label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
              {photoUrl ? (
                <div className="relative group">
                  <img src={photoUrl} alt="Uploaded" className="h-40 w-full object-cover rounded-xl shadow-sm" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-md text-xs font-bold"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 py-4">
                  {uploadingPhoto ? (
                    <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-green-600" />
                  )}
                  <div className="text-xs font-bold text-slate-800">
                    {uploadingPhoto ? 'Uploading to secure storage...' : 'Click to snap or upload a photo'}
                  </div>
                  <div className="text-[11px] text-slate-400">PNG, JPG or WEBP up to 5MB</div>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Problem Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard (depth, street landmark, danger to vehicles)..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Address / Neighborhood</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-green-600 absolute left-3 top-3" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="100ft Road, Indiranagar"
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-stitch-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="btn-stitch-primary text-xs shadow-green-500/25"
            >
              {submitting ? 'Dispatching Ticket...' : 'Submit Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
