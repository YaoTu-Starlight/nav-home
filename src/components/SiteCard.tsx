import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { SiteItem } from "@/types";

export default function SiteCard({ site }: { site: SiteItem }) {
  return (
    <Link href={site.url} target="_blank" rel="noopener noreferrer" className="group block h-full bg-white/80 backdrop-blur-sm border border-white/60 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 hover:bg-white">
      <div className="flex items-start gap-3 mb-3">
        {site.icon ? (
             <div className="relative w-10 h-10 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 shadow-sm">
                {site.icon.startsWith('/') || site.icon.startsWith('http') ? (
                     <Image src={site.icon} alt={site.name} fill className="object-cover" />
                ) : (
                     <div className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500">{site.name.charAt(0)}</div>
                )}
             </div>
        ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">{site.name.charAt(0)}</div>
        )}
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{site.name}</h3>
            <p className="text-xs text-slate-500 truncate mt-1">{site.desc || "暂无描述"}</p>
        </div>
        <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
      </div>

      {site.tags && site.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-100/50">
          {site.tags.map((tag, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-500/80 font-medium">#{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}