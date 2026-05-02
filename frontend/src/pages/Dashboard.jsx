import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, TrendingUp, Users, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const statusIcon = {
  paid: <CheckCircle size={14} className="text-green-400" />,
  created: <Clock size={14} className="text-yellow-400" />,
  failed: <XCircle size={14} className="text-red-400" />,
  refunded: <XCircle size={14} className="text-gray-400" />,
};

const planBadge = {
  free: 'bg-gray-700 text-gray-300',
  starter: 'bg-indigo-500/20 text-indigo-300',
  pro: 'bg-purple-500/20 text-purple-300',
};

export default function Dashboard() {
  const { updateUser } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/users/dashboard').then((r) => r.data),
    staleTime: 30_000,
  });

  // Sync plan changes back to auth store
  useEffect(() => {
    if (data?.user) updateUser({ plan: data.user.plan });
  }, [data?.user?.plan]);

  const copyReferral = () => {
    navigator.clipboard.writeText(data.user.referralCode);
    toast.success('Referral code copied!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-red-400">Failed to load dashboard. Please refresh.</p>
      </div>
    );
  }

  const { user, stats, recentTransactions } = data;
  const totalINR = (stats.totalSpentPaise / 100).toFixed(2);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user.name} 👋</h1>
            <p className="text-gray-400 text-sm mt-1">
              Member since {new Date(user.memberSince).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${planBadge[user.plan]}`}>
              {user.plan} plan
            </span>
            {user.plan === 'free' && (
              <Link to="/checkout?plan=starter" className="btn-primary text-sm py-2 px-4">
                Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <CreditCard className="text-indigo-400" size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Spent</p>
              <p className="text-white font-bold text-xl">₹{totalINR}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <TrendingUp className="text-indigo-400" size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Transactions</p>
              <p className="text-white font-bold text-xl">{stats.transactionCount}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Users className="text-indigo-400" size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Referrals</p>
              <p className="text-white font-bold text-xl">{user.referralCount}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2 card">
            <h2 className="text-white font-semibold mb-4">Recent Transactions</h2>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="text-gray-600 mx-auto mb-3" size={40} />
                <p className="text-gray-500">No transactions yet.</p>
                <Link to="/checkout?plan=starter" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">
                  Upgrade your plan →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left pb-3 font-medium">Order ID</th>
                      <th className="text-left pb-3 font-medium">Plan</th>
                      <th className="text-right pb-3 font-medium">Amount</th>
                      <th className="text-right pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {recentTransactions.map((tx) => (
                      <tr key={tx._id} className="text-gray-300">
                        <td className="py-3 font-mono text-xs text-gray-500 truncate max-w-[120px]">
                          {tx.razorpayOrderId}
                        </td>
                        <td className="py-3 capitalize">{tx.plan}</td>
                        <td className="py-3 text-right">₹{(tx.amount / 100).toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <span className="inline-flex items-center gap-1 justify-end capitalize">
                            {statusIcon[tx.status]}
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Referral card */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4">Your Referral Code</h2>
            <p className="text-gray-400 text-sm mb-4">
              Share your code and earn rewards when friends sign up.
            </p>
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-3">
              <span className="font-mono text-indigo-300 font-bold flex-1">{user.referralCode}</span>
              <button
                onClick={copyReferral}
                className="text-gray-400 hover:text-white transition"
                aria-label="Copy referral code"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              {user.referralCount} friend{user.referralCount !== 1 ? 's' : ''} referred
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
