import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBasket, Package, History, LogOut, 
  Users, Clock, Lock, Database,FileText // PERBAIKAN: Database ditambahkan disini
} from 'lucide-react';

// --- 1. IMPORT FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, setDoc, 
          onSnapshot, query, orderBy 
} from 'firebase/firestore';

// --- 2. IMPORT KOMPONEN ---
// PERBAIKAN: Menggunakan path './' karena file berada di root pada preview ini.
// SILAKAN UBAH KEMBALI KE './components/...' SAAT DI LAPTOP ANDA.
import DashboardView from './components/dashboard/dashboardview'; 
import InventoryView from './components/InventoryView';
import EmployeeView from './components/EmployeeView';
import POSView from './components/POSView';
import TransactionsView from './components/TransactionsView';
import AccountingView from './components/AccountingView.jsx';


// --- 3. KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCiSq-gr6rbD0eUCbWyMBSBSPnrtBwQG9o",
  authDomain: "first-c8892.firebaseapp.com",
  projectId: "first-c8892",
  storageBucket: "first-c8892.firebasestorage.app",
  messagingSenderId: "581412448552",
  appId: "1:581412448552:web:e72f55a7deef47ee70081d"
};

// --- INISIALISASI FIREBASE (HANYA SEKALI) ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'toko-saya-v1'; 
const getColl = (name) => collection(db, 'artifacts', appId, 'public', 'data', name);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginInput, setLoginInput] = useState('');
  const [notification, setNotification] = useState(null);
  
  // GLOBAL STATE
  const [employees, setEmployees] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [attendanceLog, setAttendanceLog] = useState([]);

  // --- SYNC DATABASE ---
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log("Mencoba login anonim...");
            signInAnonymously(auth).catch(e => console.error("Login Gagal:", e));
        } else {
            console.log("Terhubung ke Firebase sebagai:", user.uid);
        }
    });

    const unsubEmp = onSnapshot(getColl('employees'), (s) => {
        const data = s.docs.map(x=>({id:x.id, ...x.data()}));
        setEmployees(data);
        if (currentUser) {
            const updatedUser = data.find(u => u.id === currentUser.id);
            if (updatedUser) setCurrentUser(updatedUser);
        }
    });

    const unsubIng = onSnapshot(getColl('ingredients'), (s) => setIngredients(s.docs.map(x => ({ id: x.id, ...x.data() }))));
    const unsubProd = onSnapshot(getColl('products'), (s) => setProducts(s.docs.map(x => ({ id: x.id, ...x.data() }))));
    const unsubTx = onSnapshot(query(getColl('transactions'), orderBy('timestamp', 'desc')), (s) => setTransactions(s.docs.map(x=>({docId:x.id, ...x.data()}))));
    const unsubAtt = onSnapshot(query(getColl('attendanceLog'), orderBy('timestamp', 'desc')), (s) => setAttendanceLog(s.docs.map(x=>({id:x.id, ...x.data()}))));

    return () => { unsubAuth(); unsubEmp(); unsubIng(); unsubProd(); unsubTx(); unsubAtt(); }
  }, [currentUser?.id]); 

  // --- FITUR BARU: SCRIPT SEEDING AKUN AKUNTANSI ---
  const seedAccountingData = async () => {
    if(!window.confirm("Yakin ingin mereset/membuat ulang Chart of Accounts? Data akun lama akan ditimpa.")) return;
    
    const accounts = [
      { code: '1000', name: 'Kas Kasir', category: 'Asset', normalBalance: 'Debit' },
      { code: '1010', name: 'Bank BCA/Transfer', category: 'Asset', normalBalance: 'Debit' },
      { code: '1020', name: 'Petty Cash', category: 'Asset', normalBalance: 'Debit' },
      { code: '1200', name: 'Persediaan Bahan Baku', category: 'Asset', normalBalance: 'Debit' },
      { code: '1300', name: 'Peralatan & Mesin', category: 'Asset', normalBalance: 'Debit' },
      { code: '2000', name: 'Hutang Usaha', category: 'Liability', normalBalance: 'Credit' },
      { code: '2100', name: 'Hutang Gaji', category: 'Liability', normalBalance: 'Credit' },
      { code: '3000', name: 'Modal Owner', category: 'Equity', normalBalance: 'Credit' },
      { code: '3100', name: 'Laba Ditahan', category: 'Equity', normalBalance: 'Credit' },
      { code: '3200', name: 'Prive Owner', category: 'Equity', normalBalance: 'Debit' }, 
      { code: '4000', name: 'Penjualan Makanan', category: 'Revenue', normalBalance: 'Credit' },
      { code: '4010', name: 'Penjualan Minuman', category: 'Revenue', normalBalance: 'Credit' },
      { code: '4100', name: 'Service Charge', category: 'Revenue', normalBalance: 'Credit' },
      { code: '4200', name: 'Diskon Penjualan', category: 'Revenue', normalBalance: 'Debit' }, 
      { code: '5000', name: 'HPP Makanan', category: 'COGS', normalBalance: 'Debit' },
      { code: '5010', name: 'HPP Minuman', category: 'COGS', normalBalance: 'Debit' },
      { code: '5900', name: 'Bahan Terbuang (Waste)', category: 'COGS', normalBalance: 'Debit' },
      { code: '6000', name: 'Beban Gaji & Upah', category: 'Expense', normalBalance: 'Debit' },
      { code: '6100', name: 'Beban Sewa Tempat', category: 'Expense', normalBalance: 'Debit' },
      { code: '6200', name: 'Beban Listrik, Air, Internet', category: 'Expense', normalBalance: 'Debit' },
      { code: '6300', name: 'Beban Perlengkapan', category: 'Expense', normalBalance: 'Debit' },
      { code: '6400', name: 'Beban Marketing', category: 'Expense', normalBalance: 'Debit' },
      { code: '6500', name: 'Beban Maintenance', category: 'Expense', normalBalance: 'Debit' },
      { code: '6900', name: 'Selisih Kas (Adjustment)', category: 'Expense', normalBalance: 'Debit' },
    ];

    try {
      showNotification('Sedang membuat database akun...', 'success');
      for (const acc of accounts) {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', acc.code), {
          ...acc,
          currentBalance: 0,
          updatedAt: new Date()
        });
      }
      showNotification("Berhasil Setup Chart of Accounts!");
    } catch (error) {
      console.error("Gagal seed akun:", error);
      showNotification("Gagal setup akun. Cek Console.", 'error');
    }
  };

  // --- HELPERS ---
  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const name = loginInput.trim().toLowerCase();
    const user = employees.find(u => u.name.toLowerCase() === name);
    if(user) {
        setCurrentUser(user);
        if (user.role === 'owner') setActiveTab('dashboard');
        else if (user.role === 'admin') setActiveTab('admin_dashboard');
        else setActiveTab('attendance'); 
        setLoginInput('');
        showNotification(`Selamat Datang, ${user.name}`);
    } else {
        showNotification('Nama tidak ditemukan', 'error');
    }
  };

  const handleToggleShift = async (userId) => {
     const emp = employees.find(e => e.id === userId);
     if(!emp) return;
     const now = new Date();
     const timeStr = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
     
     const isCheckIn = !emp.isShiftActive;
     const type = isCheckIn ? 'Masuk' : 'Keluar';
     
     await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', userId), {
        isShiftActive: isCheckIn,
        lastActive: isCheckIn ? timeStr : emp.lastActive
     });

     await addDoc(getColl('attendanceLog'), {
        employeeId: userId, 
        employeeName: emp.name, 
        type, 
        time: now.toLocaleString('id-ID'), 
        timestamp: now
     });

     setCurrentUser(prev => ({ ...prev, isShiftActive: isCheckIn }));
     showNotification(`Absen ${type} Sukses`);

     if (isCheckIn && emp.role === 'cashier') setTimeout(() => setActiveTab('pos'), 500); 
     if (!isCheckIn && emp.role === 'cashier') setActiveTab('attendance');
  };

  // --- HANDLERS DATA ---
  const handleAddEmployee = async (data) => { await addDoc(getColl('employees'), { ...data, isShiftActive: false, lastActive: '-' }); showNotification('Karyawan Ditambah'); };
  const handleDeleteEmployee = async (id) => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', id)); showNotification('Karyawan Dihapus'); };
  const handleAddIngredient = async (data) => { await addDoc(getColl('ingredients'), data); showNotification('Bahan Disimpan'); };
  const handleUpdateIngredient = async (id, data) => { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', id), data); };
  
  const handleDeleteIngredient = async (id) => { 
    try {
        setIngredients(prev => prev.filter(item => item.id !== id)); 
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', id)); 
        showNotification('Bahan Dihapus Permanen');
    } catch (err) {
        console.error("Gagal hapus:", err);
        showNotification('Gagal hapus data di server', 'error');
    }
  };

  const handleAddProduct = async (data) => { await addDoc(getColl('products'), data); showNotification('Menu Disimpan'); };
  const handleDeleteProduct = async (id) => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', id)); showNotification('Menu Dihapus'); };

  // --- PROSES BAYAR & JURNAL OTOMATIS (CORE ACCOUNTING LOGIC) ---
  const handleProcessPayment = async (txData, cartItems) => {
    try {
      // 1. Simpan Transaksi Penjualan
      const txRef = await addDoc(getColl('transactions'), { ...txData, status: 'success', timestamp: new Date() });
      
      let totalHPP = 0; 

      // 2. Update Stok & Hitung HPP
      for (const item of cartItems) {
        if (!item.recipe || !Array.isArray(item.recipe)) continue;
        
        for (const r of item.recipe) {
          const ing = ingredients.find(i => String(i.id) === String(r.ingredientId));
          
          if (ing) {
            const costPerUnit = parseFloat(ing.costPerUnit) || 0;
            const qtyUsed = (parseFloat(r.qty) || 0) * (parseFloat(item.qty) || 1);
            
            const itemHPP = costPerUnit * qtyUsed;
            totalHPP += itemHPP;

            const currentStock = parseFloat(ing.stock) || 0;
            const newStock = Math.max(0, currentStock - qtyUsed);
            
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', ing.id), { stock: newStock });
          }
        }
      }

      // --- 3. AUTO-JOURNALING ---
      
      // A. Jurnal Penjualan
      const salesJournal = {
        date: new Date().toISOString(),
        description: `Penjualan POS #${txRef.id.slice(-6)}`,
        referenceId: txRef.id,
        type: 'SALES',
        lines: [
          { accountId: '1000', accountName: 'Kas Kasir', debit: txData.total, credit: 0 },
          { accountId: '4000', accountName: 'Penjualan Makanan', debit: 0, credit: txData.total }
        ],
        timestamp: new Date()
      };
      await addDoc(getColl('journal_entries'), salesJournal);

      // Update Saldo Akun (Kas & Pendapatan)
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', '1000'), { 
        currentBalance: increment(txData.total) 
      });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', '4000'), { 
        currentBalance: increment(txData.total) 
      });

      // B. Jurnal HPP (Jika ada HPP)
      if (totalHPP > 0) {
        const cogsJournal = {
          date: new Date().toISOString(),
          description: `HPP Penjualan #${txRef.id.slice(-6)}`,
          referenceId: txRef.id,
          type: 'COGS',
          lines: [
            { accountId: '5000', accountName: 'HPP Makanan', debit: totalHPP, credit: 0 },
            { accountId: '1200', accountName: 'Persediaan Bahan Baku', debit: 0, credit: totalHPP }
          ],
          timestamp: new Date()
        };
        await addDoc(getColl('journal_entries'), cogsJournal);

        // Update Saldo Akun (HPP & Persediaan)
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', '5000'), { 
          currentBalance: increment(totalHPP) 
        });
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'accounts', '1200'), { 
          currentBalance: increment(-totalHPP) 
        });
      }

      showNotification('Transaksi Berhasil & Jurnal Tercatat');
    } catch (err) {
      console.error("Error Transaction:", err);
      showNotification('Gagal memproses transaksi', 'error');
    }
  };

  const handleRequestVoid = async (docId, reason) => {
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', docId), {
              status: 'void_pending',
              voidReason: reason,
              voidRequestedBy: currentUser.name,
              voidRequestTime: new Date().toLocaleString()
          });
          showNotification('Pengajuan pembatalan terkirim ke Owner');
      } catch (e) { showNotification('Gagal mengajukan batal', 'error'); }
  };

  const handleApproveVoid = async (tx) => {
      try {
          if (tx.items && Array.isArray(tx.items)) {
              for (const item of tx.items) {
                  if (item.recipe && Array.isArray(item.recipe)) {
                      for (const r of item.recipe) {
                          const ing = ingredients.find(i => String(i.id) === String(r.ingredientId));
                          if (ing) {
                              const currentStock = parseFloat(ing.stock) || 0;
                              const returnQty = (parseFloat(r.qty) || 0) * (parseFloat(item.qty) || 1);
                              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', ing.id), { 
                                  stock: currentStock + returnQty 
                              });
                          }
                      }
                  }
              }
          }
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', tx.docId), {
              status: 'voided',
              voidApprovedBy: currentUser.name,
              voidApprovedTime: new Date().toLocaleString()
          });
          showNotification('Void Disetujui. Stok otomatis dikembalikan.');
      } catch (e) { 
          console.error(e);
          showNotification('Gagal memproses void', 'error'); 
      }
  };

  const handleRejectVoid = async (docId) => {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', docId), {
          status: 'success', 
          voidReason: null,
          voidRequestedBy: null
      });
      showNotification('Pengajuan pembatalan ditolak.');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
         <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in">
            <h1 className="text-2xl font-black text-center mb-2 text-red-800 uppercase">Sistem POS</h1>
            <p className="text-center text-gray-400 text-sm mb-6">Login Karyawan</p>
            <form onSubmit={handleLogin} className="space-y-4">
               <input className="w-full p-4 border rounded-xl text-center font-bold text-lg focus:ring-2 focus:ring-red-500 outline-none" placeholder="Masukkan Nama Anda" value={loginInput} onChange={e=>setLoginInput(e.target.value)} autoFocus />
               <button className="w-full bg-red-700 text-white p-4 rounded-xl font-bold uppercase hover:bg-red-800 transition-all shadow-lg">Masuk Sistem</button>
            </form>
         </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h1 className="font-black text-xl uppercase tracking-tighter">POS System</h1>
          <div className="flex items-center gap-2 mt-2">
             <div className={`w-2 h-2 rounded-full ${currentUser.isShiftActive?'bg-emerald-500 animate-pulse':'bg-red-500'}`}></div>
             <div>
                <p className="text-sm font-bold">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">{currentUser.role}</p>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {currentUser.role === 'owner' && (
            <>
              <NavBtn id="dashboard" icon={LayoutDashboard} label="Dashboard" active={activeTab} set={setActiveTab} />
              <NavBtn id="pos" icon={ShoppingBasket} label="Kasir (POS)" active={activeTab} set={setActiveTab} />
              <NavBtn id="inventory" icon={Package} label="Inventaris" active={activeTab} set={setActiveTab} />
              <NavBtn id="employees" icon={Users} label="Kinerja Tim" active={activeTab} set={setActiveTab} />
              <NavBtn id="transactions" icon={History} label="Laporan" active={activeTab} set={setActiveTab} />
              {/* Menu Baru: Laporan Keuangan */}
              <NavBtn id="accounting" icon={FileText} label="Laporan Keuangan" active={activeTab} set={setActiveTab} />
              
              <div className="pt-8 mt-8 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase px-3 mb-2">Setup Sistem</p>
                  <button onClick={seedAccountingData} className="w-full flex items-center gap-3 p-3 rounded-xl text-amber-400 hover:bg-slate-800 transition-all text-left">
                      <Database size={20} /> <span className="font-bold text-sm">Reset Akuntansi</span>
                  </button>
              </div>
            </>
          )}
          
          {currentUser.role === 'admin' && (
            <>
              <NavBtn id="admin_dashboard" icon={LayoutDashboard} label="Monitoring & Absen" active={activeTab} set={setActiveTab} />
              <button 
                onClick={() => currentUser.isShiftActive ? setActiveTab('inventory') : showNotification('Harap Absen Masuk Dulu!', 'error')} 
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-red-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <div className="flex items-center gap-3"><Package size={20} /> <span className="font-bold text-sm">Stockkeeper</span></div>
                {!currentUser.isShiftActive && <Lock size={14} className="text-slate-600"/>}
              </button>
            </>
          )}
          
          {currentUser.role === 'cashier' && (
            <>
              <NavBtn id="attendance" icon={Clock} label="Absensi" active={activeTab} set={setActiveTab} />
              <button 
                onClick={() => currentUser.isShiftActive ? setActiveTab('pos') : showNotification('Harap Absen Masuk Dulu!', 'error')} 
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === 'pos' ? 'bg-red-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <div className="flex items-center gap-3"><ShoppingBasket size={20} /> <span className="font-bold text-sm">Kasir / POS</span></div>
                {!currentUser.isShiftActive && <Lock size={14} className="text-slate-600"/>}
              </button>
            </>
          )}
        </nav>
        
        <div className="p-4"><button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors"><LogOut size={20}/> Keluar</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
         <div className="lg:hidden bg-white p-4 flex justify-between items-center shadow-sm border-b">
            <span className="font-black text-red-800 uppercase">POS Mobile</span>
            <span className="text-xs font-bold uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-600">{activeTab.replace('_', ' ')}</span>
         </div>
         
         {notification && <div className={`absolute top-16 lg:top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-white font-bold shadow-xl animate-in slide-in-from-top-2 ${notification.type==='error'?'bg-red-600':'bg-slate-800'}`}>{notification.message}</div>}

         <div className="flex-1 p-4 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
            {(activeTab === 'dashboard' || activeTab === 'admin_dashboard') && 
                <DashboardView 
                  currentUser={currentUser} 
                  ingredients={ingredients} 
                  employees={employees} 
                  transactions={transactions} 
                  onUpdateIngredient={handleUpdateIngredient}
                  onToggleShift={handleToggleShift}
                  onApproveVoid={handleApproveVoid}
                  onRejectVoid={handleRejectVoid}
                />
            }
            
            {activeTab === 'inventory' && 
               <InventoryView 
                  ingredients={ingredients} 
                  onAddIngredient={handleAddIngredient} 
                  onUpdateIngredient={handleUpdateIngredient}
                  onDeleteIngredient={handleDeleteIngredient} 
                  products={products} 
                  onAddProduct={handleAddProduct} 
                  onDeleteProduct={handleDeleteProduct} 
                  showNotification={showNotification} 
                  currentUser={currentUser}
               />
            }

            {/* HALAMAN BARU: ACCOUNTING */}
            {activeTab === 'accounting' && (
               <AccountingView appId={appId} db={db} />
            )}

            {activeTab === 'pos' && (
               (currentUser.role === 'owner' || (currentUser.role === 'cashier' && currentUser.isShiftActive)) ? 
               <POSView 
                  products={products} 
                  ingredients={ingredients} 
                  onProcessPayment={handleProcessPayment} 
                  currentUser={currentUser} 
                  showNotification={showNotification}
                  transactions={transactions}
                  onRequestVoid={handleRequestVoid}
               /> 
               : 
               <div className="flex flex-col items-center justify-center h-full text-center">
                  <Lock size={64} className="text-gray-300 mb-4"/>
                  <h2 className="text-2xl font-bold text-gray-700">Akses Kasir Terkunci</h2>
                  <p className="text-gray-500 mb-6">Anda belum melakukan Check-In (Absen Masuk).</p>
                  <button onClick={()=>setActiveTab('attendance')} className="bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg">Buka Halaman Absen</button>
               </div>
            )}

            {(activeTab === 'employees' || activeTab === 'attendance') && 
               <EmployeeView 
                  employees={employees} 
                  transactions={transactions} 
                  currentUser={currentUser} 
                  attendanceLog={attendanceLog} 
                  onToggleShift={handleToggleShift} 
                  onAddEmployee={handleAddEmployee} 
                  onDeleteEmployee={handleDeleteEmployee} 
                  showNotification={showNotification} 
                  setCurrentUser={setCurrentUser} 
               />
            }

            {activeTab === 'transactions' && (
              <TransactionsView transactions={transactions} />
            )}
         </div>

         <div className="lg:hidden bg-white border-t p-2 flex justify-around fixed bottom-0 w-full z-50 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
            <NavIcon id={currentUser.role === 'admin' ? 'admin_dashboard' : 'dashboard'} icon={LayoutDashboard} label="Home" onClick={()=>setActiveTab(currentUser.role==='admin'?'admin_dashboard':'dashboard')} active={activeTab.includes('dashboard')} />
            
            {currentUser.role!=='admin' && 
              <NavIcon 
                id="pos" 
                icon={ShoppingBasket} 
                label="Kasir" 
                onClick={() => (currentUser.isShiftActive || currentUser.role === 'owner') ? setActiveTab('pos') : showNotification('Absen Dulu!', 'error')} 
                active={activeTab==='pos'} 
              />
            }
            
            {currentUser.role!=='cashier' && 
              <NavIcon 
                id="inventory" 
                icon={Package} 
                label="Stok" 
                onClick={() => (currentUser.isShiftActive || currentUser.role === 'owner') ? setActiveTab('inventory') : showNotification('Absen Dulu!', 'error')} 
                active={activeTab==='inventory'} 
              />
            }
            
            {currentUser.role==='owner' && <NavIcon id="employees" icon={Users} label="Tim" onClick={()=>setActiveTab('employees')} active={activeTab==='employees'} />}
            
            {currentUser.role==='cashier' && <NavIcon id="attendance" icon={Clock} label="Absen" onClick={()=>setActiveTab('attendance')} active={activeTab==='attendance'} />}
            
            <button onClick={()=>setCurrentUser(null)} className="flex flex-col items-center p-2 text-gray-400 hover:text-red-600 transition-colors"><LogOut size={20}/> <span className="text-[10px] mt-1 font-bold">Exit</span></button>
         </div>
      </main>
    </div>
  );
}

const NavBtn = ({ id, icon: Icon, label, active, set }) => (
  <button onClick={() => set(id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active === id ? 'bg-red-800 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    <Icon size={20} /> <span className="font-bold text-sm">{label}</span>
  </button>
);
const NavIcon = ({ id, icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${active ? 'text-red-600 bg-red-50' : 'text-gray-400'}`}>
    <Icon size={20} /> <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);