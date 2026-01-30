
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Product, CategoryEntity } from '../types';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';
import {
  ShoppingBag, LogOut, Plus, Search, Menu, X,
  Trash2, Edit, Upload, Filter, MoreHorizontal, LayoutGrid, ChevronLeft, ChevronRight,
  Settings, PlusCircle, ChevronUp, ChevronDown
} from 'lucide-react';
import axios from 'axios';

// --- COMPONENTS ---

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 border-b border-slate-100">
          <h3 className="text-lg md:text-xl font-bold text-wooly-brown tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 md:p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, required, children }: any) => (
  <div className="space-y-2">
    <label className="block text-base font-medium text-wooly-brown font-hand">
      {label} {required && <span className="text-wooly-pink-500">*</span>}
    </label>
    {children}
  </div>
);

// --- CONSTANTS ---

const INITIAL_FORM = {
  title: '',
  price: '',
  category: '',
  description: '',
  images: [] as string[],
  is_featured: false,
  is_banner: false,
  banner_text: '',
  tags: []
};

// --- MAIN ADMIN COMPONENT ---

export default function Admin() {
  const { products, deleteProduct, fetchProducts, categories, addCategory, deleteCategory, reorderCategories } = useStore();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSortingModalOpen, setIsSortingModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State
  const [formData, setFormData] = useState(INITIAL_FORM);

  // --- UPLOAD ABORT LOGIC ---
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopUploads = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  // --- HANDLERS ---

  const handleEdit = (product: Product) => {
    stopUploads();
    setEditingId(product.id);
    setFormData({
      title: product.title,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      images: product.images && product.images.length > 0 ? product.images : [product.image],
      is_featured: product.is_featured || false,
      is_banner: product.is_banner || false,
      banner_text: product.banner_text || '',
      tags: product.tags || []
    });
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    stopUploads();
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check Limits
    const limit = 6;
    const currentCount = formData.images.length;
    if (currentCount + files.length > limit) {
      toast.error('单类商品最多上传 6 张图片');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [...formData.images];

    // Create new controller for this batch
    abortControllerRef.current = new AbortController();

    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImage(
          files[i],
          (p) => setUploadProgress(Math.round(((i / files.length) * 100) + (p / files.length))),
          abortControllerRef.current.signal
        );
        uploadedUrls.push(url);
      }
      setFormData(prev => ({ ...prev, images: uploadedUrls }));
      toast.success('图片上传成功');
    } catch (err: any) {
      if (err.name === 'CanceledError' || axios.isCancel(err)) {
        console.log('Upload aborted by user');
        return;
      }
      console.error(err);
      const data = err.response?.data;
      const msg = data?.message || data?.error || err.message || '上传未知错误';
      toast.error(`上传失败: ${msg}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle Banner Check Logic
  const handleBannerCheck = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_banner: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.category) return toast.error('请选择商品分类');
    if (formData.images.length === 0) return toast.error('请上传商品图片');

    setIsSubmitting(true);
    const productPayload = {
      ...formData,
      image: formData.images[0], // Main image
      images: formData.images,   // All images
      tags: formData.tags.map(s => s.trim()).filter(Boolean),
      stock: 999 // Default high stock as requested to ignore inventory
    };

    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...productPayload, id: editingId } : productPayload;

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': adminPass },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        await fetchProducts();
        setFormData(INITIAL_FORM); // Clear
        setIsModalOpen(false);
        toast.success(editingId ? '商品更新成功' : '商品发布成功');
      } else {
        const data = await res.json();
        toast.error(`${editingId ? '更新' : '发布'}失败: ${data.error} - ${data.message || ''}`);
      }
    } catch (err: any) {
      toast.error(`网络错误: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除该商品吗？')) return;
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE', headers: { 'Authorization': adminPass } });
      if (res.ok) {
        // Optimistic update using store action
        useStore.getState().deleteProduct(id);
        toast.success('商品已删除');
      }
      else { toast.error('删除失败'); }
    } catch (err: any) { toast.error('删除请求异常'); }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-wooly-cream/50 font-sans text-wooly-brown">

      {/* --- TOP NAVBAR --- */}
      <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-wooly-cream px-4 md:px-10 flex items-center justify-between sticky top-0 z-40 shadow-soft">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 bg-wooly-pink-400 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-pink-100 shrink-0 font-hand">H</div>
          <span className="font-bold text-xl md:text-2xl tracking-tight text-wooly-brown truncate font-hand">Hook 后台</span>
          <div className="hidden sm:block h-6 w-px bg-wooly-cream mx-1 md:mx-2"></div>
          <span className="hidden sm:block text-base font-medium text-wooly-brown bg-wooly-cream px-3 py-0.5 rounded-full">商品管理</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center text-base text-slate-500">
            <span className="font-medium text-slate-700">{filteredProducts.length}</span>
            <span className="mx-1">个商品</span>
          </div>
          <button onClick={() => window.location.href = '/admin/login'} className="flex items-center gap-2 px-2 md:px-3 py-1.5 text-slate-500 hover:text-pink-600 hover:bg-red-50 rounded-lg transition-colors text-base font-medium group">
            <LogOut className="w-4 h-4" />
            <span className="hidden xs:inline">退出登录</span>
          </button>
        </div>
      </header>

      {/* --- CONTROL BAR --- */}
      <div className="px-4 md:px-10 py-6 md:py-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-wooly-brown tracking-tight">商品列表</h1>
            <p className="text-base text-slate-500">管理您的商品、价格及展示状态。</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:flex-1 md:w-80 group">
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 md:py-3 text-base focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all shadow-sm"
                placeholder="搜索商品名称..."
              />
              <Search className="absolute left-4 top-3 md:top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
            </div>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
            >
              <Settings className="w-5 h-5 text-pink-600" />
              <span>分类与排序</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="w-full sm:w-auto bg-wooly-pink-400 hover:bg-wooly-pink-500 text-white px-6 py-2.5 md:py-3 rounded-2xl text-base font-bold shadow-cute transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <PlusCircle className="w-5 h-5" />
              <span>发布新商品</span>
            </button>
          </div>
        </div>

        {/* --- MAIN PRODUCT LIST --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider w-24">图片</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">商品信息</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">状态标签</th>
                  <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">价格</th>
                  <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="group hover:bg-wooly-cream/30 transition-colors border-b border-wooly-cream">
                    <td className="px-8 py-4">
                      <div className="w-16 h-16 rounded-xl bg-wooly-cream border border-wooly-pink-100 overflow-hidden shadow-sm">
                        <img src={p.image} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[300px]">
                        <h4 className="font-bold text-wooly-brown text-base mb-1 truncate font-hand">{p.title}</h4>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-wooly-cream text-wooly-brown border border-wooly-pink-100 uppercase tracking-tight">
                            {p.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {p.is_featured && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> 推荐
                          </span>
                        )}
                        {p.is_banner && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-wooly-pink-100 text-wooly-pink-500 border border-wooly-pink-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-wooly-pink-400"></span> 首页横幅
                          </span>
                        )}
                        {!p.is_featured && !p.is_banner && (
                          <span className="text-sm text-slate-300 font-medium px-2">普通</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-wooly-brown tracking-tight text-base font-mono">¥{p.price.toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 bg-white border border-wooly-cream text-wooly-brown/40 hover:text-wooly-pink-500 hover:border-wooly-pink-300 rounded-lg transition-all shadow-sm" title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-white border border-wooly-cream text-wooly-brown/40 hover:text-orange-600 hover:border-orange-300 rounded-lg transition-all shadow-sm" title="删除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden divide-y divide-wooly-cream">
            {filteredProducts.map(p => (
              <div key={p.id} className="p-4 flex gap-4 items-start bg-white active:bg-wooly-cream transition-colors">
                <div className="w-20 h-20 rounded-xl bg-wooly-cream border border-wooly-pink-100 overflow-hidden shadow-sm shrink-0">
                  <img src={p.image} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-wooly-brown text-base truncate font-hand">{p.title}</h4>
                    <span className="font-mono font-bold text-wooly-pink-500 text-base whitespace-nowrap">¥{p.price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-wooly-cream text-wooly-brown border border-wooly-pink-100 uppercase tracking-tight">
                      {p.category}
                    </span>
                    {p.is_featured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                        <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse"></span> 推荐
                      </span>
                    )}
                    {p.is_banner && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-wooly-pink-100 text-wooly-pink-500 border border-wooly-pink-300">
                        <span className="w-1 h-1 rounded-full bg-wooly-pink-400"></span> 横幅
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex items-center gap-1 text-xs font-bold text-wooly-brown hover:text-wooly-pink-500 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex items-center gap-1 text-xs font-bold text-wooly-brown hover:text-orange-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="px-6 py-20 text-center text-wooly-brown/40">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold font-hand">暂无商品数据</p>
              <p className="text-sm">点击上方“发布新商品”开始吧</p>
            </div>
          )}

          <div className="px-6 py-4 bg-wooly-cream/30 border-t border-wooly-cream flex items-center justify-between">
            <span className="text-xs font-bold text-wooly-brown uppercase tracking-wider opacity-60">
              共 {filteredProducts.length} 个商品
            </span>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1 bg-white border border-wooly-cream rounded-lg text-xs font-bold text-wooly-brown opacity-40">上一页</button>
              <button disabled className="px-3 py-1 bg-white border border-wooly-cream rounded-lg text-xs font-bold text-wooly-brown opacity-40">下一页</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD/EDIT PRODUCT MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          stopUploads();
          setIsModalOpen(false);
        }}
        title={editingId ? "编辑商品" : "发布新商品"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="商品名称" required>
              <input
                required
                className="w-full bg-wooly-cream/40 border border-wooly-cream rounded-2xl px-4 py-3 text-base focus:bg-white focus:ring-4 focus:ring-wooly-pink-100 focus:border-wooly-pink-300 outline-none transition-all shadow-sm"
                placeholder="输入商品名称"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </InputGroup>
            <InputGroup label="价格 (¥)" required>
              <input
                required
                type="number"
                className="w-full bg-wooly-cream/40 border border-wooly-cream rounded-2xl px-4 py-3 text-base focus:bg-white focus:ring-4 focus:ring-wooly-pink-100 focus:border-wooly-pink-300 outline-none transition-all shadow-sm"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </InputGroup>
          </div>

          <InputGroup label="分类" required>
            <select
              required
              className="w-full bg-wooly-cream/40 border border-wooly-cream rounded-2xl px-4 py-3 text-base focus:bg-white focus:ring-4 focus:ring-wooly-pink-100 focus:border-wooly-pink-300 outline-none transition-all shadow-sm"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">请选择分类</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </InputGroup>

          <InputGroup label="商品描述" required>
            <textarea
              required
              className="w-full bg-wooly-cream/40 border border-wooly-cream rounded-2xl px-4 py-3 h-32 text-base resize-none focus:bg-white focus:ring-4 focus:ring-wooly-pink-100 focus:border-wooly-pink-300 outline-none transition-all shadow-sm"
              placeholder="详细描述您的手工好物..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </InputGroup>

          <InputGroup label="商品图片 (最多 6 张)" required>
            <div className="border-4 border-dashed border-wooly-cream rounded-[32px] p-10 bg-wooly-cream/20 hover:bg-white hover:border-wooly-pink-300 group transition-all text-center cursor-pointer relative">
              <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileChange} disabled={isUploading} />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2 animate-pulse">
                  <div className="w-12 h-12 border-4 border-wooly-cream border-t-wooly-pink-400 rounded-full animate-spin mb-2" />
                  <span className="text-wooly-pink-500 font-bold font-hand text-xl">上传中... {uploadProgress}%</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 group-hover:-translate-y-1 transition-transform">
                  <div className="w-16 h-16 bg-wooly-pink-100 text-wooly-pink-500 rounded-full flex items-center justify-center shadow-cute rotate-3 group-hover:rotate-12 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-wooly-brown font-hand mb-1">点我加入新图片</p>
                    <p className="text-sm text-wooly-brown/40">支持 JPG, PNG, WebP 格式</p>
                  </div>
                </div>
              )}
            </div>

            {formData.images.length > 0 && (
              <div className="flex gap-4 mt-6 overflow-x-auto pb-4 pt-2 px-1">
                {formData.images.map((url, i) => (
                  <div key={url} className="w-24 h-24 rounded-2xl border-2 border-wooly-cream overflow-hidden relative shrink-0 group shadow-md hover:shadow-cute transition-all transform hover:-rotate-3">
                    <img src={url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-wooly-brown/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px] gap-2">
                      <div className="flex gap-1">
                        {i > 0 && (
                          <button type="button" onClick={() => {
                            const newImgs = [...formData.images];
                            [newImgs[i - 1], newImgs[i]] = [newImgs[i], newImgs[i - 1]];
                            setFormData({ ...formData, images: newImgs });
                          }} className="p-1 bg-white/20 hover:bg-white/40 rounded text-white">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        )}
                        {i < formData.images.length - 1 && (
                          <button type="button" onClick={() => {
                            const newImgs = [...formData.images];
                            [newImgs[i + 1], newImgs[i]] = [newImgs[i], newImgs[i + 1]];
                            setFormData({ ...formData, images: newImgs });
                          }} className="p-1 bg-white/20 hover:bg-white/40 rounded text-white">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-xl text-white shadow-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </InputGroup>

          <div className="flex flex-col sm:flex-row gap-6 border-t border-wooly-cream pt-8">
            <label className="flex items-center gap-4 cursor-pointer group select-none">
              <input type="checkbox" className="peer w-6 h-6 text-wooly-pink-400 border-wooly-cream rounded-lg focus:ring-wooly-pink-200 cursor-pointer" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
              <span className="text-lg font-bold text-wooly-brown/60 group-hover:text-wooly-brown transition-colors font-hand">推荐到首页</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group select-none">
              <input type="checkbox" className="peer w-6 h-6 text-wooly-pink-400 border-wooly-cream rounded-lg focus:ring-wooly-pink-200 cursor-pointer" checked={formData.is_banner} onChange={e => handleBannerCheck(e.target.checked)} />
              <span className="text-lg font-bold text-wooly-brown/60 group-hover:text-wooly-brown transition-colors font-hand">设为首页横幅</span>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button type="button" onClick={() => {
              stopUploads();
              setIsModalOpen(false);
            }} className="px-8 py-3 rounded-2xl border-2 border-wooly-cream text-wooly-brown/60 hover:text-wooly-brown hover:bg-wooly-cream/20 font-bold transition-all font-hand text-lg">
              取消
            </button>
            <button type="submit" disabled={isUploading || isSubmitting || formData.images.length === 0} className="px-10 py-3 rounded-2xl bg-wooly-pink-400 hover:bg-wooly-pink-500 text-white font-bold text-lg shadow-cute hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-2">
              {isSubmitting && <Plus className="animate-spin w-5 h-5" />}
              <span>{isSubmitting ? '正在发布...' : (editingId ? '保存修改' : '立即发布')}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* --- CATEGORY MANAGEMENT MODAL --- */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="分类管理">
        <div className="space-y-8">
          <div className="flex gap-3">
            <input type="text" placeholder="给新分区起个好名字..." className="flex-1 bg-wooly-cream/30 border border-wooly-cream rounded-2xl px-5 py-3 text-base outline-none focus:ring-4 focus:ring-wooly-pink-100 transition-all font-bold text-wooly-brown" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
            <button onClick={async () => {
              if (!newCategoryName.trim()) return;
              await addCategory(newCategoryName.trim());
              setNewCategoryName('');
              toast.success('分类添加成功');
            }} className="px-6 py-3 bg-wooly-pink-400 text-white rounded-2xl font-bold shadow-cute hover:-translate-y-1 active:scale-95 transition-all">添加</button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-wooly-cream/50 hover:border-wooly-pink-200 transition-all group">
                <span className="font-bold text-wooly-brown text-lg font-hand ml-2">{cat.name}</span>
                <button onClick={async () => {
                  if (window.confirm(`确定要删除 "${cat.name}" 分类吗？`)) {
                    await deleteCategory(cat.id);
                    toast.success('分类已离去');
                  }
                }} className="p-2 text-wooly-brown/20 hover:text-red-500 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* --- SORTING MODAL --- */}
      <Modal isOpen={isSortingModalOpen} onClose={() => setIsSortingModalOpen(false)} title="首页/商品排序">
        <div className="space-y-8">
          <p className="text-wooly-brown/60 font-hand text-lg">上下拖动或点击箭头，调整商品在首页的展示顺序哦 🧶</p>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat, index) => (
              <div key={cat.id} className="flex items-center justify-between p-5 bg-white rounded-[32px] border-2 border-wooly-cream shadow-sm hover:shadow-cute transition-all group overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-wooly-pink-100 text-wooly-pink-500 font-bold flex items-center justify-center font-hand text-xl">
                    {index + 1}
                  </div>
                  <span className="font-bold text-wooly-brown text-xl font-hand">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={index === 0} onClick={() => {
                    const n = [...categories];[n[index - 1], n[index]] = [n[index], n[index - 1]];
                    reorderCategories(n);
                  }} className="p-3 bg-wooly-cream/30 hover:bg-wooly-pink-100 rounded-2xl transition-all disabled:opacity-20 text-wooly-pink-500"><ChevronUp className="w-6 h-6" /></button>
                  <button disabled={index === categories.length - 1} onClick={() => {
                    const n = [...categories];[n[index + 1], n[index]] = [n[index], n[index + 1]];
                    reorderCategories(n);
                  }} className="p-3 bg-wooly-cream/30 hover:bg-wooly-pink-100 rounded-2xl transition-all disabled:opacity-20 text-wooly-pink-500"><ChevronDown className="w-6 h-6" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

const UploadCloudIcon = ({ className }: any) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);
