
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category, Product } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { Button } from '../components/Components';
import { Toaster, toast } from 'react-hot-toast';
import { Image as ImageIcon, PlusCircle, Trash2, X, Loader2 } from 'lucide-react';

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
        const url = await uploadImage(files[i], (p) => {
          const overall = Math.round(((i / files.length) * 100) + (p / files.length));
          setUploadProgress(overall);
        });
        uploadedUrls.push(url);
      }
      setFormData(prev => ({ ...prev, images: uploadedUrls }));
      toast.success(`上传成功`);
    } catch (err: any) {
      toast.error('失败: ' + err.message);
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': adminPass
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        await fetchProducts();
        setFormData({ title: '', price: '', category: Category.PLUSHIES, description: '', images: [], is_featured: false, is_banner: false, banner_text: '', colors: '', sizes: '', tags: '' });
        setIsAdding(false);
        toast.success('商品已发布！');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除吗？')) return;
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch(`/api/products?id=${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': adminPass }
      });
      if (res.ok) { await fetchProducts(); toast.success('删除成功'); }
    } catch (err: any) { toast.error('删除失败'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">商品管理</h1>
          <p className="text-slate-500 mt-1">管理你的钩织作品和首页展示</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          {isAdding ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          {isAdding ? '取消添加' : '发布新商品'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 mb-10 animate-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">商品名称</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">价格 ($)</label>
                <input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">分类</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">商品描述</label>
              <textarea required className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="grid grid-cols-3 gap-4">
               <input placeholder="颜色 (逗号分隔)" className="p-4 bg-slate-50 rounded-2xl border-none" value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})} />
               <input placeholder="尺寸 (如: 20cm)" className="p-4 bg-slate-50 rounded-2xl border-none" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} />
               <input placeholder="标签 (如: 热门)" className="p-4 bg-slate-50 rounded-2xl border-none" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
            </div>

            <div className="flex gap-6 p-4 bg-slate-50 rounded-2xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5 accent-indigo-600" />
                <span className="font-bold">新品推荐</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_banner} onChange={e => setFormData({...formData, is_banner: e.target.checked})} className="w-5 h-5 accent-indigo-600" />
                <span className="font-bold">首页轮播</span>
              </label>
            </div>

            <div className="relative">
              <input type="file" id="admin-upload" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />
              <label htmlFor="admin-upload" className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                {isUploading ? (
                  <div className="w-full max-w-xs text-center">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <span className="text-indigo-600 font-bold">正在处理... {uploadProgress}%</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-slate-300 mb-2" />
                    <span className="text-slate-500 font-bold">点击或拖拽图片上传 (多图)</span>
                  </>
                )}
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden shadow-sm aspect-square">
                    <img src={url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="text-white w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button disabled={isUploading || formData.images.length === 0} className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold text-lg disabled:bg-slate-200 transition-colors">
              立即发布
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className="p-6">商品信息</th>
              <th className="p-6">分类</th>
              <th className="p-6">价格</th>
              <th className="p-6 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                    <div>
                      <p className="font-bold text-slate-900">{p.title}</p>
                      <div className="flex gap-2 mt-1">
                        {p.is_banner && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase font-bold">Banner</span>}
                        {p.is_featured && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase font-bold">Featured</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6"><span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{p.category}</span></td>
                <td className="p-6 font-bold text-slate-900">${p.price}</td>
                <td className="p-6 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
