import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams, Outlet, Navigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, MessageCircle, LogOut, Package, Sparkles, Image as ImageIcon, Trash2, ArrowRight, Home as HomeIcon, Store, Heart, ChevronLeft, ChevronRight, Copy, Check, LayoutDashboard, PlusCircle, LogOut as LogoutIcon, Globe } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useStore } from './store';
import { Category, Product } from './types';
import { CATEGORIES } from './constants';
import { Button, ProductCard, CategoryBadge } from './components/Components';

// Lazy load Admin to keep bundle small
const Admin = lazy(() => import('./pages/Admin'));

// --- COMPONENTS ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- LAYOUTS ---

const UserLayout = () => {
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';

  return (
    <div className={`min-h-screen font-sans text-wooly-brown selection:bg-wooly-pink-200 flex flex-col ${isContactPage ? 'h-screen overflow-hidden' : ''}`}>
      {!isContactPage && <Navbar />}
      {!isContactPage && <MobileHeader />}
      <main className={`flex-1 ${isContactPage ? 'overflow-hidden' : ''}`}>
        <Outlet />
      </main>
      <MobileTabBar />
      {!isContactPage && (
        <footer className="mt-auto py-10 text-center text-wooly-brown/60 text-sm pb-32 md:pb-10">
          <p className="font-hand text-lg">© 2026 董董手作. 用爱手工钩织 ❤️</p>
        </footer>
      )}
    </div>
  );
};

const AdminLayout = ({ isAuthenticated, onLogout }: { isAuthenticated: boolean; onLogout: () => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const navLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "控制台" },
    { to: "/", icon: Globe, label: "返回前台" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">H</div>
          <span className="font-bold tracking-tight">Hook Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex flex-col gap-2 animate-in slide-in-from-top-4">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg text-slate-600 font-semibold">
              <link.icon className="w-5 h-5" /> {link.label}
            </Link>
          ))}
          <button onClick={onLogout} className="flex items-center gap-3 p-3 text-red-500 font-semibold border-t mt-2 pt-4">
            <LogoutIcon className="w-5 h-5" /> 退出登录
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 p-6 flex-col gap-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">H</div>
          <span className="font-bold text-xl tracking-tight">Hook Admin</span>
        </div>

        <nav className="flex flex-col gap-2">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-600 font-semibold transition-colors">
              <link.icon className="w-5 h-5" /> {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t pt-6">
          <button onClick={onLogout} className="flex items-center gap-3 p-3 w-full text-slate-400 hover:text-red-500 transition-colors font-semibold">
            <LogoutIcon className="w-5 h-5" /> 退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// ... (keep Navbar, MobileTabBar, etc. components as they are)

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
              className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-out ${isActive ? 'text-wooly-pink-500 scale-110 drop-shadow-sm' : 'text-gray-400 hover:text-wooly-brown'
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

      <div className="relative mt-4 md:mt-6 mx-4 rounded-[32px] overflow-hidden min-h-[286px] md:h-[418px] shadow-xl z-10 group">
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

        {/* Banner Indicators - Cute Capsule Style */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 right-8 z-30 flex gap-1.5 items-center">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out shadow-sm ${currentSlide === idx
                  ? 'w-6 bg-wooly-pink-500 shadow-wooly-pink-300/40'
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        )}
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
  const navigate = useNavigate();
  const { products, addToCart } = useStore();
  const product = products.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);

  if (!product) return <div className="text-center py-20">商品加载中...</div>;

  const allImages = [...new Set([product.image, ...(product.images || [])])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32 relative">
      {/* Floating Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-8 left-6 md:absolute md:top-0 md:-left-4 z-40 w-12 h-12 bg-white/60 backdrop-blur-xl rounded-full shadow-lg border border-white flex items-center justify-center text-wooly-pink-500 hover:scale-110 transition-all hover:bg-white animate-in fade-in slide-in-from-left-4 duration-500"
      >
        <ChevronLeft className="w-6 h-6 stroke-[3px]" />
      </button>

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
            <p className="text-center text-gray-400 text-sm flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> 每一件均为纯手工钩织，下单后约 7-10 天发出</p>
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
                    <img src={prod.image} className="w-8 h-8 rounded-full object-cover" />
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
      <p className="text-gray-500 mb-8 flex items-center gap-2"><Sparkles className="w-4 h-4 text-wooly-pink-500" /> 截图此页面发给董董，确认定制细节哦</p>

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
                <span>{cart.reduce((a, c) => a + c.quantity, 0)} 件</span>
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

// 4. ADMIN LOGIN

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {

  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const navigate = useNavigate();



  const handleLogin = (e: React.FormEvent) => {

    e.preventDefault();

    if (loginData.username === 'spencer' && loginData.password === 'spencer') {

      onLogin();

      toast.success('管理员登录成功');

      navigate('/admin');

    } else {

      toast.error('账号或密码错误');

    }

  };



  return (

    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">

      <div className="bg-white p-10 rounded-[40px] shadow-soft text-center max-w-sm w-full border border-slate-100">

        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg shadow-indigo-100">H</div>

        <h2 className="text-2xl font-bold mb-8 text-slate-800 tracking-tight">Hook Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">

          <input

            type="text"

            placeholder="管理员账号"

            autoComplete="username"

            className="w-full p-4 rounded-2xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"

            value={loginData.username}

            onChange={e => setLoginData({ ...loginData, username: e.target.value })}

          />

          <input

            type="password"

            placeholder="管理员密码"

            autoComplete="current-password"

            className="w-full p-4 rounded-2xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"

            value={loginData.password}

            onChange={e => setLoginData({ ...loginData, password: e.target.value })}

          />

          <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">

            登 录

          </button>

        </form>

      </div>

    </div>

  );

};



// 5. CONTACT (Replaces Login/Profile)
const Contact = () => {
  const wechatId = "Lucky_archer9"; // Updated ID
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wechatId);
    setCopied(true);
    toast.success("微信号已复制！");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-cute p-10 max-w-[460px] w-full text-center relative overflow-hidden group">

        {/* Avatar Area - Increased Size & Real Image */}
        <div className="w-28 h-28 bg-wooly-peach rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-soft relative z-0 overflow-hidden">
          <img src="/headwx.jpg" alt="店主董董" className="w-full h-full object-cover" />
          <div className="absolute -bottom-1 left-0 right-0 bg-wooly-brown/80 backdrop-blur-sm text-white text-[10px] py-1 font-bold">店主董董</div>
        </div>

        <h1 className="font-hand text-4xl font-bold text-wooly-brown mb-3">联系我</h1>
        <p className="text-gray-500 mb-8 text-base px-4 leading-relaxed">
          每一件手作都是独一无二的。<br />
          截图你的【选购清单】发给我，<br />
          我们一起聊聊颜色和细节吧！
        </p>

        {/* QR Code Area - Increased Size & Real Image */}
        <div className="w-60 h-60 bg-white mx-auto rounded-3xl mb-8 p-3 flex items-center justify-center border-2 border-dashed border-wooly-pink-300 relative group-hover:scale-105 transition-transform duration-500 shadow-inner">
          <img src="/wechatqrcode.png" alt="微信二维码" className="w-full h-full rounded-2xl object-cover shadow-sm" />
          <div className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-full shadow-lg ring-4 ring-wooly-cream">
            <MessageCircle className="w-7 h-7 text-green-500 fill-green-100" />
          </div>
        </div>

        {/* WeChat ID Button - Increased Padding & Font */}
        <button onClick={handleCopy} className="w-full bg-gray-50 hover:bg-wooly-pink-50 p-5 rounded-2xl flex items-center justify-between group/btn transition-all duration-300 border border-transparent hover:border-wooly-pink-200 hover:shadow-md">
          <div className="text-left">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">微信号</p>
            <p className="font-bold text-wooly-brown font-mono text-xl">{wechatId}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover/btn:text-wooly-pink-500 group-hover/btn:scale-110 transition-all">
            {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
          </div>
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---



export default function App() {



  const { fetchProducts } = useStore();



  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('admin_pass'));







  useEffect(() => {



    fetchProducts();



  }, [fetchProducts]);







  const handleAdminLogin = (pass: string) => {



    localStorage.setItem('admin_pass', pass);



    setIsAuth(true);



  };







  const handleAdminLogout = () => {



    localStorage.removeItem('admin_pass');



    setIsAuth(false);



    window.location.href = '/';



  };







  return (

    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="bottom-center" />

      <Routes>

        {/* User Facing App */}

        <Route element={<UserLayout />}>

          <Route path="/" element={<Home />} />

          <Route path="/shop" element={<Shop />} />

          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/contact" element={<Contact />} />

        </Route>



        {/* Admin Section (Isolated) */}



        <Route path="/admin/login" element={<AdminLogin onLogin={() => handleAdminLogin('spencer')} />} />



        <Route element={<AdminLayout isAuthenticated={isAuth} onLogout={handleAdminLogout} />}>



          <Route path="/admin" element={





            <Suspense fallback={<div className="p-10 text-center font-bold text-slate-400">正在加载后台系统...</div>}>

              <Admin />

            </Suspense>

          } />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}
