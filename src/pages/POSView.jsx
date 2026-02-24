import React, { useState } from 'react';
import { 
  Search, ShoppingCart, ShoppingBasket, X, Minus, Plus, 
  Printer, CheckCircle, Users, ArrowLeft, ArrowRight,
  Bike, Store, Utensils, Coffee, ShoppingBag, History, AlertTriangle, Wallet, FileText, CheckSquare, CreditCard
} from 'lucide-react';

const HistoryModal = ({ transactions, onClose, onRequestVoid }) => {
    const [reason, setReason] = useState('');
    const [selectedTx, setSelectedTx] = useState(null);
    const today = new Date().toLocaleDateString('id-ID');
    const todaysTx = transactions.filter(t => t.date && t.date.includes(today));

    const handleSubmitVoid = () => {
        if(!reason) return alert("Alasan wajib diisi!");
        onRequestVoid(selectedTx.id, reason);
        setSelectedTx(null);
        setReason('');
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl h-[80vh] flex flex-col relative">
                <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
                    <h3 className="font-bold text-stone-800 flex items-center gap-2"><History size={18}/> Riwayat Hari Ini</h3>
                    <button onClick={onClose}><X size={20} className="text-stone-400"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-100">
                    {todaysTx.length === 0 && <p className="text-center text-stone-400 text-sm mt-10">Belum ada transaksi hari ini.</p>}
                    
                    {todaysTx.map(tx => (
                        <div key={tx.id} className={`bg-white p-4 rounded-xl border shadow-sm ${tx.status === 'voided' ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-stone-800">{tx.id}</span>
                                    <div className="text-[10px] text-stone-500">{tx.date} • {tx.orderType} • {tx.paymentMethod || 'Tunai'}</div>
                                </div>
                                <span className={`font-black ${tx.status==='voided'?'text-stone-400 line-through':'text-red-600'}`}>Rp {tx.total.toLocaleString()}</span>
                            </div>
                            
                            {tx.status === 'void_pending' && (
                                <div className="bg-yellow-50 text-yellow-700 text-xs p-2 rounded flex items-center gap-2 font-bold mb-2">
                                    Menunggu Approval Owner
                                </div>
                            )}
                            {tx.status === 'voided' && (
                                <div className="bg-red-50 text-red-600 text-xs p-2 rounded flex items-center gap-2 font-bold mb-2">
                                    DIBATALKAN
                                </div>
                            )}
                            {tx.status === 'success' && (
                                <button 
                                    onClick={() => setSelectedTx(tx)}
                                    className="w-full mt-2 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <AlertTriangle size={14}/> Ajukan Pembatalan
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Form Input Alasan Batal */}
                {selectedTx && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col p-6 animate-in slide-in-from-bottom duration-200">
                        <h4 className="font-bold text-lg mb-2 text-stone-800">Ajukan Batal: {selectedTx.id}</h4>
                        <p className="text-xs text-stone-500 mb-4">Permintaan akan dikirim ke Owner. Stok akan otomatis dikembalikan jika disetujui.</p>
                        <textarea 
                            className="w-full p-4 border rounded-xl bg-stone-50 text-sm focus:ring-2 focus:ring-red-500 outline-none h-32 mb-4 resize-none"
                            placeholder="Alasan pembatalan..."
                            value={reason}
                            onChange={e=>setReason(e.target.value)}
                            autoFocus
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

// Modal Catat Pengeluaran
const ExpenseModal = ({ onClose, onSave }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if(!amount || !description) return alert("Semua kolom wajib diisi!");
        onSave(amount, description);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-xl text-stone-800 flex items-center gap-2">
                        <Wallet className="text-red-500"/> Catat Pengeluaran
                    </h3>
                    <button onClick={onClose}><X size={24} className="text-stone-400 hover:text-red-500"/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Nominal (Rp)</label>
                        <input type="number" className="w-full p-4 border rounded-xl font-bold text-xl text-stone-800 outline-none focus:ring-2 focus:ring-red-500 bg-stone-50" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)} autoFocus />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase">Keterangan / Keperluan</label>
                        <textarea className="w-full p-4 border rounded-xl text-sm font-medium text-stone-800 outline-none focus:ring-2 focus:ring-red-500 bg-stone-50 h-24 resize-none" placeholder="Cth: Beli Es Batu, Bayar Sampah..." value={description} onChange={e=>setDescription(e.target.value)} />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors">Batal</button>
                    <button onClick={handleSubmit} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Simpan</button>
                </div>
                <p className="text-[10px] text-center text-stone-400 mt-4">*Saldo kasir akan otomatis terpotong</p>
            </div>
        </div>
    );
};

// Modal Konfirmasi & Pembayaran
const PaymentConfirmationModal = ({ cart, total, customer, orderType, pax, onClose, onProcess }) => {
    const [paymentMethod, setPaymentMethod] = useState('Tunai');
    const [tenderedAmount, setTenderedAmount] = useState('');
    
    // Logika perhitungan menyesuaikan metode pembayaran
    const amount = parseFloat(tenderedAmount) || 0;
    const isAmountSufficient = paymentMethod === 'Tunai' ? amount >= total : true;
    const finalTenderedAmount = paymentMethod === 'Tunai' ? amount : total;
    const change = paymentMethod === 'Tunai' ? amount - total : 0;

    const handleExactAmount = () => setTenderedAmount(total.toString());

    const handleProcess = () => {
        if (paymentMethod === 'Tunai' && !isAmountSufficient) {
            return alert("Nominal uang yang dibayarkan kurang dari total tagihan!");
        }
        onProcess(finalTenderedAmount, change, paymentMethod);
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col h-auto max-h-[90vh] overflow-hidden animate-in zoom-in-95">
                <div className="p-5 border-b bg-stone-50 flex justify-between items-center">
                    <h3 className="font-black text-lg text-stone-800 flex items-center gap-2">
                        <CheckSquare className="text-red-600"/> Konfirmasi & Pembayaran
                    </h3>
                    <button onClick={onClose}><X size={24} className="text-stone-400 hover:text-red-500"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Ringkasan Pesanan */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-stone-200">
                            <div>
                                <p className="font-bold text-stone-800">{customer}</p>
                                <p className="text-[10px] font-bold text-stone-500 uppercase">{orderType} • {pax} Pax</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-stone-500 uppercase">Total Tagihan</p>
                                <p className="font-black text-xl text-red-600">Rp {total.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                    <div className="flex-1">
                                        <span className="font-bold text-stone-700">{item.qty}x {item.name}</span>
                                        {item.note && <p className="text-[10px] text-stone-500 italic mt-0.5 ml-4">- {item.note}</p>}
                                    </div>
                                    <span className="font-mono text-stone-600 font-bold">Rp {(item.price * item.qty).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pilih Metode Pembayaran */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2">
                            <CreditCard size={14}/> Metode Pembayaran
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {['Tunai', 'QRIS', 'Transfer', 'Debit'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`p-3 rounded-xl text-xs font-bold border-2 transition-colors flex justify-center items-center ${paymentMethod === method ? 'border-red-600 bg-red-50 text-red-700' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Pembayaran (Hanya muncul jika Tunai) */}
                    {paymentMethod === 'Tunai' ? (
                        <>
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-stone-500 uppercase flex items-center gap-2">
                                    <Wallet size={14}/> Nominal Uang Diterima
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        className="flex-1 p-4 border-2 border-stone-200 rounded-xl font-black text-2xl text-stone-800 outline-none focus:border-red-600 focus:bg-red-50 transition-colors" 
                                        placeholder="0" 
                                        value={tenderedAmount} 
                                        onChange={e => setTenderedAmount(e.target.value)} 
                                        autoFocus 
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleExactAmount} className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-bold transition-colors">Uang Pas (Rp {total.toLocaleString()})</button>
                                </div>
                            </div>

                            {/* Info Kembalian */}
                            <div className={`p-4 rounded-xl border-2 flex justify-between items-center ${amount > 0 && isAmountSufficient ? 'bg-emerald-50 border-emerald-200' : 'bg-stone-50 border-stone-100'}`}>
                                <span className={`text-xs font-bold uppercase ${amount > 0 && isAmountSufficient ? 'text-emerald-700' : 'text-stone-500'}`}>Kembalian</span>
                                <span className={`font-black text-2xl ${amount > 0 && isAmountSufficient ? 'text-emerald-600' : 'text-stone-400'}`}>
                                    Rp {amount > 0 && isAmountSufficient ? change.toLocaleString() : '0'}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200 text-center text-blue-700 flex flex-col items-center justify-center gap-2">
                            <CheckCircle size={24} />
                            <div>
                                <p className="font-bold">Pembayaran Non-Tunai</p>
                                <p className="text-xs opacity-80">Pastikan saldo telah masuk ke rekening sebelum memproses.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-white flex gap-3">
                    <button onClick={onClose} className="py-4 px-6 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-colors">Batal</button>
                    <button 
                        onClick={handleProcess} 
                        disabled={!isAmountSufficient}
                        className="flex-1 py-4 bg-red-700 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-xl font-black text-lg hover:bg-red-800 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={20}/> Proses Pesanan
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReceiptDetails = ({ transaction, isStoreCopy = false }) => (
  <>
      <div className="text-[10px] text-stone-500 space-y-1.5 mb-6 border-b border-dashed border-gray-200 pb-4 font-mono">
          <div className="flex justify-between"><span>NO. TRX</span><span className="font-bold text-stone-900">{transaction.id}</span></div>
          <div className="flex justify-between"><span>TANGGAL</span><span>{transaction.date}</span></div>
          <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-100 text-stone-800">
              <span>PELANGGAN</span>
              <span className="font-bold uppercase truncate max-w-[150px]">{transaction.customer || 'Umum'}</span>
          </div>
          <div className="flex justify-between font-bold text-stone-900 pt-1">
              <span>TIPE</span>
              <span className="uppercase">{transaction.orderType}</span>
          </div>
          {/* Tampilkan Metode Pembayaran di Struk */}
          <div className="flex justify-between font-bold text-stone-900 pt-1">
              <span>PEMBAYARAN</span>
              <span className="uppercase bg-stone-900 text-white px-2 py-0.5 rounded text-[9px]">{transaction.paymentMethod || 'Tunai'}</span>
          </div>
      </div>

      <div className="space-y-3 mb-6 text-[11px]">
          {transaction.items.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                  <div className="flex justify-between font-bold text-stone-800">
                      <span className="uppercase">{item.qty}x {item.name}</span>
                      {!isStoreCopy && <span>Rp {(item.price * item.qty).toLocaleString()}</span>}
                  </div>
                  {item.note && (
                      <div className="text-[10px] text-stone-600 font-medium italic mt-0.5">
                          - Note: {item.note}
                      </div>
                  )}
                  <div className="text-[9px] text-stone-400 font-mono mt-0.5">
                      {isStoreCopy ? '' : `@${item.price.toLocaleString()}`}
                  </div>
              </div>
          ))}
      </div>

      {!isStoreCopy && (
        <div className="border-t-2 border-stone-800 pt-3 mb-4">
            <div className="flex justify-between font-black text-lg text-stone-900">
                <span>TOTAL</span>
                <span className="text-red-600">Rp {transaction.total.toLocaleString()}</span>
            </div>
            
            {/* Tampilan Pembayaran Berdasarkan Metode */}
            {transaction.paymentMethod === 'Tunai' || !transaction.paymentMethod ? (
                transaction.tenderedAmount !== undefined && (
                    <div className="mt-3 pt-3 border-t border-dashed border-stone-200 space-y-1 text-xs font-mono text-stone-600">
                        <div className="flex justify-between"><span>Tunai Diterima:</span><span>Rp {transaction.tenderedAmount.toLocaleString()}</span></div>
                        <div className="flex justify-between font-bold text-stone-800"><span>Kembali:</span><span>Rp {transaction.changeAmount.toLocaleString()}</span></div>
                    </div>
                )
            ) : (
                <div className="mt-3 pt-3 border-t border-dashed border-stone-200 text-right text-xs font-bold text-stone-800 uppercase tracking-widest">
                    LUNAS VIA {transaction.paymentMethod}
                </div>
            )}
        </div>
      )}

      {!isStoreCopy && (
        <div className="text-center text-[9px] text-stone-400 font-medium pt-2">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p className="mt-1 font-mono">Password Wifi: amber123</p>
        </div>
      )}
  </>
);

const ReceiptModal = ({ lastTransaction, onClose }) => {
  const [printMode, setPrintMode] = useState('all'); 

  const handlePrint = (mode) => {
      setPrintMode(mode);
      setTimeout(() => {
          window.print();
          setPrintMode('all'); 
      }, 150);
  };

  return (
  <div className="fixed inset-0 bg-stone-900/90 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
          
          <div className="flex-1 bg-stone-100 overflow-y-auto p-4 custom-scrollbar relative print-area-container">
              <style>{`
                  @media print { 
                      @page { margin: 0; size: 58mm auto; } /* Ukuran Kertas Thermal 58mm */
                      body * { visibility: hidden; } 
                      .print-area-container, .print-area-container * { visibility: visible; } 
                      .print-area-container { 
                          position: absolute; 
                          left: 0; 
                          top: 0; 
                          width: 58mm; /* Lebar maksimal 58mm */
                          background: white; 
                          padding: 2mm; 
                          margin: 0; 
                      } 
                      /* Menghapus padding besar agar muat di kertas kecil */
                      .bg-white.shadow-sm.p-6 { padding: 0 !important; box-shadow: none !important; }
                      .no-print { display: none !important; } 
                      .receipt-copy { break-inside: avoid; page-break-inside: avoid; padding-bottom: 10px; } 
                  }
              `}</style>
              <div className="bg-white shadow-sm p-6 min-h-full">
                  
                  {/* BAGIAN COPY CUSTOMER / KASIR */}
                  <div className={`receipt-copy mb-8 pb-8 border-b-2 border-dashed border-stone-300 ${printMode === 'kitchen' ? 'no-print' : ''}`}>
                      <div className="text-center mb-6 pt-2">
                          <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center text-white font-black text-lg mx-auto mb-3 shadow-lg shadow-red-700/30">A</div>
                          <h2 className="font-black text-xl text-stone-900 uppercase tracking-tight leading-none">POS SYSTEM</h2>
                          <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase tracking-widest text-center">COPY: CUSTOMER</p>
                      </div>
                      <ReceiptDetails transaction={lastTransaction} isStoreCopy={false} />
                  </div>
                  
                  <div className={`flex items-center gap-4 mb-8 opacity-50 no-print ${printMode !== 'all' ? 'hidden' : ''}`}><div className="h-px bg-stone-300 flex-1"></div><span className="text-[10px] font-mono text-stone-400">✂ POTONG DISINI ✂</span><div className="h-px bg-stone-300 flex-1"></div></div>
                  
                  {/* BAGIAN COPY DAPUR */}
                  <div className={`receipt-copy ${printMode === 'cashier' ? 'no-print' : ''}`}>
                      <div className="text-center mb-6"><p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest text-center">COPY: STORE / DAPUR</p></div>
                      <ReceiptDetails transaction={lastTransaction} isStoreCopy={true} />
                  </div>

              </div>
          </div>
          
          <div className="p-4 bg-white border-t border-stone-100 grid grid-cols-3 gap-2 shrink-0 no-print">
              <button onClick={onClose} className="py-3 border-2 border-stone-100 bg-white rounded-xl text-[10px] font-bold text-stone-600 hover:bg-stone-50 transition-all">Tutup</button>
              <button onClick={() => handlePrint('cashier')} className="py-3 bg-stone-900 text-white rounded-xl text-[10px] font-bold hover:bg-black flex items-center justify-center gap-1 transition-all shadow-md"><Printer size={14}/> Kasir</button>
              <button onClick={() => handlePrint('kitchen')} className="py-3 bg-red-700 text-white rounded-xl text-[10px] font-bold hover:bg-red-800 flex items-center justify-center gap-1 transition-all shadow-md"><Printer size={14}/> Dapur</button>
          </div>
      </div>
  </div>
  );
};

const POSView = ({ products, ingredients, onProcessPayment, currentUser, showNotification, transactions, onRequestVoid, onRecordExpense }) => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState('Pelanggan Umum');
  const [pax, setPax] = useState(1);
  const [receipt, setReceipt] = useState(null); 
  const [orderType, setOrderType] = useState('Dine In'); 
  const [mobileTab, setMobileTab] = useState('menu'); 
  const [showHistory, setShowHistory] = useState(false); 
  const [showExpense, setShowExpense] = useState(false); 
  const [showPaymentModal, setShowPaymentModal] = useState(false); 
  const [orderCounters, setOrderCounters] = useState({ GoFood: 1, GrabFood: 1, ShopeeFood: 1 });

  const getMaxStock = (product) => {
    if (!product.recipe || !Array.isArray(product.recipe) || product.recipe.length === 0) return 999;
    let minStock = Infinity;
    for (const item of product.recipe) {
        let ingredient = ingredients.find(ing => String(ing.id) === String(item.ingredientId));
        if (!ingredient && item.ingredientName) { ingredient = ingredients.find(ing => ing.name.toLowerCase() === item.ingredientName.toLowerCase()); }
        if (!ingredient) return 0;
        const available = parseFloat(ingredient.stock) || 0;
        const required = parseFloat(item.qty) || 0;
        if (required <= 0) continue;
        const possibleQty = Math.floor(available / required);
        if (possibleQty < minStock) minStock = possibleQty;
    }
    return minStock === Infinity ? 0 : minStock;
  };

  const addToCart = (p) => {
    const stock = getMaxStock(p);
    const inCart = cart.find(c => c.id === p.id && !c.note); 
    const currentQty = inCart ? inCart.qty : 0;
    
    if (currentQty + 1 > stock) return showNotification(`Stok habis! Tersedia: ${stock}`, 'error');
    
    if (inCart) {
        setCart(cart.map(c => (c.id === p.id && !c.note) ? { ...c, qty: c.qty + 1 } : c));
    } else {
        setCart([...cart, { ...p, qty: 1, note: '', cartId: Date.now() + Math.random() }]);
    }
  };

  const updateQty = (cartId, delta, pId) => {
     const item = cart.find(c => c.cartId === cartId); if (!item) return;
     const p = products.find(prod => prod.id === pId);
     const maxStock = getMaxStock(p); 
     
     if (delta > 0 && item.qty + 1 > maxStock) return showNotification(`Stok mentok! Maksimal ${maxStock} porsi.`, 'error');
     const newQty = item.qty + delta;
     
     if (newQty <= 0) setCart(cart.filter(c => c.cartId !== cartId));
     else setCart(cart.map(c => c.cartId === cartId ? { ...c, qty: newQty } : c));
  };

  const updateNote = (cartId, newNote) => {
      setCart(cart.map(c => c.cartId === cartId ? { ...c, note: newNote } : c));
  };

  // Diupdate untuk menerima metode pembayaran dari modal
  const handleFinalProcessPayment = async (tenderedAmount, changeAmount, paymentMethod) => {
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
        cashier: currentUser?.name || 'Kasir',
        tenderedAmount, 
        changeAmount,
        paymentMethod // Simpan data metode pembayaran
    };
    
    await onProcessPayment(txData, cart);
    
    setReceipt(txData); 
    setCart([]); 
    setCustomer('Pelanggan Umum'); 
    setPax(1); 
    setOrderType('Dine In'); 
    setMobileTab('menu'); 
    setShowPaymentModal(false); 
  };

  const setOrderSource = (sourceName) => {
    if (sourceName === 'Umum') { setCustomer('Pelanggan Umum'); } else { const currentCount = orderCounters[sourceName] || 1; const formattedCount = String(currentCount).padStart(3, '0'); setCustomer(`${sourceName.toLowerCase()}${formattedCount}`); setOrderCounters(prev => ({ ...prev, [sourceName]: currentCount + 1 })); }
  };

  if (receipt) return <ReceiptModal lastTransaction={receipt} onClose={() => setReceipt(null)} />

  const cartTotal = cart.reduce((a,b)=>a+(b.price*b.qty),0);
  const cartCount = cart.reduce((a,b)=>a+b.qty,0);

  return (
    // FIX 2 (Lingkaran Merah): Mengganti tinggi statis `h-[calc(...)]` menjadi `flex-1 min-h-0`. 
    // Ini mengizinkan komponen otomatis memanjang / melar sempurna menyentuh bagian paling bawah layar.
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4 lg:gap-6 w-full font-sans text-stone-800 relative">
       
       {showHistory && <HistoryModal transactions={transactions} onClose={()=>setShowHistory(false)} onRequestVoid={onRequestVoid} />}
       {showExpense && <ExpenseModal onClose={()=>setShowExpense(false)} onSave={onRecordExpense} />}
       
       {showPaymentModal && (
           <PaymentConfirmationModal 
               cart={cart}
               total={cartTotal}
               customer={customer}
               orderType={orderType}
               pax={pax}
               onClose={() => setShowPaymentModal(false)}
               onProcess={handleFinalProcessPayment}
           />
       )}

       {/* MENU COLUMN */}
       <div className={`${mobileTab === 'menu' ? 'flex' : 'hidden lg:flex'} h-full lg:flex-1 flex-col bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden relative`}>
          <div className="p-3 lg:p-6 border-b border-stone-100 flex gap-4 bg-stone-50/50">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20}/>
                <input className="w-full pl-12 pr-6 py-3 lg:py-4 bg-white border border-stone-200 rounded-2xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-red-600 transition-all shadow-sm placeholder-stone-300" placeholder="Cari menu..." value={search} onChange={e=>setSearch(e.target.value)} />
             </div>
             <div className="flex gap-2">
                 <button onClick={()=>setShowExpense(true)} className="p-3 bg-red-100 rounded-xl hover:bg-red-200 text-red-600 transition-colors flex items-center justify-center shadow-sm border border-red-200" title="Catat Pengeluaran Darurat">
                    <Wallet size={24}/>
                 </button>
                 <button onClick={()=>setShowHistory(true)} className="p-3 bg-stone-100 rounded-xl hover:bg-stone-200 text-stone-600 transition-colors flex items-center justify-center shadow-sm border border-stone-200" title="Riwayat">
                    <History size={24}/>
                 </button>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-stone-50 pb-24 landscape:pb-16 lg:pb-6">
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-4">
                {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => {
                   const stock = getMaxStock(p);
                   return (
                      <div key={p.id} onClick={()=>stock>0 && addToCart(p)} className={`group cursor-pointer bg-white border border-stone-200 rounded-2xl lg:rounded-3xl p-3 hover:border-red-600 hover:shadow-xl transition-all duration-200 flex flex-col ${stock===0 ? 'opacity-60 grayscale cursor-not-allowed bg-stone-100' : 'active:scale-95'}`}>
                         <div className="flex justify-between items-start w-full">
                             <span className={`text-[9px] lg:text-[10px] px-2 py-1 rounded-md lg:rounded-full font-black uppercase tracking-wider shadow-sm ${stock>0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                 {stock > 0 ? `Stok: ${stock}` : 'Habis'}
                             </span>
                         </div>
                         
                         {/* FIX 1 (Lingkaran Biru): Tag gambar ditambahkan. Kode base64 tidak akan tercetak lagi sebagai teks rusak, melainkan menjadi thumbnail estetik (aspect-[4/3]) */}
                         <div className="w-full aspect-[4/3] mt-3 mb-2 rounded-xl flex items-center justify-center overflow-hidden bg-stone-50 group-hover:scale-105 transition-transform duration-300">
                             {p.image?.startsWith('http') || p.image?.startsWith('data:') ? (
                                 <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=?'; }} />
                             ) : (
                                 <span className="text-4xl lg:text-5xl xl:text-6xl drop-shadow-sm">{p.image || '🍽️'}</span>
                             )}
                         </div>

                         {/* FIX (Lingkaran Biru): Menggunakan line-clamp-2 agar jika nama sangat panjang akan dibungkus rapi menjadi 2 baris dan tidak merusak layout */}
                         <div className="text-center w-full mt-auto pt-1">
                             <h4 className="font-bold text-stone-800 text-xs lg:text-sm leading-tight mb-0.5 line-clamp-2 px-1" title={p.name}>{p.name}</h4>
                             <p className="text-red-600 font-black text-sm lg:text-base mt-1">Rp {p.price.toLocaleString()}</p>
                         </div>
                      </div>
                   )
                })}
             </div>
          </div>
          
          {cartCount > 0 && (
             <div className="lg:hidden absolute bottom-4 left-4 right-4 z-20">
                <button onClick={() => setMobileTab('cart')} className="w-full bg-stone-900 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-4">
                   <div className="flex items-center gap-3"><div className="bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs">{cartCount}</div><span className="font-bold text-sm">Lihat Pesanan</span></div>
                   {/* Teks Harga dihapus agar tidak terlihat di awal */}
                   <span className="font-black text-red-500">Proses <ArrowRight size={16} className="inline ml-1"/></span>
                </button>
             </div>
          )}
       </div>

       {/* CART COLUMN */}
       <div className={`${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'} h-full w-full lg:w-[380px] bg-white border border-stone-200 rounded-3xl shadow-2xl flex-col overflow-hidden relative animate-in slide-in-from-right-8 lg:animate-none duration-200`}>
          <div className="p-3 lg:p-6 bg-stone-900 text-white shadow-md z-10 shrink-0">
             <div className="lg:hidden mb-4"><button onClick={() => setMobileTab('menu')} className="text-stone-400 hover:text-white flex items-center gap-2 font-bold text-sm"><ArrowLeft size={16}/> Kembali ke Menu</button></div>
             <div className="flex justify-between items-center mb-2 lg:mb-4"><h3 className="font-black text-base lg:text-xl flex items-center gap-2"><ShoppingCart className="text-red-500" size={18}/> Order</h3><span className="bg-stone-800 px-3 py-1 rounded-lg text-[10px] lg:text-xs font-bold text-stone-400">{cartCount} Items</span></div>
             <div className="space-y-2 lg:space-y-3">
                <div className="grid grid-cols-2 gap-2 mb-2"><button onClick={() => setOrderType('Dine In')} className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${orderType === 'Dine In' ? 'bg-red-700 text-white shadow-lg scale-[1.02]' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}><Coffee size={16}/> DINE IN</button><button onClick={() => setOrderType('Take Away')} className={`p-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all ${orderType === 'Take Away' ? 'bg-red-700 text-white shadow-lg scale-[1.02]' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}><ShoppingBag size={16}/> TAKE AWAY</button></div>
                <div className="grid grid-cols-4 gap-2"><button onClick={()=>setOrderSource('Umum')} className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] font-bold flex flex-col items-center gap-1 transition-all border border-transparent hover:border-stone-500"><Utensils size={14}/><span>Umum</span></button><button onClick={()=>setOrderSource('GoFood')} className="p-2 rounded-xl bg-green-900/40 hover:bg-green-800/40 text-green-400 border border-green-900 hover:border-green-500 text-[10px] font-bold flex flex-col items-center gap-1 transition-all"><Bike size={14}/><span>Gojek</span></button><button onClick={()=>setOrderSource('GrabFood')} className="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/40 text-emerald-400 border border-emerald-900 hover:border-emerald-500 text-[10px] font-bold flex flex-col items-center gap-1 transition-all"><Bike size={14}/><span>Grab</span></button><button onClick={()=>setOrderSource('ShopeeFood')} className="p-2 rounded-xl bg-orange-900/40 hover:bg-orange-800/40 text-orange-400 border border-orange-900 hover:border-orange-500 text-[10px] font-bold flex flex-col items-center gap-1 transition-all"><Store size={14}/><span>Shopee</span></button></div>
                <input className="w-full bg-stone-800 border-none rounded-xl p-2.5 lg:p-4 text-xs lg:text-sm text-white placeholder-stone-500 font-bold focus:ring-1 focus:ring-red-600 outline-none transition-all" placeholder="Nama Pelanggan" value={customer} onChange={e=>setCustomer(e.target.value)} />
                <div className="flex items-center justify-between bg-stone-800 p-1.5 lg:p-2 rounded-xl pl-3 lg:pl-4"><div className="flex items-center gap-2 text-stone-400 text-xs lg:text-sm font-bold"><Users size={14}/> Pax</div><div className="flex items-center gap-2 lg:gap-3 bg-stone-900 p-1 rounded-lg"><button onClick={()=>setPax(Math.max(1, pax-1))} className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-stone-700 hover:bg-stone-600 rounded-md text-white font-bold transition-colors"><Minus size={12}/></button><span className="font-black text-white w-6 text-center text-xs lg:text-sm">{pax}</span><button onClick={()=>setPax(pax+1)} className="w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-red-700 hover:bg-red-800 rounded-md text-white font-bold transition-colors"><Plus size={12}/></button></div></div>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 lg:space-y-3 bg-stone-50">
             {cart.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-stone-400 pb-10"><ShoppingBasket size={48} className="opacity-20 mb-4"/><p className="text-xs font-bold uppercase tracking-widest opacity-50">Keranjang Kosong</p></div>
             ) : (
                 cart.map(c => (
                     <div key={c.cartId} className="bg-white p-2.5 lg:p-3 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-2">
                         <div className="flex justify-between items-center">
                             <div className="flex-1 overflow-hidden mr-2 lg:mr-3">
                                 <h4 className="font-bold text-stone-800 truncate text-xs lg:text-sm">{c.name}</h4>
                                 {/* Optional: Bisa kamu hapus juga Rp {c.price} di sini jika ingin total harga setiap item disembunyikan */}
                                 <p className="text-[10px] lg:text-xs text-red-600 font-black mt-0.5">Rp {c.price.toLocaleString()}</p>
                             </div>
                             <div className="flex items-center gap-1 lg:gap-2 bg-stone-100 rounded-xl p-1 shrink-0">
                                 <button onClick={()=>updateQty(c.cartId, -1, c.id)} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center bg-white shadow-sm rounded-lg text-stone-600 hover:text-red-600 font-bold transition-colors"><Minus size={12}/></button>
                                 <span className="font-black text-stone-800 w-5 lg:w-6 text-center text-xs lg:text-sm">{c.qty}</span>
                                 <button onClick={()=>updateQty(c.cartId, 1, c.id)} className="w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center bg-stone-900 shadow-sm rounded-lg text-white hover:bg-black font-bold transition-colors"><Plus size={12}/></button>
                             </div>
                         </div>
                         <div className="relative">
                             <FileText size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-300"/>
                             <input 
                                 type="text" 
                                 placeholder="Note: cth. Pedas, Tanpa Es..." 
                                 className="w-full pl-6 pr-2 py-1.5 text-[10px] lg:text-xs bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-red-600 focus:bg-white transition-colors"
                                 value={c.note || ''}
                                 onChange={(e) => updateNote(c.cartId, e.target.value)}
                             />
                         </div>
                     </div>
                 ))
             )}
          </div>

          <div className="p-4 lg:p-6 bg-white border-t border-stone-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10 shrink-0">
             {/* Total yang sebelumnya disini telah dihapus sesuai permintaanmu */}
             <button 
                onClick={() => setShowPaymentModal(true)} 
                disabled={cart.length===0} 
                className="w-full py-4 lg:py-5 bg-red-700 hover:bg-red-800 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-2xl font-black text-sm lg:text-lg transition-all active:scale-95 shadow-xl shadow-red-900/20 disabled:shadow-none flex items-center justify-center gap-2"
             >
                <CheckCircle size={18} className="text-white/50"/> CHECKOUT PESANAN
             </button>
          </div>
       </div>
    </div>
  );
};

export default POSView;