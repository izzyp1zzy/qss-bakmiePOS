import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, AlertCircle, Shield, TrendingUp, TrendingDown, Target, Edit2, Check, 
  AlertTriangle, XCircle, CheckCircle, Wallet, X, PieChart, DollarSign, ArrowUpRight, ArrowDownRight,
  Clock, UserCheck, LogOut, Receipt, ShoppingBag, Activity, Calendar, Trash2, Package, Plus, Briefcase, Bell
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';

// IMPORT DB DARI ROOT
import { db } from '../firebaseConfig'; 

// ID Database
const appId = 'pos-system-v3-secure'; 

// ============================================================================
// KOMPONEN: MODAL CATAT SPOILAGE (BAHAN RUSAK)
// ============================================================================
const SpoilageModal = ({ ingredients, onClose, onSave }) => {
    const [ingId, setIngId] = useState('');
    const [qty, setQty] = useState('');
    const [reason, setReason] = useState('');

    const selectedIng = ingredients.find(i => i.id === ingId);
    const lossValue = selectedIng ? (parseFloat(selectedIng.costPerUnit) || 0) * (parseFloat(qty) || 0) : 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!ingId) return alert("Pilih bahan yang rusak!");
        if(!qty || parseFloat(qty) <= 0) return alert("Jumlah harus lebih dari 0!");
        if(!reason.trim()) return alert("Alasan wajib diisi!");
        
        const currentStock = parseFloat(selectedIng?.stock) || 0;
        if(parseFloat(qty) > currentStock) {
            return alert(`Gagal! Jumlah melebihi stok yang ada (${currentStock} ${selectedIng.unit}).`);
        }

        onSave(ingId, parseFloat(qty), reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                    <h3 className="font-black text-lg text-stone-800 flex items-center gap-2">
                        <AlertTriangle className="text-orange-500"/> Catat Spoilage
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400 hover:text-red-500"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase">Pilih Bahan Baku</label>
                        <select 
                            className="w-full p-3 border border-stone-200 rounded-xl text-sm font-bold text-stone-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-stone-50"
                            value={ingId}
                            onChange={(e) => setIngId(e.target.value)}
                        >
                            <option value="">-- Pilih Bahan --</option>
                            {ingredients.filter(i => (parseFloat(i.stock) || 0) > 0).map(ing => (
                                <option key={ing.id} value={ing.id}>
                                    {ing.name} (Sisa: {ing.stock} {ing.unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase">Jumlah Rusak</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-full p-3 border border-stone-200 rounded-xl font-bold text-stone-800 outline-none focus:border-orange-500 bg-white" 
                                    placeholder="0" 
                                    value={qty} 
                                    onChange={e=>setQty(e.target.value)} 
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                                    {selectedIng ? selectedIng.unit : ''}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 uppercase">Estimasi Kerugian</label>
                            <div className="w-full p-3 border border-red-100 bg-red-50 rounded-xl font-mono font-bold text-red-600 flex items-center h-[46px]">
                                Rp {lossValue.toLocaleString('id-ID')}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase">Alasan / Keterangan</label>
                        <textarea 
                            className="w-full p-3 border border-stone-200 rounded-xl text-sm text-stone-800 outline-none focus:border-orange-500 bg-stone-50 h-20 resize-none" 
                            placeholder="Cth: Susu basi, sayur layu, botol pecah..." 
                            value={reason} 
                            onChange={e=>setReason(e.target.value)} 
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors text-sm">Batal</button>
                        <button type="submit" className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 text-sm">Potong Stok</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// KOMPONEN: NOTIFIKASI PENGELUARAN POS 
// ============================================================================
const POSExpenseNotification = ({ expenses }) => {
    const posExpenses = expenses.filter(e => 
        e.source === 'POS_CASH' || e.category === 'operasional_darurat' || e.category === 'spoilage'
    ).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)); 

    const recentExpenses = posExpenses.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative mt-6">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600"></div>

            <div className="p-5 pl-6 flex justify-between items-center border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    Notifikasi Pengeluaran & Spoilage
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${recentExpenses.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                    {recentExpenses.length} Baru
                </span>
            </div>

            <div className="p-0">
                {recentExpenses.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 italic text-sm">
                        Tidak ada catatan pengeluaran / bahan rusak hari ini.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {recentExpenses.map((exp, idx) => (
                            <div key={idx} className="p-4 pl-6 hover:bg-slate-50 transition-colors flex justify-between items-start group">
                                <div>
                                    <p className="font-bold text-slate-700 text-sm mb-0.5">{exp.description}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">
                                            <UserCheck size={10}/> {exp.user || 'Sistem'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10}/> {exp.timestamp ? new Date(exp.timestamp.seconds * 1000).toLocaleString('id-ID', { hour: '2-digit', minute:'2-digit', day: 'numeric', month: 'short' }) : '-'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold text-red-600 text-sm">
                                        -Rp {parseInt(exp.amount).toLocaleString()}
                                    </p>
                                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                                        {exp.category === 'spoilage' ? 'KERUGIAN (SPOILAGE)' : 'DARURAT (KASIR)'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ============================================================================
// MODAL KHUSUS: MANAJEMEN INVESTOR
// ============================================================================
const InvestorManagementModal = ({ employees, onAdd, onDelete, onClose }) => {
    const [name, setName] = useState('');
    const investors = employees.filter(e => e.role === 'investor');

    const handleAddInvestor = (e) => {
        e.preventDefault();
        if(!name.trim()) return alert("Nama Investor wajib diisi");
        onAdd({ name, role: 'investor' });
        setName('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-5 border-b bg-amber-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-lg text-amber-800 flex items-center gap-2">
                            <Briefcase size={20}/> Kelola Akses Investor
                        </h3>
                        <p className="text-xs text-amber-600">Berikan akses pantau (Read-Only) kepada pemodal.</p>
                    </div>
                    <button onClick={onClose}><X size={20} className="text-amber-400 hover:text-amber-700"/></button>
                </div>

                <div className="p-5 bg-slate-50 border-b">
                    <form onSubmit={handleAddInvestor} className="flex gap-2">
                        <input 
                            className="flex-1 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
                            placeholder="Nama Investor Baru..." 
                            value={name}
                            onChange={e=>setName(e.target.value)}
                        />
                        <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-4 rounded-xl font-bold text-xs flex items-center gap-2">
                            <Plus size={16}/> Tambah
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-white">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Daftar Investor Aktif</h4>
                    {investors.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm italic py-4">Belum ada investor terdaftar.</p>
                    ) : (
                        <div className="space-y-2">
                            {investors.map(inv => (
                                <div key={inv.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-slate-50 transition-colors group">
                                    <div>
                                        <p className="font-bold text-slate-800">{inv.name}</p>
                                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">PIN: <span className="bg-slate-100 px-1 rounded font-bold">{inv.loginId}</span></p>
                                    </div>
                                    <button 
                                        onClick={() => onDelete(inv.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        title="Hapus Akses"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 1. MODAL DETAIL PENGELUARAN ---
const ExpenseDetailModal = ({ expenses, totalExpense, onClose, onDelete }) => {
  const expenseStats = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'Lainnya';
    acc[cat] = (acc[cat] || 0) + (parseFloat(curr.amount) || 0);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b bg-red-50 flex justify-between items-center">
           <div>
              <h3 className="font-black text-lg text-red-800 flex items-center gap-2">
                 <TrendingDown size={20}/> Rincian Pengeluaran
              </h3>
              <p className="text-xs text-red-600 font-bold">Total Periode: Rp {totalExpense.toLocaleString()}</p>
           </div>
           <button onClick={onClose}><X size={20} className="text-red-400 hover:text-red-600"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-white">
           {Object.keys(expenseStats).length > 0 && (
               <div className="space-y-3 mb-6">
                  {Object.entries(expenseStats).map(([cat, amount], idx) => {
                      const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                      return (
                        <div key={idx} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-stone-700 capitalize">{cat.replace(/_/g, ' ')}</span>
                                <span className="font-mono font-bold text-stone-600">Rp {amount.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${cat.includes('darurat') || cat === 'spoilage' ? 'bg-red-500' : 'bg-stone-400'}`} style={{ width: `${percent}%` }}></div>
                            </div>
                        </div>
                      )
                  })}
               </div>
           )}
           
           <div className="pt-4 border-t border-dashed border-stone-200">
                <h4 className="text-xs font-bold text-stone-500 mb-3 uppercase flex items-center gap-2">
                    <Activity size={12}/> Riwayat Transaksi (Log)
                </h4>
                
                {expenses.length === 0 ? (
                    <div className="text-center py-8 text-stone-400 text-xs italic">Belum ada data pada periode ini.</div>
                ) : (
                    <div className="space-y-2">
                        {expenses.map((e, i) => (
                            <div key={i} className="flex flex-col gap-1 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:bg-stone-100 transition-colors group relative">
                                <button 
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if(confirm('Hapus data pengeluaran ini?')) onDelete(e.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-white border border-red-100 text-red-400 rounded-lg hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                    title="Hapus Data"
                                >
                                    <Trash2 size={12}/>
                                </button>

                                <div className="flex justify-between items-start pr-6">
                                    <span className="font-bold text-stone-800 text-xs leading-tight">{e.description}</span>
                                    <span className="font-mono text-red-600 text-xs font-black shrink-0 ml-2">
                                        Rp {parseInt(e.amount).toLocaleString()}
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center mt-1">
                                    <div className="flex gap-1 flex-wrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                            e.category === 'operasional_darurat' || e.category === 'spoilage'
                                            ? 'bg-red-100 text-red-700 border border-red-200' 
                                            : 'bg-stone-200 text-stone-500'
                                        }`}>
                                            {e.category?.replace(/_/g, ' ') || 'UMUM'}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                            <UserCheck size={10}/> {e.user || e.input_by || 'System'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                        <Calendar size={10}/>
                                        {e.timestamp ? new Date(e.timestamp.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. MODAL DETAIL OMZET ---
const RevenueDetailModal = ({ transactions, totalRevenue, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-5 border-b bg-emerald-50 flex justify-between items-center">
           <div>
              <h3 className="font-black text-lg text-emerald-800 flex items-center gap-2">
                 <Receipt size={20}/> Rincian Penjualan POS
              </h3>
              <p className="text-xs text-emerald-600 font-bold">Total pendapatan: Rp {totalRevenue.toLocaleString()}</p>
           </div>
           <button onClick={onClose}><X size={20} className="text-emerald-400 hover:text-emerald-600"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-0 bg-stone-50">
            {transactions.length === 0 ? (
               <div className="text-center py-10 text-stone-400">
                   <ShoppingBag className="mx-auto mb-2 opacity-50"/>
                   <p className="text-sm">Belum ada transaksi pada periode ini.</p>
               </div>
            ) : (
               <table className="w-full text-left text-xs">
                   <thead className="bg-emerald-100/50 text-emerald-700 font-bold uppercase sticky top-0 z-10 backdrop-blur-sm">
                       <tr>
                           <th className="p-3">ID / Waktu</th>
                           <th className="p-3">Tipe</th>
                           <th className="p-3 text-right">Total & Aksi</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-100 bg-white">
                       {transactions.map((tx, idx) => (
                           <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                               <td className="p-3">
                                   <div className="font-bold text-stone-700">{tx.id}</div>
                                   <div className="text-[10px] text-stone-400">{tx.date}</div>
                               </td>
                               <td className="p-3">
                                   <span className={`px-2 py-1 rounded text-[10px] font-bold ${tx.orderType === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-stone-100 text-stone-600'}`}>
                                       {tx.orderType || 'Dine In'}
                                   </span>
                               </td>
                               <td className="p-3 text-right">
                                   <div className="font-mono font-bold text-emerald-600 mb-1">
                                       Rp {tx.total.toLocaleString()}
                                   </div>
                                   <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           if(confirm(`Hapus permanen transaksi ${tx.id}?`)) onDelete(tx.docId || tx.id);
                                       }}
                                       className="text-[9px] bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                   >
                                       Hapus
                                   </button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
            )}
        </div>
      </div>
    </div>
  );
};

// --- 3. MODAL PROFIT ANALYSIS ---
const ProfitAnalysisModal = ({ revenue, expense, capital, netProfit, onClose }) => {
    const totalInflow = revenue + capital;
    const isLoss = expense > totalInflow;
    const expensePercent = totalInflow > 0 ? Math.min(100, Math.round((expense / totalInflow) * 100)) : 0;
    const profitPercent = 100 - expensePercent;
    
    const chartStyle = {
        background: `conic-gradient(#ef4444 0% ${expensePercent}%, #10b981 ${expensePercent}% 100%)`
    };

    return (
      <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b bg-blue-50 flex justify-between items-center">
             <h3 className="font-black text-lg text-blue-800 flex items-center gap-2">
                <PieChart size={20}/> Analisa Profitabilitas
             </h3>
             <button onClick={onClose}><X size={20} className="text-blue-400 hover:text-blue-600"/></button>
          </div>
  
          <div className="p-8 flex flex-col items-center bg-white">
              <div className="relative w-48 h-48 rounded-full shadow-inner mb-8 flex items-center justify-center transition-all duration-1000" style={chartStyle}>
                  <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-xl">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Net Margin</span>
                      <span className={`text-3xl font-black ${isLoss ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isLoss ? '-' : '+'}{Math.abs(profitPercent)}%
                      </span>
                  </div>
              </div>

              <div className="w-full space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                          <div className="flex flex-col">
                              <span className="text-xs font-bold text-stone-600">Total Beban</span>
                              <span className="text-[9px] text-stone-400">Pengeluaran + HPP</span>
                          </div>
                      </div>
                      <span className="font-mono font-bold text-red-600 text-sm">Rp {expense.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                          <div className="flex flex-col">
                              <span className="text-xs font-bold text-stone-600">Laba Bersih</span>
                              <span className="text-[9px] text-stone-400">Keuntungan Real</span>
                          </div>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 text-sm">Rp {netProfit.toLocaleString()}</span>
                  </div>
                  
                  {capital > 0 && (
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                              <span className="text-xs font-bold text-stone-600">Modal Harian (Masuk)</span>
                          </div>
                          <span className="font-mono font-bold text-blue-600 text-sm">+ Rp {capital.toLocaleString()}</span>
                      </div>
                  )}

                  <div className="pt-4 border-t border-dashed mt-2">
                      <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Pendapatan ()</span>
                          <span className="font-black text-stone-800 text-base">Rp {revenue.toLocaleString()}</span>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    );
};

// ============================================================================
// BAGIAN 2: KOMPONEN KARTU DASHBOARD
// ============================================================================

const RevenueCard = ({ revenue, onClick }) => (
    <div onClick={onClick} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm col-span-1 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={64} className="text-emerald-500"/>
        </div>
        <div className="flex justify-between items-center mb-2 relative z-10">
            <h3 className="text-stone-500 text-sm font-bold uppercase flex items-center gap-2">
               <TrendingUp size={16} className="text-emerald-500"/> pendapatan/Periode
            </h3>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Detail <ArrowUpRight size={10}/>
            </span>
        </div>
        <p className="text-2xl lg:text-3xl font-black text-stone-800 relative z-10">Rp {revenue.toLocaleString()}</p>
    </div>
);

const ExpenseCard = ({ expenses, onClick }) => (
    <div onClick={onClick} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm col-span-1 cursor-pointer hover:shadow-md hover:border-red-200 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingDown size={64} className="text-red-500"/>
        </div>
        <div className="flex justify-between items-center mb-2 relative z-10">
            <h3 className="text-stone-500 text-sm font-bold uppercase flex items-center gap-2">
               <TrendingDown size={16} className="text-red-500"/> Pengeluaran
            </h3>
            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Rincian <ArrowDownRight size={10}/>
            </span>
        </div>
        <p className="text-2xl lg:text-3xl font-black text-red-600 relative z-10">Rp {expenses.toLocaleString()}</p>
    </div>
);

const NetProfitCard = ({ netProfit, onClick, readOnly }) => {
  const [target, setTarget] = useState(10000000); 
  const [isEditing, setIsEditing] = useState(false);
  const [tempInput, setTempInput] = useState(target);
  const percentage = target > 0 ? Math.min(100, Math.round((netProfit / target) * 100)) : 0;
  
  const saveTarget = (e) => { 
      e.stopPropagation(); 
      setTarget(tempInput); 
      setIsEditing(false); 
  };

  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-br from-red-900 to-red-950 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform col-span-1 md:col-span-3 lg:col-span-1"
    >
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={14}/> Laba Bersih (Net Profit)
            </p>
            <h3 className="text-2xl md:text-3xl font-bold mt-1">Rp {netProfit.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-red-800 flex items-center justify-center text-xs font-bold bg-red-900 shadow-inner group-hover:bg-white group-hover:text-red-900 transition-colors">
             {percentage}%
          </div>
        </div>

        <div className="w-full bg-black/30 h-2 rounded-full mb-4 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${percentage >= 100 ? 'bg-emerald-400' : 'bg-red-500'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between backdrop-blur-sm transition-colors hover:bg-white/20" onClick={e => e.stopPropagation()}>
           <div className="flex flex-col">
              <span className="text-[10px] text-red-200 uppercase font-bold flex items-center gap-1"><Target size={10}/> Target Laba</span>
              
              {isEditing ? (
                 <input 
                    type="number" 
                    className="text-sm font-bold bg-transparent border-b border-white outline-none w-24 text-white focus:border-emerald-400"
                    value={tempInput}
                    onChange={(e) => setTempInput(parseInt(e.target.value) || 0)}
                    autoFocus
                 />
              ) : (
                 <span className="text-sm font-bold font-mono">Rp {target.toLocaleString()}</span>
              )}
           </div>

           {!readOnly && (
               <button 
                  onClick={isEditing ? saveTarget : () => { setTempInput(target); setIsEditing(true); }}
                  className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white text-red-900 hover:bg-red-100'}`}
               >
                  {isEditing ? <Check size={16}/> : <Edit2 size={16}/>}
               </button>
           )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BAGIAN 3: DASHBOARD VIEW UTAMA
// ============================================================================

const DashboardView = ({ 
    currentUser, ingredients, employees, transactions, 
    onUpdateIngredient, onToggleShift, onApproveVoid, onRejectVoid,
    onInputCapital, onRecordExpense, showNotification, askConfirm,
    onAddEmployee, onDeleteEmployee 
}) => {
  const [expenses, setExpenses] = useState([]);
  const [capitalLogs, setCapitalLogs] = useState([]);
  const [activeModal, setActiveModal] = useState(null); 
  
  // [BARU] STATE UNTUK FILTER TANGGAL (Default: Dari tanggal 1 bulan ini s/d hari ini)
  const [startDate, setStartDate] = useState(() => {
      const d = new Date();
      d.setDate(1); // Set ke tanggal 1
      return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
      return new Date().toISOString().split('T')[0];
  });
  
  // --- FETCH DATA ---
  useEffect(() => {
     const qExp = query(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), where("status", "==", "approved"));
     const unsubExp = onSnapshot(qExp, (snapshot) => {
        const expenseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        expenseData.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
        setExpenses(expenseData);
     });

     const qCap = query(collection(db, 'artifacts', appId, 'public', 'data', 'capital_logs'));
     const unsubCap = onSnapshot(qCap, (snapshot) => {
        const capData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCapitalLogs(capData);
     });

     return () => { unsubExp(); unsubCap(); }
  }, []);

  // --- HANDLER SPOILAGE ---
  const handleRecordSpoilage = async (ingredientId, qty, reason) => {
      const ing = ingredients.find(i => i.id === ingredientId);
      if(!ing) return;

      const lossValue = (parseFloat(ing.costPerUnit) || 0) * qty;
      const newStock = Math.max(0, (parseFloat(ing.stock) || 0) - qty);

      try {
          // 1. Potong Stok Bahan
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', ingredientId), {
              stock: newStock
          });

          // 2. Catat sebagai Kerugian (Expense) agar memotong Laba Bersih
          if (lossValue > 0) {
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'expenses'), {
                  description: `Bahan Rusak/Terbuang: ${ing.name} (${reason})`,
                  category: 'spoilage',
                  amount: lossValue,
                  status: 'approved',
                  timestamp: new Date(),
                  created_at: new Date(),
                  approved_at: new Date(),
                  user: currentUser.name || 'Admin',
                  source: 'INVENTORY_SPOILAGE'
              });
          }
          
          showNotification(`Catatan berhasil. Stok ${ing.name} dipotong ${qty} ${ing.unit}.`);
      } catch (error) {
          console.error(error);
          showNotification('Gagal memproses data', 'error');
      }
  };

  const handleDeleteExpense = async (id) => {
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id));
          showNotification('Data berhasil dihapus');
      } catch (error) {
          showNotification('Gagal menghapus', 'error');
      }
  };

  const handleDeleteTransaction = async (id) => {
      try {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id));
          showNotification('Riwayat transaksi dihapus');
      } catch (error) {
          showNotification('Gagal menghapus', 'error');
      }
  };

  // [UPDATED] FUNGSI FILTER BERDASARKAN RENTANG TANGGAL
  const isWithinRange = (timestamp) => {
      if (!timestamp) return false;
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Set ke awal hari
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Set ke akhir hari

      return date >= start && date <= end;
  };

  const filteredTransactions = useMemo(() => {
      return transactions.filter(t => t.status === 'success' && isWithinRange(t.timestamp));
  }, [transactions, startDate, endDate]);

  const filteredRevenue = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + (t.total || 0), 0);
  }, [filteredTransactions]);

  const filteredExpensesList = useMemo(() => {
    return expenses.filter(e => isWithinRange(e.approved_at || e.created_at || e.timestamp));
  }, [expenses, startDate, endDate]);

  const filteredExpensesTotal = useMemo(() => {
    return filteredExpensesList.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  }, [filteredExpensesList]);

  const filteredCapital = useMemo(() => {
    return capitalLogs
      .filter(c => isWithinRange(c.timestamp))
      .reduce((acc, c) => acc + (parseFloat(c.amount) || 0), 0);
  }, [capitalLogs, startDate, endDate]);

  const netProfit = filteredRevenue - filteredExpensesTotal + filteredCapital;

  const activeStaff = employees.filter(e => e.isShiftActive);
  const voidRequests = transactions.filter(t => t.status === 'void_pending');
  const [capitalInput, setCapitalInput] = useState('');

  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin';
  const isInvestor = currentUser?.role === 'investor';
  const isCanViewFinance = isOwner || isInvestor;
  const isCanRecordSpoilage = isOwner || isAdmin; 

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      
      {/* MODAL-MODAL DETAIL */}
      {activeModal === 'expense' && (
        <ExpenseDetailModal expenses={filteredExpensesList} totalExpense={filteredExpensesTotal} onClose={() => setActiveModal(null)} onDelete={handleDeleteExpense} />
      )}
      {activeModal === 'revenue' && (
        <RevenueDetailModal transactions={filteredTransactions} totalRevenue={filteredRevenue} onClose={() => setActiveModal(null)} onDelete={handleDeleteTransaction} />
      )}
      {activeModal === 'profit' && (
        <ProfitAnalysisModal revenue={filteredRevenue} expense={filteredExpensesTotal} capital={filteredCapital} netProfit={netProfit} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'manageInvestors' && (
          <InvestorManagementModal employees={employees} onAdd={onAddEmployee} onDelete={onDeleteEmployee} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'spoilage' && (
          <SpoilageModal ingredients={ingredients} onClose={() => setActiveModal(null)} onSave={handleRecordSpoilage} />
      )}
      
      {/* NOTIFIKASI VOID (Hanya Owner) */}
      {isOwner && voidRequests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm animate-pulse">
              <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-yellow-600"/> Permintaan Pembatalan ({voidRequests.length})
              </h3>
              <div className="space-y-3">
                  {voidRequests.map(req => (
                      <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                              <div className="font-bold text-stone-800">{req.id} • Rp {req.total.toLocaleString()}</div>
                              <p className="text-xs text-stone-500">Kasir: {req.voidRequestedBy} • Alasan: <span className="font-bold text-red-500 italic">"{req.voidReason}"</span></p>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                              <button onClick={()=>onRejectVoid(req.id)} className="flex-1 md:flex-none px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><XCircle size={14}/> Tolak</button>
                              <button onClick={()=>onApproveVoid(req)} className="flex-1 md:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md"><CheckCircle size={14}/> Setujui & Balikin Stok</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* PANEL OWNER */}
      {isOwner && (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="bg-white p-4 md:p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center gap-4 flex-1">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Wallet size={24}/></div>
                    <div>
                        <h3 className="font-bold text-gray-800">Modal Kasir Harian</h3>
                        <p className="text-xs text-gray-500">Input uang kembalian awal di laci.</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto flex-1 justify-end">
                    <input type="number" placeholder="Nominal (Rp)..." className="p-3 border rounded-xl text-sm font-bold flex-1 md:flex-none md:w-48 outline-none focus:border-blue-500" value={capitalInput} onChange={(e) => setCapitalInput(e.target.value)} />
                    <button onClick={() => { onInputCapital(capitalInput); setCapitalInput(''); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs whitespace-nowrap">+ Setor Modal</button>
                </div>
            </div>

            <button onClick={() => setActiveModal('manageInvestors')} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-amber-400 hover:shadow-md transition-all group w-full md:w-32">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Briefcase size={20}/></div>
                <span className="font-bold text-stone-700 text-xs text-center">Akses Investor</span>
            </button>

            <button onClick={() => setActiveModal('spoilage')} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:shadow-md transition-all group w-full md:w-32">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><AlertTriangle size={20}/></div>
                <span className="font-bold text-stone-700 text-xs text-center">Bahan Rusak</span>
            </button>
        </div>
      )}

      {/* PANEL ADMIN */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${currentUser.isShiftActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {currentUser.isShiftActive ? <UserCheck size={32}/> : <Clock size={32}/>}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Halo, {currentUser.name}!</h2>
                        <p className={`text-sm font-medium flex items-center gap-2 ${currentUser.isShiftActive ? 'text-green-600' : 'text-gray-500'}`}>
                            {currentUser.isShiftActive ? <span className="flex items-center gap-1">● Shift Aktif</span> : <span>○ Belum Check-in</span>}
                        </p>
                    </div>
                </div>
                <button onClick={() => onToggleShift(currentUser.id)} className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 ${currentUser.isShiftActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                    {currentUser.isShiftActive ? <><LogOut size={18}/> Check-Out</> : <><UserCheck size={18}/> Check-In</>}
                </button>
            </div>
            
            <div className="flex gap-4">
                <button onClick={() => setActiveModal('expense')} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center gap-2 flex-1 hover:border-blue-400 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Receipt size={24}/></div>
                    <span className="font-bold text-stone-700 text-sm">Lihat Log Biaya</span>
                </button>
                
                <button onClick={() => setActiveModal('spoilage')} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center gap-2 flex-1 hover:border-orange-400 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><AlertTriangle size={24}/></div>
                    <span className="font-bold text-stone-700 text-sm">Catat Spoilage</span>
                </button>
            </div>
        </div>
      )}

      {/* [BARU] FILTER TANGGAL KHUSUS UNTUK KARTU FINANSIAL */}
      {isCanViewFinance && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span className="text-sm font-bold text-stone-600 flex items-center gap-2">
                  <Calendar size={18} className="text-emerald-600"/> Tampilkan Data:
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input 
                      type="date" 
                      className="p-2 border border-stone-200 rounded-lg text-sm font-bold text-stone-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                  />
                  <span className="text-stone-400 font-bold">s/d</span>
                  <input 
                      type="date" 
                      className="p-2 border border-stone-200 rounded-lg text-sm font-bold text-stone-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-full sm:w-auto" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                  />
              </div>
          </div>
      )}

      {/* --- KARTU STATISTIK UTAMA (Owner & Investor) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isCanViewFinance && (
           <>
             {/* Data yang dikirim ke kartu kini adalah data yang sudah di-filter */}
             <RevenueCard revenue={filteredRevenue} onClick={() => setActiveModal('revenue')} />
             <ExpenseCard expenses={filteredExpensesTotal} onClick={() => setActiveModal('expense')} />
             <NetProfitCard netProfit={netProfit} onClick={() => setActiveModal('profit')} readOnly={isInvestor} />
           </>
        )}
        
        {/* WIDGET TIM BERTUGAS */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm col-span-1 md:col-span-3 lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-bold uppercase">Tim Bertugas</h3>
            <div className="flex items-center gap-2 text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-bold">
               <Users size={16}/> {activeStaff.length}
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activeStaff.length > 0 ? activeStaff.map(s => (
              <div key={s.id} className="text-xs bg-green-50 text-green-700 p-3 rounded-lg flex items-center justify-between border border-green-100">
                <div className="flex items-center gap-2">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 
                   <span className="font-bold text-sm">{s.name}</span>
                </div>
                <span className="opacity-80 uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-green-200 tracking-wide">{s.role}</span>
              </div>
            )) : (
                <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                    <Clock size={24} className="mb-2 opacity-20"/>
                    <p className="text-xs italic">Belum ada karyawan aktif.</p>
                </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border shadow-sm col-span-1 md:col-span-3 lg:col-span-2">
           <p className="text-gray-500 text-sm font-bold uppercase mb-4">Status Gudang</p>
           <div className="space-y-1 max-h-40 overflow-y-auto">
             {ingredients.filter(i => i.stock < 5).length > 0 ? (
               ingredients.filter(i => i.stock < 5).map(i => (
                 <div key={i.id} className="flex items-center gap-2 text-red-600 text-xs mb-1 bg-red-50 p-2 rounded"><AlertCircle size={12}/> <b>{i.name}</b> kritis ({i.stock})</div>
               ))
             ) : (
               <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 p-3 rounded"><Shield size={14}/> Stok Aman</div>
             )}
           </div>
        </div>
      </div>

      {/* --- TABEL RINGKASAN ASET (Owner & Investor) --- */}
      {isCanViewFinance && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 font-bold border-b text-red-800 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Package size={18} />
                <span>Ringkasan Aset & Stok Bahan</span>
             </div>
             <span className="text-xs font-normal text-stone-500 bg-white px-2 py-1 rounded border">Total Aset: Rp {ingredients.reduce((a,b)=>a+((b.stock||0)*(b.costPerUnit||0)),0).toLocaleString()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                      <th className="p-4">Nama Bahan</th>
                      <th className="p-4 text-center">Stok Saat Ini</th>
                      <th className="p-4 text-right">Harga Modal (Avg)</th>
                      <th className="p-4 text-right">Total Nilai Aset</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ingredients.map(ing => {
                  const totalAsset = (parseFloat(ing.costPerUnit) || 0) * (parseFloat(ing.stock) || 0);
                  return (
                    <tr key={ing.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-bold text-stone-700">{ing.name}</td>
                      <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${ing.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-stone-100 text-stone-600'}`}>
                             {parseFloat(ing.stock).toLocaleString()} {ing.unit}
                          </span>
                      </td>
                      <td className="p-4 text-right text-stone-500 font-mono text-xs">
                          @ Rp {(parseFloat(ing.costPerUnit)||0).toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-black text-emerald-700 font-mono">
                          Rp {totalAsset.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
                {ingredients.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-stone-400 italic">Belum ada data bahan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(isOwner || isAdmin) && (
         <POSExpenseNotification expenses={expenses} />
      )}

    </div>
  );
};

export default DashboardView;