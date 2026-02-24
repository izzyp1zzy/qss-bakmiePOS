import React, { useState, useEffect, Fragment } from 'react';
import { 
  FileText, TrendingUp, DollarSign, Calendar, ArrowLeftRight, 
  PieChart, ArrowUpCircle, ArrowDownCircle, PlusCircle, X, Save, 
  Plus, Trash2, Settings 
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';

// --- MODAL 1: TAMBAH AKUN BARU (COA) ---
const AddAccountModal = ({ onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({ code: '', name: '', category: 'Expense', normalBalance: 'Debit' });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.code || !formData.name) return alert("Kode dan Nama Akun wajib diisi!");
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Settings size={18}/> Tambah Akun Baru</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kode Akun</label>
                <input name="code" className="w-full p-3 border rounded-xl text-sm font-mono" placeholder="Cth: 6105" value={formData.code} onChange={handleChange} autoFocus />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                <select name="category" className="w-full p-3 border rounded-xl text-sm bg-white" value={formData.category} onChange={handleChange}>
                   <option value="Asset">Asset (Harta)</option>
                   <option value="Liability">Liability (Hutang)</option>
                   <option value="Equity">Equity (Modal)</option>
                   <option value="Revenue">Revenue (Pendapatan)</option>
                   <option value="COGS">COGS (HPP)</option>
                   <option value="Expense">Expense (Beban)</option>
                </select>
             </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Akun</label>
            <input name="name" className="w-full p-3 border rounded-xl text-sm" placeholder="Cth: Biaya Iklan Instagram" value={formData.name} onChange={handleChange} />
          </div>
          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Saldo Normal</label>
             <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                   <input type="radio" name="normalBalance" value="Debit" checked={formData.normalBalance === 'Debit'} onChange={handleChange} /> Debit (Bertambah di Kiri)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                   <input type="radio" name="normalBalance" value="Credit" checked={formData.normalBalance === 'Credit'} onChange={handleChange} /> Credit (Bertambah di Kanan)
                </label>
             </div>
          </div>
          <button disabled={isSubmitting} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-black transition-colors flex justify-center items-center gap-2">
            {isSubmitting ? 'Menyimpan...' : <><Plus size={18}/> Simpan Akun</>}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MODAL 2: FORM JURNAL MANUAL ---
const ManualJournalModal = ({ accounts, onClose, onSubmit, isSubmitting }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [debitAcc, setDebitAcc] = useState('');
  const [creditAcc, setCreditAcc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desc || !amount || !debitAcc || !creditAcc) return alert("Semua kolom wajib diisi!");
    if (debitAcc === creditAcc) return alert("Akun Debit dan Kredit tidak boleh sama!");
    
    onSubmit({
      description: desc,
      amount: parseFloat(amount),
      debitCode: debitAcc,
      creditCode: creditAcc
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><PlusCircle size={20}/> Jurnal Umum Manual</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan Transaksi</label>
            <input className="w-full p-3 border rounded-xl text-sm" placeholder="Cth: Beli Kulkas Second, Bayar Hutang..." value={desc} onChange={e=>setDesc(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nominal (Rp)</label>
            <input type="number" className="w-full p-3 border rounded-xl text-sm font-bold" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-600 uppercase mb-1">Posisi Debit (Masuk/Beban)</label>
              <select className="w-full p-3 border rounded-xl text-sm bg-white" value={debitAcc} onChange={e=>setDebitAcc(e.target.value)}>
                <option value="">-- Pilih Akun --</option>
                {accounts.map(a => <option key={a.code} value={a.code}>({a.code}) {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-red-600 uppercase mb-1">Posisi Kredit (Keluar/Sumber)</label>
              <select className="w-full p-3 border rounded-xl text-sm bg-white" value={creditAcc} onChange={e=>setCreditAcc(e.target.value)}>
                <option value="">-- Pilih Akun --</option>
                {accounts.map(a => <option key={a.code} value={a.code}>({a.code}) {a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
            <p>💡 <b>Contoh Jurnal:</b></p>
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li>Beli Aset Tunai: Debit (Peralatan) - Kredit (Kas)</li>
              <li>Bayar Hutang: Debit (Hutang) - Kredit (Kas)</li>
              <li>Tarik Prive: Debit (Prive Owner) - Kredit (Kas)</li>
            </ul>
          </div>
          <button disabled={isSubmitting} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex justify-center items-center gap-2">
            {isSubmitting ? 'Menyimpan...' : <><Save size={18}/> Simpan Jurnal</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const AccountingView = ({ appId, db }) => {
  const [activeTab, setActiveTab] = useState('summary'); // summary, journal
  const [accounts, setAccounts] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showManualModal, setShowManualModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA REAL-TIME ---
  useEffect(() => {
    // 1. Ambil Data Akun (COA)
    const unsubAccounts = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'accounts'), (snapshot) => {
      const accData = snapshot.docs.map(doc => doc.data());
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

  // --- LOGIKA TAMBAH AKUN ---
  const handleAddAccount = async (data) => {
      setIsSubmitting(true);
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', data.code), {
              ...data,
              currentBalance: 0,
              updatedAt: new Date()
          });
          alert("Akun berhasil ditambahkan!");
          setShowAccountModal(false);
      } catch (e) {
          console.error(e);
          alert("Gagal menambah akun.");
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeleteAccount = async (code) => {
      if(!window.confirm("Hapus akun ini? Pastikan akun tidak memiliki saldo.")) return;
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', code));
      } catch (e) {
          alert("Gagal menghapus akun.");
      }
  };

  // --- LOGIKA MANUAL JURNAL ---
  const handleManualJournal = async (data) => {
    setIsSubmitting(true);
    try {
      const debitAccount = accounts.find(a => a.code === data.debitCode);
      const creditAccount = accounts.find(a => a.code === data.creditCode);

      // 1. Buat Record Jurnal
      const journalEntry = {
        date: new Date().toISOString(),
        description: data.description,
        referenceId: `MANUAL-${Date.now().toString().slice(-6)}`,
        type: 'GENERAL', // General Journal
        lines: [
          { accountId: debitAccount.code, accountName: debitAccount.name, debit: data.amount, credit: 0 },
          { accountId: creditAccount.code, accountName: creditAccount.name, debit: 0, credit: data.amount }
        ],
        timestamp: new Date()
      };
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'journal_entries'), journalEntry);

      // 2. Update Saldo Akun (Debit)
      const debitChange = debitAccount.normalBalance === 'Debit' ? data.amount : -data.amount;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', data.debitCode), {
        currentBalance: increment(debitChange)
      });

      // 3. Update Saldo Akun (Kredit)
      const creditChange = creditAccount.normalBalance === 'Credit' ? data.amount : -data.amount;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', data.creditCode), {
        currentBalance: increment(creditChange)
      });

      setShowManualModal(false);
      alert("Jurnal manual berhasil dicatat!");
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan jurnal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HITUNG RINGKASAN ---
  const totalRevenue = accounts.filter(a => a.category === 'Revenue').reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalExpenses = accounts.filter(a => ['Expense', 'COGS'].includes(a.category)).reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  if (loading) return <div className="p-8 text-center text-gray-400">Memuat data keuangan...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
      
      {showManualModal && (
        <ManualJournalModal 
          accounts={accounts} 
          onClose={() => setShowManualModal(false)} 
          onSubmit={handleManualJournal}
          isSubmitting={isSubmitting}
        />
      )}

      {showAccountModal && (
        <AddAccountModal 
          onClose={() => setShowAccountModal(false)} 
          onSubmit={handleAddAccount}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <PieChart className="text-blue-600" /> Laporan Keuangan
          </h2>
          <p className="text-sm text-gray-500">Pantau kesehatan finansial bisnis Anda secara real-time.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* TOMBOL INPUT DISESUAIKAN DENGAN TAB AKTIF */}
          
          {/* Tombol Input Jurnal hanya muncul di Tab Jurnal */}
          {activeTab === 'journal' && (
            <button 
                onClick={() => setShowManualModal(true)} 
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center gap-2"
            >
                <PlusCircle size={16}/> Input Jurnal
            </button>
          )}
          
          {/* Tombol Kelola Akun hanya muncul di Tab Summary/Neraca */}
          {activeTab === 'summary' && (
            <button 
                onClick={() => setShowAccountModal(true)} 
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
            >
                <Settings size={16}/> Kelola Akun
            </button>
          )}

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
              Buku Jurnal
            </button>
          </div>
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
              Posisi Saldo Akun (Chart of Accounts)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 border-b">
                  <tr>
                    <th className="p-4 w-20">Kode</th>
                    <th className="p-4">Nama Akun</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4 text-right">Saldo Akhir</th>
                    <th className="p-4 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accounts.map((acc) => (
                    <tr key={acc.code} className="hover:bg-gray-50 group">
                      <td className="p-4 font-mono text-xs text-gray-400 font-bold">{acc.code}</td>
                      <td className="p-4 font-bold text-slate-800">{acc.name}</td>
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
                      <td className="p-4 text-center">
                          <button onClick={()=>handleDeleteAccount(acc.code)} className="text-gray-300 hover:text-red-500 p-2 rounded opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 size={16}/>
                          </button>
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
                  <Fragment key={journal.id}>
                    {/* Baris Header Jurnal */}
                    <tr className="bg-slate-50/50 border-t border-slate-200">
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
                  </Fragment>
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