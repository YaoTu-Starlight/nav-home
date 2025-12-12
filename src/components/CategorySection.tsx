"use client";

import { useState, useMemo } from "react";
import SiteCard from "./SiteCard";
import { LayoutGrid } from "lucide-react";

interface CategorySectionProps { category: any; id: string; }

export default function CategorySection({ category, id }: CategorySectionProps) {
  const [activeTag, setActiveTag] = useState<string>("全部");

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    category.items.forEach((item: any) => {
      if (item.tags && Array.isArray(item.tags)) item.tags.forEach((tag: string) => allTags.add(tag));
    });
    return ["全部", ...Array.from(allTags)];
  }, [category.items]);

  const filteredItems = useMemo(() => {
    if (activeTag === "全部") return category.items;
    return category.items.filter((item: any) => item.tags && item.tags.includes(activeTag));
  }, [activeTag, category.items]);

  return (
    <div id={id} className="scroll-mt-24 mb-10">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200/60">
        {category.iconNode || <LayoutGrid className="text-gray-400" size={24} />}
        <h2 className="text-xl font-bold text-slate-800">{category.title}</h2>
      </div>

      {tags.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(tag)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activeTag === tag ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((site: any, index: number) => <SiteCard key={`${site.name}-${index}`} site={site} />)}
        </div>
      ) : <div className="text-center py-8 text-gray-400 text-sm">暂无内容</div>}
    </div>
  );
}