import React, { useState, useEffect } from 'react';
import { 
  FileText, TrendingUp, DollarSign, Calendar, ArrowLeftRight, 
  PieChart, ArrowUpCircle, ArrowDownCircle 
} from 'lucide-react';
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const AccountingView = ({ appId, db }) => {
  const [activeTab, setActiveTab] = useState('summary'); // summary, journal
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA REAL-TIME ---
  useEffect(() => {
    // 1. Ambil Data Akun (COA)
    const unsubAccounts = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'accounts'), (snapshot) => {
      const accData = snapshot.docs.map(doc => doc.data());
      // Urutkan berdasarkan Kode Akun
      setAccounts(accData.sort((a, b) => parseInt(a.code) - parseInt(b.code)));
    });

    // 2. Ambil Data Jurnal (History)
    const qJournal = query(collection(db, 'artifacts', appId, 'public', 'data', 'journal_entries'), orderBy('timestamp', 'desc'));
    const unsubJournals = onSnapshot(qJournal, (snapshot) => {
      setJournals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubAccounts();
      unsubJournals();
    };
  }, [db, appId]);

  // --- HITUNG RINGKASAN ---
  const totalAssets = accounts.filter(a => a.category === 'Asset').reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalRevenue = accounts.filter(a => a.category === 'Revenue').reduce((sum, a) => sum + (a.currentBalance || 0), 0); // Ingat: Revenue di kredit bertambah, tapi saldo kita simpan raw value
  const totalExpenses = accounts.filter(a => ['Expense', 'COGS'].includes(a.category)).reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const netProfit = totalRevenue - totalExpenses; // Pendapatan - Beban

  if (loading) return <div className="p-8 text-center text-gray-400">Memuat data keuangan...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <PieChart className="text-blue-600" /> Laporan Keuangan
          </h2>
          <p className="text-sm text-gray-500">Pantau kesehatan finansial bisnis Anda secara real-time.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('summary')} 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'summary' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Neraca & Laba Rugi
          </button>
          <button 
            onClick={() => setActiveTab('journal')} 
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'journal' ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Jurnal Umum
          </button>
        </div>
      </div>

      {activeTab === 'summary' && (
        <>
          {/* KARTU RINGKASAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 text-emerald-800">
              <p className="text-xs font-bold uppercase opacity-70 mb-1 flex items-center gap-2"><TrendingUp size={14}/> Pendapatan Bersih</p>
              <h3 className="text-2xl font-black">Rp {totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100 text-red-800">
              <p className="text-xs font-bold uppercase opacity-70 mb-1 flex items-center gap-2"><ArrowDownCircle size={14}/> Total Beban & HPP</p>
              <h3 className="text-2xl font-black">Rp {totalExpenses.toLocaleString()}</h3>
            </div>
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-blue-800">
              <p className="text-xs font-bold uppercase opacity-70 mb-1 flex items-center gap-2"><DollarSign size={14}/> Laba Bersih (Profit)</p>
              <h3 className="text-2xl font-black">Rp {netProfit.toLocaleString()}</h3>
            </div>
          </div>

          {/* TABEL NERACA SALDO */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-slate-700 text-sm uppercase tracking-wider">
              Posisi Saldo Akun (Live)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="p-4 w-20">Kode</th>
                    <th className="p-4">Nama Akun</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4 text-right">Saldo Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accounts.map((acc) => (
                    <tr key={acc.code} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-xs text-gray-400 font-bold">{acc.code}</td>
                      <td className="p-4 font-bold text-slate-700">{acc.name}</td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold 
                          ${acc.category === 'Asset' ? 'bg-green-100 text-green-700' : 
                            acc.category === 'Revenue' ? 'bg-emerald-100 text-emerald-700' :
                            acc.category === 'Expense' || acc.category === 'COGS' ? 'bg-red-100 text-red-700' : 
                            'bg-gray-100 text-gray-600'}`}>
                          {acc.category}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-mono font-bold ${acc.currentBalance < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        Rp {acc.currentBalance?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'journal' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-bold text-slate-700 text-sm uppercase tracking-wider flex justify-between items-center">
            <span>Riwayat Jurnal (Posting)</span>
            <span className="text-xs normal-case text-gray-500 font-normal">{journals.length} Transaksi tercatat</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 border-b">
                <tr>
                  <th className="p-4">Tanggal / Ref</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4 text-right">Debit</th>
                  <th className="p-4 text-right">Kredit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {journals.map((journal) => (
                  <React.Fragment key={journal.id}>
                    {/* Baris Header Jurnal */}
                    <tr className="bg-slate-50/50">
                      <td className="p-3 pl-4 text-xs font-mono text-gray-500 border-l-4 border-blue-500">
                        {new Date(journal.date).toLocaleString('id-ID')}
                      </td>
                      <td colSpan="3" className="p-3 font-bold text-slate-700 text-xs uppercase tracking-wide">
                        {journal.description} <span className="text-gray-400 font-normal normal-case">({journal.referenceId})</span>
                      </td>
                    </tr>
                    {/* Baris Detail Akun (Debit/Kredit) */}
                    {journal.lines.map((line, idx) => (
                      <tr key={`${journal.id}-${idx}`} className="hover:bg-white">
                        <td className="p-2 pl-8 text-xs text-gray-400 font-mono">{line.accountId}</td>
                        <td className="p-2 text-xs font-medium text-slate-600">{line.accountName}</td>
                        <td className="p-2 text-right font-mono text-xs text-slate-800">
                          {line.debit > 0 ? `Rp ${line.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-2 text-right font-mono text-xs text-slate-800 pr-4">
                          {line.credit > 0 ? `Rp ${line.credit.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingView;