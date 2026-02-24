import React from 'react';
import { 
  LayoutDashboard, ShoppingBasket, Package, History, LogOut, 
  Users, Clock, Lock, Database, Coffee
} from 'lucide-react';

const NavBtn = ({ id, icon: Icon, label, active, set }) => (
  <button 
    onClick={() => set(id)} 
    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden active:scale-95 ${
        active 
        ? 'text-white shadow-lg shadow-red-900/30' 
        : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/5'
    }`}
  >
    {/* Background Gradient Merah-Hitam untuk tombol aktif */}
    {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-black opacity-100 transition-opacity"></div>
    )}
    
    <div className="relative z-10 flex items-center gap-3">
        <Icon size={20} className={active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-200'} /> 
        <span className="font-bold text-sm tracking-wide">{label}</span>
    </div>
  </button>
);

const AppSidebar = ({ 
    activeTab, 
    onTabChange, 
    userRole, 
    isShiftActive, 
    userName, 
    onLogout, 
    onResetAccounting,
    showNotification 
}) => {
  return (
    // [THEME CHANGE] Sidebar Hitam Transparan
    <aside className="hidden lg:flex w-72 h-full bg-black/40 backdrop-blur-xl border-r border-white/5 text-white flex-col relative">
        
        {/* LOGO AREA */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-black rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 border border-white/10">
                <Coffee size={20} className="text-white"/>
             </div>
             <div>
                <h1 className="font-black text-xl tracking-tight leading-none text-white">POS SYSTEM</h1>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-0.5">V3.0 RED EDITION</p>
             </div>
          </div>

          {/* USER INFO CARD */}
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${isShiftActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]':'bg-red-600'}`}></div>
             <div>
                <p className="text-sm font-bold text-zinc-200">{userName}</p>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{userRole}</p>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 mt-2">Main Menu</p>
          
          {userRole === 'owner' && (
            <>
              <NavBtn id="dashboard" icon={LayoutDashboard} label="Dashboard" active={activeTab} set={onTabChange} />
              <NavBtn id="pos" icon={ShoppingBasket} label="Kasir (POS)" active={activeTab} set={onTabChange} />
              <NavBtn id="inventory" icon={Package} label="Inventaris" active={activeTab} set={onTabChange} />
              <NavBtn id="employees" icon={Users} label="Kinerja Tim" active={activeTab} set={onTabChange} />
              
              {/* Laporan Transaksi (Laporan Keuangan Dihapus) */}
              <NavBtn id="transactions" icon={History} label="Laporan Transaksi" active={activeTab} set={onTabChange} />
              
              <div className="my-6 border-t border-white/5 mx-2"></div>
              <p className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">System</p>
              
              <button onClick={onResetAccounting} className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all text-left group active:scale-95">
                  <Database size={20} /> <span className="font-bold text-sm">Reset Database</span>
              </button>
            </>
          )}
          
          {userRole === 'investor' && (
            <>
              <NavBtn id="dashboard" icon={LayoutDashboard} label="Dashboard" active={activeTab} set={onTabChange} />
              <NavBtn id="inventory" icon={Package} label="Inventaris" active={activeTab} set={onTabChange} />
              <NavBtn id="employees" icon={Users} label="Kinerja Tim" active={activeTab} set={onTabChange} />
              
              {/* Laporan Transaksi */}
              <NavBtn id="transactions" icon={History} label="Laporan Transaksi" active={activeTab} set={onTabChange} />
            </>
          )}

          {userRole === 'admin' && (
            <>
              <NavBtn id="admin_dashboard" icon={LayoutDashboard} label="Monitoring & Absen" active={activeTab} set={onTabChange} />
              <button 
                onClick={() => isShiftActive ? onTabChange('inventory') : showNotification('Harap Absen Masuk Dulu!', 'error')} 
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all active:scale-95 ${activeTab === 'inventory' ? 'bg-gradient-to-r from-red-700 to-black text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3"><Package size={20} /> <span className="font-bold text-sm">Stockkeeper</span></div>
                {!isShiftActive && <Lock size={14} className="text-zinc-600"/>}
              </button>
            </>
          )}
          
          {userRole === 'cashier' && (
            <>
              <NavBtn id="attendance" icon={Clock} label="Absensi" active={activeTab} set={onTabChange} />
              <button 
                onClick={() => isShiftActive ? onTabChange('pos') : showNotification('Harap Absen Masuk Dulu!', 'error')} 
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all active:scale-95 ${activeTab === 'pos' ? 'bg-gradient-to-r from-red-700 to-black text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3"><ShoppingBasket size={20} /> <span className="font-bold text-sm">Kasir / POS</span></div>
                {!isShiftActive && <Lock size={14} className="text-zinc-600"/>}
              </button>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-white/5">
            <button onClick={onLogout} className="w-full flex items-center gap-3 p-3.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group active:scale-95">
                <LogOut size={20} className="group-hover:-translate-x-1 transition-transform"/> 
                <span className="font-bold text-sm">Keluar Sistem</span>
            </button>
        </div>
      </aside>
  );
}

export default AppSidebar;