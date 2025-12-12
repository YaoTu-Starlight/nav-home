import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ✨ 关键修改 1：强制动态渲染，禁止缓存
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  // ✨ 关键修改 2：严格的重定向
  if (!authToken || !authToken.value) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {children}
    </div>
  );
}