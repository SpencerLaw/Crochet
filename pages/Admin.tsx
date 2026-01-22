
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';
import {
  ShoppingBag, LogOut, Plus, Search, Menu, X,
  Trash2, Edit, Upload, Filter, MoreHorizontal
} from 'lucide-react';

// --- COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative group ${active
        ? 'text-white bg-slate-800'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
  >
    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />}
    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
    <span>{label}</span>
  </button>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, required, children }: any) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// --- MAIN ADMIN COMPONENT ---

export default function Admin() {
  const { products, fetchProducts } = useStore();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Upload State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    title: '', price: '', category: Category.PLUSHIES, description: '',
    images: [] as string[], is_featured: false, is_banner: false, banner_text: '',
    colors: '', sizes: '', tags: ''
  });

  // --- HANDLERS ---

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
      toast.success('图片上传成功');
    } catch (err: any) {
      console.error(err);
      const data = err.response?.data;
      const msg = data?.message || data?.error || err.message || '上传未知错误';
      toast.error(`上传失败: ${msg}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) return toast.error('请至少上传一张图片');

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
        resetForm();
        setIsModalOpen(false);
        toast.success('商品发布成功');
      } else {
        const data = await res.json();
        toast.error(`发布失败: ${data.error} - ${data.message || ''}`);
      }
    } catch (err: any) {
      toast.error(`网络错误: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除该商品吗？')) return;
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE', headers: { 'Authorization': adminPass } });
      if (res.ok) { await fetchProducts(); toast.success('商品已删除'); }
      else { toast.error('删除失败'); }
    } catch (err: any) { toast.error('删除请求异常'); }
  };

  const resetForm = () => {
    setFormData({ title: '', price: '', category: Category.PLUSHIES, description: '', images: [], is_featured: false, is_banner: false, banner_text: '', colors: '', sizes: '', tags: '' });
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-indigo-500/30">H</div>
          <span className="font-bold text-lg tracking-wide text-white">Hook Admin</span>
        </div>

        <nav className="mt-8 px-2 space-y-1">
          <div className="px-4 pb-2 text-xs font-bold text-slate-600 uppercase tracking-wider">Store</div>
          <SidebarItem icon={ShoppingBag} label="Products" active={true} onClick={() => { }} />
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-800/50">
          <button onClick={() => window.location.href = '/admin/login'} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors w-full group">
            <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-1 transition-all duration-300 flex flex-col min-h-screen bg-white ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>

        {/* TOP TOOLBAR */}
        <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">商品管理</h1>
            <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">{filteredProducts.length} items</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-72 bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400"
                placeholder="搜索商品名称..."
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-indigo-200" />
              <span>添加商品</span>
            </button>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">预览</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">商品信息</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">价格</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">库存</th>
                <th className="px-8 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-4">
                    <div className="relative w-14 h-14">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm cursor-zoom-in">
                        <img src={p.image} className="w-full h-full object-cover" />
                      </div>
                      {/* Enhanced Hover Zoom */}
                      <div className="absolute left-16 top-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-50 origin-top-left scale-95 group-hover:scale-100">
                        <div className="w-64 h-64 bg-white p-1.5 rounded-2xl shadow-2xl border border-slate-100 relative">
                          <img src={p.image} className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute top-4 left-0 -ml-2 w-4 h-4 bg-white transform rotate-45 border-l border-b border-slate-100"></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[240px]">
                      <h4 className="font-semibold text-slate-900 mb-1 truncate">{p.title}</h4>
                      <p className="text-slate-500 text-xs truncate leading-relaxed">{p.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                      <div className="flex gap-1.5">
                        {p.is_featured && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wide border border-amber-100">Hot</span>}
                        {p.is_banner && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wide border border-indigo-100">Banner</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 tracking-tight">${p.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span className="text-sm text-slate-600 font-medium">{p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-all shadow-sm">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 rounded-lg transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ShoppingBag className="w-12 h-12 mb-3 text-slate-200" />
                      <p className="text-sm font-medium">暂无商品数据</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* --- ADD PRODUCT MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="发布新商品"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <InputGroup label="商品名称" required>
              <input
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="输入商品名称"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </InputGroup>
            <InputGroup label="价格 ($)" required>
              <input
                required
                type="number"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </InputGroup>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputGroup label="分类">
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
              >
                {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </InputGroup>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="颜色">
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="逗号隔开"
                  value={formData.colors}
                  onChange={e => setFormData({ ...formData, colors: e.target.value })}
                />
              </InputGroup>
              <InputGroup label="尺寸">
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="如: 15cm"
                  value={formData.sizes}
                  onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                />
              </InputGroup>
            </div>
          </div>

          <InputGroup label="商品描述" required>
            <textarea
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 h-24 text-sm resize-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              placeholder="详细描述..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </InputGroup>

          <InputGroup label="商品图片" required>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 bg-slate-50 hover:bg-white hover:border-indigo-400 hover:shadow-lg transition-all text-center cursor-pointer relative group">
              <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} disabled={isUploading} />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-indigo-600 text-xs font-bold uppercase tracking-wide">Uploading {uploadProgress}%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 transition-transform group-hover:-translate-y-1">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <UploadCloudIcon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">点击上传图片</p>
                    <p className="text-xs text-slate-400">支持 JPG, PNG, WebP</p>
                  </div>
                </div>
              )}
            </div>

            {formData.images.length > 0 && (
              <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
                {formData.images.map((url, i) => (
                  <div key={url} className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden relative shrink-0 group shadow-sm hover:shadow-md transition-all">
                    <img src={url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[1px]">
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                        className="text-white hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InputGroup>

          <div className="flex gap-6 border-t border-slate-100 pt-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer transition-all" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Featured Product</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" className="peer w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer transition-all" checked={formData.is_banner} onChange={e => setFormData({ ...formData, is_banner: e.target.checked })} />
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Homepage Banner</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || formData.images.length === 0}
              className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Product</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const UploadCloudIcon = ({ className }: any) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);
