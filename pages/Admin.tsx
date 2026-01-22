
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
  Sparkles, Search, Filter, TrendingUp, Calendar, ArrowUpRight
} from 'lucide-react';

// --- FIELD COMPONENT (Moved outside to fix focus loss) ---
const Field = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-1.5 group">
    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">
      <Icon className="w-4 h-4" /> {label}
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
      toast.success(`素材已上传`);
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
        toast.success('作品发布成功');
      }
    } catch (err: any) { toast.error('网络错误'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要从货架移除吗？')) return;
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
      <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20 mt-4 h-[calc(100vh-120px)] flex flex-col">
        <header className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsAdding(false)}
              className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:shadow-md transition-all border border-slate-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">发布新作品</h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Create a new manual masterpiece</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
            {/* Left Panel */}
            <div className="lg:col-span-7 space-y-8">
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8">
                <Field label="作品标题" icon={Type}>
                  <input
                    required
                    className="w-full text-2xl font-bold bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-[24px] p-5 outline-none transition-all placeholder:text-slate-300"
                    placeholder="例如：呆萌草莓熊挂件"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-8">
                  <Field label="定价 ($)" icon={DollarSign}>
                    <input
                      required
                      type="number"
                      className="w-full font-bold bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-[24px] p-5 outline-none transition-all"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </Field>
                  <Field label="作品分类" icon={Layers}>
                    <div className="relative">
                      <select
                        className="w-full font-bold bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-[24px] p-5 outline-none transition-all appearance-none text-indigo-600 cursor-pointer"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                      >
                        {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300 pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <Field label="作品描述" icon={FileText}>
                  <textarea
                    required
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-[24px] p-5 outline-none transition-all h-48 resize-none leading-relaxed text-slate-600"
                    placeholder="描述这个钩织品的背后故事，或者是它的柔软材质..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </Field>
              </section>

              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <h2 className="font-black text-slate-800 tracking-tight">媒体图集</h2>
                  </div>
                  {formData.images.length > 0 && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formData.images.length} 张已上传</span>}
                </div>

                <div className="space-y-6">
                  <input type="file" id="up" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />
                  <label htmlFor="up" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px] p-12 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden">
                    {isUploading ? (
                      <div className="w-full max-w-xs text-center space-y-4">
                        <div className="h-3 w-full bg-white rounded-full overflow-hidden shadow-inner flex items-center p-0.5">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-indigo-600 font-black text-sm">正在魔法上传中... {uploadProgress}%</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                          <Plus className="w-10 h-10" />
                        </div>
                        <p className="text-slate-800 font-black text-lg">点击或拖拽上传图片</p>
                        <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.2em]">WEBV / JPG / PNG · HIGH QUALITY</p>
                      </>
                    )}
                  </label>

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                      {formData.images.map((url, i) => (
                        <div key={url} className="relative group aspect-square rounded-[24px] overflow-hidden shadow-sm border border-slate-100">
                          <img src={url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => i !== idx) }))}
                              className="w-10 h-10 rounded-full bg-white/20 text-white hover:bg-red-500 transition-colors flex items-center justify-center border border-white/30"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-5 space-y-8">
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8 sticky top-0">
                <Field label="详细规格" icon={Palette}>
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-[24px]">
                      <input
                        className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                        placeholder="可选颜色 (用逗号隔开)"
                        value={formData.colors}
                        onChange={e => setFormData({ ...formData, colors: e.target.value })}
                      />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-[24px]">
                      <input
                        className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-300"
                        placeholder="参考尺寸 (例如: 15cm x 10cm)"
                        value={formData.sizes}
                        onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                      />
                    </div>
                  </div>
                </Field>

                <div className="h-px bg-slate-100" />

                <Field label="展示策略" icon={LayoutGrid}>
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                      className={`flex items-center justify-between p-6 rounded-[28px] border-2 transition-all ${formData.is_featured ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${formData.is_featured ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-wider">新品推荐</span>
                      </div>
                      {formData.is_featured && <CheckCircle2 className="w-6 h-6" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_banner: !formData.is_banner })}
                      className={`flex items-center justify-between p-6 rounded-[28px] border-2 transition-all ${formData.is_banner ? 'border-amber-500 bg-amber-50/50 text-amber-900' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${formData.is_banner ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-wider">首页横幅</span>
                      </div>
                      {formData.is_banner && <CheckCircle2 className="w-6 h-6 text-amber-600" />}
                    </button>
                  </div>
                </Field>

                {formData.is_banner && (
                  <div className="animate-in slide-in-from-top-4 duration-300">
                    <Field label="轮播横幅文案" icon={Type}>
                      <input
                        className="w-full bg-amber-50/50 border-2 border-amber-100 rounded-[24px] p-5 outline-none font-bold text-amber-900 placeholder:text-amber-200"
                        placeholder="输入展示在横幅上的大标题..."
                        value={formData.banner_text}
                        onChange={e => setFormData({ ...formData, banner_text: e.target.value })}
                      />
                    </Field>
                  </div>
                )}

                <button
                  disabled={isUploading || formData.images.length === 0}
                  className="w-full bg-gradient-to-br from-slate-800 to-black hover:scale-[1.02] active:scale-[0.98] text-white py-8 rounded-[32px] font-black text-xl disabled:opacity-30 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-4"
                >
                  <CloudUpload className="w-6 h-6" />
                  <span>立即发布作品</span>
                </button>
              </section>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20 mt-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 px-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
              D
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">作品管理</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <Package className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">库存总量: {products.length}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
              <TrendingUp className="w-4 h-4" />
              <span>今日温度 · {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="搜索作品名称或分类..."
              className="w-full bg-white border border-slate-100 rounded-[24px] pl-12 pr-4 py-5 outline-none focus:ring-4 focus:ring-indigo-50 shadow-sm transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-slate-900 text-white w-16 md:w-auto md:px-10 h-16 rounded-[28px] font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95 group shrink-0"
          >
            <Plus className="w-8 h-8 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
            <span className="hidden md:block text-lg">发布新作品</span>
          </button>
        </div>
      </header>

      {/* Grid of Stats or Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="group bg-white rounded-[48px] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
            {/* Quick Delete */}
            <button
              onClick={() => handleDelete(p.id)}
              className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all flex items-center justify-center border border-white/30"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="h-64 relative overflow-hidden">
              <img src={p.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between">
                <div className="flex gap-2">
                  {p.is_banner && (
                    <div className="bg-amber-500 text-white p-2 rounded-xl shadow-lg border border-amber-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                  {p.is_featured && (
                    <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg border border-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/30">
                  {p.category}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-0.5">Price</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">${p.price}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {p.colors?.slice(0, 3).map(c => <span key={c} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">{c}</span>)}
                {p.sizes?.map(s => <span key={s} className="text-[10px] font-bold text-indigo-400 bg-indigo-50/50 px-2.5 py-1 rounded-lg uppercase border border-indigo-100/30">{s}</span>)}
                {(p.colors?.length || 0) > 3 && <span className="text-[10px] font-bold text-slate-300 px-2.5 py-1">+{p.colors!.length - 3}</span>}
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Updated Today</span>
                </div>
                <button className="flex items-center gap-2 text-indigo-600 font-black text-sm group/edit">
                  <span>查看详情</span>
                  <ArrowUpRight className="w-4 h-4 group-hover/edit:translate-x-1 group-hover/edit:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-40 text-center bg-white rounded-[64px] border border-slate-50 shadow-sm border-dashed">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
              <Package className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">未找到匹配的作品</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">试着搜索其他关键词或者发布一个新作品</p>
          </div>
        )}
      </div>

      {/* CSS For Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
