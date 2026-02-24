import React, { useState } from 'react';
import { UserCheck, Clock, Briefcase, Trash2, LogOut, History, User, Plus, Calendar, DollarSign, X, ChevronRight, Eye } from 'lucide-react';

// --- SUB-COMPONENT: MODAL RIWAYAT TRANSAKSI KARYAWAN ---
const EmployeeHistoryModal = ({ employee, transactions, onClose }) => {
    // Filter transaksi milik karyawan ini
    const empTransactions = transactions
        .filter(t => t.cashier === employee.name)
        .sort((a, b) => {
            // Sort dari terbaru (handle timestamp Firestore atau Date string)
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return dateB - dateA;
        });

    const totalSuccess = empTransactions.filter(t => t.status === 'success').reduce((a,b)=>a+(b.total||0), 0);

    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                            <User className="text-blue-600" size={20}/> Riwayat: {employee.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-1">PIN LOGIN: <span className="bg-slate-200 px-1 rounded text-slate-700 font-bold">{employee.loginId}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-400 hover:text-red-500"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto bg-slate-50/50">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-slate-500 uppercase text-[10px] font-bold sticky top-0 shadow-sm z-10">
                            <tr>
                                <th className="p-3 pl-4">ID Transaksi</th>
                                <th className="p-3">Waktu</th>
                                <th className="p-3">Tipe</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {empTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center text-slate-400 italic flex flex-col items-center">
                                        <History size={32} className="mb-2 opacity-20"/>
                                        Belum ada riwayat transaksi.
                                    </td>
                                </tr>
                            ) : (
                                empTransactions.map(t => (
                                    <tr key={t.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="p-3 pl-4 font-mono font-bold text-slate-700 text-xs">{t.id}</td>
                                        <td className="p-3 text-xs text-slate-500">
                                            {t.timestamp?.toDate ? t.timestamp.toDate().toLocaleString('id-ID') : new Date(t.timestamp).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-3 text-xs font-medium text-slate-600">{t.orderType || 'Dine In'}</td>
                                        <td className="p-3 text-right font-mono font-bold text-slate-800">Rp {t.total?.toLocaleString()}</td>
                                        <td className="p-3 text-center">
                                            {t.status === 'success' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-1 rounded-full font-bold border border-emerald-200">Sukses</span>}
                                            {t.status === 'voided' && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full font-bold border border-red-200">Void</span>}
                                            {t.status === 'void_pending' && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded-full font-bold border border-yellow-200">Pending</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t bg-white flex justify-between items-center text-xs font-bold text-slate-600 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg">Total Transaksi: {empTransactions.length}</span>
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        Total Omzet Bersih: <span className="font-mono text-base">Rp {totalSuccess.toLocaleString()}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

const EmployeeView = (props) => {
  const {
    employees = [],
    transactions = [],
    currentUser,
    showNotification = () => {},
    attendanceLog = [],
    setAttendanceLog,
    setEmployees,
    setCurrentUser,
    toggleShift,
    onAddEmployee, 
    onDeleteEmployee,
    onToggleShift
  } = props;

  // State Form
  const [empForm, setEmpForm] = useState({ name: '', role: 'cashier' });
  // State Filter Tanggal (Default: Hari Ini)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // State Modal Detail Karyawan (New)
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (!currentUser) return null;
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeLog = Array.isArray(attendanceLog) ? attendanceLog : [];

  // [FITUR BARU] Pengecekan apakah user adalah investor
  const isInvestor = currentUser.role === 'investor';

  // --- FUNGSI GENERATE PIN OTOMATIS (4 DIGIT) ---
  const generateUniquePIN = () => {
    let pin = '';
    let isUnique = false;
    while (!isUnique) {
        // Generate angka 1000 - 9999
        pin = Math.floor(1000 + Math.random() * 9000).toString();
        const exists = safeEmployees.some(emp => emp.loginId === pin);
        if (!exists) isUnique = true;
    }
    return pin;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (isInvestor) return; // Keamanan tambahan untuk mencegah investor bypass UI
    
    if (!empForm.name.trim()) return showNotification('Nama wajib diisi!', 'error');

    const autoLoginId = generateUniquePIN();
    const newEmployeeData = { ...empForm, loginId: autoLoginId };

    if (typeof onAddEmployee === 'function') {
        onAddEmployee(newEmployeeData);
    } else if (typeof setEmployees === 'function') {
        setEmployees(prev => [...prev, { ...newEmployeeData, id: Date.now(), isShiftActive: false, lastActive: '-' }]);
    }
    
    alert(`✅ Pegawai Berhasil Ditambah!\n\nNama: ${empForm.name}\nRole: ${empForm.role.toUpperCase()}\nPIN LOGIN: ${autoLoginId}\n\nHarap catat/berikan PIN ini kepada karyawan untuk login.`);
    setEmpForm({ name: '', role: 'cashier' });
  };

  const handleDelete = (id) => {
    if (isInvestor) return; // Keamanan tambahan

    if (window.confirm('Hapus akun ini?')) {
       if (typeof onDeleteEmployee === 'function') onDeleteEmployee(id);
       else if (typeof setEmployees === 'function') setEmployees(prev => prev.filter(x => x.id !== id));
    }
  };

  const handleShiftToggle = (id) => {
     if (typeof onToggleShift === 'function') onToggleShift(id);
     else if (typeof toggleShift === 'function') toggleShift(id);
  };

  // --- HITUNG SALES BERDASARKAN TANGGAL ---
  const getDailyStats = (empName) => {
      const startOfDay = new Date(selectedDate); startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(selectedDate); endOfDay.setHours(23,59,59,999);

      const dailyTx = safeTransactions.filter(t => {
          if (!t || t.status !== 'success') return false;
          // Cek Nama Kasir
          const isCashier = t.cashier === empName;
          
          // Cek Tanggal
          let txDate;
          if (t.timestamp?.toDate) txDate = t.timestamp.toDate(); 
          else if (t.timestamp) txDate = new Date(t.timestamp); 
          else return false;

          return isCashier && txDate >= startOfDay && txDate <= endOfDay;
      });

      const totalOmzet = dailyTx.reduce((acc, t) => acc + (t.total || 0), 0);
      const totalCount = dailyTx.length;

      return { totalOmzet, totalCount };
  };

  // TAMPILAN 1: UNTUK KARYAWAN (ABSENSI)
  if (currentUser?.role === 'cashier') {
    const userLogs = safeLog.filter(l => l && l.employeeId === currentUser.id);
    const myStats = getDailyStats(currentUser.name);

    return (
      <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 animate-in zoom-in-95">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border w-full max-w-md mx-auto text-center">
           <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${currentUser.isShiftActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {currentUser.isShiftActive ? <UserCheck size={40} /> : <Clock size={40} />}
           </div>
           
           <h2 className="text-xl font-bold mb-1">
             {currentUser.isShiftActive ? 'Shift Sedang Aktif' : 'Anda Belum Check-In'}
           </h2>
           <p className="text-gray-500 text-sm mb-6">
             {currentUser.isShiftActive ? 'Selamat bekerja!' : 'Silakan check-in untuk memulai.'}
           </p>

           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex justify-around">
              <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Trx Hari Ini</p>
                  <p className="text-lg font-black text-slate-800">{myStats.totalCount}</p>
              </div>
              <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Omzet Anda</p>
                  <p className="text-lg font-black text-emerald-600">Rp {myStats.totalOmzet.toLocaleString()}</p>
              </div>
           </div>
           
           <button 
             onClick={() => handleShiftToggle(currentUser.id)} 
             className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 ${currentUser.isShiftActive ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}
           >
              {currentUser.isShiftActive ? <><LogOut size={20}/> Check-Out (Tutup Shift)</> : <><UserCheck size={20}/> Check-In (Buka Shift)</>}
           </button>

           <div className="mt-8 pt-6 border-t text-left">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><History size={14}/> Riwayat Absen</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                 {userLogs.length === 0 ? <p className="text-center text-gray-400 text-xs italic">Belum ada aktivitas.</p> : userLogs.map((log, idx) => (
                    <div key={idx} className="flex justify-between text-xs p-2 bg-gray-50 rounded border">
                       <span className={log.type==='Masuk'?'text-green-600 font-bold':'text-red-500 font-bold'}>{log.type}</span>
                       <span className="text-gray-500 font-mono">{log.time}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // TAMPILAN 2: UNTUK OWNER & INVESTOR (MANAJEMEN / PEMANTAUAN TIM)
  return (
    <div className="bg-white rounded-2xl border shadow-sm h-full flex flex-col overflow-hidden animate-in fade-in relative max-w-6xl mx-auto w-full">
       
       {selectedEmployee && (
           <EmployeeHistoryModal 
                employee={selectedEmployee} 
                transactions={safeTransactions} 
                onClose={() => setSelectedEmployee(null)} 
           />
       )}

       {/* HEADER */}
       <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-red-800 flex items-center gap-2">
             <Briefcase size={20}/> Kinerja Tim 
             {/* [BARU] Badge "View Only" khusus Investor */}
             {isInvestor && (
                 <span className="ml-2 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest font-bold">
                     <Eye size={12}/> View Only
                 </span>
             )}
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border shadow-sm w-full md:w-auto">
             <Calendar size={16} className="text-gray-400 ml-2"/>
             <input 
                type="date" 
                className="text-xs font-bold text-gray-700 outline-none bg-transparent w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
             />
          </div>
       </div>
       
       {/* FORM TAMBAH (Hanya Muncul Jika BUKAN Investor) */}
       {!isInvestor && (
           <div className="p-4 border-b bg-gray-50">
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                 <input className="p-3 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none w-full" placeholder="Nama Lengkap" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} />
                 
                 <select className="p-3 border rounded-lg text-sm bg-white outline-none w-full" value={empForm.role} onChange={e => setEmpForm({...empForm, role: e.target.value})}>
                    <option value="cashier">Kasir / Staff</option>
                    <option value="admin">Admin Gudang</option>
                 </select>

                 <button type="submit" className="bg-red-800 text-white rounded-lg font-bold text-sm hover:bg-red-900 transition-colors flex items-center justify-center gap-2 p-3 active:scale-95 transform"><Plus size={16}/> Tambah (Auto PIN)</button>
              </form>
           </div>
       )}

       {/* KONTEN UTAMA: BERALIH ANTARA KARTU (MOBILE/TABLET) DAN TABEL (DESKTOP) */}
       <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
          
          {/* VIEW MOBILE & TABLET: CARD GRID (2 KOLOM DI TABLET) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
             {safeEmployees.filter(e => e && e.role !== 'owner' && e.role !== 'investor').map(emp => {
                 const stats = getDailyStats(emp.name);
                 let roleBadgeClass = 'bg-blue-100 text-blue-700'; 
                 if (emp.role === 'admin') roleBadgeClass = 'bg-purple-100 text-purple-700';

                 return (
                    <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className="bg-white p-4 rounded-xl border shadow-sm active:scale-95 transition-transform cursor-pointer">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                    {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{emp.name}</h4>
                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${roleBadgeClass}`}>{emp.role}</span>
                                </div>
                            </div>
                            {emp.isShiftActive 
                                ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-[10px] font-bold border border-green-100">ONLINE</span> 
                                : <span className="text-slate-400 bg-slate-100 px-2 py-1 rounded text-[10px] font-bold">OFFLINE</span>
                            }
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                <p className="text-slate-400 mb-1">Login PIN</p>
                                <p className="font-mono font-bold text-slate-700 tracking-wider">{emp.loginId}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                <p className="text-slate-400 mb-1">Omzet Hari Ini</p>
                                <p className="font-mono font-bold text-emerald-600">Rp {stats.totalOmzet.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedEmployee(emp); }} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                <History size={14}/> Riwayat
                            </button>
                            {/* [BARU] Sembunyikan tombol hapus jika role adalah investor */}
                            {!isInvestor && (
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                    <Trash2 size={14}/> Hapus
                                </button>
                            )}
                        </div>
                    </div>
                 )
             })}
          </div>

          {/* VIEW DESKTOP: TABLE */}
          <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-500 uppercase text-[10px]">
                   <tr>
                      <th className="p-4">Pegawai</th>
                      <th className="p-4">PIN Login</th>
                      <th className="p-4">Jabatan</th>
                      <th className="p-4 text-center">Status Shift</th>
                      <th className="p-4 text-center">Trx Hari Ini</th>
                      <th className="p-4 text-right">Omzet Hari Ini</th>
                      {/* [BARU] Sembunyikan kolom Aksi jika role adalah investor */}
                      {!isInvestor && <th className="p-4 text-center">Aksi</th>}
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {safeEmployees.filter(e => e && e.role !== 'owner' && e.role !== 'investor').map(emp => {
                      const stats = getDailyStats(emp.name);
                      let roleBadgeClass = 'bg-blue-100 text-blue-700'; 
                      if (emp.role === 'admin') roleBadgeClass = 'bg-purple-100 text-purple-700';

                      return (
                         <tr 
                            key={emp.id} 
                            onClick={() => setSelectedEmployee(emp)} 
                            className="hover:bg-blue-50 cursor-pointer transition-colors group"
                         >
                            <td className="p-4 font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600"><User size={14}/></div>
                                <span className="group-hover:text-blue-700">{emp.name}</span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-600 tracking-wider">
                               {emp.loginId || '-'}
                            </td>
                            <td className="p-4">
                               <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold ${roleBadgeClass}`}>
                                   {emp.role}
                               </span>
                            </td>
                            <td className="p-4 text-center">
                               {emp.isShiftActive 
                                 ? <span className="text-green-600 font-bold text-[10px] bg-green-100 px-2 py-1 rounded-full">● ONLINE</span> 
                                 : <span className="text-gray-400 text-[10px]">OFFLINE</span>
                               }
                            </td>
                            <td className="p-4 text-center font-bold text-gray-600">
                               {stats.totalCount}x
                            </td>
                            <td className="p-4 font-mono text-emerald-600 font-bold text-right flex justify-end items-center gap-1">
                               {stats.totalOmzet > 0 && <DollarSign size={12}/>}
                               Rp {stats.totalOmzet.toLocaleString()}
                            </td>
                            {/* [BARU] Sembunyikan cell hapus jika role adalah investor */}
                            {!isInvestor && (
                                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                   <button onClick={() => handleDelete(emp.id)} className="text-red-300 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                        <Trash2 size={16}/>
                                   </button>
                                </td>
                            )}
                         </tr>
                       )
                   })}
                   <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      <td colSpan={4} className="p-4 text-right uppercase text-xs text-slate-500">Total Tim Hari Ini:</td>
                      <td className="p-4 text-center text-slate-800">
                        {safeEmployees.reduce((acc, e) => e.role !== 'owner' && e.role !== 'investor' ? acc + getDailyStats(e.name).totalCount : acc, 0)}x
                      </td>
                      <td className="p-4 text-right text-emerald-700 text-base">
                        Rp {safeEmployees.reduce((acc, e) => e.role !== 'owner' && e.role !== 'investor' ? acc + getDailyStats(e.name).totalOmzet : acc, 0).toLocaleString()}
                      </td>
                      {/* [BARU] Penyesuaian kolom footer jika investor */}
                      {!isInvestor && <td></td>}
                   </tr>
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default EmployeeView;