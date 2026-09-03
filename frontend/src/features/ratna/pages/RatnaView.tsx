// frontend/src/features/ratna/pages/RatnaView.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import {
  ratnaService,
  RatnaStats,
  LeaderboardUser,
  CouponItem,
} from '../services/ratnaService';
import { toast } from '../../../core/components/Toast';
import {
  Award,
  Trophy,
  Sparkles,
  Gift,
  History,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Tag,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const REWARD_CATALOG = [
  { partner: 'Swiggy / Zomato', value: 50, cost: 50, desc: '₹50 off on delivery orders' },
  { partner: 'BigBasket / D-Mart', value: 150, cost: 100, desc: '₹150 off on grocery essentials' },
  { partner: 'BookMyShow', value: 300, cost: 200, desc: '₹300 movie ticket voucher' },
  { partner: 'IRCTC Fee Waiver', value: 500, cost: 500, desc: 'Convenience fee waiver coupon' },
  { partner: 'JioCinema / Hotstar', value: 899, cost: 1000, desc: '1-Month Premium Pass' },
];

export const RatnaView: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RatnaStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardScope, setLeaderboardScope] = useState<'city' | 'ward'>('city');
  const [loading, setLoading] = useState<boolean>(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, boardRes] = await Promise.all([
        ratnaService.getMyStats().catch(() => null),
        ratnaService.getLeaderboard({ scope: leaderboardScope }).catch(() => null),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      if (boardRes?.data) setLeaderboard(boardRes.data);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [leaderboardScope]);

  const handleRedeem = async (item: (typeof REWARD_CATALOG)[0]) => {
    if ((stats?.total ?? 0) < item.cost) {
      toast.error(`You need ${item.cost} Ratna points. Keep reporting civic issues!`);
      return;
    }

    setRedeeming(item.partner);
    try {
      const res = await ratnaService.redeemCoupon({
        ratnaCost: item.cost,
        partner: item.partner,
        value: item.value,
      });

      toast.success(`Redeemed! Your code: ${res.data?.code}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Redemption failed');
    } finally {
      setRedeeming(null);
    }
  };

  const balance = stats?.total ?? (user as any)?.ratnaTotal ?? 45;
  const tierName = stats?.tierName ?? 'Nagarik (नागरिक)';
  const nextTierPoints = stats?.nextTierPoints ?? 100;
  const progressPercent = Math.min(Math.round((balance / nextTierPoints) * 100), 100);

  return (
    <div className="space-y-8 pb-16 animate-fadeIn">
      {/* 1. Hero Banner: Ratna Balance & Civic Tier */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-amber-100 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>CivicFix Ratna (रत्न) Citizen Rewards</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
              <span>✦</span>
              <span>{balance.toLocaleString()}</span>
              <span className="text-xl font-bold text-amber-100">Ratna Points</span>
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-lg">
              Earn Ratna by reporting municipal hazards, participating in cluster verification, and
              confirming resolved issues.
            </p>
          </div>

          {/* Current Tier Badge */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-white text-amber-700 flex items-center justify-center font-black shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200">
                Civic Honor Tier
              </span>
              <div className="text-base font-black text-white">{tierName}</div>
              <span className="text-[11px] text-amber-100">Level {stats?.tierLevel ?? 1} Citizen</span>
            </div>
          </div>
        </div>

        {/* Tier Progress Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span>Progress to Next Rank</span>
            <span>
              {balance} / {nextTierPoints} Ratna ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5 backdrop-blur-sm">
            <div
              className="bg-white h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(progressPercent, 4)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Civic Rank Hierarchy Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Civic Recognition Tiers</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {[
            { tier: 1, range: '0–49', name: 'Nagarik', dev: 'नागरिक', desc: 'Active observer' },
            { tier: 2, range: '50–199', name: 'Sevak', dev: 'सेवक', desc: 'Regular contributor' },
            { tier: 3, range: '200–499', name: 'Prahari', dev: 'प्रहरी', desc: 'Ward guardian' },
            { tier: 4, range: '500–999', name: 'Rakshal', dev: 'रक्षक', desc: 'Civic protector' },
            { tier: 5, range: '1,000+', name: 'Lok Mitra', dev: 'लोक मित्र', desc: 'City champion' },
          ].map((t) => {
            const isCurrent = (stats?.tierLevel ?? 1) === t.tier;
            return (
              <div
                key={t.tier}
                className={`p-4 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase">Tier {t.tier}</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{t.name}</div>
                <div className="text-[11px] font-bold text-amber-700">{t.dev}</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-2">{t.range} Ratna</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Two Columns: Rewards Redemption + Transaction Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Reward Coupons Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <span>Redeem Partner Coupons</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Partner brands sponsored by municipal civic welfare partnerships
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                ✦ {balance} available
              </span>
            </div>

            <div className="space-y-3">
              {REWARD_CATALOG.map((item) => {
                const canAfford = balance >= item.cost;
                const isBusy = redeeming === item.partner;

                return (
                  <div
                    key={item.partner}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50/60 hover:bg-amber-50/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-bold text-xs text-slate-900">{item.partner}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-amber-800 bg-amber-100/70 px-2 py-1 rounded-lg">
                        ✦ {item.cost} Ratna
                      </span>
                      <button
                        disabled={!canAfford || isBusy}
                        onClick={() => handleRedeem(item)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-xl transition-all shadow-sm ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isBusy ? 'Redeeming...' : 'Claim Code'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Claimed Coupons List */}
            {stats?.coupons && stats.coupons.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Claimed Codes
                </h3>
                <div className="space-y-2">
                  {stats.coupons.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-emerald-900">{c.partner}</span>
                        <div className="font-mono text-emerald-700 text-[11px] font-bold">
                          {c.code}
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-600">
                        Expires {new Date(c.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Point Ledger History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-700" />
              <span>Activity &amp; Points Ledger</span>
            </h2>

            {stats?.history && stats.history.length > 0 ? (
              <div className="space-y-3">
                {stats.history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {h.event.replace(/_/g, ' ')}
                      </div>
                      {h.complaint && (
                        <div className="text-[11px] text-slate-500">
                          {h.complaint.category} • {h.complaint.address || 'Local report'}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="font-black text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-lg shrink-0">
                      +{h.ratna} ✦
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                No points history logged yet. Report an issue to earn your first 5 Ratna!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Municipal Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Civic Champions Leaderboard</span>
            </h2>
            <p className="text-xs text-slate-500">
              Top citizens recognized for municipal stewardship and neighborhood improvement
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setLeaderboardScope('city')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                leaderboardScope === 'city'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Citywide
            </button>
            <button
              onClick={() => setLeaderboardScope('ward')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                leaderboardScope === 'ward'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Ward (Ward 12)
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {leaderboard.length > 0 ? (
            leaderboard.map((champ, idx) => {
              const isMe = champ.id === user?.id;
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div
                  key={champ.id}
                  className={`py-3.5 px-4 flex items-center justify-between gap-4 rounded-xl transition-colors ${
                    isMe ? 'bg-amber-50/70 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-black text-slate-400">
                      {idx < 3 ? medals[idx] : `#${idx + 1}`}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{champ.name}</span>
                        {isMe && (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {champ.jurisdiction || 'Central Zone'} • {champ._count?.complaints ?? 1}{' '}
                        reports filed
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-xl">
                      ✦ {champ.ratnaTotal} Ratna
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No citizens ranked yet. Be the first to rank on this leaderboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
