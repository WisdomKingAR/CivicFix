// frontend/src/views/CityAnalyticsView.tsx
import React, { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  Download,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const CityAnalyticsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#eff4ff] p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-700" />
            City Analytics &amp; Municipal Heatmap
          </h1>
          <p className="text-xs text-slate-500">
            Real-time incident density, dispatch efficiency, and district SLA analytics
          </p>
        </div>

        <button
          onClick={() => alert('Exporting City Analytics PDF Report...')}
          className="btn-stitch-primary text-xs"
        >
          <Download className="w-4 h-4" />
          Export Audit Report
        </button>
      </div>

      {/* Top 4 Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Active Issues</span>
            <div className="text-2xl font-black text-slate-900 mt-1">1,428</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-700 font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-12% from last month</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Resolution Rate</span>
            <div className="text-2xl font-black text-slate-900 mt-1">84.2%</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.5% efficiency</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg. Response Time</span>
            <div className="text-2xl font-black text-slate-900 mt-1">18.4 hrs</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Target &lt; 24 hrs</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Risk Zones</span>
            <div className="text-2xl font-black text-slate-900 mt-1">3 Districts</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-rose-600 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Action required</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 outline-none"
          >
            <option value="ALL">All Categories (Potholes, Lighting, Waste)</option>
            <option value="POTHOLE">Potholes &amp; Road Damage</option>
            <option value="STREETLIGHT">Streetlights &amp; Electrical</option>
            <option value="GARBAGE">Sanitation &amp; Waste</option>
            <option value="WATER_LEAKAGE">Water &amp; Drainage</option>
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 outline-none"
          >
            <option value="ALL">All Neighborhoods / Districts</option>
            <option value="DOWNTOWN">Downtown Core (Ward 84)</option>
            <option value="NORTH">Northside Industrial (Ward 85)</option>
            <option value="EAST">Eastside Residential (Ward 86)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Last 30 Days Audit</span>
        </div>
      </div>

      {/* Main Heatmap & Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Category Volume Progress */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900">Incident Volume by Category</h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-700">
                <span>Potholes &amp; Structural Road Decay</span>
                <span className="font-bold text-slate-900">542 (38%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-700">
                <span>Streetlight &amp; Electrical Faults</span>
                <span className="font-bold text-slate-900">388 (27%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '27%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-700">
                <span>Garbage &amp; Sanitation Overflow</span>
                <span className="font-bold text-slate-900">312 (22%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1 text-slate-700">
                <span>Water Supply &amp; Drainage Bursts</span>
                <span className="font-bold text-slate-900">186 (13%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '13%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Ward Performance & Resolution Velocity */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900">Ward SLA &amp; Resolution Velocity</h3>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Ward 84 — Central Downtown</div>
                <div className="text-slate-500">Lead Officer: Marcus Vance • Crew Alpha-4</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                96% SLA Pass
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Ward 85 — North Industrial Corridor</div>
                <div className="text-slate-500">Lead Officer: Sarah Jenkins • Crew Beta-2</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                89% SLA Pass
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Ward 86 — Eastside Residential</div>
                <div className="text-slate-500">Lead Officer: David Miller • Crew Gamma-1</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                82% SLA Pass
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
