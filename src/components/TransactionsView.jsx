import React from 'react';
import { History, FileText, AlertTriangle, XCircle, CheckCircle, Clock } from 'lucide-react';

const TransactionsView = ({ transactions }) => {
  // Hitung total omzet sukses (tidak termasuk yang void)
  const totalRevenue = transactions
    .filter(t => t.status === 'success')
    .reduce((acc, t) => acc + (t.total || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Laporan */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="font-black text-xl text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                <History className="text-red-600"/> Laporan Transaksi
            </h2>
            <p className="text-sm text-gray-500 mt-1">Rekapitulasi penjualan dan status pesanan.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 px-6 py-3 rounded-xl border border-emerald-100">
            <p className="text-xs font-bold uppercase mb-1">Total Omzet Bersih</p>
            <p className="text-2xl font-black font-mono">Rp {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20"/>
                <p>Belum ada data transaksi.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {transactions.map(t => (
                  <div 
                    key={t.docId || t.id} 
                    className={`flex flex-col md:flex-row justify-between p-4 border rounded-xl transition-all hover:shadow-md ${
                        t.status === 'voided' ? 'bg-gray-50 border-gray-200 opacity-75' : 
                        t.status === 'void_pending' ? 'bg-yellow-50 border-yellow-200' : 
                        'bg-white border-gray-100 hover:border-red-100'
                    }`}
                  >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-black text-slate-800 text-lg">{t.id}</span>
                            
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
                        
                        <div className="text-xs text-gray-500 font-medium flex flex-wrap gap-x-4 gap-y-1">
                            <span>📅 {t.date}</span>
                            <span>👤 Kasir: <span className="font-bold">{t.cashier}</span></span>
                            <span>🍽️ {t.orderType || 'Dine In'}</span>
                            {t.customer !== 'Pelanggan Umum' && (
                                <span className="text-slate-600 bg-slate-100 px-1.5 rounded">Cust: {t.customer}</span>
                            )}
                        </div>

                        {/* DETAIL ALASAN VOID (JIKA ADA) */}
                        {t.voidReason && (
                            <div className="mt-2 text-xs bg-white/50 p-2 rounded border border-dashed border-gray-300 text-gray-600 italic">
                                <span className="font-bold not-italic">Catatan:</span> "{t.voidReason}" 
                                {t.voidRequestedBy && ` (Req by: ${t.voidRequestedBy})`}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col items-end justify-center pl-4 md:border-l border-gray-100">
                        <div className={`text-xl font-black ${t.status === 'voided' ? 'text-gray-400 line-through decoration-2' : 'text-red-600'}`}>
                            Rp {t.total.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Bayar</div>
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