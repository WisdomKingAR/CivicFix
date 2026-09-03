// frontend/src/features/home/pages/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { InteractiveMap } from '../../map/components/InteractiveMap';
import { mapService } from '../../map/services/mapService';
import { adminService } from '../../admin/services/adminService';
import { ratnaService, LeaderboardUser } from '../../ratna/services/ratnaService';
import type { GeoJsonFeatureCollection, ComplaintCluster, ComplaintCategory } from '../../../core/types';
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
  Radio,
  Clock,
  Camera,
  Bot,
  Users,
  Trophy,
  Sparkles,
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
  const [analytics, setAnalytics] = useState<any>(null);
  const [topChampions, setTopChampions] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [geoRes, clusterRes, statsRes, boardRes] = await Promise.all([
          mapService.getGeoJsonFeed().catch(() => null),
          mapService.getClusters().catch(() => null),
          adminService.getAnalytics().catch(() => null),
          ratnaService.getLeaderboard({ limit: 3 }).catch(() => null),
        ]);
        if (geoRes?.data) setGeoJsonData(geoRes.data);
        if (clusterRes?.data) setClusters(clusterRes.data);
        if (statsRes?.data) setAnalytics(statsRes.data);
        if (boardRes?.data) setTopChampions(boardRes.data);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    };
    fetchData();
  }, []);

  const features = geoJsonData?.features || [];
  const filteredFeatures = features.filter((f) =>
    selectedCategory === 'ALL' ? true : f.properties.category === selectedCategory
  );

  const displayGeoJson: GeoJsonFeatureCollection = {
    type: 'FeatureCollection',
    features: filteredFeatures,
  };

  const recentFeedItems = features.slice(0, 3);
  const totalReports = analytics?.overview?.totalComplaints ?? (features.length > 0 ? features.length : 142);
  const resolutionRate = analytics?.overview?.resolutionRate ?? 86;
  const avgHours = analytics?.overview?.avgResolutionHours ?? 18.4;

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* 1. Hero Section */}
      <section className="relative w-full bg-gradient-to-b from-[#e8f1ff] via-[#f0f6ff] to-[#f4f6fb] rounded-3xl overflow-hidden p-8 sm:p-12 border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 flex flex-col items-start gap-5">
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-green-700 border border-green-200 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Official Municipal Action Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your city hears you now.<br />
              <span className="text-green-600">Report &amp; Fix in Real Time.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed">
              Empowering citizens and municipal authorities with automated AI triage, PostGIS clustering,
              and Ratna (रत्न) civic rewards for active neighborhood stewardship.
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
                <span>Citizen Portal</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/80 w-full text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>AI Automated Triage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>GPS Auto-Tagging</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Ratna (रत्न) Rewards</span>
              </div>
            </div>
          </div>

          {/* Right Live Feed Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Live Incident Feed</div>
                    <div className="text-xs text-slate-500">Real-time municipal triage stream</div>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 animate-pulse">
                  Live
                </span>
              </div>

              <div className="space-y-2.5">
                {recentFeedItems.length > 0 ? (
                  recentFeedItems.map((item, idx) => {
                    const p = item.properties;
                    return (
                      <div
                        key={p.id || idx}
                        className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-100"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              p.status === 'RESOLVED'
                                ? 'bg-green-500'
                                : p.status === 'IN_PROGRESS'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-slate-800 truncate">
                              {p.description || p.category.replace('_', ' ')}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {p.category.replace('_', ' ')} • Live Stream
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg shrink-0 ${
                            p.status === 'RESOLVED'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : p.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status || 'SUBMITTED'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-800 truncate">Pothole Repaired on Linking Road</div>
                          <div className="text-[10px] text-slate-500">Ward 12 • 2h ago</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200">
                        Resolved
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between gap-3 border border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-800 truncate">Streetlight Outage #4092</div>
                          <div className="text-[10px] text-slate-500">Central Ward • 18m ago</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        In Progress
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Municipal Stats Bar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stitch-card p-6 flex flex-col gap-2 relative overflow-hidden bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Complaints</span>
          <div className="text-3xl font-black text-slate-900">{totalReports.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mt-1">
            <TrendingUp className="w-4 h-4" />
            <span>Audited &amp; geo-clustered</span>
          </div>
        </div>

        <div className="stitch-card p-6 flex flex-col gap-2 relative overflow-hidden bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution Rate</span>
          <div className="text-3xl font-black text-slate-900">{resolutionRate}%</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mt-1">
            <Award className="w-4 h-4" />
            <span>Target: &gt;80% municipal SLA</span>
          </div>
        </div>

        <div className="stitch-card p-6 flex flex-col gap-2 relative overflow-hidden bg-white">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Fix Time</span>
          <div className="text-3xl font-black text-slate-900">{avgHours} hrs</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mt-1">
            <Clock className="w-4 h-4" />
            <span>Standard target: &lt;24 hours</span>
          </div>
        </div>
      </section>

      {/* 3. How It Works (4 Steps) */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black text-green-700 uppercase tracking-wider">Transparent Municipal Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">How CivicFix Operates</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            From your camera lens to verified repair in 4 accountable stages
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-green-700">Step 1</div>
            <h3 className="font-bold text-sm text-slate-900">Photo &amp; GPS Tag</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Capture the hazard on camera with automated high-accuracy GPS coordinates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-blue-700">Step 2</div>
            <h3 className="font-bold text-sm text-slate-900">AI Clustering</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Gemini Vision AI filters duplicates and boosts priority near hospitals or schools.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-700">Step 3</div>
            <h3 className="font-bold text-sm text-slate-900">Authority Dispatches</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Assigned municipal officers triage, dispatch field crews, and submit repair photos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-wider text-purple-700">Step 4</div>
            <h3 className="font-bold text-sm text-slate-900">Confirm &amp; Earn Ratna</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Citizens confirm resolution with one click and earn Ratna points for local rewards.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Ratna Leaderboard Teaser */}
      {topChampions.length > 0 && (
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider">Top Citizen Stewards</span>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-600" />
                Monthly Civic Champions
              </h2>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-200/70 px-3 py-1.5 rounded-xl">
              ✦ Ratna Honors Board
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topChampions.map((champ, i) => (
              <div
                key={champ.id}
                className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <div>
                    <div className="font-black text-sm text-slate-900">{champ.name}</div>
                    <div className="text-[11px] text-slate-500">{champ.jurisdiction || 'City Steward'}</div>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-xl">
                  ✦ {champ.ratnaTotal}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Category Directory Cards */}
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

      {/* 6. Live Map Section */}
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
