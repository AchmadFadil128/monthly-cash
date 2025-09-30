'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Transaction } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';
import { 
  Wallet, 
  ArrowLeft, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';

interface TransactionFormData {
  tanggal: string;
  namaKeperluan: string;
  kategori: 'Income' | 'Expense';
  nominal: number;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>({
    tanggal: new Date().toISOString().split('T')[0],
    namaKeperluan: '',
    kategori: 'Income',
    nominal: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nominal') {
      setFormData({
        ...formData,
        [name]: Number(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'tanggal' ? value : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data being submitted:', formData);
    
    try {
      if (editingTransaction) {
        const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          fetchTransactions();
          resetForm();
        }
      } else {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          fetchTransactions();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    const tanggalValue = transaction.tanggal instanceof Date ? 
      transaction.tanggal : 
      new Date(transaction.tanggal);
      
    const dateStr = tanggalValue.toISOString().split('T')[0];
    setFormData({
      tanggal: dateStr,
      namaKeperluan: transaction.namaKeperluan,
      kategori: transaction.kategori as 'Income' | 'Expense',
      nominal: transaction.nominal,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchTransactions();
        }
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      namaKeperluan: '',
      kategori: 'Income',
      nominal: 0,
    });
    setEditingTransaction(null);
    setShowForm(false);
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.kategori === 'Income')
    .reduce((sum, t) => sum + t.nominal, 0);
  
  const totalExpense = transactions
    .filter(t => t.kategori === 'Expense')
    .reduce((sum, t) => sum + t.nominal, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <div className="text-xl text-indigo-600 font-medium">Memuat transaksi...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Rozhok PKL
                </h1>
              </div>
              <p className="text-gray-600 ml-14">Kelola semua transaksi keuangan PKL Anda</p>
            </div>
            <Link href="/">
              <Button className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 shadow-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Pemasukan</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 p-3 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Daftar Transaksi</h2>
              <p className="text-sm text-gray-500">Semua catatan pemasukan dan pengeluaran</p>
            </div>
            {!showForm && (
              <Button 
                onClick={() => { resetForm(); setShowForm(true); }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Transaksi
              </Button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <div className="mb-8 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      Tanggal
                    </label>
                    <Input
                      type="date"
                      name="tanggal"
                      value={formData.tanggal}
                      onChange={handleInputChange}
                      required
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Kategori
                    </label>
                    <Select
                      name="kategori"
                      value={formData.kategori}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Income', label: 'Pemasukan' },
                        { value: 'Expense', label: 'Pengeluaran' },
                      ]}
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      Deskripsi
                    </label>
                    <Input
                      name="namaKeperluan"
                      value={formData.namaKeperluan}
                      onChange={handleInputChange}
                      placeholder="contoh: Gaji, Belanja, Transport"
                      required
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <DollarSign className="w-4 h-4 text-indigo-600" />
                      Nominal (Rp)
                    </label>
                    <CurrencyInput
                      name="nominal"
                      value={formData.nominal}
                      onChange={handleInputChange}
                      min="0"
                      required
                      className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md"
                  >
                    {editingTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Deskripsi</TableHead>
                  <TableHead className="font-semibold text-gray-700">Kategori</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nominal</TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-700">
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-gray-800">{transaction.namaKeperluan}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.kategori === 'Income' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.kategori === 'Income' ? (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              Pemasukan
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3" />
                              Pengeluaran
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className={`font-semibold ${
                        transaction.kategori === 'Income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.nominal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-gray-100 rounded-full p-4">
                          <Wallet className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Belum ada transaksi</p>
                        <p className="text-sm text-gray-400">Klik tombol "Tambah Transaksi" untuk memulai</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Transaction Count */}
          {transactions.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Menampilkan {transactions.length} transaksi
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;