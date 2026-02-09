import React, { useState } from 'react';
import { db } from '../firebaseConfig'; // Sesuaikan path firebaseConfig kamu
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ExpenseForm = ({ user, onClose }) => {
  // State untuk menyimpan inputan form
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('operasional'); // Default kategori
  const [amount, setAmount] = useState(''); // Disimpan sebagai string untuk tampilan (Rp)
  const [rawValue, setRawValue] = useState(0); // Disimpan sebagai number untuk database
  const [loading, setLoading] = useState(false);

  // Fungsi: Mengubah angka yang diketik menjadi format Rupiah
  const handleAmountChange = (e) => {
    // 1. Ambil input user
    const input = e.target.value;
    
    // 2. Hapus semua karakter selain angka
    const numberString = input.replace(/[^0-9]/g, '');
    
    // 3. Simpan nilai murni (number) untuk dikirim ke Firebase nanti
    const numberValue = parseInt(numberString, 10);
    setRawValue(isNaN(numberValue) ? 0 : numberValue);

    // 4. Format tampilan jadi Rupiah (contoh: Rp 10.000)
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

  // Fungsi: Submit data ke Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rawValue <= 0) {
      alert("Nominal pengeluaran tidak boleh nol!");
      return;
    }

    setLoading(true);

    try {
      // Data yang akan disimpan ke koleksi 'expenses'
      const expenseData = {
        description: description,
        category: category,      // misal: 'bahan_baku', 'transport', 'operasional'
        amount: rawValue,        // PENTING: Simpan sebagai Number, bukan string "Rp..."
        input_by: user?.name || 'Kasir', // Siapa yang input (dari props user)
        role: user?.role || 'cashier',
        created_at: serverTimestamp(),
        status: 'pending_approval', // PAKSA status ini untuk semua inputan baru
        approved_by: null,          // Belum ada yang menyetujui
        approved_at: null      
    };

      // Kirim ke Firestore
      await addDoc(collection(db, "expenses"), expenseData);

      alert("Pengeluaran berhasil dicatat!");
      
      // Reset form setelah sukses
      setDescription('');
      setAmount('');
      setRawValue(0);
      setCategory('operasional');
      
      // Jika komponen ini dalam modal, bisa panggil onClose()
      if (onClose) onClose();

    } catch (error) {
      console.error("Error input pengeluaran: ", error);
      alert("Gagal menyimpan data. Cek koneksi internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Catat Pengeluaran (Kas Kecil)</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Input Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
          <input 
            type="text" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Beli Es Batu, Gas LPG, dll."
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
            required 
          />
        </div>

        {/* Input Kategori */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Biaya</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="bahan_baku">Bahan Baku (Darurat)</option>
            <option value="operasional">Operasional Toko</option>
            <option value="transport">Transportasi</option>
            <option value="lainnya">Lain-lain</option>
          </select>
        </div>

        {/* Input Nominal (Dengan Format Rupiah) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Uang (Rp)</label>
          <input 
            type="text" 
            value={amount}
            onChange={handleAmountChange}
            placeholder="Rp 0"
            className="w-full p-2 border rounded text-lg font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
            required 
          />
          {/* Helper Text untuk memastikan user sadar */}
          <p className="text-xs text-gray-500 mt-1">
            *Pastikan nominal sesuai dengan uang fisik yang dikeluarkan.
          </p>
        </div>

        {/* Tombol Submit */}
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-2 px-4 rounded text-white font-bold transition duration-200 
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
        >
          {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
        </button>

      </form>
    </div>
  );
};

export default ExpenseForm;