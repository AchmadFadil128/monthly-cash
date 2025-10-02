'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Calendar, Check } from 'lucide-react';

interface WeeklySummary {
  week: string;
  Income: number;
  Expense: number;
}

interface ChecklistData {
  [name: string]: {
    [week: number]: boolean;
  };
}

const Dashboard = () => {
  const [weeklyData, setWeeklyData] = useState<WeeklySummary[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [checklist, setChecklist] = useState<ChecklistData>({});

  const names = ['Achmad', 'Dimas', 'Lutfi', 'Maulana', 'Riski'];
  const CHECKLIST_AMOUNT = 40000; // 40k per checklist

  // Get number of weeks in current month
  const getWeeksInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const weeks = Math.ceil((daysInMonth + firstDay.getDay()) / 7);
    return weeks;
  };

  const weeksInMonth = getWeeksInMonth();

  // Initialize checklist data structure
  const initializeChecklist = (): ChecklistData => {
    const initialData: ChecklistData = {};
    names.forEach(name => {
      initialData[name] = {};
      for (let i = 1; i <= weeksInMonth; i++) {
        initialData[name][i] = false;
      }
    });
    return initialData;
  };

  // Load checklist state from database
  const loadChecklistFromDB = async (): Promise<ChecklistData> => {
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const transactions = await response.json();
      
      // Initialize checklist with default values
      const checklistData = initializeChecklist();
      
      // Process transactions to identify checklist entries
      transactions.forEach((transaction: any) => {
        // Match transactions that follow the pattern "Iuran {name} - Minggu {week}"
        const checklistPattern = /^Iuran\s+(.+?)\s*-\s*Minggu\s+(\d+)$/;
        const match = transaction.namaKeperluan.match(checklistPattern);
        
        if (match) {
          const name = match[1].trim();
          const week = parseInt(match[2]);
          
          // Check if the name is in our names array and week is valid
          if (names.includes(name) && week >= 1 && week <= weeksInMonth) {
            // Mark as checked if transaction is an Income of the correct amount
            if (transaction.kategori === 'Income' && transaction.nominal === CHECKLIST_AMOUNT) {
              checklistData[name][week] = true;
            }
          }
        }
      });

      return checklistData;
    } catch (error) {
      console.error('Error loading checklist from database:', error);
      return initializeChecklist(); // Return default checklist on error
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch weekly summary
        const weeklyResponse = await fetch('/api/weekly-summary');
        if (weeklyResponse.ok) {
          const data = await weeklyResponse.json();
          setWeeklyData(data.weeklyData);
          setTotalBalance(data.totalBalance);
        }

        // Load checklist from database
        const loadedChecklist = await loadChecklistFromDB();
        setChecklist(loadedChecklist);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [weeksInMonth]);

  // Calculate total income and expense
  const totalIncome = weeklyData.reduce((sum, week) => sum + week.Income, 0);
  const totalExpense = weeklyData.reduce((sum, week) => sum + week.Expense, 0);

  // Calculate checklist income
  const checklistIncome = Object.values(checklist).reduce((total, person) => {
    const personChecked = Object.values(person).filter(Boolean).length;
    return total + (personChecked * CHECKLIST_AMOUNT);
  }, 0);

  const handleCheckboxChange = async (name: string, week: number) => {
    const isChecked = !checklist[name][week];
    const transactionData = {
      tanggal: new Date().toISOString().split('T')[0],
      namaKeperluan: `Iuran ${name} - Minggu ${week}`,
      kategori: 'Income',
      nominal: CHECKLIST_AMOUNT
    };

    try {
      if (isChecked) {
        // Add income transaction
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData),
        });
      } else {
        // To remove a checklist item, we need an endpoint to delete transactions by name and week
        // For now, let's add a method to delete specific checklist transactions
        const response = await fetch(`/api/transactions/checklist/${name}/${week}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          console.error('Failed to delete checklist transaction');
        }
      }
      
      // Refresh weekly summary and checklist from database
      const weeklyResponse = await fetch('/api/weekly-summary');
      if (weeklyResponse.ok) {
        const data = await weeklyResponse.json();
        setWeeklyData(data.weeklyData);
        setTotalBalance(data.totalBalance);
      }
      
      // Reload checklist from database to reflect the current state
      const updatedChecklist = await loadChecklistFromDB();
      setChecklist(updatedChecklist);
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

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
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 mb-8">
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

        {/* Checklist Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
                Daftar Iuran Anggota
              </h2>
              <p className="text-sm text-gray-500">
                Checklist iuran bulanan - {formatCurrency(CHECKLIST_AMOUNT)} per minggu
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-xl border border-green-200">
              <p className="text-sm text-gray-600">Total Iuran Terkumpul</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(checklistIncome)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 rounded-tl-xl">
                    Nama
                  </th>
                  {Array.from({ length: weeksInMonth }, (_, i) => (
                    <th key={i + 1} className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700">
                      Minggu {i + 1}
                    </th>
                  ))}
                  <th className="border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 rounded-tr-xl">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {names.map((name, nameIndex) => {
                  const checkedCount = Object.values(checklist[name] || {}).filter(Boolean).length;
                  const personTotal = checkedCount * CHECKLIST_AMOUNT;
                  
                  return (
                    <tr key={name} className="hover:bg-gray-50 transition-colors">
                      <td className={`border border-gray-200 px-4 py-3 font-medium text-gray-800 ${nameIndex === names.length - 1 ? 'rounded-bl-xl' : ''}`}>
                        {name}
                      </td>
                      {Array.from({ length: weeksInMonth }, (_, i) => (
                        <td key={i + 1} className="border border-gray-200 px-4 py-3 text-center">
                          <button
                            onClick={() => handleCheckboxChange(name, i + 1)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                              checklist[name]?.[i + 1]
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-600 shadow-md'
                                : 'bg-white border-gray-300 hover:border-indigo-400'
                            }`}
                          >
                            {checklist[name]?.[i + 1] && (
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            )}
                          </button>
                        </td>
                      ))}
                      <td className={`border border-gray-200 px-4 py-3 text-center font-bold ${
                        personTotal > 0 ? 'text-green-600' : 'text-gray-400'
                      } ${nameIndex === names.length - 1 ? 'rounded-br-xl' : ''}`}>
                        {formatCurrency(personTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="mt-6 flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-600">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-sm">
                {Object.values(checklist).reduce((total, person) => 
                  total + Object.values(person).filter(Boolean).length, 0
                )} dari {names.length * weeksInMonth} checklist terisi
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Keseluruhan</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatCurrency(checklistIncome)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;