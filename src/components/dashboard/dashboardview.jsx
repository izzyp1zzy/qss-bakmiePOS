import React, { useState } from 'react';
import { Users, AlertCircle, Shield, TrendingUp, UserCheck, Clock, LogOut, Target, Edit2, Check, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
// AdminDashboard.jsx
import ExpenseApproval from '../features/ExpenseApproval';

const AdminDashboard = ({ user }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard Owner</h1>
      
      {/* 1. Area Grafik / Laporan Laba Rugi */}
      <div className="my-4">
         {/* ... komponen grafik ... */}
      </div>

      {/* 2. Area Approval - Hanya muncul di sini */}
      <ExpenseApproval user={user} />
      
    </div>
  );
};
const RevenueTargetCard = ({ revenue }) => {
  const [target, setTarget] = useState(10000000); 
  const [isEditing, setIsEditing] = useState(false);
  const [tempInput, setTempInput] = useState(target);

  const percentage = target > 0 ? Math.min(100, Math.round((revenue / target) * 100)) : 0;

  const saveTarget = () => {
    setTarget(tempInput);
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-red-900 to-red-950 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white opacity-5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14}/> Pendapatan Bulan Ini
            </p>
            <h3 className="text-2xl md:text-3xl font-bold mt-1">Rp {revenue.toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-red-800 flex items-center justify-center text-xs font-bold bg-red-900 shadow-inner">
             {percentage}%
          </div>
        </div>

        <div className="w-full bg-black/30 h-2 rounded-full mb-4 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${percentage >= 100 ? 'bg-emerald-400' : 'bg-red-500'}`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="bg-white/10 p-3 rounded-xl flex items-center justify-between backdrop-blur-sm transition-colors hover:bg-white/20">
           <div className="flex flex-col">
              <span className="text-[10px] text-red-200 uppercase font-bold flex items-center gap-1"><Target size={10}/> Target Bulanan</span>
              
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

           <button 
              onClick={isEditing ? saveTarget : () => { setTempInput(target); setIsEditing(true); }}
              className={`p-2 rounded-lg transition-all ${isEditing ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white text-red-900 hover:bg-red-100'}`}
           >
              {isEditing ? <Check size={16}/> : <Edit2 size={16}/>}
           </button>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ currentUser, ingredients, employees, transactions, onUpdateIngredient, onToggleShift, onApproveVoid, onRejectVoid }) => {
  // Hanya hitung transaksi sukses
  const totalRevenue = transactions.filter(t => t.status === 'success').reduce((acc, t) => acc + (t.total || 0), 0);
  const activeStaff = employees.filter(e => e.isShiftActive);
  
  // Filter Request Void
  const voidRequests = transactions.filter(t => t.status === 'void_pending');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20 md:pb-0">
      
      {/* --- VOID REQUEST ALERT (KHUSUS OWNER) --- */}
      {currentUser?.role === 'owner' && voidRequests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm animate-pulse">
              <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-yellow-600"/> 
                  Permintaan Pembatalan ({voidRequests.length})
              </h3>
              <div className="space-y-3">
                  {voidRequests.map(req => (
                      <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                              <div className="font-bold text-stone-800">{req.id} • Rp {req.total.toLocaleString()}</div>
                              <p className="text-xs text-stone-500">Kasir: {req.voidRequestedBy} • Alasan: <span className="font-bold text-red-500 italic">"{req.voidReason}"</span></p>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                              <button onClick={()=>onRejectVoid(req.id)} className="flex-1 md:flex-none px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                  <XCircle size={14}/> Tolak
                              </button>
                              <button onClick={()=>onApproveVoid(req)} className="flex-1 md:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md">
                                  <CheckCircle size={14}/> Setujui & Balikin Stok
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- WIDGET ABSENSI KHUSUS ADMIN --- */}
      {currentUser?.role === 'admin' && (
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
            <button 
                onClick={() => onToggleShift(currentUser.id)}
                className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 ${currentUser.isShiftActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
                {currentUser.isShiftActive ? <><LogOut size={18}/> Check-Out</> : <><UserCheck size={18}/> Check-In</>}
            </button>
        </div>
      )}

      {/* --- STATISTIK UMUM --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentUser?.role === 'owner' && (
          <RevenueTargetCard revenue={totalRevenue} />
        )}
        
        {/* WIDGET TIM */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm col-span-1">
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

        {/* Status Gudang */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm col-span-1">
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

      {currentUser?.role === 'owner' && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 font-bold border-b text-red-800">Manajemen HPP & Laba Bahan</div>
          <div className="overflow-x-auto">
            {/* TABLE FIXED WIDTH UNTUK MOBILE */}
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead className="bg-gray-100 text-gray-600"><tr><th className="p-3">Bahan</th><th className="p-3">Beli</th><th className="p-3">Laba</th><th className="p-3">Total Nilai</th></tr></thead>
              <tbody>
                {ingredients.map(ing => (
                  <tr key={ing.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3 font-medium">{ing.name}</td>
                    <td className="p-3"><div className="flex items-center gap-1 text-xs text-gray-500">Rp<input type="number" className="w-20 p-1 border rounded text-black text-sm" value={ing.costPerUnit} onChange={e=>onUpdateIngredient(ing.id, { costPerUnit: parseInt(e.target.value)||0 })} /></div></td>
                    <td className="p-3"><div className="flex items-center gap-1 text-emerald-600 text-xs">+<input type="number" className="w-20 p-1 border border-emerald-200 bg-emerald-50 rounded text-emerald-700 font-bold text-sm" value={ing.profit||0} onChange={e=>onUpdateIngredient(ing.id, { profit: parseInt(e.target.value)||0 })} /></div></td>
                    <td className="p-3 font-bold text-gray-700 font-mono">Rp {((ing.costPerUnit || 0) + (ing.profit || 0)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;