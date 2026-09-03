// frontend/src/views/LiveMapView.tsx
import React, { useState, useEffect } from 'react';
import { InteractiveMap } from '../components/InteractiveMap';
import { mapApi, complaintsApi } from '../api/client';
import type { GeoJsonFeatureCollection, ComplaintCluster, Complaint } from '../types';
import {
  Radar,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface LiveMapViewProps {
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({ onSelectComplaint }) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeatureCollection | null>(null);
  const [clusters, setClusters] = useState<ComplaintCluster[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [geoRes, clusterRes, compRes] = await Promise.all([
          mapApi.getGeoJsonFeed(),
          mapApi.getClusters(),
          complaintsApi.getMyComplaints(),
        ]);
        if (geoRes.data) setGeoJsonData(geoRes.data);
        if (clusterRes.data) setClusters(clusterRes.data);
        if (compRes.data) setComplaints(compRes.data);
      } catch {
        // ignore
      }
    };
    loadMapData();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (selectedStatus === 'ALL') return true;
    return c.status === selectedStatus;
  });

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-8rem)] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Left Sidebar: Incident Inspection & Filters */}
      <div className="w-full lg:w-[400px] flex-shrink-0 bg-[#eff4ff] flex flex-col border-r border-slate-200 overflow-y-auto">
        <div className="p-5 pb-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-green-700 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="font-extrabold text-base text-slate-900">Live Incident Radar</span>
            </div>
            <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              Live Updates On
            </span>
          </div>

          {/* Radius & Sector Filters */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-semibold">Search Radius</span>
              <span className="font-bold text-green-700">{radiusKm.toFixed(1)} km</span>
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
              {['All Sectors', 'Downtown', 'North District', 'East Bay'].map((sector) => (
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
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                selectedStatus === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              All ({complaints.length})
            </button>
            <button
              onClick={() => setSelectedStatus('SUBMITTED')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                selectedStatus === 'SUBMITTED' ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Reported
            </button>
            <button
              onClick={() => setSelectedStatus('IN_PROGRESS')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                selectedStatus === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setSelectedStatus('RESOLVED')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                selectedStatus === 'RESOLVED' ? 'bg-green-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Incident List */}
        <div className="flex flex-col px-5 pb-5 gap-3">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No active incidents in this filter</div>
          ) : (
            filteredComplaints.map((comp) => (
              <div
                key={comp.id}
                onClick={() => onSelectComplaint && onSelectComplaint(comp)}
                className={`p-3.5 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-2 ${
                  comp.status === 'RESOLVED'
                    ? 'border-l-4 border-l-green-600'
                    : comp.status === 'IN_PROGRESS'
                    ? 'border-l-4 border-l-blue-600'
                    : 'border-l-4 border-l-rose-500'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="uppercase text-slate-500">{comp.category.replace('_', ' ')}</span>
                  <span className="text-slate-400">{new Date(comp.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{comp.description}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-green-600" />
                    {comp.address || 'Central Ward'}
                  </span>
                  <span className="text-green-700 font-bold flex items-center gap-0.5">
                    Inspect <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Interactive Map Canvas Area */}
      <div className="flex-1 relative h-full">
        <InteractiveMap geoJsonData={geoJsonData || { type: 'FeatureCollection', features: [] }} clusters={clusters} />
      </div>
    </div>
  );
};
