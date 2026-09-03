// frontend/src/components/CreateComplaintModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Camera, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { complaintsApi, uploadApi } from '../api/client';
import type { ComplaintCategory } from '../types';

interface CreateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: { label: string; value: ComplaintCategory; icon: string }[] = [
  { label: 'Pothole', value: 'POTHOLE', icon: '🕳️' },
  { label: 'Streetlight', value: 'STREETLIGHT', icon: '💡' },
  { label: 'Garbage Dump', value: 'GARBAGE', icon: '🗑️' },
  { label: 'Water Leakage', value: 'WATER_LEAKAGE', icon: '💧' },
  { label: 'Road Damage', value: 'ROAD_DAMAGE', icon: '🛣️' },
  { label: 'Other Civic Issue', value: 'OTHER', icon: '⚠️' },
];

export const CreateComplaintModal: React.FC<CreateComplaintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [category, setCategory] = useState<ComplaintCategory>('POTHOLE');
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.5946);
  const [address, setAddress] = useState<string>('MG Road, Ward 84, Bengaluru');

  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [detectingGps, setDetectingGps] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleDetectLocation();
    }
  }, [isOpen]);

  const handleDetectLocation = () => {
    setDetectingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`GPS Position: (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setDetectingGps(false);
        },
        () => {
          setLat(12.9716);
          setLng(77.5946);
          setDetectingGps(false);
        }
      );
    } else {
      setDetectingGps(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(selectedFile));

      setUploadingImage(true);
      try {
        const uploadRes = await uploadApi.uploadImage(selectedFile);
        if (uploadRes.data?.url) {
          setPhotoUrl(uploadRes.data.url);
        }
      } catch {
        setPhotoUrl(
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800'
        );
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || description.length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }

    const finalPhoto = photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800';

    setLoading(true);
    setError(null);
    try {
      await complaintsApi.create({
        category,
        description,
        photoUrl: finalPhoto,
        lat,
        lng,
        address,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-panel border border-white/15 p-6 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">60-Second Citizen Report</h3>
              <p className="text-xs text-slate-400">Report civic issues directly to municipal triage</p>
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
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Issue Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    category === cat.value
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-800/50 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Complaint Photo</label>
            <div className="relative border-2 border-dashed border-white/15 rounded-2xl p-4 text-center bg-slate-900/40 hover:border-cyan-500/40 transition-colors">
              {previewUrl ? (
                <div className="relative h-40 rounded-xl overflow-hidden group">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <label className="btn-secondary text-xs cursor-pointer">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-cyan-400">Click to upload</span> or drag photo here
                  </div>
                  <p className="text-[10px] text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Location Coordinates
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {detectingGps ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                GPS Auto-Detect
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or ward"
                className="col-span-2 px-3 py-2 text-xs rounded-xl bg-slate-800/70 border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Issue Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue (e.g. Deep pothole causing traffic slowdown near school gate...)"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800/70 border border-white/10 text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="btn-primary text-xs shadow-cyan-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Issue
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
