// frontend/src/views/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { InteractiveMap } from '../components/InteractiveMap';
import { mapApi } from '../api/client';
import type { GeoJsonFeatureCollection, ComplaintCluster, ComplaintCategory } from '../types';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  LogIn,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface LandingPageProps {
  onOpenReportModal: () => void;
  onNavigateToAuth: () => void;
}

const CATEGORIES: { label: string; value: ComplaintCategory; icon: string; count: number; desc: string }[] = [
  { label: 'Pothole & Roads', value: 'POTHOLE', icon: '🕳️', count: 1240, desc: 'Crater damage, fissures & road surface degradation' },
  { label: 'Streetlight Outages', value: 'STREETLIGHT', icon: '💡', count: 830, desc: 'Dark corridors & faulty electrical fixtures' },
  { label: 'Garbage Overflow', value: 'GARBAGE', icon: '🗑️', count: 950, desc: 'Waste accumulation & uncollected neighborhood bins' },
  { label: 'Water Leakage', value: 'WATER_LEAKAGE', icon: '💧', count: 620, desc: 'Pipeline bursts & drinking water supply leakages' },
  { label: 'Road Damage', value: 'ROAD_DAMAGE', icon: '🛣️', count: 410, desc: 'Broken sidewalks, divider damage & paving issues' },
  { label: 'Other Civic Hazards', value: 'OTHER', icon: '⚠️', count: 290, desc: 'Fallen trees, drainage blockages & public hazards' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenReportModal,
  onNavigateToAuth,
}) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeatureCollection | null>(null);
  const [clusters, setClusters] = useState<ComplaintCluster[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [geoRes, clusterRes] = await Promise.all([
          mapApi.getGeoJsonFeed(),
          mapApi.getClusters(),
        ]);
        if (geoRes.data) setGeoJsonData(geoRes.data);
        if (clusterRes.data) setClusters(clusterRes.data);
      } catch {
        // ignore
      }
    };
    fetchData();
  }, []);

  const filteredFeatures = geoJsonData?.features?.filter((f) =>
    selectedCategory === 'ALL' ? true : f.properties.category === selectedCategory
  );

  const displayGeoJson: GeoJsonFeatureCollection = {
    type: 'FeatureCollection',
    features: filteredFeatures || [],
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative w-full bg-[#eff4ff] rounded-3xl overflow-hidden p-8 sm:p-12 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5">
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-green-700 border border-green-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Official Municipal Partner Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Report Civic Issues.<br />
              <span className="text-green-600">Get Them Fixed.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed">
              Empowering citizens and local authorities to bridge the gap. Snap a photo, drop a pin, and track your neighborhood repairs in real-time with total transparency.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenReportModal}
                className="btn-stitch-primary text-sm shadow-lg shadow-green-500/25 px-6 py-3.5 rounded-xl"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Report an Issue</span>
              </button>
              <button
                onClick={onNavigateToAuth}
                className="btn-stitch-secondary text-sm px-6 py-3.5 rounded-xl"
              >
                <LogIn className="w-5 h-5" />
                <span>Citizen Login</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/80 w-full text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Anonymous or Public</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>GPS Auto-Tagging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Direct Authority Routing</span>
              </div>
            </div>
          </div>

          {/* Right Live Feed Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Live Report Feed</div>
                    <div className="text-xs text-slate-500">Real-time municipal updates</div>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 animate-pulse">
                  Live
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-800 truncate">Streetlight Outage #4092</div>
                      <div className="text-[10px] text-slate-500">Downtown District • 12m ago</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                    In Progress
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-800 truncate">Pothole Repaired on 5th Ave</div>
                      <div className="text-[10px] text-slate-500">North Sector • 2h ago</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200">
                    Resolved
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-800 truncate">Water Main Leakage</div>
                      <div className="text-[10px] text-slate-500">Westside • 4h ago</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    Reported
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stitch-card p-6 flex flex-col gap-2 relative overflow-hidden bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issues Reported</span>
          <div className="text-3xl font-black text-slate-900">48,215</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mt-1">
            <TrendingUp className="w-4 h-4" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="stitch-card p-6 flex flex-col gap-2 relative overflow-hidden bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issues Resolved</span>
          <div className="text-3xl font-black text-slate-900">42,980</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mt-1">
            <Award className="w-4 h-4" />
            <span>Verified by municipal audit</span>
          </div>
        </div>

        <div className="stitch-card p-6 flex flex-col gap-2 relative overflow-hidden bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution Rate</span>
          <div className="text-3xl font-black text-slate-900">89.1%</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-1">
            <Zap className="w-4 h-4" />
            <span>Avg. response time: 24 hrs</span>
          </div>
        </div>
      </section>

      {/* Category Directory Cards */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Category Directory</span>
          <h2 className="text-2xl font-bold text-slate-900">Browse Civic Issue Categories</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`stitch-card p-5 cursor-pointer flex flex-col justify-between transition-all ${
                selectedCategory === cat.value ? 'border-2 border-green-500 bg-green-50/50' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-3xl">{cat.icon}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  {cat.count} Reports
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{cat.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{cat.desc}</p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-green-700">
                <span>View Cluster Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Map Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-600" />
              Interactive Ward Map &amp; GeoJSON Feed
            </h2>
            <p className="text-xs text-slate-500">Real-time issue clustering with PostGIS 500m sensitive hospital &amp; school zones</p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {['ALL', 'POTHOLE', 'STREETLIGHT', 'GARBAGE', 'WATER_LEAKAGE', 'ROAD_DAMAGE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[520px] w-full">
          <InteractiveMap geoJsonData={displayGeoJson} clusters={clusters} />
        </div>
      </section>
    </div>
  );
};
