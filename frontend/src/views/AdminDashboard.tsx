// frontend/src/views/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/client';
import type { User, Role } from '../types';
import {
  BarChart3,
  Users,
  RefreshCw,
  Search,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const fetchData = async () => {
    try {
      const usersRes = await adminApi.getUsers();
      if (usersRes.data) setUsers(usersRes.data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const handleToggleFlag = async (user: User) => {
    try {
      await adminApi.updateUser(user.id, {
        isFlagged: !user.isFlagged,
        flagReason: !user.isFlagged ? 'Flagged by Administrator' : undefined,
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update flag status');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#eff4ff] p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-700" />
            Municipal Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500">System moderation, SLA compliance monitoring, &amp; staff jurisdiction assignment</p>
        </div>

        <button onClick={fetchData} className="btn-stitch-secondary text-xs">
          <RefreshCw className="w-4 h-4" />
          Refresh Audit Logs
        </button>
      </div>

      {/* Metrics Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{users.length || 18} Users</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12% from last month</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center border border-green-200">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authority Officers</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {users.filter((u) => u.role === 'AUTHORITY').length || 4} Active
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Target: 5/Ward</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Resolution Time</div>
            <div className="text-2xl font-black text-slate-900 mt-1">18.4 hrs</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-700 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>-2.1 hrs efficiency</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SLA Compliance</div>
            <div className="text-2xl font-black text-slate-900 mt-1">94.2%</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Above 90% target</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* User Moderation Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-700" />
            Staff Roles &amp; Citizen Moderation Panel
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or email..."
                className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 text-xs text-slate-900 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500 w-56"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ALL">All Roles</option>
              <option value="CITIZEN">Citizen</option>
              <option value="AUTHORITY">Authority</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Assigned Role</th>
                <th className="pb-3 px-3">Jurisdiction / Ward</th>
                <th className="pb-3 px-3">Reports</th>
                <th className="pb-3 px-3">Account Status</th>
                <th className="pb-3 px-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-800 border border-slate-200"
                    >
                      <option value="CITIZEN">CITIZEN</option>
                      <option value="AUTHORITY">AUTHORITY</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {u.jurisdiction || 'Ward 84 Central'}
                  </td>
                  <td className="py-3 px-3 font-bold text-green-700">
                    {u._count?.complaints || 0}
                  </td>
                  <td className="py-3 px-3">
                    {u.isFlagged ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        Flagged
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleFlag(u)}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] border transition-colors ${
                        u.isFlagged
                          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                          : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {u.isFlagged ? 'Unflag Account' : 'Flag Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
