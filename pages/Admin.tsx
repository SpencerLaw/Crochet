import React, { useState } from 'react';
import { useStore } from '../store';
import { Category, Product } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, Plus, Trash2, X, ChevronLeft, Package, Sparkles } from 'lucide-react';

export default function Admin() {
  const { products, fetchProducts } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', price: '', category: Category.PLUSHIES, description: '', 
    images: [] as string[], is_featured: false, is_banner: false, banner_text: '',
    colors: '', sizes: '', tags: ''
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [...formData.images];
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], (p) => setUploadProgress(Math.round(((i / files.length) * 100) + (p / files.length))));
        uploadedUrls.push(url);
      }
      setFormData(prev => ({ ...prev, images: uploadedUrls }));
      toast.success(`图片已准备好`);
    } catch (err: any) {
      toast.error('上传失败');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) return toast.error('请上传图片');
    const newProduct = {
      ...formData,
      image: formData.images[0],
      colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
      stock: 10
    };
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminPass },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        await fetchProducts();
        setFormData({ title: '', price: '', category: Category.PLUSHIES, description: '', images: [], is_featured: false, is_banner: false, banner_text: '', colors: '', sizes: '', tags: '' });
        setIsAdding(false);
        toast.success('上架成功');
      }
    } catch (err: any) { toast.error('发布失败'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定移除吗？')) return;
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE', headers: { 'Authorization': adminPass } });
      if (res.ok) { await fetchProducts(); toast.success('已移除'); }
    } catch (err: any) { toast.error('操作失败'); }
  };

  // --- 视图 1：添加商品表单 (添加时只显示这个) ---
  if (isAdding) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <button onClick={() => setIsAdding(false)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-8 transition-all group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 取消并返回作品列表
        </button>

        <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-white">
          <h1 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">作品发布</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <input required className="w-full text-2xl font-bold p-0 border-none focus:ring-0 placeholder:text-slate-200" placeholder="作品名称..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div className="h-px bg-slate-100" />
              
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">定价 (USD)</label>
                  <input required type="number" className="w-full text-xl font-mono p-0 border-none focus:ring-0" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">分类</label>
                  <select className="w-full p-0 border-none focus:ring-0 font-bold text-indigo-600 appearance-none bg-transparent" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                    {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">详细故事</label>
                <textarea required className="w-full p-0 border-none focus:ring-0 resize-none h-32 text-slate-600 leading-relaxed" placeholder="这个钩织品有什么特别之处吗？" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <input placeholder="颜色 (如: 粉色)" className="p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} />
               <input placeholder="尺寸 (如: 15cm)" className="p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
            </div>

            <div className="flex gap-4 p-2">
               <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.is_featured ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'}">
                 <input type="checkbox" className="hidden" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                 <span className="text-sm font-bold">新品推荐</span>
               </label>
               <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.is_banner ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-400'}">
                 <input type="checkbox" className="hidden" checked={formData.is_banner} onChange={e => setFormData({...formData, is_banner: e.target.checked})} />
                 <span className="text-sm font-bold">首页轮播</span>
               </label>
            </div>

            <div className="relative">
              <input type="file" id="up" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />
              <label htmlFor="up" className="block border-4 border-dashed border-slate-100 rounded-[40px] p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/20 transition-all group">
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-indigo-600 font-black animate-pulse">正在极速压缩处理 {uploadProgress}%</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center text-indigo-500 mx-auto mb-4 group-hover:scale-110 transition-transform"><Plus className="w-8 h-8" /></div>
                    <p className="font-black text-slate-800 text-xl">上传照片</p>
                    <p className="text-xs text-slate-400 font-bold">支持多选 · 自动转换为极致轻量 WebP</p>
                  </div>
                )}
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-5 gap-3">
                {formData.images.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm">
                    <img src={url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => i !== idx) }))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}

            <button disabled={isUploading || formData.images.length === 0} className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[32px] font-black text-xl disabled:bg-slate-100 disabled:text-slate-300 transition-all active:scale-[0.98] shadow-2xl">
              确认上架作品
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 视图 2：作品列表 (默认显示) ---
  return (
    <div className="animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">作品管理中心</h1>
          <p className="text-slate-400 font-bold mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> 共有 {products.length} 个作品在货架上
          </p>
        </div>
        <button onClick={() => setIsAdding(true)} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white p-5 px-10 rounded-[24px] font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95">
          <Plus className="w-6 h-6" /> 上架新品
        </button>
      </div>

      <div className="space-y-3">
        {products.map(p => (
          <div key={p.id} className="group flex items-center gap-6 p-4 pl-6 bg-white hover:bg-slate-50 rounded-[32px] border border-slate-50 transition-all duration-300">
            {/* 魔法预览图：悬浮直接突破一切遮挡 */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <img 
                src={p.image} 
                className="w-full h-full rounded-2xl object-cover shadow-sm transition-all duration-500 cursor-zoom-in absolute top-0 left-0 z-10
                  hover:scale-[6] hover:z-[9999] hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:rounded-xl" 
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-slate-800 text-lg tracking-tight truncate">{p.title}</h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-tighter">{p.category}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                {p.is_banner && <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">HOME BANNER</span>}
                {p.is_featured && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">FEATURED</span>}
                {p.colors?.map(c => <span key={c} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c}</span>)}
              </div>
            </div>

            <div className="text-right">
              <p className="font-black text-slate-900 text-2xl tracking-tighter">${p.price}</p>
            </div>

            <div className="border-l border-slate-100 pl-4 py-2">
              <button onClick={() => handleDelete(p.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="py-20 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest">目前还没有任何作品</p>
          </div>
        )}
      </div>
    </div>
  );
}