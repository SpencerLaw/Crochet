import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button, ProductCard } from '../components/Components';
import { toast } from 'react-hot-toast';

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
            {/* Background Decorative Elements */}
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

export default Home;
