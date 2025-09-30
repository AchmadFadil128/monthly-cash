'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Calendar } from 'lucide-react';

interface WeeklySummary {
  week: string;
  Income: number;
  Expense: number;
}

const Dashboard = () => {
  const [weeklyData, setWeeklyData] = useState<WeeklySummary[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        const response = await fetch('/api/weekly-summary');
        if (response.ok) {
          const data = await response.json();
          setWeeklyData(data.weeklyData);
          setTotalBalance(data.totalBalance);
        }
      } catch (error) {
        console.error('Error fetching weekly summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWeeklySummary();
  }, []);

  // Calculate total income and expense
  const totalIncome = weeklyData.reduce((sum, week) => sum + week.Income, 0);
  const totalExpense = weeklyData.reduce((sum, week) => sum + week.Expense, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <div className="text-xl text-indigo-600 font-medium">Memuat dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Rozhok PKL
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Kelola keuangan PKL dengan mudah dan praktis</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Total Balance Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white col-span-1 md:col-span-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 opacity-80" />
                <h3 className="text-sm font-medium opacity-90">Saldo Total</h3>
              </div>
              <p className="text-3xl md:text-4xl font-bold mb-1">
                {formatCurrency(totalBalance)}
              </p>
              <div className={`flex items-center gap-1 text-sm ${totalBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalBalance >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{totalBalance >= 0 ? 'Positif' : 'Defisit'}</span>
              </div>
            </div>
          </div>

          {/* Total Income Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Pemasukan</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-xs text-gray-500">Bulan ini</p>
          </div>

          {/* Total Expense Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-red-100 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Pengeluaran</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {formatCurrency(totalExpense)}
            </p>
            <p className="text-xs text-gray-500">Bulan ini</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                Ringkasan Mingguan
              </h2>
              <p className="text-sm text-gray-500">Grafik pemasukan dan pengeluaran per minggu</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">Bulan Ini</span>
              </div>
              <Link href="/transactions">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md">
                  <span>Kelola Transaksi</span>
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {weeklyData.length > 0 ? (
            <div className="h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="week"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#d1d5db"
                  />
                  <YAxis 
                    tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    stroke="#d1d5db"
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), '']}
                    labelFormatter={(label) => `Minggu: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="Income" 
                    fill="url(#colorIncome)" 
                    name="Pemasukan"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    dataKey="Expense" 
                    fill="url(#colorExpense)" 
                    name="Pengeluaran"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                  <BarChart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Belum ada data transaksi</p>
                <Link href="/transactions">
                  <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                    Tambah Transaksi Pertama
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;