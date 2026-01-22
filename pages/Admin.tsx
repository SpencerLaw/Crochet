
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, ShoppingBag, Settings, LogOut,
  Plus, Search, Bell, Menu, X, ChevronRight, Upload,
  MoreVertical, Trash2, Edit, Image as ImageIcon
} from 'lucide-react';

// --- COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${active
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, required, children }: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// --- MAIN ADMIN COMPONENT ---

export default function Admin() {
  const { products, fetchProducts } = useStore();
  const [activeTab, setActiveTab] = useState('products');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
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
      const msg = err.response?.data?.error || err.message || '上传未知错误';
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
        // UPDATED: Show detailed server message
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
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">H</div>
          <span className="font-bold text-xl tracking-tight">Hook Admin</span>
        </div>

        <nav className="p-4 space-y-2">
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Main</div>
          <SidebarItem icon={LayoutDashboard} label="概览" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={ShoppingBag} label="商品管理" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />

          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6">System</div>
          <SidebarItem icon={Settings} label="系统设置" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-slate-800">
          <button onClick={() => window.location.href = '/admin/login'} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg w-full transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* --- CONTENT --- */}
      <main className={`flex-1 transition-all duration-300 flex flex-col min-h-screen ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {activeTab === 'dashboard' ? '仪表盘' : activeTab === 'products' ? '商品列表' : '设置'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                className="bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all"
                placeholder="搜索全站..."
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* PAGE CONTENT WRAPPER - Centered */}
        <div className="flex-1 p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">

            {activeTab === 'products' ? (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <input
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-sm transition-all"
                      placeholder="搜索商品..."
                    />
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>发布新商品</span>
                  </button>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4 w-24 text-center">图示</th>
                          <th className="px-6 py-4">商品名称</th>
                          <th className="px-6 py-4">分类/标签</th>
                          <th className="px-6 py-4">价格</th>
                          <th className="px-6 py-4">库存</th>
                          <th className="px-6 py-4 text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group relative">
                            <td className="px-6 py-3 overflow-visible z-10">
                              {/* THUMBNAIL CONTAINER */}
                              <div className="relative w-12 h-12">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer">
                                  <img src={p.image} className="w-full h-full object-cover" />
                                </div>

                                {/* HOVER ZOOM POPUP - Fixed Position & Z-Index */}
                                <div className="absolute left-[120%] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-[100] drop-shadow-2xl">
                                  <div className="w-48 h-48 bg-white p-1.5 rounded-xl border border-slate-200 relative">
                                    <img src={p.image} className="w-full h-full object-cover rounded-lg" />
                                    {/* Triangle Arrow */}
                                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-white border-b-[8px] border-b-transparent"></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.title}</p>
                              <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[200px]">{p.description.substring(0, 30)}...</p>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex flex-col items-start gap-1.5">
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  {p.category}
                                </span>
                                <div className="flex gap-1">
                                  {p.is_featured && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Featured</span>}
                                  {p.is_banner && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Banner</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3 font-medium text-slate-900">
                              ${p.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-3 text-slate-500">
                              {p.stock}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-2 text-slate-400">
                                <button className="p-2 hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                              没有找到相关商品
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>显示 {filteredProducts.length} 个商品</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50" disabled>上一页</button>
                      <button className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50" disabled>下一页</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Settings className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">该模块正在开发中</p>
              </div>
            )}
          </div>
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
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="输入商品名称"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </InputGroup>
            <InputGroup label="价格 ($)" required>
              <input
                required
                type="number"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </InputGroup>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <InputGroup label="商品分类">
              <select
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
              >
                {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </InputGroup>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="颜色 (逗号隔开)">
                <input
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="红, 蓝, 白"
                  value={formData.colors}
                  onChange={e => setFormData({ ...formData, colors: e.target.value })}
                />
              </InputGroup>
              <InputGroup label="尺寸">
                <input
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                  placeholder="15cm"
                  value={formData.sizes}
                  onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                />
              </InputGroup>
            </div>
          </div>

          <InputGroup label="商品描述" required>
            <textarea
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="详细描述..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </InputGroup>

          <InputGroup label="商品图片" required>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all text-center group cursor-pointer relative">
              <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} disabled={isUploading} />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-indigo-600">正在上传... {uploadProgress}%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-500">
                  <UploadCloudIcon className="w-8 h-8" />
                  <span className="text-sm font-medium">点击或拖拽上传图片</span>
                </div>
              )}
            </div>
            {formData.images.length > 0 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                {formData.images.map((url, i) => (
                  <div key={url} className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden relative shrink-0 group">
                    <img src={url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                      className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </InputGroup>

          <div className="flex gap-6 border-t border-slate-100 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
              <span className="text-sm font-medium text-slate-700">设为推荐商品</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" checked={formData.is_banner} onChange={e => setFormData({ ...formData, is_banner: e.target.checked })} />
              <span className="text-sm font-medium text-slate-700">设为首页横幅</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isUploading || formData.images.length === 0}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              发布商品
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
