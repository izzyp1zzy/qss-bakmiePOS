import React, { useState, useMemo, useEffect } from 'react';
import { Package, Plus, Trash2, X, Lock, ShieldAlert, UtensilsCrossed, ArrowUpCircle, Save, AlertTriangle } from 'lucide-react';

const InventoryView = ({ 
  ingredients, onAddIngredient, onUpdateIngredient, onDeleteIngredient, 
  products, onAddProduct, onDeleteProduct, showNotification, currentUser 
}) => {
  const [viewMode, setViewMode] = useState('stock'); 
  const [isAdding, setIsAdding] = useState(false);
  const [quickAddStock, setQuickAddStock] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); 

  // --- STATE BAHAN BAKU (KATEGORI DIHAPUS) ---
  const initialIngState = { 
    name: '', 
    // category dihapus
    unit: 'gr', 
    packSize: '', 
    purchasePrice: '', 
    stock: '' 
  };
  const [newIng, setNewIng] = useState(initialIngState);
  
  const [newProductData, setNewProductData] = useState({ name: '', price: 0, category: 'Minuman', image: '☕' });
  const [tempRecipeBuilder, setTempRecipeBuilder] = useState([]);
  const [builderIngId, setBuilderIngId] = useState('');
  const [builderQty, setBuilderQty] = useState('');

  // --- LOGIKA SMARTLOCK ---
  const isOwner = currentUser?.role === 'owner';
  const isAdminOnShift = currentUser?.role === 'admin' && currentUser?.isShiftActive;
  
  // --- LOGIKA HITUNG HARGA OTOMATIS (BARU) ---
  // 1. Hitung total modal (HPP) berdasarkan bahan di resep
  const totalRecipeCost = useMemo(() => {
    return tempRecipeBuilder.reduce((total, item) => {
        const ing = ingredients.find(x => String(x.id) === String(item.ingredientId));
        // Ambil costPerUnit, default 0 jika data tidak lengkap
        const cost = ing ? (parseFloat(ing.costPerUnit) || 0) : 0;
        return total + (cost * parseFloat(item.qty));
    }, 0);
  }, [tempRecipeBuilder, ingredients]);

  // 2. Update harga jual otomatis saat HPP berubah
  useEffect(() => {
    if (viewMode === 'recipes' && isAdding) {
        // Set harga jual = Total Modal (dibulatkan ke atas). 
        // User bisa mengedit manual setelahnya untuk tambah margin profit.
        setNewProductData(prev => ({ ...prev, price: Math.ceil(totalRecipeCost) }));
    }
  }, [totalRecipeCost, viewMode, isAdding]);

  if (!isOwner && !isAdminOnShift) {
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

  // --- HANDLERS ---
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
      const purchasePrice = parseFloat(newIng.purchasePrice) || 0;
      const packSize = parseFloat(newIng.packSize) || 1;
      onAddIngredient({
        ...newIng,
        purchasePrice: purchasePrice,
        packSize: packSize,
        stock: parseFloat(newIng.stock) || 0,
        costPerUnit: purchasePrice / packSize
      });
      setIsAdding(false);
      setNewIng(initialIngState);
  };

  const handleSaveProduct = (e) => {
      e.preventDefault();
      if(!newProductData.name) return showNotification('Nama menu wajib diisi', 'error');
      onAddProduct({ ...newProductData, recipe: tempRecipeBuilder });
      setIsAdding(false);
      setNewProductData({ name: '', price: 0, category: 'Minuman', image: '☕' });
      setTempRecipeBuilder([]);
      showNotification('Menu & Resep Berhasil Disimpan');
  };

  const addIngredientToRecipe = () => {
      if(builderIngId && builderQty) { 
          if(tempRecipeBuilder.some(r => String(r.ingredientId) === String(builderIngId))) {
              return showNotification('Bahan ini sudah ada di resep', 'error');
          }
          setTempRecipeBuilder([...tempRecipeBuilder, {ingredientId: String(builderIngId), qty: parseFloat(builderQty)}]); 
          setBuilderIngId(''); 
          setBuilderQty(''); 
      }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in">
      <div className="p-4 md:p-6 border-b flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
        <h2 className="font-black flex gap-2 text-lg md:text-xl text-slate-800 uppercase tracking-tighter items-center w-full md:w-auto">
            <Package className="text-red-700" size={24}/> Manajemen Data
        </h2>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
           <button onClick={() => setIsAdding(!isAdding)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap flex-1 md:flex-none ${isAdding ? 'bg-gray-200 text-slate-600' : 'bg-red-700 text-white shadow-lg hover:bg-red-800'}`}>
             {isAdding ? 'Batal' : (viewMode === 'stock' ? '+ Data Bahan' : '+ Menu Baru')}
           </button>
           <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden p-1 shadow-sm flex-1 md:flex-none min-w-max">
             <button onClick={() => { setViewMode('stock'); setIsAdding(false); }} className={`flex-1 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${viewMode==='stock' ? 'bg-red-50 text-red-800' : 'text-gray-400 hover:text-gray-600'}`}>Master Bahan</button>
             <button onClick={() => { setViewMode('recipes'); setIsAdding(false); }} className={`flex-1 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap ${viewMode==='recipes' ? 'bg-red-50 text-red-800' : 'text-gray-400 hover:text-gray-600'}`}>Menu & Resep</button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {isAdding && viewMode === 'stock' && (
          <form onSubmit={handleSaveIngredient} className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
             <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Plus size={18}/> Input Bahan Baku Baru</h3>
             {/* GRID INPUT DIPERBARUI: KATEGORI DIHILANGKAN */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Nama Bahan</label>
                   <input className="w-full p-2.5 border rounded-xl text-sm" value={newIng.name} onChange={e=>setNewIng({...newIng, name:e.target.value})} placeholder="Cth: Powder Coklat" autoFocus />
                </div>
                
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase text-red-700">Isi per Kemasan (Satuan Terkecil)</label>
                   <input 
                      type="number" 
                      className="w-full p-2.5 border rounded-xl text-sm font-bold text-slate-700" 
                      value={newIng.packSize} 
                      onChange={e=>setNewIng({...newIng, packSize:e.target.value})} 
                      placeholder="Cth: 1000 (jika 1kg) / 500" 
                   />
                   <p className="text-[9px] text-gray-400 italic">*Masukkan angka saja (gram/ml)</p>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Satuan (gr/ml/pcs)</label>
                   <input className="w-full p-2.5 border rounded-xl text-sm" value={newIng.unit} onChange={e=>setNewIng({...newIng, unit:e.target.value})} placeholder="gr / ml" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Estimasi Harga Retail</label>
                   <input type="number" className="w-full p-2.5 border rounded-xl text-sm font-bold text-slate-700" value={newIng.purchasePrice} onChange={e=>setNewIng({...newIng, purchasePrice:e.target.value})} placeholder="Rp" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase">Stok Awal (Dalam Satuan Terkecil)</label>
                   <input type="number" className="w-full p-2.5 border rounded-xl text-sm" value={newIng.stock} onChange={e=>setNewIng({...newIng, stock:e.target.value})} placeholder="Cth: 1000" />
                </div>
             </div>
             <button className="mt-4 w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold uppercase text-xs transition-colors shadow-lg flex items-center justify-center gap-2">
                <Save size={16}/> Simpan ke Database
             </button>
          </form>
        )}

        {isAdding && viewMode === 'recipes' && (
            <div className="mb-8 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="font-bold text-xs uppercase text-slate-500">Nama Menu</label>
                        <input className="w-full p-3 border rounded-xl focus:ring-1 focus:ring-red-400 outline-none" value={newProductData.name} onChange={e=>setNewProductData({...newProductData, name:e.target.value})} placeholder="Nama Menu..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-bold text-xs uppercase text-slate-500">Harga Jual (Auto Modal)</label>
                            <input type="number" className="w-full p-3 border rounded-xl font-bold text-red-600" value={newProductData.price} onChange={e=>setNewProductData({...newProductData, price:parseFloat(e.target.value)})} placeholder="Rp" />
                            {/* INDIKATOR MODAL HPP */}
                            <p className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                               Estimasi Modal: Rp {totalRecipeCost.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="font-bold text-xs uppercase text-slate-500">Emoji</label>
                            <input className="w-full p-3 border rounded-xl text-center" value={newProductData.image} onChange={e=>setNewProductData({...newProductData, image:e.target.value})} placeholder="☕" />
                        </div>
                    </div>
                 </div>
                 
                 <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
                    <h4 className="font-bold text-xs uppercase text-slate-400 flex items-center gap-2">
                        <UtensilsCrossed size={14}/> Racik Resep (Pengurangan Stok Otomatis)
                    </h4>
                    <div className="flex flex-col md:flex-row gap-2">
                        <select className="flex-1 p-2.5 border rounded-lg bg-slate-50 text-sm font-medium" value={builderIngId} onChange={e=>setBuilderIngId(e.target.value)}>
                            <option value="">-- Pilih Bahan Baku --</option>
                            {ingredients.map(i=><option key={i.id} value={i.id}>{i.name} ({i.stock} {i.unit})</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input type="number" placeholder="Qty" className="w-20 md:w-24 p-2.5 border rounded-lg text-sm text-center" value={builderQty} onChange={e=>setBuilderQty(e.target.value)} />
                            <button onClick={addIngredientToRecipe} className="p-2.5 bg-slate-900 text-white rounded-lg hover:bg-black transition-colors flex-1 md:flex-none flex items-center justify-center"><Plus size={18}/></button>
                        </div>
                    </div>
                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg min-h-[50px]">
                        {tempRecipeBuilder.length === 0 && <p className="text-center text-xs text-gray-400 italic">Belum ada bahan.</p>}
                        {tempRecipeBuilder.map((r, i) => {
                            const ing = ingredients.find(x=>String(x.id)===String(r.ingredientId));
                            const cost = ing ? (parseFloat(ing.costPerUnit) || 0) : 0;
                            const subtotal = cost * r.qty;
                            return (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{ing?.name}</span>
                                        <span className="text-[10px] text-gray-400">Rp {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs bg-red-50 text-red-600 px-2 py-1 rounded">{r.qty} {ing?.unit}</span>
                                        <button onClick={()=>setTempRecipeBuilder(tempRecipeBuilder.filter((_,idx)=>idx!==i))} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <button onClick={handleSaveProduct} className="w-full py-3 bg-red-700 text-white rounded-xl font-bold uppercase text-xs hover:bg-red-800 transition-colors shadow-lg">Simpan Menu</button>
                 </div>
            </div>
        )}

        {viewMode === 'stock' ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-4 w-10 text-center">No</th>
                  <th className="p-4">Nama Bahan</th>
                  {/* Kolom Kategori Dihapus */}
                  <th className="p-4 text-center">Isi Kemasan</th>
                  <th className="p-4">Harga Retail</th>
                  <th className="p-4 text-center">Stok Saat Ini</th>
                  <th className="p-4 text-center">Penambahan</th>
                  <th className="p-4 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ingredients.length === 0 ? (
                    <tr><td colSpan="7" className="p-8 text-center text-gray-400 italic">Belum ada data bahan. Klik "+ Data Bahan" diatas.</td></tr>
                ) : ingredients.map((ing, idx) => (
                  <tr key={ing.id || idx} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-center font-mono text-xs text-gray-400">{idx + 1}</td>
                    <td className="p-4">
                        <div className="font-bold text-slate-800">{ing.name}</div>
                    </td>
                    <td className="p-4 text-center text-xs font-mono font-medium text-slate-600">
                        {ing.packSize || 0} {ing.unit}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">
                        Rp {(parseFloat(ing.purchasePrice) || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                       <div className={`inline-flex flex-col items-center px-3 py-1 rounded-lg border ${parseFloat(ing.stock) < 100 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                         <span className="font-black text-sm">{parseFloat(ing.stock).toLocaleString()}</span>
                         <span className="text-[9px] uppercase font-bold opacity-70">{ing.unit}</span>
                       </div>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center justify-center gap-1">
                           <input type="number" placeholder="Jml.." className="w-16 p-2 border border-gray-300 rounded-l-lg text-center text-xs font-bold focus:outline-none focus:border-red-500" value={quickAddStock[ing.id]||''} onChange={e=>setQuickAddStock({...quickAddStock, [ing.id]:e.target.value})} />
                           <button onClick={()=>handleQuickAddStock(ing.id)} className="bg-slate-800 hover:bg-black text-white p-2 rounded-r-lg transition-colors flex items-center justify-center" title="Tambah Stok"><Plus size={14}/></button>
                       </div>
                    </td>
                    <td className="p-4 text-center">
                       {deleteConfirmId === ing.id ? (
                           <div className="flex items-center justify-center gap-2 animate-in zoom-in duration-200">
                               <button 
                                  onClick={async () => {
                                      await onDeleteIngredient(ing.id);
                                      setDeleteConfirmId(null);
                                  }} 
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-red-700"
                               >
                                  Hapus!
                               </button>
                               <button 
                                  onClick={() => setDeleteConfirmId(null)} 
                                  className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-300"
                               >
                                  Batal
                               </button>
                           </div>
                       ) : (
                           <button 
                              onClick={() => setDeleteConfirmId(ing.id)}
                              className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Hapus Permanen"
                           >
                              <Trash2 size={16}/>
                           </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {products.map(p => (
               <div key={p.id} className="group relative bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-300">
                  <button onClick={()=>onDeleteProduct(p.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                  <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-4xl shadow-inner">{p.image}</div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{p.name}</h4>
                        <p className="text-red-600 font-black text-xl">Rp {p.price.toLocaleString('id-ID')}</p>
                      </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                        <UtensilsCrossed size={12}/> {p.recipe?.length || 0} Bahan Baku
                      </span>
                      <div className="flex -space-x-2">
                          {p.recipe?.slice(0,3).map((r,idx) => (
                              <div key={idx} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                                  {ingredients.find(i=>String(i.id)===String(r.ingredientId))?.name?.charAt(0) || '?'}
                              </div>
                          ))}
                      </div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryView;