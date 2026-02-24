import React, { useState } from 'react';
// IMPORT FIXED: Naik 2 level
import { db } from '../../firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ExpenseForm = ({ user, onClose }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('operasional');
  const [amount, setAmount] = useState('');
  const [rawValue, setRawValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleAmountChange = (e) => {
    const input = e.target.value;
    const numberString = input.replace(/[^0-9]/g, '');
    const numberValue = parseInt(numberString, 10);
    setRawValue(isNaN(numberValue) ? 0 : numberValue);

    if (numberString) {
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(numberValue);
      setAmount(formatted);
    } else {
      setAmount('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rawValue <= 0) {
      alert("Nominal pengeluaran tidak boleh nol!");
      return;
    }
    setLoading(true);

    try {
      const expenseData = {
        description: description,
        category: category,
        amount: rawValue,
        input_by: user?.name || 'Kasir',
        role: user?.role || 'cashier',
        created_at: serverTimestamp(),
        status: 'pending_approval', 
        approved_by: null,
        approved_at: null      
      };

      await addDoc(collection(db, "expenses"), expenseData);
      alert("Pengeluaran berhasil dicatat!");
      
      setDescription('');
      setAmount('');
      setRawValue(0);
      setCategory('operasional');
      
      if (onClose) onClose();

    } catch (error) {
      console.error("Error input pengeluaran: ", error);
      alert("Gagal menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-100 animate-in zoom-in-95 duration-200">
      <h2 className="text-lg font-bold mb-1 text-gray-800">Catat Pengeluaran</h2>
      <p className="text-xs text-gray-500 mb-6">Input biaya operasional dadakan (Kas Kecil).</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Keterangan</label>
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Beli Es Batu, Gas LPG, dll."
            className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
            required 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori Biaya</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border rounded-xl bg-white text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
          >
            <option value="bahan_baku">Bahan Baku (Darurat)</option>
            <option value="operasional">Operasional Toko</option>
            <option value="transport">Transportasi</option>
            <option value="lainnya">Lain-lain</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jumlah Uang (Rp)</label>
          <input 
            type="text" 
            value={amount}
            onChange={handleAmountChange}
            placeholder="Rp 0"
            className="w-full p-3 border rounded-xl text-xl font-bold text-gray-800 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder:font-normal"
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl text-white font-bold transition duration-200 shadow-lg
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800 active:scale-95'}`}
        >
          {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
        </button>

      </form>
    </div>
  );
};

export default ExpenseForm;