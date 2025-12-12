import MainLayout from "@/components/MainLayout";
import { getCategories } from "@/lib/actions"; // 去掉 getSettings
import { Folder, Hash, Tag, Link as LinkIcon, LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

export default async function Home() {
  const categories = await getCategories();
  // const settings = await getSettings(); // ❌ 删除这一行

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300">
        <h1 className="text-2xl font-bold mb-4">欢迎来到导航站</h1>
        <p className="mb-8">当前没有数据，请前往后台添加分类。</p>
        <Link href="/config" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          进入后台管理
        </Link>
      </div>
    );
  }

  const iconMap: Record<string, LucideIcon> = { Folder, Hash, Tag, Link: LinkIcon };

  const categoriesWithIcons = categories.map((cat: any) => {
      if (!cat.items) cat.items = [];
      let iconNode;
      if (cat.icon?.startsWith("/") || cat.icon?.startsWith("http")) {
        iconNode = (
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
             <Image src={cat.icon} alt={cat.title || "icon"} fill className="object-cover" sizes="24px" />
          </div>
        );
      } else {
        const IconComponent = iconMap[cat.icon as string] || Folder;
        iconNode = <IconComponent size={20} />;
      }
      return { ...cat, iconNode };
  });

  // ❌ 删除 settings={settings} 属性
  return <MainLayout initialCategories={categoriesWithIcons} />;
}