import React, { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store';
import { CategoryBadge, ProductCard } from '../components/Components';

const Shop = () => {
    const { products, addToCart, categories } = useStore();
    const [activeCategory, setActiveCategory] = useState<string>('全部');
    const [searchTerm, setSearchTerm] = useState("");

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === '全部' || p.category === activeCategory;
        const searchLower = searchTerm.toLowerCase();
        return matchesCategory && (
            p.title.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            p.category.toLowerCase().includes(searchLower) ||
            (p.tags && p.tags.some(t => t.toLowerCase().includes(searchLower)))
        );
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        // Group by category sort_order
        const catA = categories.find(c => c.name === a.category);
        const catB = categories.find(c => c.name === b.category);

        const orderA = catA ? (catA.sort_order ?? 999) : 999;
        const orderB = catB ? (catB.sort_order ?? 999) : 999;

        if (orderA !== orderB) return orderA - orderB;

        // Secondary sort: title
        return a.title.localeCompare(b.title);
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
                        className="w-full pl-12 pr-4 py-3 rounded-full border-none bg-white shadow-soft focus:ring-2 focus:ring-orange-300 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-3 mb-12">
                <CategoryBadge
                    label="全部"
                    active={activeCategory === '全部'}
                    onClick={() => setActiveCategory('全部')}
                />
                {categories.map(cat => (
                    <CategoryBadge
                        key={cat.id}
                        label={cat.name}
                        active={activeCategory === cat.name}
                        onClick={() => setActiveCategory(cat.name)}
                    />
                ))}
            </div>

            {/* Grid */}
            {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sortedProducts.map(p => (
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

export default Shop;
