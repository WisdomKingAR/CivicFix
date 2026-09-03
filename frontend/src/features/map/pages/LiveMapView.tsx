// frontend/src/features/map/pages/LiveMapView.tsx
import React, { useState, useEffect } from 'react';
import { InteractiveMap } from '../components/InteractiveMap';
import { mapService } from '../services/mapService';
import { complaintsService } from '../../complaints/services/complaintsService';
import type { GeoJsonFeatureCollection, ComplaintCluster, Complaint } from '../../../core/types';
import {
  Radar,
  MapPin,
  ArrowRight,
  Layers,
  AlertCircle,
} from 'lucide-react';

interface LiveMapViewProps {
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({ onSelectComplaint }) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeatureCollection | null>(null);
  const [clusters, setClusters] = useState<ComplaintCluster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    const loadMapData = async () => {
      setLoading(true);
      try {
        const [geoRes, clusterRes] = await Promise.all([
          mapService.getGeoJsonFeed(),
          mapService.getClusters(),
        ]);
        if (geoRes.data) setGeoJsonData(geoRes.data);
        if (clusterRes.data) setClusters(clusterRes.data);
      } catch (err) {
        console.error('Failed to load live map feed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, []);

  const features = geoJsonData?.features || [];

  const filteredFeatures = features.filter((f) => {
    if (selectedStatus === 'ALL') return true;
    return f.properties.status === selectedStatus;
  });

  const handleSelectById = async (id: string) => {
    if (!onSelectComplaint) return;
    try {
      const res = await complaintsService.getById(id);
      if (res.data) {
        onSelectComplaint(res.data);
      }
    } catch {
      const feature = features.find((f) => f.properties.id === id);
      if (feature) {
        onSelectComplaint({
          id: feature.properties.id,
          userId: 'public-viewer',
          category: feature.properties.category,
          description: feature.properties.description,
          status: feature.properties.status,
          photoUrl: feature.properties.photoUrl,
          photoHash: 'hash',
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
          isSeed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-8.5rem)] rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-sm">
      {/* Left Sidebar: Incident Inspection & Filters */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-[#eff4ff] flex flex-col border-r border-slate-200 overflow-y-auto">
        <div className="p-5 pb-3 flex flex-col gap-4 border-b border-slate-200/80 bg-[#e5eeff]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-green-700 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-extrabold text-base text-slate-900">Live Incident Radar</span>
            </div>
            <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              Live Feed
            </span>
          </div>

          {/* Search Radius Slider */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-green-600" />
                Incident Search Radius
              </span>
              <span className="font-extrabold text-green-700">{radiusKm.toFixed(1)} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="0.5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full accent-green-600 cursor-pointer"
            />
            <div className="flex gap-1.5 flex-wrap pt-1">
              {['All Sectors', 'Downtown', 'North Sector', 'Central Ward'].map((sector) => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    selectedSector === sector
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedStatus === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All ({features.length})
            </button>
            <button
              onClick={() => setSelectedStatus('SUBMITTED')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedStatus === 'SUBMITTED'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Reported
            </button>
            <button
              onClick={() => setSelectedStatus('IN_PROGRESS')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedStatus === 'IN_PROGRESS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setSelectedStatus('RESOLVED')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedStatus === 'RESOLVED'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Live Incident List */}
        <div className="flex flex-col p-4 gap-3">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>Fetching live geospatial markers...</div>
            </div>
          ) : filteredFeatures.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2 shadow-sm">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800">No active incidents in this filter</div>
              <p className="text-[11px] text-slate-500">Try adjusting the status or search radius.</p>
            </div>
          ) : (
            filteredFeatures.map((feat) => {
              const p = feat.properties;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectById(p.id)}
                  className={`p-3.5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 ${
                    p.status === 'RESOLVED'
                      ? 'border-l-4 border-l-green-600'
                      : p.status === 'IN_PROGRESS'
                      ? 'border-l-4 border-l-blue-600'
                      : 'border-l-4 border-l-amber-500'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-extrabold">
                    <span className="uppercase text-slate-600 tracking-wider">
                      {p.category ? p.category.replace('_', ' ') : 'CIVIC ISSUE'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        p.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-700'
                          : p.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.status || 'SUBMITTED'}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 line-clamp-1">
                    {p.description || 'Public issue report'}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 text-green-600 shrink-0" />
                      {feat.geometry.coordinates
                        ? `${feat.geometry.coordinates[1].toFixed(3)}, ${feat.geometry.coordinates[0].toFixed(3)}`
                        : 'Central Ward'}
                    </span>
                    <span className="text-green-700 font-extrabold flex items-center gap-0.5 shrink-0 hover:underline">
                      Inspect <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Interactive Map Canvas */}
      <div className="flex-1 relative h-full">
        <InteractiveMap
          geoJsonData={geoJsonData}
          clusters={clusters}
          onSelectComplaint={handleSelectById}
        />
      </div>
    </div>
  );
};
