import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, CreditCard, BarChart3, TrendingUp, IndianRupee, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const tabs = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
];

function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then((r) => r.data.analytics),
  });

  if (isLoading) return <div className="text-gray-400 text-center py-12">Loading analytics…</div>;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-indigo-400' },
          { label: 'Active Users', value: data.activeUsers, icon: UserCheck, color: 'text-green-400' },
          { label: 'Total Revenue', value: `₹${data.totalRevenueINR.toFixed(2)}`, icon: IndianRupee, color: 'text-yellow-400' },
          { label: 'Paid Users', value: data.planBreakdown.find((p) => p._id !== 'free')?.count || 0, icon: TrendingUp, color: 'text-purple-400' },
        ].map((kpi) => (
          <div key={kpi.label} className="card">
            <kpi.icon className={`${kpi.color} mb-3`} size={22} />
            <p className="text-gray-400 text-sm">{kpi.label}</p>
            <p className="text-white font-bold text-2xl">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">Plan Distribution</h3>
        <div className="space-y-3">
          {data.planBreakdown.map((p) => (
            <div key={p._id} className="flex items-center justify-between">
              <span className="text-gray-300 capitalize">{p._id}</span>
              <span className="text-white font-semibold">{p.count} users</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by day */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">Revenue (Last 30 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left pb-2 font-medium">Date</th>
                <th className="text-right pb-2 font-medium">Revenue</th>
                <th className="text-right pb-2 font-medium">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data.revenueByDay.map((d) => (
                <tr key={d._id} className="text-gray-300">
                  <td className="py-2">{d._id}</td>
                  <td className="py-2 text-right">₹{(d.revenue / 100).toFixed(2)}</td>
                  <td className="py-2 text-right">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersTable() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/toggle-active`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to update user status.'),
  });

  if (isLoading) return <div className="text-gray-400 text-center py-12">Loading users…</div>;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left pb-3 font-medium">Name</th>
            <th className="text-left pb-3 font-medium">Email</th>
            <th className="text-left pb-3 font-medium">Plan</th>
            <th className="text-left pb-3 font-medium">Role</th>
            <th className="text-left pb-3 font-medium">Joined</th>
            <th className="text-right pb-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.users.map((u) => (
            <tr key={u._id} className="text-gray-300">
              <td className="py-3">{u.name}</td>
              <td className="py-3 text-gray-400">{u.email}</td>
              <td className="py-3 capitalize">{u.plan}</td>
              <td className="py-3 capitalize">{u.role}</td>
              <td className="py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="py-3 text-right">
                <button
                  onClick={() => toggleMutation.mutate(u._id)}
                  disabled={toggleMutation.isPending}
                  className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg transition ${
                    u.isActive
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  {u.isActive ? <><UserX size={12} /> Deactivate</> : <><UserCheck size={12} /> Activate</>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-gray-500 text-xs mt-4">Total: {data.total} users</p>
    </div>
  );
}

function TransactionsTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => api.get('/admin/transactions').then((r) => r.data),
  });

  if (isLoading) return <div className="text-gray-400 text-center py-12">Loading transactions…</div>;

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b border-gray-800">
            <th className="text-left pb-3 font-medium">User</th>
            <th className="text-left pb-3 font-medium">Order ID</th>
            <th className="text-left pb-3 font-medium">Plan</th>
            <th className="text-right pb-3 font-medium">Amount</th>
            <th className="text-left pb-3 font-medium">Status</th>
            <th className="text-left pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.transactions.map((tx) => (
            <tr key={tx._id} className="text-gray-300">
              <td className="py-3">
                <div>{tx.user?.name}</div>
                <div className="text-gray-500 text-xs">{tx.user?.email}</div>
              </td>
              <td className="py-3 font-mono text-xs text-gray-500 max-w-[120px] truncate">{tx.razorpayOrderId}</td>
              <td className="py-3 capitalize">{tx.plan}</td>
              <td className="py-3 text-right">₹{(tx.amount / 100).toFixed(2)}</td>
              <td className="py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    tx.status === 'paid'
                      ? 'bg-green-500/10 text-green-400'
                      : tx.status === 'failed'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}
                >
                  {tx.status}
                </span>
              </td>
              <td className="py-3 text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-gray-500 text-xs mt-4">Total: {data.total} transactions</p>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
        <p className="text-gray-400 mb-8">Manage users, transactions, and view analytics.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'users' && <UsersTable />}
        {activeTab === 'transactions' && <TransactionsTable />}
      </div>
    </div>
  );
}
