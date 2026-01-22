import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, MessageCircle, LogOut, Package, Sparkles, Image as ImageIcon, Trash2, ArrowRight, Home as HomeIcon, Store, Heart, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useStore } from './store';
import { Button, ProductCard, CategoryBadge } from './components/Components';
import { Category, Product } from './types';
import { CATEGORIES } from './constants';
import { uploadImage } from './services/imageService';

// --- COMPONENTS ---

const MobileTabBar = () => {
  const { cart } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const tabs = [
    { id: 'home', icon: HomeIcon, label: '首页', path: '/' },
    { id: 'shop', icon: Store, label: '商店', path: '/shop' },
    { id: 'cart', icon: ShoppingBag, label: '清单', path: '/cart', badge: cartCount },
    { id: 'contact', icon: MessageCircle, label: '联系', path: '/contact' },
  ];

  return (
    <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
      <div className="
        flex justify-between items-center px-8 py-4
        bg-white/60 backdrop-blur-3xl
        rounded-[32px]
        shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]
        border border-white/50
        ring-1 ring-white/40
      ">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-out ${
                isActive ? 'text-wooly-pink-500 scale-110 drop-shadow-sm' : 'text-gray-400 hover:text-wooly-brown'
              }`}
            >
              <div className="relative">
                <tab.icon
                  className={`w-7 h-7 transition-all duration-300 ${isActive ? 'fill-wooly-pink-500/20 stroke-[2.5px]' : 'stroke-[2px]'}`}
                />
                {tab.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-wooly-pink-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- MOBILE HEADER (Static, scrolls away) ---
const MobileHeader = () => {
  return (
    <div className="md:hidden pt-8 px-6 pb-2 flex items-center justify-center animate-in fade-in slide-in-from-top-4 duration-700">
       <div className="flex items-center gap-2 opacity-80">
          <div className="w-8 h-8 bg-wooly-pink-300/50 rounded-full flex items-center justify-center text-lg backdrop-blur-sm shadow-sm text-white">
            🧶
          </div>
          <span className="font-hand text-2xl font-bold text-wooly-brown/90 tracking-wide">董董手作</span>
       </div>
    </div>
  );
};

// --- NAV BAR (DESKTOP ONLY) ---
const Navbar = () => {
  const { cart } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Hidden on mobile (md:block) to prevent blocking content
  return (
    <nav className="hidden md:block sticky top-4 z-50 mx-4">
      <div className="bg-white/90 backdrop-blur-md rounded-full shadow-soft px-6 py-3 flex items-center justify-between max-w-7xl mx-auto border border-white">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-wooly-pink-300 rounded-full flex items-center justify-center group-hover:animate-spin">
            <span className="text-2xl">🧶</span>
          </div>
          <span className="font-hand text-2xl font-bold text-wooly-brown">董董手作</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-sans font-semibold text-wooly-brown">
          <Link to="/" className="hover:text-wooly-pink-500 transition-colors">首页</Link>
          <Link to="/shop" className="hover:text-wooly-pink-500 transition-colors">商店</Link>
          <Link to="/contact" className="hover:text-wooly-pink-500 transition-colors">联系店主</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Desktop Cart Icon */}
          <Link to="/cart" className="hidden md:flex relative p-2 hover:bg-wooly-pink-100 rounded-full transition-colors">
            <ShoppingBag className="w-6 h-6 text-wooly-brown" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-wooly-pink-400 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>
          
          <Link to="/contact" className="hidden md:block">
             <Button variant="secondary" className="!py-1.5 !px-5 text-sm flex items-center gap-2">
               <MessageCircle className="w-4 h-4" /> 找董董
             </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

// --- PAGES ---

// 1. HOME
const Home = () => {
  const { products, addToCart } = useStore();
  const navigate = useNavigate();
  
  // Dynamic Banners and Featured
  const bannersFromDB = products.filter(p => p.is_banner);
  const featuredProducts = products.filter(p => p.is_featured);

  // Fallback to defaults if DB is empty
  const banners = bannersFromDB.length > 0 ? bannersFromDB.map(p => ({
    id: p.id,
    title: p.banner_text || p.title,
    subtitle: p.description,
    image: p.image,
    icon: "🧶"
  })) : [
    { id: 1, title: "给你最柔软的\n拥抱", subtitle: "纯手工钩织玩偶，寻找一个温暖的家", image: "https://picsum.photos/id/102/1200/800", icon: "🐰" }
  ];

  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="pb-32 md:pb-20 relative">
      {/* ... (keep background particles) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-bounce-slow">🧶</div>
        <div className="absolute top-40 right-20 text-3xl opacity-20 animate-pulse">✨</div>
        <div className="absolute bottom-1/3 left-1/4 text-5xl opacity-10 animate-wiggle">🧸</div>
        <div className="absolute top-1/2 right-10 text-4xl opacity-20 animate-bounce">🧵</div>
      </div>

      <div className="relative mt-4 md:mt-6 mx-4 rounded-[32px] overflow-hidden min-h-[260px] md:h-[380px] shadow-xl z-10 group">
        {banners.map((banner, idx) => (
           <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}>
              <img src={banner.image} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 p-8 md:p-12 z-20 flex flex-col justify-center items-start text-white">
                <h1 className="font-hand text-4xl md:text-5xl font-bold leading-[1.1] whitespace-pre-line drop-shadow-lg">{banner.title}</h1>
                <p className="text-lg md:text-xl text-white/90 font-medium max-w-lg mt-2">{banner.subtitle}</p>
                <Button onClick={() => navigate(banner.id ? `/product/${banner.id}` : '/shop')} className="mt-6 !bg-white !text-wooly-brown">立即查看</Button>
              </div>
           </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 mt-12 md:mt-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-hand text-4xl font-bold text-wooly-brown mt-1">新品上架</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayFeatured.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={(prod) => { addToCart(prod); toast.success(`已添加 ${prod.title}!`); }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// 1.5 PRODUCT DETAIL
const ProductDetail = () => {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  const product = products.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return <div className="text-center py-20">商品加载中...</div>;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square rounded-[40px] overflow-hidden shadow-soft">
            <img src={allImages[activeImg]} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {allImages.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-wooly-pink-500 scale-105' : 'border-transparent'}`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-wooly-pink-500 font-bold tracking-widest uppercase text-sm mb-2">{product.category}</span>
          <h1 className="font-hand text-5xl font-bold text-wooly-brown mb-4">{product.title}</h1>
          <p className="text-3xl font-bold text-wooly-pink-500 mb-6">${product.price.toFixed(2)}</p>
          
          <div className="flex flex-wrap gap-4 mb-8">
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">可选颜色</span>
                <div className="flex gap-2">
                  {product.colors.map(c => <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">{c}</span>)}
                </div>
              </div>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">参考尺寸</span>
                <div className="flex gap-2">
                  {product.sizes.map(s => <span key={s} className="px-3 py-1 bg-wooly-cream rounded-full text-xs font-bold">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="prose prose-stone mb-8">
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
          <div className="mt-auto space-y-4">
             <Button onClick={() => { addToCart(product); toast.success('已加入清单'); }} className="w-full py-4 text-xl">加入选购清单</Button>
             <p className="text-center text-gray-400 text-sm flex items-center justify-center gap-2"><Sparkles className="w-4 h-4"/> 每一件均为纯手工钩织，下单后约 7-10 天发出</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. SHOP
const Shop = () => {
  const { products, addToCart } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>(Category.ALL);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === Category.ALL || p.category === activeCategory;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.colors?.some(c => c.toLowerCase().includes(searchLower)) ||
      p.sizes?.some(s => s.toLowerCase().includes(searchLower)) ||
      p.tags?.some(t => t.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen pb-32">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-10">
        <h1 className="font-hand text-5xl font-bold text-wooly-brown shrink-0">全部商品</h1>
        
        {/* Search Bar */}
        <div className="flex-grow w-full md:w-auto relative">
          <input 
            type="text" 
            placeholder="搜索温暖的好物..." 
            className="w-full pl-12 pr-4 py-3 rounded-full border-none bg-white shadow-soft focus:ring-2 focus:ring-wooly-pink-300 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-12">
        {CATEGORIES.map(cat => (
          <CategoryBadge 
            key={cat} 
            label={cat} 
            active={activeCategory === cat} 
            onClick={() => setActiveCategory(cat)} 
          />
        ))}
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onAddToCart={(prod) => {
                addToCart(prod);
                toast.success(
                  <div className="flex items-center gap-2">
                    <img src={prod.image} className="w-8 h-8 rounded-full object-cover"/>
                    <span>已加入选购清单!</span>
                  </div>
                );
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 opacity-50">
          <Package className="w-16 h-16 mx-auto mb-4" />
          <p className="text-xl font-hand">没有找到相关商品哦...</p>
        </div>
      )}
    </div>
  );
};

// 3. CART (Renamed conceptually to Inquiry List)
const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const navigate = useNavigate();
  
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center pb-32">
        <div className="w-32 h-32 bg-wooly-pink-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-wooly-pink-400" />
        </div>
        <h2 className="font-hand text-4xl font-bold text-wooly-brown mb-2">选购清单为空</h2>
        <p className="text-gray-500 mb-8">去挑选喜欢的宝贝，然后截图发给我吧！</p>
        <Link to="/shop"><Button>去逛逛</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 min-h-screen pb-32">
      <h1 className="font-hand text-4xl font-bold text-wooly-brown mb-2">你的选购清单</h1>
      <p className="text-gray-500 mb-8 flex items-center gap-2"><Sparkles className="w-4 h-4 text-wooly-pink-500"/> 截图此页面发给董董，确认定制细节哦</p>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-[24px] flex gap-4 items-center shadow-sm">
              <img src={item.image} alt={item.title} className="w-24 h-24 rounded-2xl object-cover bg-gray-100" />
              <div className="flex-grow">
                <h3 className="font-bold text-wooly-brown">{item.title}</h3>
                <p className="text-wooly-pink-500 font-bold">${item.price.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center gap-3 bg-wooly-cream rounded-full px-3 py-1">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-xl font-bold text-wooly-brown hover:text-wooly-pink-500">-</button>
                <span className="w-4 text-center font-bold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-xl font-bold text-wooly-brown hover:text-wooly-pink-500">+</button>
              </div>
              
              <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-[32px] shadow-soft sticky top-24">
            <h3 className="font-hand text-2xl font-bold mb-6">清单汇总</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>商品数量</span>
                <span>{cart.reduce((a,c) => a+c.quantity, 0)} 件</span>
              </div>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="flex justify-between text-xl font-bold text-wooly-brown">
                <span>预估总价</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full !bg-wooly-pink-500 hover:!bg-wooly-pink-400" onClick={() => navigate('/contact')}>
              联系店主购买
            </Button>
            <p className="text-xs text-center text-gray-400 mt-3">
              *最终价格以定制需求确认后为准
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. ADMIN (Hidden, Simple Passcode)
const Admin = () => {
  const { products, fetchProducts } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', price: '', category: Category.PLUSHIES, description: '', 
    images: [] as string[], is_featured: false, is_banner: false, banner_text: '',
    colors: '', sizes: '', tags: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === 'spencer' && loginData.password === 'spencer') {
      setIsAuthenticated(true);
      toast.success('管理员登录成功');
    } else {
      toast.error('账号或密码错误');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... rest of the component


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error('请至少上传一张图片');
      return;
    }

    const newProduct = {
      title: formData.title,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      image: formData.images[0],
      images: formData.images,
      is_featured: formData.is_featured,
      is_banner: formData.is_banner,
      banner_text: formData.banner_text,
      colors: formData.colors.split(',').map(s => s.trim()).filter(Boolean),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
      stock: 10
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      
      if (res.ok) {
        await fetchProducts();
        setFormData({ 
          title: '', price: '', category: Category.PLUSHIES, description: '', 
          images: [], is_featured: false, is_banner: false, banner_text: '',
          colors: '', sizes: '', tags: ''
        });
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
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProducts();
        toast.success('删除成功');
      }
    } catch (err: any) {
      toast.error('删除失败');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-[32px] shadow-soft text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-wooly-cream rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🤫</div>
            <h2 className="font-hand text-2xl font-bold mb-6 text-wooly-brown">管理后台登录</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="text" 
                placeholder="管理员账号" 
                className="w-full p-3 rounded-xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-wooly-pink-300"
                value={loginData.username}
                onChange={e => setLoginData({...loginData, username: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="管理员密码" 
                className="w-full p-3 rounded-xl bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-wooly-pink-300"
                value={loginData.password}
                onChange={e => setLoginData({...loginData, password: e.target.value})}
              />
              <Button type="submit" className="w-full">进入后台</Button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 pb-32">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-hand text-4xl font-bold text-wooly-brown">后台管理</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>{isAdding ? '取消' : '添加商品'}</Button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[32px] shadow-soft mb-10 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4">添加新商品</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <input 
                required placeholder="商品名称" 
                className="p-3 bg-gray-50 rounded-xl w-full"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <input 
                required type="number" placeholder="价格" 
                className="p-3 bg-gray-50 rounded-xl w-full"
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <select 
              className="p-3 bg-gray-50 rounded-xl w-full"
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}
            >
              {CATEGORIES.filter(c => c !== Category.ALL).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea 
              required placeholder="商品描述" 
              className="p-3 bg-gray-50 rounded-xl w-full h-32"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            />

            <div className="grid grid-cols-3 gap-4">
              <input 
                placeholder="颜色 (英文逗号分隔)" 
                className="p-3 bg-gray-50 rounded-xl w-full text-sm"
                value={formData.colors} onChange={e => setFormData({...formData, colors: e.target.value})}
              />
              <input 
                placeholder="尺寸 (如: 15cm, 20cm)" 
                className="p-3 bg-gray-50 rounded-xl w-full text-sm"
                value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})}
              />
              <input 
                placeholder="标签 (如: 爆款, 送礼)" 
                className="p-3 bg-gray-50 rounded-xl w-full text-sm"
                value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>

            <div className="flex gap-6 p-4 bg-gray-50 rounded-2xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5 accent-wooly-pink-500" />
                <span className="font-bold text-sm">新品推荐</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_banner} onChange={e => setFormData({...formData, is_banner: e.target.checked})} className="w-5 h-5 accent-wooly-pink-500" />
                <span className="font-bold text-sm">首页轮播</span>
              </label>
            </div>

            {formData.is_banner && (
              <input 
                placeholder="轮播图文案 (如: 给你最柔软的拥抱)" 
                className="p-3 bg-gray-50 rounded-xl w-full"
                value={formData.banner_text} onChange={e => setFormData({...formData, banner_text: e.target.value})}
              />
            )}
            
            <div className="relative group/upload">
              <input 
                type="file" 
                id="file-upload"
                accept="image/*"
                multiple
                className="hidden" 
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label 
                htmlFor="file-upload"
                className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center gap-2 ${formData.images.length > 0 ? 'border-wooly-pink-300 bg-wooly-pink-50/30' : ''}`}
              >
                {isUploading ? (
                  <div className="w-full max-w-xs">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-wooly-pink-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <p className="text-xs text-wooly-pink-500 font-bold animate-pulse">正在处理并上传... {uploadProgress}%</p>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-gray-400">点击上传商品图片 (支持多选)</p>
                  </>
                )}
              </label>
            </div>

            {/* Image Gallery Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative group/img">
                    <img src={url} className="w-full aspect-square object-cover rounded-xl shadow-sm" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" disabled={isUploading || formData.images.length === 0} isLoading={false}>
              发布商品 ({formData.images.length})
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[32px] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-wooly-pink-100 text-wooly-brown">
            <tr>
              <th className="p-4 pl-8">商品</th>
              <th className="p-4">分类</th>
              <th className="p-4">价格</th>
              <th className="p-4">库存</th>
              <th className="p-4 text-right pr-8">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 pl-8 font-bold">{p.title}</td>
                <td className="p-4"><span className="bg-wooly-cream px-2 py-1 rounded-lg text-xs font-bold text-wooly-brown">{p.category}</span></td>
                <td className="p-4">${p.price}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4 text-right pr-8">
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 font-bold text-sm">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. CONTACT (Replaces Login/Profile)
const Contact = () => {
  const wechatId = "dongdong_crochet"; // Mock ID
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wechatId);
    setCopied(true);
    toast.success("微信号已复制！");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-32">
      <div className="bg-white rounded-[40px] shadow-cute p-8 max-w-sm w-full text-center relative overflow-hidden group">
        
        {/* Decorative Tape */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-wooly-pink-100/50 rotate-2 backdrop-blur-sm z-10 border-l border-r border-white/50"></div>

        <div className="w-24 h-24 bg-wooly-peach rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-soft relative z-0">
          <span className="text-4xl">👩‍🎨</span>
          <div className="absolute -bottom-2 bg-wooly-brown text-white text-xs px-2 py-1 rounded-full font-bold">店主董董</div>
        </div>

        <h1 className="font-hand text-3xl font-bold text-wooly-brown mb-2">联系我</h1>
        <p className="text-gray-500 mb-6 text-sm px-4">
          每一件手作都是独一无二的。<br/>
          截图你的【选购清单】发给我，<br/>
          我们一起聊聊颜色和细节吧！
        </p>
        
        {/* QR Code Placeholder */}
        <div className="w-48 h-48 bg-wooly-cream mx-auto rounded-2xl mb-6 p-4 flex items-center justify-center border-2 border-dashed border-wooly-pink-300 relative group-hover:scale-105 transition-transform duration-300">
           {/* Mock QR Pattern */}
           <div className="w-full h-full bg-wooly-brown/10 rounded-lg flex items-center justify-center text-wooly-brown/30">
              <span className="text-xs">二维码区域</span>
              {/* In real app, replace with <img src="/qr.jpg" /> */}
           </div>
           <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-md">
             <MessageCircle className="w-6 h-6 text-green-500 fill-green-100" />
           </div>
        </div>

        {/* Copy WeChat ID */}
        <button 
          onClick={handleCopy}
          className="w-full bg-gray-50 hover:bg-wooly-pink-50 p-4 rounded-2xl flex items-center justify-between group/btn transition-colors border border-transparent hover:border-wooly-pink-200"
        >
          <div className="text-left">
            <p className="text-xs text-gray-400">微信号</p>
            <p className="font-bold text-wooly-brown font-mono text-lg">{wechatId}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover/btn:text-wooly-pink-500 group-hover/btn:scale-110 transition-all">
             {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </div>
        </button>

      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const { fetchProducts } = useStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <BrowserRouter>
      <div className="min-h-screen font-sans text-wooly-brown selection:bg-wooly-pink-200">
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              borderRadius: '20px',
              background: '#333',
              color: '#fff',
            },
            success: {
              style: { background: '#FFB6C1', color: '#5D4037', fontWeight: 'bold' },
              iconTheme: { primary: '#5D4037', secondary: '#FFB6C1' },
            }
          }} 
        />
        <Navbar />
        <MobileHeader />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        
        {/* Mobile Tab Bar */}
        <MobileTabBar />
        
        {/* Footer */}
        <footer className="mt-auto py-10 text-center text-wooly-brown/60 text-sm pb-32 md:pb-10">
          <p className="font-hand text-lg">© 2024 董董手作. 用爱手工钩织 ❤️</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}