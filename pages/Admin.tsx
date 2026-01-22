
import React, { useState } from 'react';
import { useStore } from '../store';
import { Category, Product } from '../types';
import { CATEGORIES } from '../constants';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';
import {
  Plus, Trash2, ChevronLeft, ChevronRight, Search,
  Image as ImageIcon, Sparkles, Check, UploadCloud
} from 'lucide-react';

// --- iOS Components ---

const IOSCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden ${className}`}>
    {children}
  </div>
);

const IOSInput = ({ label, value, onChange, placeholder, type = "text", required = false }: any) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 pl-4 pr-4 bg-white hover:bg-[#F9F9F9] transition-colors group">
    <label className="text-[17px] font-medium text-slate-900 w-24 shrink-0">{label}</label>
    <input
      type={type}
      required={required}
      className={`bg-transparent text-right text-[17px] text-slate-500 placeholder:text-slate-300 outline-none flex-1 font-normal`}
      placeholder={placeholder || "Optional"}
      value={value}
      onChange={onChange}
    />
  </div>
);

const IOSSelect = ({ label, value, onChange, options }: any) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 pl-4 pr-4 bg-white hover:bg-[#F9F9F9] transition-colors">
    <label className="text-[17px] font-medium text-slate-900 w-24 shrink-0">{label}</label>
    <select
      className="bg-transparent text-right text-[17px] text-[#007AFF] outline-none flex-1 appearance-none cursor-pointer font-normal"
      value={value}
      onChange={onChange}
    >
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <ChevronRight className="w-4 h-4 text-slate-300 ml-2" />
  </div>
);

const IOSSwitch = ({ label, checked, onChange, icon: Icon, activeColor = "bg-[#34C759]" }: any) => (
  <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 pl-4 pr-4 bg-white hover:bg-[#F9F9F9] transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-white ${checked ? activeColor : 'bg-slate-400'}`}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <span className="text-[17px] font-medium text-slate-900">{label}</span>
    </div>
    <div className={`w-[51px] h-[31px] rounded-full p-0.5 transition-colors duration-300 ${checked ? activeColor : 'bg-[#E9E9EA]'}`}>
      <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`} />
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
      toast.success('Image Uploaded');
    } catch (err: any) {
      toast.error('Upload Failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) return toast.error('Please upload at least one image');

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
        toast.success('Published Successfully');
      }
    } catch (err: any) { toast.error('Network Error'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const adminPass = localStorage.getItem('admin_pass') || '';
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE', headers: { 'Authorization': adminPass } });
      if (res.ok) { await fetchProducts(); toast.success('Deleted'); }
    } catch (err: any) { toast.error('Error'); }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- iOS ADD ITEM VIEW ---
  if (isAdding) {
    return (
      <div className="bg-[#F2F2F7] min-h-screen pb-20 font-sans">
        {/* iOS Navigation Bar */}
        <div className="sticky top-0 z-50 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="max-w-2xl mx-auto px-4 h-[44px] flex items-center justify-between">
            <button
              onClick={() => setIsAdding(false)}
              className="text-[#007AFF] text-[17px] flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6 -ml-2" /> Back
            </button>
            <span className="font-semibold text-[17px] text-black">New Product</span>
            <button
              type="submit"
              form="ios-form"
              disabled={isUploading || formData.images.length === 0}
              className="text-[#007AFF] text-[17px] font-semibold disabled:opacity-30 hover:opacity-70 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-5 pt-6 animate-in slide-in-from-bottom-8 duration-500">
          <form id="ios-form" onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Image Upload (Prominent, like Photos app) */}
            <div className="flex justify-center">
              <div className="relative">
                <input type="file" id="up" accept="image/*" multiple className="hidden" onChange={handleFileChange} disabled={isUploading} />
                <label htmlFor="up" className="block w-32 h-32 rounded-full overflow-hidden bg-white shadow-lg border-4 border-white cursor-pointer active:scale-95 transition-transform relative group">
                  {isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                      <span className="text-xs font-bold text-slate-500">{uploadProgress}%</span>
                    </div>
                  ) : formData.images.length > 0 ? (
                    <img src={formData.images[0]} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 group-hover:bg-[#F9F9F9] transition-colors">
                      <div className="bg-[#F2F2F7] p-3 rounded-full mb-1">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Add Photo</span>
                    </div>
                  )}
                  {formData.images.length > 0 && <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] font-bold text-center py-1 backdrop-blur-md">EDIT</div>}
                </label>
                {formData.images.length > 1 && (
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-[#F2F2F7]">
                    +{formData.images.length - 1}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Basic Info (Inset Grouped) */}
            <div>
              <div className="pl-4 mb-2 text-[13px] uppercase text-slate-500 tracking-wide font-normal">Details</div>
              <IOSCard>
                <IOSInput label="Title" placeholder="Product Name" value={formData.title} onChange={(e: any) => setFormData({ ...formData, title: e.target.value })} required />
                <IOSInput label="Price" placeholder="$0.00" type="number" value={formData.price} onChange={(e: any) => setFormData({ ...formData, price: e.target.value })} required />
                <IOSSelect label="Category" options={CATEGORIES.filter(c => c !== Category.ALL)} value={formData.category} onChange={(e: any) => setFormData({ ...formData, category: e.target.value as Category })} />
              </IOSCard>
            </div>

            {/* Section 3: Description */}
            <div>
              <div className="pl-4 mb-2 text-[13px] uppercase text-slate-500 tracking-wide font-normal">Description</div>
              <IOSCard>
                <textarea
                  className="w-full p-4 text-[17px] text-slate-900 min-h-[120px] outline-none resize-none font-normal leading-relaxed"
                  placeholder="Tell us about this creation..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </IOSCard>
            </div>

            {/* Section 4: Specifications */}
            <div>
              <div className="pl-4 mb-2 text-[13px] uppercase text-slate-500 tracking-wide font-normal">Specs</div>
              <IOSCard>
                <IOSInput label="Colors" placeholder="e.g. Red, Blue" value={formData.colors} onChange={(e: any) => setFormData({ ...formData, colors: e.target.value })} />
                <IOSInput label="Sizes" placeholder="e.g. 15cm" value={formData.sizes} onChange={(e: any) => setFormData({ ...formData, sizes: e.target.value })} />
              </IOSCard>
            </div>

            {/* Section 5: Visibility */}
            <div>
              <div className="pl-4 mb-2 text-[13px] uppercase text-slate-500 tracking-wide font-normal">Visibility</div>
              <IOSCard>
                <IOSSwitch label="Featured Product" checked={formData.is_featured} onChange={(v: boolean) => setFormData({ ...formData, is_featured: v })} icon={Sparkles} activeColor="bg-[#FF9500]" />
                <IOSSwitch label="Home Banner" checked={formData.is_banner} onChange={(v: boolean) => setFormData({ ...formData, is_banner: v })} icon={ImageIcon} activeColor="bg-[#5E5CE6]" />
                {formData.is_banner && (
                  <IOSInput label="Banner Text" placeholder="Headline for banner" value={formData.banner_text} onChange={(e: any) => setFormData({ ...formData, banner_text: e.target.value })} />
                )}
              </IOSCard>
            </div>

          </form>
        </div>
      </div>
    );
  }

  // --- iOS LIST VIEW ---
  return (
    <div className="bg-[#F2F2F7] min-h-screen font-sans">
      {/* iOS Large Header */}
      <div className="sticky top-0 z-40 bg-[#F2F2F7]/90 backdrop-blur-xl border-b border-slate-300">
        <div className="max-w-4xl mx-auto px-5 pt-12 pb-2">
          <div className="flex justify-between items-end mb-2">
            <h1 className="text-[34px] font-bold text-black tracking-tight leading-none">Inventory</h1>
            <button
              onClick={() => setIsAdding(true)}
              className="w-9 h-9 bg-[#E5E5EA] rounded-full flex items-center justify-center text-[#007AFF] hover:bg-[#D1D1D6] transition-colors active:scale-90"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* iOS Search Bar */}
          <div className="relative mt-2 mb-2">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#E3E3E8] rounded-xl pl-9 pr-4 py-2 text-[17px] text-slate-900 placeholder:text-slate-500 outline-none focus:bg-[#DCDCDE] transition-colors"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6 pb-20">
        {/* iOS List Group */}
        <div className="pl-4 mb-2 text-[13px] uppercase text-slate-500 tracking-wide font-normal">All Products • {products.length}</div>

        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden">
          {filteredProducts.map((p, index) => (
            <div
              key={p.id}
              className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-[#F9F9F9] transition-colors cursor-default group h-[88px]"
            >
              {/* Product Thumbnail (iOS rounded rect) */}
              <div className="w-[56px] h-[56px] rounded-[10px] bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                <img src={p.image} className="w-full h-full object-cover" />

                {/* 1s Hover Enlarge Logic */}
                <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 group-hover:delay-1000 transition-opacity z-10 cursor-zoom-in">
                  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-2xl shadow-2xl p-1 z-50 border border-slate-200 animate-in zoom-in-50 duration-200">
                    <img src={p.image} className="w-full h-full object-cover rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center h-full space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-[17px] font-semibold text-black truncate">{p.title}</h3>
                  <span className="text-[15px] text-slate-400 font-normal">{new Date(p.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] text-slate-500">{p.category}</span>
                    {p.is_banner && <span className="px-1.5 py-0.5 bg-[#5E5CE6] text-white text-[10px] font-bold rounded-md">BANNER</span>}
                    {p.is_featured && <span className="px-1.5 py-0.5 bg-[#FF9500] text-white text-[10px] font-bold rounded-md">FEATURED</span>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[17px] font-normal text-black">${p.price}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="text-[#FF3B30] opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No Items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
