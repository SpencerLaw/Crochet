
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
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Package className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase">商品总数</p><p className="text-2xl font-black text-slate-800">{products.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><DollarSign className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase">总价值</p><p className="text-2xl font-black text-slate-800">${totalValue}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><Layers className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase">轮播位</p><p className="text-2xl font-black text-slate-800">{bannerCount}/5</p></div>
        </div>
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600"><Tag className="w-6 h-6" /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase">分类数</p><p className="text-2xl font-black text-slate-800">{CATEGORIES.length - 1}</p></div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">作品管理中心</h1>
          <p className="text-slate-500 font-medium">让每一件手工钩织都能被温暖展示</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-5 h-5" /></button>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            {isAdding ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            {isAdding ? '取消操作' : '上架新品'}
          </button>
        </div>
      </div>

      {isAdding && (
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

      {/* 作品展示区 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {p.is_banner && <span className="bg-amber-400/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Banner</span>}
                  {p.is_featured && <span className="bg-emerald-400/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Featured</span>}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                   <button onClick={() => handleDelete(p.id)} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform translate-y-4 group-hover:translate-y-0">
                     <Trash2 className="w-4 h-4" /> 移除商品
                   </button>
                </div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{p.category}</span>
                <h3 className="font-bold text-slate-800 text-lg truncate mt-1">{p.title}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-black text-slate-900">${p.price}</span>
                  <span className="text-xs font-bold text-slate-400">库存: {p.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="p-6 pl-8">作品详情 (悬浮预览图)</th>
                <th className="p-6">分类</th>
                <th className="p-6 text-center">状态</th>
                <th className="p-6">单价</th>
                <th className="p-6 text-right pr-8">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                  <td className="p-4 pl-8">
                    <div className="flex items-center gap-6">
                      {/* 缩略图：默认极小，悬浮放大 */}
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <img 
                          src={p.image} 
                          className="w-full h-full rounded-xl object-cover shadow-sm transition-all duration-500 group-hover:scale-[3.5] group-hover:z-50 group-hover:shadow-2xl group-hover:rounded-2xl ring-2 ring-white" 
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{p.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate max-w-[300px]">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-tighter">Category</span>
                      <span className="text-xs font-bold text-slate-600">{p.category}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-1">
                      {p.is_banner && <div className="w-2 h-2 rounded-full bg-amber-400" title="Banner" />}
                      {p.is_featured && <div className="w-2 h-2 rounded-full bg-emerald-400" title="Featured" />}
                      {!p.is_banner && !p.is_featured && <div className="w-2 h-2 rounded-full bg-slate-200" />}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-mono font-black text-slate-900 text-lg">${p.price}</p>
                  </td>
                  <td className="p-4 text-right pr-8">
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className="p-3 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
