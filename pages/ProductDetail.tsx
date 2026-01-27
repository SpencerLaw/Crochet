import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Sparkles, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useStore } from '../store';
import { Button } from '../components/Components';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, addToCart } = useStore();
    const product = products.find(p => p.id === id);
    const [activeImg, setActiveImg] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [lightboxScale, setLightboxScale] = useState(1);
    const [direction, setDirection] = useState(0);
    const [lastTap, setLastTap] = useState(0);

    // Gestures state
    const [initialDist, setInitialDist] = useState<number | null>(null);
    // Gestures state
    const [initialDist, setInitialDist] = useState<number | null>(null);
    const constraintsRef = React.useRef(null);
    const x = useMotionValue(0);

    const handleDragEnd = async () => {
        const currentX = x.get();
        // Use a reasonable width approximation or window width since it is fullscreen
        const width = window.innerWidth;
        const threshold = width * 0.25;
        const velocity = x.getVelocity();

        if (currentX < -threshold || velocity < -500) {
            // Swipe Left -> Next
            await animate(x, -width, { type: "spring", stiffness: 300, damping: 30 }).finished;
            setLightboxIndex(i => (i + 1) % allImages.length);
            x.set(0);
        } else if (currentX > threshold || velocity > 500) {
            // Swipe Right -> Prev
            await animate(x, width, { type: "spring", stiffness: 300, damping: 30 }).finished;
            setLightboxIndex(i => (i - 1 + allImages.length) % allImages.length);
            x.set(0);
        } else {
            // Revert
            animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            setInitialDist(dist);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && initialDist !== null) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const zoomDelta = dist / initialDist;
            const newScale = Math.min(Math.max(1, lightboxScale * zoomDelta), 4);
            setLightboxScale(newScale);
            setInitialDist(dist);
        }
    };

    const handleTouchEnd = () => {
        setInitialDist(null);
    };

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (isZoomed) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isZoomed]);

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
                    <motion.div
                        className="group relative aspect-square rounded-[40px] overflow-hidden shadow-soft cursor-zoom-in bg-slate-50"
                        onClick={() => {
                            setLightboxIndex(activeImg);
                            setDirection(0);
                            setIsZoomed(true);
                            setLightboxScale(1);
                        }}
                        animate={{
                            scale: [1, 1.02, 1],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            // Only animate breathing on mobile (no hover)
                            repeatType: "loop",
                            delay: 1,
                            // We can use a custom property or just let it run if it's subtle enough
                            // But usually we want to disable it if hover is possible
                        }}
                    >
                        <motion.img
                            src={allImages[activeImg]}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="bg-white/90 p-3 rounded-full shadow-lg scale-0 group-hover:scale-100 md:group-hover:scale-110 transition-all duration-300">
                                <Maximize2 className="w-6 h-6 text-wooly-pink-500" />
                            </div>
                        </div>
                    </motion.div>
                    <div className="flex gap-4 overflow-x-auto py-4 px-2 -mx-2 hide-scrollbar">
                        {allImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImg(i)}
                                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 focus:outline-none ${activeImg === i ? 'border-wooly-pink-500 scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                            >
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

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-md flex items-center justify-center overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => setIsZoomed(false)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 text-orange-500 hover:text-orange-400 transition-all p-2 z-[110] hover:scale-110 drop-shadow-lg"
                            onClick={() => setIsZoomed(false)}
                        >
                            <X className="w-10 h-10" />
                        </button>

                        {/* Counter */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white/70 font-medium tracking-widest z-[110] bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
                            {lightboxIndex + 1} / {allImages.length}
                        </div>

                        {/* Navigation Arrows (Desktop) */}
                        <button
                            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-white/5 border border-white/10 text-orange-500 hover:text-orange-400 hover:bg-white/10 transition-all z-[110] drop-shadow-md"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDirection(-1);
                                setLightboxIndex(prev => (prev - 1 + allImages.length) % allImages.length);
                                setLightboxScale(1);
                            }}
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 items-center justify-center rounded-full bg-white/5 border border-white/10 text-orange-500 hover:text-orange-400 hover:bg-white/10 transition-all z-[110] drop-shadow-md"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDirection(1);
                                setLightboxIndex(prev => (prev + 1) % allImages.length);
                                setLightboxScale(1);
                            }}
                        >
                            <ChevronLeft className="w-8 h-8 rotate-180" />
                        </button>

                        {/* Carousel Container */}
                        <div ref={constraintsRef} className="relative w-full h-full flex items-center justify-center p-4 md:p-10 pointer-events-none">
                            {lightboxScale > 1 ? (
                                /* Zoom Mode - Single Image Panning */
                                <motion.div
                                    className="w-full h-full flex items-center justify-center"
                                    drag
                                    dragConstraints={constraintsRef}
                                    dragElastic={0.2}
                                >
                                    <motion.img
                                        src={allImages[lightboxIndex]}
                                        className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain selection:bg-transparent pointer-events-none"
                                        style={{ scale: lightboxScale }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const now = Date.now();
                                            if (now - lastTap < 300) {
                                                setLightboxScale(1);
                                            }
                                            setLastTap(now);
                                        }}
                                    />
                                </motion.div>
                            ) : (
                                /* Swipe Mode - 3 Panel Carousel */
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
                                    style={{ x }}
                                    drag="x"
                                    dragElastic={0.2}
                                    onDragEnd={handleDragEnd}
                                    onClick={(e) => {
                                        // Handle tap vs drag
                                        if (Math.abs(x.get()) < 5) {
                                            e.stopPropagation();
                                            const now = Date.now();
                                            if (now - lastTap < 300) {
                                                setLightboxScale(2.5);
                                            }
                                            setLastTap(now);
                                        }
                                    }}
                                >
                                    {[-1, 0, 1].map((offset) => {
                                        const index = (lightboxIndex + offset + allImages.length) % allImages.length;
                                        return (
                                            <motion.div
                                                key={`${index}-${offset}`}
                                                className="absolute top-0 bottom-0 w-full flex items-center justify-center p-4 md:p-10"
                                                style={{ left: `${offset * 100}%` }}
                                            >
                                                <img
                                                    src={allImages[index]}
                                                    className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain pointer-events-none"
                                                    draggable={false}
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetail;
