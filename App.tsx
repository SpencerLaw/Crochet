import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams, Outlet, Navigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, MessageCircle, LogOut, Package, Sparkles, Image as ImageIcon, Trash2, ArrowRight, Home as HomeIcon, Store, Heart, ChevronLeft, ChevronRight, Copy, Check, LayoutDashboard, PlusCircle, LogOut as LogoutIcon, Globe } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useStore } from './store';
import { Category, Product } from './types';
import { CATEGORIES } from './constants';
import { Button, ProductCard, CategoryBadge } from './components/Components';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));

import PageLoader from './components/PageLoader';

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
    <div className="min-h-screen font-sans text-wooly-brown selection:bg-orange-200 flex flex-col">
      {!isContactPage && <Navbar />}
      {!isContactPage && <MobileHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      <MobileTabBar />
      {!isContactPage && (
        <footer className="mt-auto py-10 text-center text-wooly-brown/60 text-sm pb-32 md:pb-10">
          <p className="font-hand text-lg">© 2026 董董手作. 用爱手工钩织 🧡</p>
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
        bg-white/[0.02] backdrop-blur-sm
        rounded-[32px]
        shadow-lg
        border border-white/10
        ring-1 ring-white/5
      ">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-out ${isActive ? 'text-orange-500 scale-110 drop-shadow-sm' : 'text-gray-400 hover:text-wooly-brown'
                }`}
            >
              <div className="relative">
                <tab.icon
                  className={`w-7 h-7 transition-all duration-300 ${isActive ? 'fill-orange-500/20 stroke-[2.5px]' : 'stroke-[2px]'}`}
                />
                {tab.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
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
      <div className="flex items-center gap-2 opacity-90">
        <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
          <img src="/icon-192.png" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <span className="font-hand text-2xl font-bold text-wooly-brown tracking-wide">董董手作</span>
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
          <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md overflow-hidden">
            <img src="/icon-192.png" alt="Logo" className="w-full h-full object-cover" />
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

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* User Facing App */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Section */}
          <Route path="/admin/login" element={<AdminLogin onLogin={handleAdminLogin} />} />
          <Route element={<AdminLayout isAuthenticated={isAuth} onLogout={handleAdminLogout} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
