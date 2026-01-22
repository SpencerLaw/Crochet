
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category, Product } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';
import {
  Plus, Trash2, ChevronLeft, Package, Layers,
  CloudUpload, Search, Filter, TrendingUp, Calendar,
  Image as ImageIcon, Sparkles, MessageSquare, Info
} from 'lucide-react';

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
      toast.success('上传成功');
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
        toast.success('作品已发布');
      }
    } catch (err: any) { toast.error('网络错误'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除吗？')) return;
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE', headers: { 'Authorization': adminPass } });
      if (res.ok) { await fetchProducts(); toast.success('已移除'); }
    } catch (err: any) { toast.error('操作失败'); }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdding) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 animate-in fade-in duration-300">
        <header className="flex items-center justify-between mb-8">
          <button onClick={() => setIsAdding(false)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-all">
            <ChevronLeft className="w-5 h-5" /> 返回列表
          </button>
          <h1 className="text-xl font-bold">发布新作品</h1>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">作品名称</label>
              <input required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">价格 ($)</label>
                <input required type="number" className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-slate-100" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">分类</label>
                <select className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold outline-none ring-1 ring-slate-100" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Category })}>
                  {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">描述</label>
              <textarea required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm h-24 resize-none outline-none ring-1 ring-slate-100" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">颜色 (逗号隔开)</label>
                <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none ring-1 ring-slate-100" value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">尺寸 (例如 10cm)</label>
                <input className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold outline-none ring-1 ring-slate-100" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-slate-50 rounded-xl">
              <button type="button" onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })} className={`flex-1 p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${formData.is_featured ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                推荐
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, is_banner: !formData.is_banner })} className={`flex-1 p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${formData.is_banner ? 'bg-amber-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                横幅
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center min-h-[140px] group transition-all hover:bg-indigo-50/30 hover:border-indigo-200">
              <input type="file" id="up" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} disabled={isUploading} />
              {isUploading ? (
                <div className="text-center font-bold text-indigo-600 text-xs animate-pulse">上传中 {uploadProgress}%</div>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-slate-300 group-hover:text-indigo-500 mb-2" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">添加作品图片</span>
                </>
              )}
            </div>

            {formData.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {formData.images.map((url, i) => (
                  <div key={url} className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100 relative group">
                    <img src={url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => i !== idx) }))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={isUploading || formData.images.length === 0} className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50">
              确认发布作品
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" /> 库存管理
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total {products.length} Products</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input placeholder="搜索作品..." className="bg-white border-none rounded-xl pl-9 pr-4 py-2.5 text-sm shadow-sm ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-100 outline-none w-48 md:w-64 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          </div>
          <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <Plus className="w-4 h-4" /> 新增作品
          </button>
        </div>
      </header>

      {/* Row-based table-like list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          <div className="col-span-1">图示</div>
          <div className="col-span-4">基本信息与标签</div>
          <div className="col-span-2">分类</div>
          <div className="col-span-2">价格</div>
          <div className="col-span-2">更新状态</div>
          <div className="col-span-1 text-right">操作</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredProducts.map(p => (
            <div key={p.id} className="group grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors relative">

              {/* Thumbnail with 1s delay hover enlarge */}
              <div className="col-span-3 md:col-span-1 relative">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={p.image} className="w-full h-full object-cover" />
                </div>
                {/* Enlarge logic */}
                <div className="absolute top-0 left-0 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:delay-1000 transition-opacity duration-300">
                  <div className="w-48 h-48 bg-white p-1 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 -translate-y-1/2 mt-6 scale-75 group-hover:scale-100 transition-transform">
                    <img src={p.image} className="w-full h-full object-cover rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Info & Capsule Tags */}
              <div className="col-span-9 md:col-span-4 min-w-0">
                <h3 className="text-sm font-black text-slate-800 truncate mb-2">{p.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.is_banner && <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm"><ImageIcon className="w-2.5 h-2.5" /> Banner</span>}
                  {p.is_featured && <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-sm"><Sparkles className="w-2.5 h-2.5" /> Featured</span>}
                  {p.colors?.map(c => <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[8px] font-bold uppercase tracking-tighter border border-slate-200">{c}</span>)}
                  {p.sizes?.map(s => <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-400 rounded-full text-[8px] font-bold uppercase tracking-tighter border border-indigo-100/30">{s}</span>)}
                </div>
              </div>

              {/* Other Columns */}
              <div className="hidden md:block col-span-2">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                  {p.category}
                </span>
              </div>

              <div className="hidden md:block col-span-2">
                <span className="text-sm font-black text-slate-900 tracking-tighter">${p.price}</span>
              </div>

              <div className="hidden md:block col-span-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Active</span>
                </div>
              </div>

              <div className="col-span-12 md:col-span-1 text-right flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px]">
              No matched items
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3 text-slate-300">
        <div className="px-2 py-0.5 bg-slate-50 rounded border border-slate-100 text-[8px] font-bold">INFO</div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] italic">Hover image for 1s to enlarge thumbnail</p>
      </div>
    </div>
  );
}
