import React, { useState, useMemo, useEffect } from 'react';
import { Package, Plus, Trash2, X, Lock, ShieldAlert, UtensilsCrossed, ArrowUpCircle, Save, AlertTriangle, Search, ChevronDown, ChevronRight, History, Edit2, DollarSign, Calculator, Camera } from 'lucide-react';

// --- SUB-COMPONENT: MODAL DETAIL PRODUK & EDIT HARGA ---
const ProductDetailModal = ({ product, ingredients, onClose, onUpdate, canEdit }) => {
    const [editMode, setEditMode] = useState(false);
    const [targetMargin, setTargetMargin] = useState(0);
    const [newPrice, setNewPrice] = useState(product.price);

    const currentHPP = useMemo(() => {
        if (!product.recipe) return 0;
        return product.recipe.reduce((total, item) => {
            let ing = ingredients.find(i => String(i.id) === String(item.ingredientId));
            if (!ing && item.ingredientName) {
                ing = ingredients.find(i => i.name.toLowerCase() === item.ingredientName.toLowerCase());
            }
            const cost = ing ? (parseFloat(ing.costPerUnit) || 0) : 0;
            return total + (cost * parseFloat(item.qty));
        }, 0);
    }, [product, ingredients]);

    const currentProfitRp = product.price - currentHPP;
    const currentMarginPercent = currentHPP > 0 ? (currentProfitRp / currentHPP) * 100 : 0;

    useEffect(() => {
        if (editMode) {
            const marginAmount = currentHPP * (parseFloat(targetMargin) / 100);
            const basePrice = currentHPP + marginAmount + 1000; 
            const rounded = Math.ceil(basePrice / 100) * 100; 
            setNewPrice(rounded);
        }
    }, [targetMargin, currentHPP, editMode]);

    const handleSave = () => {
        if (onUpdate) {
            onUpdate(product.id, { price: newPrice });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                        {product.image?.startsWith('http') || product.image?.startsWith('data:') ? (
                            <img src={product.image} alt={product.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                            <span className="text-2xl">{product.image || '🍽️'}</span>
                        )}
                        {product.name}
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-600"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><UtensilsCrossed size={12}/> Rincian Bahan (Resep)</h4>
                        <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100 text-slate-600 font-bold">
                                    <tr>
                                        <th className="p-3 pl-4">Bahan</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right pr-4">Biaya</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {product.recipe && product.recipe.map((r, idx) => {
                                        let ing = ingredients.find(i => String(i.id) === String(r.ingredientId));
                                        let isFallback = false;
                                        if (!ing && r.ingredientName) {
                                            ing = ingredients.find(i => i.name.toLowerCase() === r.ingredientName.toLowerCase());
                                            isFallback = true;
                                        }
                                        const cost = ing ? (parseFloat(ing.costPerUnit) || 0) * r.qty : 0;
                                        return (
                                            <tr key={idx}>
                                                <td className="p-3 pl-4 font-bold text-slate-700">
                                                    {ing ? (
                                                        <>{ing.name} {isFallback && <span className="ml-1 text-[9px] text-red-600 bg-red-50 px-1 rounded font-bold border border-red-100">(Re-linked)</span>}</>
                                                    ) : (
                                                        <span className="text-red-500 italic flex items-center gap-1"><AlertTriangle size={10}/> Bahan Terhapus</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center text-slate-500 font-medium">{r.qty} {ing?.unit}</td>
                                                <td className="p-3 text-right pr-4 font-mono text-slate-600">Rp {cost.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-slate-200/50 font-bold text-slate-800">
                                    <tr>
                                        <td colSpan={2} className="p-3 pl-4">Total HPP (Modal Bahan)</td>
                                        <td className="p-3 text-right pr-4 font-mono text-red-600">Rp {currentHPP.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-xl bg-slate-50 border-slate-200">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Harga Jual Saat Ini</p>
                            <p className="text-2xl font-black text-slate-800">Rp {product.price.toLocaleString()}</p>
                        </div>
                        <div className={`p-4 border rounded-xl ${currentProfitRp > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <p className={`text-[10px] uppercase font-bold mb-1 ${currentProfitRp > 0 ? 'text-emerald-600' : 'text-red-600'}`}>Profit / Porsi</p>
                            <div className="flex items-end gap-2">
                                <p className={`text-2xl font-black ${currentProfitRp > 0 ? 'text-emerald-700' : 'text-red-700'}`}>Rp {currentProfitRp.toLocaleString()}</p>
                                <span className="text-xs font-bold mb-1 opacity-60">({Math.round(currentMarginPercent)}%)</span>
                            </div>
                        </div>
                    </div>
                    
                    {canEdit && (
                        !editMode ? (
                            <button onClick={() => setEditMode(true)} className="w-full py-4 border-2 border-slate-100 bg-white text-slate-700 font-bold rounded-xl hover:border-slate-800 hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                                <Edit2 size={18}/> Edit Harga Jual
                            </button>
                        ) : (
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2"><Calculator size={18}/> Simulasi Harga Baru</h4>
                                    <button onClick={() => setEditMode(false)} className="text-xs text-red-600 font-bold hover:underline">Batal</button>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Target Profit Margin (%)</label>
                                    <div className="relative">
                                        <input type="number" className="w-full p-3 border rounded-xl font-bold text-slate-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500" placeholder="0" value={targetMargin} onChange={e => setTargetMargin(e.target.value)} autoFocus />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Harga Jual Baru (Editable)</label>
                                    <input type="number" className="w-full p-3 border border-emerald-200 bg-emerald-50 rounded-xl font-black text-emerald-700 outline-none focus:border-emerald-500" value={newPrice} onChange={e => setNewPrice(parseInt(e.target.value))} />
                                    <p className="text-[10px] text-slate-400 text-right mt-1 font-medium">*Rekomendasi: Modal + Profit + 1000</p>
                                </div>
                                <button onClick={handleSave} className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 flex items-center justify-center gap-2 mt-2"><Save size={18}/> Simpan Harga Baru</button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT UTAMA ---
const InventoryView = ({ 
  ingredients, onAddIngredient, onUpdateIngredient, onDeleteIngredient, 
  products, onAddProduct, onDeleteProduct, showNotification, currentUser, askConfirm,
  onUpdateProduct 
}) => {
  const [viewMode, setViewMode] = useState('stock'); 
  const [isAdding, setIsAdding] = useState(false);
  const [quickAddStock, setQuickAddStock] = useState({});
  const [expandedId, setExpandedId] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchIng, setSearchIng] = useState('');
  const [searchProd, setSearchProd] = useState('');

  const initialIngState = { name: '', unit: 'gr', purchasePrice: '', stock: '', supplier: '' };
  const [newIng, setNewIng] = useState(initialIngState);
  
  const [newProductData, setNewProductData] = useState({ name: '', price: 0, category: 'Minuman', image: '☕' });
  const [tempRecipeBuilder, setTempRecipeBuilder] = useState([]);
  const [builderIngId, setBuilderIngId] = useState('');
  const [builderQty, setBuilderQty] = useState('');
  const [profitMargin, setProfitMargin] = useState(0); 

  const isOwner = currentUser?.role === 'owner';
  const isAdminOnShift = currentUser?.role === 'admin' && currentUser?.isShiftActive;
  const isInvestor = currentUser?.role === 'investor';

  const canEdit = isOwner || isAdminOnShift;

  const totalRecipeCost = useMemo(() => {
    return tempRecipeBuilder.reduce((total, item) => {
        let ing = ingredients.find(x => String(x.id) === String(item.ingredientId));
        if (!ing && item.ingredientName) {
            ing = ingredients.find(i => i.name.toLowerCase() === item.ingredientName.toLowerCase());
        }
        const cost = ing ? (parseFloat(ing.costPerUnit) || 0) : 0;
        return total + (cost * parseFloat(item.qty));
    }, 0);
  }, [tempRecipeBuilder, ingredients]);

  useEffect(() => {
    if (viewMode === 'recipes' && isAdding) {
        const marginPercent = parseFloat(profitMargin) || 0;
        const profitAmount = totalRecipeCost * (marginPercent / 100);
        const basePrice = totalRecipeCost + profitAmount;
        const priceWithService = basePrice + 1000;
        const roundedPrice = Math.ceil(priceWithService / 100) * 100;
        setNewProductData(prev => ({ ...prev, price: roundedPrice }));
    }
  }, [totalRecipeCost, profitMargin, viewMode, isAdding]);

  const displayedIngredients = useMemo(() => {
    return ingredients.filter(ing => ing.name.toLowerCase().includes(searchIng.toLowerCase()));
  }, [ingredients, searchIng]);

  const displayedProducts = useMemo(() => {
    return products.filter(prod => prod.name.toLowerCase().includes(searchProd.toLowerCase()));
  }, [products, searchProd]);

  if (!isOwner && !isAdminOnShift && !isInvestor) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
               <Lock size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Gudang Terkunci</h2>
            <p className="text-gray-500 max-w-md mb-6">
               {currentUser?.role === 'admin' 
                 ? "Anda belum melakukan Check-In. Silakan absen masuk terlebih dahulu di menu Monitoring." 
                 : "Anda tidak memiliki akses ke halaman ini."}
            </p>
        </div>
      );
  }

  const handleQuickAddStock = async (id) => {
    const amount = parseFloat(quickAddStock[id]);
    if (!amount || isNaN(amount)) return;
    
    const ing = ingredients.find(i => String(i.id) === String(id));
    if(ing) {
        const newStock = (parseFloat(ing.stock) || 0) + amount;
        await onUpdateIngredient(id, { stock: newStock });
        setQuickAddStock(prev => ({ ...prev, [id]: '' }));
        showNotification(`Stok ${ing.name} bertambah ${amount}`);
    }
  };

  const handleSaveIngredient = (e) => {
      e.preventDefault();
      if(!newIng.name) return showNotification('Nama bahan wajib diisi', 'error');
      
      const totalInputPrice = parseFloat(newIng.purchasePrice) || 0; 
      const inputStock = parseFloat(newIng.stock) || 0;             
      const supplierName = newIng.supplier || 'Umum';

      const batchCostPerUnit = inputStock > 0 ? (totalInputPrice / inputStock) : 0;

      const newBatch = {
          id: Date.now(),
          date: new Date().toLocaleDateString('id-ID'),
          supplier: supplierName,
          qty: inputStock,
          total: totalInputPrice,
          costPerUnit: batchCostPerUnit
      };

      const existingIng = ingredients.find(
        (ing) => ing.name.trim().toLowerCase() === newIng.name.trim().toLowerCase()
      );

      if (existingIng) {
          const currentStock = parseFloat(existingIng.stock) || 0;
          const currentAvgCost = parseFloat(existingIng.costPerUnit) || 0;
          const currentAssetValue = currentStock * currentAvgCost;

          const newTotalStock = currentStock + inputStock;
          const newTotalAssetValue = currentAssetValue + totalInputPrice;

          const newAverageCost = newTotalStock > 0 ? (newTotalAssetValue / newTotalStock) : 0;

          let currentBatches = existingIng.batches || [];
          const updatedBatches = [...currentBatches, newBatch];

          onUpdateIngredient(existingIng.id, {
              stock: newTotalStock,
              costPerUnit: newAverageCost, 
              unit: newIng.unit || existingIng.unit,
              batches: updatedBatches 
          });
          
          showNotification(`Stok ${existingIng.name} bertambah. HPP disesuaikan.`);
      } else {
          onAddIngredient({
            name: newIng.name.trim(), 
            stock: inputStock,
            costPerUnit: batchCostPerUnit,
            unit: newIng.unit,
            batches: [newBatch] 
          });
      }

      setIsAdding(false);
      setNewIng(initialIngState);
  };

  const handleSaveProduct = (e) => {
      e.preventDefault();
      if(!newProductData.name) return showNotification('Nama menu wajib diisi', 'error');
      if(newProductData.price <= 0) return showNotification('Harga jual belum terbentuk', 'error');

      onAddProduct({ ...newProductData, recipe: tempRecipeBuilder });
      setIsAdding(false);
      setNewProductData({ name: '', price: 0, category: 'Minuman', image: '☕' });
      setTempRecipeBuilder([]);
      setProfitMargin(0); 
      showNotification('Menu & Resep Berhasil Disimpan');
  };

  const addIngredientToRecipe = () => {
      if(builderIngId && builderQty) { 
          if(tempRecipeBuilder.some(r => String(r.ingredientId) === String(builderIngId))) {
              return showNotification('Bahan ini sudah ada di resep', 'error');
          }
          
          const selectedIng = ingredients.find(i => String(i.id) === String(builderIngId));
          const ingName = selectedIng ? selectedIng.name : '';

          setTempRecipeBuilder([...tempRecipeBuilder, {
              ingredientId: String(builderIngId), 
              qty: parseFloat(builderQty),
              ingredientName: ingName 
          }]); 

          setBuilderIngId(''); 
          setBuilderQty(''); 
      }
  };

  // --- LAYOUT UTAMA ---
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in relative max-w-7xl mx-auto w-full">
      
      {selectedProduct && (
          <ProductDetailModal 
              product={selectedProduct} 
              ingredients={ingredients} 
              onClose={() => setSelectedProduct(null)} 
              onUpdate={onUpdateProduct} 
              canEdit={canEdit}
          />
      )}

      {/* HEADER: Penataan Seimbang & Responsive Content */}
      <div className="p-4 md:p-6 border-b flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
        
        {/* JUDUL */}
        <h2 className="font-black flex gap-2 text-lg md:text-xl text-slate-800 uppercase tracking-tighter items-center justify-center md:justify-start w-full md:w-auto">
            <Package className="text-red-700" size={24}/> Manajemen Data
        </h2>
        
        {/* TOMBOL NAVIGASI - Responsive Text/Icon */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 justify-center md:justify-end no-scrollbar">
           {canEdit && (
               <button onClick={() => setIsAdding(!isAdding)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex-1 md:flex-none flex items-center justify-center ${isAdding ? 'bg-slate-200 text-slate-700' : 'bg-red-700 text-white shadow-lg hover:bg-red-800 active:scale-95'}`}>
                 <span className="md:hidden">
                    {isAdding ? <X size={18}/> : <Plus size={18}/>}
                 </span>
                 <span className="hidden md:inline">
                    {isAdding ? 'Batal' : (viewMode === 'stock' ? '+ Pembelian / Stok' : '+ Menu Baru')}
                 </span>
               </button>
           )}
           <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden p-1 shadow-sm flex-1 md:flex-none min-w-max">
             <button onClick={() => { setViewMode('stock'); setIsAdding(false); }} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${viewMode==='stock' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}>
                <span className="md:hidden">Bahan</span>
                <span className="hidden md:inline">Master Bahan</span>
             </button>
             <button onClick={() => { setViewMode('recipes'); setIsAdding(false); }} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${viewMode==='recipes' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}>
                <span className="md:hidden">Recipe</span>
                <span className="hidden md:inline">Menu & Resep</span>
             </button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
        
        {isAdding && canEdit && viewMode === 'stock' && (
          <form onSubmit={handleSaveIngredient} className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
             <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={18}/> Input Pembelian Bahan</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="space-y-1 lg:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase">Nama Bahan</label><input className="w-full p-3 border rounded-xl text-sm border-gray-300 focus:ring-2 focus:ring-red-600 outline-none transition-all" value={newIng.name} onChange={e=>setNewIng({...newIng, name:e.target.value})} placeholder="Cth: Kopi" autoFocus /></div>
                 <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Supplier / Toko</label><input className="w-full p-3 border rounded-xl text-sm" value={newIng.supplier} onChange={e=>setNewIng({...newIng, supplier:e.target.value})} placeholder="Cth: Toko A" /></div>
                 <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Total Stok Dibeli</label><div className="flex"><input type="number" className="w-full p-3 border rounded-l-xl text-sm" value={newIng.stock} onChange={e=>setNewIng({...newIng, stock:e.target.value})} placeholder="1000" /><input className="w-16 p-3 border-y border-r rounded-r-xl text-sm bg-slate-50 text-center" value={newIng.unit} onChange={e=>setNewIng({...newIng, unit:e.target.value})} placeholder="gr" /></div></div>
                 <div className="space-y-1 lg:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase">Total Harga (Struk)</label><input type="number" className="w-full p-3 border rounded-xl text-sm font-bold text-slate-800" value={newIng.purchasePrice} onChange={e=>setNewIng({...newIng, purchasePrice:e.target.value})} placeholder="Rp..." /></div>
             </div>
             <button className="mt-4 w-full py-4 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold uppercase text-xs transition-colors shadow-lg flex items-center justify-center gap-2 active:scale-95"><Save size={16}/> Simpan Transaksi Pembelian</button>
          </form>
        )}

        {isAdding && canEdit && viewMode === 'recipes' && (
            <div className="mb-8 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-md space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="font-bold text-xs uppercase text-slate-500">Nama Menu</label>
                            <input className="w-full p-3 border rounded-xl focus:ring-1 focus:ring-red-500 outline-none" value={newProductData.name} onChange={e=>setNewProductData({...newProductData, name:e.target.value})} placeholder="Nama Menu..." />
                        </div>
                        <div className="space-y-2">
                            <label className="font-bold text-xs uppercase text-slate-500">Gambar / Foto Menu</label>
                            <div className="flex gap-2">
                                <input 
                                    className="flex-1 p-3 border rounded-xl focus:ring-1 focus:ring-red-500 outline-none" 
                                    value={newProductData.image} 
                                    onChange={e => {
                                        let val = e.target.value;
                                        // Auto-konversi link Google Drive ke format Direct Image
                                        const gdriveMatch = val.match(/\/file\/d\/([-\w]+)/) || val.match(/\/open\?id=([-\w]+)/);
                                        if (gdriveMatch && gdriveMatch[1]) {
                                            val = `https://drive.google.com/uc?export=view&id=${gdriveMatch[1]}`;
                                        }
                                        setNewProductData({...newProductData, image: val});
                                    }} 
                                    placeholder="Masukkan link foto / GDrive..." 
                                />
                                
                                {/* Tombol Kamera Native yang otomatis mengompres foto */}
                                <label className="bg-stone-100 hover:bg-stone-200 text-stone-600 p-3 rounded-xl cursor-pointer flex items-center justify-center transition-colors shadow-sm border border-stone-200" title="Ambil dari Kamera">
                                    <Camera size={20} />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        capture="environment" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            
                                            // Proses Kompresi Gambar agar database aman
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const img = new Image();
                                                img.onload = () => {
                                                    const canvas = document.createElement('canvas');
                                                    const MAX_WIDTH = 300; // Lebar maksimal gambar 300px
                                                    const scaleSize = MAX_WIDTH / img.width;
                                                    canvas.width = MAX_WIDTH;
                                                    canvas.height = img.height * scaleSize;
                                                    
                                                    const ctx = canvas.getContext('2d');
                                                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                                                    
                                                    // Simpan sebagai Base64 dengan kualitas 70%
                                                    setNewProductData({ 
                                                        ...newProductData, 
                                                        image: canvas.toDataURL('image/jpeg', 0.7) 
                                                    });
                                                };
                                                img.src = event.target.result;
                                            };
                                            reader.readAsDataURL(file);
                                        }} 
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-bold text-xs uppercase text-slate-500">Profit Margin (%)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-full p-3 border rounded-xl font-bold text-slate-800 focus:ring-1 focus:ring-red-500 outline-none" 
                                    value={profitMargin} 
                                    onChange={e=>setProfitMargin(e.target.value)} 
                                    placeholder="0" 
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                            </div>
                            <p className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                               HPP/Modal: Rp {totalRecipeCost.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="font-bold text-xs uppercase text-emerald-600">Rekomendasi Harga</label>
                            <div className="w-full p-3 border border-emerald-200 bg-emerald-50 rounded-xl flex flex-col justify-center">
                                <span className="text-emerald-700 font-black text-lg">
                                    Rp {newProductData.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[9px] text-emerald-500 font-bold leading-none">
                                    (Modal + Profit + 1000)
                                </span>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h4 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
                        <UtensilsCrossed size={14}/> Racik Resep
                    </h4>
                    <div className="flex flex-col md:flex-row gap-2">
                        <select className="flex-1 p-2.5 border rounded-lg bg-slate-50 text-sm font-medium focus:border-red-500 outline-none" value={builderIngId} onChange={e=>setBuilderIngId(e.target.value)}>
                            <option value="">-- Pilih Bahan Baku --</option>
                            {ingredients.map(i=><option key={i.id} value={i.id}>{i.name} ({i.stock} {i.unit})</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input type="number" placeholder="Qty" className="w-20 md:w-24 p-2.5 border rounded-lg text-sm text-center focus:border-red-500 outline-none" value={builderQty} onChange={e=>setBuilderQty(e.target.value)} />
                            <button onClick={addIngredientToRecipe} className="p-2.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors flex-1 md:flex-none flex items-center justify-center"><Plus size={18}/></button>
                        </div>
                    </div>
                    
                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg min-h-[50px]">
                        {tempRecipeBuilder.map((r, i) => {
                            let ing = ingredients.find(x=>String(x.id)===String(r.ingredientId));
                            if (!ing && r.ingredientName) {
                                ing = ingredients.find(i => i.name.toLowerCase() === r.ingredientName.toLowerCase());
                            }

                            const costPerUnit = parseFloat(ing?.costPerUnit) || 0;
                            const subtotal = costPerUnit * r.qty; 
                            
                            return (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{ing?.name || r.ingredientName}</span>
                                        <span className="text-[10px] text-blue-600 font-mono bg-blue-50 px-1 rounded w-fit mt-0.5">
                                            Rp {subtotal.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-bold">{r.qty} {ing?.unit}</span>
                                        <button onClick={()=>setTempRecipeBuilder(tempRecipeBuilder.filter((_,idx)=>idx!==i))} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <button onClick={handleSaveProduct} className="w-full py-3 bg-red-700 text-white rounded-xl font-bold uppercase text-xs hover:bg-red-800 transition-colors shadow-lg active:scale-95">Simpan Menu</button>
                 </div>
            </div>
        )}

        {viewMode === 'stock' ? (
          <div className="space-y-4">
            
            {!isAdding && (
               <div className="relative w-full md:w-80 mx-auto md:mx-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                  <input 
                     type="text" 
                     placeholder="Cari Master Bahan..." 
                     className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-sm transition-all"
                     value={searchIng}
                     onChange={e => setSearchIng(e.target.value)}
                  />
               </div>
            )}

            {/* CARD GRID (MOBILE/TABLET) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {displayedIngredients.map((ing) => {
                    const totalAssetValue = (parseFloat(ing.costPerUnit) || 0) * (parseFloat(ing.stock) || 0);
                    return (
                        <div key={ing.id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-800">{ing.name}</h4>
                                    <p className="text-[10px] text-slate-400">ID: {ing.id.substring(0,8)}...</p>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${parseFloat(ing.stock) < 100 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {parseFloat(ing.stock).toLocaleString()} {ing.unit}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-slate-50">
                                <span className="text-slate-500">Nilai Aset:</span>
                                <span className="font-mono font-bold text-emerald-600">Rp {totalAssetValue.toLocaleString('id-ID')}</span>
                            </div>
                            {canEdit && (
                                <div className="flex gap-2 mt-2">
                                    <div className="flex-1 flex items-center border rounded-lg overflow-hidden">
                                        <input type="number" placeholder="+" className="w-full p-2 text-xs outline-none focus:bg-slate-50" value={quickAddStock[ing.id]||''} onChange={e=>setQuickAddStock({...quickAddStock, [ing.id]:e.target.value})} />
                                        <button onClick={()=>handleQuickAddStock(ing.id)} className="bg-slate-900 text-white p-2 hover:bg-black"><Plus size={14}/></button>
                                    </div>
                                    <button onClick={() => askConfirm ? askConfirm('Hapus bahan?', () => onDeleteIngredient(ing.id)) : onDeleteIngredient(ing.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100"><Trash2 size={16}/></button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* TABLE (DESKTOP) */}
            <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4 w-10 text-center"></th> 
                    <th className="p-4">Nama Bahan</th>
                    <th className="p-4">Total Nilai Aset</th>
                    <th className="p-4 text-center">Total Stok</th>
                    {canEdit && <th className="p-4 text-center">Penyesuaian</th>}
                    {canEdit && <th className="p-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {displayedIngredients.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-400 italic">Data bahan tidak ditemukan.</td></tr>
                  ) : displayedIngredients.map((ing) => {
                    const isExpanded = expandedId === ing.id;
                    const totalAssetValue = (parseFloat(ing.costPerUnit) || 0) * (parseFloat(ing.stock) || 0);

                    return (
                    <React.Fragment key={ing.id}>
                      <tr 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : ing.id)}
                      >
                        <td className="p-4 text-center text-slate-400">
                            {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        </td>
                        <td className="p-4">
                            <div className="font-bold text-slate-800">{ing.name}</div>
                            <div className="text-[10px] text-gray-400">Klik untuk lihat riwayat</div>
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-700">
                            Rp {totalAssetValue.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-center">
                           <div className={`inline-flex flex-col items-center px-3 py-1 rounded-lg border ${parseFloat(ing.stock) < 100 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                             <span className="font-black text-sm">{parseFloat(ing.stock).toLocaleString()}</span>
                             <span className="text-[9px] uppercase font-bold opacity-70">{ing.unit}</span>
                           </div>
                        </td>
                        <td className="p-4" onClick={e=>e.stopPropagation()}>
                           {canEdit && (
                               <div className="flex items-center justify-center gap-1">
                                   <input type="number" placeholder="Jml.." className="w-16 p-2 border border-slate-300 rounded-l-lg text-center text-xs font-bold focus:outline-none focus:border-red-500" value={quickAddStock[ing.id]||''} onChange={e=>setQuickAddStock({...quickAddStock, [ing.id]:e.target.value})} />
                                   <button onClick={()=>handleQuickAddStock(ing.id)} className="bg-slate-900 hover:bg-black text-white p-2 rounded-r-lg transition-colors flex items-center justify-center" title="Penyesuaian Stok Cepat"><Plus size={14}/></button>
                               </div>
                           )}
                        </td>
                        <td className="p-4 text-center" onClick={e=>e.stopPropagation()}>
                            {canEdit && (
                                <button 
                                  onClick={() => askConfirm ? askConfirm('Hapus bahan ini permanen?', () => onDeleteIngredient(ing.id)) : onDeleteIngredient(ing.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 size={16}/>
                                </button>
                            )}
                        </td>
                      </tr>
                      
                      {isExpanded && (
                          <tr className="bg-slate-50">
                              <td colSpan="6" className="p-4 shadow-inner">
                                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                          <History size={14}/> Riwayat Pembelian & Batch
                                      </div>
                                      <table className="w-full text-xs text-left">
                                          <thead className="bg-white text-slate-400 border-b">
                                              <tr>
                                                  <th className="p-3">Tanggal</th>
                                                  <th className="p-3">Supplier</th>
                                                  <th className="p-3 text-center">Jumlah Beli</th>
                                                  <th className="p-3 text-right">Total Bayar</th>
                                                  <th className="p-3 text-right">Harga/Satuan</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                              {ing.batches && ing.batches.length > 0 ? (
                                                  [...ing.batches].reverse().map((batch, bIdx) => (
                                                      <tr key={bIdx} className="hover:bg-blue-50">
                                                          <td className="p-3 font-mono text-slate-500">{batch.date}</td>
                                                          <td className="p-3 font-bold text-slate-700">{batch.supplier}</td>
                                                          <td className="p-3 text-center bg-slate-50 font-bold text-slate-700">{batch.qty} {ing.unit}</td>
                                                          <td className="p-3 text-right font-mono">Rp {(parseFloat(batch.total)||0).toLocaleString()}</td>
                                                          <td className="p-3 text-right font-mono text-slate-500">@ Rp {(parseFloat(batch.costPerUnit)||0).toLocaleString()}</td>
                                                      </tr>
                                                  ))
                                              ) : (
                                                  <tr><td colSpan="5" className="p-4 text-center text-slate-400 italic">Belum ada data batch detail.</td></tr>
                                              )}
                                          </tbody>
                                      </table>
                                  </div>
                              </td>
                          </tr>
                      )}
                    </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             {!isAdding && (
                 /* SEARCH BAR: Center di Mobile */
                 <div className="relative w-full md:w-80 mx-auto md:mx-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                       type="text" 
                       placeholder="Cari Menu..." 
                       className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-sm transition-all"
                       value={searchProd}
                       onChange={e => setSearchProd(e.target.value)}
                    />
                 </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {displayedProducts.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-gray-400 italic">Menu tidak ditemukan.</div>
               ) : displayedProducts.map(p => (
                 <div 
                    key={p.id} 
                    onClick={() => setSelectedProduct(p)} 
                    className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-300 cursor-pointer active:scale-95"
                 >
                    {canEdit && (
                        <button onClick={(e) => {
                            e.stopPropagation(); 
                            askConfirm ? askConfirm('Hapus menu ini?', ()=>onDeleteProduct(p.id)) : onDeleteProduct(p.id)
                        }} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16}/>
                        </button>
                    )}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner text-slate-800 overflow-hidden shrink-0">
                            {p.image?.startsWith('http') || p.image?.startsWith('data:') ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=Img'; }} />
                            ) : (
                                p.image || '🍽️'
                            )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
                          <p className="text-red-600 font-black text-xl">Rp {p.price.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                          <UtensilsCrossed size={12}/> {p.recipe?.length || 0} Bahan Baku
                        </span>
                        <div className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded">Klik untuk detail</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryView;