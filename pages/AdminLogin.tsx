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
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
            <div className="bg-white p-10 rounded-[40px] shadow-soft text-center max-w-sm w-full border border-slate-100">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg shadow-indigo-100">H</div>
                <h2 className="text-2xl font-bold mb-8 text-slate-800 tracking-tight">Hook Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="text"
                        placeholder="管理员账号"
                        autoComplete="username"
                        className="w-full p-4 rounded-2xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                        value={loginData.username}
                        onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="管理员密码"
                        autoComplete="current-password"
                        className="w-full p-4 rounded-2xl bg-slate-50 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-none"
                        value={loginData.password}
                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                        登 录
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
