import React, { useState } from 'react';
import { 
  Search, ShoppingCart, ShoppingBasket, X, Minus, Plus, 
  Printer, CheckCircle, Users, ArrowLeft, ArrowRight,
  Bike, Store, Utensils, Coffee, ShoppingBag, History, AlertTriangle
} from 'lucide-react';

// --- MODAL RIWAYAT & REQUEST VOID ---
const HistoryModal = ({ transactions, onClose, onRequestVoid }) => {
    const [reason, setReason] = useState('');
    const [selectedTx, setSelectedTx] = useState(null);

    // Ambil transaksi hari ini saja & belum void
    const today = new Date().toLocaleDateString('id-ID');
    const todaysTx = transactions.filter(t => t.date.includes(today));

    const handleSubmitVoid = () => {
        if(!reason) return alert("Alasan wajib diisi!");
        onRequestVoid(selectedTx.id, reason);
        setSelectedTx(null);
        setReason('');
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl h-[80vh] flex flex-col">
                <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
                    <h3 className="font-bold text-stone-800 flex items-center gap-2"><History size={18}/> Riwayat Hari Ini</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-100">
                    {todaysTx.length === 0 && <p className="text-center text-stone-400 text-sm mt-10">Belum ada transaksi.</p>}
                    
                    {todaysTx.map(tx => (
                        <div key={tx.id} className={`bg-white p-4 rounded-xl border shadow-sm ${tx.status === 'voided' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-stone-800">{tx.id}</span>
                                    <div className="text-[10px] text-stone-500">{tx.date} • {tx.orderType}</div>
                                </div>
                                <span className={`font-black ${tx.status==='voided'?'text-stone-400 line-through':'text-amber-600'}`}>Rp {tx.total.toLocaleString()}</span>
                            </div>
                            
                            {/* STATUS VOID */}
                            {tx.status === 'void_pending' && (
                                <div className="bg-yellow-50 text-yellow-700 text-xs p-2 rounded flex items-center gap-2 font-bold mb-2">
                                    <Clock size={14}/> Menunggu Persetujuan Owner
                                </div>
                            )}
                            {tx.status === 'voided' && (
                                <div className="bg-red-50 text-red-600 text-xs p-2 rounded flex items-center gap-2 font-bold mb-2">
                                    <X size={14}/> DIBATALKAN
                                </div>
                            )}

                            {/* TOMBOL REQUEST VOID */}
                            {tx.status === 'success' && (
                                <button 
                                    onClick={() => setSelectedTx(tx)}
                                    className="w-full mt-2 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle size={14}/> Ajukan Pembatalan
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* INPUT ALASAN */}
                {selectedTx && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col p-6 animate-in slide-in-from-bottom">
                        <h4 className="font-bold text-lg mb-2 text-stone-800">Ajukan Batal: {selectedTx.id}</h4>
                        <p className="text-xs text-stone-500 mb-4">Permintaan akan dikirim ke Owner untuk disetujui. Stok akan otomatis dikembalikan jika disetujui.</p>
                        <textarea 
                            className="w-full p-4 border rounded-xl bg-stone-50 text-sm focus:ring-2 focus:ring-red-500 outline-none h-32 mb-4"
                            placeholder="Alasan pembatalan (cth: Salah input, Pelanggan komplain rasa...)"
                            value={reason}
                            onChange={e=>setReason(e.target.value)}
                        />
                        <div className="flex gap-3 mt-auto">
                            <button onClick={()=>setSelectedTx(null)} className="flex-1 py-3 bg-stone-200 rounded-xl font-bold text-stone-600">Batal</button>
                            <button onClick={handleSubmitVoid} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Kirim Pengajuan</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ... (SISA KODE KOMPONEN RECEIPT MODAL & RECEIPT DETAILS TETAP SAMA SEPERTI SEBELUMNYA) ...
// --- KOMPONEN ITEM STRUK (UPDATED: SUPPORT STORE COPY) ---
const ReceiptDetails = ({ transaction, isStoreCopy = false }) => (
  <>
      <div className="text-[10px] text-stone-500 space-y-1.5 mb-6 border-b border-dashed border-gray-200 pb-4 font-mono">
          <div className="flex justify-between"><span>NO. TRX</span><span className="font-bold text-stone-900">{transaction.id}</span></div>
          <div className="flex justify-between"><span>TANGGAL</span><span>{transaction.date}</span></div>
          <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-100 text-stone-800">
              <span>PELANGGAN</span>
              <span className="font-bold uppercase truncate max-w-[150px]">{transaction.customer || 'Umum'}</span>
          </div>
          <div className="flex justify-between"><span>KASIR</span><span>{transaction.cashier}</span></div>
          {/* TIPE PESANAN DITAMPILKAN JELAS */}
          <div className="flex justify-between font-black text-stone-900 pt-1">
              <span>TIPE</span>
              <span className="uppercase bg-stone-900 text-white px-2 py-0.5 rounded text-[9px]">{transaction.orderType}</span>
          </div>
      </div>

      <div className="space-y-3 mb-6 text-[11px]">
          {transaction.items.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                  <div className="flex justify-between font-bold text-stone-800">
                      <span className="uppercase">{item.name}</span>
                      {/* HARGA DIHIDE JIKA STORE COPY */}
                      {!isStoreCopy && <span>Rp {(item.price * item.qty).toLocaleString()}</span>}
                  </div>
                  {/* DETAIL QTY */}
                  <div className="text-[9px] text-stone-400 font-mono mt-0.5">
                      {item.qty} x {isStoreCopy ? '' : `@${item.price.toLocaleString()}`}
                  </div>
              </div>
          ))}
      </div>

      {/* TOTAL DIHIDE JIKA STORE COPY */}
      {!isStoreCopy && (
        <div className="border-t-2 border-stone-800 pt-3 mb-4">
            <div className="flex justify-between font-black text-lg text-stone-900">
                <span>TOTAL</span>
                <span className="text-amber-600">Rp {transaction.total.toLocaleString()}</span>
            </div>
        </div>
      )}

      {/* FOOTER HANYA UNTUK CUSTOMER */}
      {!isStoreCopy && (
        <div className="text-center text-[9px] text-stone-400 font-medium pt-2">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p className="mt-1 font-mono">Password Wifi: amber123</p>
        </div>
      )}
  </>
);

// --- KOMPONEN MODAL STRUK (2 RANGKAP) ---
const ReceiptModal = ({ lastTransaction, onClose, onPrint }) => (
  <div className="fixed inset-0 bg-stone-900/90 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
          
          {/* AREA PREVIEW & CETAK (SCROLLABLE) */}
          <div className="flex-1 bg-stone-100 overflow-y-auto p-4 custom-scrollbar relative print-area-container">
              {/* CSS KHUSUS UNTUK CETAK */}
              <style>
                {`
                  @media print {
                    @page { margin: 0; size: auto; }
                    body * { visibility: hidden; }
                    .print-area-container, .print-area-container * { visibility: visible; }
                    .print-area-container { 
                      position: fixed; 
                      left: 0; 
                      top: 0; 
                      width: 100%; 
                      height: auto; 
                      background: white; 
                      padding: 0; 
                      margin: 0; 
                      overflow: visible;
                    }
                    .no-print { display: none !important; }
                    .receipt-copy { break-inside: avoid; page-break-inside: avoid; padding-bottom: 20px; }
                  }
                `}
              </style>

              <div className="bg-white shadow-sm p-6 min-h-full">
                  {/* --- COPY 1: CUSTOMER (LENGKAP DENGAN HARGA) --- */}
                  <div className="receipt-copy mb-8 pb-8 border-b-2 border-dashed border-stone-300">
                      <div className="text-center mb-6 pt-2">
                          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white font-black text-lg mx-auto mb-3 shadow-lg shadow-amber-500/30">A</div>
                          <h2 className="font-black text-xl text-stone-900 uppercase tracking-tight leading-none">Amber POS</h2>
                          <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase tracking-widest text-center">COPY: CUSTOMER</p>
                      </div>
                      <ReceiptDetails transaction={lastTransaction} isStoreCopy={false} />
                  </div>

                  {/* GARIS POTONG (VISUAL DI LAYAR) */}
                  <div className="flex items-center gap-4 mb-8 opacity-50 no-print">
                      <div className="h-px bg-stone-300 flex-1"></div>
                      <span className="text-[10px] font-mono text-stone-400">✂ POTONG DISINI ✂</span>
                      <div className="h-px bg-stone-300 flex-1"></div>
                  </div>

                  {/* --- COPY 2: STORE / KASIR (TANPA HARGA) --- */}
                  <div className="receipt-copy">
                      <div className="text-center mb-6">
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest text-center">COPY: STORE / DAPUR</p>
                      </div>
                      <ReceiptDetails transaction={lastTransaction} isStoreCopy={true} />
                  </div>
              </div>
          </div>

          {/* FOOTER TOMBOL (TIDAK DICETAK) */}
          <div className="p-4 bg-white border-t border-stone-100 grid grid-cols-2 gap-3 shrink-0 no-print">
              <button onClick={onClose} className="py-3 border-2 border-stone-100 bg-white rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 transition-all">
                Tutup / Baru
              </button>
              <button onClick={onPrint} className="py-3 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-black flex items-center justify-center gap-2 transition-all shadow-xl">
                <Printer size={16}/> Cetak (2 Rangkap)
              </button>
          </div>
      </div>
  </div>
);

const POSView = ({ products, ingredients, onProcessPayment, currentUser, showNotification, transactions, onRequestVoid }) => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState('Pelanggan Umum');
  const [pax, setPax] = useState(1);
  const [receipt, setReceipt] = useState(null); 
  const [orderType, setOrderType] = useState('Dine In'); 
  const [mobileTab, setMobileTab] = useState('menu'); 
  const [showHistory, setShowHistory] = useState(false); // Toggle Modal History
  const [orderCounters, setOrderCounters] = useState({ GoFood: 1, GrabFood: 1, ShopeeFood: 1 });

  // ... (SISA LOGIKA CART & CHECKOUT SAMA, TAMBAHKAN BUTTON HISTORY DI HEADER) ...
  const getMaxStock = (product) => {
    if (!product.recipe || product.recipe.length === 0) return 999;
    let min = 999;
    product.recipe.forEach(r => {
       const ing = ingredients.find(i => String(i.id) === String(r.ingredientId));
       if (ing) {
          const possible = Math.floor((parseFloat(ing.stock) || 0) / parseFloat(r.qty));
          if (possible < min) min = possible;
       } else { min = 0; }
    });
    return min === 999 ? 0 : min;
  };

  const addToCart = (p) => {
    const stock = getMaxStock(p);
    const inCart = cart.find(c => c.id === p.id);
    const currentQty = inCart ? inCart.qty : 0;
    if (currentQty + 1 > stock) return showNotification('Stok bahan baku tidak cukup!', 'error');
    if (inCart) {
       setCart(cart.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
       setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
     const item = cart.find(c => c.id === id);
     if (!item) return;
     const p = products.find(prod => prod.id === id);
     if (delta > 0 && item.qty + 1 > getMaxStock(p)) return showNotification('Mentok stok gudang!', 'error');
     const newQty = item.qty + delta;
     if (newQty <= 0) setCart(cart.filter(c => c.id !== id));
     else setCart(cart.map(c => c.id === id ? { ...c, qty: newQty } : c));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const txData = {
       id: `INV-${Date.now().toString().slice(-6)}`,
       date: new Date().toLocaleString('id-ID'),
       timestamp: new Date(),
       items: cart,
       total,
       customer,
       pax,
       orderType, 
       cashier: currentUser?.name || 'Kasir'
    };
    await onProcessPayment(txData, cart);
    setReceipt(txData); 
    setCart([]);
    setCustomer('Pelanggan Umum');
    setPax(1);
    setOrderType('Dine In'); 
    setMobileTab('menu'); 
  };

  const setOrderSource = (sourceName) => {
    if (sourceName === 'Umum') {
        setCustomer('Pelanggan Umum');
    } else {
        const currentCount = orderCounters[sourceName] || 1;
        const formattedCount = String(currentCount).padStart(3, '0');
        const prefix = sourceName.toLowerCase(); 
        setCustomer(`${prefix}${formattedCount}`);
        setOrderCounters(prev => ({ ...prev, [sourceName]: currentCount + 1 }));
    }
  };

  if (receipt) {
     return <ReceiptModal lastTransaction={receipt} onClose={() => setReceipt(null)} onPrint={() => window.print()} />
  }

  const cartTotal = cart.reduce((a,b)=>a+(b.price*b.qty),0);
  const cartCount = cart.reduce((a,b)=>a+b.qty,0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100dvh-150px)] lg:h-full gap-4 lg:gap-6 overflow-hidden w-full font-sans text-stone-800 relative">
       
       {showHistory && <HistoryModal transactions={transactions} onClose={()=>setShowHistory(false)} onRequestVoid={onRequestVoid} />}

       {/* MENU COLUMN */}
       <div className={`${mobileTab === 'menu' ? 'flex' : 'hidden lg:flex'} h-full lg:flex-1 flex-col bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden relative`}>
          <div className="p-3 lg:p-6 border-b border-stone-100 flex gap-4 bg-stone-50/50">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20}/>
                <input className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white border border-stone-200 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-sm placeholder-stone-300" placeholder="Cari menu..." value={search} onChange={e=>setSearch(e.target.value)} />
             </div>
             {/* TOMBOL HISTORY */}
             <button onClick={()=>setShowHistory(true)} className="p-3 bg-stone-100 rounded-xl hover:bg-stone-200 text-stone-600 transition-colors">
                <History size={24}/>
             </button>
          </div>
          {/* ... GRID MENU DAN CART SEPERTI SEBELUMNYA ... */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-stone-50 pb-20 lg:pb-6">
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-4">
                {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => {
                   const stock = getMaxStock(p);
                   return (
                      <div key={p.id} onClick={()=>stock>0 && addToCart(p)} className={`group cursor-pointer bg-white border border-stone-200 rounded-3xl p-3 lg:p-5 hover:border-amber-500 hover:shadow-xl transition-all duration-200 flex flex-col justify-between min-h-[140px] lg:min-h-[200px] ${stock===0 ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95'}`}>
                         <div className="flex justify-between items-start">
                            <span className={`text-[9px] lg:text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-wider ${stock>0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {stock > 0 ? `Stok: ${stock}` : 'Habis'}
                            </span>
                         </div>
                         <div className="text-4xl lg:text-6xl text-center group-hover:scale-110 transition-transform duration-300 drop-shadow-sm py-1">{p.image}</div>
                         <div className="text-center">
                            <h4 className="font-bold text-stone-800 text-xs lg:text-lg leading-tight mb-1 truncate px-1">{p.name}</h4>
                            <p className="text-amber-600 font-black text-sm lg:text-base">Rp {p.price.toLocaleString()}</p>
                         </div>
                      </div>
                   )
                })}
             </div>
          </div>
          {cartCount > 0 && (
             <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20">
                <button onClick={() => setMobileTab('cart')} className="w-full bg-stone-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-3">
                      <div className="bg-amber-500 text-stone-900 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">{cartCount}</div>
                      <span className="font-bold text-sm">Lihat Pesanan</span>
                   </div>
                   <span className="font-black text-amber-400">Rp {cartTotal.toLocaleString()} <ArrowRight size={16} className="inline ml-1"/></span>
                </button>
             </div>
          )}
       </div>

       {/* CART COLUMN */}
       <div className={`${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'} h-full w-full lg:w-[380px] bg-white border border-stone-200 rounded-3xl shadow-2xl flex-col overflow-hidden relative animate-in slide-in-from-right-8 lg:animate-none duration-200`}>
          <div className="p-3 lg:p-6 bg-stone-900 text-white shadow-md z-10 shrink-0">
             <div className="lg:hidden mb-4">
                <button onClick={() => setMobileTab('menu')} className="text-stone-400 hover:text-white flex items-center gap-2 font-bold text-sm"><ArrowLeft size={16}/> Kembali ke Menu</button>
             </div>
             <div className="flex justify-between items-center mb-2 lg:mb-4">
                <h3 className="font-black text-base lg:text-xl flex items-center gap-2"><ShoppingCart className="text-amber-400" size={18}/> Order</h3>
                <span className="bg-stone-800 px-3 py-1 rounded-lg text-[10px] lg:text-xs font-bold text-stone-400">{cartCount} Items</span>
             </div>
             
             <div className="space-y-2 lg:space-y-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button onClick={() => setOrderType('Dine In')} className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${orderType === 'Dine In' ? 'bg-amber-500 text-stone-900 shadow-lg scale-[1.02]' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}><Coffee size={16}/> DINE IN</button>
                    <button onClick={() => setOrderType('Take Away')} className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${orderType === 'Take Away' ? 'bg-amber-500 text-stone-900 shadow-lg scale-[1.02]' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}><ShoppingBag size={16}/> TAKE AWAY</button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                   <button onClick={()=>setOrderSource('Umum')} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] font-bold flex flex-col items-center gap-1 transition-all border border-transparent hover:border-stone-500"><Utensils size={14}/><span>Umum</span></button>
                   <button onClick={()=>setOrderSource('GoFood')} className="p-2 rounded-xl bg-green-900/40 hover:bg-green-800/40 text-green-400 border border-green-900 hover:border-green-500 text-[10px] font-bold flex flex-col items-center gap-1 transition-all"><Bike size={14}/><span>Gojek</span></button>
                   <button onClick={()=>setOrderSource('GrabFood')} className="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/40 text-emerald-400 border border-emerald-900 hover:border-emerald-500 text-[10px] font-bold flex flex-col items-center gap-1 transition-all"><Bike size={14}/><span>Grab</span></button>
                   <button onClick={()=>setOrderSource('ShopeeFood')} className="p-2 rounded-xl bg-orange-900/40 hover:bg-orange-800/40 text-orange-400 border border-orange-900 hover:border-orange-500 text-[10px] font-bold flex flex-col items-center gap-1 transition-all"><Store size={14}/><span>Shopee</span></button>
                </div>
                <input className="w-full bg-stone-800 border-none rounded-xl p-2.5 lg:p-4 text-xs lg:text-sm text-white placeholder-stone-500 font-bold focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Nama Pelanggan" value={customer} onChange={e=>setCustomer(e.target.value)} />
                <div className="flex items-center justify-between bg-stone-800 p-1.5 lg:p-2 rounded-xl pl-3 lg:pl-4">
                   <div className="flex items-center gap-2 text-stone-400 text-xs lg:text-sm font-bold"><Users size={14}/> Pax</div>
                   <div className="flex items-center gap-2 lg:gap-3 bg-stone-900 p-1 rounded-lg">
                      <button onClick={()=>setPax(Math.max(1, pax-1))} className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-stone-700 hover:bg-stone-600 rounded-md text-white font-bold transition-colors"><Minus size={12}/></button>
                      <span className="font-black text-white w-6 text-center text-xs lg:text-sm">{pax}</span>
                      <button onClick={()=>setPax(pax+1)} className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-amber-600 hover:bg-amber-700 rounded-md text-white font-bold transition-colors"><Plus size={12}/></button>
                   </div>
                </div>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 lg:space-y-3 bg-stone-50">
             {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 pb-10">
                   <ShoppingBasket size={48} className="opacity-20 mb-4"/>
                   <p className="text-xs font-bold uppercase tracking-widest opacity-50">Keranjang Kosong</p>
                </div>
             ) : (
                cart.map(c => (
                   <div key={c.id} className="bg-white p-2.5 lg:p-4 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
                      <div className="flex-1 overflow-hidden mr-2 lg:mr-3">
                         <h4 className="font-bold text-stone-800 truncate text-xs lg:text-sm">{c.name}</h4>
                         <p className="text-[10px] lg:text-xs text-amber-600 font-black mt-0.5">Rp {c.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 lg:gap-2 bg-stone-100 rounded-xl p-1 shrink-0">
                         <button onClick={()=>updateQty(c.id, -1)} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center bg-white shadow-sm rounded-lg text-stone-600 hover:text-red-600 font-bold transition-colors"><Minus size={12}/></button>
                         <span className="font-black text-stone-800 w-5 lg:w-6 text-center text-xs lg:text-sm">{c.qty}</span>
                         <button onClick={()=>updateQty(c.id, 1)} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center bg-stone-900 shadow-sm rounded-lg text-white hover:bg-black font-bold transition-colors"><Plus size={12}/></button>
                      </div>
                   </div>
                ))
             )}
          </div>
          <div className="p-4 lg:p-6 bg-white border-t border-stone-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10 shrink-0">
             <div className="flex justify-between items-center mb-2 lg:mb-4">
                <span className="text-stone-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest">Total</span>
                <span className="text-xl lg:text-3xl font-black text-stone-800">Rp {cartTotal.toLocaleString()}</span>
             </div>
             <button onClick={handleCheckout} disabled={cart.length===0} className="w-full py-4 lg:py-5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-200 disabled:text-stone-400 text-stone-900 rounded-2xl font-black text-sm lg:text-lg transition-all active:scale-95 shadow-xl shadow-amber-200 disabled:shadow-none flex items-center justify-center gap-2">
                <CheckCircle size={18} className="text-stone-900/50"/> BAYAR SEKARANG
             </button>
          </div>
       </div>
    </div>
  );
};

export default POSView;