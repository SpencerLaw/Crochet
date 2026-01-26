import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-wooly-pink-500 animate-spin" />
            <span className="font-hand text-xl text-wooly-brown animate-pulse">加载中...</span>
        </div>
    </div>
);

export default PageLoader;
