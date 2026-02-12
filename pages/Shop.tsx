import React, { useState } from 'react';
import { Package, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store';
import { CategoryBadge, ProductCard, SectionHeader } from '../components/Components';

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
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex-grow w-full md:w-auto relative group"
                >
                    <input
                        type="text"
                        placeholder="搜索温暖的好物..."
                        className="w-full pl-12 pr-12 py-3 rounded-full border border-transparent bg-white shadow-soft focus:ring-2 focus:ring-wooly-pink-200 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 group-focus-within:text-wooly-pink-400 transition-colors" />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-4 top-3 hover:bg-gray-100 p-1 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    )}
                </form>
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

            {/* Content Area */}
            {sortedProducts.length > 0 ? (
                <>
                    {searchTerm.length > 0 ? (
                        // Search Results Grid (Flat)
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between border-b border-wooly-cream pb-4">
                                <h2 className="font-hand text-3xl font-bold text-wooly-brown">搜索结果 ({sortedProducts.length})</h2>
                            </div>
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
                        </div>
                    ) : (
                        // Standard Category View
                        activeCategory === '全部' ? (
                            // Sectioned View for "All"
                            <div className="space-y-16">
                                {categories.map(cat => {
                                    // Filter products for this category
                                    const catProducts = sortedProducts.filter(p => p.category === cat.name);
                                    if (catProducts.length === 0) return null;

                                    return (
                                        <div key={cat.id} className="space-y-6">
                                            <SectionHeader title={cat.name} />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {catProducts.map(p => (
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
                                        </div>
                                    );
                                })}

                                {/* Uncategorized / Others Section */}
                                {(() => {
                                    const knownCategories = categories.map(c => c.name);
                                    const otherProducts = sortedProducts.filter(p => !knownCategories.includes(p.category));
                                    if (otherProducts.length === 0) return null;

                                    return (
                                        <div className="space-y-6">
                                            <SectionHeader title="未分类 / 其他" />
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {otherProducts.map(p => (
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
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            // Simple Grid for Specific Category
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
                        )
                    )}
                </>
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
