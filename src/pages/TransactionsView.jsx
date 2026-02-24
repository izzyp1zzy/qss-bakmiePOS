import React, { useState, useMemo } from 'react';
import { History, FileText, AlertTriangle, XCircle, CheckCircle, Clock, Search, Filter, CalendarDays, TrendingUp, Users, Award } from 'lucide-react';

const TransactionsView = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('today'); // all, today, month
  const [filterStatus, setFilterStatus] = useState('all'); // all, success, voided, void_pending

  // --- LOGIKA FILTERING ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
        // 1. Filter Pencarian (ID, Kasir, atau Customer)
        const matchSearch = 
            t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.cashier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.customer?.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Filter Status
        const matchStatus = filterStatus === 'all' || t.status === filterStatus;

        // 3. Filter Tanggal
        let matchDate = true;
        if (filterDate !== 'all') {
            const txDateObj = t.timestamp?.toDate ? t.timestamp.toDate() : new Date(t.timestamp);
            const today = new Date();
            if (filterDate === 'today') {
                matchDate = txDateObj.toDateString() === today.toDateString();
            } else if (filterDate === 'month') {
                matchDate = txDateObj.getMonth() === today.getMonth() && txDateObj.getFullYear() === today.getFullYear();
            }
        }

        return matchSearch && matchStatus && matchDate;
    });
  }, [transactions, searchTerm, filterDate, filterStatus]);

  // --- KALKULASI METRIK (Berdasarkan Data yang Difilter) ---
  const successfulTx = filteredTransactions.filter(t => t.status === 'success');
  const totalRevenue = successfulTx.reduce((acc, t) => acc + (t.total || 0), 0);
  const totalCount = successfulTx.length;
  const avgBasketSize = totalCount > 0 ? totalRevenue / totalCount : 0;
  const voidCount = filteredTransactions.filter(t => t.status === 'voided' || t.status === 'void_pending').length;

  // --- KALKULASI PRODUK TERLARIS ---
  const topProducts = useMemo(() => {
      const productMap = {};

      // Hanya hitung dari transaksi yang sukses
      successfulTx.forEach(t => {
          if (t.items && Array.isArray(t.items)) {
              t.items.forEach(item => {
                  if (!productMap[item.name]) {
                      productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
                  }
                  productMap[item.name].qty += (item.qty || 1);
                  productMap[item.name].revenue += ((item.price || 0) * (item.qty || 1));
              });
          }
      });

      // Ubah ke array, urutkan berdasarkan kuantitas terbanyak, ambil 4 teratas
      return Object.values(productMap)
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 4);
  }, [successfulTx]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. HEADER & METRIK UTAMA */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-2xl shadow-lg text-white col-span-2 md:col-span-1">
              <p className="text-xs font-bold uppercase opacity-80 mb-1 flex items-center gap-2"><TrendingUp size={14}/> Total Omzet (Sukses)</p>
              <p className="text-2xl font-black font-mono mt-2">Rp {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase text-stone-400 mb-1 flex items-center gap-2"><FileText size={14}/> Total Struk</p>
              <p className="text-xl font-black text-stone-800">{totalCount} <span className="text-xs text-stone-400 font-normal">Transaksi</span></p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase text-stone-400 mb-1 flex items-center gap-2"><Users size={14}/> Rata-rata Belanja</p>
              <p className="text-xl font-black text-stone-800 font-mono">Rp {Math.round(avgBasketSize).toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase text-red-400 mb-1 flex items-center gap-2"><AlertTriangle size={14}/> Pembatalan / Void</p>
              <p className="text-xl font-black text-red-600">{voidCount} <span className="text-xs text-red-400 font-normal">Kasus</span></p>
          </div>
      </div>

      {/* [BARU] PRODUK TERLARIS (Top 4) */}
      {topProducts.length > 0 && (
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none"><Award size={100} /></div>
              <h3 className="text-xs font-bold uppercase text-stone-500 mb-3 flex items-center gap-2 relative z-10">
                  <Award size={16} className="text-amber-500" /> Menu Favorit (Top 4)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
                  {topProducts.map((p, idx) => (
                      <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex items-center justify-between hover:border-amber-200 transition-colors group">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-[10px] shadow-sm ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-white border text-stone-500'}`}>
                                  #{idx + 1}
                              </div>
                              <div className="overflow-hidden">
                                  <p className="text-xs font-bold text-stone-800 truncate group-hover:text-amber-700 transition-colors" title={p.name}>{p.name}</p>
                                  <p className="text-[10px] text-stone-500 font-medium">{p.qty} Porsi Terjual</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 2. KONTROL FILTER & PENCARIAN */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18}/>
              <input 
                  type="text" 
                  placeholder="Cari ID, Kasir, atau Pelanggan..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-2 shrink-0">
                  <CalendarDays size={16} className="text-stone-400 mx-2" />
                  <select 
                      className="bg-transparent py-2.5 text-sm font-bold text-stone-700 outline-none cursor-pointer"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                  >
                      <option value="today">Hari Ini</option>
                      <option value="month">Bulan Ini</option>
                      <option value="all">Semua Waktu</option>
                  </select>
              </div>
              <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl px-2 shrink-0">
                  <Filter size={16} className="text-stone-400 mx-2" />
                  <select 
                      className="bg-transparent py-2.5 text-sm font-bold text-stone-700 outline-none cursor-pointer"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                  >
                      <option value="all">Semua Status</option>
                      <option value="success">Sukses</option>
                      <option value="void_pending">Menunggu Void</option>
                      <option value="voided">Dibatalkan (Void)</option>
                  </select>
              </div>
          </div>
      </div>

      {/* 3. DAFTAR TRANSAKSI (HASIL FILTER) */}
      <div className="bg-white p-2 md:p-6 rounded-2xl shadow-sm border border-stone-100 overflow-hidden min-h-[400px]">
        {filteredTransactions.length === 0 ? (
            <div className="text-center py-20 text-stone-400 flex flex-col items-center">
                <FileText size={48} className="mb-4 opacity-20"/>
                <p className="font-bold text-stone-500">Tidak ada transaksi yang cocok.</p>
                <p className="text-xs mt-1">Coba ubah filter tanggal atau kata kunci pencarian.</p>
            </div>
        ) : (
            <div className="space-y-3">
                {filteredTransactions.map(t => (
                  <div 
                    key={t.docId || t.id} 
                    className={`flex flex-col md:flex-row justify-between p-4 border rounded-xl transition-all hover:shadow-md ${
                        t.status === 'voided' ? 'bg-stone-50 border-stone-200 opacity-75' : 
                        t.status === 'void_pending' ? 'bg-yellow-50 border-yellow-200' : 
                        'bg-white border-stone-100 hover:border-red-100'
                    }`}
                  >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                            <span className="font-black text-stone-800 text-lg">{t.id}</span>
                            
                            {/* BADGE STATUS */}
                            {t.status === 'voided' && (
                                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                                    <XCircle size={10}/> DIBATALKAN
                                </span>
                            )}
                            {t.status === 'void_pending' && (
                                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-yellow-200 animate-pulse">
                                    <Clock size={10}/> MENUNGGU APPROVAL
                                </span>
                            )}
                            {t.status === 'success' && (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                    <CheckCircle size={10}/> SUKSES
                                </span>
                            )}
                        </div>
                        
                        <div className="text-xs text-stone-500 font-medium flex flex-wrap gap-x-4 gap-y-2">
                            <span className="flex items-center gap-1"><Clock size={12}/> {t.date}</span>
                            <span className="flex items-center gap-1"><Users size={12}/> Kasir: <span className="font-bold text-stone-700">{t.cashier}</span></span>
                            <span className="flex items-center gap-1">🍽️ {t.orderType || 'Dine In'}</span>
                            {t.customer !== 'Pelanggan Umum' && (
                                <span className="text-stone-600 bg-stone-100 px-1.5 rounded border border-stone-200">Cust: {t.customer}</span>
                            )}
                        </div>

                        {/* DETAIL ALASAN VOID (JIKA ADA) */}
                        {t.voidReason && (
                            <div className="mt-3 text-xs bg-white/50 p-2.5 rounded-lg border border-dashed border-stone-300 text-stone-600 italic">
                                <span className="font-bold not-italic">Catatan Pembatalan:</span> "{t.voidReason}" 
                                {t.voidRequestedBy && ` (Diajukan oleh: ${t.voidRequestedBy})`}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col items-end justify-center md:pl-6 md:border-l border-stone-100">
                        <div className={`text-xl md:text-2xl font-black font-mono ${t.status === 'voided' ? 'text-stone-400 line-through decoration-2' : 'text-red-600'}`}>
                            Rp {t.total.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Total Bayar ({t.paymentMethod || 'Tunai'})</div>
                    </div>
                  </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsView;