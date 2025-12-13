"use client";

import { useState, useEffect, useTransition } from "react";
// ✨ 引入 useRouter 和 checkAuthStatus
import { useRouter } from "next/navigation";
import { getCategories, addCategory, deleteCategory, addSite, deleteSite, uploadIcon, logout, checkAuthStatus } from "@/lib/actions";
import { Category } from "@/types";
import { Trash2, Plus, Upload, Loader2, Image as ImageIcon, LayoutGrid, LogOut, Globe, AlertCircle, X } from "lucide-react";
import Image from "next/image";

type DeleteTarget = 
  | { type: 'category'; id: string } 
  | { type: 'site'; catId: string; index: number } 
  | null;

export default function ConfigPage() {
  // ✨ 初始化路由钩子
  const router = useRouter();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");
  const [uploading, setUploading] = useState(false);

  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [newSite, setNewSite] = useState({ name: "", url: "", desc: "", icon: "", tags: "" });

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  useEffect(() => { 
    // ============================================================
    // ✨✨✨ 核心修复：客户端身份双重检查 ✨✨✨
    // ============================================================
    const initPage = async () => {
      // 1. 先问服务器：我登录了吗？
      const isLoggedIn = await checkAuthStatus();
      
      if (!isLoggedIn) {
        // 2. 没登录？立刻踢回登录页 (使用 replace 不留历史记录)
        router.replace('/login');
        return;
      }

      // 3. 登录了？才开始拉取数据
      fetchData();
    };

    initPage();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getCategories();
      const safeData = Array.isArray(data) ? data : [];
      setCategories(safeData);
      
      // 恢复选中状态逻辑
      if (activeCatId && !safeData.find(c => c.id === activeCatId)) {
        setActiveCatId(null);
      }
      if (safeData.length > 0 && !activeCatId) {
        setActiveCatId(safeData[0].id);
      }
    } catch (error) { 
      console.error("Fetch Data Error:", error);
      // 如果接口报错，也可以作为一种未授权的信号，清空数据
      setCategories([]); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'category' | 'site') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadIcon(formData);
      if (res.success && res.url) { 
        target === 'category' ? setNewCatIcon(res.url) : setNewSite({ ...newSite, icon: res.url }); 
      } else {
        alert("上传失败，可能是文件太大或权限不足");
      }
    } catch (e) {
      console.error(e);
      alert("上传出错");
    }
    setUploading(false);
  };

  const handleAddCategory = () => {
    if (!newCatName) return alert("请输入分类名称");
    startTransition(async () => {
      try {
        const res = await addCategory(newCatName, newCatIcon || "Folder");
        if (res.success) {
           setNewCatName(""); setNewCatIcon("");
           await fetchData();
        } else {
           alert("添加失败: " + (res.error || "未知错误"));
        }
      } catch (e) {
        console.error(e);
        alert("系统错误，请检查服务器日志");
      }
    });
  };

  const handleAddSite = () => {
    if (!activeCatId) return alert("请先选择分类");
    if (!newSite.name || !newSite.url) return alert("必填项为空");
    
    startTransition(async () => {
      try {
        const tagArray = newSite.tags ? newSite.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];
        const res = await addSite(activeCatId, { ...newSite, tags: tagArray });
        
        if (res.success) {
          setNewSite({ name: "", url: "", desc: "", icon: "", tags: "" });
          await fetchData();
        } else {
          alert("添加站点失败: " + (res.error || "可能是权限不足"));
        }
      } catch (e) {
        console.error(e);
        alert("添加出错，请F12查看控制台");
      }
    });
  };

  const requestDeleteCategory = (id: string) => { setDeleteTarget({ type: 'category', id }); };
  const requestDeleteSite = (catId: string, index: number) => { setDeleteTarget({ type: 'site', catId, index }); };

  const executeDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        if (deleteTarget.type === 'category') {
          await deleteCategory(deleteTarget.id);
        } else {
          await deleteSite(deleteTarget.catId, deleteTarget.index);
        }
        await fetchData();
        setDeleteTarget(null);
      } catch (e) {
        console.error(e);
        alert("删除失败，请检查权限");
      }
    });
  };

  const renderIcon = (iconStr: string | undefined, fallbackIcon: React.ReactNode) => {
    if (iconStr && (iconStr.startsWith('/') || iconStr.startsWith('http'))) {
      return (
        <div className="relative w-full h-full">
          <Image src={iconStr} alt="icon" fill className="object-cover" sizes="32px" />
        </div>
      );
    }
    return fallbackIcon;
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

  return (
    <div className="min-h-screen p-6 text-slate-800 font-sans relative">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex items-center justify-between border-b pb-4 border-white/30">
          <h1 className="text-2xl font-bold text-slate-700">后台管理</h1>
          <div className="flex gap-3">
            <button onClick={() => logout()} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 text-sm flex items-center gap-2"><LogOut size={16} /> 退出</button>
            <a href="/" className="px-4 py-2 bg-white/80 border border-white rounded-lg text-sm hover:bg-white shadow-sm">返回首页</a>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：分类管理 */}
          <div className="space-y-4">
            <div className="bg-white/80 p-4 rounded-2xl border border-white/60 shadow-lg space-y-3">
              <h2 className="font-semibold flex items-center gap-2 text-slate-700"><LayoutGrid size={18} /> 新建分类</h2>
              <input 
                id="category-name" 
                name="category-name" 
                type="text" 
                placeholder="名称" 
                value={newCatName} 
                onChange={(e) => setNewCatName(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100" 
              />
              <div className="flex gap-2">
                <input type="text" placeholder="图标URL" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border-none outline-none text-sm" />
                <label className="cursor-pointer p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'category')} />
                </label>
              </div>
               {newCatIcon && (newCatIcon.startsWith('/') || newCatIcon.startsWith('http')) && (
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    预览: <div className="relative w-6 h-6 rounded overflow-hidden border border-slate-200"><Image src={newCatIcon} alt="preview" fill className="object-cover"/></div>
                  </div>
               )}
              <button onClick={handleAddCategory} disabled={isPending} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-200">{isPending ? "..." : <><Plus size={16} /> 添加</>}</button>
            </div>
            
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} onClick={() => setActiveCatId(cat.id)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${activeCatId === cat.id ? "bg-white border-blue-200 text-blue-600 shadow-md" : "bg-white/50 border-transparent hover:bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 text-slate-400">
                       {renderIcon(cat.icon, <LayoutGrid size={14} />)}
                    </div>
                    <span className="font-medium truncate max-w-[120px]">{cat.title}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); requestDeleteCategory(cat.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：站点管理 */}
          <div className="lg:col-span-2 space-y-6">
            {activeCatId ? (
              <>
                <div className="bg-white/80 p-6 rounded-2xl border border-white/60 shadow-lg space-y-4">
                  <h2 className="font-semibold flex items-center gap-2 text-slate-700"><Plus size={18} /> 添加站点</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <input id="site-name" name="site-name" type="text" placeholder="名称" value={newSite.name} onChange={(e) => setNewSite({...newSite, name: e.target.value})} className="px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100" />
                    <input id="site-url" name="site-url" type="text" placeholder="链接" value={newSite.url} onChange={(e) => setNewSite({...newSite, url: e.target.value})} className="px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100" />
                    <input id="site-desc" name="site-desc" type="text" placeholder="描述" value={newSite.desc} onChange={(e) => setNewSite({...newSite, desc: e.target.value})} className="px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100" />
                    <div className="flex gap-2">
                        <input type="text" placeholder="图标" value={newSite.icon} onChange={(e) => setNewSite({...newSite, icon: e.target.value})} className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border-none outline-none" />
                        <label className="cursor-pointer p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                          {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, 'site')} />
                        </label>
                    </div>
                    <input id="site-tags" name="site-tags" type="text" placeholder="标签 (逗号分隔)" value={newSite.tags} onChange={(e) => setNewSite({...newSite, tags: e.target.value})} className="col-span-2 px-3 py-2 rounded-lg bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-100" />
                  </div>
                  {newSite.icon && (newSite.icon.startsWith('/') || newSite.icon.startsWith('http')) && (
                      <div className="text-xs text-green-600 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full w-fit">
                        图标已就绪 <div className="relative w-4 h-4 rounded-full overflow-hidden border border-green-200"><Image src={newSite.icon} alt="preview" fill className="object-cover"/></div>
                      </div>
                   )}
                  <button onClick={handleAddSite} disabled={isPending} className="px-6 py-2 bg-slate-800 text-white rounded-lg ml-auto block text-sm shadow-lg hover:bg-slate-700">{isPending ? "..." : "保存站点"}</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.find(c => c.id === activeCatId)?.items?.map((site, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/50 hover:bg-white transition-all group">
                      <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden text-slate-300 shadow-sm">
                             {renderIcon(site.icon, <Globe size={20} />)}
                          </div>
                          <div className="truncate pr-2">
                              <h4 className="font-bold text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{site.name}</h4>
                              <p className="text-xs text-slate-400 truncate">{site.url}</p>
                              {site.tags && <p className="text-[10px] text-blue-500 mt-0.5 bg-blue-50 w-fit px-1.5 rounded">{site.tags.join(', ')}</p>}
                          </div>
                      </div>
                      <button onClick={() => requestDeleteSite(activeCatId, index)} className="p-2 text-slate-400 hover:text-red-500 opacity-60 group-hover:opacity-100"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="text-center p-12 text-slate-400 border-2 border-dashed border-white/30 rounded-2xl">请选择分类</div>}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={() => setDeleteTarget(null)}></div>
          <div className="relative w-full max-w-sm bg-white/30 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-white/20 p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center gap-4">
               <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-1 border border-red-500/20">
                 <AlertCircle size={28} />
               </div>
               <div>
                 <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">确认删除？</h3>
                 <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-medium">
                   {deleteTarget.type === 'category' ? "删除分类将同时清空该分类下的所有站点，此操作无法撤销。" : "您确定要删除此站点吗？"}
                 </p>
               </div>
               <div className="grid grid-cols-2 gap-3 w-full mt-4">
                 <button onClick={() => setDeleteTarget(null)} className="py-2.5 rounded-xl bg-white/50 hover:bg-white/80 text-slate-700 font-medium transition-colors border border-white/20">取消</button>
                 <button onClick={executeDelete} disabled={isPending} className="py-2.5 rounded-xl bg-red-500/90 text-white font-medium hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                   {isPending ? <Loader2 size={18} className="animate-spin" /> : "确认删除"}
                 </button>
               </div>
             </div>
             <button onClick={() => setDeleteTarget(null)} className="absolute top-4 right-4 text-slate-500/70 hover:text-slate-700 p-1 rounded-full hover:bg-white/20 transition-colors"><X size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
}