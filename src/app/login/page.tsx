"use client";
import { useActionState } from "react";
import { login } from "@/lib/actions";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface LoginState { success?: boolean; error?: string; }
const initialState: LoginState = { success: false, error: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="flex w-full max-w-[900px] h-[550px] bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="hidden md:block w-1/2 relative bg-gray-100">
           <div className="absolute inset-0 bg-blue-500/10 z-10 mix-blend-overlay"></div>
           <Image src="/000.webp" alt="Login Visual" fill className="object-cover" priority />
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-12 relative">
          <div className="w-full max-w-xs space-y-12">
            <div className="text-center"><h2 className="text-3xl font-bold text-[#7C98B3] tracking-wider">登录</h2></div>
            <form action={formAction} className="space-y-10">
              <div className="space-y-2 group input-underline">
                <label className="text-sm text-gray-400 font-light pl-1">密码</label>
                <input type="password" name="password" required className="w-full py-2 bg-transparent border-b border-gray-200 text-gray-600 outline-none transition-colors placeholder-transparent focus:border-blue-300" />
              </div>
              {state?.error && <div className="text-center text-sm text-red-400 bg-red-50 py-2 rounded-lg">{state.error}</div>}
              <button type="submit" disabled={isPending} className="w-full py-3.5 rounded-xl text-white font-medium tracking-wide shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-[#A5B4FC] to-[#C4B5FD] hover:from-[#93a5fc] hover:to-[#b09dfd]">
                {isPending ? <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={20} />Loading...</div> : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}