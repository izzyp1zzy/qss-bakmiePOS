import React, { useEffect, useState } from 'react';
// IMPORT FIXED: Naik 2 level (../../) untuk mencari firebaseConfig di folder src/
import { db } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';

const ExpenseApproval = ({ user, showNotification, askConfirm }) => {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const appId = typeof __app_id !== 'undefined' && __app_id ? __app_id : 'toko-kopi-rahasia-v2';

  useEffect(() => {
    const q = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'expenses'),
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

  const getAccountCode = (category) => {
    switch (category) {
        case 'bahan_baku': return { code: '1200', name: 'Persediaan Bahan Baku' }; 
        case 'operasional': return { code: '6300', name: 'Beban Perlengkapan' };
        case 'transport': return { code: '6500', name: 'Beban Maintenance/Transport' };
        case 'gaji': return { code: '6000', name: 'Beban Gaji' };
        default: return { code: '6900', name: 'Beban Lain-lain' };
    }
  };

  const handleApprove = (item) => {
    const confirmMsg = `Setujui pengeluaran "${item.description}" senilai Rp ${item.amount.toLocaleString()}? Saldo Kas akan terpotong.`;
    
    const processApprove = async () => {
      try {
        const expenseRef = doc(db, 'artifacts', appId, 'public', 'data', 'expenses', item.id);
        const debitAccount = getAccountCode(item.category);

        await updateDoc(expenseRef, {
          status: 'approved',
          approved_by: user.name,
          approved_at: serverTimestamp() 
        });

        const journalEntry = {
          date: new Date().toISOString(),
          description: `Expense: ${item.description}`,
          referenceId: item.id,
          type: 'EXPENSE',
          lines: [
              { accountId: debitAccount.code, accountName: debitAccount.name, debit: item.amount, credit: 0 },
              { accountId: '1000', accountName: 'Kas Kasir', debit: 0, credit: item.amount }
          ],
          timestamp: new Date()
        };

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'journal_entries'), journalEntry);

        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', '1000'), {
           currentBalance: increment(-item.amount) 
        });
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', debitAccount.code), {
           currentBalance: increment(item.amount) 
        });

        if (showNotification) showNotification("Pengeluaran disetujui & Jurnal tercatat otomatis!", "success");
      } catch (error) {
        console.error("Error approving:", error);
        if (showNotification) showNotification("Gagal memproses persetujuan.", "error");
      }
    };

    if (askConfirm) {
        askConfirm(confirmMsg, processApprove);
    } else if (window.confirm(confirmMsg)) {
        processApprove();
    }
  };

  const handleReject = (id) => {
    const processReject = async () => {
        try {
          const expenseRef = doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id);
          await updateDoc(expenseRef, {
            status: 'rejected',
            rejection_reason: 'Ditolak Owner',
            approved_by: user.name, 
            approved_at: serverTimestamp()
          });
          if (showNotification) showNotification("Pengeluaran ditolak.", "success");
        } catch (error) {
          console.error("Error rejecting:", error);
        }
    };

    if (askConfirm) {
        askConfirm("Tolak pengeluaran ini?", processReject);
    } else if (window.confirm("Tolak pengeluaran ini?")) {
        processReject();
    }
  };

  const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  if (loading) return <div className="p-4 text-center text-gray-500 animate-pulse">Memuat data persetujuan...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <span className="w-2 h-6 bg-red-600 rounded-full"></span>
        Konfirmasi Pengeluaran & Akuntansi <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{pendingExpenses.length}</span>
      </h2>

      {pendingExpenses.length === 0 ? (
        <p className="text-gray-500 italic text-sm">Tidak ada pengajuan pengeluaran yang menunggu.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-100 bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Diajukan Oleh</th>
                <th className="px-4 py-3">Keterangan</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingExpenses.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {item.created_at?.toDate ? item.created_at.toDate().toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {item.input_by} <br/>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{item.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {item.description} <br/>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900 font-mono">
                    {formatRupiah(item.amount)}
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button onClick={() => handleReject(item.id)} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs font-bold transition-colors">Tolak</button>
                    <button onClick={() => handleApprove(item)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-xs font-bold shadow transition-colors">Setujui</button>
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