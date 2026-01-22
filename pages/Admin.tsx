
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category, Product } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';
import { 
  Image as ImageIcon, Plus, Trash2, X, ChevronLeft, 
  Package, LayoutGrid, Tag, DollarSign, Type, FileText, 
  Palette, Maximize2, Layers, CheckCircle2, CloudUpload
} from 'lucide-react';

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

  // --- MATERIAL INPUT COMPONENT ---
  const Field = ({ label, icon: Icon, children }: any) => (
    <div className="space-y-1.5 group">
      <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-indigo-500 transition-colors">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );

  // --- 视图 1：MATERIAL 发布表单 ---
  if (isAdding) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32 px-4">
        <header className="flex items-center justify-between mb-12">
          <button onClick={() => setIsAdding(false)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black transition-all group">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all"><ChevronLeft className="w-5 h-5" /></div>
            <span>返回列表</span>
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">发布新作品</h1>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 左侧主要信息 */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-8">
              <Field label="作品标题" icon={Type}>
                <input required className="w-full text-2xl font-bold bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl p-4 outline-none transition-all" placeholder="输入作品名称..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </Field>

              <div className="grid grid-cols-2 gap-6">
                <Field label="定价 ($)" icon={DollarSign}>
                  <input required type="number" className="w-full font-bold bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl p-4 outline-none transition-all" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </Field>
                <Field label="作品分类" icon={Layers}>
                  <select className="w-full font-bold bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl p-4 outline-none transition-all appearance-none text-indigo-600 cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                    {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="作品描述" icon={FileText}>
                <textarea required className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl p-4 outline-none transition-all h-40 resize-none leading-relaxed text-slate-600" placeholder="讲述这个手工钩织品的独特魅力..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </Field>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                <h2 className="font-black text-slate-800">媒体图集</h2>
              </div>
              
              <div className="relative">
                <input type="file" id="up" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />
                <label htmlFor="up" className="flex flex-col items-center justify-center border-4 border-dashed border-slate-100 rounded-[32px] p-12 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all cursor-pointer group">
                  {isUploading ? (
                    <div className="w-full max-w-xs text-center space-y-4">
                      <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-inner"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${uploadProgress}%` }} /></div>
                      <p className="text-indigo-600 font-black animate-pulse">正在优化上传 {uploadProgress}%</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform"><Plus className="w-8 h-8" /></div>
                      <p className="text-slate-800 font-black text-xl">点击上传精彩图集</p>
                      <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">支持 WebP / JPG / PNG · 自动优化</p>
                    </>
                  )}
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                  {formData.images.map((url, i) => (
                    <div key={url} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => i !== idx) }))} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧边栏配置 */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-8">
              <Field label="规格与属性" icon={Palette}>
                <div className="space-y-4">
                  <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl p-4 outline-none transition-all text-sm font-bold" placeholder="可选颜色 (英文逗号隔开)" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} />
                  <input className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white rounded-2xl p-4 outline-none transition-all text-sm font-bold" placeholder="参考尺寸 (如: 15cm)" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
                </div>
              </Field>

              <div className="h-px bg-slate-50" />

              <Field label="展示位置" icon={LayoutGrid}>
                <div className="grid grid-cols-1 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, is_featured: !formData.is_featured})} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.is_featured ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                    <span className="font-black text-sm">新品推荐区</span>
                    {formData.is_featured ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, is_banner: !formData.is_banner})} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.is_banner ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md shadow-amber-100' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                    <span className="font-black text-sm">首页轮播图</span>
                    {formData.is_banner ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                  </button>
                </div>
              </Field>

              {formData.is_banner && (
                <Field label="轮播短语" icon={Type}>
                  <input className="w-full bg-amber-50/50 border-2 border-amber-100 rounded-2xl p-4 outline-none font-bold text-amber-900" placeholder="出现在首页的大标题..." value={formData.banner_text} onChange={e => setFormData({...formData, banner_text: e.target.value})} />
                </Field>
              )}
            </div>

            <button disabled={isUploading || formData.images.length === 0} className="w-full bg-slate-900 hover:bg-black text-white py-8 rounded-[32px] font-black text-xl disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-2xl shadow-indigo-200 active:scale-[0.98] flex flex-col items-center justify-center gap-1">
              <span className="flex items-center gap-2 uppercase tracking-widest"><CloudUpload className="w-6 h-6" /> 确认发布作品</span>
              {formData.images.length > 0 && <span className="text-[10px] opacity-50 uppercase tracking-tighter">共 {formData.images.length} 张素材将进入云端</span>}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // --- 视图 2：MATERIAL 作品列表 (默认) ---
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-1000 pb-32 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">作品管理</h1>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">Inventory: {products.length}</span>
            <span className="text-slate-400 font-bold text-xs flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-emerald-500" /> 手工温度 · 匠心呈现</span>
          </div>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 px-10 rounded-[32px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200 transition-all active:scale-95 group">
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          <span className="text-lg">上架新品</span>
        </button>
      </header>

      <div className="space-y-4">
        {products.map(p => (
          <div key={p.id} className="group relative bg-white hover:bg-slate-50/50 p-5 rounded-[40px] border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex items-center gap-8">
            
            {/* 极简缩略图：魔法悬浮大图 */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <div className="w-full h-full rounded-[24px] overflow-hidden shadow-inner bg-slate-100 ring-4 ring-white">
                <img src={p.image} className="w-full h-full object-cover transition-all duration-700 cursor-zoom-in group-hover:opacity-0" />
              </div>
              <img 
                src={p.image} 
                className="w-full h-full rounded-[24px] object-cover shadow-2xl transition-all duration-500 cursor-zoom-in absolute top-0 left-0 z-10 opacity-0 group-hover:opacity-100
                  group-hover:scale-[5] group-hover:z-[100] group-hover:rounded-[12px] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] pointer-events-none" 
              />
            </div>

            {/* 核心内容区 */}
            <div className="flex-1 min-w-0 py-2">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-black text-slate-800 text-xl tracking-tight truncate">{p.title}</h3>
                <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-indigo-100/50">{p.category}</span>
              </div>

              {/* 多维标签集 */}
              <div className="flex flex-wrap items-center gap-3">
                {p.is_banner && <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shadow-sm shadow-amber-50 uppercase tracking-tighter">Home Banner</span>}
                {p.is_featured && <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 shadow-sm shadow-emerald-50 uppercase tracking-tighter">Featured Item</span>}
                <div className="h-3 w-px bg-slate-200 mx-1" />
                {/* 颜色与尺寸标签 */}
                {p.colors?.map(c => <span key={c} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">{c}</span>)}
                {p.sizes?.map(s => <span key={s} className="text-[10px] font-bold text-indigo-400 bg-indigo-50/30 px-1.5 py-0.5 rounded uppercase">{s}</span>)}
              </div>
              
              {/* 图集指示器 (微缩图点) */}
              {(p.images?.length || 0) > 1 && (
                <div className="flex gap-1 mt-3 pl-1">
                  {p.images?.map((_, idx) => (
                    <div key={idx} className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-indigo-300 transition-colors" />
                  ))}
                  <span className="text-[8px] font-black text-slate-300 uppercase ml-1">Gallery · {p.images?.length} Images</span>
                </div>
              )}
            </div>

            {/* 定价 */}
            <div className="text-right px-4">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Pricing</div>
              <p className="font-black text-slate-900 text-3xl tracking-tighter leading-none">${p.price}</p>
            </div>

            {/* 删除按钮 (Material Style) */}
            <div className="border-l border-slate-100 pl-6 pr-2">
              <button onClick={() => handleDelete(p.id)} className="w-12 h-12 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 hover:shadow-lg hover:shadow-red-100 transition-all active:scale-90 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[60px] border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
              <Package className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">库房还是空的哦</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">开始上架你的第一件作品吧</p>
          </div>
        )}
      </div>
    </div>
  );
}
