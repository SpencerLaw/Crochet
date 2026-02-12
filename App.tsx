import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams, Outlet, Navigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, MessageCircle, LogOut, Package, Sparkles, Image as ImageIcon, Trash2, ArrowRight, Home as HomeIcon, Store, Heart, ChevronLeft, ChevronRight, Copy, Check, LayoutDashboard, PlusCircle, LogOut as LogoutIcon, Globe } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useStore } from './store';
import { Product } from './types';
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
  return (
    <div className="min-h-screen font-sans text-wooly-brown selection:bg-orange-200 flex flex-col">
      <Navbar />
      <MobileHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <MobileTabBar />
      <footer className="mt-auto py-10 text-center text-wooly-brown/60 text-sm pb-32 md:pb-10">
        <p className="font-hand text-lg">© 2026 董董手作. 用爱手工钩织 🧡</p>
      </footer>
    </div>
  );
};

const AdminLayout = ({ isAuthenticated, onLogout }: { isAuthenticated: boolean; onLogout: () => void }) => {
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="h-screen overflow-y-auto admin-scrollbar bg-wooly-cream/30 font-sans text-wooly-brown">
      <main className="flex-1">
        <Outlet />
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
    { id: 'home', icon: HomeIcon, label: '主页', path: '/' },
    { id: 'shop', icon: Store, label: '商品', path: '/shop' },
    { id: 'cart', icon: ShoppingBag, label: '选购', path: '/cart', badge: cartCount },
    { id: 'contact', icon: MessageCircle, label: '联系', path: '/contact' },
  ];

  return (
    <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
      <div className="
        flex justify-between items-center px-8 py-3
        bg-white/[0.03] backdrop-blur-md
        rounded-[32px]
        shadow-lg
      ">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-out gap-1 ${isActive ? 'text-wooly-pink-500 scale-105 drop-shadow-sm' : 'text-gray-400 hover:text-wooly-brown'
                }`}
            >
              <div className="relative">
                <tab.icon
                  className={`w-6 h-6 transition-all duration-300 ${isActive ? 'fill-wooly-pink-500/20 stroke-[2.5px]' : 'stroke-[2px]'}`}
                />
                {tab.badge ? (
                  <span className="absolute -top-1.5 -right-1.5 bg-wooly-pink-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white shadow-sm">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-wooly-pink-500' : 'text-gray-400'}`}>
                {tab.label}
              </span>
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
      <div className="bg-white/10 backdrop-blur-md rounded-full shadow-soft px-8 py-3 flex items-center justify-between max-w-7xl mx-auto border border-white/20 ring-1 ring-white/5">
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

  const { fetchProducts, fetchCategories } = useStore();

  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('admin_pass'));


  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);


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
