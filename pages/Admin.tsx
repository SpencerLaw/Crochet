
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category, Product } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { Button } from '../components/Components';
import { Toaster, toast } from 'react-hot-toast';
import { Image as ImageIcon, PlusCircle, Trash2, X, Loader2, Package, Tag, Layers, DollarSign, LayoutGrid, List } from 'lucide-react';

export default function Admin() {
  const { products, fetchProducts } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', price: '', category: Category.PLUSHIES, description: '', 
    images: [] as string[], is_featured: false, is_banner: false, banner_text: '',
    colors: '', sizes: '', tags: ''
  });

  // Stats logic
  const totalValue = products.reduce((acc, p) => acc + p.price, 0).toFixed(2);
  const bannerCount = products.filter(p => p.is_banner).length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [...formData.images];
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(files[i], (p) => {
          const overall = Math.round(((i / files.length) * 100) + (p / files.length));
          setUploadProgress(overall);
        });
        uploadedUrls.push(url);
      }
      setFormData(prev => ({ ...prev, images: uploadedUrls }));
      toast.success(`上传成功`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || '上传失败，请检查数据库权限');
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
        toast.success('商品已发布！');
      }
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个精美的作品吗？')) return;
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE', headers: { 'Authorization': adminPass } });
      if (res.ok) { await fetchProducts(); toast.success('已从货架移除'); }
    } catch (err: any) { toast.error('操作失败'); }
  };

  return (
    <div className="pb-32 animate-in fade-in duration-700">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Package className="w-6 h-6" /></div>
          <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">商品总数</p><p className="text-2xl font-black text-slate-800">{products.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><DollarSign className="w-6 h-6" /></div>
          <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">总价值</p><p className="text-2xl font-black text-slate-800">${totalValue}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><Layers className="w-6 h-6" /></div>
          <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">轮播位</p><p className="text-2xl font-black text-slate-800">{bannerCount}/5</p></div>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><Tag className="w-6 h-6" /></div>
          <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">分类数</p><p className="text-2xl font-black text-slate-800">{CATEGORIES.length - 1}</p></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">作品管理中心</h1>
          <p className="text-slate-500 font-medium">极简列表视图 · 鼠标悬浮预览图</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          {isAdding ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          {isAdding ? '取消操作' : '上架新品'}
        </button>
      </div>

      {isAdding && (
        // ... (keep the existing elegant form)
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[32px] shadow-2xl border border-white mb-12 animate-in zoom-in-95 duration-300">
          <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
            <div className="w-2 h-8 bg-indigo-500 rounded-full"></div> 填写作品详情
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">作品名称</label>
                    <input required className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500/20 focus:bg-white transition-all outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="例如: 治愈系小熊挂件" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">定价 ($)</label>
                    <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500/20 focus:bg-white transition-all outline-none font-mono" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">分类目录</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.filter(c => c !== Category.ALL).map(c => (
                      <button key={c} type="button" onClick={() => setFormData({...formData, category: c as Category})} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border-2 ${formData.category === c ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">作品描述</label>
                  <textarea required className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-500/20 focus:bg-white transition-all outline-none h-40 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="讲讲这个作品背后的故事..." />
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                <div className="p-6 bg-slate-50 rounded-[24px] space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">展示配置</label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer border border-transparent hover:border-indigo-100 transition-all">
                      <span className="text-sm font-bold text-slate-700">新品推荐</span>
                      <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5 accent-indigo-600" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer border border-transparent hover:border-indigo-100 transition-all">
                      <span className="text-sm font-bold text-slate-700">首页轮播</span>
                      <input type="checkbox" checked={formData.is_banner} onChange={e => setFormData({...formData, is_banner: e.target.checked})} className="w-5 h-5 accent-indigo-600" />
                    </label>
                  </div>
                  {formData.is_banner && (
                    <input className="w-full p-3 bg-white rounded-xl text-sm border border-indigo-100 outline-none focus:ring-2 ring-indigo-500/20" value={formData.banner_text} onChange={e => setFormData({...formData, banner_text: e.target.value})} placeholder="轮播图短语..." />
                  )}
                </div>

                <div className="p-6 bg-slate-50 rounded-[24px] space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">属性标签</label>
                  <div className="space-y-3">
                    <input className="w-full p-3 bg-white rounded-xl text-sm border-none outline-none" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} placeholder="颜色 (英文逗号隔开)" />
                    <input className="w-full p-3 bg-white rounded-xl text-sm border-none outline-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} placeholder="尺寸 (如: 15cm)" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">媒体图片 (建议最大宽 1200px)</label>
              <div className="relative">
                <input type="file" id="admin-upload" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />
                <label 
                  htmlFor="admin-upload" 
                  className={`
                    border-4 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group
                    ${isUploading ? 'bg-slate-50 border-indigo-200' : 'bg-slate-50/50 border-slate-200 hover:bg-white hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-50'}
                  `}
                >
                  {isUploading ? (
                    <div className="w-full max-w-md text-center">
                      <div className="h-3 bg-white rounded-full overflow-hidden mb-4 shadow-inner">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className="text-indigo-600 font-black animate-pulse text-lg tracking-tight">极速处理中... {uploadProgress}%</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white rounded-[24px] shadow-lg flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:rotate-3 transition-all mb-6 border border-slate-100"><ImageIcon className="w-10 h-10" /></div>
                      <span className="text-slate-800 font-black text-2xl tracking-tight">点此上传精彩作品</span>
                      <p className="text-slate-400 text-sm mt-3 font-bold flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-indigo-400" /> 支持一次选择多张图片
                      </p>
                    </>
                  )}
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {formData.images.map((url, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square ring-2 ring-transparent hover:ring-indigo-500 transition-all">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="text-white w-6 h-6" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button disabled={isUploading || formData.images.length === 0} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-[24px] font-black text-xl disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none transition-all shadow-2xl shadow-indigo-200 active:scale-[0.98]">
              {isUploading ? '正在努力上传中...' : formData.images.length > 0 ? `确认上架 ${formData.images.length} 件作品` : '请先上传作品图片'}
            </button>
          </form>
        </div>
      )}

      {/* 作品展示区 - 极简行卡片布局 */}
      <div className="space-y-3">
        {products.map(p => (
          <div 
            key={p.id} 
            className="group relative bg-white hover:bg-indigo-50/30 p-3 pl-5 pr-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-6"
          >
            {/* 左侧：极小缩略图 + 悬浮放大镜效果 */}
            <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
              <img 
                src={p.image} 
                className="w-full h-full rounded-2xl object-cover shadow-sm ring-2 ring-slate-50 transition-all duration-500 cursor-zoom-in
                  group-hover:scale-[5] group-hover:z-[100] group-hover:shadow-2xl group-hover:rounded-lg
                  absolute left-0 top-0" 
              />
            </div>

            {/* 中间：核心信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="font-black text-slate-800 text-lg truncate">{p.title}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider border border-indigo-100/50">{p.category}</span>
                  {p.is_banner && (
                    <span className="text-[9px] font-black text-white bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 rounded-md uppercase flex items-center gap-1 shadow-sm shadow-orange-100">
                      <LayoutGrid className="w-2.5 h-2.5" /> 首页轮播
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                {/* 颜色标签 */}
                {p.colors && p.colors.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Colors</span>
                    <div className="flex gap-1">
                      {p.colors.map(c => (
                        <span key={c} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200/50">{c}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 尺寸信息 */}
                {p.sizes && p.sizes.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Size</span>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50/50 px-1.5 py-0.5 rounded-sm">{p.sizes.join(' / ')}</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] opacity-60">
                  {p.description}
                </p>
              </div>
            </div>

            {/* 状态指示器 (更精简的 Featured) */}
            <div className="hidden lg:flex flex-col items-end gap-1 px-4">
               {p.is_featured ? (
                 <div className="flex items-center gap-1.5 text-emerald-600">
                   <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest">新品推荐中</span>
                 </div>
               ) : (
                 <span className="text-[10px] font-bold text-slate-300 uppercase">常规展示</span>
               )}
            </div>

            {/* 价格 */}
            <div className="text-right ml-4">
              <p className="text-xl font-black text-slate-900 tracking-tighter">${p.price}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Price</p>
            </div>

            {/* 管理按钮 */}
            <div className="flex items-center ml-6 border-l border-slate-100 pl-6">
              <button 
                onClick={() => handleDelete(p.id)} 
                className="p-3 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                title="移除商品"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">暂无上架作品，点击上方按钮开始发布吧</p>
          </div>
        )}
      </div>
    </div>
  );
}
