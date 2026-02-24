import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBasket, Package, History, LogOut, 
  Users, Clock, Lock, Database, AlertTriangle,
  User, Eye, EyeOff, Coffee, ArrowRight 
} from 'lucide-react';

// --- 1. IMPORT FIREBASE ---
import { auth, db } from './firebaseConfig';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, deleteDoc, doc, setDoc, getDoc,
          onSnapshot, query, orderBy, increment, addDoc, updateDoc 
} from 'firebase/firestore';

// --- 2. IMPORT KOMPONEN ---
import DashboardView from './pages/Dashboardview'; 
import InventoryView from './pages/InventoryView';
import EmployeeView from './pages/EmployeeView';
import POSView from './pages/POSView';
import TransactionsView from './pages/TransactionsView';

// --- 3. IMPORT LAYOUT ---
import AppSidebar from './components/ui/layout/AppSidebar';

// ID DATABASE
const appId = 'pos-system-v3-secure'; 
const getColl = (name) => collection(db, 'artifacts', appId, 'public', 'data', name);
const getDocRef = (collName, docId) => doc(db, 'artifacts', appId, 'public', 'data', collName, docId);

// NavIcon Mobile
const NavIcon = ({ id, icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 active:scale-90 ${
      active 
        ? 'text-white bg-gradient-to-tr from-red-600 to-orange-600 shadow-lg shadow-orange-500/20 translate-y-[-4px]' 
        : 'text-slate-400 hover:text-white'
    }`}
  >
    <Icon size={20} /> 
    <span className="text-[10px] font-bold mt-1">{label}</span>
  </button>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // STATE LOGIN
  const [usernameInput, setUsernameInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);

  // [KEMBALI DITAMBAHKAN] STATE SESSION (Mencegah ter-logout saat direfresh)
  const [savedSessionId, setSavedSessionId] = useState(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); 
  
  // GLOBAL STATE
  const [employees, setEmployees] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [attendanceLog, setAttendanceLog] = useState([]);

  // --- [KEMBALI DITAMBAHKAN] SYNC AUTH & SESSION ---
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
        if (!user) {
            signInAnonymously(auth).catch(e => {
                console.error("Login Gagal:", e);
                setIsAppLoading(false);
            });
        } else {
            try {
                // Mengecek sesi aktif di database
                const sessionSnap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'));
                if (sessionSnap.exists()) {
                    setSavedSessionId(sessionSnap.data().employeeId);
                }
            } catch (e) {
                console.error("Gagal memuat sesi:", e);
            } finally {
                setIsAppLoading(false);
            }
        }
    });
    return () => unsubAuth();
  }, []);

  // --- SYNC DATABASE ---
  useEffect(() => {
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

    return () => { unsubEmp(); unsubIng(); unsubProd(); unsubTx(); unsubAtt(); }
  }, [currentUser?.id]); 

  // --- [KEMBALI DITAMBAHKAN] KEMBALIKAN SESI KARYAWAN JIKA ADA ---
  useEffect(() => {
    if (savedSessionId && employees.length > 0 && !currentUser) {
        const user = employees.find(u => u.id === savedSessionId);
        if (user) {
            setCurrentUser(user);
            if (user.role === 'owner' || user.role === 'investor') setActiveTab('dashboard');
            else if (user.role === 'admin') setActiveTab('admin_dashboard');
            else setActiveTab('attendance');
        } else {
            setSavedSessionId(null); 
        }
    }
  }, [savedSessionId, employees, currentUser]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const askConfirm = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  };

  // --- HANDLER LOGOUT ---
  const handleLogout = async () => {
      setCurrentUser(null);
      setSavedSessionId(null);
      if (auth.currentUser) {
          await deleteDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'session', 'active')).catch(e => console.error(e));
      }
  };

  // --- LOGIKA KEUANGAN ---
  const handleInputCapital = async (amountInput) => {
     const amount = parseFloat(amountInput);
     if(!amount || amount <= 0) return showNotification('Nominal harus valid!', 'error');
     askConfirm(`Setor modal kasir senilai Rp ${amount.toLocaleString()}?`, async () => {
        try {
            await addDoc(getColl('capital_logs'), { amount, description: 'Setor Modal Harian', timestamp: new Date(), user: currentUser?.name || 'System' });
            showNotification(`Berhasil setor modal Rp ${amount.toLocaleString()}`);
        } catch(e) { console.error(e); showNotification('Gagal input modal', 'error'); }
     });
  };

  const recordInventoryExpense = async (data) => {
      const amount = parseFloat(data.purchasePrice) || 0;
      if (amount > 0) {
          try {
              await addDoc(getColl('expenses'), {
                  description: `Belanja Stok: ${data.name}`, category: 'bahan_baku', amount: amount, status: 'approved', approved_at: new Date(), created_at: new Date(), input_by: currentUser?.name || 'System'
              });
          } catch (error) { console.error("Gagal mencatat expense:", error); }
      }
  };

  const handleEmergencyExpense = async (amountInput, description) => {
      const amount = parseFloat(amountInput);
      if (!amount || amount <= 0) return showNotification('Nominal tidak valid', 'error');
      if (!description) return showNotification('Keterangan wajib diisi', 'error');

      askConfirm(`Catat pengeluaran Rp ${amount.toLocaleString()} untuk "${description}"?`, async () => {
          try {
              await addDoc(getColl('expenses'), {
                  description: description,
                  category: 'operasional_darurat', 
                  amount: amount,
                  status: 'approved',
                  timestamp: new Date(),
                  approved_at: new Date(),
                  created_at: new Date(),
                  user: currentUser?.name || 'Kasir',
                  source: 'POS_CASH'
              });
              
              showNotification('Pengeluaran Tercatat & Saldo Kasir Dipotong');
          } catch (e) { console.error(e); showNotification('Gagal mencatat pengeluaran', 'error'); }
      });
  };

  const handleAddIngredient = async (data) => { await addDoc(getColl('ingredients'), data); await recordInventoryExpense(data); showNotification('Bahan Disimpan & Pengeluaran Tercatat'); };
  const handleUpdateIngredient = async (id, data) => { 
      await updateDoc(getDocRef('ingredients', id), data); 
      if(data.purchasePrice && data.purchasePrice > 0) { await recordInventoryExpense({ ...data, name: data.name || 'Update Stok' }); showNotification('Stok & Biaya Tercatat'); } else { showNotification('Data Diupdate'); }
  };
  const handleDeleteIngredient = async (id) => { try { await deleteDoc(getDocRef('ingredients', id)); showNotification('Bahan Dihapus'); } catch (err) { showNotification('Gagal hapus', 'error'); } };
  const handleAddProduct = async (data) => { await addDoc(getColl('products'), data); showNotification('Menu Disimpan'); };
  const handleUpdateProduct = async (id, data) => { try { await updateDoc(getDocRef('products', id), data); showNotification('Menu Diupdate'); } catch (error) { showNotification('Gagal update', 'error'); } };
  const handleDeleteProduct = async (id) => { await deleteDoc(getDocRef('products', id)); showNotification('Menu Dihapus'); };

  const seedAccountingData = async () => { showNotification('Reset Akuntansi Sukses'); };

  // --- HANDLER LOGIN (PIN 4 DIGIT) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const userIn = usernameInput.trim(); 
    const pinIn = pinInput.trim();

    if (userIn === '' || pinIn === '') return showNotification('Username & PIN wajib diisi', 'error');

    if (employees.length === 0) {
        try {
            const ownerPin = pinIn; 
            const newOwner = { name: userIn, loginId: ownerPin, role: 'owner', isShiftActive: false, lastActive: '-' };
            const docRef = await addDoc(getColl('employees'), newOwner);
            const createdUser = { id: docRef.id, ...newOwner };
            setCurrentUser(createdUser);
            setActiveTab('dashboard');
            
            // Simpan sesi ke database
            if (auth.currentUser) {
                await setDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'session', 'active'), { employeeId: createdUser.id });
            }
            
            setUsernameInput('');
            setPinInput('');
            alert(`🎉 AKUN OWNER DIBUAT!\n\nPIN Login Anda: ${ownerPin}\n\nHarap ingat PIN ini untuk login selanjutnya.`);
        } catch (error) { showNotification('Gagal membuat akun owner', 'error'); }
        return;
    }

    const user = employees.find(u => u.name.toLowerCase() === userIn.toLowerCase() && String(u.loginId) === String(pinIn));
    
    if(user) {
        setCurrentUser(user);
        if (user.role === 'owner' || user.role === 'investor') setActiveTab('dashboard');
        else if (user.role === 'admin') setActiveTab('admin_dashboard');
        else setActiveTab('attendance'); 
        
        // Simpan sesi ke database
        if (auth.currentUser) {
            await setDoc(doc(db, 'artifacts', appId, 'users', auth.currentUser.uid, 'session', 'active'), { employeeId: user.id });
        }

        setUsernameInput('');
        setPinInput('');
        showNotification(`Selamat Datang, ${user.name}`);
    } else {
        showNotification('Username atau PIN Salah!', 'error');
    }
  };

  const handleToggleShift = async (userId) => {
     const emp = employees.find(e => e.id === userId); if(!emp) return;
     const now = new Date(); const isCheckIn = !emp.isShiftActive;
     await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', userId), { isShiftActive: isCheckIn, lastActive: isCheckIn ? now.toLocaleTimeString() : emp.lastActive });
     await addDoc(getColl('attendanceLog'), { employeeId: userId, employeeName: emp.name, type: isCheckIn?'Masuk':'Keluar', time: now.toLocaleString(), timestamp: now });
     setCurrentUser(prev => ({ ...prev, isShiftActive: isCheckIn }));
     showNotification(`Absen ${isCheckIn?'Masuk':'Keluar'} Sukses`);
     if (isCheckIn && emp.role === 'cashier') setTimeout(() => setActiveTab('pos'), 500); 
     if (!isCheckIn && emp.role === 'cashier') setActiveTab('attendance');
  };

  const handleAddEmployee = async (data) => { 
      let pin = data.loginId;
      if (!pin) {
        let isUnique = false;
        while (!isUnique) {
            pin = Math.floor(1000 + Math.random() * 9000).toString(); 
            const exists = employees.some(emp => emp.loginId === pin);
            if (!exists) isUnique = true;
        }
      }
      const newEmp = { ...data, loginId: pin, isShiftActive: false, lastActive: '-' };
      await addDoc(getColl('employees'), newEmp); 
      alert(`✅ SUKSES!\n\nAkun untuk: ${data.name}\nPIN LOGIN: ${pin}\n\n(PIN 4 Digit) Harap simpan PIN ini.`);
      showNotification('Akun Ditambah'); 
  };
  
  const handleDeleteEmployee = async (id) => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'employees', id)); showNotification('Akun Dihapus'); };
  
  const handleProcessPayment = async (txData, cartItems) => {
    try {
      const txRef = await addDoc(getColl('transactions'), { ...txData, status: 'success', timestamp: new Date() });
      for (const item of cartItems) {
        if (!item.recipe) continue;
        for (const r of item.recipe) {
          const ing = ingredients.find(i => String(i.id) === String(r.ingredientId));
          if (ing) {
            const used = (parseFloat(r.qty)||0) * (parseFloat(item.qty)||1);
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', ing.id), { stock: Math.max(0, (parseFloat(ing.stock)||0) - used) });
          }
        }
      }
      showNotification('Transaksi Berhasil');
    } catch (err) { console.error(err); showNotification('Gagal Transaksi', 'error'); }
  };

  const handleRequestVoid = async (txId, reason) => { 
      const targetTx = transactions.find(t => t.docId === txId || t.id === txId);
      if (!targetTx) return showNotification('Transaksi tidak ditemukan', 'error');
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', targetTx.docId), { 
          status: 'void_pending', 
          voidReason: reason, 
          voidRequestedBy: currentUser.name 
      }); 
      showNotification('Void diajukan'); 
  };
  
  const handleApproveVoid = async (tx) => { 
      try {
          const targetTx = transactions.find(t => t.docId === (tx.docId || tx.id) || t.id === (tx.docId || tx.id));
          if (!targetTx) return showNotification('Transaksi tidak ditemukan', 'error');

          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', targetTx.docId), { 
              status: 'voided', 
              voidApprovedBy: currentUser.name 
          }); 
          
          if (targetTx.items && Array.isArray(targetTx.items)) {
              for (const item of targetTx.items) {
                  if (!item.recipe) continue;
                  for (const r of item.recipe) {
                      const ing = ingredients.find(i => String(i.id) === String(r.ingredientId));
                      if (ing) {
                          const returnedStock = (parseFloat(r.qty) || 0) * (parseFloat(item.qty) || 1);
                          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ingredients', ing.id), { 
                              stock: increment(returnedStock) 
                          });
                      }
                  }
              }
          }
          
          showNotification('Void Disetujui & Stok Dikembalikan'); 
      } catch (err) {
          console.error(err);
          showNotification('Gagal menyetujui Void', 'error');
      }
  };
  
  const handleRejectVoid = async (txId) => { 
      const targetTx = transactions.find(t => t.docId === txId || t.id === txId);
      if (!targetTx) return showNotification('Transaksi tidak ditemukan', 'error');

      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', targetTx.docId), { 
          status: 'success', 
          voidReason: null 
      }); 
      showNotification('Void Ditolak'); 
  };

  // --- [KEMBALI DITAMBAHKAN] LAYAR LOADING SAAT CEK SESI ---
  if (isAppLoading || (savedSessionId && !currentUser && employees.length === 0)) {
    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 text-white font-sans relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4 relative z-10"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs relative z-10">Memuat Sesi...</p>
        </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 font-sans p-6 text-slate-100 relative overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

         <div className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl w-full max-w-md border border-white/10 relative z-10 animate-in zoom-in duration-500">
            <div className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg shadow-red-500/30 mb-6 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                    <Coffee size={48} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-center text-white tracking-tight mb-2">POS SYSTEM</h1>
                <p className="text-center text-slate-400 text-sm">Masuk untuk memulai shift & operasional</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
               <div className="space-y-2 group">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-red-400 transition-colors">Username</label>
                   <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors" size={20} />
                       <input type="text" className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner" placeholder="Masukkan Username" value={usernameInput} onChange={e=>setUsernameInput(e.target.value)} autoFocus />
                   </div>
               </div>
               <div className="space-y-2 group">
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-red-400 transition-colors">PIN Akses</label>
                   <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors" size={20} />
                       <input type={showPin ? "text" : "password"} inputMode="numeric" className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner" placeholder="••••" value={pinInput} onChange={e=>setPinInput(e.target.value)} />
                       <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1 active:scale-90">{showPin ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                   </div>
               </div>
               {employees.length === 0 && (<div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center backdrop-blur-sm animate-pulse"><p className="text-xs text-red-200 leading-relaxed"><span className="font-bold block text-sm mb-1">⚠️ SETUP AWAL DETECTED</span> Database kosong. Login pertama ini akan otomatis membuat akun <b>Owner</b> baru.</p></div>)}
               
               <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white py-4 rounded-2xl font-bold uppercase tracking-wider shadow-xl shadow-red-900/20 transform hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all flex items-center justify-center gap-2 group mt-4">
                  Masuk Sistem <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
               </button>
            </form>
            <div className="mt-10 text-center"><p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Secure POS v3.0</p></div>
         </div>
      </div>
    )
  }

  return (
    <div className="flex h-[100dvh] lg:h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 font-sans text-slate-800 overflow-hidden">
      {/* SIDEBAR */}
      <div className="hidden lg:block relative z-20">
        <AppSidebar 
           activeTab={activeTab} onTabChange={setActiveTab} userRole={currentUser.role}
           isShiftActive={currentUser.isShiftActive} userName={currentUser.name}
           onLogout={handleLogout} onResetAccounting={seedAccountingData} showNotification={showNotification}
        />
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 overflow-hidden flex flex-col relative w-full bg-slate-50/95 lg:rounded-l-[2.5rem] shadow-2xl z-10 backdrop-blur-md border-l border-white/20">
         
         {/* MOBILE HEADER */}
         <div className="lg:hidden bg-slate-900/90 backdrop-blur-md text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50 border-b border-white/10">
            <span className="font-black text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">POS SYSTEM</span>
            <span className="text-[10px] font-bold uppercase bg-white/10 px-3 py-1 rounded-full text-slate-300 border border-white/10">{activeTab.replace('_', ' ')}</span>
         </div>
         
         {notification && <div className={`absolute top-16 lg:top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-white font-bold shadow-2xl animate-in slide-in-from-top-4 backdrop-blur-md border border-white/20 ${notification.type==='error'?'bg-red-600/90':'bg-slate-800/90'}`}>{notification.message}</div>}
         
         {/* KONFIRMASI CUSTOM */}
         {confirmDialog && (
            <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
              <div className="bg-white p-6 rounded-3xl max-w-sm w-full shadow-2xl animate-in zoom-in-95 border border-slate-100">
                <h3 className="font-bold text-lg mb-2 text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500"/> Konfirmasi
                </h3>
                <p className="text-sm text-slate-600 mb-6">{confirmDialog.message}</p>
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setConfirmDialog(null)} 
                    className="px-5 py-2.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 active:scale-95 transition-transform"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => {
                      confirmDialog.onConfirm();
                      setConfirmDialog(null);
                    }} 
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl text-xs font-bold hover:shadow-lg active:scale-95 transition-transform"
                  >
                    Lanjutkan
                  </button>
                </div>
              </div>
            </div>
         )}

         <div className="flex-1 p-4 lg:p-8 overflow-y-auto pb-24 lg:pb-8">
            {(activeTab === 'dashboard' || activeTab === 'admin_dashboard') && 
                <DashboardView 
                  currentUser={currentUser} ingredients={ingredients} employees={employees} transactions={transactions} 
                  onUpdateIngredient={handleUpdateIngredient} onToggleShift={handleToggleShift}
                  onApproveVoid={handleApproveVoid} onRejectVoid={handleRejectVoid} onInputCapital={handleInputCapital} 
                  showNotification={showNotification} askConfirm={askConfirm}
                  onAddEmployee={handleAddEmployee} onDeleteEmployee={handleDeleteEmployee}
                />
            }
            
            {activeTab === 'inventory' && 
               <InventoryView 
                  ingredients={ingredients} onAddIngredient={handleAddIngredient} onUpdateIngredient={handleUpdateIngredient}
                  onDeleteIngredient={handleDeleteIngredient} products={products} onAddProduct={handleAddProduct} 
                  onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} 
                  showNotification={showNotification} currentUser={currentUser} askConfirm={askConfirm}
               />
            }

            {activeTab === 'transactions' && (
              <TransactionsView transactions={transactions} />
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
                  onRecordExpense={handleEmergencyExpense}
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
                  employees={employees} transactions={transactions} currentUser={currentUser} attendanceLog={attendanceLog} 
                  onToggleShift={handleToggleShift} onAddEmployee={handleAddEmployee} onDeleteEmployee={handleDeleteEmployee} 
                  showNotification={showNotification} setCurrentUser={setCurrentUser} askConfirm={askConfirm}
               />
            }
         </div>

         {/* BOTTOM NAV FOR MOBILE */}
         <div className="lg:hidden bg-white border-t p-2 flex justify-around fixed bottom-0 w-full z-50 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
            
            {currentUser.role !== 'cashier' && (
                <NavIcon id={currentUser.role === 'admin' ? 'admin_dashboard' : 'dashboard'} icon={LayoutDashboard} label="Home" onClick={()=>setActiveTab(currentUser.role==='admin'?'admin_dashboard':'dashboard')} active={activeTab.includes('dashboard')} />
            )}
            
            {(currentUser.role === 'cashier' || currentUser.role === 'owner') && (
              <NavIcon 
                id="pos" 
                icon={ShoppingBasket} 
                label="Kasir" 
                onClick={() => (currentUser.isShiftActive || currentUser.role === 'owner') ? setActiveTab('pos') : showNotification('Absen Dulu!', 'error')} 
                active={activeTab==='pos'} 
              />
            )}
            
            {currentUser.role !== 'cashier' && (
              <NavIcon 
                id="inventory" 
                icon={Package} 
                label="Stok" 
                onClick={() => (currentUser.isShiftActive || currentUser.role === 'owner' || currentUser.role === 'investor') ? setActiveTab('inventory') : showNotification('Absen Dulu!', 'error')} 
                active={activeTab==='inventory'} 
              />
            )}
            
            {(currentUser.role === 'owner' || currentUser.role === 'investor') && (
                <NavIcon id="employees" icon={Users} label="Tim" onClick={()=>setActiveTab('employees')} active={activeTab==='employees'} />
            )}

            {(currentUser.role === 'owner' || currentUser.role === 'investor') && (
                <NavIcon id="transactions" icon={History} label="Laporan" onClick={()=>setActiveTab('transactions')} active={activeTab==='transactions'} />
            )}
            
            {currentUser.role === 'cashier' && (
                <NavIcon id="attendance" icon={Clock} label="Absen" onClick={()=>setActiveTab('attendance')} active={activeTab==='attendance'} />
            )}
            
            <button onClick={handleLogout} className="flex flex-col items-center p-2 text-gray-400 hover:text-red-600 transition-colors"><LogOut size={20}/> <span className="text-[10px] mt-1 font-bold">Exit</span></button>
         </div>
      </main>
    </div>
  );
}