import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminLogin = ({ onLogin }: { onLogin: (pass: string) => void }) => {
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginData.username === 'spencer' && loginData.password === 'spencer') {
            onLogin('spencer'); // In a real app, this would be a token
            toast.success('管理员登录成功');
            navigate('/admin');
        } else {
            toast.error('账号或密码错误');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-wooly-cream">
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[40px] shadow-cute text-center max-w-sm w-full border border-white">
                <div className="w-20 h-20 bg-wooly-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-soft font-hand">H</div>
                <h2 className="text-3xl font-bold mb-8 text-wooly-brown tracking-tight font-hand">Hook 后台登录</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="text"
                        placeholder="管理员账号"
                        autoComplete="username"
                        className="w-full p-4 rounded-2xl bg-white/50 text-wooly-brown font-bold outline-none focus:ring-2 focus:ring-wooly-pink-300 transition-all border border-wooly-cream shadow-sm"
                        value={loginData.username}
                        onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="管理员密码"
                        autoComplete="current-password"
                        className="w-full p-4 rounded-2xl bg-white/50 text-wooly-brown font-bold outline-none focus:ring-2 focus:ring-wooly-pink-300 transition-all border border-wooly-cream shadow-sm"
                        value={loginData.password}
                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button type="submit" className="w-full bg-wooly-pink-400 text-white p-4 rounded-2xl font-bold text-xl hover:bg-wooly-pink-500 transition-all shadow-cute active:scale-95 transform">
                        登 录
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
