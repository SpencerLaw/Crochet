
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category, Product } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';
import {
  Image as ImageIcon, Plus, Trash2, X, ChevronLeft,
  Package, LayoutGrid, Tag, DollarSign, Type, FileText,
  Palette, Maximize2, Layers, CheckCircle2, CloudUpload,
  Sparkles, Search, Filter, TrendingUp, Calendar, ArrowUpRight,
  Eye, Edit3
} from 'lucide-react';

// --- FIELD COMPONENT ---
const Field = ({ label, icon: Icon, children, compact = false }: any) => (
  <div className={`space-y-1 group ${compact ? 'col-span-1' : ''}`}>
    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5 group-focus-within:text-indigo-500 transition-colors">
      <Icon className="w-3 h-3" /> {label}
    </label>
    <div className="relative">
      {children}
    </div>
  </div>
);

export default function Admin() {
  const { products, fetchProducts } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
    } catch (err: any) {
      toast.error('上传异常');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) return toast.error('请上传作品图片');
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
        toast.success('发布成功');
      }
    } catch (err: any) { toast.error('网络错误'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定移除？')) return;
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE', headers: { 'Authorization': adminPass } });
      if (res.ok) { await fetchProducts(); toast.success('已移除'); }
    } catch (err: any) { toast.error('失败'); }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- COMPACT FORM VIEW ---
  if (isAdding) {
    return (
      <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300 py-6 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">发布新作品</h1>
          </div>
          <button
            type="submit"
            form="product-form"
            disabled={isUploading || formData.images.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" /> 确认发布
          </button>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <Field label="标题" icon={Type}>
                <input required className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" placeholder="作品名称" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="价格" icon={DollarSign}>
                  <input required type="number" className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-sm outline-none" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </Field>
                <Field label="分类" icon={Layers}>
                  <select className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-sm outline-none text-indigo-600 appearance-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Category })}>
                    {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="描述" icon={FileText}>
                <textarea required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm h-24 resize-none outline-none" placeholder="简介..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </Field>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <Field label="规格 (颜色, 尺寸)" icon={Palette}>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none" placeholder="颜色如: 粉,白" value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} />
                  <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none" placeholder="尺寸如: 10cm" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} />
                </div>
              </Field>
              <div className="flex gap-4">
                <button type="button" onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })} className={`flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${formData.is_featured ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                  <Sparkles className="w-3.5 h-3.5" /> 推荐
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, is_banner: !formData.is_banner })} className={`flex-1 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${formData.is_banner ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                  <ImageIcon className="w-3.5 h-3.5" /> 横幅
                </button>
              </div>
              {formData.is_banner && (
                <input className="w-full bg-amber-50 border-none rounded-xl p-3 text-xs font-bold text-amber-900 outline-none" placeholder="横幅文案" value={formData.banner_text} onChange={e => setFormData({ ...formData, banner_text: e.target.value })} />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><ImageIcon className="w-3 h-3" /> 图片素材</label>
                {isUploading && <span className="text-[10px] font-bold text-indigo-600 animate-pulse">上传中 {uploadProgress}%</span>}
              </div>

              <div className="flex-1 min-h-[200px] border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center p-6 relative group transition-colors hover:bg-slate-50">
                <input type="file" id="up" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} disabled={isUploading} />
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-400">点击上传</p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {formData.images.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-slate-100">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => i !== idx) }))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }

  // --- COMPACT LIST VIEW ---
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <Package className="w-6 h-6 text-indigo-600" /> 作品库
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total: {products.length} Items</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索..."
              className="bg-white border-none rounded-xl pl-9 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-indigo-100 outline-none w-48 md:w-64"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus className="w-4 h-4" /> 发布
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all h-[180px] flex flex-col relative overflow-hidden">

            {/* Thumbnail Logic: Small by default, Enlarge on hover with 1s delay */}
            <div className="h-28 relative overflow-hidden bg-slate-50 cursor-zoom-in">
              <img src={p.image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />

              {/* Enlarge Overlay (Mouseover effect) */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:delay-1000 transition-all duration-500 pointer-events-none z-50">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <img src={p.image} className="w-full h-full object-contain p-2 transform scale-75 group-hover:scale-100 transition-transform duration-700" />
                </div>
              </div>

              {/* Quick Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {p.is_banner && <div className="p-1 bg-amber-500 text-white rounded-md shadow-sm"><ImageIcon className="w-3 h-3" /></div>}
                {p.is_featured && <div className="p-1 bg-emerald-500 text-white rounded-md shadow-sm"><Sparkles className="w-3 h-3" /></div>}
              </div>

              {/* Action Toolbar */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                <button onClick={() => handleDelete(p.id)} className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-2.5 flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h3 className="text-xs font-black text-slate-800 truncate mb-1" title={p.title}>{p.title}</h3>
                <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter opacity-70">{p.category}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-black text-slate-900">${p.price}</span>
                <div className="flex gap-0.5">
                  {(p.images?.length || 0) > 1 && <span className="text-[8px] font-bold text-slate-300">+{p.images!.length - 1}图</span>}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Products Found</p>
          </div>
        )}
      </div>

      {/* Help tooltip */}
      <div className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-t pt-4">
        <Eye className="w-3 h-3" /> 鼠标悬停 1s 预览高清大图
      </div>
    </div>
  );
}
