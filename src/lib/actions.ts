"use server";

import { promises as fs } from "fs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import path from "path";
import { DATA_FILE_PATH, DATA_DIR } from "@/lib/constants";
import { Category } from "@/types";

// --- 读取数据 ---
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

// --- 保存数据 ---
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

// --- 业务操作 ---

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

// --- 文件上传 ---
export async function uploadIcon(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "无文件" };

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

// --- 认证 ---
export async function login(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("auth_token", "admin_logged_in", {
      httpOnly: true,
      
      // ⚠️ 当前设置为 secure: false (不安全，仅用于绕过 IP 访问问题)
      // 如果你正在使用 HTTPS 域名，请进行安全修复！
      secure: process.env.NODE_ENV === "production",
      
      maxAge: 60 * 60 * 24 * 7,
      path: '/', // 确保路径为根目录
      sameSite: 'lax' // 增加兼容性
    });
    redirect("/config");
    return { success: true };
  } else {
    return { success: false, error: "密码错误" };
  }
}

// ✨ 修改 Logout 函数
export async function logout() {
  const cookieStore = await cookies();
  
  // 1. 删除 Cookie
  cookieStore.delete('auth_token');

  // 2. ✨ 核心修复：清除所有路径的缓存
  // 这会强制浏览器下次访问时重新去服务器拉取数据
  revalidatePath('/', 'layout'); 
  revalidatePath('/config', 'layout');

  // 3. 跳转登录页
  redirect('/login');
}