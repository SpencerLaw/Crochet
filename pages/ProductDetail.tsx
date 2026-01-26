import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store';
import { Button } from '../components/Components';

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
                                <div className="flex Slab-serif transition-colors gap-2">
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

export default ProductDetail;
