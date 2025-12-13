"use server";

import { promises as fs } from "fs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import path from "path";
import { DATA_FILE_PATH, DATA_DIR } from "@/lib/constants";
import { Category } from "@/types";

// ============================================================
// 📥 数据读取
// ============================================================
export async function getCategories(): Promise<Category[]> {
  try {
    await fs.access(DATA_FILE_PATH);
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    if (!fileContent.trim()) return [];
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

// ============================================================
// 💾 数据保存 (内部使用)
// ============================================================
async function saveData(data: Category[]) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    revalidatePath("/");
    revalidatePath("/config");
    return { success: true };
  } catch (error) {
    console.error("保存失败:", error);
    return { success: false, error: "保存失败" };
  }
}

// ============================================================
// 🛠️ 业务操作：分类管理
// ============================================================

export async function addCategory(name: string, icon: string) {
  const categories = await getCategories();
  categories.push({
    id: Date.now().toString(),
    title: name,
    icon: icon,
    items: []
  });
  return await saveData(categories);
}

export async function deleteCategory(id: string) {
  const categories = await getCategories();
  const newCategories = categories.filter((c) => c.id !== id);
  return await saveData(newCategories);
}

export async function updateCategory(id: string, name: string, icon: string) {
  const categories = await getCategories();
  const category = categories.find((c) => c.id === id);
  if (category) {
    category.title = name;
    category.icon = icon;
    return await saveData(categories);
  }
  return { success: false, error: "未找到分类" };
}

// ============================================================
// 🛠️ 业务操作：站点管理
// ============================================================

export async function addSite(categoryId: string, site: any) {
  const categories = await getCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    category.items.push({
      ...site,
      name: site.name || "未命名",
      url: site.url || "#",
      tags: site.tags || [] // 确保保存标签
    });
    return await saveData(categories);
  }
  return { success: false, error: "分类不存在" };
}

export async function deleteSite(categoryId: string, siteIndex: number) {
  const categories = await getCategories();
  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    category.items.splice(siteIndex, 1);
    return await saveData(categories);
  }
  return { success: false, error: "分类不存在" };
}

// ============================================================
// 📂 文件上传
// ============================================================
export async function uploadIcon(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "无文件" };

  // 注意：这里路径指向 public/icons，确保你的部署环境允许写入此目录
  // 或者 Nginx 配置了正确的 root 指向
  const uploadDir = path.join(process.cwd(), "public", "icons");
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return { success: true, url: `/icons/${fileName}` };
  } catch (error) {
    return { success: false, error: "上传出错" };
  }
}

// ============================================================
// 🔐 认证系统 (核心修改部分)
// ============================================================

export async function login(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    
    // 设置 Cookie
    cookieStore.set("auth_token", "admin_logged_in", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 生产环境开启 secure
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/', 
      sameSite: 'lax'
    });
    
    redirect("/config");
    // 注意：redirect 会抛出错误，所以不需要 return { success: true }
  } else {
    return { success: false, error: "密码错误" };
  }
}

// ✨✨✨ 修复：核弹级退出登录 ✨✨✨
export async function logout() {
  const cookieStore = await cookies();
  
  cookieStore.set('auth_token', '', {
    maxAge: 0,
    expires: new Date(0),
    path: '/', 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  });

  // 2. 强制清除 Next.js 服务端路由缓存
  revalidatePath('/', 'layout'); 
  revalidatePath('/config', 'layout');

  // 3. 跳转登录页
  redirect('/login');
}

// ✨✨✨ 新增：客户端身份检查 ✨✨✨
export async function checkAuthStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  
  // 只要 token 存在且有值，视为已登录
  return !!(token && token.value);
}