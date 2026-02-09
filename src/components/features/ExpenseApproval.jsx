import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const ExpenseApproval = ({ user }) => {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data yang statusnya 'pending_approval' secara Realtime
  useEffect(() => {
    const q = query(
      collection(db, "expenses"),
      where("status", "==", "pending_approval")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPendingExpenses(expenses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fungsi untuk Menyetujui (Approve)
  const handleApprove = async (id, amount, description) => {
    if (!window.confirm(`Setujui pengeluaran "${description}" senilai Rp ${amount}?`)) return;

    try {
      const expenseRef = doc(db, "expenses", id);
      
      await updateDoc(expenseRef, {
        status: 'approved',
        approved_by: user.name,     // Siapa yang klik tombol approve
        approved_at: serverTimestamp() // Kapan disetujui
      });
      
      // OPTIONAL: Di sini kamu bisa tambahkan logika untuk mengurangi Saldo Kas Utama di database
      // updateCashBalance(amount); 

      alert("Pengeluaran disetujui!");
    } catch (error) {
      console.error("Error approving:", error);
      alert("Gagal memproses persetujuan.");
    }
  };

  // 3. Fungsi untuk Menolak (Reject)
  const handleReject = async (id) => {
    const reason = prompt("Alasan penolakan (opsional):");
    if (reason === null) return; // Batal jika tekan Cancel

    try {
      const expenseRef = doc(db, "expenses", id);
      
      await updateDoc(expenseRef, {
        status: 'rejected',
        rejection_reason: reason,
        approved_by: user.name, // Tetap catat siapa yang menolak
        approved_at: serverTimestamp()
      });

      alert("Pengeluaran ditolak.");
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  // Format Rupiah untuk tampilan
  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  if (loading) return <p>Memuat data...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Konfirmasi Pengeluaran ({pendingExpenses.length})
      </h2>

      {pendingExpenses.length === 0 ? (
        <p className="text-gray-500 italic">Tidak ada pengajuan pengeluaran yang menunggu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3">Tanggal</th>
                <th scope="col" className="px-4 py-3">Diajukan Oleh</th>
                <th scope="col" className="px-4 py-3">Keterangan</th>
                <th scope="col" className="px-4 py-3">Nominal</th>
                <th scope="col" className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingExpenses.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {item.created_at?.toDate().toLocaleDateString('id-ID') || '-'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.input_by} <br/>
                    <span className="text-xs text-gray-500">({item.role})</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {item.description} <br/>
                    <span className="text-xs text-blue-500 bg-blue-50 px-1 rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {formatRupiah(item.amount)}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    {/* Tombol Reject */}
                    <button 
                      onClick={() => handleReject(item.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs font-bold"
                    >
                      Tolak
                    </button>
                    
                    {/* Tombol Approve */}
                    <button 
                      onClick={() => handleApprove(item.id, item.amount, item.description)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-bold shadow"
                    >
                      Setujui
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseApproval;