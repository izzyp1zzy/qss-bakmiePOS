import React, { useState } from 'react';
import { UserCheck, Clock, Briefcase, Trash2, LogOut, History, User, Plus } from 'lucide-react';

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
    // Props baru dari App.jsx (Firebase)
    onAddEmployee, 
    onDeleteEmployee,
    onToggleShift
  } = props;

  const [empForm, setEmpForm] = useState({ name: '', role: 'cashier' });

  // Safety check
  if (!currentUser) return null;
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const safeLog = Array.isArray(attendanceLog) ? attendanceLog : [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!empForm.name.trim()) return showNotification('Nama wajib diisi!', 'error');

    if (typeof onAddEmployee === 'function') {
        onAddEmployee(empForm);
    } else if (typeof setEmployees === 'function') {
        setEmployees(prev => [...prev, { ...empForm, id: Date.now(), isShiftActive: false, lastActive: '-' }]);
    }
    
    setEmpForm({ name: '', role: 'cashier' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus karyawan ini?')) {
       if (typeof onDeleteEmployee === 'function') {
          onDeleteEmployee(id);
       } else if (typeof setEmployees === 'function') {
          setEmployees(prev => prev.filter(x => x.id !== id));
       }
    }
  };

  const handleShiftToggle = (id) => {
     if (typeof onToggleShift === 'function') {
        onToggleShift(id);
     } else if (typeof toggleShift === 'function') {
        toggleShift(id);
     }
  };

  // TAMPILAN 1: UNTUK KARYAWAN (ABSENSI)
  if (currentUser?.role === 'cashier') {
    const userLogs = safeLog.filter(l => l && l.employeeId === currentUser.id);

    return (
      <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 animate-in zoom-in-95">
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border w-full max-w-md text-center">
           <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${currentUser.isShiftActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {currentUser.isShiftActive ? <UserCheck size={40} /> : <Clock size={40} />}
           </div>
           
           <h2 className="text-xl font-bold mb-1">
             {currentUser.isShiftActive ? 'Shift Sedang Aktif' : 'Anda Belum Check-In'}
           </h2>
           <p className="text-gray-500 text-sm mb-8">
             {currentUser.isShiftActive ? 'Selamat bekerja!' : 'Silakan check-in untuk memulai.'}
           </p>
           
           <button 
             onClick={() => handleShiftToggle(currentUser.id)} 
             className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 ${currentUser.isShiftActive ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}
           >
              {currentUser.isShiftActive ? <><LogOut size={20}/> Check-Out</> : <><UserCheck size={20}/> Check-In</>}
           </button>

           <div className="mt-8 pt-6 border-t text-left">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2"><History size={14}/> Riwayat Hari Ini</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
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

  // TAMPILAN 2: UNTUK OWNER (MANAJEMEN TIM)
  return (
    <div className="bg-white rounded-2xl border shadow-sm h-full flex flex-col overflow-hidden animate-in fade-in">
       <div className="p-4 border-b bg-gray-50 font-bold text-red-800 flex items-center gap-2">
          <Briefcase size={20}/> Manajemen & Performa Tim
       </div>
       
       {/* FORM TAMBAH (RESPONSIVE STACKING) */}
       <div className="p-4 border-b bg-gray-50">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <input 
                className="p-3 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none" 
                placeholder="Nama Karyawan Baru" 
                value={empForm.name} 
                onChange={e => setEmpForm({...empForm, name: e.target.value})} 
             />
             <select 
                className="p-3 border rounded-lg text-sm bg-white outline-none" 
                value={empForm.role} 
                onChange={e => setEmpForm({...empForm, role: e.target.value})}
             >
                <option value="cashier">Kasir / Staff</option>
                <option value="admin">Admin Gudang</option>
             </select>
             <button type="submit" className="bg-red-800 text-white rounded-lg font-bold text-sm hover:bg-red-900 transition-colors flex items-center justify-center gap-2 p-3">
                <Plus size={16}/> Tambah Tim
             </button>
          </form>
       </div>

       <div className="flex-1 overflow-y-auto">
          {/* TABEL RESPONSIVE */}
          <div className="overflow-x-auto">
             <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-100 text-gray-500 uppercase text-[10px]">
                   <tr>
                      <th className="p-4">Pegawai</th>
                      <th className="p-4">Jabatan</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Total Sales</th>
                      <th className="p-4 text-center">Aksi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {safeEmployees.filter(e => e && e.role !== 'owner').map(emp => {
                      const empTrans = safeTransactions.filter(t => t && t.cashierName === emp.name);
                      const sales = empTrans.reduce((acc, t) => acc + (t.total || 0), 0);
                      
                      return (
                         <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="p-4 font-bold flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><User size={14}/></div>
                                {emp.name}
                            </td>
                            <td className="p-4">
                               <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold ${emp.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{emp.role}</span>
                            </td>
                            <td className="p-4 text-center">
                               {emp.isShiftActive 
                                 ? <span className="text-green-600 font-bold text-[10px] bg-green-100 px-2 py-1 rounded-full">● ONLINE</span> 
                                 : <span className="text-gray-400 text-[10px]">OFFLINE</span>
                               }
                            </td>
                            <td className="p-4 font-mono text-emerald-600 font-bold text-right">Rp {sales.toLocaleString()}</td>
                            <td className="p-4 text-center">
                               <button onClick={() => handleDelete(emp.id)} className="text-red-300 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                            </td>
                         </tr>
                      )
                   })}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

export default EmployeeView;