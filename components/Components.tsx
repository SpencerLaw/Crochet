import React from 'react';
import { ShoppingCart, Heart, Sparkles, Plus, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  ...props 
}) => {
  const baseStyle = "font-hand font-bold text-lg px-6 py-2 rounded-full transition-all transform active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-wooly-pink-300 hover:bg-wooly-pink-400 text-white shadow-cute hover:-translate-y-1 hover:shadow-lg",
    secondary: "bg-wooly-peach hover:bg-orange-200 text-wooly-brown shadow-sm",
    outline: "border-2 border-wooly-pink-300 text-wooly-pink-500 hover:bg-wooly-pink-100"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="group bg-white rounded-[32px] p-4 shadow-soft hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-wooly-pink-100 flex flex-col h-full">
      <div className="relative overflow-hidden rounded-[24px] aspect-square mb-4">
        <img 
          src={product.image} 
          alt={product.title} 
          className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="w-5 h-5 text-wooly-pink-500" />
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <span className="text-xs font-bold text-wooly-pink-400 uppercase tracking-wider mb-1">{product.category}</span>
        <h3 className="font-hand text-xl font-bold text-wooly-brown mb-2 leading-tight">{product.title}</h3>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-2xl font-bold text-wooly-pink-500">${product.price.toFixed(2)}</span>
          <button 
            onClick={() => onAddToCart(product)}
            className="bg-wooly-sage hover:bg-purple-200 text-wooly-brown p-3 rounded-full transition-colors shadow-sm group-hover:shadow-md"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface CategoryBadgeProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full font-hand text-lg transition-all ${
      active 
        ? 'bg-wooly-pink-300 text-white shadow-cute transform -translate-y-1' 
        : 'bg-white text-wooly-brown hover:bg-wooly-pink-100'
    }`}
  >
    {label}
  </button>
);