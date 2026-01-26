import React, { useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Contact = () => {
    const wechatId = "Lucky_archer9"; // Updated ID
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(wechatId);
        setCopied(true);
        toast.success("微信号已复制！");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] md:min-h-screen flex items-center justify-center p-4 md:p-8 pb-32 md:pb-20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[5%] text-4xl opacity-10 animate-bounce-slow">🧶</div>
                <div className="absolute top-[20%] right-[10%] text-3xl opacity-10 animate-pulse">✨</div>
                <div className="absolute bottom-[20%] left-[10%] text-5xl opacity-10 animate-wiggle">🧸</div>
                <div className="absolute bottom-[10%] right-[5%] text-4xl opacity-10 animate-bounce">🧵</div>
            </div>

            <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-cute p-6 md:p-10 max-w-[460px] w-full text-center relative z-10 overflow-hidden border border-white/50 backdrop-blur-sm">

                {/* Avatar Area */}
                <div className="w-24 h-24 md:w-28 md:h-28 bg-wooly-peach rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border-4 border-white shadow-soft relative overflow-hidden">
                    <img src="/headwx.jpg" alt="店主董董" className="w-full h-full object-cover" />
                    <div className="absolute -bottom-1 left-0 right-0 bg-wooly-brown/80 backdrop-blur-sm text-white text-[9px] py-1 font-bold">店主董董</div>
                </div>

                <h1 className="font-hand text-3xl md:text-4xl font-bold text-wooly-brown mb-2 md:mb-3">联系我</h1>
                <p className="text-gray-500 mb-6 md:mb-8 text-sm md:text-base px-2 md:px-4 leading-relaxed">
                    每一件手作都是独一无二的。<br />
                    截图你的【选购清单】发给我，<br />
                    我们一起聊聊颜色和细节吧！
                </p>

                {/* QR Code Area */}
                <div className="w-48 h-48 md:w-60 md:h-60 bg-white mx-auto rounded-2xl md:rounded-3xl mb-6 md:mb-8 p-2 md:p-3 flex items-center justify-center border-2 border-dashed border-wooly-pink-300 relative hover:scale-105 transition-transform duration-500 shadow-inner">
                    <img src="/wechatqrcode.png" alt="微信二维码" className="w-full h-full rounded-xl md:rounded-2xl object-cover shadow-sm" />
                    <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-white p-2 md:p-2.5 rounded-full shadow-lg ring-4 ring-wooly-cream">
                        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-green-500 fill-green-100" />
                    </div>
                </div>

                {/* WeChat ID Button */}
                <button onClick={handleCopy} className="w-full bg-slate-50 hover:bg-wooly-pink-50 p-4 md:p-5 rounded-2xl flex items-center justify-between group/btn transition-all duration-300 border border-transparent hover:border-wooly-pink-200 hover:shadow-md">
                    <div className="text-left">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5 md:mb-1">微信号</p>
                        <p className="font-bold text-wooly-brown font-mono text-lg md:text-xl tracking-wide">{wechatId}</p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover/btn:text-wooly-pink-500 group-hover/btn:scale-110 transition-all">
                        {copied ? <Check className="w-5 h-5 md:w-6 md:h-6 text-green-500" /> : <Copy className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Contact;
