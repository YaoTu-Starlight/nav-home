// src/components/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/types"; 
import { LayoutGrid, X } from "lucide-react";

interface SidebarProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void; // ✨ 修正后的属性名称
  // settings: AppSettings;
}

export default function Sidebar({ categories, isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("div[id]");
      let currentId = "";
      sections.forEach((section) => {
        const top = (section as HTMLElement).offsetTop;
        if (window.scrollY >= top - 150) currentId = section.getAttribute("id") || "";
      });
      if (currentId) setActiveId(currentId);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setActiveId(id);
      if (window.innerWidth < 1024) onClose();
    }
  };

  return (
    <>
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full bg-white/90 backdrop-blur-sm border-r border-white/50 shadow-sm 
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"} 
        `}
      >
        {/* ✨ 修改点 1: Logo/标题区域可点击，实现切换功能 */}
        <div 
          onClick={toggleCollapse} // 触发展开/收缩
          className={`
            flex h-16 items-center px-6 border-b border-gray-100 cursor-pointer 
            ${isCollapsed ? "justify-center" : "justify-between"}
          `}
        >
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-800 overflow-hidden">
            
            {/* Logo/图标 */}
            {/* ✨ 增大 Logo 容器 */}
            <div className="relative w-8 h-8 flex-shrink-0 rounded-lg overflow-hidden">
                <Image 
                  src="/mio_17.webp" 
                  alt="Logo" 
                  fill 
                  className="object-cover"
                />
            </div>

            {/* 标题 */}
            <span className={`transition-opacity duration-300 truncate ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100"}`}>
              静谧小窝导航地
            </span>
          </Link>
          
          {/* 移动端关闭按钮 */}
          <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-md">
            <X size={20} />
          </button>
        </div>

        {/* 列表部分 */}
        <div className="h-[calc(100vh-6rem)] overflow-y-auto p-4 space-y-1 scrollbar-hide">
          {categories.map((cat) => (
            <a 
              key={cat.id} 
              href={`#${cat.id}`} 
              onClick={(e) => scrollToCategory(e, cat.id)} 
              className={`
                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative
                ${activeId === cat.id ? "bg-white shadow-md text-blue-600" : "text-gray-600 hover:bg-white/50"}
                ${isCollapsed ? "justify-center" : ""} 
              `}
              title={isCollapsed ? cat.title : ""}
            >
              {cat.icon?.startsWith('/') || cat.icon?.startsWith('http') ? (
                // ✨ 增大自定义图标的容器
                <div className="relative w-7 h-7 rounded overflow-hidden flex-shrink-0"> 
                  <Image src={cat.icon} alt="icon" fill className="object-cover" />
                </div>
              ) : (
                // ✨ 增大默认图标
                <LayoutGrid size={24} className="flex-shrink-0 opacity-70" /> 
              )}
              
              <span className={`truncate transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"}`}>
                {cat.title}
              </span>

              {!isCollapsed && (
                 <span className="ml-auto text-xs bg-gray-100 text-gray-400 py-0.5 px-2 rounded-full">
                    {cat.items?.length || 0}
                 </span>
              )}
            </a>
          ))}
        </div>

        {/* 移除底部的切换按钮，因为 Logo 已经实现该功能 */}
        {/* 确保这里没有额外的代码块导致语法错误 */}
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
    </>
  );
}