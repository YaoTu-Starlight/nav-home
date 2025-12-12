// src/components/MainLayout.tsx
"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import CategorySection from "./CategorySection";
import { Menu, Search } from "lucide-react";
// import { AppSettings } from "@/types"; // 如果不需要，保持注释或删除

export default function MainLayout({ initialCategories }: { initialCategories: any[] }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // ✨ 默认设置为 true (收起状态)
    const [isCollapsed, setIsCollapsed] = useState(true); 
    
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCategories, setFilteredCategories] = useState(initialCategories);

    useEffect(() => { setMounted(true); }, []);
    
    // 侧边栏切换函数
    const toggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

    // 保持搜索逻辑不变
    useEffect(() => {
        if (!searchQuery.trim()) { setFilteredCategories(initialCategories); return; }
        const query = searchQuery.toLowerCase();
        const filtered = initialCategories.map(cat => ({
            ...cat,
            items: cat.items.filter((item: any) => 
                item.name.toLowerCase().includes(query) || 
                item.desc?.toLowerCase().includes(query) ||
                item.tags?.some((t: string) => t.toLowerCase().includes(query))
            )
        })).filter(cat => cat.items.length > 0);
        setFilteredCategories(filtered);
    }, [searchQuery, initialCategories]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen text-slate-900 transition-colors duration-300">
            <Sidebar 
                categories={initialCategories} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                isCollapsed={isCollapsed}
                // ✨ 修正属性名称，匹配 Sidebar.tsx 的定义
                toggleCollapse={toggleCollapse} 
                // settings={settings} 
            />
            
            <main className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
                {/* Header 和 Content 保持不变 */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 h-16 flex items-center justify-between border-b border-white/40">
                    <div className="flex items-center gap-4 w-full">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/50 rounded-md lg:hidden"><Menu size={20} /></button>
                        <div className="relative group max-w-md hidden sm:block w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={16} />
                            <input type="text" placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/60 border border-white/50 rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all" />
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {filteredCategories.length > 0 ? filteredCategories.map((category) => (
                        <CategorySection key={category.id} id={category.id} category={category} />
                    )) : <div className="text-center py-20 text-gray-400">未找到相关内容</div>}
                    <footer className="mt-12 py-6 border-t border-gray-200/50 text-center text-sm text-gray-500"><p>&copy; {new Date().getFullYear()} Nav Page.</p></footer>
                </div>
            </main>
        </div>
    );
}