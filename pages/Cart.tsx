import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { Button } from '../components/Components';

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
                    <div className="bg-white/20 backdrop-blur-xl p-6 rounded-[32px] border border-white/30 shadow-soft sticky top-24">
                        <h3 className="font-hand text-2xl font-bold mb-6">清单汇总</h3>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>商品数量</span>
                                <span>{cart.reduce((a, c) => a + c.quantity, 0)} 件</span>
                            </div>
                            <div className="h-px bg-gray-100/50 my-2"></div>
                            <div className="flex justify-between text-xl font-bold text-wooly-brown">
                                <span>预估总价</span>
                                <span className="text-wooly-pink-500">${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button className="w-full !bg-wooly-pink-500 hover:!bg-wooly-pink-400" onClick={() => navigate('/contact')}>
                            联系店主开始定制
                        </Button>
                        <p className="text-[10px] text-center text-gray-400 mt-4 px-2">
                            截图清单发送给店主<br />进行最终确认与定制
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
