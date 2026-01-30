import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [direction, setDirection] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const x = useMotionValue(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const paginate = async (newDirection: number) => {
        if (isAnimating || banners.length <= 1) return;
        setIsAnimating(true);
        setDirection(newDirection);

        const width = containerRef.current?.offsetWidth || window.innerWidth;

        await animate(x, -newDirection * width, {
            type: "spring",
            stiffness: 250,
            damping: 30,
            mass: 0.8
        }).finished;

        setCurrentSlide((prev) => (prev + newDirection + banners.length) % banners.length);
        x.set(0);
        setIsAnimating(false);
    };

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            paginate(1);
        }, 6000);
        return () => clearInterval(timer);
    }, [banners.length, isAnimating]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0
        })
    };

    const containerWidth = containerRef.current?.offsetWidth || 1000;

    // 3D Flip Logic
    // We calculate a normalized progress value from -1 to 1 based on x position
    const dragProgress = useTransform(x, (val) => val / containerWidth);

    const handleDragEnd = async () => {
        const currentX = x.get();
        const width = containerRef.current ? containerRef.current.offsetWidth : window.innerWidth;
        const velocity = x.getVelocity();
        // Threshold can be relative to width
        const threshold = width * 0.25;

        if (currentX < -threshold || velocity < -500) {
            // Next
            await animate(x, -width, { type: "spring", stiffness: 300, damping: 30 }).finished;
            setCurrentSlide((prev) => (prev + 1) % banners.length);
            x.set(0);
        } else if (currentX > threshold || velocity > 500) {
            // Prev
            await animate(x, width, { type: "spring", stiffness: 300, damping: 30 }).finished;
            setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
            x.set(0);
        } else {
            // Revert
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
    };

    return (
        <div className="pb-32 md:pb-20 relative">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-20 left-10 text-4xl opacity-20 animate-bounce-slow">🧶</div>
                <div className="absolute top-40 right-20 text-3xl opacity-20 animate-pulse">✨</div>
                <div className="absolute bottom-1/3 left-1/4 text-5xl opacity-10 animate-wiggle">🧸</div>
                <div className="absolute top-1/2 right-10 text-4xl opacity-20 animate-bounce">🧵</div>
            </div>

            <div className="relative mt-4 md:mt-6 mx-4 rounded-[32px] overflow-hidden min-h-[296px] md:h-[420px] shadow-xl z-10 group bg-slate-100">
                <div ref={containerRef} className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
                        style={{ x }}
                        drag="x"
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        onClick={(e) => {
                            // If it's a tap (not drag), standard click propagation happens inside children if needed,
                            // or we can handle navigation here if we moved the navigate call up.
                            // But keeping buttons separate is fine.
                        }}
                    >
                        {[-1, 0, 1].map((offset) => {
                            const index = (currentSlide + offset + banners.length) % banners.length;
                            const banner = banners[index];

                            // 3D Transformation for each card
                            const rotateY = useTransform(dragProgress, (p) => (offset + p) * -45);
                            const scale = useTransform(dragProgress, (p) => 1 - Math.abs(offset + p) * 0.15);
                            const opacity = useTransform(dragProgress, (p) => 1 - Math.abs(offset + p) * 0.6);
                            const z = useTransform(dragProgress, (p) => Math.abs(offset + p) * -200);

                            return (
                                <motion.div
                                    key={`${index}-${offset}`}
                                    className="absolute top-0 bottom-0 w-full h-full flex items-center justify-center overflow-hidden"
                                    style={{
                                        left: `${offset * 100}%`,
                                        rotateY,
                                        scale,
                                        opacity,
                                        z,
                                        transformStyle: "preserve-3d",
                                        perspective: "1000px"
                                    }}
                                >
                                    <img src={banner.image} className="w-full h-full object-cover pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute inset-0 p-6 md:p-10 z-20 flex flex-col justify-start items-start text-white pointer-events-none">
                                        <motion.div
                                            className="max-w-[240px] md:max-w-sm mt-4 md:mt-8"
                                            style={{
                                                x: useTransform(dragProgress, (p) => (offset + p) * 50)
                                            }}
                                        >
                                            <h1 className="font-hand text-3xl md:text-5xl font-bold leading-tight drop-shadow-xl">{banner.title}</h1>
                                            {banner.subtitle && <p className="text-xs md:text-base text-white/90 font-medium mt-2 leading-relaxed drop-shadow-md">{banner.subtitle}</p>}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(banner.id ? `/product/${banner.id}` : '/shop');
                                                }}
                                                className="mt-5 pointer-events-auto font-hand font-bold text-sm md:text-base px-7 py-2 rounded-full bg-white text-wooly-brown shadow-cute hover:scale-105 transition-transform"
                                            >
                                                立即查看
                                            </button>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Desktop Navigation Arrows */}
                {
                    banners.length > 1 && (
                        <>
                            <button
                                onClick={() => paginate(-1)}
                                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-wooly-brown/80 border border-white/30 shadow-lg ring-1 ring-black/5 opacity-80 md:opacity-0 group-hover:opacity-100 transition-all duration-300 flex hover:scale-110 active:scale-95"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => paginate(1)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-wooly-brown/80 border border-white/30 shadow-lg ring-1 ring-black/5 opacity-80 md:opacity-0 group-hover:opacity-100 transition-all duration-300 flex hover:scale-110 active:scale-95"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )
                }

                {/* Banner Indicators - Cute Capsule Style */}
                {
                    banners.length > 1 && (
                        <div className="absolute bottom-6 right-8 z-30 flex gap-1.5 items-center px-3 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 ring-1 ring-black/5">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={async () => {
                                        if (idx === currentSlide || isAnimating) return;
                                        const diff = idx - currentSlide;
                                        // For simplicity, we just use paginate in the direction needed
                                        // A full jump to distant slide with animation is complex, but this handles adjacent or simple steps
                                        paginate(diff > 0 ? 1 : -1);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-out shadow-sm ${currentSlide === idx
                                        ? 'w-6 bg-wooly-pink-500 shadow-wooly-pink-300/40'
                                        : 'w-1.5 bg-white/40 hover:bg-white/60'
                                        }`}
                                />
                            ))}
                        </div>
                    )
                }
            </div >

            <div className="relative z-10 max-w-7xl mx-auto px-6 mt-12 md:mt-16">
                <div className="flex items-end justify-between mb-8">
                    <h2 className="font-hand text-4xl font-bold text-wooly-brown mt-1">新品上架</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayFeatured.map(p => (
                        <ProductCard key={p.id} product={p} onAddToCart={(prod) => { addToCart(prod); toast.success(`已添加 ${prod.title}!`); }} />
                    ))}
                </div>
            </div>
        </div >
    );
};

export default Home;
